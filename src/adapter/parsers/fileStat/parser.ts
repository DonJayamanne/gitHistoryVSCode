import { inject, injectable } from 'inversify';
import * as path from 'path';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Uri } from 'vscode';
import { CommittedFile, Status } from '../../../types';
// import { TYPES } from '../constants';
import * as TYPES from '../types';
import { IFileStatParser, IFileStatStatusParser } from '../types';

@injectable()
export class FileStatParser implements IFileStatParser {
    constructor(private gitRootPath: string, @inject(TYPES.IFileStatStatusParser) private statusParser: IFileStatStatusParser) {
    }

    private static parseFileMovement(fileInfo: string): { original: string, current: string } | undefined {
        // src/client/{common/comms => }/Socket Stream.ts
        // src/client/common/{space in folder => comms}/id Dispenser.ts
        // src/client/common/space in folder/{idDispenser.ts => id Dispenser.ts}
        // src/client/common/{comms => space in folder}/SocketStream.ts
        // src/client/common/{comms => }/socketCallbackHandler.ts
        // src/client/common/comms/{ => another dir}/id Dispenser.ts
        // src/{test/autocomplete => client/common/comms/another dir}/base.test.ts
        // src/{client/common/comms/another dir => }/id Dispenser.ts
        // src/test/jupyter/{extension.jupyter.comms.jupyterKernelManager.test.ts => jupyterKernelManager.test.ts}
        const diffSeparator = ' => ';
        if (fileInfo.indexOf(diffSeparator) === -1) {
            console.error(`Parsing file movements failed for ${fileInfo}`);
            return;
        }
        const startIndex = fileInfo.indexOf('{');
        const endIndex = fileInfo.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) {
            // Change in file name within root directory (that's why we don't have paths)
            const parts = fileInfo.split(diffSeparator);
            return { original: parts[0], current: parts[1] };
        }
        else {
            const partWithDifference = fileInfo.substring(startIndex, endIndex + 1);
            if (!partWithDifference.startsWith('{') || !partWithDifference.endsWith('}')) {
                console.error(`Invalid entry cotaining => for ${fileInfo}`);
                return;
            }
            const parts = partWithDifference.split(diffSeparator)
                .map(part => part.startsWith('{') ? part.substring(1) : part)
                .map(part => part.endsWith('}') ? part.substring(0, part.length - 1) : part)
                .map(part => part.trim());
            if (parts.length !== 2) {
                console.error(`Invalid number of items after splitting parts of file movements ${fileInfo}`);
            }

            // First build the original path
            const original = fileInfo.replace(partWithDifference, parts[0]);
            const originalPathParts = original.split(/\/|\/\/|\\|\\\\/g).filter(part => part.length > 0);

            const current = fileInfo.replace(partWithDifference, parts[1]);
            const currentPathParts = current.split(/\/|\/\/|\\|\\\\/g).filter(part => part.length > 0);

            return { original: path.join(...originalPathParts), current: path.join(...currentPathParts) };
        }
    }

    /**
     * Parses a line containing file information returned by `git log --name-stat` and returns just the file names
     * @private
     * @static
     * @param {string} line
     * @returns {({ original?: string, current: string } | undefined)}
     * @memberof FileStatParser
     */
    private static getNewAndOldFileNameFromNumStatLine(line: string, status: Status): { original?: string, current: string } | undefined {
        const indexOfFirstAlphabet = line.split('').findIndex((char, index) => index > 0 && (char.toUpperCase() !== char.toLocaleLowerCase()));
        const fileName = line.substring(indexOfFirstAlphabet - 1).trim();
        if (status === Status.Renamed || status === Status.Copied) {
            return FileStatParser.parseFileMovement(fileName);
        }
        return { current: fileName };
    }

    /**
     * Parses a line containing file information returned by `git log --numstat`
     * @private
     * @static
     * @param {string} line
     * @returns {({ additions?: number, deletions?: number } | undefined)}
     * @memberof FileStatParser
     */
    private static getAdditionsAndDeletionsFromNumStatLine(line: string): { additions?: number, deletions?: number } | undefined {
        // 0       0       src/client/common/{comms => }/socketCallbackHandler.ts
        const numStatParts = line.split(/\s/g).map(part => part.trim()).filter(part => part.length > 0);
        if (numStatParts.length < 3) {
            console.error(`Failed to identify additions and deletions for line ${line}`);
            return;
        }
        let additions = numStatParts[0] === '-' ? undefined : parseInt(numStatParts[0], 10);
        additions = isNaN(additions!) ? undefined : additions;
        let deletions = numStatParts[1] === '-' ? undefined : parseInt(numStatParts[1], 10);
        deletions = isNaN(deletions!) ? undefined : deletions;

        return { additions, deletions };
    }
    /**
     * Parsers the file status
     * @param {string[]} filesWithNumStat Files returned using `git log --numstat`
     * @param {string[]} filesWithNameStat Files returned using `git log --name-status`
     * @returns {CommittedFile[]}
     * @memberof FileStatParser
     */
    public parse(filesWithNumStat: string[], filesWithNameStat: string[]): CommittedFile[] {
        return filesWithNameStat.map((line, index) => {
            const numStatParts = FileStatParser.getAdditionsAndDeletionsFromNumStatLine(filesWithNumStat[index]);
            const additions = numStatParts ? numStatParts.additions : undefined;
            const deletions = numStatParts ? numStatParts.deletions : undefined;

            const indexOfStartOfFileName = line.split('').findIndex((c, idx) => idx > 0 && (c.toUpperCase() !== c.toLocaleLowerCase()));
            const statusCode = line.substring(0, indexOfStartOfFileName).trim();
            if (!this.statusParser.canParse(statusCode)) {
                return;
            }
            const status = this.statusParser.parse(statusCode)!;
            const currentAndOriginalFile = FileStatParser.getNewAndOldFileNameFromNumStatLine(line, status)!;
            const oldRelativePath = currentAndOriginalFile ? currentAndOriginalFile.original : undefined;
            const relativePath = currentAndOriginalFile.current;
            const oldUri = oldRelativePath ? Uri.file(path.join(this.gitRootPath, oldRelativePath)) : undefined;

            // tslint:disable-next-line:no-unnecessary-local-variable
            const fileInfo: CommittedFile = {
                additions,
                deletions,
                status,
                relativePath,
                oldRelativePath,
                uri: Uri.file(path.join(this.gitRootPath, relativePath)),
                oldUri
            };
            return fileInfo;
        })
            .filter(commitFile => commitFile !== undefined)
            .map(commitFile => commitFile!);
    }
}
