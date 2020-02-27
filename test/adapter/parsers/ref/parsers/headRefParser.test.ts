import { assert } from 'chai';
import { HeadRefParser } from '../../../../../src/adapter/parsers/refs/parsers/headRefParser';
import { IRefParser } from '../../../../../src/adapter/parsers/refs/types';
import { RefType } from '../../../../../src/types';

describe('Adapter Parser Ref - HeadRefParser', () => {
    let parser: IRefParser;
    before(() => {
        parser = new HeadRefParser();
    });

    it('null,undefined and empty strings cannot be parsed', () => {
        assert.isFalse(parser.canParse(''), 'Parsing of empty string is not possible');
                assert.isFalse(parser.canParse(null as any), 'Parsing of null is not possible');
                assert.isFalse(parser.canParse(undefined as any), 'Parsing of undefined is not possible');
    });

    it('refs/heads/master', () => {
        const refContent = 'refs/heads/master';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'master', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.Head, 'Type is wrong');
    });

    it('HEAD -> refs/heads/master', () => {
        const refContent = 'HEAD -> refs/heads/master';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'master', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.Head, 'Type is wrong');
    });
});
