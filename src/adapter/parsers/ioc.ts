import { ContainerModule, interfaces } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { ActionDetailsParser } from './actionDetails/parser';
import { TYPES } from './constants';
import { FileStatParser } from './fileStat/parser';
import { FileStatStatusParser } from './fileStatStatus/parser';
import { LogParser } from './log/parser';
import { RefsParser } from './refs/parser';
import { HeadRefParser } from './refs/parsers/headRefParser';
import { RemoteHeadParser } from './refs/parsers/remoteHeadParser';
import { TagRefParser } from './refs/parsers/tagRefParser';
import { IRefParser } from './refs/types';
import { IActionDetailsParser, IFileStatParser, IFileStatStatusParser, ILogParser, IRefsParser } from './types';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRefParser>(TYPES.IRefParser).to(HeadRefParser).inSingletonScope();
    bind<IRefParser>(TYPES.IRefParser).to(RemoteHeadParser).inSingletonScope();
    bind<IRefParser>(TYPES.IRefParser).to(TagRefParser).inSingletonScope();
    bind<IRefsParser>(TYPES.IRefsParser).to(RefsParser).inSingletonScope();

    bind<IActionDetailsParser>(TYPES.IActionDetailsParser).to(ActionDetailsParser);
    bind<IFileStatParser>(TYPES.IFileStatParser).to(FileStatParser);
    bind<IFileStatStatusParser>(TYPES.IFileStatStatusParser).to(FileStatStatusParser);
    bind<ILogParser>(TYPES.ILogParser).to(LogParser);
});
