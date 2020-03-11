import * as simplegit from 'simple-git/promise';
import { tempRepoFolder, noop } from '../common';
import * as path from 'path';
import * as fs from 'fs-extra';

/**
 * Returns the name of a repo from a repo path.
 * E.g. return `test_gitHistory` from `https://github.com/DonJayamanne/test_gitHistory.git`.
 */
export function getRepoName(repoPath: string) {
    if (!repoPath.endsWith('.git')) {
        throw new Error('Repo path must be of the form "https://github.com/<org>/<name>.git"');
    }
    return path.basename(repoPath, '.git');
}

function getLocalPath(repoPath: string) {
    return path.join(tempRepoFolder, getRepoName(repoPath));
}
/**
 * Downloads/clones a git repo.
 */
export async function cloneRepo(repoPath: string) {
    const localPath = getLocalPath(repoPath);
    if (await fs.existsSync(path.join(localPath, 'package.json'))) {
        return;
    }
    await simplegit().clone(repoPath, localPath);
}
async function doesBranchExist(repoPath: string, branchName: string): Promise<boolean> {
    const localPath = getLocalPath(repoPath);
    const branches = await simplegit(localPath).branchLocal();
    return branches.all.includes(branchName);
}
/**
 * Remote branches to checkout locally.
 */
export async function checkoutRemote(repoPath: string, remote: string, branchName: string) {
    await cloneRepo(repoPath);
    if (await doesBranchExist(repoPath, branchName)) {
        return;
    }
    const localPath = getLocalPath(repoPath);
    await simplegit(localPath).checkout(['--track', `${remote}/${branchName}`]);
}
export async function createBranch(repoPath: string, branchName: string) {
    await cloneRepo(repoPath);
    if (await doesBranchExist(repoPath, branchName)) {
        return;
    }
    const localPath = getLocalPath(repoPath);
    await simplegit(localPath).checkoutLocalBranch(branchName);
}
export async function changeBranch(repoPath: string, branchName: string) {
    await cloneRepo(repoPath);
    const localPath = getLocalPath(repoPath);
    await simplegit(localPath).checkout(branchName);
}

export async function setupDefaultRepo() {
    const repoPath = 'https://github.com/DonJayamanne/test_gitHistory.git';
    await cloneRepo(repoPath);

    // To check later, for some reason, things were failing on CI, even when the branches exist.
    await checkoutRemote(repoPath, 'origin', 'WIP').catch(noop);
    await checkoutRemote(repoPath, 'origin', 'addBranchTests').catch(noop);
    await checkoutRemote(repoPath, 'origin', 'addTests').catch(noop);
    await checkoutRemote(repoPath, 'origin', 'curvyGraphs').catch(noop);
    await checkoutRemote(repoPath, 'origin', 'jest').catch(noop);
    await checkoutRemote(repoPath, 'origin', 'part1FixStartup').catch(noop);
    await checkoutRemote(repoPath, 'origin', 'replace-webserver-with-postmessage').catch(noop);

    await createBranch(repoPath, 'localBranch1').catch(noop);
    await createBranch(repoPath, 'localBranch2').catch(noop);
    await createBranch(repoPath, 'localBranch3').catch(noop);
    await changeBranch(repoPath, 'master').catch(noop);
}
