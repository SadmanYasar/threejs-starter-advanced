/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.html$/i,
                loader: "html-loader",
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
            {
                test: /\.png/,
                type: 'asset/resource'
            },
        ],
    },
    resolve: {
        alias: {
            three: path.resolve('./node_modules/three'),
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'build'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            favicon: './src/assets/favicon/favicon.ico'
        }),
        new MiniCssExtractPlugin(),
        new CssMinimizerPlugin(),
        new Dotenv()
    ],
    devServer: {
        static: path.resolve(__dirname, 'build'),
        compress: true,
        port: 3000,
    },
    devtool: 'source-map',
};