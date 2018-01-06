import { inject, injectable } from 'inversify';
import { CommitDetails, IUiService } from '../../common/types';
import { IServiceContainer } from '../../ioc/types';
import { IGitCommitCommandHandler } from '../types';

@injectable()
export class GitCommitCommandHandler implements IGitCommitCommandHandler {
    constructor( @inject(IServiceContainer) private serviceContainer: IServiceContainer) { }

    // @command('git.commit.doSomething', IGitCommitCommandHandler)
    public async doSomethingWithCommit(commit: CommitDetails) {
        const cmd = await this.serviceContainer.get<IUiService>(IUiService).selectCommitCommandAction(commit);
        if (!cmd) {
            return;
        }
        // tslint:disable-next-line:no-console
        console.log(cmd);
        return cmd.execute();
    }
}
