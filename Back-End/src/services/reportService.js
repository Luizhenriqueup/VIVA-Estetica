import { prisma } from "../lib/prisma.js";

async function getAllForUser(userId) {
  return prisma.report.findMany({
    where: { userId },
    select: { id: true, userId: true, questionnaire: true },
  });
}

async function getByIdForUser(id, userId) {
  return prisma.report.findFirst({
    where: { id, userId },
    select: { id: true, userId: true, questionnaire: true },
  });
}

async function create(userId, questionnaire) {
  return prisma.report.create({
    data: { userId, questionnaire },
    select: { id: true, userId: true, questionnaire: true },
  });
}

async function remove(id, userId) {
  const result = await prisma.report.deleteMany({
    where: { id, userId },
  });
  return result.count === 1;
}

export default { getAllForUser, getByIdForUser, create, remove };
