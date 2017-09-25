import { Ref } from '../../contracts';

export interface IRefParser {
    canParse(refContent: string): boolean;
    parse(refContent: string): Ref;
}
