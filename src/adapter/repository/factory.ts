import { inject, injectable } from 'inversify';
import { Uri, QuickPickItem } from 'vscode';
import { IApplicationShell } from '../../application/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { API } from './git.d';
import { IGitArgsService } from './types';
import * as path from 'path';

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

    public getIndex(): number {
        return this.repoIndex;
    }

    public getService(index: number) : IGitService {
        return this.gitServices.get(index)!; 
    }

    public async repositoryPicker() : Promise<void> {
        if (this.repoIndex > -1) return;

        const app = this.serviceContainer.get<IApplicationShell>(IApplicationShell);
        const pickList: QuickPickItem[] = [];

        this.gitApi.repositories.forEach(x => {
            pickList.push({ label: path.basename(x.rootUri.path), detail: x.rootUri.path, description: x.state.HEAD!.name });
        });
        
        const options = {
            canPickMany: false, matchOnDescription: false,
            matchOnDetail: true, placeHolder: 'Select a Git Repository'
        };
        const selectedItem = await app.showQuickPick(pickList, options);
        if (selectedItem) {
            this.repoIndex = this.gitApi.repositories.findIndex(x => x.rootUri.path == selectedItem.detail);
        }
    }

    public async createGitService(resource?: Uri | string): Promise<IGitService> {
        const resourceUri = typeof resource === 'string' ? Uri.file(resource) : resource;

        if (!resourceUri) {
            if (this.repoIndex === -1 && this.gitApi.repositories.length === 1) {
                this.repoIndex = 0;
            } else {
                const currentIndex = this.gitApi.repositories.findIndex(x => x.ui.selected);
                // show repository picker
                if (this.repoIndex === -1) {
                    await this.repositoryPicker();
                } else if(currentIndex > -1 && currentIndex !== this.repoIndex) {
                    this.repoIndex = currentIndex;
                }
            }
        }

        if (resourceUri) {
            // find the correct repository from the given resource uri
            let i = 0;
            for(let x of this.gitApi.repositories) {
                if (resourceUri!.fsPath.startsWith(x.rootUri.fsPath) && x.rootUri.fsPath === this.gitApi.repositories[i].rootUri.fsPath) {
                    this.repoIndex = i;
                    break;
                }
                i++;
            }
        }

        if (!this.gitServices.has(this.repoIndex)) {
            this.gitServices.set(this.repoIndex, new Git(this.gitApi.repositories[this.repoIndex], this.serviceContainer, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }

        return this.gitServices.get(this.repoIndex)!;
    }
}
