import { resolve as _resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';

const PATHS = {
    entryPoint: './src/index.ts',
    bundle: {
        es5: _resolve('./dist/es5/umd'),
        es6: _resolve('./dist/umd'),
    },
};

const baseConfig = {
    entry: {
        'icon-element': [PATHS.entryPoint],
        'icon-element.min': [PATHS.entryPoint],
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'umd',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    devtool: 'nosources-source-map',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/,
            }),
        ],
    },
    devServer: {
        contentBase: [
            _resolve('./public'),
            _resolve('./node_modules')
        ],
        publicPath: '/',
    },
};

const config = [
    {
        ...baseConfig,
        name: 'es5',
        output: {
            ...baseConfig.output,
            path: PATHS.bundle.es5,
        },
        target: ['web', 'es5'],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                compilerOptions: {
                                    declaration: false,
                                    target: 'es5',
                                    module: 'commonjs',
                                    lib: [
                                        'es2015',
                                        'dom'
                                    ],
                                },
                            }
                        }
                    ],
                    exclude: /node_modules/,
                },
            ],
        },
    },
    {
        ...baseConfig,
        name: 'es6',
        output: {
            ...baseConfig.output,
            path: PATHS.bundle.es6,
        },
        target: ['web', 'es6'],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                compilerOptions: {
                                    declaration: false,
                                    target: 'es6',
                                },
                            }
                        }
                    ],
                    exclude: /node_modules/,
                },
            ],
        },
    }
];

export default config;
