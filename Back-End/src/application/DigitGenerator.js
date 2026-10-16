import { randomInt } from "node:crypto";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function generateDigits(length) {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("length deve ser um inteiro positivo.");
  }

  return Array.from({ length }, () => characters[randomInt(characters.length)]).join("");
}
