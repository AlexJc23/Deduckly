// Reanimated style handles must never enter the React Native Animated adapter.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
let checked = 0;
function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) { scan(file); continue; }
    if (!file.endsWith('.tsx')) continue;
    const ast = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const imports = ast.statements.filter(ts.isImportDeclaration);
    if (!imports.some(node => node.moduleSpecifier.text === 'react-native-reanimated' && node.importClause)) continue;
    checked++;
    for (const node of imports) {
      if (node.moduleSpecifier.text !== '@/theme/components') continue;
      const bindings = node.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      for (const item of bindings.elements) {
        assert.ok(!['AnimatedView', 'AnimatedText'].includes((item.propertyName || item.name).text), `${file}: RN Animated adapters cannot consume Reanimated handles; use native Reanimated components.`);
      }
    }
  }
}
scan(path.join(root, 'app'));
scan(path.join(root, 'src'));
assert.ok(checked >= 2, 'Expected both income goal animation paths to be checked');
console.log(`Passed animation engine boundaries for ${checked} Reanimated components.`);
