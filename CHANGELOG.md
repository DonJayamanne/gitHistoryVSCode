# Changelog

## v0.6.13 (07/11/2020)
- [2137af8] Version 0.6.13 - @ole1986
- [382eadc] Use native git api to get local branches (Also fixes #572 and #601) (#600) - @ole1986
- [7b1b9ad] Delete config.yml - @ole1986
- [cec540c] Delete issue_template.md - @ole1986
- [d36b16c] Create  config.yml - @ole1986
- [d1c7dfb] Create issue_template.md - @ole1986
- [57e7cf6] Set merge history color to gray. (#597) - @cweijan
- [7f42d22] Set webview icon as extension icon. (#594) - @cweijan
- [6ebaf3f] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.12 (11/10/2020)
- [cb0b886] Version 0.6.12 - @ole1986
- [505d788] Resolved issue #589 using configuration setting "gitHistory.editorTitleButtonOpenRepo" - @ole1986
- [55a1546] A quicker access to file actions within a commit (#588) - @ole1986
- [2548db7] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.11 (03/10/2020)
- [ed63a0e] Version 0.6.11 - @ole1986
- [3b74493] Fixes "Git History" not opening from submodule (wrong path translation?!) (#586) - @ole1986
- [e00d0bf] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.10 (24/09/2020)
- [fe22ab2] Version 0.6.10 - @ole1986
- [f797425] Support fetching commits for more than 1 branch (#532) 
- [50ba3e0] support split show history and highlight filename (#582) - @cweijan
- [5e92a43] Allow vscode-resource to display images again (#584) - @ole1986
- [7fc7af4] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.9 (31/07/2020)
- [1de9795] Version 0.6.9 - @ole1986
- [f3e2a58] Replace node-fetch with axios again to resolve #567 (#573) - @ole1986
- [70aef67] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.8 (17/07/2020)
- [afbd2e8] Version 0.6.8 - @ole1986
- [39c8910] Fixed #565 and #556 due to decoding issues in querystring.parse([...]) - @ole1986
- [4e4b77c] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.7 (16/07/2020)
- [daea259] Updated package-lock.json - @ole1986
- [eaf4479] Fixed status icon path in browser view (#564) - @ole1986
- [931f918] Version 0.6.7 - @ole1986
- [4022a00] Fixed #560 (#563) - @ole1986
- [4976868] Updated CHANGELOG.md - Github Actions - @ole1986

---

## v0.6.6 (13/07/2020)
- [96c29c4] #561 (#562) - @ole1986
- [0b15420] An option to checkout the branch. but requires to update properly using git api (#551) - @ole1986
- [e6253f3] gren does not properly compare against previous version (gren > 0.17.1) - @ole1986
- [6a08dfb] Resolve issue with gren when using "on: push" github event - @ole1986
- [85775b7] Version 0.6.6 and npm audit fixup - @ole1986
- [109611d] Update node to version 12.8.* (#509) 
- [cbe77d6] Use ts-loader for browser building (#544) - @ole1986
- [b7fc737] Updated CHANGELOG.md - Github Actions - @ole1986

---

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