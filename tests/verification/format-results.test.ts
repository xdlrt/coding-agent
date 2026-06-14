import { describe, expect, it } from "vitest";
import { formatTestResults } from "../../src/verification/format-results.js";
import type { TestResult } from "../../src/verification/test-runner.js";

function makeResult(overrides: Partial<TestResult>): TestResult {
  return {
    passed: true,
    exitCode: 0,
    stdout: "",
    stderr: "",
    durationMs: 0,
    ...overrides,
  };
}

const passingStdout = `
 RUN  v1.6.0

 ✓ src/add.test.ts (3)
 ✓ src/sub.test.ts (1)
 ✓ src/mul.test.ts (1)

 Test Files  3 passed (3)
      Tests  5 passed (5)
   Duration  1.2s
`;

const failingStdout = `
 RUN  v1.6.0

 FAIL src/add.test.ts > add > should add correctly
AssertionError: expected 4 to be 5
    Expected: 5
    Received: 4

 Test Files  1 failed | 1 passed (2)
      Tests  2 failed | 3 passed (5)
   Duration  0.9s
`;

describe("formatTestResults", () => {
  it("summarizes a passing run with test and file counts", () => {
    const output = formatTestResults(
      makeResult({ passed: true, stdout: passingStdout, durationMs: 1200 })
    );

    expect(output).toBe("All tests passed (5 tests in 3 files, 1.2s)");
  });

  it("summarizes a failing run with counts and failure detail", () => {
    const output = formatTestResults(
      makeResult({
        passed: false,
        exitCode: 1,
        stdout: failingStdout,
        durationMs: 900,
      })
    );

    expect(output).toContain("Tests failed: 2 of 5");
    expect(output).toContain(
      "FAIL src/add.test.ts > add > should add correctly"
    );
    expect(output).toContain("  Expected: 5");
    expect(output).toContain("  Received: 4");
  });

  it("lists multiple failing cases", () => {
    const stdout = `
 FAIL src/add.test.ts > add > a
    Expected: 1
    Received: 2
 FAIL src/sub.test.ts > sub > b
    Expected: 3
    Received: 4

      Tests  2 failed | 0 passed (2)
   Duration  0.5s
`;
    const output = formatTestResults(
      makeResult({ passed: false, exitCode: 1, stdout })
    );

    expect(output).toContain("Tests failed: 2 of 2");
    expect(output).toContain("FAIL src/add.test.ts > add > a");
    expect(output).toContain("FAIL src/sub.test.ts > sub > b");
  });

  it("falls back to a minimal summary when stdout is empty (passing)", () => {
    const output = formatTestResults(makeResult({ passed: true, stdout: "" }));
    expect(output).toBe("All tests passed");
  });

  it("falls back to exit code and raw output when stdout has no summary (failing)", () => {
    const output = formatTestResults(
      makeResult({
        passed: false,
        exitCode: 2,
        stdout: "",
        stderr: "boom: command crashed",
      })
    );

    expect(output).toContain("Tests failed (exit code: 2)");
    expect(output).toContain("boom: command crashed");
  });

  it("uses durationMs when stdout lacks a Duration line", () => {
    const stdout = `
 Test Files  1 passed (1)
      Tests  2 passed (2)
`;
    const output = formatTestResults(
      makeResult({ passed: true, stdout, durationMs: 3400 })
    );

    expect(output).toBe("All tests passed (2 tests in 1 file, 3.4s)");
  });

  it("truncates output longer than 2000 characters", () => {
    const longStderr = "x".repeat(5000);
    const output = formatTestResults(
      makeResult({
        passed: false,
        exitCode: 1,
        stdout: "",
        stderr: longStderr,
      })
    );

    expect(output.length).toBe(2000);
    expect(output.endsWith("...truncated")).toBe(true);
  });
});
