import { ICommand } from '../common/types';

export abstract class BaseCommand<T> implements ICommand<T> {
    private _name: string;
    private _label: string;
    private _description: string;
    private _detail?: string;
    public get name() {
        return this._name;
    }
    public get label() {
        return this._label;
    }
    public get description() {
        return this._description;
    }
    public get detail() {
        return this._detail;
    }
    constructor(public readonly data: T) { }
    public abstract execute();
    public preExecute(): boolean | Promise<boolean> {
        return true;
    }
    protected setLabel(value: string) {
        this._label = value;
    }
    protected setName(value: string) {
        this._name = value;
    }
    protected setDescription(value: string) {
        this._label = value;
    }
    protected setDetail(value: string) {
        this._label = value;
    }
}
