// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from 'fs';

export enum Architecture {
    Unknown = 1,
    x86 = 2,
    x64 = 3
}

export const IPlatformService = Symbol('IPlatformService');
export interface IPlatformService {
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
    is64bit: boolean;
    pathVariableName: 'Path' | 'PATH';
}

export const IFileSystem = Symbol('IFileSystem');
export interface IFileSystem {
    directorySeparatorChar: string;
    objectExistsAsync(path: string, statCheck: (s: fs.Stats) => boolean): Promise<boolean>;
    fileExistsAsync(path: string): Promise<boolean>;
    directoryExistsAsync(path: string): Promise<boolean>;
    createDirectoryAsync(path: string): Promise<void>;
    getSubDirectoriesAsync(rootDir: string): Promise<string[]>;
    arePathsSame(path1: string, path2: string): boolean;
}
