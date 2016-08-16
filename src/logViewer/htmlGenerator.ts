import {ActionedDetails, LogEntry, Sha1} from '../contracts';
import * as moment from 'moment';
const htmlEncode = require('htmlencode').htmlEncode;

export function generateErrorView(msg: string, error: any): string {
    return `
            <body>
                <div>${htmlEncode(msg)}</div>
                ${htmlEncode(error)}
            </body>`;
}
export function generateProgressHtmlView(progressMessage: string): string {
    return `
        <div class ="container">
            <div>${htmlEncode(progressMessage)}</div>
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
    let nextHref = canGoNext ? encodeURI('command:git.logNavigate?' + JSON.stringify(['next'])) : '#next';

    let previousLink = `<a id="previous" href="${previousHref}" class="previous ${canGoPrevious ? '' : 'not-allowed'}">previous</a>`;
    let nextLink = `<a id="next" href="${nextHref}" class="next ${canGoNext ? '' : 'not-allowed'}">next</a>`;

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
                    <div class="json entries hidden">${htmlEncode(JSON.stringify(entries))}</div>                           
                    <iframe class="hidden" src='file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/iframeContent.html'></iframe>
                </div>
            </div>
            <div id="detailsView" class="hidden">
                <div class="view">
                    <h1 id="subject">Merged Pull request from some bug fix area</h1>
                    <span class="name hint--right hint--rounded" aria-label="don.jayamanne@yahoo.com">Don Jayamanne</span> on <span class="when"></span>
                    <div class="body">This is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfaf</div>
                    <div class="notes">This is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfafThis is the body and we can have a lot of conrtents in hwerew wefae fawe fawf awfaf</div>
                    <ul class="files">
                    </ul>
                    <ul class="hidden">
                        <li class="template">
                            <label class="changes">
                                <ul class="changes">
                                    <li class="added">
                                        <span class="octicon octicon-plus"></span>
                                        <span class="count">234</span>
                                    </li>
                                    <li class="deleted">
                                        <span class="octicon octicon-dash"></span>
                                        <span class="count">343</span>
                                    </li>
                                </ul>
                                <div class="fileName">Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/iframeContent.ts</span>
                                <span class="dropdown hidden">
                                    <span>&nbsp;[Test]</span>
                                    <div class="dropdown-content">
                                        <a href="{encodeURI('command:python.runUnitTest?' + JSON.stringify([testType, testFileSuite.rawName]))}">Run this test</a>
                                        <a href="{encodeURI('command:python.runUnitTest?' + JSON.stringify([testType, testFileSuite.rawName]))}">Run this test</a>
                                    </div>
                                </span>
                            </label>                    
                        </li>
                    </ul>
                </div>
            </div>
            `;
}

export function generateHistoryHtmlView(entries: LogEntry[], canGoPrevious: boolean, canGoNext: boolean): string {
    const entriesHtml = entries.map((entry, entryIndex) => {
        return `
            <div class="log-entry list-group-item">
                <a href="#popup1" class="messageLink">${htmlEncode(entry.subject)}</a>
                <span class="message" data-entry-index="${entryIndex}">${htmlEncode(entry.subject)}</span>
                <div>
                    <span class="author">
                        <a class="hint--bottom  hint--rounded hidden" 
                            aria-label="${entry.author.email}" 
                            href="${entry.author.email}">${htmlEncode(entry.author.name)}</a>
                        <span class="details">
                            <span class="name hint--right hint--rounded"  
                                aria-label="${entry.author.email}">${htmlEncode(entry.author.name)}</span> on ${moment(entry.author.date).format('MMM Do YYYY, h:mm:ss a')}
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
                                <span class="sha short" data-entry-index="${entryIndex}" aria-label="${entry.sha1.short}">${entry.sha1.short}</span>
                            </li>
                        </ul>
                    </span>
                </div>
            </div>
        `;
    }).join('');

    return generateHistoryListContainer(entries, entriesHtml, canGoPrevious, canGoNext);
}