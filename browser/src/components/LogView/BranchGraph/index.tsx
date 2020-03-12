import * as React from 'react';
import { connect } from 'react-redux';
import { RootState } from '../../../reducers';
import { BranchGrapProps, drawGitGraph } from './svgGenerator';

class BrachGraph extends React.Component<BranchGrapProps> {
    componentDidUpdate(prevProps: BranchGrapProps) {
        if (this.props.hideGraph) {
            drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, this.props.itemHeight, [], true);
            return;
        }
        if (prevProps.updateTick === this.props.updateTick) {
            return;
        }

        // Hack, first clear before rebuilding.
        // Remember, we will need to support apending results, as opposed to clearing page
        drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, this.props.itemHeight, []);
        drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, this.props.itemHeight, this.props.logEntries);
    }

    private svg: SVGSVGElement;
    render() {
        return <svg className="commitGraph" ref={ref => (this.svg = ref)} xmlns="http://www.w3.org/2000/svg"></svg>;
    }
}

function mapStateToProps(state: RootState): BranchGrapProps {
    const hideGraph =
        state &&
        state.logEntries &&
        ((state.settings.searchText && state.settings.searchText.length > 0) ||
            (state.settings.file && state.settings.file.length > 0) ||
            (state.settings.authorFilter && state.settings.authorFilter.length > 0) ||
            state.logEntries.isLoading);

    return {
        logEntries: state.logEntries.items,
        hideGraph,
        itemHeight: state.graph.itemHeight,
        updateTick: state.graph.updateTick,
    };
}

export default connect(mapStateToProps)(BrachGraph);
