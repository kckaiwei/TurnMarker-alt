const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    name: 'turnmarker',
    entry: {
        index: './src/scripts/turnmarker.js'
    },
    mode: 'development',
    devtool: 'source-map',
    output: {
        publicPath: 'modules/turnmarker/scripts/',
        filename: 'turnmarker.js',
        chunkFilename: 'bundles/[name].[chunkhash:4].js',
        path: path.resolve(__dirname, 'dist/scripts/'),
    },
    optimization: {
        minimize: true
    },
    plugins: [
        new CleanWebpackPlugin()
    ]
};