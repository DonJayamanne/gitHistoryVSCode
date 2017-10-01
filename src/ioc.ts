import { Container } from 'inversify';
import { containerModule as adapterContainer } from './adapter/ioc';
import { ILogService, Logger } from './common/log';
import { TYPES } from './constants';

const cont = new Container();
cont.bind<ILogService>(TYPES.ILogService).to(Logger).inSingletonScope();
cont.load(adapterContainer);

export const container = cont;
