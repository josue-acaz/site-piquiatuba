const webpack = require('webpack');

module.exports = {
  entry: {
    main: ['@babel/polyfill', './main.js'],
    quotation: ['@babel/polyfill', './quotation.js'],
  },
  output: {
    path: __dirname + '/',
    filename: '[name].bundle.js',
  },
  devServer: {
    contentBase: __dirname + '/',
    watchContentBase: true,
  },
  module: {
      rules: [
          {
              test: /\.js$/,
              exclude: /node_modules/,
              use: {
                  loader: 'babel-loader',
              }
          }
      ],
  },
  plugins: [
      new webpack.DefinePlugin({
          "process.env.API_URL": JSON.stringify("https://piquiatuba-api.herokuapp.com"),
      })
  ]
};