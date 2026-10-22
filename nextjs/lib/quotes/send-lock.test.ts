import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { acquireSendLock } from "./send-lock.ts";

function tempLocks() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "follow-up-locks-"));
}

test("a failed lock means another client is already sending to this customer", () => {
  const dir = tempLocks();
  const first = acquireSendLock("+19175550001", dir);
  const second = acquireSendLock("+19175550001", dir);
  const otherCustomer = acquireSendLock("+19175559999", dir);

  assert.equal(first.acquired, true);
  assert.equal(second.acquired, false);
  assert.equal(otherCustomer.acquired, true);

  if (first.acquired) first.release();
  if (otherCustomer.acquired) otherCustomer.release();

  const afterRelease = acquireSendLock("+19175550001", dir);
  assert.equal(afterRelease.acquired, true);
  if (afterRelease.acquired) afterRelease.release();
});
