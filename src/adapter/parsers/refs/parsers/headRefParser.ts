import { injectable } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { Ref, RefType } from '../../../contracts';
import { HEAD_REF_PREFIXES } from './../constants';
import { IRefParser } from './../contracts';

import { makeProvideDecorator } from 'inversify-binding-decorators';
import 'reflect-metadata';

var container = new Container();
let provide = makeProvideDecorator(container);

@injectable()
export class HeadRefParser implements IRefParser {
    public canParse(refContent: string): boolean {
        return typeof refContent === 'string' && HEAD_REF_PREFIXES.filter(prefix => refContent.startsWith(prefix)).length > 0;
    }
    public parse(refContent: string): Ref {
        const prefix = HEAD_REF_PREFIXES.filter(item => refContent.startsWith(item))[0];
        // tslint:disable-next-line:no-unnecessary-local-variable
        const ref: Ref = {
            name: refContent.substring(prefix.length),
            type: RefType.Head
        };
        return ref;
    }
}
