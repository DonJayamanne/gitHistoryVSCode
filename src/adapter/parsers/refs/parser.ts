export * from './contracts';
import { inject, injectable, multiInject } from 'inversify';
// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';
import { ILogService } from '../../../common/log';
// import { TYPES as coreTYPES } from '../../../ioc';
import { Ref } from '../../contracts';
import { IRefsParser } from '../contracts';
import { IRefParser } from './contracts';
// import { TYPES } from './ioc';

@injectable()
export class RefsParser implements IRefsParser {
    constructor( @multiInject(TYPES.IRefParser) private parsers: IRefParser[],
        @inject(coreTYPES.ILogService) private logger: ILogService) {
    }

    // constructor( private parsers: IRefParser[],
    //     private logger: ILogService) {
    // }

    /**
     * Parses refs returned by the following two commands
     * git branch --all (only considers)
     * git show-refs
     * git log --format=%D
     * @param {string} refContent
     * @returns {Ref[]}
     * @memberof RefParser
     */
    public parse(refContent: string): Ref[] {
        return (refContent || '').split(',')
            .map(ref => ref.trim())
            .filter(line => line.length > 0)
            .map(ref => {
                const parser = this.parsers.find(item => item.canParse(ref));
                if (!parser) {
                    this.logger.error(`No parser found for ref '${ref}'`);
                    return;
                }
                return parser.parse(ref);
            })
            .filter(ref => ref !== undefined && ref !== null)
            .map(ref => ref!);
    }
}
