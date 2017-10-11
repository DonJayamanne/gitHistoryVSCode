import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { EventEmitter } from 'events';
import { Express, Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import { decorate, inject, injectable } from 'inversify';
import * as path from 'path';
// import * as io from 'socket.io';
// import * as vscode from 'vscode';
import { IGitServiceFactory } from '../types';
import { ApiController } from './apiController';
import { IServer, IThemeService } from './types';

type PortAndId = {
    port: number,
    id: string
};

// inversify requires inherited classes to be decorated with @injectable()
// This is a workaround forat that requirement
decorate(injectable(), EventEmitter);

@injectable()
export class Server extends EventEmitter implements IServer {
    // private socketServer?: SocketIO.Server;
    private app?: Express;
    private httpServer?: http.Server;
    // private clients: SocketIO.Socket[] = [];
    constructor( @inject(IThemeService) private themeService: IThemeService,
        @inject(IGitServiceFactory) private gitServiceFactory: IGitServiceFactory) {
        super();
        // this.responsePromises = new Map<string, IDeferred<boolean>>();
    }

    public dispose() {
        this.app = undefined;
        this.port = undefined;
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = undefined;
        }
        // if (this.socketServer) {
        //     this.socketServer.close();
        //     this.socketServer = undefined;
        // }
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
        // this.socketServer = io(this.httpServer);

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
            // this.socketServer!.on('connection', this.onSocketConnection.bind(this));

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
    // private buffer: {}[] = [];
    // public clearBuffer() {
    //     this.buffer = [];
    // }
    // public sendResults(data: {}[]) {
    //     // Add an id to each item (poor separation of concerns... but what ever)
    //     const results = data.map(item => { return { id: uniqid('x'), value: item }; });
    //     this.buffer = this.buffer.concat(results);
    //     this.broadcast('results', results);
    // }

    // public sendSetting(name: string, value: {}) {
    //     this.broadcast(name, value);
    // }
    // private broadcast(eventName: string, data: {}) {
    //     this.socketServer!.emit(eventName, data);
    // }

    // private onSocketConnection(socket: SocketIO.Socket) {
    //     this.clients.push(socket);
    //     socket.on('disconnect', () => {
    //         const index = this.clients.findIndex(sock => sock.id === socket.id);
    //         if (index >= 0) {
    //             this.clients.splice(index, 1);
    //         }
    //     });
    //     socket.on('clientExists', (data: { id: string }) => {
    //         if (!this.responsePromises.has(data.id)) {
    //             return;
    //         }
    //         const def = this.responsePromises.get(data.id);
    //         this.responsePromises.delete(data.id);
    //         def!.resolve(true);
    //     });
    //     socket.on('settings.appendResults', (data: {}) => {
    //         this.emit('settings.appendResults', data);
    //     });
    //     socket.on('clearResults', () => {
    //         this.buffer = [];
    //     });
    //     socket.on('results.ack', () => {
    //         this.buffer = [];
    //     });
    //     this.emit('connected');

    //     // Someone is connected, send them the data we have
    //     socket.emit('results', this.buffer);
    // }

    // private responsePromises: Map<string, IDeferred<boolean>>;
    // public clientsConnected(timeoutMilliSeconds: number): Promise<{}> {
    //     const id = new Date().getTime().toString();
    //     const def = createDeferred<boolean>();
    //     // this.broadcast('clientExists', { id: id });
    //     this.responsePromises.set(id, def);

    //     setTimeout(() => {
    //         if (this.responsePromises.has(id)) {
    //             this.responsePromises.delete(id);
    //             def.resolve(false);
    //         }
    //     }, timeoutMilliSeconds);

    //     return def.promise;
    // }
}
