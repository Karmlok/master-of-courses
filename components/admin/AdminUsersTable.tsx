'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, ShieldOff, Trash2, BookOpen } from 'lucide-react'

interface UserWithCount {
  id: string
  name: string
  email: string
  school: string | null
  role: string
  createdAt: Date
  _count: { courses: number }
}

interface AdminUsersTableProps {
  users: UserWithCount[]
  currentUserId: string
}

export function AdminUsersTable({ users, currentUserId }: AdminUsersTableProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleRoleChange(userId: string, newRole: 'ADMIN' | 'TEACHER') {
    setLoadingId(userId)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setLoadingId(null)
    router.refresh()
  }

  async function handleDelete(userId: string) {
    if (confirmDelete !== userId) {
      setConfirmDelete(userId)
      setTimeout(() => setConfirmDelete(null), 3000)
      return
    }
    setLoadingId(userId)
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    setLoadingId(null)
    setConfirmDelete(null)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-5 py-3 font-medium text-gray-600">Nome</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Scuola</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Ruolo</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Corsi</th>
            <th className="text-left px-5 py-3 font-medium text-gray-600">Registrato</th>
            <th className="px-5 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId
            const isLoading = loadingId === user.id
            const isAdmin = user.role === 'ADMIN'

            return (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                {/* Nome + email */}
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                </td>

                {/* Scuola */}
                <td className="px-5 py-3.5 text-gray-600">
                  {user.school ?? <span className="text-gray-300">—</span>}
                </td>

                {/* Ruolo */}
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                      isAdmin
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {isAdmin ? <ShieldCheck size={11} /> : null}
                    {isAdmin ? 'Admin' : 'Docente'}
                  </span>
                </td>

                {/* Corsi */}
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <BookOpen size={13} />
                    {user._count.courses}
                  </span>
                </td>

                {/* Data */}
                <td className="px-5 py-3.5 text-gray-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>

                {/* Azioni */}
                <td className="px-5 py-3.5">
                  {isCurrentUser ? (
                    <span className="text-xs text-gray-300 italic">tu</span>
                  ) : (
                    <div className="flex items-center gap-2 justify-end">
                      {/* Promuovi / Declassa */}
                      <button
                        onClick={() =>
                          handleRoleChange(user.id, isAdmin ? 'TEACHER' : 'ADMIN')
                        }
                        disabled={isLoading}
                        title={isAdmin ? 'Rimuovi Admin' : 'Promuovi ad Admin'}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                          isAdmin
                            ? 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            : 'border-[#534AB7] text-[#534AB7] hover:bg-[#EEEDFE]'
                        }`}
                      >
                        {isAdmin ? (
                          <><ShieldOff size={12} /> Rimuovi Admin</>
                        ) : (
                          <><ShieldCheck size={12} /> Promuovi Admin</>
                        )}
                      </button>

                      {/* Elimina */}
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={isLoading}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                          confirmDelete === user.id
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <Trash2 size={12} />
                        {confirmDelete === user.id ? 'Conferma' : 'Elimina'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          Nessun utente registrato.
        </div>
      )}
      </div>
    </div>
  )
}
