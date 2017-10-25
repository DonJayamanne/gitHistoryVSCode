import { assert } from 'chai';
import { RefsParser } from '../../../../src/adapter/parsers/refs/parser';
import { HeadRefParser } from '../../../../src/adapter/parsers/refs/parsers/headRefParser';
import { RemoteHeadParser } from '../../../../src/adapter/parsers/refs/parsers/remoteHeadParser';
import { RefType } from '../../../../src/types';
import { MockLogger } from '../../../mocks';

describe('Adapter Parser Ref', () => {
    it('null,undefined and empty strings cannot be parsed', () => {
        const parser = new RefsParser([new HeadRefParser()], [new MockLogger()]);
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.lengthOf(parser.parse(null as any), 0, 'Should return an empty list');
    });

    it('refs/heads/master', () => {
        const refContent = 'refs/heads/master';
        const parser = new RefsParser([new HeadRefParser()], [new MockLogger()]);
        assert.lengthOf(parser.parse(refContent), 1, 'Should return one item');
        assert.equal(parser.parse(refContent)[0].name, 'master', 'name is incorrect');
        assert.equal(parser.parse(refContent)[0].type, RefType.Head, 'type is incorrect');
    });

    it('refs/heads/master, HEAD -> refs/heads/master', () => {
        const refContent = 'refs/heads/master,HEAD -> refs/heads/master,refs/remotes/origin/HEAD';
        const parser = new RefsParser([new HeadRefParser(), new RemoteHeadParser()], [new MockLogger()]);
        const refs = parser.parse(refContent);
        assert.lengthOf(refs, 3, 'Should return one item');
        assert.equal(refs[0].name, 'master', 'head name is incorrect');
        assert.equal(refs[2].name, 'origin/HEAD', 'remote name is incorrect');
        assert.equal(refs[0].type, RefType.Head, 'head not detected');
        assert.equal(refs[2].type, RefType.RemoteHead, 'remote not detected');
    });
});
