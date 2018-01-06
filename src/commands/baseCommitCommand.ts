import { CommitContext } from '../common/types';
import { BaseCommand } from './baseCommand';

export abstract class BaseCommitCommand extends BaseCommand<CommitContext> {
    constructor(data: CommitContext) {
        super(data);
    }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
}
