const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'excel-writer-stream': './src/xlsx-stream-writer.ts',
    'excel-writer-stream.min': './src/xlsx-stream-writer.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: ['/node_modules/', '/tests/'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'XlsxWriterStream',
    umdNamedDefine: true,
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new UglifyJsPlugin({
      include: /\.min\.js$/,
      sourceMap: true,
      cache: true,
      parallel: true,
      uglifyOptions: {
        compress: false,
        ecma: 6,
        mangle: true,
      },
    }),
  ],
};
