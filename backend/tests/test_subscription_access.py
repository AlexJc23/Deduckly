import ast
import unittest
from pathlib import Path
from datetime import datetime, timezone, timedelta
from types import SimpleNamespace

ROOT = Path(__file__).resolve().parents[2]
class SubscriptionAccessTests(unittest.TestCase):
    def access(self, status, days):
        tree=ast.parse((ROOT/'backend/app/services/subscription_service.py').read_text())
        nodes=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('is_user_premium','has_active_subscription')]
        sub=SimpleNamespace(status=status,expiration_date=datetime.now(timezone.utc)+timedelta(days=days))
        scope=dict(datetime=datetime,timezone=timezone,get_user_subscription=lambda db,user_id:sub)
        for node in nodes:
            node.returns=None
            for arg in node.args.args: arg.annotation=None
        exec(compile(ast.fix_missing_locations(ast.Module(body=nodes,type_ignores=[])),'<subscription functions>','exec'),scope)
        return scope['is_user_premium'](SimpleNamespace(subscriptions=[sub])),scope['has_active_subscription'](None,1)
    def test_cancelled_renewal_keeps_paid_access(self): self.assertEqual(self.access('canceled',7),(True,True))
    def test_expired_cancellation_has_no_access(self): self.assertEqual(self.access('canceled',-1),(False,False))
    def test_active_paid_subscription(self): self.assertEqual(self.access('active',7),(True,True))
    def test_expired_status_never_grants_access(self): self.assertEqual(self.access('expired',7),(False,False))
if __name__=='__main__': unittest.main()
