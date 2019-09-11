const { resolve } = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WriteFilePlugin = require('write-file-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
//----------------------------------------------------
// Check if bundle folder exists, if not, make it
const fs = require("fs");
//----------------------------------------------------
var port = '1235';
var output_path_dir_name = "bundle";
var output_path_dir = __dirname+"/public/"+output_path_dir_name;
var filename = "[name]";
var chunkFilename = "[name]";
//------------------
if (!fs.existsSync(output_path_dir)){
    fs.mkdirSync(output_path_dir);
}
//----------------------------------------------------
var server = process.env.WEBPACK_DEV_SERVER ? true : false;
if (process.env.public_ip.indexOf("52.36") > -1) {
    var public_url = "http://webpack.selectiont.com";
} else {
    "http://localhost:"+port;
}
var entry = server ? {
    "home":[
    	'webpack-dev-server/client?'+public_url,
        'webpack/hot/only-dev-server',
    	'./src/views/home/index.tsx'
    ]
} : {
    "home":[
    	'./src/views/home/index.tsx'
    ]
};
var devServer = server ? {
    port: port,
    public:public_url,
    hot: true,
    publicPath: "/"+output_path_dir_name+"/",
    disableHostCheck: true,
    proxy: {
        '/': {
            target: 'http://localhost:'+port+"/public",
            secure: false,
            bypass: function(req, res, proxyOptions) {
                if (
                    req.url != "/"
                ) {
                    var url = req.url;
                    if (
                        !req.url.match(/\.(js|json|css)$/)
                        &&
                        !req.url.match(/\/$/)) {
                        url +="/"
                    } else {
                        if (req.url.match(/\.(js|json|css)$/)) return "/public/"+req.url
                        return req.url;
                    }
                    return url;
                }
                //return req.url;
            }
        },
    }
} : undefined;
//----------------------------------------------------
module.exports = {
    //mode: 'development',
    entry: entry,
    output: {
    	path: output_path_dir,
    	filename: filename+".js",
    	chunkFilename: chunkFilename+".js",
    	publicPath:"/"+output_path_dir_name+"/"
	},
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
  	resolve: {
		modules: [
			"node_modules",
			__dirname,
			__dirname+"/src",

		]
	},
	optimization: {
	    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
        /*splitChunks: {
        cacheGroups: {
            styles: {
            name: 'styles',
            test: /\.css$/,
            chunks: 'all',
            enforce: true,
            },
        },
        },*/

	},
    devServer: devServer,
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.(ts|tsx)?$/,
                loader: 'tslint-loader',
                exclude: [resolve(__dirname, "node_modules")],
            },
            {
                test: /\.(ts|tsx)?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            //transpileOnly: true,
                            compilerOptions: {
                              module: 'es2015'
                            }
                        },
                    },
                ],
                exclude: [resolve(__dirname, "node_modules")],
            },
            {
                test:/\.css$/,
                use: [(server) ? "style-loader" : {
		            loader: MiniCssExtractPlugin.loader,
		            options: {
		              // you can specify a publicPath here
		              // by default it uses publicPath in webpackOptions.output
		              publicPath: '../',
                      ignoreOrder:false,
		              hmr: process.env.NODE_ENV === 'development',
		            },
		          }, "css-loader"]
            },
            { test: /\.jpg$/, loader: server ? "file-loader" : "url-loader" },
        ]
    },
    plugins: [
    	(server) ? function() {} :
    	new MiniCssExtractPlugin({
        	filename: filename+".css",
    		chunkFilename: chunkFilename+".css",
        }),
        (server) ? function() {} : new webpack.HotModuleReplacementPlugin(),
        new WriteFilePlugin({
		    force:true,
		    test: /^(?!.*(hot)).*/,
		})
    ],
};