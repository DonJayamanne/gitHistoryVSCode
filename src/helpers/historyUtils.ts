import * as vscode from 'vscode';
import * as parser from '../logParser';
import * as fs from 'fs';

export function getFileHistory(rootDir: string, relativeFilePath: string): Thenable<any[]> {
	return new Promise<any[]>((resolve, reject) => {
		var options = { cwd: rootDir }
		var util = require('util'),
			spawn = require('child_process').spawn,
			ls = spawn('git', ['log', '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order', '--raw', relativeFilePath], options);

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
        
        ls.on('error', function(error) {
            reject(error);
        });
	});
}

export function getLineHistory(rootDir: string, relativeFilePath: string, lineNumber: number): Thenable<any[]> {
	return new Promise<any[]>((resolve, reject) => {
		var options = { cwd: rootDir }
		var lineArgs = "-L" + lineNumber + "," + lineNumber + ":" + relativeFilePath.replace(/\\/g, '/');
		var util = require('util'),
			spawn = require('child_process').spawn,
			ls = spawn('git', ['log', lineArgs, '--max-count=50', '--decorate=full', '--date=default', '--pretty=fuller', '--numstat', '--topo-order', '--raw'], options);

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
        
        ls.on('error', function(error) {
            reject(error);
        });
	});
}

export function writeFile(rootDir: string, commitSha1: string, sourceFilePath: string, targetFile: string): Thenable<any> {
	return new Promise<any>((resolve, reject) => {
		var options = { cwd: rootDir }
		var objectId = `${commitSha1}:` + sourceFilePath.replace(/\\/g, '/');
		var spawn = require('child_process').spawn,
			ls = spawn('git', ['show', objectId], options);

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