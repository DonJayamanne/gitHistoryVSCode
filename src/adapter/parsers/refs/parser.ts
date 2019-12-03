export * from './types';
import { injectable, multiInject } from 'inversify';
import { ILogService } from '../../../common/types';
import { Ref } from '../../../types';
// import { TYPES } from '../constants';
// import * as TYPES from '../types';
import { IRefsParser } from '../types';
import { IRefParser } from './types';

@injectable()
export class RefsParser implements IRefsParser {
    constructor( @multiInject(IRefParser) private parsers: IRefParser[],
        @multiInject(ILogService) private loggers: ILogService[]) {
    }

    /**
     * Parses refs returned by the following two commands
     * git branch --all (only considers)
     * git show-refs
     * git log --format=%D
     * @param {string} refContent the ref content as string to be parsed
     * @returns {Ref[]} A reference which can either be a branch, tag or origin
     */
    public parse(refContent: string): Ref[] {
        return (refContent || '').split(',')
            .map(ref => ref.trim())
            .filter(line => line.length > 0)
            .map(ref => {
                const parser = this.parsers.find(item => item.canParse(ref));
                if (!parser) {
                    this.loggers.forEach(logger => logger.error(`No parser found for ref '${ref}'`));
                    return;
                }
                return parser.parse(ref);
            })
            .filter(ref => ref !== undefined && ref !== null)
            .map(ref => ref!);
    }
}
