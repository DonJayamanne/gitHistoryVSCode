# Change Log

## Version 0.2.0
- Move to Async programing pattern (internal)
- Add logging and better error surfacing  - output windows 'Git History Log' 
- Add a seperate output window for non logging display 'Git History Info'
- Fix #43 #63 - error when file in not present in a commit
- File actions pick list - only show applicable actions
e.g. don't show compare with previous if file not present in previous commit.
- Improve readability of picklist for commits of a file (2 line display)
- Improve gitPath logic and performance.
- Make git log default page size 50 for performance.

## Version 0.1.5
* Fix HTML chars in filenames [#53](https://github.com/DonJayamanne/gitHistoryVSCode/pull/53)
* Fix git log above repo root (Credit to [malytskyy](https://github.com/malytskyy)) [#77](https://github.com/DonJayamanne/gitHistoryVSCode/pull/77) 
* Rename outChannel to 'Git History' [#83](https://github.com/DonJayamanne/gitHistoryVSCode/pull/83) 
* Don't use incorrectly configured git.path [#78](https://github.com/DonJayamanne/gitHistoryVSCode/pull/78) and [#46](https://github.com/DonJayamanne/gitHistoryVSCode/pull/46) 
* Add error handling for spawned processes (Credit to [SE2Dev](https://github.com/SE2Dev)) [#46](https://github.com/DonJayamanne/gitHistoryVSCode/pull/46) 
* tmp file cleanup.  There is a lot of effort to manually cleanup when tmp does it all anyway. [#88](https://github.com/DonJayamanne/gitHistoryVSCode/pull/88) 
* Update typescript to 2.1 and update to ES6 target (allowing async await in place of .then) [#81](https://github.com/DonJayamanne/gitHistoryVSCode/pull/81) 

## Version 0.1.4
* Fix git log paging [#74](https://github.com/DonJayamanne/gitHistoryVSCode/pull/74)

## Version 0.1.3
* Clean up [#70](https://github.com/DonJayamanne/gitHistoryVSCode/pull/70)

## Version 0.1.2
* Underlining file history details link on hover [#48](https://github.com/DonJayamanne/gitHistoryVSCode/issues/48), [#54](https://github.com/DonJayamanne/gitHistoryVSCode/issues/54)

## Version 0.1.1
* Fixed styling of file history details [#48](https://github.com/DonJayamanne/gitHistoryVSCode/issues/48), [#54](https://github.com/DonJayamanne/gitHistoryVSCode/issues/54)
* Updated to TypeScript 2.0 [#68](https://github.com/DonJayamanne/gitHistoryVSCode/pull/68)
* Date format was always displayed in en-US [#69](https://github.com/DonJayamanne/gitHistoryVSCode/issues/69)
* Comparing large files would display incorrect information [#56](https://github.com/DonJayamanne/gitHistoryVSCode/issues/56)
* Compilation issue [#60](https://github.com/DonJayamanne/gitHistoryVSCode/issues/60)

## Version 0.1.0
* Viewing individual file commit details in commit list [#44](https://github.com/DonJayamanne/gitHistoryVSCode/issues/44)

## Version 0.0.12
* Improved look and feel [#35](https://github.com/DonJayamanne/gitHistoryVSCode/pull/35)

## Version 0.0.11
* Bug fix to deleted temporary files [#32](https://github.com/DonJayamanne/gitHistoryVSCode/issues/32)
* Fix to restore following changes to file names [#26](https://github.com/DonJayamanne/gitHistoryVSCode/issues/26)

## Version 0.0.10
* Bug fix to remove debug code [#29](https://github.com/DonJayamanne/gitHistoryVSCode/issues/29)

## Version 0.0.9
* Added new feature to view git history with graphs and details

## Version 0.0.8
* Fix for issue [#27](https://github.com/DonJayamanne/gitHistoryVSCode/issues/27)

## Version 0.0.7
* Updated to make use of VS Code API for file comparison
* Added ability to view file history from explorer context menu
* Fixed issue where history is reversed [#15](https://github.com/DonJayamanne/gitHistoryVSCode/pull/15)

## Version 0.0.5
* Added custom commands for file and line history, allowing the ability to add keyboard shortcuts
* Remove the old command and replaced it with two separate commands
* Ensured the commands are available only when a text editor is active

## Version 0.0.4
* Improvements in detecting path to git
* Bug fix when viewing history of file in workspace (root) directory

## Version 0.0.3
* Read path to GIT from VSCode configuration
* Configure the information displayed in picklist

## Version 0.0.1
* Initial release