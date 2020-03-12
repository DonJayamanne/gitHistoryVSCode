import { Repository, RefType } from './git.d';
import { Branch } from '../../types';
import { GitRemoteService } from './gitRemoteService';

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
    constructor(private readonly repo: Repository, private readonly remoteService: GitRemoteService) {}
    private get currentBranch(): string {
        return this.repo.state.HEAD!.name || '';
    }

    public async getBranches(): Promise<Branch[]> {
        const localBranches = this.repo.state.refs
            .filter(item => item.type === RefType.Head && !!item.name)
            .map(item => item.name!);

        let branches: Branch[] = [];

        // 1. Fast method.
        // If we have at least one branch with remotes, then we know it works.
        const branchesWithRemotes = await this.remoteService.getBranchesWithRemotes();
        if (branchesWithRemotes.length > 0) {
            const indexedBranches = new Map<string, Branch>();
            branchesWithRemotes.forEach(item => indexedBranches.set(item.name, item));

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
            branches = await Promise.all(
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
