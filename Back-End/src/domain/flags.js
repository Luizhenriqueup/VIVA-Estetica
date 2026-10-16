export const Flags = Object.freeze({
  ADMIN: "Admin",
  GERENTE: "Gerente",
  FUNCIONARIO: "Funcionario",
});

export const allFlags = Object.freeze(Object.values(Flags));

export function isFlag(value) {
  return allFlags.includes(value);
}
