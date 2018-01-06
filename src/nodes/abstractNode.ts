import { ICommand } from '../common/types';
import { Node } from './types';

export abstract class AbstractCommandDecoratorNode<T> implements Node {
    public readonly label: string;
    public readonly description: string;
    public readonly detail?: string | undefined;
    constructor(private command: ICommand<T>) {
        this.label = command.label;
        this.description = command.description;
        this.detail = command.detail;
    }
    public async preExecute() {
        return this.command.preExecute ? this.command.preExecute() : true;
    }
    // tslint:disable-next-line:no-any
    public execute(): void | Promise<any> | Thenable<any> {
        return this.command.execute();
    }
}
