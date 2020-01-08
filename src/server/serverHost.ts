import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { EventEmitter } from 'events';
import { Express, Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import { inject } from 'inversify';
import * as path from 'path';
import { workspace } from 'vscode';

import { ICommandManager } from '../application/types/commandManager';
import { IServiceContainer } from '../ioc/types';
import { IGitServiceFactory } from '../types';
import { ApiController } from './apiController';
import { IServerHost, StartupInfo } from './types';

export class ServerHost extends EventEmitter implements IServerHost {
    private app?: Express;
    private httpServer?: http.Server;
    private apiController?: ApiController;
    private port?: number;
    private startPromise?: Promise<StartupInfo>;
    constructor(
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory,
        @inject(IServiceContainer) private serviceContainer: IServiceContainer) {
        super();
    }

    public dispose() {
        this.app = undefined;
        this.port = undefined;
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = undefined;
        }
        if (this.apiController) {
            this.apiController.dispose();
        }
    }

    public async start(): Promise<StartupInfo> {
        if (this.startPromise) {
            return this.startPromise;
        }

        this.app = express();
        // tslint:disable-next-line:no-any
        this.httpServer = http.createServer(this.app as any);

        const rootDirectory = path.join(__dirname, '..', '..', 'browser');
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json({ limit: '2mb' }));
        this.app.use(express.static(rootDirectory));
        this.app.use(express.static(path.join(__dirname, '..', '..', '..', 'resources'), { extensions: ['.svg', 'svg', 'json', '.json'] }));
        this.app.use(cors());
        this.app.get('/', (req, res) => {
            this.rootRequestHandler(req, res);
        });

        return this.startPromise = new Promise<StartupInfo>((resolve, reject) => {
            const commandManager = this.serviceContainer.get<ICommandManager>(ICommandManager);
            this.apiController = new ApiController(this.app!, this.gitServiceFactory, this.serviceContainer, commandManager);
            this.httpServer!.listen(0, () => {
                this.port = this.httpServer!.address().port;
                resolve({ port: this.port });
            });
            this.httpServer!.on('error', error => {
                if (!this.port) {
                    reject(error);
                }
            });
        });
    }
    public rootRequestHandler(req: Request, res: Response) {
        if (Object.keys(req.query).length <= 0) {
            // This request is used to fetch the redirected url
            res.status(200).send('The Git History server is running...');
            return;
        }

        // DEVELOPER HINT: 
        // The below is only necessary when opening from an external browser
        const locale: string = 'en_US';
        const settings = {
            id: req.query.id,
            branchName: req.query.branchName,
            file: req.query.file,
            branchSelection: req.query.branchSelection
        };

        const config = workspace.getConfiguration('gitHistory');
        res.render(path.join(__dirname, '..', '..', 'browser', 'index.ejs'), { locale, config, settings });
    }
}
