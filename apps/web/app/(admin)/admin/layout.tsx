import { notFound } from "next/navigation";
import { getSession } from "../../lib/getSession";
import AdminLayoutShell from "./_components/AdminLayoutShell";

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) {
    return notFound();
  }
  return <AdminLayoutShell session={session}>{children}</AdminLayoutShell>;
};

export default AdminLayout;
