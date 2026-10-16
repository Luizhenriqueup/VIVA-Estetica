import "dotenv/config";
import { prisma } from "../lib/prisma.js";
import { generateDigits } from "../application/DigitGenerator.js";
import { hashPassword } from "../application/PasswordHasher.js";
import { Flags } from "../domain/flags.js";

async function bootstrapAdmin() {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (!username || !password || password.length < 12) {
    throw new Error(
      "Defina BOOTSTRAP_ADMIN_USERNAME e BOOTSTRAP_ADMIN_PASSWORD com pelo menos 12 caracteres."
    );
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { flags: { has: Flags.ADMIN } },
    select: { userId: true },
  });
  if (existingAdmin) {
    throw new Error("Já existe uma conta Admin; o bootstrap inicial não pode ser repetido.");
  }

  const salt = generateDigits(16);
  const hash = await hashPassword(password, salt);

  await prisma.user.create({
    data: {
      username,
      salt,
      hash,
      isTemp: false,
      flags: [Flags.ADMIN],
    },
    select: { userId: true },
  });

  console.log(`Conta Admin inicial criada para ${username}.`);
}

try {
  await bootstrapAdmin();
} catch (error) {
  console.error("Não foi possível criar a conta Admin inicial:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
