import { ICommand } from '../common/types';

export abstract class BaseCommand<T> implements ICommand<T> {
    // tslint:disable-next-line:no-any no-banned-terms
    private _arguments: any[];
    // tslint:disable-next-line:no-banned-terms
    public get arguments() {
        return this._arguments;
    }
    private _command: string;
    private _title: string;
    private _description: string;
    private _detail?: string;
    private _tooltip?: string;
    public get command() {
        return this._command;
    }
    public get title() {
        return this._title;
    }
    public get label() {
        return this._title;
    }
    public get description() {
        return this._description;
    }
    public get detail() {
        return this._detail;
    }
    public get tooltip() {
        return this._tooltip;
    }
    constructor(public readonly data: T) { }
    public abstract execute();
    public async preExecute(): Promise<boolean> {
        return true;
    }
    protected setTitle(value: string) {
        this._title = value;
    }
    protected setCommand(value: string) {
        this._command = value;
    }
    // tslint:disable-next-line:no-any
    protected setCommandArguments(args: any[]) {
        this._arguments = args;
    }
    protected setDescription(value: string) {
        this._description = value;
    }
    protected setDetail(value: string) {
        this._detail = value;
    }
    protected setTooltip(value: string) {
        this._tooltip = value;
    }
}
