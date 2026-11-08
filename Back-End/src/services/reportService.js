import { prisma } from "../lib/prisma.js";

const reportSelect = {
  id: true,
  userId: true,
  nome: true,
  questionnaire: true,
  createdAt: true,
  user: { select: { userId: true, username: true } },
};

function includeCreator(report) {
  const { user, ...data } = report;
  return { ...data, createdBy: user };
}

async function getAll({ skip, take, userId, canViewAll }) {
  const where = canViewAll ? {} : { userId };

  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take,
      orderBy: [
        { createdAt: { sort: "desc", nulls: "last" } },
        { id: "desc" },
      ],
      select: reportSelect,
    }),
    prisma.report.count({ where }),
  ]);

  return { data: data.map(includeCreator), total };
}

async function getByIdForUser(id, userId, canViewAll) {
  const report = await prisma.report.findFirst({
    where: canViewAll ? { id } : { id, userId },
    select: reportSelect,
  });

  return report ? includeCreator(report) : null;
}

async function create(userId, nome, questionnaire) {
  const report = await prisma.report.create({
    data: { userId, nome, questionnaire },
    select: reportSelect,
  });
  return includeCreator(report);
}

async function updateQuestionnaire(id, userId, canViewAll, questionnaire) {
  try {
    const report = await prisma.report.update({
      where: canViewAll ? { id } : { id, userId },
      data: { questionnaire },
      select: reportSelect,
    });
    return includeCreator(report);
  } catch (error) {
    if (error.code === "P2025") return null;
    throw error;
  }
}

async function remove(id) {
  const result = await prisma.report.deleteMany({
    where: { id },
  });
  return result.count === 1;
}

export default { getAll, getByIdForUser, create, updateQuestionnaire, remove };
