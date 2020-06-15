import m from 'mithril';
import h from '../h';
import _ from "underscore";

const I18nScope = _.partial(h.i18nScope, 'layouts.footer');

const footer = {
    view: function() {
        return m('footer.main-footer.main-footer-neg',
            [
                m('section.w-container',
                    m('.w-row',
                        [
                            m('.w-col.w-col-9',
                                m('.w-row',
                                    [
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.w-hidden-tiny',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    I18n.t('titles.contact', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'http://crowdfunding.catarse.me/quem-somos?ref=ctrse_footer\']',
                                                    I18n.t('links.what_we_do', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'http://crowdfunding.catarse.me/paratodos?ref=ctrse_footer\']',
                                                    I18n.t('links.how_it_works', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'http://blog.catarse.me\']',
                                                    I18n.t('links.blog', I18nScope())
                                                ),
                                                m(`a.link-footer[href=\'${window.I18n.locale}/team?ref=ctrse_footer\']`,
                                                    [
                                                        I18n.t('links.team', I18nScope()),
                                                        ' ',
                                                        m.trust('&lt;'),
                                                        '3'
                                                    ]
                                                ),
                                                m(`a.u-marginbottom-30.link-footer[href=\'${window.I18n.locale}/press?ref=ctrse_footer\']`,
                                                    I18n.t('links.press', I18nScope())
                                                ),
                                                m('.footer-full-signature-text.fontsize-small',
                                                    I18n.t('titles.social', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'http://facebook.com/catarse.me\']',
                                                    [
                                                        m('span.fa.fa-facebook-square.fa-lg'),
                                                        m.trust('&nbsp;&nbsp;'),
                                                        I18n.t('links.facebook', I18nScope())
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'http://twitter.com/catarse\']',
                                                    [
                                                        m('span.fa.fa-twitter-square.fa-lg'),
                                                        m.trust('&nbsp;&nbsp;'),
                                                        I18n.t('links.twitter', I18nScope())
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'http://instagram.com/catarse\']',
                                                    [
                                                        m('span.fa.fa-instagram.fa-lg'),
                                                        m.trust('&nbsp;&nbsp;'),
                                                        I18n.t('links.instagram', I18nScope())
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'http://github.com/catarse/catarse\']',
                                                    [
                                                        m('span.fa.fa-github-square.fa-lg'),
                                                        m.trust('&nbsp;&nbsp;'),
                                                        I18n.t('links.github', I18nScope())
                                                    ]
                                                )
                                            ]
                                        ),
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-firstcolumn',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    I18n.t('links.faq', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'http://suporte.catarse.me?ref=ctrse_footer/\']',
                                                    I18n.t('links.help_support', I18nScope())
                                                ),
                                                h.getUser() ?
                                                    m('a.link-footer[href=\'https://suporte.catarse.me/hc/pt-br/signin?return_to=https%3A%2F%2Fsuporte.catarse.me%2Fhc%2Fpt-br%2Frequests%2Fnew&locale=19\'][target="_BLANK"]',
                                                        I18n.t('links.contact', I18nScope())
                                                     )
                                                    :
                                                    m('a.link-footer[href=\'http://suporte.catarse.me/hc/pt-br/requests/new\'][target="_BLANK"]',
                                                        I18n.t('links.contact', I18nScope())
                                                     ),
                                                m('a.link-footer[href=\'http://blog.catarse.me/category/atualizacoes\']',
                                                  ' Atualizações 🌟'
                                                 ),
                                                m('a.link-footer[href=\'https://www.ofinanciamentocoletivo.com.br/?ref=ctrse_footer\']',
                                                  ' Escola Catarse'
                                                 ),
                                                m('a.link-footer[href=\'http://crowdfunding.catarse.me/nossa-taxa?ref=ctrse_footer\']',
                                                  ' Nossa Taxa'
                                                 ),
                                                m('a.link-footer[href=\'http://pesquisa.catarse.me/\']',
                                                  ' Retrato FC Brasil 2013/2014'
                                                 ),
                                                m('a.link-footer[href=\'http://suporte.catarse.me/hc/pt-br/articles/115002214043-Responsabilidades-e-Seguran%C3%A7a?ref=ctrse_footer\']',
                                                  ' Responsabilidades e Segurança'
                                                 ),
                                                m('a.link-footer[href=\'https://crowdfunding.catarse.me/legal/termos-de-uso\'][target="_BLANK"]',
                                                  ' Termos de uso'
                                                 ),
                                                m('a.link-footer[href=\'https://crowdfunding.catarse.me/legal/politica-de-privacidade\'][target="_BLANK"]',
                                                  ' Política de privacidade'
                                                 )
                                            ]
                                        ),
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-lastcolumn',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    'Faça uma campanha'
                                                ),
                                                m(`a.link-footer[href=\'/${window.I18n.locale}/start?ref=ctrse_footer\']`,
                                                    ' Comece seu projeto'
                                                ),
                                                m('a.link-footer[href=\'http://crowdfunding.catarse.me/financiamento-coletivo-musica-independente?ref=ctrse_footer\']',
                                                    ' Música no Catarse'
                                                ),
                                                m('a.link-footer[href=\'https://crowdfunding.catarse.me/publicacoes-independentes-financiamento-coletivo?ref=ctrse_footer\']',
                                                    ' Publicações Independentes'
                                                ),
                                                m('a.link-footer[href=\'https://crowdfunding.catarse.me/jornalismo?ref=ctrse_footer\']',
                                                    ' Jornalismo'
                                                ),                                            
                                                m('a.u-marginbottom-30.link-footer[href=\'https://crowdfunding.catarse.me/assinaturas?ref=ctrse_footer\']',
                                                    'Catarse Assinaturas'
                                                 ),
                                                m('.footer-full-signature-text.fontsize-small',
                                                    'Apoie projetos no Catarse'
                                                ),
                                                m(`a.link-footer[href=\'/${window.I18n.locale}/explore?ref=ctrse_footer\']`,
                                                    ' Explore projetos'
                                                ),
                                                m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'http://blog.catarse.me?ref=ctrse_footer\']',
                                                    ' Blog'
                                                ),
                                                m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'http://suporte.catarse.me/hc/pt-br/requests/new\']',
                                                    ' Contato'
                                                ),
                                                m(`a.w-hidden-tiny.link-footer[href=\'/${window.I18n.locale}/explore?filter=score&ref=ctrse_footer\']`,
                                                    ' Populares'
                                                ),
                                                m(`a.w-hidden-tiny.link-footer[href=\'/${window.I18n.locale}/explore?filter=online&ref=ctrse_footer\']`,
                                                    ' No ar'
                                                ),
                                                m(`a.w-hidden-tiny.link-footer[href=\'/${window.I18n.locale}/explore?filter=finished&ref=ctrse_footer\']`,
                                                    ' Finalizados'
                                                ),
                                                m(`a.w-hidden-tiny.link-footer[href=\'/${window.I18n.locale}/explore?filter=sub&ref=ctrse_footer\']`,
                                                    ' Assinaturas'
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ),
                            m('.w-col.w-col-3.column-social-media-footer',
                                [
                                    m('.footer-full-signature-text.fontsize-small',
                                        'Assine nossa news'
                                    ),
                                    m('.w-form',
                                        m(`form[accept-charset='UTF-8'][action='${h.getNewsletterUrl()}'][id='mailee-form'][method='post']`,
                                            [
                                                m('.w-form.footer-newsletter',
                                                    m('input.w-input.text-field.prefix[id=\'EMAIL\'][label=\'email\'][name=\'EMAIL\'][placeholder=\'Digite seu email\'][type=\'email\']')
                                                ),
                                                m('button.w-inline-block.btn.btn-edit.postfix.btn-attached[style="padding:0;"]',
                                                    m('img.footer-news-icon[alt=\'Icon newsletter\'][src=\'/assets/catarse_bootstrap/icon-newsletter.png\']')
                                                )
                                            ]
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                m('.w-container',
                    m('.footer-full-copyleft',
                        [
                            m('img.u-marginbottom-20[alt=\'Logo footer\'][src=\'/assets/logo-footer.png\']'),
                            m('.lineheight-loose',
                                m('a.link-footer-inline[href=\'http://github.com/catarse/catarse\']',
                                   ` Feito com amor | ${new Date().getFullYear()} | Open source`
                                )
                            )
                        ]
                    )
                )
            ]
        );
    }
};

export default footer;
