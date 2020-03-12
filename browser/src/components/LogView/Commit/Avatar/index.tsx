import * as React from 'react';
import { connect } from 'react-redux';
import { ActionedDetails } from '../../../../definitions';
import { AvatarsState, RootState } from '../../../../reducers/index';

type AvatarProps = {
    result: ActionedDetails;
    avatars: AvatarsState;
};

function Avatar(props: AvatarProps) {
    let avatarUrl = '';
    if (props.result) {
        const avatar = props.avatars.find(
            item =>
                item.name === props.result.name ||
                item.login === props.result.name ||
                item.email === props.result.email,
        );
        avatarUrl = avatar ? avatar.avatarUrl : '';
    }
    if (avatarUrl) {
        return <img className="avatar" alt="User" src={avatarUrl} />;
    } else {
        return null;
    }
}

function mapStateToProps(state: RootState, wrapper: { result: ActionedDetails }) {
    return {
        avatars: state.avatars,
        result: wrapper.result,
    };
}

export default connect(mapStateToProps)(Avatar);
