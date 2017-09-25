// import { Container } from 'inversify';
// // tslint:disable-next-line:no-import-side-effect
// import 'reflect-metadata';
// import { ActionDetailsParser } from './actionDetails/parser';
// import { IActionDetailsParser, IFileStatParser, IFileStatStatusParser, ILogParser } from './contracts';
// import { FileStatParser } from './fileStat/parser';
// import { FileStatStatusParser } from './fileStatStatus/parser';
// import { LogParser } from './log/parser';
// import { container as refsContainer } from './refs/ioc';

// export const TYPES = {
//     IActionDetailsParser: Symbol('IActionDetailsParser'),
//     IFileStatParser: Symbol('IFileStatParser'),
//     IFileStatStatusParser: Symbol('IFileStatStatusParser'),
//     ILogParser: Symbol('ILogParser')
// };

// const cont = new Container();
// cont.bind<IActionDetailsParser>(TYPES.IActionDetailsParser).to(ActionDetailsParser);
// cont.bind<IFileStatParser>(TYPES.IFileStatParser).to(FileStatParser);
// cont.bind<IFileStatStatusParser>(TYPES.IFileStatStatusParser).to(FileStatStatusParser);
// cont.bind<ILogParser>(TYPES.ILogParser).to(LogParser);

// export const container = Container.merge(cont, refsContainer);
