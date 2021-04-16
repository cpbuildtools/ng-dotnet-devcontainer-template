import { sync } from 'fast-glob';
import * as Fs from 'fs/promises';
import { existsSync } from 'node:fs';
import { posix as Path } from 'path';
import simpleGit from 'simple-git';
import {
    GIT_CONFIG_DIR,
    IRemote,
    IRepo,
    PREPARED_REPOS_FILE,
    WORKSPACE_DIR,
    WORKSPACE_REPOS_FILE
} from './common/types';


async function main() {
    if(!existsSync(PREPARED_REPOS_FILE)){
        return;
    }
    const gitPaths = sync(Path.join(WORKSPACE_DIR, '*', GIT_CONFIG_DIR));
    const repos: IRepo[] = [];

    for (const gitPath of gitPaths) {
        const path = Path.dirname(Path.dirname(gitPath));
        const repo = {
            path,
            remotes: []
        };
        repos.push(repo);
        const git = simpleGit(path);
        const configs = await git.listConfig();

        const remotes: Map<string, IRemote> = new Map();
        const cfg = configs.values[GIT_CONFIG_DIR];
        for (const key in cfg) {
            if (Object.prototype.hasOwnProperty.call(cfg, key)) {
                const value = cfg[key];
                const keyParts = key.split('.');
                switch (keyParts[0]) {
                    case 'remote':
                        const name = keyParts[1];
                        const prop = keyParts[2];
                        if (!remotes.has(name)) {
                            remotes.set(name, { name } as IRemote);
                        }
                        const r = remotes.get(name);
                        r[prop] = value;
                        break;
                }

            }
        }
        repo.remotes = Array.from(remotes.values());
    }
    await Fs.writeFile(WORKSPACE_REPOS_FILE, JSON.stringify(repos, undefined, 2));
    const git = simpleGit('.');
    await git.add(WORKSPACE_REPOS_FILE);
}

main();
