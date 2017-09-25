import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Ref, RefType } from '../../../contracts';
import { TAG_REF_PREFIXES } from './../constants';
import { IRefParser } from './../contracts';

@injectable()
export class TagRefParser implements IRefParser {
    public canParse(refContent: string): boolean {
        return typeof refContent === 'string' && TAG_REF_PREFIXES.filter(prefix => refContent.startsWith(prefix)).length > 0;
    }
    public parse(refContent: string): Ref {
        const prefix = TAG_REF_PREFIXES.find(item => refContent.startsWith(item))!;
        // tslint:disable-next-line:no-unnecessary-local-variable
        const ref: Ref = {
            name: refContent.substring(prefix.length),
            type: RefType.Tag
        };
        return ref;
    }
}
