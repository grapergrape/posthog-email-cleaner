import { processEvent } from './index';

test('should process event correctly', () => {
  const testEvent = {
    properties: {
      $set: {
        email: 'sara.testjoan+2753@getjoan.com',
      },
    },
  };

  const result = processEvent(testEvent);

  expect(result.properties.$set.email).toBe('sara.testjoan+2753@getjoan.com');
  expect(result.properties.$set_once.is_real_probability).toBeCloseTo(0.445, 3);
});
