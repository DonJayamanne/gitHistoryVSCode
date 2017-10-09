import { Ref } from '../../../types';
export const IRefParser = Symbol('IRefParser');
export interface IRefParser {
    canParse(refContent: string): boolean;
    parse(refContent: string): Ref;
}
