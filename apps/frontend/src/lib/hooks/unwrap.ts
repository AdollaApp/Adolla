export async function unwrap<T>(promise: Promise<T>): Promise<{ err: Error | null, data: T | null }> {
  try {
    const result = await promise;
    return { err: null, data: result };
  } catch (err: any) {
    return { err, data: null };
  }
}
