export interface TestFailure {
  testName: string;
  error: string;
  stack: string;
}

export interface TestResult {
  failures: TestFailure[];
}
