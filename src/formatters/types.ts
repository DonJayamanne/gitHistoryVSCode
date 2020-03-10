import { LogEntry } from '../types';

export const ICommitViewFormatter = Symbol.for('ICommitViewFormatter');

export interface ICommitViewFormatter {
    format(logEntry: LogEntry): string;
    formatAuthor(logEntry: LogEntry): string;
}
