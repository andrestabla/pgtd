import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppShell } from "@/components/shell";
import { UserProvider } from "@/components/user-context";

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const user = await getSession();
  if (!user) redirect("/login");
  return (
    <UserProvider user={user}>
      <AppShell user={user}>{children}</AppShell>
    </UserProvider>
  );
}
