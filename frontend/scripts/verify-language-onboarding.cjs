const fs = require('fs'), path = require('path'), Module = require('module'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require('typescript'), React = require('react'), server = require('react-dom/server'), native = require('react-native-web');
const storage = new Map();
let width = 320, dark = false, saved, captured, rejectSave = false;
const original = Module._load;
Module._load = function(id, parent, main) {
  if (id === '@react-native-async-storage/async-storage') return { getItem: async key => storage.get(key) ?? null, setItem: async (key, value) => { storage.set(key, value); } };
  if (id === 'react-native') return { ...native, Keyboard: { dismiss() {} }, useWindowDimensions: () => ({ width, height: 844, scale: 1, fontScale: 1 }) };
  if (id === '@/theme/theme' || (id === './theme' && parent.filename.includes('/theme/'))) return { useAppTheme: () => ({ dark }) };
  if (id === 'react-native-safe-area-context') return { SafeAreaView: native.View };
  if (id === '@/theme/icons') return { Ionicons: () => null };
  if (id === 'expo-router') return { router: { push() {} } };
  if (id === 'expo-symbols') return { SymbolView: () => null };
  if (id.endsWith('.svg')) return () => null;
  if (id === '@tanstack/react-query') return { useQueryClient: () => ({ invalidateQueries: async () => {} }) };
  if (id === '@/features/auth/api/user.api') return { updateCurrentUser: async payload => { if (rejectSave) throw new Error('offline'); saved = payload; } };
  if (id === '../components/onboarding-screen' && parent.filename.endsWith('/goals-screen.tsx')) {
    const actual = original.call(this, id, parent, main);
    return { ...actual, OnboardingScreen: props => { captured = props; return React.createElement(actual.OnboardingScreen, props); } };
  }
  if (id.startsWith('@/')) id = path.join(root, 'src', id.slice(2));
  return original.call(this, id, parent, main);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, file);
const core = require('../src/i18n/core.ts');
const language = require('../src/i18n/language.tsx');
const service = require('../src/features/onboarding/services/onboarding.service.ts');
const { parseGoalInput } = require('../src/features/onboarding/utils/goal-input.ts');
const { GoalsScreen } = require('../src/features/onboarding/screens/goals-screen.tsx');
(async () => {
  assert.equal(await service.getOnboardingStep(1), 0);
  for (const [legacy, expected] of [['0', 0], ['1', 1], ['2', 2], ['3', 4]]) {
    storage.set('deduckly:onboarding:v1:1', legacy);
    assert.equal(await service.getOnboardingStep(1), expected);
  }
  for (let step = 0; step <= 4; step++) {
    await service.saveOnboardingStep(1, step);
    assert.equal(await service.getOnboardingStep(1), step);
  }
  assert.equal(await service.getOnboardingStep(2), 0, 'Progress is per account');
  assert.equal(parseGoalInput('150,50'), '150.50');
  assert.equal(parseGoalInput(' 3000.25 '), '3000.25');
  assert.equal(parseGoalInput(''), null);
  for (const invalid of ['0', '-1', 'NaN', '1,000', '1.234', 'Infinity', '1e3']) assert.throws(() => parseGoalInput(invalid));
  const observed = [];
  const unsubscribe = core.subscribeLanguage(() => observed.push(core.getLanguage()));
  language.setLanguage('es'); language.setLanguage('en'); language.setLanguage('es');
  assert.deepEqual(observed, ['es', 'en', 'es'], 'Mounted subscribers are notified synchronously');
  unsubscribe();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(storage.get('deduckly.language'), 'es', 'Rapid changes persist in order');
  assert.equal(core.translate('Daily income goal'), 'Meta diaria de ingresos');
  assert.equal(core.translate('{step} of {total}', { step: 3, total: 4 }), '3 de 4');
  assert.equal(core.translate('Alex’s custom trip'), 'Alex’s custom trip');
  assert.equal(core.getLocale(), 'es-US');
  const { TextInput, Text } = require('../src/theme/components.tsx');
  const userText = 'Daily income goal';
  const input = server.renderToStaticMarkup(React.createElement(TextInput, { value: userText, placeholder: 'Daily income goal' }));
  assert.ok(input.includes('value=\"Daily income goal\"'), 'User input matching a translation key is never translated');
  assert.ok(input.includes('placeholder=\"Meta diaria de ingresos\"'));
  assert.ok(server.renderToStaticMarkup(React.createElement(Text, null, userText)).includes(userText), 'User display text is unchanged');
  const { IncomeCard } = require('../src/features/income/components/IncomeCard.tsx');
  const record = { id: 1, source: 'business', business_name: 'Daily income goal', amount: 150.50, created_at: '2026-09-01T12:00:00Z' };
  const before = JSON.stringify(record);
  assert.ok(server.renderToStaticMarkup(React.createElement(IncomeCard, { income: record })).includes('Daily income goal'), 'Business names matching app copy are preserved');
  assert.equal(JSON.stringify(record), before);
  const output = '/tmp/deduckly-i18n-qa'; fs.mkdirSync(output, { recursive: true });
  for (const lang of ['en', 'es']) for (dark of [false, true]) for (width of [320, 390, 1024]) {
    core.setRuntimeLanguage(lang);
    const onboarding = { initialGoals: { daily: '150.50', monthly: '3000', currency: 'USD' }, step: 2, userId: 1, loading: false, isLoading: false, busy: false, error: '', runAction() {}, setError() {} };
    const body = server.renderToStaticMarkup(React.createElement(GoalsScreen, { onboarding }));
    assert.ok(body.includes(lang === 'es' ? 'Meta diaria de ingresos' : 'Daily income goal'));
    assert.ok(body.includes('150.50') && body.includes('3000'), 'Amounts are preserved');
    assert.ok(body.includes(lang === 'es' ? '3 de 4' : '3 of 4'));
    fs.writeFileSync(`${output}/goals-${lang}-${dark ? 'dark' : 'light'}-${width}.html`, `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}${native.StyleSheet.getSheet().textContent}</style><main style="width:${width}px;max-width:100%;margin:auto">${body}</main>`);
  }
  let advanced = 0, failure = '', pending;
  const onboarding = { initialGoals: { daily: '150,50', monthly: '', currency: 'USD' }, step: 2, userId: 1, loading: false, isLoading: false, busy: false, error: '', setError: message => { failure = message; }, runAction: action => { pending = (async () => { try { if (!action || await action()) advanced++; } catch { failure = 'save failed'; } })(); return pending; } };
  server.renderToStaticMarkup(React.createElement(GoalsScreen, { onboarding }));
  captured.onContinue(); await pending;
  assert.deepEqual(saved, { daily_income_goal: '150.50' }, 'Only supplied goals are sent; blank monthly cannot erase a saved goal');
  assert.equal(advanced, 1);
  rejectSave = true;
  captured.onContinue(); await pending;
  assert.equal(advanced, 1, 'Failed save must not advance');
  assert.equal(failure, 'save failed');
  saved = undefined;
  captured.onSkip(); await pending;
  assert.equal(advanced, 2); assert.equal(saved, undefined, 'Skip never updates account data');
  onboarding.initialGoals.daily = '-10'; failure = '';
  server.renderToStaticMarkup(React.createElement(GoalsScreen, { onboarding }));
  captured.onContinue();
  assert.ok(failure.includes('positive amount')); assert.equal(advanced, 2); assert.equal(saved, undefined);
  core.setRuntimeLanguage('en');
  console.log('Passed onboarding progress migration/account isolation, decimal validation, language persistence/interpolation/fallback, goal save/skip/failure handlers, user-data preservation, and 12 English/Spanish phone/tablet goals renders in both themes.');
})().catch(error => { console.error(error); process.exitCode = 1; });
