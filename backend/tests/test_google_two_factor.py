import ast
import asyncio
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from urllib.parse import urlencode, urlparse, parse_qs

ROOT = Path(__file__).resolve().parents[2]

class GoogleTwoFactorTests(unittest.TestCase):
    def callback(self, enabled):
        tree = ast.parse((ROOT / 'backend/app/api/v1/endpoints/auth.py').read_text())
        fn = next(n for n in tree.body if isinstance(n, ast.AsyncFunctionDef) and n.name == 'google_callback')
        fn.decorator_list = []
        for arg in fn.args.args:
            arg.annotation = None
        fn.args.defaults = []
        fn.returns = None
        db = Mock()
        db.query.return_value.filter.return_value.first.return_value = object() if enabled else None
        g = dict(exchange_google_code_for_tokens=AsyncMock(return_value={'access_token':'google'}),
                 get_google_user_info=AsyncMock(return_value={'email':'test@example.com','sub':'google-id','email_verified':True}),
                 get_or_create_oauth_user=Mock(return_value=SimpleNamespace(id=42,is_active=True)),
                 OAuthUserCreate=lambda **kw:kw, create_access_token=Mock(return_value='full-access'),
                 create_session=Mock(return_value='refresh'), create_2fa_token=Mock(return_value='temporary'),
                 TwoFactorAuth=SimpleNamespace(user_id=42,is_enabled=True),
                 create_security_event=Mock(),create_analytics_event=Mock(),urlencode=urlencode,
                 RedirectResponse=lambda **kw:SimpleNamespace(**kw))
        exec(compile(ast.fix_missing_locations(ast.Module(body=[fn],type_ignores=[])), '<actual google callback>', 'exec'),g)
        result = asyncio.run(g['google_callback']('code',db))
        return parse_qs(urlparse(result.url).query), g

    def test_enabled_requires_two_factor_without_session(self):
        params, g = self.callback(True)
        self.assertEqual(params.get('requires_2fa'), ['true'])
        self.assertEqual(params['access_token'], ['temporary'])
        self.assertNotIn('refresh_token',params)
        g['create_access_token'].assert_not_called()
        g['create_session'].assert_not_called()

    def test_normal_google_login_preserved(self):
        params,g = self.callback(False)
        self.assertEqual(params['access_token'],['full-access'])
        self.assertEqual(params['refresh_token'],['refresh'])
        g['create_session'].assert_called_once()

if __name__ == '__main__': unittest.main()
