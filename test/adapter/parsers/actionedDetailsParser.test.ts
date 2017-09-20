import * as assert from 'assert';
import actionedDetailsParser, { formatDate } from '../../../src/adapter/parsers/actionedDetailsParser';

suite('Adapter ActionedDetails Parser', () => {

    test('Information is returned correctly', () => {
        const name = `Don Jayamanne ${new Date().getTime()}`;
        const email = `don.jayamanne@yahoo.com ${new Date().getTime()}`;
        const date = new Date();
        const unixTime = (date.getTime() / 1000).toString();
        const localisedDate = formatDate(date);
        const info = actionedDetailsParser(name, email, unixTime);
        if (info) {
            assert.equal(info.name, name, 'name is incorrect');
            assert.equal(info.email, email, 'email is incorrect');
            assert.equal(info.date.toLocaleDateString(), date.toLocaleDateString(), 'time is incorrect');
            assert.equal(info.localisedDate, localisedDate, 'localised Date is incorrect');
        }
        else {
            assert.fail(info, {}, 'Expected non empty info');
        }
    });
});
