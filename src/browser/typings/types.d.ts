/// <reference path="lib.dom.d.ts" />
/// <reference path="../../../typings/globals/jquery/index.d.ts" />
/// <reference path="../../..//node_modules/moment/moment.d.ts" />

/// npm install --save @types/clipboard
/// <reference path="../../../node_modules/@types/clipboard/index.d.ts" />


interface Copy {
    (value:string):void;
}
declare var copy:Copy;

declare var generateSVG:Function;

declare var moment:Function;