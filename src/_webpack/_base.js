"use strict"

const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

const defaults = {
    distPath: path.resolve(process.cwd(), 'app/dist/'),
    publicPath: '/app/dist/',
    target: 'node-webkit',
    browserList: [],
    node: 1.0,
    plugins: []
}

module.exports = (options = {}) => {
    const srcPath = path.resolve(process.cwd(), 'src')
    const settings = Object.assign({}, defaults, options)

    settings.plugins.unshift(
        new HtmlWebpackPlugin({
            template: path.join(srcPath, 'app.html'),
            filename: '../main.html',
            excludeChunks: [
                'critical'
            ],
            inject: 'body',
            minify: {
                removeComments: true,
                collapseWhitespace: true
            }
        })
    )

    return {
        entry: {
            critical: [
                path.join(srcPath, 'critical.js')
            ],
            main: [
                path.join(srcPath, 'main.jsx')
            ]
        },
        output: {
            path: settings.distPath,
            publicPath: settings.publicPath,
            filename: '[name].js',
            chunkFilename: '[id].chunk.js'
        },
        target: settings.target,
        module: {
            rules: [
                {
                    test: /\.(ico|gif|png|jpg|jpeg|svg|webp)$/,
                    exclude: /node_modules/,
                    loader: 'file-loader',
                    options: {
                        name: 'files/[hash].[ext]'
                    }
                },
                {
                    test: /\.js?$|\.jsx$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    [
                                        'env', {
                                            targets: {
                                                browsers: settings.browserList,
                                                node: settings.node
                                            },
                                            modules: false
                                        }
                                    ],
                                    'react'
                                ]
                            }
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                camelCase: true,
                                autoprefixer: {
                                    'browsers': settings.browserList,
                                    add: true
                                }
                            }
                        }
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        {
                            loader: 'style-loader'
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                camelCase: true,
                                autoprefixer: {
                                    'browsers': settings.browserList,
                                    add: true
                                }
                            }
                        },
                        {
                            loader: 'less-loader'
                        }
                    ]
                }
            ],
            noParse: /\.min\./
        },
        plugins: settings.plugins
    }
}
