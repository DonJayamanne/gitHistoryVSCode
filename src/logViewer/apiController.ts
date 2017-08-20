import { Repository } from '../adapter/repository';
import { Express, Request, Response } from 'express';
import * as vscode from 'vscode';

export class ApiController {
    private repository: Repository;
    constructor(private app: Express) {
        this.repository = new Repository(vscode.workspace.rootPath!);
        this.app.get('/log', this.getLogEntries.bind(this));
    }

    private getLogEntries(request: Request, response: Response) {
        const searchText: string | undefined = request.query.searchText;
        const pageIndex: number | undefined = request.query.pageIndex;
        const showAllBranches: boolean = request.query.branchType !== 'CURRENT';
        const pageSize: number | undefined = request.query.pageSize;

        this.repository.getLogEntries(pageIndex, pageSize, showAllBranches, searchText)
            .then(data => response.send(data))
            .catch(err => response.status(500).send(err));
    }
}