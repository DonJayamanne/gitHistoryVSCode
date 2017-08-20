import { LogEntry } from '../contracts';
import { encode as htmlEncode } from 'he';

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
            <a class="action-btn close-btn"><i class="octicon octicon-x"></i></a>
            <a class="action-btn resize-btn"><i class="octicon octicon-chevron-up"></i></a>
            <a class="action-btn resume-btn"><i class="octicon octicon-chevron-down"></i></a>
            <h1 class="commit-subject">Merged Pull request from some bug fix area</h1>
            <div class="commit-author">
                <span class="name hint--right hint--rounded hint--bounce" aria-label="don.jayamanne@yahoo.com">Don Jayamanne</span>
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

export function generateHeadRefHtmlView(entry: LogEntry): string {
    if (entry.headRef)
        return `
            <div class="media-image">
                <div class="commit-head-container">
                    <div class="refs">
                        <span>${htmlEncode(entry.headRef)}</span>
                    </div>
                </div>
            </div>`;
    return ``;
}

export function generateRemoteRefHtmlView(entry: LogEntry): string {
    if (entry.remoteRefs && entry.remoteRefs.length > 0) {
        return entry.remoteRefs.map((ref, index) => {
            return `
                <div class="media-image">
                    <div class="commit-remote-container">
                        <div class="refs">
                            <span>${htmlEncode(ref)}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }
    return ``;
}

export function generateHistoryHtmlView(entries: LogEntry[], canGoPrevious: boolean, canGoNext: boolean, skipGraph: boolean = false): string {
    const entriesHtml = entries.map((entry, entryIndex) => {
        return `
            <div class="log-entry">
                <div class="media right">
                    <div class="media-image">
                        <div class="commit-hash-container">
                            <div class="copy-button">
                                <span class="btnx clipboard hint--bottom hint--rounded hint--bounce"
                                    data-clipboard-text="${entry.hash.full}"
                                    aria-label="Copy the full Hash">
                                    <i class="octicon octicon-clippy"></i>
                                </span>
                            </div>
                            <div class="cherry-pick-button">
                                <span class="btnx hint--bottom hint--rounded hint--bounce" aria-label="Cherry pick into branch"><span aria-label="Cherry pick into branch">
                                    <a href="${encodeURI('command:git.cherry-pick-into?' + JSON.stringify([entry.headRef, entry.hash.full]))}">
                                        <i class="octicon octicon-git-pull-request"></i>
                                    </a>
                                </span>
                            </div>
                            <div class="cherry-pick-button">
                                <span class="btnx hint--bottom hint--rounded hint--bounce" aria-label="Compare"><span aria-label="Compare">
                                    <a href="${encodeURI('command:git.commit.compare?' + JSON.stringify([entry.headRef, entry.hash.full]))}">
                                        <i class="octicon octicon-git-commit"></i>
                                    </a>
                                </span>
                            </div>
                            <div class="commit-hash">
                                <span class="sha-code short" data-entry-index="${entryIndex}" aria-label="${entry.hash.short}">${entry.hash.short}</span>
                            </div>
                        </div>
                    </div>
                    ${generateRemoteRefHtmlView(entry)}
                    ${generateHeadRefHtmlView(entry)}
                    <div class="media-content">
                        <a class="commit-subject-link">${htmlEncode(entry.subject)}</a>
                        <div class="commit-subject" data-entry-index="${entryIndex}">${htmlEncode(entry.subject)}</div>
                        <div class="commit-author">
                            <span class="name hint--right hint--rounded hint--bounce" aria-label="${entry.author.email}">${htmlEncode(entry.author.name)}</span>
                            <span class="timestamp">on ${entry.author.localisedDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (skipGraph) {
        entries = [];
    }
    return generateHistoryListContainer(entries, entriesHtml, canGoPrevious, canGoNext);
}
