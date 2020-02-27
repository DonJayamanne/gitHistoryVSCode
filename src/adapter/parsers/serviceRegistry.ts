import { IServiceManager } from '../../ioc/types';
import { ActionDetailsParser } from './actionDetails/parser';
import { FileStatParser } from './fileStat/parser';
import { FileStatStatusParser } from './fileStatStatus/parser';
import { LogParser } from './log/parser';
import { IActionDetailsParser, IFileStatParser, IFileStatStatusParser, ILogParser } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.add<IActionDetailsParser>(IActionDetailsParser, ActionDetailsParser);
    serviceManager.add<IFileStatStatusParser>(IFileStatStatusParser, FileStatStatusParser);
    serviceManager.add<IFileStatParser>(IFileStatParser, FileStatParser);
    serviceManager.add<ILogParser>(ILogParser, LogParser);
}
