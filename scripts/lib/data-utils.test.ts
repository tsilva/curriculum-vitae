import assert from "node:assert/strict";
import test from "node:test";

import { formatDurationLength, formatDurationWithLength } from "./data-utils";

const october = new Date(2026, 9, 10);

test("ongoing roles report elapsed months without adding the current month twice", () => {
  assert.equal(formatDurationLength("May 2024 - Present", october), "2 years and 5 months");
  assert.equal(formatDurationLength("Apr 2012 - Present", october), "14 years and 6 months");
  assert.equal(formatDurationWithLength("May 2024 - Present", october),
    "May 2024 - Present · 2 years and 5 months");
});

test("short roles report months instead of claiming a full year", () => {
  assert.equal(formatDurationLength("Sep 2026 - Present", october), "1 month");
  assert.equal(formatDurationLength("Aug 2026 - Present", october), "2 months");
  assert.equal(formatDurationLength("Oct 2026 - Present", october), "Less than 1 month");
  assert.equal(formatDurationLength("Oct 2025 - Present", october), "1 year");
});

test("completed dates and explicitly supplied historical lengths remain stable", () => {
  assert.equal(formatDurationLength("Jan 2020 - Dec 2020", october), "1 year");
  assert.equal(formatDurationLength("Jan 2020 - Feb 2020", october), "2 months");
  assert.equal(formatDurationLength("2003 - 2006 · 3 years", october), "3 years");
  assert.equal(formatDurationWithLength("2003 - 2006 · 3 years", october), "2003 - 2006 · 3 years");
  assert.equal(formatDurationLength("unknown", october), undefined);
});
