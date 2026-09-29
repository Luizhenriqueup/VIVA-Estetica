import { prisma } from "../lib/prisma.js";
import { generateDigits } from "../application/DigitGenerator.js";
import { hashPassword } from "../application/PasswordHasher.js";
import { verifyPassword } from "../application/PasswordVerifier.js";
import { hashToken } from "../application/TokenHasher.js";
import { Flags } from "../domain/flags.js";

async function createTemporaryUser() {
  // Setup
  const username = generateDigits(8);
  const password = generateDigits(16);
  const salt = generateDigits(16);

  // Process and save
  const hash = await hashPassword(password, salt);

  const user = await prisma.user.create({
    data: {
      username,
      salt,
      hash,
      isTemp: true,
      flags: [],
    },
    select: { userId: true },
  });

  return {
    userId: user.userId,
    username,
    password,
  };
}

async function registerTemporaryUser(userId, { username, password }) {
  // Setup
  const salt = generateDigits(16);

  // Process and save
  const hash = await hashPassword(password, salt);

  return prisma.$transaction(async (transaction) => {
    const result = await transaction.user.updateMany({
      where: { userId, isTemp: true },
      data: {
        username,
        salt,
        hash,
        isTemp: false,
        flags: [Flags.FUNCIONARIO],
      },
    });

    if (result.count !== 1) {
      return null;
    }

    await transaction.authToken.deleteMany({ where: { userId } });

    return transaction.user.findUnique({
      where: { userId },
      select: { userId: true, username: true, isTemp: true },
    });
  });
}

async function login({ username, password }) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.salt, user.hash))) {
    return null;
  }

  const token = generateDigits(43);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);

  await prisma.authToken.deleteMany({
    where: { expiresAt: { lte: now } },
  });
  await prisma.authToken.create({
    data: {
      userId: user.userId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  return { userId: user.userId, token, expiresAt };
}

async function findActiveToken(tokenHash) {
  return prisma.authToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    select: {
      userId: true,
      user: {
        select: {
          flags: true,
          isTemp: true,
        },
      },
    },
  });
}

async function logout(tokenHash) {
  const result = await prisma.authToken.deleteMany({
    where: { tokenHash },
  });
  return result.count === 1;
}

async function deleteUser(userId) {
  const result = await prisma.user.deleteMany({
    where: { userId },
  });
  return result.count === 1;
}

async function setFlags(userId, flags) {
  return prisma.$transaction(
    async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { userId },
        select: { userId: true, username: true, isTemp: true, flags: true },
      });

      if (!user) {
        return { status: "not-found" };
      }
      if (user.isTemp) {
        return { status: "temporary-user" };
      }

      const isRemovingAdmin =
        user.flags.includes(Flags.ADMIN) && !flags.includes(Flags.ADMIN);
      if (isRemovingAdmin) {
        const adminCount = await transaction.user.count({
          where: { flags: { has: Flags.ADMIN }, isTemp: false },
        });

        if (adminCount <= 1) {
          return { status: "last-admin" };
        }
      }

      const updatedUser = await transaction.user.update({
        where: { userId },
        data: { flags },
        select: { userId: true, username: true, isTemp: true, flags: true },
      });

      return { status: "updated", user: updatedUser };
    },
    { isolationLevel: "Serializable" }
  );
}

export default {
  createTemporaryUser,
  registerTemporaryUser,
  login,
  findActiveToken,
  logout,
  deleteUser,
  setFlags,
};
