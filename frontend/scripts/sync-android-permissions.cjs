// Synchronize only permissions in an existing generated Android project.
// Expo prebuild also applies these app.json settings when generating Android.
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const android = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8")).expo.android;
const file = path.join(root, "android/app/src/main/AndroidManifest.xml");
let xml = fs.readFileSync(file, "utf8");
const managed = new Set([...android.permissions, ...android.blockedPermissions]);
xml = xml.replace(/\s*<uses-permission\b[^>]*\/>/g, node => {
  const name = node.match(/android:name="([^"]+)"/)?.[1];
  return managed.has(name) ? "" : node;
});
const entries = [
  ...android.permissions.map(name => `  <uses-permission android:name="${name}"/>`),
  ...android.blockedPermissions.map(name => `  <uses-permission android:name="${name}" tools:node="remove"/>`),
].join("\n");
if (!xml.includes('xmlns:tools="http://schemas.android.com/tools"')) {
  xml = xml.replace("<manifest ", '<manifest xmlns:tools="http://schemas.android.com/tools" ');
}
xml = xml.replace(/(<manifest\b[^>]*>)/, `$1\n${entries}`);
fs.writeFileSync(file, xml);
console.log("Synchronized Android permissions only. iOS was not accessed.");
