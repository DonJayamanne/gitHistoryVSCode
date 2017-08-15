import { ActionedDetails } from '../git';
import { env } from 'vscode';

export default function parsedActionedDetails(name: string, email: string, unixTime: string): ActionedDetails | undefined {
    if (name.trim().length === 0 || unixTime.trim().length === 0) {
        return;
    }

    let time = parseInt(unixTime);
    let date = new Date(time * 1000);
    let localisedDate = formatDate(date);

    return {
        date, localisedDate,
        email, name
    };
}

function formatDate(date: Date) {
    let lang = env.language;
    let dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    return date.toLocaleString(lang, dateOptions);
}