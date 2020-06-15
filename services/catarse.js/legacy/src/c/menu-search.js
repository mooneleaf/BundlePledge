import m from 'mithril';

const { $ } = window;

const menuSearch = {
    view: function () {
        return m('span#menu-search', [
            m('.w-form.w-hidden-small.w-hidden-tiny.header-search[id=\'discover-form-wrapper\']', [
                m(`form.discover-form[accept-charset=\'UTF-8\'][action=\'/${window.I18n.locale}/explore?ref=ctrse_header\'][id=\'search-form\'][method=\'get\']`, [
                    m('div', { style: { display: 'none' } }, [
                        m('input[name="utf8"][type="hidden"][value="✓"]'),
                        m('input[name="filter"][type="hidden"][value="all"]'),
                    ]),
                    m('input.w-input.text-field.prefix.search-input[autocomplete=\'off\'][id=\'pg_search\'][name=\'pg_search\'][placeholder=\'Busque projetos\'][type=\'text\']')
                ]),
                m(`.search-pre-result.w-hidden[data-searchpath=\'/${window.I18n.locale}/auto_complete_projects\']`, [
                    m('.result',
                        m('.u-text-center',
                            m('img[alt=\'Loader\'][src=\'/assets/catarse_bootstrap/loader.gif\']')
                        )
                    ),
                    m('a.btn.btn-small.btn-terciary.see-more-projects[href=\'javascript:void(0);\']', ' ver todos')
                ])
            ]),
            m('a.w-inline-block.w-hidden-small.w-hidden-tiny.btn.btn-dark.btn-attached.postfix[href=\'javascript:void(0);\'][id=\'pg_search_submit\']', { onclick: () => { $('#search-form').submit(); } },
                m('img.header-lupa[alt=\'Lupa\'][data-pin-nopin=\'true\'][src=\'/assets/catarse_bootstrap/lupa.png\']')
            )
        ]);
    }
};

export default menuSearch;
