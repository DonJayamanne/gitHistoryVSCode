import { assert } from 'chai';
import { FileStatStatusParser } from '../../../../src/adapter/parsers/fileStatStatus/parser';
import { Status } from '../../../../src/types';
import { MockLogger } from '../../../mocks';

describe('Adapter Parser File Status', () => {

    it('Ensure status can be parsed correctly', () => {
        const parser = new FileStatStatusParser(new MockLogger());
        ['A', 'M', 'D', 'C', 'R', 'C1234', 'R1234', 'U', 'X', 'B', 'T'].forEach(status => {
            assert.isTrue(parser.canParse(status), `Status '${status}' must be parseable`);
        });
        ['a', 'm', 'd', 'C', 'R', 'C1234', 'R1234', 'U', 'X', 'B', 'T', 'Z', '1', '2', 'x', 'fc1234', 'eR1234'].forEach(status => {
            assert.isFalse(parser.canParse(status.toLocaleLowerCase()), `Status '${status.toLocaleLowerCase()}' must not be parseable`);
        });
    });

    it('Ensure status is parsed correctly', () => {
        const parser = new FileStatStatusParser(new MockLogger());
        const statuses = [['A', Status.Added], ['M', Status.Modified],
        ['D', Status.Deleted], ['C', Status.Copied],
        ['R', Status.Renamed], ['C1234', Status.Copied],
        ['U', Status.Unmerged], ['X', Status.Unknown],
        ['B', Status.Broken], ['T', Status.TypeChanged],
        ['R1234', Status.Renamed]];
        statuses.forEach(status => {
            // tslint:disable-next-line:no-any prefer-type-cast
            assert.equal(parser.parse(status[0] as any as string), status[1] as Status, `Status '${status[0]}' not parsed correctly`);
        });
    });
});
