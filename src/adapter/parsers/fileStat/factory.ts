import { inject, injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { IFileStatParserFactory } from '../index';
import { IFileStatParser, IFileStatStatusParser } from '../types';
import { FileStatParser } from './parser';

@injectable()
export class FileStatParserFactory implements IFileStatParserFactory {
    constructor( @inject(IFileStatStatusParser) private statusParser: IFileStatStatusParser) {
    }

    public createFileStatParser(gitRootPath: string): IFileStatParser {
        return new FileStatParser(gitRootPath, this.statusParser);
    }

}
