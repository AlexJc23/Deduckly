import { QueryClient, MutationCache, type MutationOptions, type MutationState } from "@tanstack/react-query";
import { getAccountGeneration, isAccountChanging, subscribeAccountBoundary } from "@/features/auth/services/account-boundary";

class AccountMutationCache extends MutationCache {
  build<TData, TError, TVariables, TResult>(client: QueryClient, options: MutationOptions<TData, TError, TVariables, TResult>, state?: MutationState<TData, TError, TVariables, TResult>) {
    const generation = getAccountGeneration();
    const current = () => !isAccountChanging() && generation === getAccountGeneration();
    const wrap = (value: typeof options): typeof options => ({
      ...value,
      mutationFn: value.mutationFn ? async (...args) => {
        if (!current()) throw new Error("Account session changed");
        const result = await value.mutationFn!(...args);
        if (!current()) throw new Error("Account session changed");
        return result;
      } : undefined,
      onMutate: value.onMutate ? (...args) => {
        if (!current()) throw new Error("Account session changed");
        return value.onMutate!(...args);
      } : undefined,
      onSuccess: (...args) => { if (current()) return value.onSuccess?.(...args); },
      onError: (...args) => { if (current()) return value.onError?.(...args); },
      onSettled: (...args) => { if (current()) return value.onSettled?.(...args); },
    });
    const mutation = super.build(client, wrap(client.defaultMutationOptions(options)), state);
    // Observers may update options while a mutation is still pending.
    const setOptions = mutation.setOptions.bind(mutation);
    mutation.setOptions = value => setOptions(wrap(value));
    return mutation;
  }
}
export const queryClient = new QueryClient({ mutationCache: new AccountMutationCache() });
// This cache contains server/query state only, never the offline trip journal.
subscribeAccountBoundary(() => {
  void queryClient.cancelQueries();
  queryClient.clear();
});
