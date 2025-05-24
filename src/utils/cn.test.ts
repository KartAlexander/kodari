import { cn } from './cn'; // Assuming cn.ts is in the same directory

describe('cn utility function', () => {
  // Basic string inputs
  it('should concatenate basic string inputs', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle single string input', () => {
    expect(cn('foo')).toBe('foo');
  });

  // Mixed string and object inputs
  it('should handle mixed string and object inputs', () => {
    expect(cn('foo', { bar: true, baz: false, duck: 'quux' })).toBe('foo bar duck-quux'); // As per clsx behavior for string values in objects
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  // Inputs with falsy values
  it('should filter out falsy values', () => {
    expect(cn('foo', null, 'bar', undefined, 0, { baz: true, qux: null, quux: false })).toBe('foo bar baz');
    expect(cn(null, undefined, false, '', 0)).toBe('');
  });

  // Tailwind Merge behavior (from tailwind-merge library)
  describe('Tailwind Merge behavior', () => {
    it('should let the last conflicting utility take precedence for padding', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should let the last conflicting utility take precedence for text size', () => {
      expect(cn('text-xl', 'text-sm')).toBe('text-sm');
    });

    it('should let the last conflicting utility take precedence for background color', () => {
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should merge non-conflicting utilities correctly', () => {
      expect(cn('m-2 p-2', 'm-4')).toBe('p-2 m-4');
    });

    it('should handle more complex Tailwind Merge scenarios', () => {
      expect(cn('px-2 py-1 bg-red hover:bg-dark-red', 'p-3 bg-[#B91C1C]')).toBe('hover:bg-dark-red p-3 bg-[#B91C1C]');
    });
  });

  // Empty inputs
  it('should return an empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  // Inputs with only falsy values
  it('should return an empty string if all inputs are falsy', () => {
    expect(cn(null, undefined, false, 0, '')).toBe('');
  });

  // Array inputs (clsx behavior)
  it('should handle array inputs', () => {
    expect(cn('foo', ['bar', { baz: true, qux: false }])).toBe('foo bar baz');
  });

  // Nested array inputs (clsx behavior)
  it('should handle nested array inputs', () => {
    expect(cn('foo', ['bar', [{ baz: true, qux: false }, 'quux']])).toBe('foo bar baz quux');
  });

  // Mixed types including numbers (which are typically ignored by clsx unless in objects)
  it('should handle various types gracefully', () => {
    expect(cn('text-lg', { 'font-bold': true, 'mt-2': false }, null, 'mx-auto', undefined, 0 )).toBe('text-lg font-bold mx-auto');
  });
});
