'use strict'

const path = require('path')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const config = require('./config')
const pkg = require('../package.json')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options = {}) {
  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with MiniCSSExtractPlugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = [cssLoader]

    if (loader) {
      loaders.push({
        loader: `${loader}-loader`,
        options: {
          ...loaderOptions,
          sourceMap: options.sourceMap
        }
      })
    }

    if (loader === 'sass' && config.sass_resources) {
      loaders.push({
        loader: 'sass-resources-loader',
        options: {
          resources: config.sass_resources.map(resource => path.resolve(process.cwd(), resource))
        }
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return [MiniCSSExtractPlugin.loader].concat(loaders)
    }
    return ['vue-style-loader'].concat(loaders)
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass', {
      includePaths: [
        path.resolve(process.cwd(), 'node_modules/compass-mixins/lib')
      ]
    }),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  Object.entries(loaders).forEach((entry) => {
    const [extension, loader] = entry
    output.push({
      test: new RegExp(`\\.${extension}$`),
      use: loader
    })
  })
  return output
}

exports.createNotifierCallback = function () {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') {
      return
    }

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: pkg.name,
      message: `${severity}: ${error.name}`,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}
