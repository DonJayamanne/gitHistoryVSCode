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
You can add keyboard short cuts for the above commands by following the directions on the website [customization documentation](https://code.visualstudio.com/docs/customization/keybindings).

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
- Move to Async programing pattern (internal)
- Add logging and better error surfacing  - output windows 'Git History Log' 
- Add a seperate output window for non logging display 'Git History Info'
- Fix #43 #63 - error when file in not present in a commit
- File actions pick list - only show applicable actions
e.g. don't show compare with previous if file not present in previous commit.
- Improve readability of picklist for commits of a file (2 line display)
- Improve gitPath logic and performance.
- Make git log default page size 50 for performance.
 
## Source

[GitHub](https://github.com/DonJayamanne/gitHistoryVSCode)
                
## License

[MIT](https://raw.githubusercontent.com/DonJayamanne/bowerVSCode/master/LICENSE)
