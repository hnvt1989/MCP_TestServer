# TestAnalyzer

A TestAnalyzer server that analyzes Playwright test failures using Claude AI.

## Features
- Accepts Playwright test results
- Integrates with Claude API for test failure analysis
- Provides detailed insights on test failures

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Claude API key:
```
CLAUDE_API_KEY=your_api_key_here
```

3. Start the server:
```bash
npm start
```

## Usage
Send your Playwright test results to the `/analyze` endpoint to get AI-powered analysis of test failures.
