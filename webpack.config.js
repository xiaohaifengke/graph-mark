const path = require('path')

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'graph-mark.js',
    path: path.resolve(__dirname, 'lib'),
    library: 'GraphMark',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  devtool: 'none',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        // include: [path.resolve(__dirname, './src')],
        exclude: /node_modules/
      }
    ]
  },
  externals: {
    fabric: {
      commonjs: 'fabric',
      commonjs2: 'fabric',
      amd: 'fabric',
      root: 'fabric'
    }
  }
}
