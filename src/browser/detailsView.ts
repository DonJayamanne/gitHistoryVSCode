import * as contracts from '../contracts';

(function () {
    let logEntries: contracts.LogEntry[];
    let $logView: JQuery;
    let $detailsView: JQuery;
    let $fileListTemplate: JQuery;
    (window as any).GITHISTORY.initializeDetailsView = function () {
        $logView = $('#log-view');
        $detailsView = $('#details-view');
        $fileListTemplate = $('.diff-row', $detailsView);
        logEntries = JSON.parse(document.querySelectorAll('div.json.entries')[0].innerHTML, dateReviver);

        addEventHandlers();
    };

    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
    // Used to deserialise dates to dates instead of strings (default behaviour)
    function dateReviver(key: string, value: any) {
        const dateTest = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;
        if (typeof value === 'string' && dateTest.exec(value)) {
            return new Date(value);
        }

        return value;
    };

    function addEventHandlers() {
        $('.commit-subject-link', $logView).addClass('hidden');

        // delegate the events
        $logView
          .on('click', '.commit-subject', evt => {
                let entryIndex = evt.target.getAttribute('data-entry-index');
                if (entryIndex !== null) {
                    displayDetails(logEntries[parseInt(entryIndex)], event.target as Element);
                }
          })
          .on('click', '.commit-hash', evt => {
                let entryIndex = evt.target.getAttribute('data-entry-index');
                if (entryIndex !== null) {
                    displayDetails(logEntries[parseInt(entryIndex)], event.target as Element);
                }
          })
        ;

        $detailsView
          .on('click', '.close-btn', hideDetails)
        ;
    }

    let detailsViewShown = false;
    function displayDetails(entry: contracts.LogEntry, eventTarget: Element) {
        let $logEntry = $(eventTarget).closest('.log-entry');

        // mark this log entry as selected
        $('.log-entry', $logView).removeClass('active');
        $logEntry.addClass('active');

        if (!detailsViewShown) {
            $logView.addClass('with-details');
            $logView.animate({
              scrollTop: $logEntry.offset().top - $logView.offset().top + $logView.scrollTop()
            });
            $detailsView.removeClass('hidden');
        }

        $('.commit-subject', $detailsView).html(entry.subject);
        $('.commit-author .name', $detailsView)
          .attr('aria-label', entry.author.email)
          .html(entry.author.name);

        $('.commit-author .timestamp', $detailsView)
          .html(' on ' + entry.author.localisedDate);

        $('.commit-body', $detailsView)
          .html(entry.body);
        $('.commit-notes', $detailsView).html(entry.notes);
        let $files = $('.committed-files', $detailsView);
        $files.html('');
        entry.fileStats.forEach(stat => {
            let $fileItem = $fileListTemplate.clone(false);
            let { additions, deletions } = stat;
            let totalDiffs = additions + deletions;

            if (totalDiffs > 5) {
              additions = Math.ceil(5 * additions / totalDiffs);
              deletions = 5 - additions;
            }

            /* show the original number of changes in the title and count */
            $('.diff-stats', $fileItem).attr('aria-label', `added ${stat.additions} & deleted ${stat.deletions}`);
            $('.diff-count', $fileItem).html(totalDiffs.toString());
            /* colour the blocks in addition:deletion ratio */
            $('.diff-block', $fileItem).each((index: number, el: Element) => {
                let $el = $(el);
                if (index < additions) {
                    $el.addClass('added');
                } else if (index < totalDiffs) {
                    $el.addClass('deleted');
                }
            });
            $('.file-name', $fileItem).html(stat.path);
            let uri = encodeURI('command:git.viewFileCommitDetails?' + JSON.stringify([entry.sha1.full, stat.path, entry.committer.date.toISOString()]));
            $('a.file-name', $fileItem).attr('href', uri);
            $files.append($fileItem);
        });
    }

    function hideDetails() {
      detailsViewShown = false;
      $detailsView.addClass('hidden');
      $logView.removeClass('with-details');
    }
})();