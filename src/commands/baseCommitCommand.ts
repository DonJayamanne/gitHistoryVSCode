import { CommitDetails } from '../common/types';
import { BaseCommand } from './baseCommand';

export abstract class BaseCommitCommand extends BaseCommand<CommitDetails> {
    constructor(data: CommitDetails) {
        super(data);
    }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
}
