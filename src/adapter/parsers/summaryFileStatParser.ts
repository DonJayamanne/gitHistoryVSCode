import { CommittedFile, Status } from '../git';
import { Uri } from 'vscode';
import * as path from 'path';

const statusMapping = new Map<string, Status>();
statusMapping.set('A', Status.Added);
statusMapping.set('M', Status.Modified);
statusMapping.set('D', Status.Deleted);
statusMapping.set('C', Status.Copied);
statusMapping.set('R', Status.Renamed);

export default function parseCommitedFiles(gitRootPath: string, summaryStats: string, numStat: string) {
    const fileListWithStats = summaryStats.split(/\r?\n/g).filter(line => line.trim().length > 0);
    const fileListWithStatus = numStat.split(/\r?\n/g).filter(line => line.trim().length > 0);
    return fileListWithStatus.map((line, index) => {
        let info = line.split(/\t/g);
        if (info.length < 2) {
            return;
        }
        const statusCode: string = info[0][0].toLocaleUpperCase();
        if (!statusMapping.has(statusCode)) {
            return;
        }
        const status = statusMapping.get(statusCode);
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
        const parts = fileListWithStats[index].split('\t').filter(part => part.trim().length > 0);
        if (parts.length === 3) {
            additions = parts[0] === '-' ? undefined : parseInt(parts[0]);
            deletions = parts[1] === '-' ? undefined : parseInt(parts[1]);
        }

        return {
            additions,
            deletions,
            relativePath,
            status,
            oldRelativePath,
            uri: Uri.file(path.join(gitRootPath, relativePath))
        } as CommittedFile;
    })
        .filter(commitFile => commitFile !== undefined && commitFile !== null)
        .map(commitFile => commitFile!);
}