import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { EventEmitter } from 'events';
import { Express, Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import { decorate, inject, injectable } from 'inversify';
import * as path from 'path';
import { IGitServiceFactory } from '../types';
import { ApiController } from './apiController';
import { IServerHost, IThemeService } from './types';

type PortAndId = {
    port: number,
    id: string
};

// inversify requires inherited classes to be decorated with @injectable()
// This is a workaround forat that requirement
decorate(injectable(), EventEmitter);

@injectable()
export class ServerHost extends EventEmitter implements IServerHost {
    private app?: Express;
    private httpServer?: http.Server;
    constructor( @inject(IThemeService) private themeService: IThemeService,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory) {
        super();
    }

    public dispose() {
        this.app = undefined;
        this.port = undefined;
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = undefined;
        }
    }

    private port?: number;
    private startPromise: Promise<PortAndId>;
    public async start(workspaceFolder: string): Promise<PortAndId> {
        if (this.startPromise) {
            return this.startPromise.then(value => {
                return { port: value.port, id: this.apiController.registerWorkspaceFolder(workspaceFolder) };
            });
        }

        this.app = express();
        this.httpServer = http.createServer(this.app);

        const rootDirectory = path.join(__dirname, '..', '..', 'browser');
        const node_modulesDirectory = path.join(__dirname, '..', '..', '..', 'node_modules');
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(express.static(rootDirectory));
        this.app.use(express.static(path.join(__dirname, '..', '..', '..', 'resources'), { extensions: ['.svg', 'svg', 'json', '.json'] }));
        // this.app.use(express.static(path.join(__dirname, '..', '..'), { extensions: ['.svg', 'svg', 'json', '.json'] }));
        this.app.use(express.static(path.join(node_modulesDirectory, 'octicons', 'build')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'hint.css')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'animate.css')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'normalize.css')));
        this.app.use(express.static(path.join(node_modulesDirectory, 'bootstrap', 'dist', 'css')));
        this.app.use(cors());
        this.app.get('/', (req, res, next) => {
            this.rootRequestHandler(req, res);
        });

        return this.startPromise = new Promise<PortAndId>((resolve, reject) => {
            this.apiController = new ApiController(this.app!, this.gitServiceFactory);
            this.httpServer!.listen(0, () => {
                this.port = this.httpServer!.address().port;
                resolve({ port: this.port, id: this.apiController.registerWorkspaceFolder(workspaceFolder) });
            });
            this.httpServer!.on('error', error => {
                if (!this.port) {
                    reject(error);
                }
            });
        });
    }
    private apiController: ApiController;
    public rootRequestHandler(req: Request, res: Response) {
        const theme: string = req.query.theme;
        const backgroundColor: string = req.query.backgroundColor;
        const color: string = req.query.color;
        const themeDetails = this.themeService.getThemeDetails(theme, backgroundColor, color);
        res.render(path.join(__dirname, '..', '..', 'browser', 'index.ejs'), themeDetails);
    }
}
