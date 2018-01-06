import { FileCommitDetails } from '../common/types';
import { BaseCommand } from './baseCommand';

export abstract class BaseFileCommitCommand extends BaseCommand<FileCommitDetails> {
    constructor(data: FileCommitDetails) {
        super(data);
    }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
}
