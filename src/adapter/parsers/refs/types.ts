import { Ref } from '../../types';

export interface IRefParser {
    canParse(refContent: string): boolean;
    parse(refContent: string): Ref;
}
