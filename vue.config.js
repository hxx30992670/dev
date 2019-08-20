const webpack = require("webpack");
module.exports ={
  devServer : {
    open: true,
    host: "localhost",
    port: 8081,
    proxy: {
      '/api': {
        target: "http://58.16.86.57:8888",
        //target: "http://59.215.223.140:8898",
        ws:true,
        changeOrigin: true,
      }
    }
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json', '.less', '.css']
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        "windows.jQuery": "jquery"
      })
    ],
    performance: {
      hints:false
    },
  },
}
