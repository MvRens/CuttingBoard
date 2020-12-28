module.exports = {
  outputDir: 'docs',
  publicPath: '/CuttingBoard/',

  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = 'CuttingBoard';
        return args;
      })
  }
}