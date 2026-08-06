import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// La raíz decide: con sesión → panel; sin sesión → /login.
export default async function Home() {
  const user = await getSession();
  redirect(user ? "/panel" : "/login");
}
