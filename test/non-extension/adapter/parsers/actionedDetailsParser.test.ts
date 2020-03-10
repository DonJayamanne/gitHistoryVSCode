import * as assert from 'assert';
import { ActionDetailsParser } from '../../../../src/adapter/parsers/actionDetails/parser';

describe('Adapter ActionedDetails Parser', () => {
    test('Information is returned correctly', () => {
        const name = `Don Jayamanne ${new Date().getTime()}`;
        const email = `don.jayamanne@yahoo.com ${new Date().getTime()}`;
        const date = new Date();
        const unixTime = (date.getTime() / 1000).toString();
        // const localisedDate = ''; // formatDate(date);
        const info = new ActionDetailsParser().parse(name, email, unixTime);
        if (info) {
            assert.equal(info.name, name, 'name is incorrect');
            assert.equal(info.email, email, 'email is incorrect');
            assert.equal(info.date.toLocaleDateString(), date.toLocaleDateString(), 'time is incorrect');
        } else {
            assert.fail(info, {}, 'Expected non empty info', '=');
        }
    });
});
