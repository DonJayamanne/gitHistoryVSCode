import { injectable } from 'inversify';
import { EOL } from 'os';
import { LogEntry } from '../types';
import { ICommitViewFormatter } from './types';

@injectable()
export class CommitViewFormatter implements ICommitViewFormatter {
    public format(item: LogEntry): string {
        const sb: string[] = [];

        if (item.hash && item.hash.full) {
            sb.push(`sha1 : ${item.hash.full}`);
        }
        if (item.author) {
            sb.push(this.formatAuthor(item));
        }
        if (item.author && item.author.date) {
            const authorDate = item.author!.date!.toLocaleString();
            sb.push(`Author Date : ${authorDate}`);
        }
        if (item.committer) {
            sb.push(`Committer : ${item.committer.name} <${item.committer.email}>`);
        }
        if (item.committer && item.committer.date) {
            const committerDate = item.committer!.date!.toLocaleString();
            sb.push(`Commit Date : ${committerDate}`);
        }
        if (item.subject) {
            sb.push(`Subject : ${item.subject}`);
        }
        if (item.body) {
            sb.push(`Body : ${item.body}`);
        }
        if (item.notes) {
            sb.push(`Notes : ${item.notes}`);
        }

        return sb.join(EOL);
    }
    public formatAuthor(logEntry: LogEntry): string {
        return `Author : ${logEntry.author!.name} <${logEntry.author!.email}>`;
    }
}
