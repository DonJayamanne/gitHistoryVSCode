# Changelog

## v0.6.5 (27/04/2020)
- [a6bf8c7] ups - @ole1986
- [1643c8d] Github Actions: use proper tag name when generating release notes - @ole1986
- [10d420d] generate release nots on push tags - @ole1986
- [1bb30cd] Possible fix for #542 (#543) - @ole1986
- [efb737a] Updated version to 0.6.5 - @ole1986
- [db97f61] Load dereferenced hashes for tags in chunks. (#541) - @damianfijorek
- [5a853a6] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.4 (23/04/2020)
- [3fd1ffb] Version updated - @ole1986
- [163da0a] Setting to always prompt for repository picker (#540) - @ole1986
- [bdf75e0] Setting to display icon in scm toolbar (#535) - @Lej77
- [fd79059] use vsce package after vsce publish to make file available - @ole1986
- [c09266f] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.3 (16/03/2020)
- [334c043] updated package.json to match version - @ole1986
- [ed206d5] use actions/checkout@v2 to allow git push on current (#533) - @ole1986
- [a13ea9d] Updated CHANGELOG.md - Github Actions - @ole1986
- [21009c9] Updated CHANGELOG.md - Github Actions - @ole1986
- [42a4238] Updated CHANGELOG.md - Github Actions - @ole1986
- [ff4cdc9] remove vsce-publish.yml from master branch to make sure it is not being used - @ole1986
- [3af6409] uups - @ole1986
- [52f4782] Updated CHANGELOG.md - Github Actions - @ole1986
- [aa12618] use version number from package.json in vsce-package.yml (#531) and generate changelog - @ole1986
- [216bd50] Updated CHANGELOG.md - Github Actions - @ole1986
- [bf48916] Add support for react storybook (#526) 
- [4078b0d] vscode-test is a dev dependency (#527) 
- [a2900cf] Minor perf improvements to fetching commits (#529) 
- [3e4054f] Updated CHANGELOG.md - Github Actions - @ole1986
- [12b4899] Use `git tag v*` and `git push --tags` to prerelease a version - @ole1986
- [150f201] Updated CHANGELOG.md - Github Actions - @ole1986
- [868d8e0] Always display icon in scm  toolbar (#520) 
- [61c2528] ignore prereleases in vsce-publish.yml - @ole1986
- [30e9ca5] Fixed #517 (#518) - @ole1986
- [c18d271] Move svg generator into separate location (#519) 
- [1ed74ef] Format tsx using prettier/eslint (Fixes #511) (#512) 
- [ea2fff5] Capture telemetry to detect feature usage and crashes (#516) 
- [1c4bc1a] Support clicking entire row to view commit (Fixes #513) (#514) 
- [f22511f] Get branches faster (fixes #492) (#507) 
- [eed4bf2] Split jobs in PR (#505) 
- [283f7dd] Add tests for getting commit count for a specific branch (#504) 
- [91c1d19] Add tests for get list of branches and current branch (#498) 
- [6d5035f] Fixes to getting total commit count (Fixes #499) (#500) - @ole1986
- [7578d58] VS Code tests using jest (#495) 
- [a42056b] Ensure we wait for vscode.git to activate (#493) 
- [f9cbf91] Use Symbol.for instead of Symbol, for equality (#497) 
- [0489597] Ensure extension is always active (#494) 
- [f026e09] Replace mocha with jest (#490) 

---

## Version 0.6.2 (07/03/2020)
- Fixed deprecated react methods [#480](https://github.com/DonJayamanne/gitHistoryVSCode/pull/480)
- Applied PR [#483](https://github.com/DonJayamanne/gitHistoryVSCode/pull/483)
- Added PR validator using Github actions [#481](https://github.com/DonJayamanne/gitHistoryVSCode/pull/481)
- Fixed line history shows empty list [#486](https://github.com/DonJayamanne/gitHistoryVSCode/issues/486)
- Auto fix eslint issues and add recommended extensions [#488] (https://github.com/DonJayamanne/gitHistoryVSCode/pull/488) @DonJayamanne 
- Fixed references not updating and disappearing [#484](https://github.com/DonJayamanne/gitHistoryVSCode/pull/484)

---

## 0.6.1 (06/03/2020)
- Fixed [#478](https://github.com/DonJayamanne/gitHistoryVSCode/issues/478)
---

## Version 0.6.0 (02/03/2020)
- Replaced express with postMessage [#469](https://github.com/DonJayamanne/gitHistoryVSCode/pull/469) [#451](https://github.com/DonJayamanne/gitHistoryVSCode/issues/451)
- Updated package dependencies and removed gulp [#471](https://github.com/DonJayamanne/gitHistoryVSCode/pull/471)
- Use webpack to also bundle the server sources [#474](https://github.com/DonJayamanne/gitHistoryVSCode/pull/474)
- Use node-fetch to request github api
- Fixed page counter and pagination issues [#475](https://github.com/DonJayamanne/gitHistoryVSCode/pull/475)
- Code optimization and correction

---

## Version 0.5.5 (27/02/2020)
- Fixed line history shows file history instead #472
---

## Version 0.5.4 (24/02/2020)
- Fixed indentation of commits against branching graph @DonJayamanne [#446](https://github.com/DonJayamanne/gitHistoryVSCode/pull/446)
- Smooth curvy edges in the graphs @DonJayamanne [#463](https://github.com/DonJayamanne/gitHistoryVSCode/pull/463)
- Fixed CacheRegister expiryTime and properly cache multiple GitService objects [#441](https://github.com/DonJayamanne/gitHistoryVSCode/issues/441)
- Visualize detached head in Git History view [#167](https://github.com/DonJayamanne/gitHistoryVSCode/issues/167)
- Dynamic update commit entry when adding/removing tags or branches while showing a loading indicator
- Filter on exact author name when choosing from dropdown
- Code cleanup and optimization

---

## Version 0.5.3 (15/02/2020)
- Fixed commit details not correctly parsed when message has several line breaks [#435](https://github.com/DonJayamanne/gitHistoryVSCode/issues/435)
- Reduced `bundle.js` file size again by replacing FaFilter with GoEye from react-icons [#439](https://github.com/DonJayamanne/gitHistoryVSCode/issues/439)
---

## Version 0.5.2 (13/02/2020)
- Fixed gravatar picture not loading due to missing protocol [#436](https://github.com/DonJayamanne/gitHistoryVSCode/issues/436)
- Fixed repository selector when only one repo is available [#436](https://github.com/DonJayamanne/gitHistoryVSCode/issues/436)
---

## Version 0.5.1 (12/02/2020)
- Added filter support in branches and authors dropdown [#384](https://github.com/DonJayamanne/gitHistoryVSCode/issues/384)
- Support for deletion of branches in GUI [#348](https://github.com/DonJayamanne/gitHistoryVSCode/issues/348)
- Support for deletion of remote branches in GUI
- Replaced gemoji submodule with node-emoji npm package
- Fixed commit panel view not shown [#435](https://github.com/DonJayamanne/gitHistoryVSCode/issues/435)
- Fixed possible issue not opening commit details [#435](https://github.com/DonJayamanne/gitHistoryVSCode/issues/435)

---

## Version 0.5.0 (09/02/2020)
- Replaced git commands with git extension api (1/2) [#410](https://github.com/DonJayamanne/gitHistoryVSCode/pull/410)
- Fixed dialog button triggered twice when pressing enter key
- Display external link to upstream (if available) in Git History view
- Possible fix for [#381](https://github.com/DonJayamanne/gitHistoryVSCode/issues/381)
- Possible fix for [#424](https://github.com/DonJayamanne/gitHistoryVSCode/issues/424)
- Slightly amended ui and debug logging
- Removed redundant call on getCommit while always using --first-parent argument (if necessary)
- Fixed issue not showing status icon in commit details view
- Removed some unused git related methods

PLEASE NOTE: It may be necessary to select the correct repository from vscode source control before running "Git History"
---

## Version 0.4.17 (07/02/2020)
- Support for soft and hard reset in Git History view
- Fixed issue request payload limit exceeded [#432](https://github.com/DonJayamanne/gitHistoryVSCode/issues/432)
---

## Version 0.4.16 (05/02/2020)
- Removed nested iframe causing keyboard focus issues [#433](https://github.com/DonJayamanne/gitHistoryVSCode/pull/433)
- Corrected language setting using vscode display language (vscode.env.language)
- Support for removing tags from history view
---

## Version 0.4.15 (01/02/2020)
- Fixed issue [#430](https://github.com/DonJayamanne/gitHistoryVSCode/issues/430)
- Fixed refresh issue when new tag/branch is added
---

## Version 0.4.14 (30/01/2020)
- Slightly amended scrollbar and dropdown style to match theme colors [#423]
- Added browser actionbar for quicker access to relevant functions (E.g. create tag, create branch) [#428]
- Added modal window to allow user input and confirmation dialogs [#429]
---

## Version 0.4.13 (06/01/2020)
- Applied PR [#420](https://github.com/DonJayamanne/gitHistoryVSCode/pull/420) to fix repositories with no remote, thanks to @jsejcksn

---

## Version 0.4.12 (21/12/2019)
* Fixed #417 using scrollbars for now
* Added PR #419 allowing to create tags or branches from git history view
---

## Version 0.4.11 (07/12/2019)
* Reveal "Git History" and "File History" tab when already opened #382 #365 
* Added files search box into commit view #393
* Replaced react-rnd with re-resizer package for better user experience (when resizing)
---

## Version 0.4.10 (03/12/2019)
* Fixed #287 
* Fixed #412
* Copy commit message from detail view #413  #378 
* Some typescript hygiene and unused package removal
---

## Version 0.4.9 (30/11/2019)
* Fixed issue #411
---

## Version 0.4.8 (29/11/2019)
- Remote support (PR #401)
- Browser improvements (PR #406, PR #407)
- Style amendments by passing `--vscode-*` into the iframe (PR #360)
- Slightly improved finding submodules using git extension api (PR #358)
- Fixed typo (PR #399)
- Fixed #397 
- Several other improvements on styling, code coverage and user experience
---

## Version 0.4.7 (21/02/2019)
- Always request github users API (when avatar cache expires) and check for modifications
- Fixed avatar issues (#349, #287) using remote contributors and added avatar cache extension setting (default 1 hour)
---

## Version 0.4.6 (16/02/2019)
- Handle cases where folder/file names conflicts with brancch names #205, #340
- Adds support for multi-root workspace folders #346
---

## Version 0.4.5 (16/02/2019)
- Make search case-insensitive PR [#334](https://github.com/DonJayamanne/gitHistoryVSCode/pull/334)
---

## Version 0.4.4 (18/10/2018)
- Merged PR [#328](https://github.com/DonJayamanne/gitHistoryVSCode/pull/328)
- Updated webpack to resolve three compile errors
- reduced some compile errors by adding default values
- display the explorer view when using "compare commits" [#326](https://github.com/DonJayamanne/gitHistoryVSCode/issues/326)
- support for commit checkout in git history context menu [#303](https://github.com/DonJayamanne/gitHistoryVSCode/issues/303)
- use of vscode.git extension api to fetch git path
- Merged PR [#329](https://github.com/DonJayamanne/gitHistoryVSCode/pull/329)
- Merged PR [#330](https://github.com/DonJayamanne/gitHistoryVSCode/pull/330)
---

## Version 0.4.3 (01/10/2018)
- Workaround on Uri.fsPath getting '/' (slash) prefix PR [#316](https://github.com/DonJayamanne/gitHistoryVSCode/pull/316)
- fixFileUri is no more  [#316](https://github.com/DonJayamanne/gitHistoryVSCode/pull/316)
- Fixed ViewFileContents from committed files  [#316](https://github.com/DonJayamanne/gitHistoryVSCode/pull/316)
- Fix GitHub origin detection for SSH remotes  [#319](https://github.com/DonJayamanne/gitHistoryVSCode/pull/319)
- Read current remote name (defaulting to origin)  [#318](https://github.com/DonJayamanne/gitHistoryVSCode/pull/318)
- getGitReposInFolder: fix async folder filtering  [#311](https://github.com/DonJayamanne/gitHistoryVSCode/pull/311)

---

## Version 0.4.2 (29/09/2018)
- Comparison fails at times [#293](https://github.com/DonJayamanne/gitHistoryVSCode/issues/293), [#291](https://github.com/DonJayamanne/gitHistoryVSCode/issues/291), [#290](https://github.com/DonJayamanne/gitHistoryVSCode/issues/290)
- Unable to view history when `Author` name is empty [#294](https://github.com/DonJayamanne/gitHistoryVSCode/issues/294)

---

## Version 0.4.0 (06/05/2018)
- Fix display of random avatars [#230](https://github.com/DonJayamanne/gitHistoryVSCode/pull/230), [#229](https://github.com/DonJayamanne/gitHistoryVSCode/pull/229), [#228](https://github.com/DonJayamanne/gitHistoryVSCode/pull/228), [#227](https://github.com/DonJayamanne/gitHistoryVSCode/pull/227)
---

## Version 0.3.0 (17/01/2018)
- Improvements to the graph
- Ability to search from within the history viewer
- Display history viewer when viewing history of files
- Miscellaneous fixes
