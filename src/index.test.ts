import { processEvent } from './index';
import { BLACKLIST } from './blacklist'; // Ensure this file exists and is properly configured

describe('Email Authenticity Probability Service', () => {
  const testCases = [
    {
      email: 'miha.drofenik@gmail.com',
      expectedProbability: 1 - 0.045, 
    },
    {
      email: 'sara.testjoan+2753@getjoan.com',
      expectedProbability: 1 - 0.045, 
    },
    {
      email: 'john.doe@example.com',
      expectedProbability: 1 - 0.025, 
    },
    {
      email: 'fake.email@mxclip.com',
      expectedProbability: 1 - 0.9999, 
    },
    {
      email: 'complexcomplexty123456789123@domain.com',
      expectedProbability: 1 - 0.9999, 
    },
    {
      email: 'simple@domain.com',
      expectedProbability: 1, 
    },
  ];

  testCases.forEach(({ email, expectedProbability }) => {
    test(`should process event correctly for ${email}`, () => {
      const testEvent = {
        properties: {
          $set: {
            email: email,
          },
        },
      };

      const result = processEvent(testEvent);

      expect(result.properties.$set.email).toBe(email);
      expect(result.properties.$set_once.is_real_probability).toBeCloseTo(expectedProbability, 3);
    });
  });
});
