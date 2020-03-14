const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const path = require('path');

module.exports = {
    stories: [path.join(__dirname, '../browser/stories/**/*.stories.*')],
    addons: ['@storybook/addon-actions', '@storybook/addon-links'],
    webpackFinal: async config => {
        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            include: [path.join(__dirname, '../browser/src'), path.join(__dirname, '../browser/stories')],
            use: [
                {
                    loader: require.resolve('ts-loader'),
                },
                {
                    loader: require.resolve('react-docgen-typescript-loader'),
                },
            ],
        });
        config.plugins.push(
            new TsconfigPathsPlugin({
                configFile: path.join(__dirname, '../browser/tsconfig.json'),
            }),
        );
        config.resolve.extensions.push('.js', '.ts', '.tsx');

        return config;
    },
};
