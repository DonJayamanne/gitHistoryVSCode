import { ContainerModule, interfaces } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { ActionDetailsParser } from './actionDetails/parser';
import { FileStatParserFactory } from './fileStat/factory';
import { FileStatStatusParser } from './fileStatStatus/parser';
import { LogParser } from './log/parser';
import { RefsParser } from './refs/parser';
import { HeadRefParser } from './refs/parsers/headRefParser';
import { RemoteHeadParser } from './refs/parsers/remoteHeadParser';
import { TagRefParser } from './refs/parsers/tagRefParser';
import { IRefParser } from './refs/types';
import { IActionDetailsParser, IFileStatParserFactory, IFileStatStatusParser, ILogParser, IRefsParser } from './types';

export const containerModule = new ContainerModule((bind: interfaces.Bind) => {
    bind<IRefParser>(IRefParser).to(HeadRefParser).inSingletonScope();
    bind<IRefParser>(IRefParser).to(RemoteHeadParser).inSingletonScope();
    bind<IRefParser>(IRefParser).to(TagRefParser).inSingletonScope();
    bind<IRefsParser>(IRefsParser).to(RefsParser).inSingletonScope();

    bind<IActionDetailsParser>(IActionDetailsParser).to(ActionDetailsParser);
    bind<IFileStatParserFactory>(IFileStatParserFactory).to(FileStatParserFactory);
    bind<IFileStatStatusParser>(IFileStatStatusParser).to(FileStatStatusParser);
    bind<ILogParser>(ILogParser).to(LogParser);
});
