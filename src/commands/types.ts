export const ICommandHandler = Symbol('ICommandHandler');

export interface ICommandHandler {
}

export const IGitHistoryCommandHandler = Symbol('IGitHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitHistoryCommandHandler extends ICommandHandler {

}

export const IGitFileHistoryCommandHandler = Symbol('IGitFileHistoryCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitFileHistoryCommandHandler extends ICommandHandler {

}

export const IGitCommitCommandHandler = Symbol('IGitCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCommitCommandHandler extends ICommandHandler {

}

export const IGitCherryPickCommandHandler = Symbol('IGitCherryPickCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCherryPickCommandHandler extends ICommandHandler {

}

export const IGitBranchFromCommitCommandHandler = Symbol('IGitBranchFromCommitCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitBranchFromCommitCommandHandler extends ICommandHandler {

}

export const IGitCompareCommandHandler = Symbol('IGitCompareCommandHandler');
// tslint:disable-next-line:no-empty-interface
export interface IGitCompareCommandHandler extends ICommandHandler {

}

export const ICommandHandlerManager = Symbol('ICommandHandlerManager');

export interface ICommandHandlerManager {
    registerHandlers(): void;
}
