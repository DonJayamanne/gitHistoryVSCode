import { assert } from 'chai';
import * as path from 'path';
import { Uri } from 'vscode';
import { Status } from '../../../../src/adapter/contracts';
import { FileStatParser } from '../../../../src/adapter/parsers/fileStat/parser';
import { FileStatStatusParser } from '../../../../src/adapter/parsers/fileStatStatus/parser';

suite('Adapter Parser File Stat', () => {
    const gitRootPath = path.join('src', 'adapter');
    const statusParser = new FileStatStatusParser();
    test('Must return the right number of files', () => {
        // tslint:disable-next-line:no-multiline-string
        const numStatFileLog = ['1       1       package.json',
            '1       1       src/adapter/ioc.ts',
            '8       0       src/adapter/parsers/constants.ts',
            '24      22      src/adapter/parsers/ioc.ts'];
        const nameStatusFileLog = ['M       package.json',
            'M       src/adapter/ioc.ts',
            'A       src/adapter/parsers/constants.ts',
            'M       src/adapter/parsers/ioc.ts'];

        const parser = new FileStatParser(gitRootPath, statusParser);
        const files = parser.parse(numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 4, 'Incorrect number of entries');
    });
    test('Must have the right number of additions, deletions and right status (using spaces as column separators)', () => {
        // tslint:disable-next-line:no-multiline-string
        const numStatFileLog = ['1       1       package.json',
            '8       0       src/adapter/parsers/constants.ts',
            '24      22      src/adapter/parsers/ioc.ts'];
        const nameStatusFileLog = ['M       package.json',
            'A       src/adapter/parsers/constants.ts',
            'M       src/adapter/parsers/ioc.ts'];

        const parser = new FileStatParser(gitRootPath, statusParser);
        const files = parser.parse(numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 3, 'Incorrect number of entries');

        assert.equal(files[0].additions, 1, '0. Incorrect number of additions');
        assert.equal(files[0].deletions, 1, '0. Incorrect number of deletions');
        assert.equal(files[0].status, Status.Modified, '0. Incorrect Status');

        assert.equal(files[1].additions, 8, '1. Incorrect number of additions');
        assert.equal(files[1].deletions, 0, '1. Incorrect number of deletions');
        assert.equal(files[1].status, Status.Added, '1. Incorrect Status');
    });
    test('Must have the right number of additions, deletions and right status (using tabs as column separators)', () => {
        // tslint:disable-next-line:no-multiline-string
        const numStatFileLog = ['1	1	package.json',
            '8	0	src/adapter/parsers/constants.ts',
            '24	22	src/adapter/parsers/ioc.ts'];
        const nameStatusFileLog = ['M	package.json',
            'A	src/adapter/parsers/constants.ts',
            'M	src/adapter/parsers/ioc.ts'];

        const parser = new FileStatParser(gitRootPath, statusParser);
        const files = parser.parse(numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 3, 'Incorrect number of entries');

        assert.equal(files[0].additions, 1, '0. Incorrect number of additions');
        assert.equal(files[0].deletions, 1, '0. Incorrect number of deletions');
        assert.equal(files[0].status, Status.Modified, '0. Incorrect Status');

        assert.equal(files[1].additions, 8, '1. Incorrect number of additions');
        assert.equal(files[1].deletions, 0, '1. Incorrect number of deletions');
        assert.equal(files[1].status, Status.Added, '1. Incorrect Status');
    });
    test('Must have the right paths', () => {
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

        const parser = new FileStatParser(gitRootPath, statusParser);
        const files = parser.parse(numStatFileLog, nameStatusFileLog);
        assert.lengthOf(files, 3, 'Incorrect number of entries');
        assert.equal(files[0].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[0])).fsPath, '0. Incorrect path');
        assert.equal(files[1].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[1])).fsPath, '1. Incorrect path');
        assert.equal(files[2].uri.fsPath, Uri.file(path.join(gitRootPath, filePaths[2])).fsPath, '2. Incorrect path');
    });
});
