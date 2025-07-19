import { Role } from "@repo/types";

export function getRoleLabel(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "Admin";
    case "USER":
      return "Kullanıcı";
    case "OWNER":
      return "Yönetici";
    default:
      return "Kullanıcı";
  }
}
