import * as React from 'react';
import { connect } from 'react-redux';
import { ActionedDetails } from '../../../../definitions';
import { RootState } from '../../../../reducers/index';
import { ResultActions } from '../../../../actions/results';
import { GoEye } from 'react-icons/go';

type AuthorProps = {
    result: ActionedDetails;
    locale: string;
    selectAuthor(author: string): void;
};

export function Author(props: AuthorProps) {
    function selectAuthor(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
        event.preventDefault();
        event.stopPropagation();
        props.selectAuthor(props.result.name);
    }
    return (
        <div className="commit-author">
            <span
                role="button"
                style={{ fontSize: '130%', marginRight: '0.2em' }}
                className="btnx hint--right hint--rounded hint--bounce"
                aria-label="Filter by author"
            >
                <a role="button" onClick={selectAuthor}>
                    <GoEye></GoEye>
                </a>
            </span>
            <span className="name hint--right hint--rounded hint--bounce" aria-label={props.result?.email}>
                {props.result?.name}
            </span>
            <span className="timestamp"> on {formatDateTime(props.locale, props.result?.date)}</span>
        </div>
    );
}

function formatDateTime(locale: string, date?: Date) {
    if (date === undefined) {
        return '';
    }

    if (date && typeof date.toLocaleDateString !== 'function') {
        return '';
    }

    const dateOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    };
    try {
        locale = typeof locale === 'string' ? locale.replace('_', '-') : locale;
        return date.toLocaleString(locale);
    } catch {
        // @ts-ignore
        return date.toLocaleString(undefined, dateOptions);
    }
}

function mapStateToProps(state: RootState, wrapper: { result: ActionedDetails }) {
    return {
        result: wrapper.result,
        locale: state.vscode.locale,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        selectAuthor: (text: string) => dispatch(ResultActions.selectAuthor(text)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Author);
