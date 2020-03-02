import { injectable, multiInject } from 'inversify';
import { ILogService } from '../../../common/types';
import { Status } from '../../../types';
import { IFileStatStatusParser } from '../types';

@injectable()
export class FileStatStatusParser implements IFileStatStatusParser {
    constructor(@multiInject(ILogService) private loggers: ILogService[]) {}
    public canParse(status: string): boolean {
        const parsedStatus = this.parse(status);
        return parsedStatus !== undefined && parsedStatus !== null;
    }
    public parse(status: string): Status | undefined {
        status = status || '';
        status = status.length === 0 ? '' : status.trim().substring(0, 1);
        switch (status) {
            case 'A':
                return Status.Added;
            case 'M':
                return Status.Modified;
            case 'D':
                return Status.Deleted;
            case 'C':
                return Status.Copied;
            case 'R':
                return Status.Renamed;
            case 'T':
                return Status.TypeChanged;
            case 'X':
                return Status.Unknown;
            case 'U':
                return Status.Unmerged;
            case 'B':
                return Status.Broken;
            default: {
                this.loggers.forEach(logger => logger.error(`Unrecognized file stat status '${status}`));
                return;
            }
        }
    }
}
