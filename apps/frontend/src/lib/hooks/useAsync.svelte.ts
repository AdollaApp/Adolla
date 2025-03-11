import { unwrap } from "./unwrap";

export type UseAsyncOptions<TResult, TParams extends any[]> = {
  run: (...params: TParams) => Promise<TResult>;
}

export type UseAsyncOutput<TResult, TParams extends any[]> = {
  data: TResult | null;
  error: Error | null;
  loading: boolean;
  execute: (...params: TParams) => Promise<TResult>;
}

export function useAsync<TResult, TParams extends any[]>(ops: UseAsyncOptions<TResult, TParams>): UseAsyncOutput<TResult, TParams> {
  let output = $state<TResult | null>(null);
  let loading = $state<boolean>(false);
  let error = $state<Error | null>(null);

  async function run(...params: TParams) {
    if (loading) throw new Error("Already pending");
    loading = true;
    error = null;
    const {err, data} = await unwrap(ops.run(...params));
    if (err) {
      error = err;
      loading = false;
      throw err;
    }

    output = data;
    loading = false;
    error = null;
    return data as TResult;
  }

  return {
    execute(...params) {
      return run(...params);
    },
    get data() {
      return output;
    },
    get loading() {
      return loading;
    },
    get error() {
      return error;
    },
  };
};
