// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const email = session?.user?.email ?? "";
  const name = email.split("@")[0] || "사용자";
  const balance = 100;

  return (
    <main style={{ padding: 24 }}>
      <h1>어서오세요, {name}님,</h1>
      <p>현재 당신의 코인 잔고는 {balance}입니다.</p>
    </main>
  );
}

