import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await stackServerApp.getUser();
  } catch {
    redirect("/handler/sign-in");
  }

  if (!user) {
    redirect("/handler/sign-in");
  }

  return <>{children}</>;
}
