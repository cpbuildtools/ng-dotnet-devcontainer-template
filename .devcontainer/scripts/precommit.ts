import { sync } from 'fast-glob';
import simpleGit, { } from 'simple-git';
import * as Path from 'path';
import * as Fs from 'fs/promises';


interface IRemote {
    name: string;
    url: string;
    fetch: string;
}

interface IRepo {
    path: string;
    remotes: IRemote[];
}

async function main() {
    const gitPaths = sync('workspaces/*/.git/config');
    const repos:IRepo[] = [];

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
        const cfg = configs.values['.git/config'];
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
    await Fs.writeFile('workspaces/workspace-repos.json', JSON.stringify(repos, undefined, 2));
    const git = simpleGit('.');
    await git.add('workspaces/workspace-repos.json');
}

main();
