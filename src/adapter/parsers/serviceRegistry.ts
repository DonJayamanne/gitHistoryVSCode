
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { IServiceManager } from '../../ioc/types';
import { ActionDetailsParser } from './actionDetails/parser';
import { FileStatStatusParser } from './fileStatStatus/parser';
import { LogParser } from './log/parser';
import { RefsParser } from './refs/parser';
import { HeadRefParser } from './refs/parsers/headRefParser';
import { RemoteHeadParser } from './refs/parsers/remoteHeadParser';
import { TagRefParser } from './refs/parsers/tagRefParser';
import { IRefParser } from './refs/types';
import { IActionDetailsParser, IFileStatStatusParser, ILogParser, IRefsParser } from './types';

export function registerTypes(serviceManager: IServiceManager) {
    serviceManager.addSingleton<IRefParser>(IRefParser, HeadRefParser);
    serviceManager.addSingleton<IRefParser>(IRefParser, RemoteHeadParser);
    serviceManager.addSingleton<IRefParser>(IRefParser, TagRefParser);
    serviceManager.addSingleton<IRefsParser>(IRefsParser, RefsParser);

    serviceManager.add<IActionDetailsParser>(IActionDetailsParser, ActionDetailsParser);
    serviceManager.add<IFileStatStatusParser>(IFileStatStatusParser, FileStatStatusParser);
    serviceManager.add<ILogParser>(ILogParser, LogParser);
}
