(function () {
    (window as any).GITHISTORY = {};
    let clipboard: Clipboard;
    function initializeClipboard() {
        $('a.clipboard-link').addClass('hidden');
        clipboard = new Clipboard('.btn.clipboard');
        clipboard.on('success', onCopied);
    }

    function onCopied(e: ClipboardEvent) {
        e.clearSelection();
    }

    $(document).ready(() => {
        initializeClipboard();
        (window as any).GITHISTORY.generateSVG();
        (window as any).GITHISTORY.initializeDetailsView();
    });
})();
