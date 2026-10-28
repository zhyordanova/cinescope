export function isValidMediaId(value: unknown): value is string {
  return typeof value === 'string' && /^tt\d{7,}$/.test(value);
}
