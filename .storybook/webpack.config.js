// load the default config generator.
const genDefaultConfig = require('@storybook/react/dist/server/config/defaults/webpack.config.js');
module.exports = (baseConfig, env) => {
  const config = genDefaultConfig(baseConfig, env);
  // Extend it as you need.
  // For example, add typescript loader:
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    use: [
        "babel-loader",
        {
            loader: "awesome-typescript-loader",
            options: {
                // configFileName: "./tsconfig.storybook.json"
            }
        },
    ]
  });
  config.module.rules.push({
    test: /\.jsx$/,
    use: [
        "babel-loader",
    ]
  });
  config.devtool = "eval-source-map";
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
};