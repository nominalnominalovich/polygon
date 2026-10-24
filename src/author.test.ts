import { describe, expect, it } from 'vitest';
import { validate } from './author';

describe('редактор кейса', () => {
  it('исходный кейс проходит те же проверки, что и правки автора', () => {
    expect(validate()).toEqual([]);
  });
});
