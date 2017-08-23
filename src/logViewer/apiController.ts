import { CommittedFile } from '../adapter/git';
import { Repository } from '../adapter/repository';
import { Express, Request, Response } from 'express';
import * as vscode from 'vscode';

export class ApiController {
    private repository: Repository;
    constructor(private app: Express) {
        this.repository = new Repository(vscode.workspace.rootPath!);
        this.app.get('/log', this.getLogEntries.bind(this));
        this.app.get('/branches', this.getBranches.bind(this));
        this.app.get('/log/:hash', this.getCommit.bind(this));
        this.app.post('/log/:hash/committedFile', this.onCommittedFileSelected.bind(this));
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
    private onCommittedFileSelected(request: Request, response: Response) {
        const committedFile = request.body as CommittedFile;
        console.log(committedFile);
    }
}