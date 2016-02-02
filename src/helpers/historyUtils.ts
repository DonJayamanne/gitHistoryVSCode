import * as vscode from 'vscode';
import * as parser from '../logParser';
import * as fs from 'fs';
import * as path from 'path';

function getGitPath() {
    var git = <string>vscode.workspace.getConfiguration('git').get('path');

    if (git)
        return git;
    else
        return 'git';
}

export function getGitRepositoryPath(fileName: string): Thenable<string> {

    return new Promise<string>((resolve, reject) => {
        var options = { cwd: path.dirname(fileName) }
		var util = require('util'),
			spawn = require('child_process').spawn,
            //git rev-parse --git-dir
			ls = spawn(getGitPath(), ['rev-parse', '--git-dir'], options);

		var log = "";
		var error = "";
		ls.stdout.on('data', function(data) {
			log += data + "\n";
		});

		ls.stderr.on('data', function(data) {
			error += data;
		});

		ls.on('exit', function(code) {
			if (error.length > 0) {
				reject(error);
				return;
			}
			var repositoryPath = path.dirname(log);
			if (!path.isAbsolute(repositoryPath))
				repositoryPath = path.join(path.dirname(fileName), repositoryPath);
			resolve(repositoryPath);
		});
    });
}

export function getFileHistory(rootDir: string, relativeFilePath: string): Thenable<any[]> {
	return new Promise<any[]>((resolve, reject) => {
		var options = { cwd: rootDir }
		var util = require('util'),
			spawn = require('child_process').spawn,
			ls = spawn(getGitPath(), ['log', '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', relativeFilePath], options);

		var log = "";
		var error = "";
		ls.stdout.on('data', function(data) {
			log += data + "\n";
		});

		ls.stderr.on('data', function(data) {
			error += data;
		});

		ls.on('exit', function(code) {
			if (error.length > 0) {
				reject(error);
				return;
			}

			var parsedLog = parser.parseLogContents(log);
			resolve(parsedLog);
		});
	});
}

export function getLineHistory(rootDir: string, relativeFilePath: string, lineNumber: number): Thenable<any[]> {
	return new Promise<any[]>((resolve, reject) => {
		var options = { cwd: rootDir }
		var lineArgs = "-L" + lineNumber + "," + lineNumber + ":" + relativeFilePath.replace(/\\/g, '/');
		var util = require('util'),
			spawn = require('child_process').spawn,
			ls = spawn(getGitPath(), ['log', lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw'], options);

		var log = "";
		var error = "";
		ls.stdout.on('data', function(data) {
			log += data + "\n";
		});

		ls.stderr.on('data', function(data) {
			error += data;
		});

		ls.on('exit', function(code) {
			if (error.length > 0) {
				reject(error);
				return;
			}

			var parsedLog = parser.parseLogContents(log);
			resolve(parsedLog);
		});
	});
}

export function writeFile(rootDir: string, commitSha1: string, sourceFilePath: string, targetFile: string): Thenable<any> {
	return new Promise<any>((resolve, reject) => {
		var options = { cwd: rootDir }
		var objectId = `${commitSha1}:` + sourceFilePath.replace(/\\/g, '/');
		var spawn = require('child_process').spawn,
			ls = spawn(getGitPath(), ['show', objectId], options);

		var log = "";
		var error = "";
		ls.stdout.on('data', function(data) {
			fs.appendFile(targetFile, data);
		});

		ls.stderr.on('data', function(data) {
			error += data;
		});

		ls.on('exit', function(code) {
			if (error.length > 0) {
				reject(error);
				return;
			}

			resolve(targetFile);
		});
	});
}