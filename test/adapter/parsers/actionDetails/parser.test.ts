import { assert } from 'chai';
import { ActionDetailsParser } from '../../../../src/adapter/parsers/actionDetails/parser';

suite('Adapter Parser ActionDetails', () => {

    test('Information is returned correctly', () => {
        const date = new Date();
        const name = `Don Jayamanne ${date.getTime()}`;
        const email = `don.jayamanne@yahoo.com ${date.getTime()}`;
        const unixTime = (date.getTime() / 1000).toString();
        const info = new ActionDetailsParser().parse(name, email, unixTime)!;
        assert.isObject(info, 'Action details not parsed');
        assert.equal(info.name, name, 'name is incorrect');
        assert.equal(info.email, email, 'email is incorrect');
        assert.equal(info.date.toLocaleDateString(), date.toLocaleDateString(), 'time is incorrect');
    });

    test('Undefined is returned if information is empty', () => {
        const info = new ActionDetailsParser().parse('', '', '')!;
        assert.isUndefined(info, 'Action details must be undefined');
    });
});
