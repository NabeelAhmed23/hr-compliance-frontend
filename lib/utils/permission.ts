export const isHROrAdmin = (role: string) =>
  ["ADMIN", "HR", "SUPERADMIN"].includes(role);
