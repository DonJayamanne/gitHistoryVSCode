import * as path from 'path';

const resourcesPath = path.join(__dirname, '..', '..', 'resources');

export const AddedIcon = {
    light: path.join(resourcesPath, 'icons', 'light', 'status-added.svg'),
    dark: path.join(resourcesPath, 'icons', 'dark', 'status-added.svg'),
};
export const RemovedIcon = {
    light: path.join(resourcesPath, 'icons', 'light', 'status-deleted.svg'),
    dark: path.join(resourcesPath, 'icons', 'dark', 'status-deleted.svg'),
};
export const ModifiedIcon = {
    light: path.join(resourcesPath, 'icons', 'light', 'status-modified.svg'),
    dark: path.join(resourcesPath, 'icons', 'dark', 'status-modified.svg'),
};
export const RenameIcon = {
    light: path.join(resourcesPath, 'icons', 'light', 'status-renamed.svg'),
    dark: path.join(resourcesPath, 'icons', 'dark', 'status-renamed.svg'),
};
