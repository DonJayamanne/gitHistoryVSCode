import { injectable } from 'inversify';
import { Ref, RefType } from '../../../../types';
import { getRemoteHeadName, isRemoteHead } from './../helpers';
import { IRefParser } from './../types';

@injectable()
export class RemoteHeadParser implements IRefParser {
    public canParse(refContent: string): boolean {
        return typeof refContent === 'string' && isRemoteHead(refContent);
    }
    public parse(refContent: string): Ref {
        const ref: Ref = {
            name: getRemoteHeadName(refContent),
            type: RefType.RemoteHead,
        };
        return ref;
    }
}
