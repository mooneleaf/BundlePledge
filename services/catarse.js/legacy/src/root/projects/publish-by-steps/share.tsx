import m from 'mithril'
import { ProjectDetails } from '../../../@types/project-details'
import h from '../../../h'

export type ShareAttrs = {
    project: ProjectDetails
}

export type ShareState = {
    projectUrlElement: HTMLInputElement
}

export class Share implements m.Component {
    view({ attrs, state } : m.Vnode<ShareAttrs, ShareState>) {
        
        const project = attrs.project
        const projectUrl = `${window.location.origin}/${project.permalink}`
        const copyToClipboard = (copyText : HTMLInputElement) => {
            copyText.focus()
            copyText.select()
            copyText.setSelectionRange(0, 99999)
            document.execCommand('copy')
        }

        const projectUrlEncoded = encodeURIComponent(projectUrl)
        const facebookShareLink = `${projectUrl}&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share_simplified`
        const messengerShareLink = `${projectUrl}&utm_source=facebook.com&utm_medium=messenger&utm_campaign=project_share_simplified`
        const whatsappShareLink = h.isMobile() ? `whatsapp://send?text=${encodeURIComponent(`Eu adoraria se você pudesse dar uma olhada no meu projeto no Catarse. Sua ajuda significaria muito pra mim:${projectUrlEncoded}&utm_source=whatsapp&utm_medium=social&utm_campaign=project_share_simplified`)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(`Eu adoraria se você pudesse dar uma olhada no meu projeto no Catarse. Sua ajuda significaria muito pra mim: ${projectUrlEncoded}&utm_source=whatsapp&utm_medium=social&utm_campaign=project_share_simplified`)}`
        const twitterShareLink = `https://twitter.com/intent/tweet?original_referer=${projectUrlEncoded}&ref_src=twsrc%5Etfw&text=${encodeURIComponent(`Ajude meu projeto ${project.name} no @catarse`)}&tw_p=tweetbutton&url=${projectUrlEncoded}%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share_simplified&via=catarse`
        const emailShareLink = `mailto:?subject=${encodeURIComponent(`Ajude meu projeto ${project.name} no Catarse`)}&body=${encodeURIComponent(`Eu adoraria se você pudesse dar uma olhada no meu projeto no Catarse. Sua ajuda significaria muito pra mim: ${projectUrlEncoded}&utm_source=email&utm_medium=social&utm_campaign=project_share_simplified.`)}`

        const facebookShare = () => shareSocial(false, facebookShareLink)
        const messengerShare = () => shareSocial(true, messengerShareLink)
        const shareSocial = (messager : boolean, url : string) => {
            console.log(FB)
            if (FB) {
                FB.ui({
                    method: messager ? 'send' : 'share',
                    link: url,
                    href: url,
                    display: 'popup',
                });
            }
        }

        return (
            <div class="section">
                <div class="w-container">
                    <div class="w-row">
                        <div class="w-col w-col-2"></div>
                        <div class="w-col w-col-8">
                            <div class="card medium card-terciary u-marginbottom-20">
                                <div class="title-dashboard">
                                    Compartilhe sua campanha
                                    <br/>
                                </div>
                                <div class="w-row">
                                    <div class="w-col w-col-1"></div>
                                    <div class="w-col w-col-10">
                                        <div class="fontsize-small">
                                            <strong>
                                                Dica:
                                            </strong>
                                            &nbsp;Peça para 3 a 5 pessoas te ajudarem a compartilhar sua campanha. E então compartilhe em suas redes sociais.
                                        </div>
                                        <div class="divider u-margintop-20 u-marginbottom-20"></div>
                                        <div class="u-text-center u-marginbottom-30 w-row">
                                            <div class="w-col w-col-4">
                                                <a href='#share' onclick={facebookShare} class="link-hidden-dark fontsize-small w-inline-block">
                                                    <div class="fa fa-facebook-square fa-2x" aria-hidden="true"></div>
                                                    <div>Facebook</div>
                                                </a>
                                            </div>
                                            <div class="w-col w-col-4">
                                                <a href='#share' onclick={messengerShare} class="link-hidden-dark fontsize-small w-inline-block">
                                                    <div class="fab fa-2x fa-facebook-messenger" aria-hidden="true"></div>
                                                    <div>Messenger</div>
                                                </a>
                                            </div>
                                            <div class="w-col w-col-4">
                                                <a target='_blank' href={whatsappShareLink} data-action="share/whatsapp/share" class="link-hidden-dark fontsize-small w-inline-block">
                                                    <div class="fa fa-2x fa-whatsapp" aria-hidden="true"></div>
                                                    <div>Whatsapp</div>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="u-text-center w-row">
                                            <div class="w-col w-col-4">
                                                <a target='_blank' href={twitterShareLink} class="link-hidden-dark fontsize-small w-inline-block">
                                                    <div class="fa fa-2x fa-twitter" aria-hidden="true"></div>
                                                    <div>Twitter</div>
                                                </a>
                                            </div>
                                            <div class="w-col w-col-4">
                                                <a target='_blank' href={emailShareLink} class="link-hidden-dark fontsize-small w-inline-block">
                                                    <div class="far fa-2x fa-envelope" aria-hidden="true"></div>
                                                    <div>Email</div>
                                                </a>
                                            </div>
                                            <div class="w-col w-col-4"></div>
                                        </div>
                                        <div class="divider u-margintop-20 u-marginbottom-20"></div>
                                        <div class="w-form">
                                            <form id="email-form" name="email-form" data-name="Email Form">
                                                <div class="fontsize-smaller">
                                                    Link da campanha
                                                </div>
                                                <div class="w-row">
                                                    <div class="w-col w-col-8">
                                                        {/* <input type='hidden' value={projectUrl}/> */}
                                                        <input 
                                                            oncreate={vnode => state.projectUrlElement = vnode.dom as HTMLInputElement}
                                                            style='cursor: text;'
                                                            value={projectUrl} 
                                                            oninput={(event : Event) => {
                                                                event.target.value = projectUrl
                                                            }}
                                                            type="text" 
                                                            class="text-field medium positive w-input" 
                                                            id="permalink-campain-id" />
                                                    </div>
                                                    <div class="w-col w-col-4">
                                                        <span onclick={() => copyToClipboard(state.projectUrlElement)} class="btn btn-large">
                                                            Copiar
                                                        </span>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div class="w-col w-col-1"></div>
                                </div>
                            </div>
                            <a href="#share-reminder" class="fontsize-small link-hidden-dark u-right">
                                Próximo &gt;
                            </a>
                        </div>
                        <div class="w-col w-col-2"></div>
                    </div>
                </div>
            </div>
        )
    }
}