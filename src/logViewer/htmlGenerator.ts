import {ActionedDetails, LogEntry, Sha1} from '../contracts';
import * as moment from 'moment';

export var crap = '';
export function generateErrorView(msg: string, error: any): string {
    return `
            <body>
                <div>${msg}</div>
                ${error}
            </body>`;
}
export function generateProgressHtmlView(progressMessage: string): string {
    return `
        <div class ="container">
            <div>${progressMessage}</div>
            <div class="spinner">
                <div class="rect1"></div>
                <div class="rect2"></div>
                <div class="rect3"></div>
                <div class="rect4"></div>
                <div class="rect5"></div>
            </div>
        </div>
        `;
}

function generateHistoryListContainer(entries: LogEntry[], entriesHtml: string, canGoPrevious: boolean, canGoNext: boolean): string {
    let previousHref = canGoPrevious ? encodeURI('command:git.logNavigate?' + JSON.stringify(['previous'])) : '#previous';
    let nextHref = canGoPrevious ? encodeURI('command:git.logNavigate?' + JSON.stringify(['next'])) : '#next';

    let previousLink = `<a href="${previousHref}" class="previous ${canGoPrevious ? '' : 'not-allowed'}">previous</a>`;
    let nextLink = `<a id="next" href="${nextHref}" class="next ${canGoPrevious ? '' : 'not-allowed'}">next</a>`;

    return `
            <div id="log-view" class="list-group">
                <svg xmlns="http://www.w3.org/2000/svg"></svg>
                <div>
                    ${entriesHtml}
                    <div class="navigation">
                        <ul>
                            <li class="previous">
                                <span class="octicon octicon-chevron-left"></span>
                                <span>Previous</span>
                            </li>
                            <li class="next">
                                <span>Next</span>
                                <span class="octicon octicon-chevron-right"></span>
                            </li>
                        </ul>
                        ${previousLink}
                        ${nextLink}
                    </div>             
                    <div class="json entries hidden">${JSON.stringify(entries)}</div>                           
                    <iframe class="hidden" src='file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/iframeContent.html'></iframe>
                </div>
            </div>
            `;
}

export function generateHistoryHtmlView(entries: LogEntry[], canGoPrevious: boolean, canGoNext: boolean): string {
    const entriesHtml = entries.map(entry => {
        return `
            <div class="log-entry list-group-item">
                <a href="#1234" class="messageLink">${entry.subject}</a>
                <span class="message">${entry.subject}</span>
                <div>
                    <span class="author">
                        <a class="hint--bottom  hint--rounded hidden" 
                            aria-label="${entry.author.email}" 
                            href="${entry.author.email}">${entry.author.name}</a>
                        <span>
                            <span class="name hint--right hint--rounded"  
                                aria-label="${entry.author.email}">${entry.author.name}</span> on ${moment(entry.author.date).format('MMM Do YYYY, h:mm:ss a')}
                        </span>
                    </span>
                    <span class="hash">
                        <ul class="hash">
                            <li>
                                <span class="btn clipboard hint--bottom  hint--rounded" 
                                    data-clipboard-text="${entry.sha1.full}" 
                                    aria-label="Copy the full SHA">
                                    <span class="clipboard octicon octicon-clippy"></span>
                                    <a class="btn clipboardLink" href="${encodeURI('command:git.copyText?' + JSON.stringify([entry.sha1.full]))}">x</a>
                                </span>
                            </li>
                            <li>
                                <span class="sha short" aria-label="${entry.sha1.short}">${entry.sha1.short}</span>
                            </li>
                        </ul>
                    </span>
                </div>
            </div>
        `;

        // return `
        //         <div class="log-entry list-group-item">
        //             <header>
        //                 <h6>
        //                     <span>${entry.author.name}</span>
        //                     <a style="display:none" target="_blank" href="mailto:${entry.author.email}">${entry.author.name}</a>
        //                 </h6>
        //                 <span class="log-entry-date">${entry.author.date.toLocaleString()}</span>
        //                 <span class="badge">${entry.sha1.short}</span>
        //             </header>
        //             <p class="list-group-item-text">${entry.subject}</p>
        //         </div>`;
    }).join('');

    return generateHistoryListContainer(entries, entriesHtml, canGoPrevious, canGoNext);
}