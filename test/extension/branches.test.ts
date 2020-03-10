import { assert } from 'chai';
import { Uri, extensions } from 'vscode';
import { changeBranch, setupDefaultRepo } from './repoSetup';
import { IServiceManager } from '../../src/ioc/types';
import { IGitServiceFactory } from '../../src/types';
import * as path from 'path';
import { tempRepoFolder } from '../common';
import { GitServiceFactory } from '../../src/adapter/repository/factory';

const repoPath = 'https://github.com/DonJayamanne/test_gitHistory.git';
describe('Branches', () => {
    let serviceManager: IServiceManager;
    const localPath = path.join(tempRepoFolder, 'test_gitHistory');

    beforeAll(async () => {
        await setupDefaultRepo();

        const extension = extensions.getExtension('donjayamanne.githistory');
        if (!extension?.isActive) {
            await extension?.activate().then();
        }
        serviceManager = extension?.exports.serviceManager;
        assert.isOk(serviceManager);
    }, 60_000);

    test('Return all branches', async () => {
        const expectedBranches = [
            {
                gitRoot: '',
                name: 'addBranchTests',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'part1FixStartup',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'master',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: true,
            },
            {
                gitRoot: '',
                name: 'addTests',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'jest',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'replace-webserver-with-postmessage',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'localBranch3',
                remote: '',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'localBranch2',
                remote: '',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'localBranch1',
                remote: '',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'curvyGraphs',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
            {
                gitRoot: '',
                name: 'WIP',
                remote: 'https://github.com/DonJayamanne/test_gitHistory.git',
                remoteType: 2,
                current: false,
            },
        ].map(item => ({
            gitRoot: localPath,
            name: item.name,
        }));

        const factory = serviceManager.get<IGitServiceFactory>(IGitServiceFactory);
        const gitService = await factory.createGitService(Uri.file(localPath));

        await changeBranch(repoPath, 'master');

        const branches = (await gitService.getBranches()).map(item => ({
            gitRoot: localPath,
            name: item.name,
        }));

        assert.deepEqual(branches, expectedBranches);
    }, 1_000);
    test('Return current branch', async () => {
        const factory = serviceManager.get<GitServiceFactory>(IGitServiceFactory);
        const gitApi = await factory.gitApi;
        const gitService = await factory.createGitService(Uri.file(localPath));

        // Wait for api to detect the change.
        await Promise.all([
            changeBranch(repoPath, 'localBranch1'),
            new Promise(resolve => gitApi.repositories[0].state.onDidChange(() => resolve())),
        ]);
        const currentBranch = await gitService.getCurrentBranch();

        assert.equal(currentBranch, 'localBranch1');
    }, 5_000);
});
