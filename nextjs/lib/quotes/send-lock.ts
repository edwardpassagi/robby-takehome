import fs from "fs";
import path from "path";

const STALE_LOCK_MS = 60 * 1000;
const defaultLocksDir = path.join(process.cwd(), "storage", "locks");

export type SendLock =
  | { acquired: true; release: () => void }
  | { acquired: false };

// Exclusive per customer phone. Two clients cannot hold this at the same time.
export function acquireSendLock(
  customerPhone: string,
  locksDir = defaultLocksDir,
): SendLock {
  fs.mkdirSync(locksDir, { recursive: true });
  const file = path.join(locksDir, `${lockName(customerPhone)}.lock`);

  if (tryCreate(file) || (clearIfStale(file) && tryCreate(file))) {
    return {
      acquired: true,
      release() {
        try {
          fs.unlinkSync(file);
        } catch (error) {
          if (!isCode(error, "ENOENT")) throw error;
        }
      },
    };
  }

  return { acquired: false };
}

function lockName(customerPhone: string) {
  const digits = customerPhone.replace(/\D/g, "");
  return digits || "unknown";
}

function tryCreate(file: string) {
  try {
    const fd = fs.openSync(file, "wx");
    fs.closeSync(fd);
    return true;
  } catch (error) {
    if (isCode(error, "EEXIST")) return false;
    throw error;
  }
}

function clearIfStale(file: string) {
  try {
    const stat = fs.statSync(file);
    if (Date.now() - stat.mtimeMs < STALE_LOCK_MS) return false;
    fs.unlinkSync(file);
    return true;
  } catch (error) {
    if (isCode(error, "ENOENT")) return true;
    throw error;
  }
}

function isCode(error: unknown, code: string) {
  return error instanceof Error && "code" in error && error.code === code;
}
