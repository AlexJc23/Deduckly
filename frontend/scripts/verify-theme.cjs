const fs = require('fs'), path = require('path'), Module = require('module'), assert = require('node:assert/strict');
const root = process.env.DEDUCKLY_FRONTEND || path.resolve(__dirname, '..');
const resolve = name => require.resolve(name, { paths: [root] });
const ts = require(resolve('typescript')), React = require(resolve('react')), server = require(resolve('react-dom/server')), native = require(resolve('react-native-web'));
let dark = false, width = 390;
const original = Module._load;
Module._load = function(id, parent, main) {
  if (id === 'react-native') return { ...native, useWindowDimensions: () => ({ width, height: 844, scale: 1, fontScale: 1 }) };
  if (id === '@/theme/theme' || (id === './theme' && parent.filename.includes('/theme/'))) return { useAppTheme: () => ({ dark }) };
  if (id === 'react-native-safe-area-context') return { SafeAreaView: native.View, useSafeAreaInsets: () => ({ top: 0, bottom: 0 }) };
  if (id === 'expo-router') return { router: { push() {} } };
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return original.call(this, id, parent, main);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, file);
const { appearanceColor: color } = require(root + '/src/theme/palette.ts');
const { themedStyle, View, Text } = require(root + '/src/theme/components.tsx');
const { ReportBody } = require(root + '/src/features/reports/components/ReportBody.tsx');
const { PreferenceSection } = require(root + '/src/features/settings/components/PreferenceSection.tsx');
const { PreferenceInput } = require(root + '/src/features/settings/components/PreferenceInput.tsx');
const { PreferenceToggle } = require(root + '/src/features/settings/components/PreferenceToggle.tsx');
assert.equal(color('#FFFFFF', 'backgroundColor', true), '#1B2635');
assert.equal(color('#FFFFFF', 'color', true), '#FFFFFF');
assert.equal(color('#F0FDF4', 'backgroundColor', true), '#17382D');
assert.equal(color('#FFF5F5', 'backgroundColor', true), '#40252D');
assert.equal(color('#0072B5', 'backgroundColor', true), '#0072B5');
const style = [{ padding: 20, backgroundColor: '#FFFFFF' }, { opacity: .5 }];
assert.equal(themedStyle(style, false), style);
assert.deepEqual(themedStyle(style, true), { padding: 20, backgroundColor: '#1B2635', opacity: .5 });
const report = { total_income: 5400, total_expenses: 870, total_miles: 1260, mileage_deduction: 850, deductible_expense_total: 440, total_deductions: 1290, net_profit: 4110, taxable_income: 4110, estimated_tax_owed: 411, estimated_tax_savings: 129, tax_method: 'standard_mileage', expense_breakdown: { fuel: { amount: 430, count: 8 }, supplies: { amount: 440, count: 2 } } };
const output = '/tmp/deduckly-theme-qa'; fs.mkdirSync(output, { recursive: true });
for (dark of [false, true]) for (width of [320, 390, 1024]) {
  const body = server.renderToStaticMarkup(React.createElement(View, { style: { padding: 20, maxWidth: 760, marginHorizontal: 'auto', backgroundColor: '#F8FAFC' } },
    React.createElement(Text, { style: { fontSize: 28, fontWeight: '700', marginBottom: 20 } }, 'Deduckly'),
    React.createElement(PreferenceSection, { title: 'Goals' }, React.createElement(PreferenceInput, { label: 'Monthly Income Goal', value: '5000' }), React.createElement(PreferenceToggle, { label: 'Income Goal Reminders', description: 'Daily reminders and a new-month goal.', value: true, onValueChange() {} })),
    React.createElement(ReportBody, { report })));
  assert.ok(body.includes('$5,400.00'));
  fs.writeFileSync(`${output}/${dark ? 'dark' : 'light'}-${width}.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:${dark ? '#101722' : '#F8FAFC'}}${native.StyleSheet.getSheet().textContent}</style><main style="max-width:${width}px;margin:auto">${body}</main>`);
}
console.log('Passed palette, brand/white-text preservation, light-style identity, animation/layout-property preservation, and six phone/tablet report/form renders.');
