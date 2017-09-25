import { assert } from 'chai';
import { RefType } from '../../../../src/adapter';
import { IRefsParser } from '../../../../src/adapter/parsers/contracts';
import { container, TYPES } from '../../../../src/adapter/parsers/refs/ioc';
import { RefsParser, IRefParser } from '../../../../src/adapter/parsers/refs/parser';
import { HeadRefParser } from '../../../../src/adapter/parsers/refs/parsers/headRefParser';
import { RemoteHeadParser } from '../../../../src/adapter/parsers/refs/parsers/remoteHeadParser';
import { ILogService } from '../../../../src/common/log';

class MockLogger implements ILogService {
    // tslint:disable-next-line:no-any
    public log(...args: any[]): void {
        return;
    }
    // tslint:disable-next-line:no-any
    public warn(...args: any[]): void {
        return;
    }
    // tslint:disable-next-line:no-any
    public error(...args: any[]): void {
        return;
    }
}

suite('Adapter Parser Ref', () => {
    test('null,undefined and empty strings cannot be parsed', () => {
        const parser = new RefsParser([new HeadRefParser()], new MockLogger());
        // tslint:disable-next-line:prefer-type-cast no-any
        assert.lengthOf(parser.parse(null as any), 0, 'Should return an empty list');
    });

    test('refs/heads/master', () => {
        const refContent = 'refs/heads/master';
        const parser = new RefsParser([new HeadRefParser()], new MockLogger());
        assert.lengthOf(parser.parse(refContent), 1, 'Should return one item');
        assert.equal(parser.parse(refContent)[0].name, 'master', 'name is incorrect');
        assert.equal(parser.parse(refContent)[0].type, RefType.Head, 'type is incorrect');
    });

    test('refs/heads/master, HEAD -> refs/heads/master', () => {
        const refContent = 'refs/heads/master,HEAD -> refs/heads/master,refs/remotes/origin/HEAD';
        const parser = new RefsParser([new HeadRefParser(), new RemoteHeadParser()], new MockLogger());
        const refs = parser.parse(refContent);
        assert.lengthOf(refs, 3, 'Should return one item');
        assert.equal(refs[0].name, 'master', 'head name is incorrect');
        assert.equal(refs[2].name, 'origin/HEAD', 'remote name is incorrect');
        assert.equal(refs[0].type, RefType.Head, 'head not detected');
        assert.equal(refs[2].type, RefType.RemoteHead, 'remote not detected');
    });

    test('ioc', () => {
        const refContent = 'refs/heads/master,HEAD -> refs/heads/master,refs/remotes/origin/HEAD';
        const x = container.getAll<IRefParser>(TYPES.IRefParser);
        const y = x;
        // const parser = container.get<IRefsParser>(TYPES.IRefsParser);
        // const refs = parser.parse(refContent);
        // assert.lengthOf(refs, 3, 'Should return one item');
        // assert.equal(refs[0].name, 'master', 'head name is incorrect');
        // assert.equal(refs[2].name, 'origin/HEAD', 'remote name is incorrect');
        // assert.equal(refs[0].type, RefType.Head, 'head not detected');
        // assert.equal(refs[2].type, RefType.RemoteHead, 'remote not detected');
    });
});
