// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

import { injectable } from 'inversify';
import { arch } from 'os';
import { IPlatformService } from './types';

@injectable()
export class PlatformService implements IPlatformService {
    private _isWindows: boolean;
    private _isMac: boolean;

    constructor() {
        this._isWindows = /^win/.test(process.platform);
        this._isMac = /^darwin/.test(process.platform);
    }
    public get isWindows(): boolean {
        return this._isWindows;
    }
    public get isMac(): boolean {
        return this._isMac;
    }
    public get isLinux(): boolean {
        return !(this.isWindows || this.isMac);
    }
    public get is64bit(): boolean {
        return arch() === 'x64';
    }
    public get pathVariableName() {
        return this.isWindows ? 'Path' : 'PATH';
    }
}
