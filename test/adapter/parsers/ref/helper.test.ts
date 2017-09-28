import { assert } from 'chai';
import { HEAD_REF_PREFIXES, REMOTE_REF_PREFIXES, TAG_REF_PREFIXES } from '../../../../src/adapter/parsers/refs/constants';
import { getRemoteHeadName, isRemoteHead } from '../../../../src/adapter/parsers/refs/helpers';

suite('Adapter Parser Ref Helper', () => {
    test('Must correctly identify remote heads', () => {
        assert.isFalse(isRemoteHead(''), 'Empty string incorrectly identified as a remote head');
        // tslint:disable-next-line:no-any prefer-type-cast
        assert.isFalse(isRemoteHead(null as any), 'null string incorrectly identified as a remote head');
        // tslint:disable-next-line:no-any prefer-type-cast
        assert.isFalse(isRemoteHead(undefined as any), 'undefined string incorrectly identified as a remote head');

        REMOTE_REF_PREFIXES.concat(...['remotes/origin/HEAD -> blah  ', 'refs/remotes/Branch Name', 'remotes/origin']).forEach(refContent => {
            assert.isTrue(isRemoteHead(refContent), `'${refContent}' not identified as a remote head`);
        });

        HEAD_REF_PREFIXES.concat(...TAG_REF_PREFIXES).forEach(refContent => {
            assert.isFalse(isRemoteHead(refContent), `'${refContent}' incorrectly identified as a remote head`);
        });
    });

    test('Must extract remote head names', () => {
        assert.isEmpty(getRemoteHeadName(''), 'Empty string cannot have a ref name');
        // tslint:disable-next-line:no-any prefer-type-cast
        assert.isEmpty(getRemoteHeadName(null as any), 'null string cannot have a ref name');
        // tslint:disable-next-line:no-any prefer-type-cast
        assert.isEmpty(getRemoteHeadName(undefined as any), 'undefined string cannot have a ref name');

        REMOTE_REF_PREFIXES.concat(...['remotes/origin/HEAD -> ', 'refs/remotes/', 'remotes/']).forEach(refContent => {
            const name = 'Sample Name';
            const remoteName = getRemoteHeadName(`${refContent}${name}`);
            assert.equal(remoteName, name, `'${name}' not identified as a remote head from ref content ${refContent}`);
        });

        HEAD_REF_PREFIXES.concat(...TAG_REF_PREFIXES).forEach(refContent => {
            const name = 'Sample Name';
            const remoteName = getRemoteHeadName(`${refContent}${name}`);
            assert.notEqual(remoteName, name, `'${name}' is identified as a remote head from ref content ${refContent}`);
        });
    });
});
