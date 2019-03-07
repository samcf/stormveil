const path = require('path');

function devtool(mode) {
    switch (mode) {
        case "development":
            return "inline-source-map";
        case "production":
            return "source-map";
        default:
            return "eval";
    }
}

module.exports = env => {
    return {
        mode: env.mode,
        entry: "./src/main.ts",
        devtool: devtool(env.mode),
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        { loader: "style-loader" },
                        {
                            loader: "css-loader",
                            options: {
                                modules: true,
                            }
                        }
                    ],
                    exclude: /node_modules/
                },
                {
                    test: /\.tsx?$/,
                    use: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: [".js", ".ts", ".tsx", ".css"]
        },
        output: {
            path: path.resolve(__dirname, "web/script"),
            filename: "ui.bundle.js"
        }
    };
};
