import { FileCommitContext } from '../common/types';
import { BaseCommand } from './baseCommand';

export abstract class BaseFileCommitCommand extends BaseCommand<FileCommitContext> {
    constructor(data: FileCommitContext) {
        super(data);
    }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
}
