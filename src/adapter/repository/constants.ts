import { CommitInfo } from '../../types';
import { Helpers } from '../helpers';

export const LOG_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA5';
export const ITEM_ENTRY_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA6';
export const STATS_SEPARATOR = '95E9659B-27DC-43C4-A717-D75969757EA7';
// const LOG_FORMAT_ARGS = ['%D', '%H', '%h', '%T', '%t', '%P', '%p', '%an', '%ae', '%at', '%c', '%ce', '%ct', '%s', '%b', '%N'];
export const LOG_FORMAT_ARGS = Helpers.GetLogArguments();
export const newLineFormatCode = Helpers.GetCommitInfoFormatCode(CommitInfo.NewLine);
export const LOG_FORMAT = `--format=${LOG_ENTRY_SEPARATOR}${[
    ...LOG_FORMAT_ARGS,
    STATS_SEPARATOR,
    ITEM_ENTRY_SEPARATOR,
].join(ITEM_ENTRY_SEPARATOR)}`;
