import { Anthropic } from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { TestResult, TestFailure } from './types';
import * as readline from 'readline';

dotenv.config();

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || '',
});

async function analyzeFailure(failure: TestFailure) {
  const message = `Analyze this Playwright test failure and determine if it's likely an actual application error or a potential test flakiness/infrastructure issue. Consider the error message, stack trace, and test context:

Test: ${failure.testName}
Error: ${failure.error}
Stack: ${failure.stack}`;

  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: message }],
  });

  return {
    testName: failure.testName,
    analysis: response.content[0].text || '',
  };
}

async function processInput(input: string) {
  try {
    const testResults: TestResult = JSON.parse(input);
    
    if (!testResults.failures || testResults.failures.length === 0) {
      console.log(JSON.stringify({ message: 'No failures to analyze' }));
      return;
    }

    const analysisPromises = testResults.failures.map(analyzeFailure);
    const analyses = await Promise.all(analysisPromises);
    console.log(JSON.stringify({ analyses }, null, 2));
  } catch (error) {
    console.error('Error analyzing test results:', error);
    process.exit(1);
  }
}

// Set up readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputData = '';

// Read input line by line
rl.on('line', (line) => {
  inputData += line;
});

// Process the complete input when stdin ends
rl.on('close', () => {
  processInput(inputData).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
});
