import {posix as Path} from 'path';

export interface IRemote {
    name: string;
    url: string;
    fetch: string;
}

export interface IRepo {
    path: string;
    remotes: IRemote[];
}

export const WORKSPACE_DIR = 'workspaces';
export const WORKSPACE_REPOS_FILE = Path.join(WORKSPACE_DIR, 'workspace-repos.json');
export const GIT_CONFIG_DIR = '.git/config';

export const DEVCONTAINER_DIR = '.devcontainer';
export const DEVCONTAINER_CACHE_DIR = Path.join(DEVCONTAINER_DIR, '.cache');
export const PREPARED_REPOS_FILE = Path.join(DEVCONTAINER_CACHE_DIR, 'workspace-repos.json');