// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

'use strict';

import * as fs from 'fs';
import * as fse from 'fs-extra';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import { IFileSystem, IPlatformService } from './types';

@injectable()
export class FileSystem implements IFileSystem {
    constructor(@inject(IPlatformService) private platformService: IPlatformService) { }

    public get directorySeparatorChar(): string {
        return path.sep;
    }

    public objectExistsAsync(filePath: string, statCheck: (s: fs.Stats) => boolean): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            fse.stat(filePath, (error, stats) => {
                if (error) {
                    return resolve(false);
                }

                return resolve(statCheck(stats));
            });
        });
    }

    public fileExistsAsync(filePath: string): Promise<boolean> {
        return this.objectExistsAsync(filePath, (stats) => stats.isFile());
    }

    public directoryExistsAsync(filePath: string): Promise<boolean> {
        return this.objectExistsAsync(filePath, (stats) => stats.isDirectory());
    }

    public createDirectoryAsync(directoryPath: string): Promise<void> {
        return fse.mkdirp(directoryPath);
    }

    public getSubDirectoriesAsync(rootDir: string): Promise<string[]> {
        return new Promise<string[]>(resolve => {
            // tslint:disable-next-line:non-literal-fs-path
            fs.readdir(rootDir, (error, files) => {
                if (error) {
                    return resolve([]);
                }
                const subDirs: string[] = [];
                files.forEach(name => {
                    const fullPath = path.join(rootDir, name);
                    try {
                        // tslint:disable-next-line:non-literal-fs-path
                        if (fs.statSync(fullPath).isDirectory()) {
                            subDirs.push(fullPath);
                        }
                        // tslint:disable-next-line:no-empty
                    } catch (ex) { }
                });
                resolve(subDirs);
            });
        });
    }

    public arePathsSame(path1: string, path2: string): boolean {
        const path1ToCompare = path.normalize(path1);
        const path2ToCompare = path.normalize(path2);
        if (this.platformService.isWindows) {
            return path1ToCompare.toUpperCase() === path2ToCompare.toUpperCase();
        } else {
            return path1ToCompare === path2ToCompare;
        }
    }
}
