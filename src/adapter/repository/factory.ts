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
    constructor(@inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer) {

        this.gitApi = this.gitCmdExecutor.gitExtension.getAPI(1);
    }

    public async createGitService(resource?: Uri | string): Promise<IGitService> {
        const resourceUri = typeof resource === 'string' ? Uri.file(resource) : resource;
        let repoIndex: number = -1;

        if (!resourceUri) {
            // no git service initialized, so take the selected as primary
            repoIndex = this.gitApi.repositories.findIndex(x => x.ui.selected);
        }

        if (repoIndex === -1) {
            // find the correct repository from the given resource uri
            this.gitApi.repositories.forEach((x, i) => {
                if (resourceUri!.fsPath.startsWith(x.rootUri.fsPath)) {
                    if (repoIndex === -1 || x.rootUri.fsPath.length > this.gitApi.repositories[repoIndex].rootUri.fsPath.length) {
                        repoIndex = i;
                    }
                }
            });
        }

        if (!this.gitServices.has(repoIndex)) {
            this.gitServices.set(repoIndex, new Git(this.gitApi.repositories[repoIndex], this.serviceContainer, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }

        return this.gitServices.get(repoIndex)!;
    }
}
