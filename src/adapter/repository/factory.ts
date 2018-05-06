import { inject, injectable } from 'inversify';
import * as md5 from 'md5';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { IGitArgsService } from './types';

@injectable()
export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<string, IGitService>();
    constructor(@inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer) {

    }
    public async createGitService(workspaceRoot: string, resource: Uri | string): Promise<IGitService> {
        const resourceUri = typeof resource === 'string' ? Uri.parse(resource) : resource;

        const id = md5(workspaceRoot + resourceUri.fsPath);
        if (!this.gitServices.has(id)) {
            this.gitServices.set(id, new Git(this.serviceContainer, workspaceRoot, resourceUri, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }
        return this.gitServices.get(id)!;
    }
}
