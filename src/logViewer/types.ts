export type ThemeDetails = {
    theme: string,
    backgroundColor: string,
    color: string,
    fontFamily: string,
    fontSize: string,
    fontWeight?: string
};

export interface IThemeService {
    getThemeDetails(theme: string, backgroundColor: string, color: string): ThemeDetails;
}

export enum BranchSelection {
    Current,
    All
}

export interface IUiService {
    getBranchSelection(): Promise<BranchSelection | undefined>;
}
