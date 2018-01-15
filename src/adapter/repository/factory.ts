import { inject, injectable } from 'inversify';
import * as md5 from 'md5';
import { IServiceContainer } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { IGitArgsService } from './types';

@injectable()
export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<string, IGitService>();
    constructor( @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer) {

    }
    public createGitService(workspaceRoot: string): IGitService {
        const id = md5(workspaceRoot);
        if (!this.gitServices.has(id)) {
            this.gitServices.set(id, new Git(this.serviceContainer, workspaceRoot, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }
        return this.gitServices.get(id)!;
    }
}
