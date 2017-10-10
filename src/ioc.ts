import { Container, interfaces } from 'inversify';
import { containerModule as adapterContainer } from './adapter/ioc';
import { Logger } from './common/log';
import { ILogService } from './common/types';
import { LogViewer } from './logViewer/logViewer';
import { ThemeService } from './logViewer/themeService';
import { IThemeService } from './logViewer/types';
import { IDiContainer } from './types';

class DiContainer implements IDiContainer {
    private container: Container;
    private static instance: IDiContainer;
    constructor() {
        if (DiContainer.instance) {
            throw new Error('DiContainer is a singleton and can be instantiated only once');
        }
        const cont = this.container = new Container();
        cont.bind<ILogService>(ILogService).to(Logger).inSingletonScope();
        cont.bind<LogViewer>(LogViewer).to(LogViewer).inSingletonScope();
        cont.bind<IThemeService>(IThemeService).to(ThemeService).inSingletonScope();
        cont.load(adapterContainer);
        DiContainer.instance = this;
    }
    // tslint:disable-next-line:function-name
    public static getInstance(): IDiContainer {
        return DiContainer.instance ? DiContainer.instance : new DiContainer();
    }
    public dispose() {
        // Nothing for now
    }
    public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return DiContainer.instance.get<T>(serviceIdentifier);
    }
}

export function getDiContainer(): IDiContainer {
    return DiContainer.getInstance();
}
