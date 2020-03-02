var path = require('path');
var fs = require('fs-extra');

var CopyWebpackPlugin = require('copy-webpack-plugin');

// variables
var isProduction = process.argv.indexOf('-p') >= 0;

var browserSourcePath = path.join(__dirname, './browser/src');
var serverSourcePath = path.join(__dirname, './src');

var outPath = path.join(__dirname, './dist');

// cleanup dist directory
fs.emptyDirSync(outPath);

const browser = {
    mode: isProduction ? 'production' : 'development',
    context: browserSourcePath,
    entry: ['./index.tsx', './main.css'],
    output: {
        path: path.join(outPath, 'browser'),
        filename: 'bundle.js',
    },
    target: 'web',
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        mainFields: ['main']
    },
    devtool: isProduction ? false : 'source-map',
    module: {
        rules: [
            // .ts, .tsx
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader?',
                options: {
                    module: 'es6',
                    configFileName: './browser/tsconfig.json'
                }
            },
            // scss
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'bundle.css',
                        }
                    },
                    'extract-loader',
                    'css-loader?-url'
                ]
            }
        ],
    },
    plugins: [
        new CopyWebpackPlugin([
            {
                from: 'index.ejs'
            }
        ])
    ]
};

const server = {
    mode: isProduction ? 'production' : 'development',
    context: serverSourcePath,
    entry: ['./extension.ts'],
    output: {
        path: path.join(outPath, 'src'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '[absoluteResourcePath]'
    },
    target: 'node',
    node: false,
    resolve: {
        extensions: ['.js', '.ts']
    },
    devtool: isProduction ? false : 'source-map',
    externals: {
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                {
                    loader: 'ts-loader'
                }
                ]
            }
        ]
    }
};

module.exports = [browser, server]
