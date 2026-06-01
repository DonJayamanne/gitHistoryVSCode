## How to build
- Install nodejs 12.8.+
- install npm
- Clone repo
- Open repo folder in VS Code
- Run command `npm install` in terminal
- Go to `Task-> Run Build Task` menu option in VS Code
- Run both Compile and npm:WatchReact tasks

## How to run
- From the terminal, go to the repo's folder
- From the debug panel of the new VS Code instance, run the `Launch Extension` option or press F5. This will open a new instance of VS Code in dev mode
- See [VS Code Docs](https://code.visualstudio.com/docs/extensions/developing-extensions#_launching-your-extension) for additional details

## Running tests
- `npm test` runs the unit tests (parsers/adapters) via Jest - no VS Code required.
- `npm run test-extension` runs the integration tests, which download and launch a real VS Code instance.
  - The harness is pinned to a VS Code version compatible with the targeted `engines.vscode`. Override it with `VSCODE_TEST_VERSION=stable npm run test-extension` to test against the latest build.

### Running the integration tests headlessly (CI / WSL / containers)
The downloaded VS Code is an Electron app, so it needs a display and a few system libraries that a minimal Linux image may lack.

- **Display:** provide one with `xvfb-run -a npm run test-extension`. (Under WSLg, `DISPLAY` is already set, so this is not needed.)
- **System libraries:** VS Code/Electron needs at least `libnss3`, `libnspr4`, and `libasound2` (`libasound2t64` on Ubuntu 24.04+); GUI launches may also need `libgbm1`, `libgtk-3-0`, `libxkbfile1`, `libsecret-1-0`, `libx11-xcb1`. Install them with your package manager, e.g.:
  ```
  sudo apt-get install -y libnss3 libnspr4 libasound2t64 libgbm1 libgtk-3-0 libxkbfile1 libsecret-1-0 libx11-xcb1
  ```
- **Without root:** if you cannot use `sudo`, extract the packages into a user directory and point VS Code at them:
  ```
  mkdir -p ~/.local/vscode-libs/debs && cd ~/.local/vscode-libs/debs
  apt-get download libnss3 libnspr4 libasound2t64
  for d in *.deb; do dpkg-deb -x "$d" ~/.local/vscode-libs/root; done
  LD_LIBRARY_PATH=~/.local/vscode-libs/root/usr/lib/x86_64-linux-gnu npm run test-extension
  ```
- The `native-keymap`/GPU (`dri3`, `viz_main_impl`) errors printed on startup are harmless in a headless environment.

## Storybook
- `npm run storybook`
