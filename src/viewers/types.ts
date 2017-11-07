import { LogEntry } from '../types';

export const ICommitViewer = Symbol('ICommitViewer');

export interface ICommitViewer {
    showCommit(logEntry: LogEntry): void;
}
