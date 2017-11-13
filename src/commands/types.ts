import { Disposable } from 'vscode';

export const IGitHistoryCommandHandler = Symbol('IGitHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitHistoryCommandHandler extends Disposable {

}

export const IGitFileHistoryCommandHandler = Symbol('IGitFileHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitFileHistoryCommandHandler extends Disposable {

}

export const IGitCommitCommandHandler = Symbol('IGitCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitCommandHandler extends Disposable {

}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends Disposable {

}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends Disposable {

}
