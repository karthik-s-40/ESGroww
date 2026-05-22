import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return <AdminShell>{children}</AdminShell>;
}
