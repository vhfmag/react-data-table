const path = require("path");
const webpack = require("webpack");

const shouldBuildForProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

module.exports = {
    cache: true,

    resolve: {
        extensions: ['', '.js', '.json', '.jsx', '.ts', '.tsx'],
    },

    module: {
        loaders: [
            {
                test: /react-icons.*\.js$/,
                loader: "babel-loader",
            },
            {
                test: /.tsx?$/,
                loaders: [
                    "babel-loader",
                    "awesome-typescript-loader",
                ],
            },
            {
                test: /\.scss$/,
                loaders: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
};
