import { scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password, salt) {
  if (typeof password !== "string" || typeof salt !== "string" || salt.length === 0) {
    throw new TypeError("password e salt devem ser strings não vazias.");
  }
  const derivedKey = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });

  return derivedKey.toString("hex");
}
