import { assert, expect } from 'chai';
import * as path from 'path';
import { Uri } from 'vscode';
import { FileStatParser } from '../../../../src/adapter/parsers/fileStat/parser';
import { FileStatStatusParser } from '../../../../src/adapter/parsers/fileStatStatus/parser';
import { IFileStatStatusParser } from '../../../../src/adapter/parsers/types';
import { ILogService } from '../../../../src/common/types';
import { Status } from '../../../../src/types';
import { MockLogger, MockServiceContainer } from '../../../mocks';

// tslint:disable-next-line:max-func-body-length
describe('Adapter Parser File Stat', () => {
    // tslint:disable-next-line:mocha-no-side-effect-code
    const gitRootPath = path.join('src', 'adapter');
    // tslint:disable-next-line:mocha-no-side-effect-code
    const svcContainer = new MockServiceContainer();
    before(() => {
        svcContainer.add(IFileStatStatusParser, FileStatStatusParser);
        svcContainer.add(ILogService, MockLogger);
    });
    it('Must return the right number of files', () => {
        // tslint:disable-next-line:no-multiline-string
        const numStatFileLog = ['1       1       package.json',
            '1       1       src/adapter/ioc.ts',
            '8       0       src/adapter/parsers/constants.ts',
            '24      22      src/adapter/parsers/ioc.ts'];
        const nameStatusFileLog = ['M       package.json',
            'M       src/adapter/ioc.ts',
            'A       src/adapter/parsers/constants.ts',
            'M       src/adapter/parsers/ioc.ts'];

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        expect(files).to.have.length(4, 'Incorrect number of entries');
    });
    it('Must have the right number of additions, deletions and right status (using spaces as column separators)', () => {
        // tslint:disable-next-line:no-multiline-string
        const numStatFileLog = ['1       1       package.json',
            '8       0       src/adapter/parsers/constants.ts',
            '24      22      src/adapter/parsers/ioc.ts'];
        const nameStatusFileLog = ['M       package.json',
            'A       src/adapter/parsers/constants.ts',
            'M       src/adapter/parsers/ioc.ts'];

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        expect(files).to.have.length(3, 'Incorrect number of entries');

        assert.equal(files[0].additions, 1, '0. Incorrect number of additions');
        assert.equal(files[0].deletions, 1, '0. Incorrect number of deletions');
        assert.equal(files[0].status, Status.Modified, '0. Incorrect Status');

        assert.equal(files[1].additions, 8, '1. Incorrect number of additions');
        assert.equal(files[1].deletions, 0, '1. Incorrect number of deletions');
        assert.equal(files[1].status, Status.Added, '1. Incorrect Status');
    });
    it('Must have the right number of additions, deletions and right status (using tabs as column separators)', () => {
        // tslint:disable-next-line:no-multiline-string
        const numStatFileLog = ['1	1	package.json',
            '8	0	src/adapter/parsers/constants.ts',
            '24	22	src/adapter/parsers/ioc.ts'];
        const nameStatusFileLog = ['M	package.json',
            'A	src/adapter/parsers/constants.ts',
            'M	src/adapter/parsers/ioc.ts'];

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 3, 'Incorrect number of entries');

        assert.equal(files[0].additions, 1, '0. Incorrect number of additions');
        assert.equal(files[0].deletions, 1, '0. Incorrect number of deletions');
        assert.equal(files[0].status, Status.Modified, '0. Incorrect Status');

        assert.equal(files[1].additions, 8, '1. Incorrect number of additions');
        assert.equal(files[1].deletions, 0, '1. Incorrect number of deletions');
        assert.equal(files[1].status, Status.Added, '1. Incorrect Status');
    });
    it('Must have the right paths', () => {
        // tslint:disable-next-line:no-multiline-string
        const filePaths = ['package.json',
            path.join('src', 'adapter', 'parsers', 'constants.ts'),
            path.join('src', 'adapter', 'parsers', 'ioc.ts')];
        const numStatFileLog = [`1       1       ${filePaths[0]}`,
        `8       0       ${filePaths[1]}`,
        `24      22      ${filePaths[2]}`];
        const nameStatusFileLog = [`M       ${filePaths[0]}`,
        `A       ${filePaths[1]}`,
        `M       ${filePaths[2]}`];

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 3, 'Incorrect number of entries');
        assert.equal(files[0].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[0])).fsPath, '0. Incorrect path');
        assert.equal(files[1].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[1])).fsPath, '1. Incorrect path');
        assert.equal(files[2].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[2])).fsPath, '2. Incorrect path');
    });
    it('Must correctly identify copied files', () => {

        // src/client/{common/comms => }/Socket Stream.ts
        // src/client/common/{space in folder => comms}/id Dispenser.ts
        // src/client/common/space in folder/{idDispenser.ts => id Dispenser.ts}
        // src/client/common/{comms => space in folder}/SocketStream.ts
        // src/client/common/{comms => }/socketCallbackHandler.ts
        // src/client/common/comms/{ => another dir}/id Dispenser.ts
        // src/{test/autocomplete => client/common/comms/another dir}/base.test.ts
        // src/{client/common/comms/another dir => }/id Dispenser.ts
        // src/test/jupyter/{extension.jupyter.comms.jupyterKernelManager.test.ts => jupyterKernelManager.test.ts}

        // tslint:disable-next-line:no-multiline-string
        const filePaths = [
            'src/client/{common/comms => }/Socket Stream.ts',
            'src/client/common/{space in folder => comms}/id Dispenser.ts',
            'src/client/common/space in folder/{idDispenser.ts => id Dispenser.ts}',
            'src/client/common/comms/{ => another dir}/id Dispenser.ts',
            'src/{test/autocomplete => client/common/comms/another dir}/base.test.ts',
            '{client/common/comms/another dir => }/id Dispenser.ts',
            'LICENSE => LICENSEx'
        ];
        const numStatFileLog = filePaths.map(f => `1 2 ${f}`);
        const nameStatusFileLog = filePaths.map((f, idx) => `${idx % 2 === 0 ? 'C123' : 'R01'} ${f}`);

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, filePaths.length, 'Incorrect number of entries');

        assert.equal(files[0].uri.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'Socket Stream.ts'])).fsPath, '0. Incorrect current path');
        assert.equal(files[0].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'Socket Stream.ts'])).fsPath, '0. Incorrect original path');

        assert.equal(files[1].uri.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'id Dispenser.ts'])).fsPath, '1. Incorrect current path');
        assert.equal(files[1].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'space in folder', 'id Dispenser.ts'])).fsPath, '1. Incorrect original path');

        assert.equal(files[2].uri.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'space in folder', 'id Dispenser.ts'])).fsPath, '2. Incorrect current path');
        assert.equal(files[2].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'space in folder', 'idDispenser.ts'])).fsPath, '2. Incorrect original path');

        assert.equal(files[3].uri.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'another dir', 'id Dispenser.ts'])).fsPath, '3. Incorrect current path');
        assert.equal(files[3].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'id Dispenser.ts'])).fsPath, '3. Incorrect original path');

        assert.equal(files[4].uri.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'another dir', 'base.test.ts'])).fsPath, '4. Incorrect current path');
        assert.equal(files[4].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['src', 'test', 'autocomplete', 'base.test.ts'])).fsPath, '4. Incorrect original path');

        assert.equal(files[5].uri.fsPath, Uri.file(path.join(gitRootPath, ...['id Dispenser.ts'])).fsPath, '5. Incorrect current path');
        assert.equal(files[5].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['client', 'common', 'comms', 'another dir', 'id Dispenser.ts'])).fsPath, '5. Incorrect original path');

        assert.equal(files[6].uri.fsPath, Uri.file(path.join(gitRootPath, ...['LICENSEx'])).fsPath, '6. Incorrect current path');
        assert.equal(files[6].oldUri!.fsPath, Uri.file(path.join(gitRootPath, ...['LICENSE'])).fsPath, '6. Incorrect original path');
    });
});
