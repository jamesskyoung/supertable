var path = require('path');

var config = {
    entry: './app/app.jsx',


    output: {

        path: path.join(__dirname, "./dist"),
        filename: 'reactsupertable.js',
        libraryTarget: 'umd'
    },

    devServer: {
        inline: true,
        contentBase: './public',
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
        port: 9080
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.css$/,
                include: /node_modules/,
                loader: 'style-loader!css-loader'
            }
        ]
    }
}
console.log('output path...' + config.output.path);
module.exports = config;