import { assert } from 'chai';
import { RefType } from '../../../../../src/adapter/contracts';
import { IRefParser } from '../../../../../src/adapter/parsers/refs/contracts';
import { RemoteHeadParser } from '../../../../../src/adapter/parsers/refs/parsers/remoteHeadParser';

suite('Adapter Parser Ref - RemoteHeadParser', () => {
    let parser: IRefParser;
    suiteSetup(() => {
        parser = new RemoteHeadParser();
    });

    test('null,undefined and empty strings cannot be parsed', () => {
        assert.isFalse(parser.canParse(''), 'Parsing of empty string is not possible');
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.isFalse(parser.canParse(null as any), 'Parsing of null is not possible');
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.isFalse(parser.canParse(undefined as any), 'Parsing of undefined is not possible');
    });

    test('refs/remotes/origin/HEAD', () => {
        const refContent = 'refs/remotes/origin/HEAD';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'origin/HEAD', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.RemoteHead, 'Type is wrong');
    });

    test('refs/remotes/origin/sandy081/refactorWorkspace', () => {
        const refContent = 'refs/remotes/origin/sandy081/refactorWorkspace';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'origin/sandy081/refactorWorkspace', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.RemoteHead, 'Type is wrong');
    });

    test('remotes/origin/HEAD -> origin/master', () => {
        const refContent = 'remotes/origin/HEAD -> origin/master';
        assert.isTrue(parser.canParse(refContent), 'Parsing failed');
        assert.isObject(parser.parse(refContent), 'Should be an object');
        assert.equal(parser.parse(refContent).name, 'origin/master', 'Name is wrong');
        assert.equal(parser.parse(refContent).type, RefType.RemoteHead, 'Type is wrong');
    });
});
