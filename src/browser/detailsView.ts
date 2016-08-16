/// <reference path="typings/types.d.ts" />
import * as contracts from '../contracts';

(function () {
    let logEntries: contracts.LogEntry[];
    let $detailsView: JQuery;
    let $fileListTemplate: JQuery;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $detailsView = $('#detailsView');
        $fileListTemplate = $('li.template', $detailsView);
        logEntries = JSON.parse(document.querySelectorAll('div.json.entries')[0].innerHTML);
        addEventHandlers();
    };

    function addEventHandlers() {
        $('.messageLink').addClass('hidden');
        $('span.message').on('click', evt => {
            let entryIndex = evt.target.getAttribute('data-entry-index');
            displayDetails(logEntries[parseInt(entryIndex)]);
        });
        $('span.sha.short').on('click', evt => {
            let entryIndex = evt.target.getAttribute('data-entry-index');
            displayDetails(logEntries[parseInt(entryIndex)]);
        });
    }

    let detailsViewShown = false;
    function displayDetails(entry: contracts.LogEntry) {
        if (!detailsViewShown) {
            $('#log-view').addClass('with-details');
            $detailsView.removeClass('hidden');
        }

        $('#subject').html(entry.subject);
        $('span.name', $detailsView).attr('aria-label', entry.author.email).html(entry.author.name);
        $('span.when', $detailsView).html(moment(entry.author.date).format('MMM Do YYYY, h:mm:ss a'));
        $('div.body', $detailsView).html(entry.body);
        $('div.notes', $detailsView).html(entry.notes);
        let $files = $('ul.files', $detailsView);
        $files.html('');
        entry.fileStats.forEach(stat => {
            let $fileItem = $fileListTemplate.clone(false);
            $('.added .count', $fileItem).html((stat.additions ? stat.additions : 0).toString());
            $('.deleted .count', $fileItem).html((stat.deletions ? stat.deletions : 0).toString());
            $('.fileName', $fileItem).html(stat.path);
            $files.append($fileItem);
        });
    }
})();