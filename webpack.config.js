const path = require('path');
const fs = require('fs-extra');

const CopyWebpackPlugin = require('copy-webpack-plugin');

// variables
const isProduction = process.argv.indexOf('-p') >= 0;

const browserSourcePath = path.join(__dirname, './browser/src');
const serverSourcePath = path.join(__dirname, './src');

const outPath = path.join(__dirname, './dist');

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
        mainFields: ['main'],
    },
    devtool: isProduction ? false : 'eval-cheap-module-source-map',
    module: {
        rules: [
            // .ts, .tsx
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: 'browser/tsconfig.json',
                },
            },
            // scss
            {
                test: /\.css$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'bundle.css',
                        },
                    },
                    'extract-loader',
                    'css-loader?-url',
                ],
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'index.ejs', to: path.join(outPath, 'browser', 'src', 'index.ejs') },
            ]
        }),
    ],
};

const server = {
    mode: isProduction ? 'production' : 'development',
    context: serverSourcePath,
    entry: ['./extension.ts'],
    output: {
        path: path.join(outPath, 'src'),
        filename: 'extension.js',
        libraryTarget: 'commonjs2',
        devtoolModuleFilenameTemplate: '[absoluteResourcePath]',
    },
    target: 'node',
    node: {
        __dirname: false,
    },
    resolve: {
        extensions: ['.js', '.ts'],
    },
    devtool: isProduction ? false : 'source-map',
    externals: {
        vscode: 'commonjs vscode', // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
        ],
    },
};

module.exports = [browser, server];
