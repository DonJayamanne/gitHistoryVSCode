## How to build
- Install nodejs 8.9.1+
- install yarn
- Clone repo
- Open repo folder in VS Code
- Run command `yarn` in terminal
- Run command `git submodule init`
- Run command `git submodule update`
- Go to `Task-> Run Build Task` menu option in VS Code
- Run both Compile and npm:WatchReact tasks

## How to run
- From the terminal, go to the repo's folder
- Run `code --extensionDevelopmentPath=.` command. This will open a new instance of VS Code in dev mode
- From the debug panel of the new VS Code instance, run the `Launch Extension` option
- See [VS Code Docs](https://code.visualstudio.com/docs/extensions/developing-extensions#_launching-your-extension) for additional details