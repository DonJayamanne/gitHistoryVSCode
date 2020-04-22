import { inject, injectable } from 'inversify';
import * as path from 'path';
import { QuickPickItem, Uri } from 'vscode';
import { IApplicationShell } from '../../application/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { API } from './git.d';
import { IGitArgsService } from './types';
import { IWorkspaceService } from '../../application/types/workspace';

@injectable()
export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<string, IGitService>();
    private readonly gitApi: Promise<API>;
    private repoIndex: number;
    private workspace: IWorkspaceService;

    constructor(
        @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer,
    ) {
        this.workspace = this.serviceContainer.get<IWorkspaceService>(IWorkspaceService);
        this.gitApi = this.gitCmdExecutor.gitApi;
        this.repoIndex = -1;
    }

    public getIndex(): number {
        return this.repoIndex;
    }

    public getService(index: number): IGitService {
        return this.gitServices.get(index.toString())!;
    }

    public async repositoryPicker(): Promise<void> {
        if (this.repoIndex > -1) {
            return;
        }

        const app = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
        const pickList: QuickPickItem[] = [];
        const gitApi = await this.gitApi;
        gitApi.repositories.forEach(x => {
            pickList.push({
                label: path.basename(x.rootUri.path),
                detail: x.rootUri.path,
                description: x.state.HEAD!.name,
            });
        });

        const options = {
            canPickMany: false,
            matchOnDescription: false,
            matchOnDetail: true,
            placeHolder: 'Select a Git Repository',
        };
        const selectedItem = await app.showQuickPick(pickList, options);
        if (selectedItem) {
            this.repoIndex = gitApi.repositories.findIndex(x => x.rootUri.path === selectedItem.detail);
        }
    }

    public async createGitService(resource?: Uri | string): Promise<IGitService> {
        const resourceUri = typeof resource === 'string' ? Uri.file(resource) : resource;
        const gitApi = await this.gitApi;
        if (!resourceUri) {
            if (this.workspace.getConfiguration('gitHistory').get<boolean>('alwaysPromptRepositoryPicker', false)) {
                this.repoIndex = -1;
            }

            if (this.repoIndex === -1 && gitApi.repositories.length === 1) {
                this.repoIndex = 0;
            } else {
                const currentIndex = gitApi.repositories.findIndex(x => x.ui.selected);
                // show repository picker
                if (this.repoIndex === -1) {
                    await this.repositoryPicker();
                } else if (currentIndex > -1 && currentIndex !== this.repoIndex) {
                    this.repoIndex = currentIndex;
                }
            }
        }

        if (resourceUri) {
            // find the correct repository from the given resource uri
            let i = 0;
            for (const x of gitApi.repositories) {
                if (
                    resourceUri!.fsPath.startsWith(x.rootUri.fsPath) &&
                    x.rootUri.fsPath === gitApi.repositories[i].rootUri.fsPath
                ) {
                    this.repoIndex = i;
                    break;
                }
                i++;
            }
        }

        if (!this.gitServices.has(this.repoIndex.toString())) {
            this.gitServices.set(
                this.repoIndex.toString(),
                new Git(
                    gitApi.repositories[this.repoIndex],
                    this.serviceContainer,
                    this.gitCmdExecutor,
                    this.logParser,
                    this.gitArgsService,
                ),
            );
        }

        return this.getService(this.repoIndex);
    }
}
