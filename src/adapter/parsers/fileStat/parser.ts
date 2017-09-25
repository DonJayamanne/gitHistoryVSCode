import { injectable } from 'inversify';
import * as path from 'path';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Uri } from 'vscode';
import { CommittedFile, Status } from '../../contracts';
import { IFileStatParser, IFileStatStatusParser } from '../contracts';

@injectable()
export class FileStatParser implements IFileStatParser {
    constructor(private gitRootPath: string, private statusParser: IFileStatStatusParser) {
    }

    public parse(filesWithNumStat: string[], filesWithStats: string[]) {
        return filesWithStats.map((line, index) => {
            const info = line.split(/\t/g);
            if (info.length < 2) {
                return;
            }
            const statusCode: string = info[0][0].toLocaleUpperCase();
            if (!this.statusParser.canParse(statusCode)) {
                return;
            }
            const status = this.statusParser.parse(statusCode)!;
            let oldRelativePath;
            let relativePath = info[1];
            // A    filename
            // M    filename
            // D    filename
            // RXX  file_old    file_new
            // CXX  file_old    file_new
            switch (status) {
                case Status.Added:
                case Status.Modified:
                case Status.Deleted:
                    relativePath = info[1];
                    break;
                default:
                    oldRelativePath = info[1];
                    relativePath = info[2];
                    break;
            }

            let additions: number | undefined;
            let deletions: number | undefined;
            const parts = filesWithNumStat[index].split('\t').filter(part => part.trim().length > 0);
            if (parts.length === 3) {
                additions = parts[0] === '-' ? undefined : parseInt(parts[0], 10);
                deletions = parts[1] === '-' ? undefined : parseInt(parts[1], 10);
            }

            // tslint:disable-next-line:no-unnecessary-local-variable
            const fileInfo: CommittedFile = {
                additions,
                deletions,
                relativePath,
                status,
                oldRelativePath,
                uri: Uri.file(path.join(this.gitRootPath, relativePath))
            };
            return fileInfo;
        })
            .filter(commitFile => commitFile !== undefined)
            .map(commitFile => commitFile!);
    }
}
