import { CommitData } from '../common/types';
import { BaseCommand } from './baseCommand';

export abstract class BaseCommitCommand extends BaseCommand<CommitData> {
    constructor(data: CommitData) {
        super(data);
    }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
}
