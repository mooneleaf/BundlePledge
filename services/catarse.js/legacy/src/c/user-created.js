import m from 'mithril';
import prop from 'mithril/stream';
import models from '../models';
import { catarse } from '../api';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import inlineError from './inline-error';
import loadMoreBtn from './load-more-btn';
import projectCard from './project-card';

const userCreated = {
    oninit: function(vnode) {
        const user_id = vnode.attrs.userId,
            showDraft = vnode.attrs.showDraft || false,
            error = prop(false),
            pages = catarse.paginationVM(models.project),
            loader = prop(true),
            contextVM = catarse.filtersVM({
                project_user_id: 'eq',
                state: 'in'
            });

        const states = ['online', 'waiting_funds', 'successful', 'failed'];
        if (showDraft) {
            states.push('draft');
        }
        contextVM.state(states).project_user_id(user_id).order({
            updated_at: 'desc'
        });

        models.project.pageSize(9);
        pages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch((err) => {
            error(true);
            loader(false);
            m.redraw();
        });

        return {
            projects: pages,
            loader,
            error
        };
    },
    view: function({state, attrs}) {
        const projects_collection = ctrl.projects.collection();

        return m('.content[id=\'created-tab\']',
            (ctrl.error() ? m(inlineError, {
                message: 'Erro ao carregar os projetos.'
            }) : !ctrl.loader() ? [
                (!_.isEmpty(projects_collection) ? _.map(projects_collection, project => m(projectCard, {
                    project,
                    ref: 'user_contributed',
                    showFriends: false
                })) :
                    m('.w-container',
                        m('.u-margintop-30.u-text-center.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6', [
                                m('.fontsize-large.u-marginbottom-30',
                                    'O que você está esperando para tirar seu projeto do papel aqui no Catarse?'),
                                m('.w-row', [
                                    m('.w-col.w-col-3'),
                                    m('.w-col.w-col-6',
                                        m('a.btn.btn-large[href=\'/start\']',
                                            'Comece agora!'
                                        )
                                    ),
                                    m('.w-col.w-col-3')
                                ])
                            ]),
                            m('.w-col.w-col-3')
                        ])
                    )
                ),

                (!_.isEmpty(projects_collection) ?
                    m('.w-row.u-marginbottom-40.u-margintop-30', [
                        m(loadMoreBtn, {
                            collection: ctrl.projects,
                            cssClass: '.w-col-push-5'
                        })
                    ]) : '')
            ] : h.loader())
        );
    }
};

export default userCreated;
