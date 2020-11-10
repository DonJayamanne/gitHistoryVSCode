import * as React from 'react';
import * as ReactDOM from 'react-dom';
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
    type: DialogType;
    description: string;
    input: boolean;
    placeholder: string;
    buttons: DialogButtons;
    show: boolean;
    value: string;
};

export enum DialogType {
    Info = 0,
    Warning = 1,
}
/**
 * A simple dialog component to display a modal window
 */
export default class Dialog extends React.Component<DialogProps, DialogState> {
    private args: any;
    private inputField: HTMLInputElement;
    private buttonOk: Button;

    constructor(props: DialogProps) {
        super(props);
        this.state = {
            show: false,
            type: DialogType.Info,
            value: '',
            title: '',
            placeholder: 'Please enter a value here',
            description: '',
            input: false,
            buttons: DialogButtons.OkCancel,
        };
    }

    /**
     * handle click event of dialog buttons
     * @param e the given event
     */
    private clickHander(e: React.MouseEvent<Button, MouseEvent>) {
        const button: HTMLButtonElement = ReactDOM.findDOMNode(e.currentTarget) as HTMLButtonElement;

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

        this.setState({ show: false });
    }

    /**
     * create the buttons dependend on the given DialogButtons enum or dialog type (E.g. showInput, showMessage)
     */
    private createButtons() {
        switch (this.state.buttons) {
            default:
            case DialogButtons.Ok:
                return [
                    <Button
                        key="btnOk"
                        name="ok"
                        ref={i => (this.buttonOk = i)}
                        bsStyle="primary"
                        onClick={this.clickHander.bind(this)}
                    >
                        Ok
                    </Button>,
                ];
            case DialogButtons.OkCancel:
                return [
                    <Button key="btnCancel" name="cancel" onClick={this.clickHander.bind(this)}>
                        Cancel
                    </Button>,
                    <Button
                        key="btnOk"
                        name="ok"
                        onKeyDown={this.handleKeyDown.bind(this)}
                        ref={i => (this.buttonOk = i)}
                        style={{ marginLeft: '.3em' }}
                        bsStyle="primary"
                        onClick={this.clickHander.bind(this)}
                    >
                        Ok
                    </Button>,
                ];
        }
    }

    /**
     * input change handler triggered on any text change to update field value
     */
    private handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({ value: e.target.value });
    }

    /**
     * KeyDown handler to submit data using 'Enter' key or cancel using 'Escape' key
     */
    private handleKeyDown(e: React.KeyboardEvent<any>) {
        if (e.key === 'Enter' && !(e.currentTarget instanceof HTMLButtonElement)) {
            const buttonEl = ReactDOM.findDOMNode(this.buttonOk) as HTMLButtonElement;
            buttonEl.click();
        } else if (e.key === 'Escape') {
            this.setState({ show: false });
        }
    }

    /**
     * Display a simple message box a user can confirm with DialogButtons.Ok button
     *
     * @param title title of the dialog
     * @param description description with html entities support
     * @param args optional arguments
     */
    public showMessage(
        title: string,
        description: string,
        dialogType: DialogType = DialogType.Info,
        args: any = undefined,
    ) {
        this.setState({ show: true, title, description, input: false, buttons: DialogButtons.Ok, type: dialogType });
        this.args = args;
    }

    /**
     * Display a simple message box a user can confirm with DialogButtons.Ok button
     *
     * @param title title of the dialog
     * @param description description with html entities support
     * @param args optional arguments
     */
    public showConfirm(
        title: string,
        description: string,
        dialogType: DialogType = DialogType.Info,
        args: any = undefined,
    ) {
        this.setState(
            { show: true, title, description, input: false, buttons: DialogButtons.OkCancel, type: dialogType },
            () => {
                const buttonEl = ReactDOM.findDOMNode(this.buttonOk) as HTMLButtonElement;
                buttonEl.focus();
            },
        );
        this.args = args;
    }

    /**
     * Display an input dialog allow the user to enter text and either submit or cancel using DialogButtons.OkCancel buttons
     *
     * @param title title of the dialog
     * @param description description with html entities support
     * @param args optional arguments
     */
    public showInput(
        title: string,
        description: string,
        placeholder = '',
        dialogType: DialogType = DialogType.Info,
        args: any = undefined,
    ) {
        this.setState(
            {
                show: true,
                input: true,
                title,
                description,
                placeholder,
                buttons: DialogButtons.OkCancel,
                type: dialogType,
            },
            () => {
                this.inputField.focus();
                this.inputField.select();
            },
        );
        this.args = args;
    }

    /**
     * Fetch the value given in text field
     */
    public getValue() {
        return this.state.value;
    }

    public getTypeIcon() {
        switch (this.state.type) {
            default:
            case DialogType.Info:
                return `${window['extensionPath']}/resources/icons/misc/dialog-info.svg`;
            case DialogType.Warning:
                return `${window['extensionPath']}/resources/icons/misc/dialog-warning.svg`;
        }
    }

    public render() {
        return (
            <div id="dialog" hidden={!this.state.show}>
                <div>
                    <div className="dialog-content">
                        <img src={this.getTypeIcon()} height={50} />
                        <div style={{ flexGrow: 1 }}>
                            <h4>{this.state.title}</h4>
                            <div dangerouslySetInnerHTML={{ __html: this.state.description }}></div>
                        </div>
                    </div>
                    <hr />
                    <div className="dialog-footer">
                        <div>
                            <input
                                hidden={!this.state.input}
                                ref={i => (this.inputField = i)}
                                className={'textInput'}
                                type="text"
                                value={this.state.value}
                                onKeyDown={this.handleKeyDown.bind(this)}
                                onChange={this.handleChange.bind(this)}
                                placeholder={this.state.placeholder}
                            />
                        </div>
                        <div style={{ textAlign: 'right' }}>{this.createButtons()}</div>
                    </div>
                </div>
            </div>
        );
    }
}
