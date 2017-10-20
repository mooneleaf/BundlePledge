-- This file should undo anything in `up.sql`
CREATE OR REPLACE FUNCTION payment_service_api.create_payment(data json)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _result json;
            _payment payment_service.catalog_payments;
            _user_id bigint;
            _user community_service.users;
            _version payment_service.catalog_payment_versions;
            _credit_card payment_service.credit_cards;
            _subscription payment_service.subscriptions;
            _refined jsonb;
        begin
            -- ensure that roles come from any permitted
            perform core.force_any_of_roles('{platform_user, scoped_user}');

            -- check roles to define how user_id is set
            if current_role = 'platform_user' then
                _user_id := ($1 ->> 'user_id')::bigint;
            else
                _user_id := core.current_user_id();
            end if;

            -- check if project exists on platform
            if ($1->>'project_id')::bigint is null 
                OR not core.project_exists_on_platform(($1->>'project_id')::bigint, core.current_platform_id()) then
                raise exception 'project not found on platform';
            end if;

            -- set user into variable
            select * 
            from community_service.users 
            where id = _user_id
                and platform_id = core.current_platform_id()
            into _user;

            -- check if user exists on current platform
            if _user.id is null then
                raise exception 'missing user';
            end if;

            -- fill ip address to received params
            _refined := jsonb_set(($1)::jsonb, '{current_ip}'::text[], to_jsonb(core.force_ip_address()::text));

            -- if user already has filled document_number/name/email should use then
            if not core_validator.is_empty((_user.data->>'name')::text) then
                _refined := jsonb_set(_refined, '{customer,name}', to_jsonb(_user.data->>'name'::text));
            end if;

            if not core_validator.is_empty((_user.data->>'email')::text) then
                _refined := jsonb_set(_refined, '{customer,email}', to_jsonb(_user.data->>'email'::text));
            end if;

            if not core_validator.is_empty((_user.data->>'email')::text) then
                _refined := jsonb_set(_refined, '{customer,document_number}', to_jsonb(_user.data->>'document_number'::text));
            end if;

            -- generate a base structure to payment json
            _refined := (payment_service.check_and_generate_payment_data((_refined)::json))::jsonb;

            -- if payment_method is credit_card should check for card_hash or card_id
            if _refined->>'payment_method'::text = 'credit_card' then

                -- fill with is_international
                _refined := jsonb_set(_refined, '{is_international}'::text[], to_jsonb((coalesce($1->>'is_international')::text, 'false')::text));

                -- fill with save_card
                _refined := jsonb_set(_refined, '{save_card}'::text[], to_jsonb(coalesce(($1->>'save_card')::text, 'false')));

                -- check if card_hash or card_id is present
                if core_validator.is_empty((($1)->>'card_hash')::text) 
                    and core_validator.is_empty((($1)->>'card_id')::text) then
                    raise 'missing card_hash or card_id';
                end if;

                -- if has card_id check if user is card owner
                if not core_validator.is_empty((($1)->>'card_id')::text) then
                    select cc.* from payment_service.credit_cards cc 
                    where cc.user_id = _user_id and cc.id = (($1)->>'card_id')::bigint
                    into _credit_card;

                    if _credit_card.id is null then
                        raise 'invalid card_id';
                    end if;

                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb(_credit_card.id::text));
                    
                elsif not core_validator.is_empty((($1)->>'card_hash')::text) then
                    _refined := jsonb_set(_refined, '{card_hash}'::text[], to_jsonb($1->>'card_hash'::text));
                end if;

            end if;

            -- insert payment in table
            insert into payment_service.catalog_payments (
                platform_id, project_id, user_id, data, gateway
            ) values (
                core.current_platform_id(),
                ($1->>'project_id')::bigint,
                _user_id,
                _refined,
                coalesce(($1->>'gateway')::text, 'pagarme')
            ) returning * into _payment;
            
            -- insert first payment version
            insert into payment_service.catalog_payment_versions (
                catalog_payment_id, data
            ) values ( _payment.id, _payment.data )
            returning * into _version;

            -- check if payment is a subscription to create one
            if ($1->>'subscription')::boolean then
                insert into payment_service.subscriptions (
                    platform_id, project_id, user_id
                ) values (_payment.platform_id, _payment.project_id, _payment.user_id)
                returning * into _subscription;

                update payment_service.catalog_payments
                    set subscription_id = _subscription.id
                    where id = _payment.id;
            end if;

            -- build result json with payment_id and subscription_id
            select json_build_object(
                'id', _payment.id,
                'subscription_id', _subscription.id,
                'old_version_id', _version.id,
                'data', _payment.data::json
            ) into _result;

            -- notify to backend processor via listen
            PERFORM pg_notify('process_payments_channel',
                json_build_object(
                    'id', _payment.id,
                    'subscription_id', _payment.subscription_id,
                    'created_at', _payment.created_at::timestamp
                )::text
            );

            return _result;
        end;
    $function$
;
CREATE OR REPLACE FUNCTION payment_service.subscriptions_charge(time_interval interval DEFAULT '1 mon'::interval)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
        declare
            _result json;
            _subscription payment_service.subscriptions;
            _last_paid_payment payment_service.catalog_payments;
            _new_payment payment_service.catalog_payments;
            _refined jsonb;
            _affected_subscriptions_ids bigint[];
            _total_affected integer;
        begin
            _total_affected := 0;
            -- get all subscriptions that not have any pending payment and last paid payment is over interval
            for _subscription IN (select s.*
                from payment_service.subscriptions s
                left join lateral (
                    -- get last paid payment after interval
                    select
                        cp.*
                    from payment_service.catalog_payments cp
                    where (payment_service.paid_transition_at(cp) + $1::interval) <= now()
                        and cp.subscription_id = s.id
                        and cp.status = 'paid'
                    order by id desc limit 1
                ) as last_paid_payment on true
                left join lateral (
                    -- get last paymnent (sometimes we can have a pending, refused... after a paid)
                    -- and ensure that payment is greater or same that is paid
                    select 
                        cp.*
                    from payment_service.catalog_payments cp
                        where cp.subscription_id = s.id
                            and id >= last_paid_payment.id
                            and status in ('refused', 'paid')
                    order by id desc  limit 1
                ) as last_payment on true
                where last_paid_payment.id is not null
                    and last_payment.id is not null
                    -- check only for subscriptions that in paid
                    and s.status in ('active'))
            loop
                select * from payment_service.catalog_payments
                    where subscription_id = _subscription.id
                        and status = 'paid'
                    order by id desc limit 1
                    into _last_paid_payment;
                
                -- check if last paid payment is boleto or credit card
                _total_affected := _total_affected + 1;
                _affected_subscriptions_ids := array_append(_affected_subscriptions_ids, _subscription.id);
                
                _refined := _last_paid_payment.data;
    
                -- check if last payment method is credit card
                if (_refined ->> 'payment_method')::text = 'credit_card' then
                    -- replace card_id with last gateway general data card_id
                    _refined := jsonb_set(_refined, '{card_id}'::text[], to_jsonb((_last_paid_payment.gateway_general_data->>'card_id')::text));
                    _refined := _refined - 'card_hash';
                end if;
                
                insert into payment_service.catalog_payments(gateway, platform_id, project_id, user_id, subscription_id, data)
                    values (_last_paid_payment.gateway, _subscription.platform_id, _subscription.project_id, _subscription.user_id, _subscription.id, _refined)
                    returning * into _new_payment;
                    
                perform pg_notify('process_payments_channel', 
                    json_build_object('id', _new_payment.id, 'subscription_id', _subscription.id)::text);
            end loop;
            
            _result := json_build_object(
                'total_affected', _total_affected,
                'affected_ids', _affected_subscriptions_ids
            );
            
            return _result;
        end;
    $function$
;