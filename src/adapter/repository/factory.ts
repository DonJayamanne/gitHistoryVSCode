import { inject } from 'inversify';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
// import { TYPES } from '../parsers/constants';
import * as TYPES from '../parsers/types';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import * as repoTYPES from './types';
import { IGitArgsService } from './types';
// tslint:disable-next-line:no-require-imports no-var-requires
const shorthash = require('shorthash');

export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<string, IGitService>();
    constructor( @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(TYPES.ILogParser) private logParser: ILogParser,
        @inject(repoTYPES.IGitArgsService) private gitArgsService: IGitArgsService) {

    }
    public createGitService(workspaceRoot: string): IGitService {
        const id: string = shorthash.unique(workspaceRoot);
        if (!this.gitServices.has(id)) {
            this.gitServices.set(id, new Git(workspaceRoot, this.gitCmdExecutor, this.logParser, this.gitArgsService));
        }
        return this.gitServices.get(id)!;
    }
}
