import { assert } from 'chai';
import { HeadRefParser } from '../../../../../src/adapter/parsers/refs/parsers/headRefParser';
import { IRefParser } from '../../../../../src/adapter/parsers/refs/types';
import { RefType } from '../../../../../src/types';

suite('Adapter Parser Ref - HeadRefParser', () => {
    let parser: IRefParser;
    suiteSetup(() => {
        parser = new HeadRefParser();
    });

    test('null,undefined and empty strings cannot be parsed', () => {
        assert.isFalse(parser.canParse(''), 'Parsing of empty string is not possible');
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.isFalse(parser.canParse(null as any), 'Parsing of null is not possible');
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.isFalse(parser.canParse(undefined as any), 'Parsing of undefined is not possible');
    });

    test('refs/heads/master', () => {
        const refContent = 'refs/heads/master';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'master', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.Head, 'Type is wrong');
    });

    test('HEAD -> refs/heads/master', () => {
        const refContent = 'HEAD -> refs/heads/master';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'master', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.Head, 'Type is wrong');
    });
});
