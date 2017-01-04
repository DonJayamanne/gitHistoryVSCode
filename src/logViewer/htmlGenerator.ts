import { LogEntry } from '../contracts';
import { encode as htmlEncode } from 'he';
import { gitmojify } from '../helpers/gitmojify';

export function generateErrorView(error: any): string {
    return `
        <div class="error-box animated pulse">
            <div class="error-icon"><i class="octicon octicon-stop" aria-hidden="true"></i></div>
            <h1 class="error-title">Error</h1>
            <div class="error-details">${error}</div>
        </div>
    `;
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
    let prevHref = canGoPrevious ? encodeURI('command:git.logNavigate?' + JSON.stringify(['previous'])) : '#';
    let nextHref = canGoNext ? encodeURI('command:git.logNavigate?' + JSON.stringify(['next'])) : '#';

    return `
        <div id="log-view" class="list-group">
            <svg xmlns="http://www.w3.org/2000/svg"></svg>
            <div id="commit-history">
                ${entriesHtml}
                <div id="history-navbar">
                    <ul class="navbar">
                        <li class="navbar-item previous ${canGoPrevious || 'disabled'}">
                            <a href="${prevHref}" class="navbar-link" onClick="$('.previous').addClass('disabled');">
                                <i class="octicon octicon-chevron-left"></i>
                                <span>Previous</span>
                            </a>
                        </li>
                        <li class="navbar-item next ${canGoNext || 'disabled'}">
                            <a href="${nextHref}" class="navbar-link" onClick="$('.next').addClass('disabled');">
                                <span>Next</span>
                                <i class="octicon octicon-chevron-right"></i>
                            </a>
                        </li>
                    </ul>
                </div>
                <div class="json entries hidden">${htmlEncode(JSON.stringify(entries))}</div>
            </div>
        </div>

        <div id="details-view" class="hidden">
            <a class="close-btn"><i class="octicon octicon-x"></i></a>
            <h1 class="commit-subject">Merged Pull request from some bug fix area</h1>
            <div class="commit-author">
                <span class="name hint--right hint--rounded hint--bounce" aria-label="don.jayamanne@yahoo.com" title="don.jayamanne@yahoo.com">Don Jayamanne</span>
                <span class="timestamp">on Feb 22th 2016, 12:21:43 am</span>
            </div>
            <div class="commit-body">This is the body and we can have a lot of content in here</div>
            <div class="commit-notes">These are the notes and we can have a lot of content in here</div>
            <ul class="committed-files">
                <div class="diff-row">
                    <span class="diff-stats hint--right hint--rounded hint--bounce" aria-label="2 additions & 1 deletion">
                        <span class="diff-count">3</span>
                        <span class="diff-block"></span>
                        <span class="diff-block"></span>
                        <span class="diff-block"></span>
                        <span class="diff-block"></span>
                        <span class="diff-block"></span>
                    </span>
                    <div class="file-name-cnt">
                        <span class="file-name">resources/iframeContent.ts</span>
                        <a class="file-name">resources/iframeContent.ts</a>
                    </div>
                    <div class="dropdown hidden">
                        <span>&nbsp;[Test]</span>
                        <div class="dropdown-content">
                            <a href="{encodeURI('command:python.runUnitTest?' + JSON.stringify([testType, testFileSuite.rawName]))}">Run this test</a>
                            <a href="{encodeURI('command:python.runUnitTest?' + JSON.stringify([testType, testFileSuite.rawName]))}">Run this test</a>
                        </div>
                    </div>
                </div>
            </ul>
        </div>
    `;
}

export function generateHistoryHtmlView(entries: LogEntry[], canGoPrevious: boolean, canGoNext: boolean): string {
    const entriesHtml = entries.map((entry, entryIndex) => {
        const subject = gitmojify(entry.subject);
        return `
            <div class="log-entry">
                <div class="media right">
                    <div class="media-image">
                        <div class="commit-hash-container">
                            <div class="copy-button">
                                <span class="btn clipboard hint--bottom hint--rounded hint--bounce"
                                    data-clipboard-text="${entry.sha1.full}"
                                    aria-label="Copy the full SHA">
                                    <i class="octicon octicon-clippy"></i>
                                    <a class="clipboard-link" href="${encodeURI('command:git.copyText?' + JSON.stringify([entry.sha1.full]))}"></a>
                                </span>
                            </div>
                            <div class="commit-hash">
                                <span class="sha-code short" data-entry-index="${entryIndex}" aria-label="${entry.sha1.short}">${entry.sha1.short}</span>
                            </div>
                        </div>
                    </div>
                    <div class="media-content">
                        <a class="commit-subject-link">${htmlEncode(subject)}</a>
                        <div class="commit-subject" data-entry-index="${entryIndex}">${htmlEncode(subject)}</div>
                        <div class="commit-author">
                            <span class="name hint--right hint--rounded hint--bounce" aria-label="${entry.author.email}">${htmlEncode(entry.author.name)}</span>
                            <span class="timestamp">on ${entry.author.localisedDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return generateHistoryListContainer(entries, entriesHtml, canGoPrevious, canGoNext);
}