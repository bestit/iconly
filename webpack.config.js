import { resolve as _resolve } from 'path';
import TerserPlugin from 'terser-webpack-plugin';

const PATHS = {
    entryPoint: './src/index.ts',
    bundles: _resolve('./dist/umd'),
};

const config = {
    /*
     * These are the entry point of our library. We tell webpack to use
     * The name we assign later, when creating the bundle. We also use
     * The name to filter the second entry point for applying code
     * Minification via UglifyJS
     */
    entry: {
        'icon-element': [PATHS.entryPoint],
        'icon-element.min': [PATHS.entryPoint],
    },

    /*
     * The output defines how and where we want the bundles. The special
     * Value `[name]` in `filename` tell Webpack to use the name we defined above.
     * We target a UMD and name it MyLib. When including the bundle in the browser
     * It will be accessible at `window.MyLib`
     */
    output: {
        path: PATHS.bundles,
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'IconElement',
        umdNamedDefine: true,
    },

    /*
     * Add resolve for `tsx` and `ts` files, otherwise Webpack would
     * Only look for common JavaScript file extension (.js)
     */
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },

    /*
     * Activate source maps for the bundles in order to preserve the original
     * Source when the user debugs the application
     */
    devtool: 'source-map',
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                include: /\.min\.js$/,
            }),
        ],
    },
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
                            },
                        }
                    }
                ],
                exclude: /node_modules/,
            },
        ],
    },
};

export default config;
