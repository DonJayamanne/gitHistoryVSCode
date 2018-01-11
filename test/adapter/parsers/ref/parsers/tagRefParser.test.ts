import { assert } from 'chai';
import { TagRefParser } from '../../../../../src/adapter/parsers/refs/parsers/tagRefParser';
import { IRefParser } from '../../../../../src/adapter/parsers/refs/types';
import { RefType } from '../../../../../src/types';

describe('Adapter Parser Ref - TagRefParser', () => {
    let parser: IRefParser;
    before(() => {
        parser = new TagRefParser();
    });

    it('null,undefined and empty strings cannot be parsed', () => {
        assert.isFalse(parser.canParse(''), 'Parsing of empty string is not possible');
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.isFalse(parser.canParse(null as any), 'Parsing of null is not possible');
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.isFalse(parser.canParse(undefined as any), 'Parsing of undefined is not possible');
    });

    it('refs/tags/translation/20170127.01', () => {
        const refContent = 'refs/tags/translation/20170127.01';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'translation/20170127.01', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.Tag, 'Type is wrong');
    });

    it('tag: refs/tags/0.2.0', () => {
        const refContent = 'tag: refs/tags/0.2.0';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, '0.2.0', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.Tag, 'Type is wrong');
    });
});
