import { assert } from 'chai';
import { Uri, extensions } from 'vscode';
import { changeBranch, setupDefaultRepo, createBranch, createTag, getLocalPath, resetRepo } from './repoSetup';
import { IServiceManager } from '../../src/ioc/types';
import { IGitServiceFactory, IGitService } from '../../src/types';
import * as path from 'path';
import * as fs from 'fs-extra';
import { waitForCondition, noop } from '../common';
import { GitServiceFactory } from '../../src/adapter/repository/factory';

const repoPath = 'https://github.com/DonJayamanne/test_gitHistory.git';
describe('Branches', () => {
    let serviceManager: IServiceManager;
    const localPath = getLocalPath(repoPath);
    const remote = 'https://github.com/DonJayamanne/test_gitHistory.git';
    // NOTE: VS Code's built-in git API (>=1.76) added a `type` field to every
    // branch ref and now reports local branches with `remoteType: 2` and an
    // `undefined` remote. Branch ordering also groups local branches (ascending)
    // immediately after the last remote-tracking branch they were created from.
    const expectedBranches = [
        { gitRoot: '', name: 'addBranchTests', remote, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'part1FixStartup', remote, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'master', remote, remoteType: 2, current: true, type: 0 },
        { gitRoot: '', name: 'addTests', remote, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'jest', remote, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'localBranch1', remote: undefined, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'localBranch2', remote: undefined, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'localBranch3', remote: undefined, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'replace-webserver-with-postmessage', remote, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'curvyGraphs', remote, remoteType: 2, current: false, type: 0 },
        { gitRoot: '', name: 'WIP', remote, remoteType: 2, current: false, type: 0 },
    ];

    beforeAll(async () => {
        try {
            await setupDefaultRepo();

            const extension = extensions.getExtension('donjayamanne.githistory');
            if (!extension?.isActive) {
                await extension?.activate().then();
            }
            serviceManager = extension?.exports.serviceManager;
            assert.isOk(serviceManager);
        } catch (ex) {
            console.error(ex);
            throw ex;
        }
    }, 60_000);

    beforeEach(async () => {
        await Promise.all([resetRepo(repoPath), fs.unlink(path.join(localPath, 'iot')).catch(noop)]);
    });

    async function assertCurrentBranch(gitService: IGitService, expectedBranch: string) {
        let currentBranch = '';
        async function isBranchCorrect() {
            currentBranch = gitService.getCurrentBranch();
            return currentBranch === `heads/${expectedBranch}` || currentBranch === expectedBranch;
        }

        // Wait for git API (VSC Api) to detect this change.
        // Tried using `change` event, however that didn't seem to work either (not always).
        // 1s wasn't enough!
        const errorMessage = `Current branch is ${currentBranch}, but should be localBranch1`;
        await waitForCondition(isBranchCorrect, 5_000, errorMessage);
    }

    test('Return all branches', async () => {
        const factory = serviceManager.get<IGitServiceFactory>(IGitServiceFactory);
        const gitService = await factory.createGitService(Uri.file(localPath));

        await changeBranch(repoPath, 'master');

        const branches = await gitService.getBranches();

        expect(branches.length).toBeGreaterThanOrEqual(expectedBranches.length);
        // We might have a few extra branches created during tests, so exclude those.
        const branchesToMatch = branches.filter(branch => expectedBranches.find(item => item.name === branch.name));
        // `remote` is typed as `string` on Branch, but the git API returns `undefined`
        // for local branches; cast keeps the structural runtime compare intact.
        assert.deepEqual(
            branchesToMatch,
            expectedBranches.map(item => ({
                ...item,
                gitRoot: localPath,
            })) as unknown as typeof branchesToMatch,
        );
    }, 1_000);
    test('Return current branch', async () => {
        await changeBranch(repoPath, 'localBranch1');

        const factory = serviceManager.get<GitServiceFactory>(IGitServiceFactory);
        const gitService = await factory.createGitService(Uri.file(localPath));

        await assertCurrentBranch(gitService, 'localBranch1');
    }, 10_000);
    test('Get branches when repo has file, tag and branch with the same name (Issue 499)', async () => {
        const commonNameAcrossAll = 'iot';
        await createBranch(repoPath, commonNameAcrossAll);
        await changeBranch(repoPath, commonNameAcrossAll);
        await createTag(repoPath, commonNameAcrossAll);
        await fs.appendFileSync(path.join(localPath, commonNameAcrossAll), '');

        const factory = serviceManager.get<GitServiceFactory>(IGitServiceFactory);
        const gitService = await factory.createGitService(Uri.file(localPath));

        const branches = await gitService.getBranches();
        expect(branches.length).toBeGreaterThanOrEqual(11);

        await assertCurrentBranch(gitService, commonNameAcrossAll);

        const logEntries = await gitService.getLogEntries(0, 100, [commonNameAcrossAll]);
        assert.isOk(logEntries);
        assert.equal(logEntries.count, 406);
        assert.equal(logEntries.items.length, 100);
    }, 10_000);
});
