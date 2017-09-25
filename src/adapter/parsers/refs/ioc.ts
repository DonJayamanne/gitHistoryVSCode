import { Container } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { IRefsParser } from '../contracts';
import { IRefParser } from './contracts';
import { RefsParser } from './parser';
import { HeadRefParser } from './parsers/headRefParser';
import { RemoteHeadParser } from './parsers/remoteHeadParser';
import { TagRefParser } from './parsers/tagRefParser';

export const TYPES = {
    IRefParser: Symbol('IRefParser'),
    IRefsParser: Symbol('IRefsParser')
};

const container = new Container();
container.bind<IRefParser>(TYPES.IRefParser).to(HeadRefParser).inSingletonScope();
container.bind<IRefParser>(TYPES.IRefParser).to(RemoteHeadParser).inSingletonScope();
container.bind<IRefParser>(TYPES.IRefParser).to(TagRefParser).inSingletonScope();
container.bind<IRefsParser>(TYPES.IRefsParser).to(RefsParser).inSingletonScope();

export { container };
