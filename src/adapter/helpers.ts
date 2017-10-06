import { EnumHelpers } from '../common/enumHelper';
import { CommitInfo } from '../types';
// tslint:disable-next-line:no-stateless-class
export class Helpers {
    // tslint:disable-next-line:function-name
    public static GetLogArguments() {
        const args = [];
        for (const item of EnumHelpers.Values<CommitInfo>(CommitInfo)) {
            if (item !== CommitInfo.NewLine) {
                args.push(Helpers.GetCommitInfoFormatCode(item));
            }
        }

        return args;
    }
    // tslint:disable-next-line:function-name
    public static GetCommitInfoFormatCode(info: CommitInfo): string {
        switch (info) {
            case CommitInfo.FullHash: {
                return '%H';
            }
            case CommitInfo.ShortHash: {
                return '%h';
            }
            case CommitInfo.TreeFullHash: {
                return '%T';
            }
            case CommitInfo.TreeShortHash: {
                return '%t';
            }
            case CommitInfo.ParentFullHash: {
                return '%P';
            }
            case CommitInfo.ParentShortHash: {
                return '%p';
            }
            case CommitInfo.AuthorName: {
                return '%an';
            }
            case CommitInfo.AuthorEmail: {
                return '%ae';
            }
            case CommitInfo.AuthorDateUnixTime: {
                return '%at';
            }
            case CommitInfo.CommitterName: {
                return '%cn';
            }
            case CommitInfo.CommitterEmail: {
                return '%ce';
            }
            case CommitInfo.CommitterDateUnixTime: {
                return '%ct';
            }
            case CommitInfo.RefsNames: {
                return '%D';
            }
            case CommitInfo.Subject: {
                return '%s';
            }
            case CommitInfo.Body: {
                return '%b';
            }
            case CommitInfo.Notes: {
                return '%N';
            }
            case CommitInfo.NewLine: {
                return '%n';
            }
            default: {
                throw new Error(`Unrecognized Commit Info type ${info}`);
            }
        }
    }
}
