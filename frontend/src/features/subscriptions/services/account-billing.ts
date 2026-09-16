import Purchases, { type PurchasesPackage } from "react-native-purchases";
import { getAccountGeneration, isAccountChanging, subscribeAccountBoundary } from "@/features/auth/services/account-boundary";

export function createAccountBilling(getKey: () => string | undefined) {
  let configured = false;
  let queue: Promise<unknown> = Promise.resolve();
  let snapshot = { ready: false, userId: null as string | null, generation: -1 };
  const listeners = new Set<() => void>();
  const publish = (ready: boolean, userId: string | null, generation: number) => {
    snapshot = { ready, userId, generation };
    listeners.forEach(listener => listener());
  };
  function serial<T>(action: () => Promise<T>) {
    const result = queue.then(action);
    queue = result.catch(() => {});
    return result;
  }
  async function configure() {
    const apiKey = getKey()?.trim();
    if (!apiKey) throw new Error("Subscriptions are not configured yet.");
    if (!configured) { Purchases.configure({ apiKey }); configured = true; }
  }
  function check(expected = snapshot) {
    if (!expected.ready || snapshot !== expected || isAccountChanging() || expected.generation !== getAccountGeneration()) {
      throw new Error("Subscription account is not ready. Please try again.");
    }
  }
  async function reset() {
    publish(false, null, -1);
    return serial(async () => {
      if (configured && !(await Purchases.isAnonymous())) await Purchases.logOut();
    });
  }
  subscribeAccountBoundary(() => {
    void reset().catch(() => { /* Readiness stays false; the next login must succeed. */ });
  });
  async function operation<T>(action: () => Promise<T>) {
    const expected = snapshot;
    check(expected);
    return serial(async () => { check(expected); const result = await action(); check(expected); return result; });
  }
  return {
    configure: () => serial(configure),
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    async logIn(userId: string) {
      const generation = getAccountGeneration();
      publish(false, null, generation);
      return serial(async () => {
        if (generation !== getAccountGeneration() || isAccountChanging()) throw new Error("Account changed");
        await configure();
        const { customerInfo } = await Purchases.logIn(userId);
        if (generation !== getAccountGeneration() || isAccountChanging()) throw new Error("Account changed");
        publish(true, userId, generation);
        return customerInfo;
      });
    },
    logOut: reset,
    getOfferings: () => operation(() => Purchases.getOfferings()),
    purchasePackage: (pkg: PurchasesPackage) => operation(async () => (await Purchases.purchasePackage(pkg)).customerInfo),
    restorePurchases: () => operation(() => Purchases.restorePurchases()),
  };
}
