// tslint:disable-next-line:no-any
if ((Reflect as any).metadata === undefined) {
    // tslint:disable-next-line:no-require-imports no-var-requires
    require('reflect-metadata');
}
import { MochaSetupOptions } from 'vscode/lib/testrunner';
import * as testRunner from './testRunner';
process.env.VSC_GITHISTORY_CI_TEST = '1';

// You can directly control Mocha options by uncommenting the following lines.
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info.
// Hack, as retries is not supported as setting in tsd.
// tslint:disable-next-line:no-any
const options: MochaSetupOptions = {
    ui: 'bdd',
    useColors: true
};
testRunner.configure(options, { coverageConfig: '../coverconfig.json' });
module.exports = testRunner;
