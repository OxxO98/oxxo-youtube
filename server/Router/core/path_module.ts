import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getEnvPath(name: string) {
    const value = process.env[name];

    if (typeof value !== 'string' || value.trim() === '') {
        return null;
    }

    return path.resolve(value);
}

function resolveAppRoot() {
    const envAppRoot = getEnvPath('APP_ROOT');

    if (envAppRoot !== null) {
        return envAppRoot;
    }

    const parts = __dirname.split(path.sep);
    const distIndex = parts.lastIndexOf('dist');

    if (distIndex > 0 && parts[distIndex - 1] === 'server') {
        return path.resolve(__dirname, '../../../..');
    }

    return path.resolve(__dirname, '../../..');
}

export const appRoot = resolveAppRoot();
export const serverRoot = path.join(appRoot, 'server');
export const assetPath = getEnvPath('APP_ASSET_ROOT') ?? path.join(serverRoot, 'Asset');
export const clientBuildPath = path.join(appRoot, 'build');
