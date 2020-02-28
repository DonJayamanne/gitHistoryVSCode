if ((Reflect as any).metadata === undefined) {
        require('reflect-metadata');
}

import * as testRunner from './testRunner';
import { MochaOptions } from 'mocha';
process.env.VSC_GITHISTORY_CI_TEST = '1';

// You can directly control Mocha options by uncommenting the following lines.
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info.
// Hack, as retries is not supported as setting in tsd.
const options: MochaOptions = {
    ui: 'bdd',
    useColors: true
};
testRunner.configure(options, { coverageConfig: '../coverconfig.json' });
module.exports = testRunner;
