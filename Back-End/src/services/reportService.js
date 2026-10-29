import { prisma } from "../lib/prisma.js";

async function getAllForUser(userId) {
  return prisma.report.findMany({
    where: { userId },
    orderBy: { createdAt: { sort: "desc", nulls: "last",},},
    select: { id: true, userId: true, nome: true, questionnaire: true, createdAt: true },
  });
}

async function getByIdForUser(id, userId) {
  return prisma.report.findFirst({
    where: { id, userId },
    select: { id: true, userId: true, nome: true, questionnaire: true, createdAt: true },
  });
}

async function create(userId, nome, questionnaire) {
  return prisma.report.create({
    data: { userId, nome, questionnaire },
    select: { id: true, userId: true, nome: true, questionnaire: true, createdAt: true },
  });
}

async function remove(id, userId) {
  const result = await prisma.report.deleteMany({
    where: { id, userId },
  });
  return result.count === 1;
}

export default { getAllForUser, getByIdForUser, create, remove };
