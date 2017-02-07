var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack/dev')

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  inline: false,
  historyApiFallback: true,
  quiet: true
}).listen(3000, 'localhost', function (error, result) {
  if (error) {
    console.log(error)
  }

  console.log('Listening at http://localhost:3000!')
})
