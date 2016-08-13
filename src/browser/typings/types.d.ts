/// <reference path="lib.dom.d.ts" />
/// <reference path="../../../typings/globals/jquery/index.d.ts" />

/// npm install --save @types/clipboard
/// <reference path="/Users/donjayamanne/Desktop/Development/vscode/gitHistoryVSCode/node_modules/@types/clipboard/index.d.ts" />


interface Copy {
    (value:string):void;
}
declare var copy:Copy;