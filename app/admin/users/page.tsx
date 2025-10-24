import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

const AKIA_RE = /^AKIA[0-9A-Z]{16}$/

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login?redirect=/admin/users")

  const me = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  })
  if (!me?.isAdmin) notFound()

  const users = await prisma.$queryRaw<
    { id: string; email: string; awsAccessKey: string | null; awsKeyStatus: string | null; locked: boolean }[]
  >`
    SELECT "id","email","awsAccessKey","awsKeyStatus","locked"
    FROM "User"
    ORDER BY "email" ASC
    LIMIT 200
  `

  async function updateAwsKey(formData: FormData) {
    "use server"
    const id = String(formData.get("id") || "")
    const newKey = String(formData.get("newKey") || "").toUpperCase().trim()
    const reason = String(formData.get("reason") || "admin manual update")

    if (!AKIA_RE.test(newKey)) {
      throw new Error("Invalid AccessKeyId format (must be AKIA + 16 [A-Z0-9])")
    }

    const row = await prisma.$queryRaw<{ awsAccessKey: string | null }[]>`
      SELECT "awsAccessKey" FROM "User" WHERE "id" = ${id} LIMIT 1
    `
    if (row.length === 0) throw new Error("User not found")
    const oldKey = row[0].awsAccessKey ?? ""

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        INSERT INTO "KeyAudit" ("userId","oldKey","newKey","reason")
        VALUES (${id}, ${oldKey}, ${newKey}, ${reason})
      `
      await tx.$executeRaw`
        UPDATE "User"
        SET "awsAccessKey"=${newKey},
            "awsKeyStatus"='ROTATED',
            "awsKeyIssuedAt"=NOW()
        WHERE "id"=${id}
      `
    })

    revalidatePath("/admin/users")
  }

  async function toggleLock(formData: FormData) {
    "use server"
    const id = String(formData.get("id") || "")
    const lock = String(formData.get("lock") || "true") === "true"
    const reason = lock ? "locked by admin" : null

    await prisma.$executeRaw`
      UPDATE "User"
      SET "locked"=${lock},
          "lockedAt"=CASE WHEN ${lock} THEN NOW() ELSE NULL END,
          "lockReason"=${reason}
      WHERE "id"=${id}
    `
    revalidatePath("/admin/users")
  }

  async function markActive(formData: FormData) {
    "use server"
    const id = String(formData.get("id") || "")
    await prisma.$executeRaw`
      UPDATE "User" SET "awsKeyStatus"='ACTIVE' WHERE "id"=${id}
    `
    revalidatePath("/admin/users")
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin · Users (AWS Keys)</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">AWS Key</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Locked</th>
              <th className="p-2 border w-[360px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border font-mono">{u.email}</td>
                <td className="p-2 border font-mono">{u.awsAccessKey ?? "-"}</td>
                <td className="p-2 border">{u.awsKeyStatus ?? "-"}</td>
                <td className="p-2 border">{u.locked ? "YES" : "NO"}</td>
                <td className="p-2 border">
                  <form action={updateAwsKey} className="flex gap-2 items-center">
                    <input type="hidden" name="id" value={u.id} />
                    <input
                      name="newKey"
                      placeholder="AKIA****************"
                      className="border px-2 py-1 w-60 font-mono"
                      maxLength={20}
                      required
                    />
                    <input
                      name="reason"
                      placeholder="reason (optional)"
                      className="border px-2 py-1 w-48"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      title="교체 시 KeyAudit에 기록됩니다"
                    >
                      Set New Key
                    </button>
                  </form>

                  <div className="flex gap-2 mt-2">
                    <form action={toggleLock}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="lock" value={u.locked ? "false" : "true"} />
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded ${u.locked ? "bg-green-600" : "bg-rose-600"} text-white`}
                      >
                        {u.locked ? "Unlock" : "Lock"}
                      </button>
                    </form>

                    <form action={markActive}>
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-gray-700 text-white rounded"
                        title="awsKeyStatus를 ACTIVE로 복귀"
                      >
                        Mark Active
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No users
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        * 새 Key는 <span className="font-mono">{'AKIA[0-9A-Z]{16}'}</span> 형식만 허용됩니다.
        SecretAccessKey는 저장/노출하지 않습니다.
      </p>
    </main>
  )
}

