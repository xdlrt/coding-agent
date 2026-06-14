import type { TestResult } from "./test-runner.js";

const MAX_OUTPUT_CHARS = 2000;
const TRUNCATION_SUFFIX = "...truncated";

const TEST_FILES_LINE = /Test Files\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed(?:\s*\(\s*(\d+)\s*\))?/;
const TESTS_LINE = /(?:^|\n)\s*Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed(?:\s*\(\s*(\d+)\s*\))?/;
const DURATION_LINE = /Duration\s+([\d.]+)(m?s)/;
const FAIL_LINE = /^\s*(?:FAIL|×|✗)\s+(.+?)\s*$/gm;
const EXPECTED_LINE = /^\s*(?:- )?Expected:\s*(.+?)\s*$/gm;
const RECEIVED_LINE = /^\s*(?:\+ )?Received:\s*(.+?)\s*$/gm;

interface TestCounts {
  passed: number;
  failed: number;
  total: number;
  fileCount: number;
}

export function formatTestResults(result: TestResult): string {
  const counts = parseCounts(result.stdout);

  const summary = result.passed
    ? formatPassed(result, counts)
    : formatFailed(result, counts);

  return truncate(summary);
}

function formatPassed(result: TestResult, counts: TestCounts | null): string {
  if (counts === null || counts.total === 0) {
    return "All tests passed";
  }

  const duration = formatDuration(result, counts);
  const testWord = counts.total === 1 ? "test" : "tests";
  const fileWord = counts.fileCount === 1 ? "file" : "files";
  return `All tests passed (${counts.total} ${testWord} in ${counts.fileCount} ${fileWord}, ${duration})`;
}

function formatFailed(result: TestResult, counts: TestCounts | null): string {
  const lines: string[] = [];

  if (counts !== null && counts.total > 0) {
    lines.push(`Tests failed: ${counts.failed} of ${counts.total}`);
  } else {
    lines.push(`Tests failed (exit code: ${result.exitCode})`);
  }

  const failures = parseFailures(result.stdout);
  if (failures.length > 0) {
    lines.push(...failures);
  } else {
    const raw = rawOutput(result);
    if (raw !== "") lines.push(raw);
  }

  return lines.join("\n");
}

function parseCounts(stdout: string): TestCounts | null {
  const testsMatch = TESTS_LINE.exec(stdout);
  if (testsMatch === null) return null;

  const failed = testsMatch[1] === undefined ? 0 : Number(testsMatch[1]);
  const passed = Number(testsMatch[2]);
  const total = failed + passed;

  const filesMatch = TEST_FILES_LINE.exec(stdout);
  let fileCount = 0;
  if (filesMatch !== null) {
    const filesFailed = filesMatch[1] === undefined ? 0 : Number(filesMatch[1]);
    const filesPassed = Number(filesMatch[2]);
    fileCount = filesFailed + filesPassed;
  }

  return { passed, failed, total, fileCount };
}

function parseFailures(stdout: string): string[] {
  const failLines = matchAll(stdout, FAIL_LINE);
  if (failLines.length === 0) return [];

  const expected = matchAll(stdout, EXPECTED_LINE);
  const received = matchAll(stdout, RECEIVED_LINE);

  const blocks: string[] = [];
  failLines.forEach((file, index) => {
    const block = [`FAIL ${file}`];
    if (expected[index] !== undefined) {
      block.push(`  Expected: ${expected[index]}`);
    }
    if (received[index] !== undefined) {
      block.push(`  Received: ${received[index]}`);
    }
    blocks.push(block.join("\n"));
  });

  return blocks;
}

function matchAll(input: string, pattern: RegExp): string[] {
  const results: string[] = [];
  const local = new RegExp(pattern.source, pattern.flags);
  let match: RegExpExecArray | null;
  while ((match = local.exec(input)) !== null) {
    results.push(match[1]);
  }
  return results;
}

function formatDuration(result: TestResult, counts: TestCounts | null): string {
  const fromStdout = DURATION_LINE.exec(result.stdout);
  if (fromStdout !== null) {
    const value = Number(fromStdout[1]);
    const unit = fromStdout[2];
    if (unit === "ms") return `${(value / 1000).toFixed(1)}s`;
    return `${value.toFixed(1)}s`;
  }
  void counts;
  return `${(result.durationMs / 1000).toFixed(1)}s`;
}

function rawOutput(result: TestResult): string {
  const parts: string[] = [];
  if (result.stdout.trim() !== "") parts.push(result.stdout.trim());
  if (result.stderr.trim() !== "") parts.push(result.stderr.trim());
  return parts.join("\n");
}

function truncate(text: string): string {
  if (text.length <= MAX_OUTPUT_CHARS) return text;
  const keep = MAX_OUTPUT_CHARS - TRUNCATION_SUFFIX.length;
  return `${text.slice(0, keep)}${TRUNCATION_SUFFIX}`;
}
