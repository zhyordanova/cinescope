export function createAbortError(message = 'Cancelled'): Error {
  return Object.assign(new Error(message), {
    name: 'AbortError',
  });
}
