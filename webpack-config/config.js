var path = require('path')
var webpack = require('webpack')

var DEBUG = process.env.NODE_ENV !== 'production'

var entry = []
if (DEBUG) entry.push('webpack/hot/dev-server')

var plugins = [
	new webpack.DefinePlugin({
		DEBUG: DEBUG,
		'process.env': {
			NODE_ENV: JSON.stringify(process.env.NODE_ENV)
		}
	})
]

if (DEBUG) {
	plugins.push(new webpack.HotModuleReplacementPlugin())
} else {
	plugins.push(new webpack.optimize.UglifyJsPlugin())
	plugins.push(new webpack.optimize.DedupePlugin())
}

function loadersToString(loaders) {
	var res = []
	for (var name in loaders) {
		var params = loaders[name]
		res.push(name + '?' + JSON.stringify(params))
	}
	return res.join('!')
}

var loaders = [
	{
		test: /\.js$/,
		loader: loadersToString({
			'babel': {
				presets: [
					path.join(__dirname, 'node_modules', 'babel-preset-es2015'),
					path.join(__dirname, 'node_modules','babel-preset-stage-0'),
					path.join(__dirname, 'node_modules','babel-preset-react')
				],
				plugins: [
					path.join(__dirname, 'node_modules', 'babel-plugin-transform-runtime'),
					path.join(__dirname, 'node_modules', 'babel-plugin-transform-decorators-legacy')
				],
				cacheDirectory: true
			}
		}),
		exclude: [
			path.resolve(__dirname, 'node_modules')
		]
	},

	{
		test: /\.json$/,
		loader: 'json-loader'
	},

	{
		test: /\.icon\.svg$/,
		loader: loadersToString({
			'svg-sprite': {
				name: '[name]_[hash]',
				prefixize: true
			},
			'image': {}
		})
	}
]

module.exports = {
    entry: entry,

	plugins: plugins,

	module: {
		loaders: loaders
	},

	devtool: DEBUG ? 'source-map' : undefined,

	resolve: {
		alias: {
			'babel-runtime': path.join(__dirname, 'node_modules/babel-runtime')
		}
	},

	resolveLoader: {
		modulesDirectories: [
			'web_loaders', 'web_modules', 'node_loaders', 'node_modules', // default
			path.join(__dirname, 'node_modules')
		]
	}
}