/**
 * Seed de desenvolvimento: cria o administrador oculto inicial e alguns
 * conteudos de exemplo para o front ter o que renderizar.
 * TODO: trocar por um script de migration/seed real quando tiver banco.
 */
const { ROLES } = require('../constants/roles');
const { ROLE_FLAGS, FLAGS } = require('../constants/flags');
const { usersRepo, popsRepo, educationRepo } = require('./db');

async function seed() {
  if ((await usersRepo.all()).length > 0) return;

  await usersRepo.insert({
    id: 'user-root',
    name: 'Administrador',
    username: 'admin',
    // TODO: hash real via modules/auth/password.js
    passwordHash: null,
    tempPassword: 'admin123',
    mustChangeCredentials: true,
    roles: [ROLES.FUNCIONARIO, ROLES.GERENTE, ROLES.ADMINISTRADOR],
    activeRole: ROLES.ADMINISTRADOR,
    extraFlags: 0,
    disabled: false,
  });

  await popsRepo.insert({
    id: 'pop-01',
    code: 'POP-01',
    title: 'Higienizacao das maos',
    summary: 'Passo a passo antes de qualquer procedimento.',
    category: 'Biosseguranca',
    fileName: 'pop-01-higienizacao.pdf', // arquivo em /storage/pops
    requiredFlags: FLAGS.POP_VIEW,
    version: '1.0',
  });

  await educationRepo.insert({
    id: 'edu-01',
    title: 'Modulo 1 - O que e o Metodo VIVA',
    description: 'Introducao ao metodo e aos criterios de seguranca.',
    provider: 'youtube',
    youtubeId: 'dQw4w9WgXcQ', // TODO: trocar pelos videos reais da pesquisadora
    durationMin: 8,
    order: 1,
    requiredFlags: FLAGS.EDU_VIEW,
  });
}

module.exports = { seed, ROLE_FLAGS };
