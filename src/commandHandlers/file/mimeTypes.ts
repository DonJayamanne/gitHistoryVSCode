import * as path from 'path';
import { Uri } from 'vscode';

type MapExtToMediaMimes = {
    [index: string]: string;
};

// Known media mimes that we can handle
const mapExtToMediaMimes: MapExtToMediaMimes = {
    '.bmp': 'image/bmp',
    '.gif': 'image/gif',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpg',
    '.jpe': 'image/jpg',
    '.png': 'image/png',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.ico': 'image/x-icon',
    '.tga': 'image/x-tga',
    '.psd': 'image/vnd.adobe.photoshop',
    '.webp': 'image/webp',
    '.mid': 'audio/midi',
    '.midi': 'audio/midi',
    '.mp4a': 'audio/mp4',
    '.mpga': 'audio/mpeg',
    '.mp2': 'audio/mpeg',
    '.mp2a': 'audio/mpeg',
    '.mp3': 'audio/mpeg',
    '.m2a': 'audio/mpeg',
    '.m3a': 'audio/mpeg',
    '.oga': 'audio/ogg',
    '.ogg': 'audio/ogg',
    '.spx': 'audio/ogg',
    '.aac': 'audio/x-aac',
    '.wav': 'audio/x-wav',
    '.wma': 'audio/x-ms-wma',
    '.mp4': 'video/mp4',
    '.mp4v': 'video/mp4',
    '.mpg4': 'video/mp4',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.mpe': 'video/mpeg',
    '.m1v': 'video/mpeg',
    '.m2v': 'video/mpeg',
    '.ogv': 'video/ogg',
    '.qt': 'video/quicktime',
    '.mov': 'video/quicktime',
    '.webm': 'video/webm',
    '.mkv': 'video/x-matroska',
    '.mk3d': 'video/x-matroska',
    '.mks': 'video/x-matroska',
    '.wmv': 'video/x-ms-wmv',
    '.flv': 'video/x-flv',
    '.avi': 'video/x-msvideo',
    '.movie': 'video/x-sgi-movie'
};

export function isTextFile(file: Uri): boolean {
    const extension = path.extname(file.fsPath);
    return !mapExtToMediaMimes[extension];
}
