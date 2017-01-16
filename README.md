# Git History (including _git log_)

View git log along with the graph and details.   
View the history of a file (Git log) or the history of a line in a file (Git Blame).
View a previous copy of the file.
Compare a previous version with the version in the workspace or another.
View commit log details for a selected commit.

## Features
* **View Git History with graph and details (latest feature)**
* View the details of a commit, such as author name, email, date, committer name, email, date and comments.
* View a previous copy of the file or compare it against the local workspace version or a previous version.
* View the changes to the active line in the editor (Git Blame).
* Configure the information displayed in the list
* Use keyboard shortcuts to view history of a file or line

Open the file to view the history, and then 
Press F1 and select/type "Git: View History (git log)", "Git: View File History" or "Git: View Line History".

## Available Commands
* **View Git History (git log) (git.viewHistory)**
* View File History (git.viewFileHistory)
* View Line History (git.viewLineHistory)

## Keyboard Shortcuts
You can add keyboard short cuts for the above commands by following the directions in the on the website [customization documentation](https://code.visualstudio.com/docs/customization/keybindings).

NOTE: The file for which the history is to be viewed, must already be opened.
 
![Image of Git Log](https://raw.githubusercontent.com/DonJayamanne/gitHistoryVSCode/master/images/gitLogv2.gif)

![Image of File History](https://raw.githubusercontent.com/DonJayamanne/gitHistoryVSCode/master/images/fileHistoryCommand.gif)

![Image of another instance of File History](https://raw.githubusercontent.com/DonJayamanne/gitHistoryVSCode/master/images/fileHistoryCommandMore.gif)

![Image of Line History](https://raw.githubusercontent.com/DonJayamanne/gitHistoryVSCode/master/images/lineHistoryCommand.gif)

## Roadmap   
- View git log for all branches   
- View refs (branch, tags)   
- Search git history

## Big thanks to [Mike Surcouf](https://github.com/mikes-gh)

## Change Log 
[View](https://github.com/DonJayamanne/gitHistoryVSCode/blob/master/CHANGELOG.md)
* Fix HTML chars in filenames [#53](https://github.com/DonJayamanne/gitHistoryVSCode/pull/53)
* Fix git log above repo root (Credit to [malytskyy](https://github.com/malytskyy)) [#77](https://github.com/DonJayamanne/gitHistoryVSCode/pull/77) 
* Rename outChannel to 'Git History' [#83](https://github.com/DonJayamanne/gitHistoryVSCode/pull/83) 
* Don't use incorrectly configured git.path [#78](https://github.com/DonJayamanne/gitHistoryVSCode/pull/78) and [#46](https://github.com/DonJayamanne/gitHistoryVSCode/pull/46) 
* Add error handling for spawned processes (Credit to [SE2Dev](https://github.com/SE2Dev)) [#46](https://github.com/DonJayamanne/gitHistoryVSCode/pull/46) 
* tmp file cleanup.  There is a lot of effort to manually cleanup when tmp does it all anyway. [#88](https://github.com/DonJayamanne/gitHistoryVSCode/pull/88) 
* Update typescript to 2.1 and update to ES6 target (allowing async await in place of .then) [#81](https://github.com/DonJayamanne/gitHistoryVSCode/pull/81) 
 
## Source

[GitHub](https://github.com/DonJayamanne/gitHistoryVSCode)
                
## License

[MIT](https://raw.githubusercontent.com/DonJayamanne/bowerVSCode/master/LICENSE)
