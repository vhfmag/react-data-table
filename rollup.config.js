import resolve from "rollup-plugin-node-resolve";
import sourceMaps from "rollup-plugin-sourcemaps";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
// import sass from "rollup-plugin-sass";
import postcss from "rollup-plugin-postcss";
import cssmodules from "postcss-modules";
import autoprefixer from "autoprefixer";
// import postcss from "postcss";
import cssnano from "cssnano";
import sass from "node-sass";

const cssExportMap = {};

const preprocessor = (content, id) => new Promise((resolve, reject) => {
    console.log({ preprocessor, resolve, reject });
    const renderer = sass.render({ data: content, sourceMap: true, outFile: "./dist/index.css.map" }, (err, result) => {
        console.log({err, result});

        if (err) {
            return reject(err);
        }

        return resolve({ code: result.css.toString(), map: result.map.toString() });
    });
});

export default {
    entry: `./compiled/index.js`,
    targets: [{ dest: "dist/index.es6.js", format: "es" }, { dest: "dist/index.js", format: "umd" }],
    sourceMap: true,
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: id => /^(react|react-icons)($|\/)/.test(id),
    globals: {
        react: "React",
    },
    moduleName: "lugh-data-table",
    exports: "named",
    plugins: [
        postcss({
            preprocessor,
            output: "./dist/index.css",
            plugins: [
                cssmodules({
                    getJSON(id, exportTokens) {
                        cssExportMap[id] = exportTokens;
                    }
                }),
                autoprefixer,
                cssnano
            ],
            getExport(id) {
                return cssExportMap[id];
            },
            extensions: [".scss"],
        }),
        babel({
            "babelrc": false,
            "plugins": [
                "external-helpers"
            ],

            "exclude": ["node-modules/**", "**/*.scss"],

            "presets": [
                "react",
                "react-optimize",
                ["es2015", { "modules": false }]
            ]
        }),
        resolve({ module: true, jsNext: true, main: true, browser: true }),
        commonjs(),
        sourceMaps(),
    ],
};
