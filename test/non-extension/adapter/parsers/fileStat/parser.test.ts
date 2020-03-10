import { assert, expect } from 'chai';
import * as path from 'path';
import * as TypeMoq from 'typemoq';
import { Uri } from 'vscode';
import { FileStatParser } from '../../../../../src/adapter/parsers/fileStat/parser';
import { FileStatStatusParser } from '../../../../../src/adapter/parsers/fileStatStatus/parser';
import { IFileStatStatusParser } from '../../../../../src/adapter/parsers/types';
import { ILogService } from '../../../../../src/common/types';
import { Status } from '../../../../../src/types';
import { TestServiceContainer } from '../../../../mocks';

describe('Adapter Parser File Stat', () => {
    const gitRootPath = path.join('src', 'adapter');
    const svcContainer = new TestServiceContainer();
    beforeAll(() => {
        svcContainer.add(IFileStatStatusParser, FileStatStatusParser);
        svcContainer.addSingletonInstance(ILogService, TypeMoq.Mock.ofType<ILogService>().object);
    });
    test('Must return the right number of files', () => {
        const numStatFileLog = [
            '1\t1\tpackage.json',
            '1\t1\tsrc/adapter/ioc.ts',
            '8\t0\tsrc/adapter/parsers/constants.ts',
            '24\t22\tsrc/adapter/parsers/ioc.ts',
        ];
        const nameStatusFileLog = [
            'M\tpackage.json',
            'M\tsrc/adapter/ioc.ts',
            'A\tsrc/adapter/parsers/constants.ts',
            'M\tsrc/adapter/parsers/ioc.ts',
        ];

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        expect(files).to.have.length(4, 'Incorrect number of entries');
    });
    test('Must have the right number of additions, deletions and right status (using spaces as column separators)', () => {
        const numStatFileLog = [
            '1\t1\tpackage.json',
            '8\t0\tsrc/adapter/parsers/constants.ts',
            '24\t22\tsrc/adapter/parsers/ioc.ts',
        ];
        const nameStatusFileLog = [
            'M\tpackage.json',
            'A\tsrc/adapter/parsers/constants.ts',
            'M\tsrc/adapter/parsers/ioc.ts',
        ];

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
    test('Must have the right number of additions, deletions and right status (using tabs as column separators)', () => {
        const numStatFileLog = [
            '1\t1\tpackage.json',
            '8\t0\tsrc/adapter/parsers/constants.ts',
            '24\t22\tsrc/adapter/parsers/ioc.ts',
        ];
        const nameStatusFileLog = [
            'M\tpackage.json',
            'A\tsrc/adapter/parsers/constants.ts',
            'M\tsrc/adapter/parsers/ioc.ts',
        ];

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
    test('Must have the right paths', () => {
        const filePaths = [
            'package.json',
            path.join('src', 'adapter', 'parsers', 'constants.ts'),
            path.join('src', 'adapter', 'parsers', 'ioc.ts'),
        ];
        const numStatFileLog = [`1\t1\t${filePaths[0]}`, `8\t0\t${filePaths[1]}`, `24\t22\t${filePaths[2]}`];
        const nameStatusFileLog = [`M\t${filePaths[0]}`, `A\t${filePaths[1]}`, `M\t${filePaths[2]}`];

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 3, 'Incorrect number of entries');
        assert.equal(files[0].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[0])).fsPath, '0. Incorrect path');
        assert.equal(files[1].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[1])).fsPath, '1. Incorrect path');
        assert.equal(files[2].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[2])).fsPath, '2. Incorrect path');
    });
    test('Must correctly identify copied files', () => {
        const filePaths = [
            'src/client/{common/comms => }/Socket Stream.ts',
            'src/client/common/{space in folder => comms}/id Dispenser.ts',
            'src/client/common/space in folder/{idDispenser.ts => id Dispenser.ts}',
            'src/client/common/comms/{ => another dir}/id Dispenser.ts',
            'src/{test/autocomplete => client/common/comms/another dir}/base.test.ts',
            '{client/common/comms/another dir => }/id Dispenser.ts',
            'LICENSE => LICENSEx',
        ];
        const numStatFileLog = filePaths.map(f => `1\t2\t${f}`);
        const nameStatusFileLog = filePaths.map((f, idx) => `${idx % 2 === 0 ? 'C123' : 'R01'}\t${f}`);

        const parser = new FileStatParser(svcContainer);
        const files = parser.parse(gitRootPath, numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, filePaths.length, 'Incorrect number of entries');

        assert.equal(
            files[0].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'Socket Stream.ts'])).fsPath,
            '0. Incorrect current path',
        );
        assert.equal(
            files[0].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'Socket Stream.ts'])).fsPath,
            '0. Incorrect original path',
        );

        assert.equal(
            files[1].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'id Dispenser.ts'])).fsPath,
            '1. Incorrect current path',
        );
        assert.equal(
            files[1].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'space in folder', 'id Dispenser.ts']))
                .fsPath,
            '1. Incorrect original path',
        );

        assert.equal(
            files[2].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'space in folder', 'id Dispenser.ts']))
                .fsPath,
            '2. Incorrect current path',
        );
        assert.equal(
            files[2].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'space in folder', 'idDispenser.ts']))
                .fsPath,
            '2. Incorrect original path',
        );

        assert.equal(
            files[3].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'another dir', 'id Dispenser.ts']))
                .fsPath,
            '3. Incorrect current path',
        );
        assert.equal(
            files[3].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'id Dispenser.ts'])).fsPath,
            '3. Incorrect original path',
        );

        assert.equal(
            files[4].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'client', 'common', 'comms', 'another dir', 'base.test.ts']))
                .fsPath,
            '4. Incorrect current path',
        );
        assert.equal(
            files[4].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['src', 'test', 'autocomplete', 'base.test.ts'])).fsPath,
            '4. Incorrect original path',
        );

        assert.equal(
            files[5].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['id Dispenser.ts'])).fsPath,
            '5. Incorrect current path',
        );
        assert.equal(
            files[5].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['client', 'common', 'comms', 'another dir', 'id Dispenser.ts'])).fsPath,
            '5. Incorrect original path',
        );

        assert.equal(
            files[6].uri.fsPath,
            Uri.file(path.join(gitRootPath, ...['LICENSEx'])).fsPath,
            '6. Incorrect current path',
        );
        assert.equal(
            files[6].oldUri!.fsPath,
            Uri.file(path.join(gitRootPath, ...['LICENSE'])).fsPath,
            '6. Incorrect original path',
        );
    });
});
