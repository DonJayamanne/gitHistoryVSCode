import * as React from 'react';
import { connect } from 'react-redux';
import { ActionedDetails } from '../../../../definitions';
import { AvatarsState, RootState } from '../../../../reducers/index';

type AvatarProps = {
    result: ActionedDetails;
    avatars: AvatarsState;
};

// tslint:disable-next-line:function-name
function Avatar(props: AvatarProps) {
    let avatarUrl = '';
    if (props.result) {
        const avatar = props.avatars.find(item => item.name === props.result.name && item.email === props.result.email);
        avatarUrl = avatar ? avatar.avatarUrl : '';
    }
    if (avatarUrl) {
        return (<img className='avatar' alt='User' src={avatarUrl} />);
    } else {
        return null;
    }
}

function mapStateToProps(state: RootState, wrapper: { result: ActionedDetails }) {
    return {
        avatars: state.avatars,
        result: wrapper.result
    };
}

// function mapDispatchToProps(dispatch) {
//   return {
//     // ...bindActionCreators({ ...ResultActions }, dispatch),
//     // fetchData: (pageIndex: number) => dispatch(ResultActions.fetchLogEntries(pageIndex))
//     setSize: (size: Size) => dispatch(ResultActions.logViewSizeCalculated(size)),
//     setHeight: (height: number) => dispatch(ResultActions.logEntryHeightCalculated(height)),
//     commitsRendered: () => dispatch(ResultActions.commitsRendered()),
//     onViewCommit: (hash: string) => dispatch(ResultActions.viewCommit(hash)),
//     actionACommit: (logEntry: LogEntry) => dispatch(ResultActions.actionACommit(logEntry))
//   };
// }

export default connect(
    mapStateToProps
)(Avatar);
