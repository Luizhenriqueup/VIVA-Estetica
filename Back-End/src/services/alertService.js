import { prisma } from "../lib/prisma.js";

async function getAll() {
  return prisma.alert.findMany({
    orderBy: { createdAt: "desc" },
  });
}

async function getById(id) {
  return prisma.alert.findUnique({
    where: { id },
  });
}

async function create(data) {
  return prisma.alert.create({
    data: {
      title: data.title,
      message: data.message,
    },
  });
}

async function update(id, data) {
  return prisma.alert.update({
    where: { id },
    data,
  });
}

async function remove(id) {
  return prisma.alert.delete({
    where: { id },
  });
}

export default { getAll, getById, create, update, remove };