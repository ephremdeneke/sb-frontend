import { useAuthStore } from "../store/auth";

// Small helper for action-level gating (hiding/showing UI based on role).
export default function RoleProtectedRoute({ roles, children }) {
  const role = useAuthStore((s) => s.role);

  if (!role) return null;
  if (roles && !roles.includes(role)) return null;
  return children ?? null;
}

