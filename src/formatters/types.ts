import { LogEntry } from '../types';

export const ICommitViewFormatter = Symbol('ICommitViewFormatter');

export interface ICommitViewFormatter {
    format(logEntry: LogEntry): string;
}
