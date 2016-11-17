/// <reference path="typings/types.d.ts" />
import * as Clipboard from 'clipboard';

(function () {
    (window as any).GITHISTORY = {};

    function addScripts(done: Function) {
        let scripts = document.querySelectorAll('div.script');
        const scriptCount = scripts.length;
        let scriptsLoaded = 0;
        for (let counter = 0; counter < scripts.length; counter++) {
            addScriptFile(scripts[counter].innerHTML.trim(), () => {
                scriptsLoaded += 1;
                if (scriptsLoaded >= scriptCount) {
                    done();
                }
            });
        }
    }
    function addScriptFile(scriptFilePath: string, onload: (ev: Event) => any) {
        let script = document.createElement('script');
        script.setAttribute('src', scriptFilePath.replace('/\\/g', '/'));
        document.body.appendChild(script);
        script.onload = onload;
    }

    let clipboard = null;
    function initializeClipboard() {
        $('a.clipboard-link').addClass('hidden');
        // ($('.btn.clipboard') as any).tooltip({
        //     placement: 'down'
        // });
        clipboard = new Clipboard('.btn.clipboard');
        clipboard.on('success', onCopied);
    }

    function onCopied(e) {
        e.clearSelection();
        // let $ele = $(e.trigger).attr('title', 'Copied');
        // ($ele as any).tooltip('fixTitle').tooltip('show');
    }

    addScripts(() => {
        initializeClipboard();
        (window as any).GITHISTORY.generateSVG();
        (window as any).GITHISTORY.initializeDetailsView();
    });
})();
