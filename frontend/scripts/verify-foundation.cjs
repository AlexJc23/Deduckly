const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
function load(file, mocks = {}) {
  const filename = path.join(root, file);
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  } }).outputText;
  new Function('require', 'module', 'exports', code)(name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name.startsWith('.') || name.startsWith('@/')) {
      const target = name.startsWith('@/') ? path.join('src', name.slice(2)) : path.join(path.dirname(file), name);
      return load(target + '.ts', mocks);
    }
    return require(require.resolve(name, { paths: [root] }));
  }, module, module.exports);
  return module.exports;
}
const base = 'src/features/offer-analyzer/';
const { analyzeOffer } = load(base + 'utils/verdict.ts');
const { analyzePremiumOffer } = load(base + 'utils/premium.ts');
const preferences = { costPerMile: .2, minimumProfit: 10, minimumHourRate: 100, minimumDollarsPerMile: 2, preferredMaxDistance: 20 };
for (const duration of [undefined, null, 0]) {
  const input = { payout: 18.5, distance: 7.2, estimatedTime: duration };
  assert.equal(analyzeOffer(input).dollarsPerMile, 2.57);
  assert.equal(analyzeOffer(input).hourlyRate, null);
  const pro = analyzePremiumOffer(input, preferences);
  assert.equal(pro.profitHourlyRate, null);
  assert.equal(pro.premiumChecks.length, 3);
  assert(!pro.premiumChecks.some(check => check.title === 'Hourly Earnings'));
  assert.equal(pro.score, 100);
}
const timed = analyzePremiumOffer({ payout: 18.5, distance: 7.2, estimatedTime: 35 }, preferences);
assert.equal(timed.hourlyRate, 31.71);
assert.equal(timed.premiumChecks.length, 4);
assert.equal(timed.score, 70);
assert.equal(analyzeOffer({ payout: 18.5, distance: 7.2, estimatedTime: 1 }).hourlyRate, 111);
assert.equal(analyzeOffer({ payout: 100, distance: 7.2, estimatedTime: 10 }).hourlyRate, 150);
for (const input of [{ payout: 18.5, distance: 0 }, { payout: NaN, distance: 7 },
  { payout: 18.5, distance: 7, estimatedTime: -1 }, { payout: 18.5, distance: 7, estimatedTime: NaN },
  { payout: 18.5, distance: 7, estimatedTime: Infinity }]) {
  assert.throws(() => analyzeOffer(input));
  assert.throws(() => analyzePremiumOffer(input, preferences));
}
console.log('PASS Free/Pro optional duration, validation, hourly omission, and preserved real-duration floor/cap');
function flatten(element) {
  if (!element || typeof element !== 'object') return [];
  return [element, ...[element.props?.children].flat(Infinity).flatMap(flatten)];
}
(async () => {
  for (const os of ['ios', 'android']) {
    let submitted;
    const values = ['75', 'gig_platform', 'uber', '', ''];
    const mocks = {
      react: { useState: () => [values.shift(), () => {}], useEffect: () => {} },
      'react-native': { Platform: { OS: os }, StyleSheet: { create: x => x } },
      'expo-router': { router: { back() {} } },
      '@/i18n/language': { useLanguage() {}, Translated: 'Translated' },
      '@/theme/components': Object.fromEntries(['Pressable','ScrollView','Text','TextInput','View'].map(k => [k, k])),
    };
    const { IncomeForm } = load('src/features/income/components/IncomeForm.tsx', mocks);
    const oldDate = '2025-02-03T15:04:00Z';
    const tree = IncomeForm({ initialValues: { received_at: oldDate }, onSubmit: x => { submitted = x; } });
    flatten(tree).filter(x => x.type === 'Pressable').at(-1).props.onPress();
    assert.equal(submitted.received_at, oldDate);
    assert.equal(submitted.amount, 75);
  }
  console.log('PASS iOS and Android income edits preserve the original received date');
  for (const [file, hook, args] of [
    ['use-update-income','useUpdateIncome',[{}, { incomeId: 5 }]],
    ['use-delete-income','useDeleteIncome',[]],
  ]) {
    const keys = [];
    const hooks = load(`src/features/income/hooks/${file}.ts`, {
      '@tanstack/react-query': { useMutation: options => options, useQueryClient: () => ({ invalidateQueries: async ({ queryKey }) => keys.push(queryKey[0]) }) },
      '../api/income-api': {}, 'expo-router': {},
    });
    await hooks[hook]().onSuccess(...args);
    for (const key of ['income','daily-goal','monthly-goal','report','today-report']) assert(keys.includes(key));
  }
  console.log('PASS income update/delete invalidate targeted financial and daily-goal queries');
})().catch(error => { console.error(error); process.exitCode = 1; });
