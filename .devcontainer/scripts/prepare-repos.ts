import { sync } from 'fast-glob';
import simpleGit from 'simple-git';
import * as Path from 'path';
import * as Fs from 'fs/promises';
import { existsSync } from 'fs';
import { IRepo, PREPARED_REPOS_FILE, WORKSPACE_REPOS_FILE } from './common/types';

async function main() {
    const repoData = (await Fs.readFile(WORKSPACE_REPOS_FILE)).toString('utf8');
    const repos: IRepo[] = JSON.parse(repoData);

    for (const repo of repos) {
        if (!existsSync(repo.path)) {
            let git = simpleGit();
            const origin = repo.remotes.find(_ => _.name === 'origin');
            await git.clone(origin.url, repo.path);
            git = simpleGit(repo.path);
            repo.remotes.forEach(async remote => {
                if (remote.name !== 'origin') {
                    await git.addRemote(remote.name, remote.url);
                }
            });
        }
    }
    await Fs.writeFile(PREPARED_REPOS_FILE, repoData);
}

main();