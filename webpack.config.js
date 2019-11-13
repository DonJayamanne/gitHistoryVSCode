var path = require('path');

var CopyWebpackPlugin = require('copy-webpack-plugin');

// variables
var isProduction = process.argv.indexOf('-p') >= 0;
var sourcePath = path.join(__dirname, './browser/src');
var outPath = path.join(__dirname, './out/browser');

module.exports = {
    mode: isProduction ? 'production' : 'development',
    context: sourcePath,
    entry: ['./index.tsx', './main.css'],
    output: {
        path: outPath,
        filename: 'bundle.js',
    },
    target: 'web',
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        mainFields: ['main']
    },
    devtool: 'source-map',
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
