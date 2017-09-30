import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Ref, RefType } from '../../../types';
import { IRefParser } from './../types';
import { getRemoteHeadName, isRemoteHead } from './../helpers';

@injectable()
export class RemoteHeadParser implements IRefParser {
    public canParse(refContent: string): boolean {
        return typeof refContent === 'string' && isRemoteHead(refContent);
    }
    public parse(refContent: string): Ref {
        // tslint:disable-next-line:no-unnecessary-local-variable
        const ref: Ref = {
            name: getRemoteHeadName(refContent),
            type: RefType.RemoteHead
        };
        return ref;
    }
}
