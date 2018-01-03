import { injectable } from 'inversify';
import { ActionedDetails } from '../../../types';
import { IActionDetailsParser } from '../types';

@injectable()
export class ActionDetailsParser implements IActionDetailsParser {
    public parse(name: string, email: string, unixTime: string): ActionedDetails | undefined {
        name = (name || '').trim();
        unixTime = (unixTime || '').trim();
        if (name.length === 0 || unixTime.length === 0) {
            return;
        }

        const time = parseInt(unixTime, 10);
        const date = new Date(time * 1000);
        return {
            date, email, name
        };
    }
}
