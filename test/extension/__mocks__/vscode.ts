// jest doesn't seem to provide a way to inject global/dynamic imports.
// Basically if we have a `require`, jest assumes that it is a module on disc.
// However `vscode` isn't a module in disc, its provided by vscode host environment.
// Hack - put vscode namespace into global variable `process`, and re-export as as mock in jest.
// Using global variables don't work, as jest seems to fiddle with that as well.
module.exports = (process as any).__VSCODE as typeof import('vscode');
