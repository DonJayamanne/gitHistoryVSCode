import { Express, Request, Response } from 'express';
import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { CommittedFile } from '../adapter/types';
import { IGit } from '../adapter/types';

@injectable()
export class ApiController {
    // private repository: IGit;
    constructor(private app: Express, private repository: IGit) {
        // this.repository = new Git(vscode.workspace.rootPath!, new GitCommandExecutor());
        this.app.get('/log', this.getLogEntries.bind(this));
        this.app.get('/branches', this.getBranches.bind(this));
        this.app.get('/log/:hash', this.getCommit.bind(this));
        this.app.post('/log/:hash', this.selectCommit.bind(this));
        this.app.post('/log/:hash/committedFile', this.onCommittedFileSelected.bind(this));
        this.app.post('/log/:hash/cherryPick', this.cherryPickCommit.bind(this));
    }

    private getLogEntries(request: Request, response: Response) {
        const searchText = request.query.searchText;
        const pageIndex: number | undefined = request.query.pageIndex;
        const branch = request.query.branch;
        const pageSize: number | undefined = request.query.pageSize;

        this.repository.getLogEntries(pageIndex, pageSize, branch, searchText)
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    private getBranches(request: Request, response: Response) {
        this.repository.getBranches()
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    private getCommit(request: Request, response: Response) {
        this.repository.getCommit(request.params.hash)
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
    private cherryPickCommit(request: Request, response: Response) {
        console.log(request.params.hash);
        response.send('');
        // this.repository.getCommit(request.params.hash)
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));
    }
    private selectCommit(request: Request, response: Response) {
        console.log(request.params.hash);
        response.send('');
        // this.repository.getCommit(request.params.hash)
        //     .then(data => response.send(data))
        //     .catch(err => response.status(500).send(err));
    }
    private onCommittedFileSelected(request: Request, response: Response) {
        // tslint:disable-next-line:prefer-type-cast
        const committedFile = request.body as CommittedFile;
        console.log(committedFile);
    }
}
