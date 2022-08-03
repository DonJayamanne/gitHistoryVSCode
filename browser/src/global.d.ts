/** Global definitions for development **/

// for style loader
declare module '*.css' {
    const styles: any;
    export = styles;
}

// for redux devtools extension
declare interface Window {
    devToolsExtension?(): (args?: any) => any;
}

declare let module: any;
declare let require: any;
