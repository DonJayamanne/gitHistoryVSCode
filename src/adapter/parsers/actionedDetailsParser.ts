import { env } from 'vscode';
import { ActionedDetails } from '../git';

export default function parsedActionedDetails(name: string, email: string, unixTime: string): ActionedDetails | undefined {
    if (name.trim().length === 0 || unixTime.trim().length === 0) {
        return;
    }

    const time = parseInt(unixTime, 10);
    const date = new Date(time * 1000);
    const localisedDate = formatDate(date);

    return {
        date, localisedDate,
        email, name
    };
}

export function formatDate(date: Date) {
    const lang = env.language;
    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleString(lang, dateOptions);
}
