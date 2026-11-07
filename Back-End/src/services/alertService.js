import { prisma } from "../lib/prisma.js";

const alertInclude = {
  user: { select: { userId: true, username: true } },
};

function includeCreator(alert) {
  const { user, ...data } = alert;
  return { ...data, createdBy: user };
}

async function getAll({ skip, take, userId, canViewAll }) {
  const where = canViewAll ? {} : { userId };
  const [data, total] = await Promise.all([
    prisma.alert.findMany({
      where,
      skip,
      take,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      include: alertInclude,
    }),
    prisma.alert.count({ where }),
  ]);
  return { data: data.map(includeCreator), total };
}

async function getById(id, { userId, canViewAll }) {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: alertInclude,
  });
  if (!alert || (!canViewAll && alert.userId !== userId)) {
    return null;
  }
  return includeCreator(alert);
}

async function create(userId, data) {
  const alert = await prisma.alert.create({
    data: {
      title: data.title,
      message: data.message,
      userId,
    },
    include: alertInclude,
  });
  return includeCreator(alert);
}

async function update(id, data) {
  const alert = await prisma.alert.update({
    where: { id },
    data,
    include: alertInclude,
  });
  return includeCreator(alert);
}

async function remove(id) {
  const alert = await prisma.alert.delete({
    where: { id },
    include: alertInclude,
  });
  return includeCreator(alert);
}

export default { getAll, getById, create, update, remove };