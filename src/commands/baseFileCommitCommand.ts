import { FileCommitData } from '../common/types';
import { BaseCommand } from './baseCommand';

export abstract class BaseFileCommitCommand extends BaseCommand<FileCommitData> {
    constructor(data: FileCommitData) {
        super(data);
    }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
}
