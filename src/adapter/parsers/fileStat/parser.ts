import { inject, injectable } from 'inversify';
import * as path from 'path';
import { Uri } from 'vscode';
import { IServiceContainer } from '../../../ioc/types';
import { CommittedFile, Status, FsUri } from '../../../types';
import { IFileStatParser, IFileStatStatusParser } from '../types';

@injectable()
export class FileStatParser implements IFileStatParser {
    constructor(@inject(IServiceContainer) private serviceContainer: IServiceContainer) {}

    private static parseFileMovement(fileInfo: string): { original: string; current: string } | undefined {
        // src/client/{common/comms => }/Socket Stream.ts
        // src/client/common/{space in folder => comms}/id Dispenser.ts
        // src/client/common/space in folder/{idDispenser.ts => id Dispenser.ts}
        // src/client/common/{comms => space in folder}/SocketStream.ts
        // src/client/common/{comms => }/socketCallbackHandler.ts
        // src/client/common/comms/{ => another dir}/id Dispenser.ts
        // src/{test/autocomplete => client/common/comms/another dir}/base.test.ts
        // src/{client/common/comms/another dir => }/id Dispenser.ts
        // src/test/jupyter/{extension.jupyter.comms.jupyterKernelManager.test.ts => jupyterKernelManager.test.ts}

        // Another exampe is as follows, where a tab is used as a separator
        // src/vs/workbench/services/extensions/node/ipcRemoteCom.ts       src/vs/workbench/services/extensions/node/rpcProtocol.ts

        const diffSeparator = [' => ', '\t'].reduce<string | undefined>((separator, item) => {
            if (typeof separator === 'string') {
                return separator;
            }
            return fileInfo.indexOf(item) === -1 ? undefined : item;
        }, undefined);
        if (!diffSeparator) {
            console.error(`Parsing file movements failed for ${fileInfo}`);
            return;
        }
        const startIndex = fileInfo.indexOf('{');
        const endIndex = fileInfo.lastIndexOf('}');
        if (startIndex === -1 || endIndex === -1) {
            // Change in file name within root directory (that's why we don't have paths)
            const parts = fileInfo.split(diffSeparator);
            return { original: parts[0], current: parts[1] };
        } else {
            const partWithDifference = fileInfo.substring(startIndex, endIndex + 1);
            if (!partWithDifference.startsWith('{') || !partWithDifference.endsWith('}')) {
                console.error(`Invalid entry cotaining => for ${fileInfo}`);
                return;
            }
            const parts = partWithDifference
                .split(diffSeparator)
                .map(part => (part.startsWith('{') ? part.substring(1) : part))
                .map(part => (part.endsWith('}') ? part.substring(0, part.length - 1) : part))
                .map(part => part.trim());
            if (parts.length !== 2) {
                console.error(`Invalid number of items after splitting parts of file movements ${fileInfo}`);
            }

            // First build the original path
            const original = fileInfo.replace(partWithDifference, parts[0]);
            const originalPathParts = original.split(/\/|\/\/|\\|\\\\/g).filter(part => part.length > 0);

            const current = fileInfo.replace(partWithDifference, parts[1]);
            const currentPathParts = current.split(/\/|\/\/|\\|\\\\/g).filter(part => part.length > 0);

            return {
                original: path.join(...originalPathParts),
                current: path.join(...currentPathParts),
            };
        }
    }

    /**
     * Parses a line containing file information returned by `git log --name-stat` and returns just the file names
     * @param line line number
     * @param status status
     * @returns current file
     */
    private static getNewAndOldFileNameFromNumStatLine(
        line: string,
        status: Status,
    ): { original?: string; current: string } | undefined {
        const statusParts = line.split('\t');
        const fileName = statusParts[1].trim();
        if (status === Status.Renamed || status === Status.Copied) {
            return FileStatParser.parseFileMovement(line.substring(line.indexOf(fileName)));
        }
        return { current: fileName };
    }

    /**
     * Parses a line containing file information returned by `git log --numstat`
     * @param line the stdout line of the command
     * @returns number of added and removed lines for a file
     */
    private static getAdditionsAndDeletionsFromNumStatLine(
        line: string,
    ): { additions?: number; deletions?: number; fileName: string } | undefined {
        // 0       0       src/client/common/{comms => }/socketCallbackHandler.ts
        const numStatParts = line
            .split('\t')
            .map(part => part.trim())
            .filter(part => part.length > 0);
        if (numStatParts.length < 3) {
            console.error(`Failed to identify additions and deletions for line ${line}`);
            return;
        }
        let additions = numStatParts[0] === '-' ? undefined : parseInt(numStatParts[0], 10);
        additions = isNaN(additions!) ? undefined : additions;
        let deletions = numStatParts[1] === '-' ? undefined : parseInt(numStatParts[1], 10);
        deletions = isNaN(deletions!) ? undefined : deletions;

        return { additions, deletions, fileName: numStatParts[2] };
    }
    /**
     * Parsers the file status
     * @param filesWithNumStat Files returned using `git log --numstat`
     * @param filesWithNameStat Files returned using `git log --name-status`
     * @returns An array of committed files
     */
    public parse(gitRootPath: string, filesWithNumStat: string[], filesWithNameStat: string[]): CommittedFile[] {
        return filesWithNameStat
            .map((line, index) => {
                if (
                    line.trim().length === 0 &&
                    filesWithNumStat.length > index &&
                    filesWithNumStat[index].trim().length === 0
                ) {
                    return;
                }
                const numStatParts = FileStatParser.getAdditionsAndDeletionsFromNumStatLine(filesWithNumStat[index]);
                const additions = numStatParts ? numStatParts.additions : undefined;
                const deletions = numStatParts ? numStatParts.deletions : undefined;

                const statusParts = line.split('\t');
                const statusCode = statusParts[0].trim();
                const statusParser = this.serviceContainer.get<IFileStatStatusParser>(IFileStatStatusParser);
                if (!statusParser.canParse(statusCode)) {
                    return;
                }
                const status = statusParser.parse(statusCode)!;
                const currentAndOriginalFile = FileStatParser.getNewAndOldFileNameFromNumStatLine(line, status)!;
                const oldRelativePath = currentAndOriginalFile ? currentAndOriginalFile.original : undefined;
                const relativePath = currentAndOriginalFile.current;
                const oldUri = oldRelativePath
                    ? (Uri.file(path.join(gitRootPath, oldRelativePath)) as FsUri)
                    : undefined;

                const fileInfo: CommittedFile = {
                    additions,
                    deletions,
                    status,
                    relativePath,
                    oldRelativePath,
                    uri: Uri.file(path.join(gitRootPath, relativePath)) as FsUri,
                    oldUri,
                };

                fileInfo.uri.path = fileInfo.uri.fsPath;

                if (fileInfo.oldUri) {
                    fileInfo.oldUri.path = fileInfo.oldUri.fsPath;
                }

                return fileInfo;
            })
            .filter(commitFile => commitFile !== undefined)
            .map(commitFile => commitFile!);
    }
}
