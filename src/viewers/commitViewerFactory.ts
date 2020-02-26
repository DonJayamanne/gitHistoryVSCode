import { inject, injectable, named } from 'inversify';
import { OutputChannel } from 'vscode';
import { ICommandManager } from '../application/types/commandManager';
import { IFileCommitCommandFactory } from '../commandFactories/types';
import { ICommitViewFormatter } from '../formatters/types';
import { NodeBuilder } from '../nodes/nodeBuilder';
import { INodeFactory } from '../nodes/types';
import { IPlatformService } from '../platform/types';
import { IOutputChannel } from '../types';
import { CommitViewer } from './commitViewer';
import { ICommitViewer, ICommitViewerFactory } from './types';

@injectable()
export class CommitViewerFactory implements ICommitViewerFactory {
    // @ts-ignore
    private commitViewer: ICommitViewer;
    // @ts-ignore
    private compareViewer: ICommitViewer;
    constructor(@inject(IOutputChannel) private outputChannel: OutputChannel,
                @inject(ICommitViewFormatter) private commitFormatter: ICommitViewFormatter,
                @inject(ICommandManager) private commandManager: ICommandManager,
                @inject(IPlatformService) private platformService: IPlatformService,
                @inject(IFileCommitCommandFactory) private fileCommitFactory: IFileCommitCommandFactory,
                @inject(INodeFactory) @named('standard') private standardNodeFactory: INodeFactory,
                @inject(INodeFactory) @named('comparison') private compareNodeFactory: INodeFactory) {
    }
    public getCommitViewer(): ICommitViewer {
        if (this.commitViewer) {
            return this.commitViewer;
        }

        return this.commitViewer = new CommitViewer(this.outputChannel, this.commitFormatter,
                                                    this.commandManager, new NodeBuilder(this.fileCommitFactory, this.standardNodeFactory, this.platformService),
                                                    'commitViewProvider', 'git.commit.view.show');
    }
    public getCompareCommitViewer(): ICommitViewer {
        if (this.compareViewer) {
            return this.compareViewer;
        }

        return this.compareViewer = new CommitViewer(this.outputChannel, this.commitFormatter,
                                                     this.commandManager, new NodeBuilder(this.fileCommitFactory, this.compareNodeFactory, this.platformService),
                                                     'compareCommitViewProvider', 'git.commit.compare.view.show');
    }
}
