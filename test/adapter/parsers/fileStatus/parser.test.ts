import { assert } from 'chai';
import { Status } from '../../../../src/adapter/contracts';
import { FileStatStatusParser } from '../../../../src/adapter/parsers/fileStatStatus/parser';

suite('Adapter Parser File Status', () => {

    test('Ensure status can be parsed correctly', () => {
        const parser = new FileStatStatusParser();
        ['A', 'M', 'D', 'C', 'R', 'C1234', 'R1234'].forEach(status => {
            assert.isTrue(parser.canParse(status), `Status '${status}' must be parseable`);
        });
        ['', 'Z', '1', '2', 'x', 'fc1234', 'eR1234'].forEach(status => {
            assert.isFalse(parser.canParse(status), `Status '${status}' must not be parseable`);
        });
    });

    test('Ensure status is parsed correctly', () => {
        const parser = new FileStatStatusParser();
        const statuses = [['A', Status.Added], ['M', Status.Modified],
        ['D', Status.Deleted], ['C', Status.Copied],
        ['R', Status.Renamed], ['C1234', Status.Copied],
        ['R1234', Status.Renamed]];
        statuses.forEach(status => {
            // tslint:disable-next-line:no-any prefer-type-cast
            assert.equal(parser.parse(status[0] as any as string), status[1] as Status, `Status '${status[0]}' not parsed correctly`);
        });
    });
});
