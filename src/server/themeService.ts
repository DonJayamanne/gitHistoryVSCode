import { injectable } from 'inversify';
import { workspace } from 'vscode';
import { IThemeService, ThemeDetails } from './types';

@injectable()
export class ThemeService implements IThemeService {
    public getThemeDetails(theme: string, styles: string): ThemeDetails {
        const editorConfig = workspace.getConfiguration('editor');
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const fontFamily = editorConfig.get<string>('fontFamily')!.split('\'').join('').split('"').join('');
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const fontSize = `${editorConfig.get<number>('fontSize')}px`;
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        const fontWeight = editorConfig.get<string>('fontWeight');
        return {
            theme: theme,
            fontFamily: fontFamily,
            fontSize: fontSize,
            fontWeight: fontWeight,
            styles: styles
        };
    }
}
