import { assert } from 'chai';
import { Container } from 'inversify';
// import { IRefsParser } from 'adapter/parsers';
// import { IRefsParser } from 'adapter/parsers/types';
import { TYPES as parserTYPES } from '../../../../src/adapter/parsers/constants';
import { containerModule as parserContainer } from '../../../../src/adapter/parsers/ioc';
import { IRefParser, RefsParser } from '../../../../src/adapter/parsers/refs/parser';
// import { RefsParser, IRefParser } from 'adapter/parsers/refs/parser';
import { HeadRefParser } from '../../../../src/adapter/parsers/refs/parsers/headRefParser';
import { RemoteHeadParser } from '../../../../src/adapter/parsers/refs/parsers/remoteHeadParser';
import { IRefsParser } from '../../../../src/adapter/parsers/types';
import { ILogService } from '../../../../src/common/log';
import { TYPES as coreTYPES } from '../../../../src/constants';
import { RefType } from '../../../../src/types';
import { MockLogger } from '../../../mocks';

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
        const container = new Container();
        container.load(parserContainer);

        const parsers = container.getAll<IRefParser>(parserTYPES.IRefParser);
        assert.lengthOf(parsers, 3, 'Should return three items');

        container.bind<ILogService>(coreTYPES.ILogService).to(MockLogger);
        const refsParser = container.get<IRefsParser>(parserTYPES.IRefsParser);
        assert.isObject(refsParser, 'RefsParser not resolved');
    });
});
