import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppShell } from "@/components/shell";

export default async function PanelLayout({ children }: LayoutProps<"/panel">) {
  const user = await getSession();
  if (!user) redirect("/");
  return <AppShell user={user}>{children}</AppShell>;
}
