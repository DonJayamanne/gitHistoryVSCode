import { inject, injectable } from 'inversify';
import { IGitService, IGitServiceFactory } from '../../types';
import { IGitCommandExecutor } from '../exec';
import { IFileStatParserFactory } from '../parsers';
import { ILogParser } from '../parsers/types';
import { Git } from './git';
import { IGitArgsService } from './types';
// tslint:disable-next-line:no-require-imports no-var-requires
const shorthash = require('shorthash');

@injectable()
export class GitServiceFactory implements IGitServiceFactory {
    private readonly gitServices = new Map<string, IGitService>();
    constructor( @inject(IGitCommandExecutor) private gitCmdExecutor: IGitCommandExecutor,
        @inject(ILogParser) private logParser: ILogParser,
        @inject(IGitArgsService) private gitArgsService: IGitArgsService,
        @inject(IFileStatParserFactory) private fileStatParserFactory: IFileStatParserFactory) {

    }
    public createGitService(workspaceRoot: string): IGitService {
        const id: string = shorthash.unique(workspaceRoot);
        if (!this.gitServices.has(id)) {
            this.gitServices.set(id, new Git(workspaceRoot, this.gitCmdExecutor, this.logParser, this.gitArgsService, this.fileStatParserFactory));
        }
        return this.gitServices.get(id)!;
    }
}
