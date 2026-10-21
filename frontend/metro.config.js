const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.transformer.babelTransformerPath =
  require.resolve("react-native-svg-transformer/expo");

config.resolver.assetExts =
  config.resolver.assetExts.filter(
    (ext) => ext !== "svg"
  );

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "svg",
];

// SDK 54 opens an auxiliary JS socket for RSC commands. Native Metro reload
// already has its own connection; delivering the same reload to that JS socket
// can race RCTWebSocketModule teardown and reach a disconnected JS emitter.
// This app has no RSC routes. Keep native reload/HMR, and omit only that unused
// socket in iOS development. Release, Android and web resolve normally.
const expoPackage = require("expo/package.json");
const rscEnabled = !!require("./app.json").expo.experiments?.reactServerComponentRoutes;
const auxiliarySocket = path.join(path.dirname(require.resolve("expo/package.json")), "src", "async-require", "messageSocket.native.ts");
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolution = originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
  if (context.dev && platform === "ios" && expoPackage.version.startsWith("54.") && !rscEnabled &&
      resolution.type === "sourceFile" && resolution.filePath === auxiliarySocket) {
    return { type: "empty" };
  }
  return resolution;
};

module.exports = config;