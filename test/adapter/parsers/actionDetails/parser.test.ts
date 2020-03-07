import { expect } from 'chai';
import { ActionDetailsParser } from '../../../../src/adapter/parsers/actionDetails/parser';

describe('Adapter Parser ActionDetails', () => {
    test('Information is returned correctly', () => {
        const date = new Date();
        const name = `Don Jayamanne ${date.getTime()}`;
        const email = `don.jayamanne@yahoo.com ${date.getTime()}`;
        const unixTime = (date.getTime() / 1000).toString();
        const info = new ActionDetailsParser().parse(name, email, unixTime)!;
        expect(info).to.have.property('email', email, 'email property not in parsed details');
        expect(info).to.have.property('name', name, 'name property not in parsed details');
        expect(info.date.toLocaleDateString()).is.equal(date.toLocaleDateString(), 'time is incorrect');
    });

    test('Undefined is returned if information is empty', () => {
        const info = new ActionDetailsParser().parse('', '', '')!;
        expect(info).to.be.an('undefined', 'Action details must be undefined');
    });
});
