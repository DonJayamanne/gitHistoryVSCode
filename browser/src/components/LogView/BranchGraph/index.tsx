import * as React from 'react';
import { connect } from 'react-redux';
import { RootState, LogEntriesState } from '../../../reducers';
import { ISettings, Graph } from '../../../../../src/types';

type BranchGrapProps = {
    logEntries: LogEntriesState;
    graph: Graph;
    settings: ISettings;
};

const COLORS = [
    '#ffab1d',
    '#fd8c25',
    '#f36e4a',
    '#fc6148',
    '#d75ab6',
    '#b25ade',
    '#6575ff',
    '#7b77e9',
    '#4ea8ec',
    '#00d0f5',
    '#4eb94e',
    '#51af23',
    '#8b9f1c',
    '#d0b02f',
    '#d0853a',
    '#a4a4a4',
    '#ffc51f',
    '#fe982c',
    '#fd7854',
    '#ff705f',
    '#e467c3',
    '#bd65e9',
    '#7183ff',
    '#8985f7',
    '#55b6ff',
    '#10dcff',
    '#51cd51',
    '#5cba2e',
    '#9eb22f',
    '#debe3d',
    '#e19344',
    '#b8b8b8',
    '#ffd03b',
    '#ffae38',
    '#ff8a6a',
    '#ff7e7e',
    '#ef72ce',
    '#c56df1',
    '#8091ff',
    '#918dff',
    '#69caff',
    '#3ee1ff',
    '#72da72',
    '#71cf43',
    '#abbf3c',
    '#e6c645',
    '#eda04e',
    '#c5c5c5',
    '#ffd84c',
    '#ffb946',
    '#ff987c',
    '#ff8f8f',
    '#fb7eda',
    '#ce76fa',
    '#90a0ff',
    '#9c98ff',
    '#74cbff',
    '#64e7ff',
    '#7ce47c',
    '#85e357',
    '#b8cc49',
    '#edcd4c',
    '#f9ad58',
    '#d0d0d0',
    '#ffe651',
    '#ffbf51',
    '#ffa48b',
    '#ff9d9e',
    '#ff8de1',
    '#d583ff',
    '#97a9ff',
    '#a7a4ff',
    '#82d3ff',
    '#76eaff',
    '#85ed85',
    '#8deb5f',
    '#c2d653',
    '#f5d862',
    '#fcb75c',
    '#d7d7d7',
    '#fff456',
    '#ffc66d',
    '#ffb39e',
    '#ffabad',
    '#ff9de5',
    '#da90ff',
    '#9fb2ff',
    '#b2afff',
    '#8ddaff',
    '#8bedff',
    '#99f299',
    '#97f569',
    '#cde153',
    '#fbe276',
    '#ffc160',
    '#e1e1e1',
    '#fff970',
    '#ffd587',
    '#ffc2b2',
    '#ffb9bd',
    '#ffa5e7',
    '#de9cff',
    '#afbeff',
    '#bbb8ff',
    '#9fd4ff',
    '#9aefff',
    '#b3f7b3',
    '#a0fe72',
    '#dbef6c',
    '#fcee98',
    '#ffca69',
    '#eaeaea',
    '#763700',
    '#9f241e',
    '#982c0e',
    '#a81300',
    '#80035f',
    '#650d90',
    '#082fca',
    '#3531a3',
    '#1d4892',
    '#006f84',
    '#036b03',
    '#236600',
    '#445200',
    '#544509',
    '#702408',
    '#343434',
    '#9a5000',
    '#b33a20',
    '#b02f0f',
    '#c8210a',
    '#950f74',
    '#7b23a7',
    '#263dd4',
    '#4642b4',
    '#1d5cac',
    '#00849c',
    '#0e760e',
    '#287800',
    '#495600',
    '#6c5809',
    '#8d3a13',
    '#4e4e4e',
    '#c36806',
    '#c85120',
    '#bf3624',
    '#df2512',
    '#aa2288',
    '#933bbf',
    '#444cde',
    '#5753c5',
    '#1d71c6',
    '#0099bf',
    '#188018',
    '#2e8c00',
    '#607100',
    '#907609',
    '#ab511f',
    '#686868',
    '#e47b07',
    '#e36920',
    '#d34e2a',
    '#ec3b24',
    '#ba3d99',
    '#9d45c9',
    '#4f5aec',
    '#615dcf',
    '#3286cf',
    '#00abca',
    '#279227',
    '#3a980c',
    '#6c7f00',
    '#ab8b0a',
    '#b56427',
    '#757575',
    '#ff911a',
    '#fc8120',
    '#e7623e',
    '#fa5236',
    '#ca4da9',
    '#a74fd3',
    '#5a68ff',
    '#6d69db',
    '#489bd9',
    '#00bcde',
    '#36a436',
    '#47a519',
    '#798d0a',
    '#c1a120',
    '#bf7730',
    '#8e8e8e',
];

type BranchGraphItem = { path: SVGPathElement; hash: string; level: number };

function drawGraph(svg: SVGElement, props: BranchGrapProps) {
    const cy = props.graph.itemHeight / 2;
    const r = 4;
    const cx = 15;
    let cyOffset = 0;
    let cxOffset = 0;

    const branchLines: BranchGraphItem[] = [];
    const circles: SVGCircleElement[] = [];

    let i = 0;
    let isNewBranch = true;
    let maxLevel = 0;

    branchLines.push({
        hash: props.logEntries.items[0].hash.full,
        path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
        level: 1,
    });
    try {
        // only up to the necessary entries
        for (i; i < props.logEntries.items.length; i++) {
            const hash = props.logEntries.items[i].hash.full;
            const nextEntry = props.logEntries.items.length > i + 1 ? props.logEntries.items[i + 1] : null;
            const parents = props.logEntries.items[i].parents.map(x => x.full);

            let branchLine = branchLines.filter(x => x.hash === hash).shift();

            cyOffset += cy;
            cxOffset = branchLine.level * cx;

            const filtered = branchLines.filter(xc => xc.hash === hash);

            if (filtered.length > 1) {
                while (filtered.length > 1) {
                    const found = filtered.pop();
                    const index = branchLines.indexOf(found);
                    const p =
                        ' L' +
                        found.level * cx +
                        ' ' +
                        (cyOffset - cy).toFixed() +
                        ' L ' +
                        cxOffset.toFixed() +
                        ' ' +
                        cyOffset.toFixed();
                    found.path.setAttribute('d', found.path.getAttribute('d') + p);
                    svg.appendChild(found.path);
                    branchLines.splice(index, 1);
                }
            }

            branchLine.hash = parents[0];

            if (parents.length > 1) {
                if (isNewBranch) {
                    branchLine.path.setAttribute(
                        'd',
                        'M' +
                            cxOffset.toFixed() +
                            ' ' +
                            cyOffset.toFixed() +
                            ' L' +
                            (branchLine.level * cx).toFixed() +
                            ' ' +
                            (cyOffset + cy).toFixed(),
                    );
                    branchLine.path.setAttribute('style', 'stroke:' + COLORS[branchLine.level]);
                    isNewBranch = false;
                }

                // continue the previous
                branchLine.path.setAttribute('d', branchLine.path.getAttribute('d') + ' L' + cxOffset + ' ' + cyOffset);

                const currentMaxLevel = Math.max(...branchLines.map(x => x.level));
                const nextLevel = currentMaxLevel + 1;

                //parents.shift();
                parents.forEach(x => {
                    if (branchLines.map(x => x.hash).indexOf(x) > -1) return;
                    branchLine = {
                        hash: x,
                        path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                        level: nextLevel,
                    };
                    branchLines.push(branchLine);
                    isNewBranch = true;
                });
            }

            maxLevel = maxLevel < branchLines.length - 1 ? branchLines.length - 1 : maxLevel;

            const found = branchLines.filter(x => x.hash === nextEntry?.hash?.full).pop();
            const foundIndex = branchLines.indexOf(found);

            if (isNewBranch) {
                branchLine.path.setAttribute(
                    'd',
                    'M' +
                        cxOffset.toFixed() +
                        ' ' +
                        cyOffset.toFixed() +
                        ' L' +
                        (branchLine.level * cx).toFixed() +
                        ' ' +
                        (cyOffset + cy).toFixed(),
                );
                branchLine.path.setAttribute('style', 'stroke:' + COLORS[branchLine.level]);
                isNewBranch = false;
            } else {
                branchLine.path.setAttribute(
                    'd',
                    branchLine.path.getAttribute('d') + ' L' + cxOffset.toFixed() + ' ' + cyOffset.toFixed(),
                );
            }

            const svgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

            svgCircle.setAttribute('cx', cxOffset.toString());
            svgCircle.setAttribute('cy', cyOffset.toString());
            svgCircle.setAttribute('r', r.toString());

            circles.push(svgCircle);

            if (nextEntry != null && foundIndex === -1) {
                // current known max level
                const currentMaxLevel = Math.max(...branchLines.map(x => x.level));
                const nextLevel = currentMaxLevel + 1;
                // when the parent does not match with the next hash
                branchLine = {
                    hash: nextEntry.hash.full,
                    path: document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                    level: nextLevel,
                };
                branchLines.push(branchLine);
                //const activeLineCount = branchLines.length - 1;
                branchLine.path.setAttribute(
                    'd',
                    'M' + (nextLevel * cx).toFixed() + ' ' + (cyOffset + props.graph.itemHeight).toFixed(),
                );
                branchLine.path.setAttribute('style', 'stroke:' + COLORS[nextLevel]);
            }

            cyOffset += cy;
        }
    } catch (ex) {
        console.error(ex);
    }

    branchLines.forEach((x, lvl) => {
        const cxOffset = (lvl + 1) * cx;
        // draw line until the end
        x.path.setAttribute('d', x.path.getAttribute('d') + ' L' + cxOffset + ' ' + cyOffset);
        svg.appendChild(x.path);
    });

    circles.forEach(x => svg.appendChild(x));

    const scrollOffset = props.graph.itemHeight * props.graph.startIndex;
    svg.style.top = scrollOffset * -1 + 'px';
    svg.setAttribute('height', (props.graph.height + scrollOffset).toString());

    setGraphOffset(svg, (maxLevel + 1) * (cx + r));
    // find the React virtualize grid to add some padding
    ((svg.nextSibling as HTMLDivElement).firstChild as HTMLDivElement).style.paddingLeft =
        (maxLevel + 1) * (cx + r) + 'px';
}

function setGraphOffset(svg: SVGElement, offset: number) {
    // find the React virtualize grid to add some padding
    ((svg.nextSibling as HTMLDivElement).firstChild as HTMLDivElement).style.paddingLeft = offset + 'px';
}

class BrachGraph extends React.Component<BranchGrapProps> {
    private svg: SVGElement;

    componentDidUpdate(prevProps: BranchGrapProps) {
        // clear previous dawing
        this.svg.innerHTML = '';
        // reset the padding offset
        setGraphOffset(this.svg, 0);

        // clear the graph when in loading state (due to isLoading)
        if (!this.props.graph) {
            return;
        }

        // do not display graph when filtering is achieved
        if (this.props.settings.searchText || this.props.settings.authorFilter) {
            return;
        }

        drawGraph(this.svg, this.props);
    }

    render() {
        return <svg className="commitGraph" ref={ref => (this.svg = ref)} xmlns="http://www.w3.org/2000/svg"></svg>;
    }
}

function mapStateToProps(state: RootState): BranchGrapProps {
    return {
        graph: state.graph,
        logEntries: state.logEntries,
        settings: state.settings,
    };
}

export default connect(mapStateToProps)(BrachGraph);
