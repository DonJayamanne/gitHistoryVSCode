import { QuickPickItem, window } from 'vscode';
import { BranchSelection, IUiService } from './types';

const allBranches = 'All branches';
const currentBranch = 'Current branch';

export class UiService implements IUiService {
    public async getBranchSelection(): Promise<BranchSelection | undefined> {
        const itemPickList: QuickPickItem[] = [];
        itemPickList.push({ label: currentBranch, description: '' });
        itemPickList.push({ label: allBranches, description: '' });
        const modeChoice = await window.showQuickPick(itemPickList, { placeHolder: 'Show history for...', matchOnDescription: true });
        if (!modeChoice) {
            return;
        }

        return modeChoice.label === allBranches ? BranchSelection.All : BranchSelection.Current;
    }
}
