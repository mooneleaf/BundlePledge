import m from 'mithril';
import prop from 'mithril/stream';
import _ from 'underscore';
import userVM from '../vms/user-vm';
import h from '../h';
import models from '../models';
import { catarse } from '../api';

const I18nScope = _.partial(h.i18nScope, 'shared.menus');

const menuProfile = {
    oninit: function(vnode) {
        const contributedProjects = prop(),
            latestProjects = prop([]),
            userDetails = prop({}),
            user_id = vnode.attrs.user.user_id,
            userBalance = prop(0),
            userIdVM = catarse.filtersVM({ user_id: 'eq' });

        const userName = () => {
            const name = userVM.displayName(userDetails());
            if (name && !_.isEmpty(name)) {
                return _.first(name.split(' '));
            }

            return '';
        };

        userVM.fetchUser(user_id, true, userDetails);

        userIdVM.user_id(user_id);
        models.balance.getRowWithToken(userIdVM.parameters()).then((result) => {
            const data = _.first(result) || { amount: 0, user_id };
            userBalance(data.amount);
        });

        vnode.state = {
            contributedProjects,
            latestProjects,
            userDetails,
            userName,
            toggleMenu: h.toggleProp(false, true),
            userBalance
        };
    },
    view: function({state, attrs}) {
        const user = state.userDetails();

        return m('.w-dropdown.user-profile',
            [
                m('.w-dropdown-toggle.dropdown-toggle.w-clearfix[id=\'user-menu\']',
                    {
                        onclick: state.toggleMenu.toggle
                    },
                    [
                        m('.user-name-menu', [
                            m('.fontsize-smaller.lineheight-tightest.text-align-right', state.userName()),
                            (state.userBalance() > 0 ? m('.fontsize-smallest.fontweight-semibold.text-success', `R$ ${h.formatNumber(state.userBalance(), 2, 3)}`) : '')

                        ]),
                        m(`img.user-avatar[alt='Thumbnail - ${user.name}'][height='40'][src='${h.useAvatarOrDefault(user.profile_img_thumbnail)}'][width='40']`)
                    ]
                ),
                state.toggleMenu() ? m('nav.w-dropdown-list.dropdown-list.user-menu.w--open[id=\'user-menu-dropdown\']', { style: 'display:block;' },
                    [
                        m('.w-row',
                            [
                                m('.w-col.w-col-12',
                                    [
                                        m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10',
                                            I18n.t('user.contributions_history', I18nScope())
                                        ),
                                        m('ul.w-list-unstyled.u-marginbottom-20',
                                            [
                                                m('li.lineheight-looser',
                                                  m(`a.alt-link.fontsize-smaller[href='/${window.I18n.locale}/users/${user.id}/edit#balance']`,
                                                    m('span', [
                                                        I18n.t('user.total', I18nScope()),
                                                        (state.userBalance() > 0 ? m('span.fontcolor-secondary',
                                                          `R$ ${h.formatNumber(state.userBalance(), 2, 3)}`) : ''),
                                                    ])
                                                   )
                                                 ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/${window.I18n.locale}/users/${user.id}/edit#contributions']`,
                                                        I18n.t('user.contributions_history_nav', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                  m(`a.alt-link.fontsize-smaller[href='/${window.I18n.locale}/users/${user.id}/edit#projects']`,
                                                    I18n.t('user.projects_created', I18nScope()),
                                                   )
                                                 )
                                            ]
                                        ),
                                        m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10',
                                            I18n.t('user.settings', I18nScope()),
                                        ),
                                        m('ul.w-list-unstyled.u-marginbottom-20',
                                            [
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/${window.I18n.locale}/users/${user.id}/edit#about_me']`,
                                                        I18n.t('user.about', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/${window.I18n.locale}/users/${user.id}/edit#notifications']`,
                                                        I18n.t('user.notifications', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href='/${window.I18n.locale}/users/${user.id}/edit#settings']`,
                                                        I18n.t('user.access_address', I18nScope())
                                                    )
                                                )
                                            ]
                                        ),
                                        m('.divider.u-marginbottom-20'),
                                        attrs.user.is_admin_role ? m('.fontweight-semibold.fontsize-smaller.u-marginbottom-10',
                                            'Admin'
                                        ) : '',
                                        attrs.user.is_admin_role ? m('ul.w-list-unstyled.u-marginbottom-20',
                                            [
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin#/home-banners\']`,
                                                        I18n.t('admin.banners', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin#/users\']`,
                                                        I18n.t('admin.users', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin\']`,
                                                        I18n.t('admin.support', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                  m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin#/balance-transfers\']`,
                                                      I18n.t('admin.withdrawals', I18nScope())
                                                   )
                                                 ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/admin/financials\']`,
                                                        I18n.t('admin.financial_reports', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin#/projects\']`,
                                                        I18n.t('admin.admin_projects', I18nScope())
                                                    )
                                                ),
                                                m('li.lineheight-looser',
                                                  m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin#/subscriptions\']`,
                                                      I18n.t('admin.admin_subscriptions', I18nScope())
                                                   )
                                                 ),
                                                m('li.lineheight-looser',
                                                  m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/new-admin#/notifications\']`,
                                                      I18n.t('admin.admin_notifications', I18nScope())
                                                   )
                                                ),
                                                m('li.lineheight-looser',
                                                    m(`a.alt-link.fontsize-smaller[href=\'/${window.I18n.locale}/dbhero\']`,
                                                        'Dataclips'
                                                    )
                                                )
                                            ]
                                        ) : '',
                                        m('.fontsize-mini', 'Seu e-mail de cadastro é: '),
                                        m('.fontsize-smallest.u-marginbottom-20', [
                                            m('span.fontweight-semibold', `${user.email} `),
                                            m(`a.alt-link[href='/${window.I18n.locale}/users/${user.id}/edit#about_me']`, 'alterar e-mail')
                                        ]),
                                        m('.divider.u-marginbottom-20'),
                                        m(`a.alt-link[href=\'/${window.I18n.locale}/logout\']`,
                                            'Sair'
                                        )
                                    ]
                                ),
                            ]
                        )
                    ]
                ) : ''
            ]
        );
    }
};

export default menuProfile;
