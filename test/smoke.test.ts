import { sum } from '../src';

describe('smoke test', () => {
  it('works', () => {
    expect(sum(1, 1)).toEqual(2);
  });
});
