// import { Container } from 'inversify';
// // tslint:disable-next-line:no-import-side-effect
// import 'reflect-metadata';
// import { IGit } from './contracts';
// import { GitCommandExecutor, IGitCommandExecutor } from './exec';
// import { GitExecutableLocator, IGitExecutableLocator } from './locator';
// import { container as parserContainer } from './parsers/ioc';
// import { Git } from './repository/git';

// export const TYPES = {
//     IGit: Symbol('IGit'),
//     IGitExecutableLocator: Symbol('IGitExecutableLocator'),
//     IGitCommandExecutor: Symbol('IGitCommandExecutor')
// };

// const cont = new Container();
// cont.bind<IGit>(TYPES.IGit).to(Git);
// cont.bind<IGitExecutableLocator>(TYPES.IGitExecutableLocator).to(GitExecutableLocator);
// cont.bind<IGitCommandExecutor>(TYPES.IGitCommandExecutor).to(GitCommandExecutor);

// export const container = Container.merge(cont, parserContainer);
