import {ActionedDetails, LogEntry, Sha1} from '../contracts';

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

function generateHistoryListContainer(entriesHtml: string): string {
    return `
            <div id="log-view" class="list-group">
                <svg xmlns="http://www.w3.org/2000/svg"></svg>
                <div>
                <style>
				iframe[seamless]{
					background-color: transparent;
					border: 0px none transparent; 
					padding: 0px;
					overflow: hidden;
				} 
                
                </style>
                    <div id="contentPlaceholder">1234</div>
                    <button onClick="contentPlaceholder.innerHTML = '123';return false;">TEst</button>
<button onClick="var script = document.createElement('script');script.setAttribute('src', 'file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/out/src/browser/proxy.js');script.setAttribute('type', 'text/javascript');document.getElementById('myBody').appendChild(script);return false;">TEst</button>
<button onClick="updateText();return false">Try Now</button>
<button onClick="eval(document.getElementById('myscript').innerHTML);return false">Use Eval</button>
                    <div id="item">1234</div>
                    <div id="myscript">
                    try {
                        var script = document.createElement('script');
                        script.setAttribute('src', 'file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/out/src/browser/proxy.js');
                        script.setAttribute('type', 'text/javascript');document.getElementById('myBody')[0].appendChild(script);
                        document.getElementById('contentPlaceholder').innherHTML = 'succss';
                    }
                    catch(ex){
                        document.getElementById('contentPlaceholder').innherHTML = 'failed ' + ex.message; 
                    }
                    </div>
                    <div id="item2">1234</div>
                    <iframe style="width:100%;height:200px;" src='file:///Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/resources/iframeContent.html'></iframe>
                    <br>
                    ${entriesHtml}
                </div>
            </div>
            `;
}

export function generateHistoryHtmlView(entries: LogEntry[]): string {
    const entriesHtml = entries.map(entry => {
        return `
            <div class="log-entry list-group-item">
                <a href="#1234" class="messageLink">${entry.subject}</a>
                <span class="message">${entry.subject}</span>
                <div>
                    <span class="committer">
                        <a href="${entry.committer.email}">${entry.committer.name}</a>
                        <span>
                            <span class="name">${entry.committer.name}</span> commited on ${entry.committer.date.toLocaleDateString()}
                        </span>
                    </span>
                    <span class="hash">
                        <ul class="hash">
                            <li>
                                <span class="btn clipboard hint--bottom  hint--rounded" 
                                    data-clipboard-text="${entry.sha1.full}" 
                                    aria-label="Copy the full SHA">
                                    <span class="clipboard fa fa-clipboard"></span>
                                    <a class="btn clipboardLink" href="${encodeURI('command:git.copyText?' + entry.sha1.full)}">x</a>
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

    return generateHistoryListContainer(entriesHtml);
}