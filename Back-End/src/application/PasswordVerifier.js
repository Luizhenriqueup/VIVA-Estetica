import { timingSafeEqual } from "node:crypto";
import { hashPassword } from "./PasswordHasher.js";

export async function verifyPassword(password, salt, storedHash) {
  if (typeof storedHash !== "string" || !/^[a-f0-9]{128}$/i.test(storedHash)) {
    return false;
  }

  const expected = Buffer.from(storedHash, "hex");
  const actual = Buffer.from(await hashPassword(password, salt), "hex");

  return timingSafeEqual(expected, actual);
}
