/// <reference path="typings/types.d.ts" />
(function () {

    function addScripts(logEle: HTMLElement, done: Function) {
        let scripts = document.querySelectorAll('div.script');
        const scriptCount = scripts.length;
        let scriptsLoaded = 0;
        logEle.innerHTML += ', Script count = ' + scripts.length.toString();
        for (let counter = 0; counter < scripts.length; counter++) {
            addScriptFile(logEle, scripts[counter].innerHTML.trim(), () => {
                scriptsLoaded += 1;
                logEle.innerHTML += ', Script loaded = ' + scriptsLoaded.toString();
                if (scriptsLoaded >= scriptCount) {
                    done();
                }
            });
        }
    }
    function addScriptFile(logEle: HTMLElement, scriptFilePath: string, onload: (ev: Event) => any) {
        let script = document.createElement('script');
        script.setAttribute('src', scriptFilePath.replace('/\\/g', '/'));
        document.getElementById('myBody').appendChild(script);
        script.onload = onload;
    }

    let clipboard = null;
    function initializeClipboard() {
        $('a.clipboardLink').addClass('hidden');

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
    const logEle = document.getElementById('h');
    try {
        logEle.innerHTML = 'step1';
        // addScripts(logEle, () => {
        //     try {
        //         logEle.innerHTML = 'step2';
        //         initializeClipboard();
        //         logEle.innerHTML = 'step3';
        //     }
        //     catch (ex2) {
        //         logEle.innerHTML = 'error = ' + ex2.message;
        //     }
        // });
    }
    catch (ex) {
        logEle.innerHTML = 'error = ' + ex.message;
    }
})();

// function initShaClipboard() {
//     const elements = window.parent.document.querySelectorAll("span.sha.short");
//     for (let counter = 0; counter < elements.length; counter++) {
//         const element = elements[counter];
//         element.addEventListener('click', (e: Event) => {
//             let ele = (e.currentTarget as HTMLElement);
//             const sha = ele.getAttribute('aria-label');
//             copy(sha);
//             showTooltip(ele, 'Copied');
//         });
//         element.addEventListener('mouseleave', (e: Event) => {
//             restoreTooltip((e.currentTarget as HTMLElement));
//         });
//     }
// }

// var btns = document.querySelectorAll('.btn');
// for (var i = 0; i < btns.length; i++) {
//     btns[i].addEventListener('mouseleave', function (e) {
//         e.currentTarget.setAttribute('class', 'btn');
//         e.currentTarget.removeAttribute('aria-label');
//     });
// }
// function showTooltip(elem: HTMLElement, msg: string) {
//     elem.setAttribute('aria-label', msg);
//     elem.setAttribute('class', 'btn tooltipped tooltipped-s');
// }
// function restoreTooltip(elem: HTMLElement) {
//     // elem.setAttribute('class', 'btn tooltipped tooltipped-s');
//     // elem.setAttribute('aria-label', msg);
// }

// function updateText() {
//     document.getElementById('item').innerHTML = 'Works from outside';
//     document.getElementById('h').innerHTML = 'prp';
//     document.getElementById('wow').addEventListener('click', function () {
//         document.getElementById('h').innerHTML = 'this is great';
//     });
// }
// updateText();