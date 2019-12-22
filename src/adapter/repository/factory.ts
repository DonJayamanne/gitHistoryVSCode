import { inject, injectable } from 'inversify';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { API } from './git.d';
import { IGitArgsService } from './types';

@injectable()
export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<number, IGitService>();
    private gitApi: API;
    private repoIndex: number;
    constructor(@inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer) {

        this.gitApi = this.gitCmdExecutor.gitExtension.getAPI(1);
        this.repoIndex = -1;
    }

    public async createGitService(resource?: Uri | string): Promise<IGitService> {
        const resourceUri = typeof resource === 'string' ? Uri.file(resource) : resource;

        if (!resourceUri) {
            // no git service initialized, so take the selected as primary
            this.repoIndex = this.gitApi.repositories.findIndex(x => x.ui.selected);
        }

        if (this.repoIndex === -1) {
            // find the correct repository from the given resource uri
            this.gitApi.repositories.forEach((x, i) => {
                if (resourceUri!.fsPath.startsWith(x.rootUri.fsPath)) {
                    if (this.repoIndex === -1 || x.rootUri.fsPath.length > this.gitApi.repositories[this.repoIndex].rootUri.fsPath.length) {
                        this.repoIndex = i;
                    }
                }
            });
        }

        if (!this.gitServices.has(this.repoIndex)) {
            this.gitServices.set(this.repoIndex, new Git(this.gitApi.repositories[this.repoIndex], this.serviceContainer, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }

        return this.gitServices.get(this.repoIndex)!;
    }
}
