const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './index',
    'mode': 'development',
    resolve: {
        alias: {
            prea: path.join(__dirname, '../src/index')
        },
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
	plugins: [new HtmlWebpackPlugin()]
}