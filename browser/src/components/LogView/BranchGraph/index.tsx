import * as jQuery from 'jquery';
import * as React from 'react';
import { connect } from 'react-redux';
import { LogEntry, RefType } from '../../../definitions';
import { RootState } from '../../../reducers';

type BranchGrapProps = {
    logEntries: LogEntry[];
    height?: string;
    width?: string;
    itemHeight?: number;
    updateTick?: number;
};

// tslint:disable-next-line:no-any
let branches: { hash: string, path: any, x?: number, wasFictional: boolean }[] = [];
let branchColor = 0;
const COLORS = ['#ffab1d', '#fd8c25', '#f36e4a', '#fc6148', '#d75ab6', '#b25ade', '#6575ff', '#7b77e9', '#4ea8ec', '#00d0f5', '#4eb94e', '#51af23', '#8b9f1c', '#d0b02f', '#d0853a', '#a4a4a4',
    '#ffc51f', '#fe982c', '#fd7854', '#ff705f', '#e467c3', '#bd65e9', '#7183ff', '#8985f7', '#55b6ff', '#10dcff', '#51cd51', '#5cba2e', '#9eb22f', '#debe3d', '#e19344', '#b8b8b8',
    '#ffd03b', '#ffae38', '#ff8a6a', '#ff7e7e', '#ef72ce', '#c56df1', '#8091ff', '#918dff', '#69caff', '#3ee1ff', '#72da72', '#71cf43', '#abbf3c', '#e6c645', '#eda04e', '#c5c5c5',
    '#ffd84c', '#ffb946', '#ff987c', '#ff8f8f', '#fb7eda', '#ce76fa', '#90a0ff', '#9c98ff', '#74cbff', '#64e7ff', '#7ce47c', '#85e357', '#b8cc49', '#edcd4c', '#f9ad58', '#d0d0d0',
    '#ffe651', '#ffbf51', '#ffa48b', '#ff9d9e', '#ff8de1', '#d583ff', '#97a9ff', '#a7a4ff', '#82d3ff', '#76eaff', '#85ed85', '#8deb5f', '#c2d653', '#f5d862', '#fcb75c', '#d7d7d7',
    '#fff456', '#ffc66d', '#ffb39e', '#ffabad', '#ff9de5', '#da90ff', '#9fb2ff', '#b2afff', '#8ddaff', '#8bedff', '#99f299', '#97f569', '#cde153', '#fbe276', '#ffc160', '#e1e1e1',
    '#fff970', '#ffd587', '#ffc2b2', '#ffb9bd', '#ffa5e7', '#de9cff', '#afbeff', '#bbb8ff', '#9fd4ff', '#9aefff', '#b3f7b3', '#a0fe72', '#dbef6c', '#fcee98', '#ffca69', '#eaeaea',
    '#763700', '#9f241e', '#982c0e', '#a81300', '#80035f', '#650d90', '#082fca', '#3531a3', '#1d4892', '#006f84', '#036b03', '#236600', '#445200', '#544509', '#702408', '#343434',
    '#9a5000', '#b33a20', '#b02f0f', '#c8210a', '#950f74', '#7b23a7', '#263dd4', '#4642b4', '#1d5cac', '#00849c', '#0e760e', '#287800', '#495600', '#6c5809', '#8d3a13', '#4e4e4e',
    '#c36806', '#c85120', '#bf3624', '#df2512', '#aa2288', '#933bbf', '#444cde', '#5753c5', '#1d71c6', '#0099bf', '#188018', '#2e8c00', '#607100', '#907609', '#ab511f', '#686868',
    '#e47b07', '#e36920', '#d34e2a', '#ec3b24', '#ba3d99', '#9d45c9', '#4f5aec', '#615dcf', '#3286cf', '#00abca', '#279227', '#3a980c', '#6c7f00', '#ab8b0a', '#b56427', '#757575',
    '#ff911a', '#fc8120', '#e7623e', '#fa5236', '#ca4da9', '#a74fd3', '#5a68ff', '#6d69db', '#489bd9', '#00bcde', '#36a436', '#47a519', '#798d0a', '#c1a120', '#bf7730', '#8e8e8e'];

// TODO: Think about appending (could be very expensive, but could be something worthwhile)
// Appending could produce a better UX
// Dunno, I think, cuz this way you can see where merges take place, rather than seeing a line vanish off
// tslint:disable-next-line:max-func-body-length cyclomatic-complexity
function drawGitGraph(svg: SVGSVGElement, content: HTMLElement, startAt: number, logEntryHeight: number = 60.8, entries: LogEntry[]) {
    // tslint:disable-next-line:no-debugger
    debugger;
    while (svg.children.length > 0) {
        svg.removeChild(svg.children[0]);
    }
    if (entries.length === 0) {
        svg.style.display = 'none';
        return;
    }
    if (startAt === 0) {
        branches = [];
        branchColor = 0;
    }
    svg.style.display = '';
    // Draw the graph
    const circleOffset = 0; // 0.5 * logEntryHeight;
    const standardOffset = (0 + 0.5) * logEntryHeight;
    let currentY = (0 + 0.5) * logEntryHeight;
    const topMostY = (0 + 0.5) * logEntryHeight;
    // topMostY = (0 + 0.5) * logEntryHeight;
    let maxLeft = 0;
    let lastXOffset = 12;
    let maxXOffset = 12;
    if (startAt === 0) {
        branchColor = 0;
    }
    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < startAt; i++) {
        content.children[i].className = 'hidden';
    }
    // Use this for new orphaned branches
    const circlesToAppend: SVGCircleElement[] = [];
    let branched = false;
    // tslint:disable-next-line:no-increment-decrement
    for (let i = startAt; i < content.children.length; ++i) {
        if (i >= entries.length) {
            break;
        }
        const entry = entries[i];
        const entryElement = content.children[i];
        if (!entry) {
            break;
        }
        let index = 0;
        // tslint:disable-next-line:no-any
        (entryElement as any).branchesOnLeft = branches.length;

        // Find branches to join
        let childCount = 0;
        const xOffset = 12;
        let removedBranches = 0;
        let branchFound = i === startAt ? true : false;
        let padParentCount = 0;
        // tslint:disable-next-line:no-shadowed-variable
        for (let j = 0; j < branches.length;) {
            const branch = branches[j];
            if (branch.hash === entry.hash.full) {
                branchFound = true;
                if (childCount === 0) {
                    // Replace the branch
                    branch.path.setAttribute('d', branch.path.cmds + currentY);
                    if (entry.parents.length === 0) {
                        branches.splice(j, 1);
                        branched = true;
                    } else {
                        branch.hash = entry.parents[0].full;
                    }
                    index = j;
                    // tslint:disable-next-line:no-increment-decrement
                    ++j;
                } else {
                    // Join the branch
                    const x = (index + 1) * xOffset;
                    // tslint:disable-next-line:prefer-template
                    branch.path.setAttribute('d', branch.path.cmds + (currentY - logEntryHeight / 2) + ' L ' + x + ' ' + currentY);
                    branches.splice(j, 1);
                    branched = true;
                    // tslint:disable-next-line:no-increment-decrement
                    ++removedBranches;
                }
                // tslint:disable-next-line:no-increment-decrement
                ++childCount;
            } else {
                if (removedBranches !== 0) {
                    const x = (j + 1) * xOffset;
                    // tslint:disable-next-line:prefer-template
                    branch.path.setAttribute('d', branch.path.cmds + (currentY - logEntryHeight / 2) + ' L ' + x + ' ' + currentY);
                }
                // tslint:disable-next-line:no-increment-decrement
                ++j;
            }
        }

        // Add new branches
        let xFromFictionalBranch = 0;
        let j = 0;
        // tslint:disable-next-line:no-increment-decrement
        for (j = 0; j < entry.parents.length; ++j) {
            const parent = entry.parents[j];
            const x = (index + j + 1) * xOffset;
            if (j !== 0 || branches.length === 0) {
                // tslint:disable-next-line:no-http-string
                const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                // tslint:disable-next-line:no-increment-decrement
                ++branchColor;
                if (branchColor === COLORS.length) {
                    branchColor = 0;
                }
                // tslint:disable-next-line:prefer-template
                svgPath.setAttribute('style', 'stroke:' + COLORS[branchColor]);
                const origX = (index + 1) * xOffset;
                let origY = currentY === standardOffset ? 0 : currentY;
                origY = currentY;
                if (entry.isLastCommit && !entry.isThisLastCommitMerged) {
                    origY = currentY;
                }
                // tslint:disable-next-line:no-any prefer-template
                (svgPath as any).cmds = 'M ' + origX + ' ' + origY + ' L ' + x + ' ' + (currentY + logEntryHeight / 2) + ' L ' + x + ' ';
                svg.appendChild(svgPath);
                const obj = {
                    hash: parent.full,
                    path: svgPath,
                    wasFictional: false
                };
                branchFound = true;
                branches.splice(index + j, 0, obj);
            }
            if (!branchFound && i > 0) {
                index = branches.length;

                // tslint:disable-next-line:no-http-string
                const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                // tslint:disable-next-line:no-increment-decrement
                ++branchColor;
                if (branchColor === COLORS.length) {
                    branchColor = 0;
                }
                // tslint:disable-next-line:prefer-template
                svgPath.setAttribute('style', 'stroke:' + COLORS[branchColor]);

                // Start
                // Build branch
                const pathDetails: string[] = [];
                let xValue = 0;
                for (let elementCount = 0; elementCount <= i; elementCount += 1) {
                    const eleToCheck = content.children[elementCount];
                    // tslint:disable-next-line:no-any
                    const brancheCount = (eleToCheck as any).branchesOnLeft as number;
                    xValue = (brancheCount + 1) * xOffset;
                    if (elementCount === 0) {
                        pathDetails.push(`M ${xValue} ${topMostY} L ${xValue} ${standardOffset}`);
                    }
                    else {
                        pathDetails.push(`L ${xValue} ${standardOffset + (elementCount * logEntryHeight)}`);
                    }
                }
                pathDetails.push(`L ${xValue} `);
                // end

                // tslint:disable-next-line:no-any
                const fictionalBranch = {} as any; // fictionalBranches.splice(0, 1)[0];
                if (entry.isLastCommit && !entry.isThisLastCommitMerged) {
                    // Don't start from the very top, this is the last commit for this branch
                    // tslint:disable-next-line:prefer-template
                    fictionalBranch.path = 'M ' + xValue + ' ' + currentY + ' L ' + xValue + ' ' + currentY + ' L ' + xValue + ' ';
                }
                else {
                    fictionalBranch.path = pathDetails.join(' ');
                }
                xFromFictionalBranch = xValue;
                // tslint:disable-next-line:no-any
                (svgPath as any).cmds = fictionalBranch.path;
                svg.appendChild(svgPath);
                const obj = {
                    hash: parent.full,
                    path: svgPath,
                    wasFictional: true
                };
                branches.splice(index + j, 0, obj);
                // We need to padd all parent log entries to take this into account
                padParentCount += 1;
            }

            // Incremental updates for debugging
            // tslint:disable-next-line:no-increment-decrement no-shadowed-variable prefer-for-of
            for (let i = 0; i < branches.length; ++i) {
                const branch = branches[i];
                branch.path.setAttribute('d', branch.path.cmds + currentY);
            }
        }

        // What does this do?
        let tabBranch = false;
        // tslint:disable-next-line:no-increment-decrement
        for (j = index + j; j < branches.length; ++j) {
            tabBranch = true;
            const branch = branches[j];
            const x = (j + 1) * xOffset;
            // tslint:disable-next-line:prefer-template
            branch.path.cmds += (currentY - logEntryHeight / 2) + ' L ' + x + ' ' + currentY + ' L ' + x + ' ';
        }
        tabBranch = tabBranch ? tabBranch : (entry.parents.length > 1 || branched);

        // tslint:disable-next-line:no-http-string
        const svgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        let cx = ((branchFound || i === 0 ? index : branches.length - 1) + 1) * xOffset;
        if (xFromFictionalBranch > 0) {
            cx = xFromFictionalBranch;
        }

        svgCircle.setAttribute('cx', cx.toString());
        svgCircle.setAttribute('cy', (currentY + circleOffset).toString());
        svgCircle.setAttribute('r', '4');
        // Enabled only for debugging
        svg.appendChild(svgCircle);
        circlesToAppend.push(svgCircle);

        // tslint:disable-next-line:no-any
        (entryElement as any).branchesOnLeft = Math.max((entryElement as any).branchesOnLeft, branches.length);
        // tslint:disable-next-line:no-any
        maxLeft = Math.max(maxLeft, (entryElement as any).branchesOnLeft);

        currentY += logEntryHeight;
        lastXOffset = xOffset;
        if (maxXOffset < xOffset) {
            maxXOffset = xOffset;
        }

        if (padParentCount > 0) {
            // tslint:disable-next-line:no-increment-decrement
            for (let parentElemtnCounter = startAt; parentElemtnCounter <= i; parentElemtnCounter++) {
                if (parentElemtnCounter >= entries.length) {
                    break;
                }
                const el = content.children[parentElemtnCounter];
                // tslint:disable-next-line:no-any
                (el as any).branchesOnLeft += padParentCount;
            }
        }
    }
    // tslint:disable-next-line:no-increment-decrement
    for (let i = startAt; i < content.children.length; ++i) {
        const element = content.children[i];
        if (i >= entries.length) {
            break;
        }
        const minLeft = Math.min(maxLeft, 3);
        // tslint:disable-next-line:no-any
        const left = element ? Math.max(minLeft, (element as any).branchesOnLeft) : minLeft;
        // tslint:disable-next-line:prefer-template
        element.setAttribute('style', element.getAttribute('style') + ';padding-left:' + (left + 1) * lastXOffset + 'px');
    }
    branches.forEach(branch => {
        branch.path.setAttribute('d', branch.path.cmds + currentY);
    });

    // Commented only fo debugging
    // circlesToAppend.forEach(svg.appendChild.bind(svg));
}

class BrachGraph extends React.Component<BranchGrapProps> {
    // tslint:disable-next-line:no-empty
    public componentWillReceiveProps(newProps: BranchGrapProps) {
    }
    // tslint:disable-next-line:cyclomatic-complexity
    public componentWillUpdate(newProps: BranchGrapProps) {
        if (Array.isArray(newProps.logEntries) && newProps.logEntries.length === 0) {
            drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, newProps.itemHeight, []);
        }
        if (!newProps.height || !newProps.width || !newProps.itemHeight || !Array.isArray(newProps.logEntries)) {
            return;
        }
        if (newProps.itemHeight > 0 && (!Array.isArray(newProps.logEntries) || newProps.logEntries.length === 0)) {
            drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, newProps.itemHeight, newProps.logEntries);
            return;
        }
        if (newProps.itemHeight > 0 && newProps.itemHeight === this.props.itemHeight &&
            Array.isArray(this.props.logEntries) && this.props.logEntries.length > 0 &&
            newProps.updateTick === this.props.updateTick &&
            newProps.logEntries.length === this.props.logEntries.length &&
            newProps.logEntries[0].hash.full === this.props.logEntries[0].hash.full) {
            return;
        }
        if (newProps.updateTick === this.props.updateTick) {
            return;
        }
        if (this.lastDrawnDetails && newProps.logEntries.length > 0 &&
            this.lastDrawnDetails.count === newProps.logEntries.length &&
            this.lastDrawnDetails.firstHash === newProps.logEntries[0].hash.full &&
            this.lastDrawnDetails.firstHash === newProps.logEntries[0].hash.full) {
            return;
        }

        this.lastDrawnDetails = {
            count: newProps.logEntries.length,
            firstHash: newProps.logEntries.length > 0 ? newProps.logEntries[0].hash.full : '',
            lastHash: newProps.logEntries.length > 0 ? newProps.logEntries[newProps.logEntries.length - 1].hash.full : ''
        };

        this.svg.setAttribute('height', newProps.height);
        this.svg.setAttribute('width', newProps.width);
        // Hack, first clear before rebuilding
        // Remember, we will need to support apending results, as opposed to clearing page
        drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, newProps.itemHeight, []);
        drawGitGraph(this.svg, this.svg.nextSibling as HTMLElement, 0, newProps.itemHeight, newProps.logEntries);
    }
    private lastDrawnDetails: { firstHash: string, lastHash: string, count: number };
    private svg: SVGSVGElement;

    public render() {
        return (
            // tslint:disable-next-line:react-this-binding-issue no-http-string
            <svg className='commitGraph' ref={(ref) => this.svg = ref} xmlns='http://www.w3.org/2000/svg'></svg>
        );
    }
}

function mapStateToProps(state: RootState): BranchGrapProps {
    return {
        logEntries: state.logEntries.items,
        height: state.graph.height,
        width: state.graph.width,
        itemHeight: state.graph.itemHeight,
        updateTick: state.graph.updateTick
    };
}

export default connect(
    mapStateToProps
)(BrachGraph);
