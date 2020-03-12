import { Repository, RefType } from './git.d';
import { Branch } from '../../types';
import { GitRemoteService } from './gitRemoteService';
import { sendTelemetryEvent, sendTelemetryWhenDone } from '../../common/telemetry';
import { sha256 } from 'hash.js';
import { StopWatch } from '../../common/stopWatch';

/**
 * A way to get branches fast.
 * If one has 100s of branches, then we need to get branch info for each, that's git exe for each branch.
 * We'' use `git remote show xxx -n` to figure out remotes of branches.
 *
 * If there are no remotes, we'll fall back to old code.
 * Will need to add telemetry to check if remotes method works or not.
 * If always ok, then we can remove fallback completely.
 */
export class GitBranchesService {
    private telemetryOfBrancCountSent = new Set<string>();
    constructor(private readonly repo: Repository, private readonly remoteService: GitRemoteService) {}
    private get currentBranch(): string {
        return this.repo.state.HEAD!.name || '';
    }

    public async getBranches(): Promise<Branch[]> {
        const localBranches = this.repo.state.refs
            .filter(item => item.type === RefType.Head && !!item.name)
            .map(item => item.name!);

        if (!this.telemetryOfBrancCountSent.has(this.repo.rootUri.fsPath)) {
            this.telemetryOfBrancCountSent.add(this.repo.rootUri.fsPath);
            sendTelemetryEvent('BRANCH_COUNT', undefined, {
                count: localBranches.length,
                repo: sha256()
                    .update(this.repo.rootUri.fsPath)
                    .digest('hex'),
            });
        }

        let branches: Branch[] = [];

        // 1. Fast method.
        // If we have at least one branch with remotes, then we know it works.
        const branchesWithRemotes = await this.remoteService
            .getBranchesWithRemotes()
            .then(items => ({ branches: items, success: true }))
            .catch(() => {
                sendTelemetryEvent('FAILED_TO_GET_BRANCHES_WITH_REMOTES');
                return { branches: [], success: false };
            });
        if (branchesWithRemotes.success) {
            const indexedBranches = new Map<string, Branch>();
            branchesWithRemotes.branches.forEach(item => indexedBranches.set(item.name, item));

            branches = localBranches.map(branchName => {
                if (indexedBranches.get(branchName)) {
                    return indexedBranches.get(branchName)!;
                } else {
                    // For branches without remotes, empty remote.
                    return {
                        current: false,
                        gitRoot: '',
                        name: branchName,
                        remote: '',
                        remoteType: undefined,
                    };
                }
            });
        } else {
            // 2. This is a fallback mechanism.
            const branchesPromise = Promise.all(
                localBranches.map(async branchName => {
                    const originUrl = await this.remoteService.getOriginUrl(branchName);
                    const originType = await this.remoteService.getOriginType(originUrl);

                    return {
                        gitRoot: '',
                        name: branchName,
                        remote: originUrl,
                        remoteType: originType,
                        current: false,
                    } as Branch;
                }),
            );

            sendTelemetryWhenDone('GET_BRANCHES_FALLBACK', branchesPromise);
            branches = await branchesPromise;
        }

        return this.fixBranches(branches);
    }

    public async getBranchDetails(branchName: string): Promise<Branch> {
        const originUrl = await this.remoteService.getOriginUrl(branchName);
        const originType = await this.remoteService.getOriginType(originUrl);

        return {
            gitRoot: this.repo.rootUri.fsPath,
            name: branchName,
            remote: originUrl,
            remoteType: originType,
            current: this.currentBranch === branchName,
        };
    }

    private fixBranches(branches: Branch[]) {
        const currentBranchName = this.currentBranch;
        const gitRootPath = this.repo.rootUri.fsPath;
        return branches.map(item => {
            return {
                ...item,
                gitRoot: gitRootPath,
                current: currentBranchName === item.name,
            };
        });
    }
}
