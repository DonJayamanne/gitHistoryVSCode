import * as React from 'react';
import { Button } from 'react-bootstrap';

enum DialogButtons {
    Ok = 0,
    OkCancel = 1,
}

type DialogProps = {
    onCancel?(): void;
    onOk?(sender: HTMLButtonElement, args: any): void;
};

type DialogState = {
    title: string;
    description: string;
    input: boolean;
    buttons: DialogButtons;
    show: boolean;
    value: string;
}
export default class Dialog extends React.Component<DialogProps, DialogState> {
    private args: any;
    private inputField: HTMLInputElement;
    constructor(props: DialogProps) {
        super(props);
        this.state = {
            show: false,
            value: '',
            title: '',
            description: '',
            input: false,
            buttons: DialogButtons.OkCancel
        };
    }

    private clickHander(e: Event) {
        const button: HTMLButtonElement = e.currentTarget as HTMLButtonElement;

        switch (button.name) {
            case 'cancel':
                if (this.props.onCancel) {
                    this.props.onCancel();
                }
                break;
            case 'ok':
                this.props.onOk(button, this.args);
                break;
        }

        this.setState({show: false});
    }

    private createButtons() {
        switch (this.state.buttons) {
            default:
            case DialogButtons.Ok:
                return [<Button name='ok' bsStyle='primary' onClick={this.clickHander.bind(this)}>Ok</Button>];
            case DialogButtons.OkCancel:
                return [
                    <Button name='cancel' onClick={this.clickHander.bind(this)}>Cancel</Button>,
                    <Button name='ok' style={{'margin-left': '.3em'}} bsStyle='primary' onClick={this.clickHander.bind(this)}>Ok</Button>
                ];
        }
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ value: e.target.value });
    }

    public showMessage(title: string, description: string, args: any = undefined) {
        this.setState({show: true, title, description});
        this.args = args;
    }

    public showInput(title: string, description: string, args: any = undefined) {
        this.setState({show: true, input: true, title, description, buttons: DialogButtons.OkCancel}, () => {
            this.inputField.focus();
            this.inputField.select();
        });
        this.args = args;
    }

    public getValue() {
        return this.state.value;
    }

    public render() {
        return (
            <div id='dialog' hidden={!this.state.show}>
                <div>
                    <div>
                        <h4>{this.state.title}</h4>
                        <div dangerouslySetInnerHTML={{__html: this.state.description}}></div>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '1em'}}>
                        <input hidden={!this.state.input} ref={(i) => this.inputField = i} className={'textInput'} type="text" value={this.state.value} onChange={this.handleChange} placeholder="Enter value" />
                    </div>
                    <hr />
                    <div style={{textAlign: 'right'}}>
                        {this.createButtons()}
                    </div>
                </div>
            </div>
        );
    }
}