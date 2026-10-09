import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { localUnixSeconds, parseLocalDateTime } from "./localDateTime";

assert.equal(parseLocalDateTime("2030-02-30T03:04"), undefined);
assert.equal(parseLocalDateTime("2030-01-02T24:00"), undefined);
assert.equal(localUnixSeconds("not-a-local-time"), 0n);

const wallClock = "2030-01-02T03:04";
const utcSeconds = Math.floor(Date.UTC(2030, 0, 2, 3, 4) / 1000);
const probe = `const { localUnixSeconds, formatLocalDateTime } = require("./lib/localDateTime.ts"); const value = "${wallClock}"; const seconds = localUnixSeconds(value); console.log(seconds.toString() + "|" + formatLocalDateTime(new Date(Number(seconds) * 1000)));`;

for (const [timezone, offsetSeconds] of [["UTC", 0], ["Africa/Lagos", 3600]] as const) {
  const output = execFileSync(process.execPath, ["--require", "tsx/cjs", "-e", probe], {
    cwd: process.cwd(),
    env: { ...process.env, TZ: timezone },
    encoding: "utf8",
  }).trim();
  const [seconds, formatted] = output.split("|");
  assert.equal(seconds, String(utcSeconds - offsetSeconds), `local timestamp conversion in ${timezone}`);
  assert.equal(formatted, wallClock, `local round-trip in ${timezone}`);
}

console.log("local date-time timezone tests passed (UTC, UTC+1)");
