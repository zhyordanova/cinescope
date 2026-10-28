import { describe, expect, it } from '@jest/globals';

import { isValidMediaId } from './isValidMediaId';

describe('isValidMediaId', () => {
  it.each(['tt0133093', 'tt11198330', 'tt0000000'])(
    'accepts a correctly formatted ID: %s',
    (value) => {
      expect(isValidMediaId(value)).toBe(true);
    },
  );

  it.each([
    undefined,
    null,
    133093,
    {},
    ['tt0133093'],
    '',
    'tt123456',
    'nm0133093',
    'TT0133093',
    'tt013309x',
    ' tt0133093',
    'tt0133093 ',
    'tt0133093/extra',
  ])('rejects invalid input without normalizing it: %p', (value) => {
    expect(isValidMediaId(value)).toBe(false);
  });
});
