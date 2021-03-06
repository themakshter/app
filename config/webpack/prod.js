var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var ManifestPlugin = require('webpack-manifest-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
  bail: true,
  mode: 'production',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: [path.resolve(__dirname), 'node_modules', 'app'],
    alias: {
      // for semantic: redirect theme access to our custom theme (https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf)
      '../../theme.config$': path.join(__dirname, '../../src/app/theme/theme.config')
    }
  },

  entry: {
    app: [
      'babel-polyfill',
      './src/client.tsx',
      './src/vendor/main.ts'
    ]
  },

  devtool: "hidden-source-map",

  output: {
    path: path.resolve('./build'),
    publicPath: '/',
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  },

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        loader: 'tslint-loader'
      },
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        exclude: path.resolve('./src/app'),
        loader: ExtractTextPlugin.extract({
          use: [
            "css-loader",
            "postcss-loader"
          ],
          fallback: "style-loader"
        })
      },
      {
        test: /\.less$/,
        loader: ExtractTextPlugin.extract({
          use: [
            "css-loader",
            "postcss-loader",
            "less-loader"
          ],
          fallback: "style-loader"
        })
      },
      {
        test: /\.branding$/,
        use: [
          { loader: 'style-loader', options: { injectType: 'lazyStyleTag' } },
          "css-loader",
          "postcss-loader",
          "less-loader"
        ]
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          use: [
            "css-loader",
            "postcss-loader",
            "sass-loader"
          ],
          fallback: "style-loader"
        })
      },
      {
        test: /\.inline.svg$/,
        loader: 'babel-loader!svg-react-loader'
      },
      {
        test: /\.eot(\?.*)?$/,
        loader: 'file-loader?name=fonts/[hash].[ext]'
      },
      {
        test: /\.(woff|woff2)(\?.*)?$/,
        loader: 'file-loader?name=fonts/[hash].[ext]'
      },
      {
        test: /\.ttf(\?.*)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=fonts/[hash].[ext]'
      },
      {
        test: /^(?!.*\.inline\.svg$).*\.svg$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=fonts/[hash].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loader: 'url-loader?limit=1000&name=images/[hash].[ext]'
      }
    ]
  },

  plugins: [
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        tslint: {
          failOnHint: true
        },
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('[name].[hash].css'),
    new ManifestPlugin({
      fileName: 'manifest.json'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        BROWSER: JSON.stringify(true),
        NODE_ENV: JSON.stringify('production'),
        VERSION: JSON.stringify(process.env.TRAVIS_COMMIT),
      }
    }),
    new HtmlWebpackPlugin({
      template: './src/index.ejs'
    }),
    new CopyWebpackPlugin([
      { from: './src/favicon.ico', to:"favicon.ico" },
    ])
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
  }
};

const createIfDoesntExist = dest => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }
};

createIfDoesntExist('./build');

module.exports = config;
