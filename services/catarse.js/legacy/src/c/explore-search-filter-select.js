import m from 'mithril';
import h from '../h';

export const ExploreSearchFilterSelect = {
    oninit(vnode) {

        const openSearchControl = h.RedrawToggleStream(false, true);

        vnode.state = {
            openSearchControl
        };
    },

    view({ state, attrs }) {

        const onSearch = attrs.onSearch;
        const onSelect = attrs.onSelect;
        const isLoading = attrs.isLoading;
        const itemToString = attrs.itemToString;
        const mobileLabel = attrs.mobileLabel;
        const hasItemSelected = attrs.selectedItem() !== null;
        const noneSelected = attrs.noneSelected;
        const selectedItem = hasItemSelected ? itemToString(attrs.selectedItem()) : noneSelected;
        const foundItems = attrs.foundItems() || [];
        const openSearchControl = state.openSearchControl;        
        const onToggleSearchBox = (/** @type {Event} */ event) => {
            event.stopPropagation();
            openSearchControl.toggle();
            if (openSearchControl()) {
                onSearch('');
            }
        };

        return m('div.explore-filter-wrapper', [
            m('div.explore-span-filter', {
                onclick: onToggleSearchBox
            }, [
                m('div.explore-span-filter-name', [
                    m('div.explore-mobile-label', mobileLabel),
                    m('div.inline-block', selectedItem)
                ]),
                m(`.inline-block${ hasItemSelected ? '.far.fa-times' : '.fa.fa-angle-down'}[aria-hidden="true"]`, {
                    onclick: (/** @type {Event} */ event) => {
                        if (hasItemSelected) {
                            onSelect(null);
                            event.stopPropagation();
                            openSearchControl(false);
                        } else {
                            onToggleSearchBox(event);
                        }
                    }
                })
            ]),
            (
                openSearchControl() &&
                (
                    m('div.explore-filter-select.big.w-clearfix', { 'style': { 'display': 'block' } }, [
                        m('a.modal-close.fa.fa-close.fa-lg.w-hidden-main.w-hidden-medium.w-inline-block[href="#"]', {
                            onclick: onToggleSearchBox
                        }),
                        m('div.w-form', [
                            m('form.position-relative', [
                                m('a.btn-search.w-inline-block[href="#"]',
                                    m('img.header-lupa[src="https://uploads-ssl.webflow.com/57ba58b4846cc19e60acdd5b/57ba58b4846cc19e60acdda7_lupa.png"][alt=""]')
                                ),
                                m('input.text-field.positive.city-search.w-input[type="text"][autofocus][maxlength="256"][placeholder="Pesquise por cidade ou estado"]', {
                                    oninput: (/** @type {Event} */ event) => onSearch(event.target.value),
                                    onkeyup: (/** @type {Event} */ event) => onSearch(event.target.value),
                                }),
                                m('div.table-outer.search-cities-pre-result', [
                                    (
                                        isLoading() ?
                                            h.loader()
                                            :
                                            (
                                                foundItems.length === 0 ?
                                                    (
                                                        m('div.table-row.fontsize-smallest.fontcolor-secondary',
                                                            m('a.fontsize-smallest.link-hidden-light[href="#"]', {
                                                                onclick: (/** @type {Event} */ event) => {
                                                                    event.preventDefault();
                                                                    onSelect(null);
                                                                    onToggleSearchBox(event);
                                                                }
                                                            }, noneSelected)
                                                        )
                                                    )
                                                    :
                                                    (
                                                        foundItems.map(item => {
                                                            return m('div.table-row.fontsize-smallest.fontcolor-secondary',
                                                                m('a.fontsize-smallest.link-hidden-light[href="#"]', {
                                                                    onclick: (/** @type {Event} */ event) => {
                                                                        event.preventDefault();
                                                                        onSelect(item);
                                                                        onToggleSearchBox(event);
                                                                    }
                                                                }, itemToString(item))
                                                            );
                                                        })
                                                    )
                                            )
                                    )
                                ])
                            ]),
                        ])
                    ])
                )
            )
        ]);
    }
};
