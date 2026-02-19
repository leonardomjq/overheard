import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/appwrite/server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getLoggedInUser();
  if (user) redirect("/feed");
  return <>{children}</>;
}
