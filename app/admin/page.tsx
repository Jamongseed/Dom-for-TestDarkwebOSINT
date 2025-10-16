import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/db'
import NavBar from '@/components/NavBar'

async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, nickname: true, phone: true, locked: true, createdAt: true }
  })
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  // @ts-ignore
  if (!session?.user?.isAdmin) {
    return <main className="px-6 py-12"><p>Forbidden</p></main>
  }
  const users = await getUsers()

  return (
    <main>
      <NavBar />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-2xl font-semibold mb-6">Admin · Users</h1>
        <table className="w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Nickname</th>
              <th className="p-2 text-left">Phone</th>
              <th className="p-2 text-left">Locked</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.nickname}</td>
                <td className="p-2">{u.phone ?? '-'}</td>
                <td className="p-2">{u.locked ? 'YES' : 'NO'}</td>
                <td className="p-2">
                  <form action={`/api/admin/lock`} method="post">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="locked" value={(!u.locked).toString()} />
                    {/* POST */}
                    <button
                      formAction="/api/admin/lock"
                      className="px-3 py-1 rounded bg-gray-900/10"
                      onClick={async (e) => {
                        e.preventDefault()
                        await fetch('/api/admin/lock', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ userId: u.id, locked: !u.locked }),
                        })
                        location.reload()
                      }}
                    >
                      {u.locked ? 'Unlock' : 'Lock'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}

