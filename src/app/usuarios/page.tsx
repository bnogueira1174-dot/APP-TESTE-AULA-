'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, Shield, ChevronLeft, ChevronRight, X, Check } from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'
import type { User, UserRole } from '@/types'
import { getStatusColor, getStatusLabel, timeAgo, cn } from '@/lib/utils'

const ROLES: { value: UserRole; label: string; color: string }[] = [
  { value: 'admin', label: 'Administrador', color: 'text-purple-700 bg-purple-50' },
  { value: 'manager', label: 'Gerente', color: 'text-blue-700 bg-blue-50' },
  { value: 'operator', label: 'Operador', color: 'text-amber-700 bg-amber-50' },
  { value: 'viewer', label: 'Visualizador', color: 'text-slate-700 bg-slate-100' },
]

const PERMISSIONS = [
  'vehicles', 'drivers', 'reports', 'notifications', 'users', 'billing', 'all'
]

const PERM_LABELS: Record<string, string> = {
  vehicles: 'Veículos',
  drivers: 'Motoristas',
  reports: 'Relatórios',
  notifications: 'Notificações',
  users: 'Usuários',
  billing: 'Financeiro',
  all: 'Acesso Total',
}

const PER_PAGE = 5

function getRoleStyle(role: string) {
  return ROLES.find((r) => r.value === role)?.color ?? 'text-slate-700 bg-slate-100'
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; user?: User } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<User>>({})

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function openAdd() {
    setForm({ role: 'operator', status: 'active', permissions: [] })
    setModal({ mode: 'add' })
  }

  function openEdit(user: User) {
    setForm({ ...user })
    setModal({ mode: 'edit', user })
  }

  function saveUser() {
    if (modal?.mode === 'add') {
      const newUser: User = {
        id: `u${Date.now()}`,
        name: form.name ?? '',
        email: form.email ?? '',
        phone: form.phone ?? '',
        role: form.role ?? 'viewer',
        status: form.status ?? 'active',
        permissions: form.permissions ?? [],
        createdAt: new Date().toISOString(),
      }
      setUsers([...users, newUser])
    } else if (modal?.mode === 'edit' && modal.user) {
      setUsers(users.map((u) => (u.id === modal.user!.id ? { ...u, ...form } as User : u)))
    }
    setModal(null)
  }

  function deleteUser() {
    if (deleteId) {
      setUsers(users.filter((u) => u.id !== deleteId))
      setDeleteId(null)
    }
  }

  function togglePerm(perm: string) {
    const perms = form.permissions ?? []
    setForm({
      ...form,
      permissions: perms.includes(perm) ? perms.filter((p) => p !== perm) : [...perms, perm],
    })
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} usuários cadastrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', ...ROLES.map((r) => r.value)].map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1) }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                  roleFilter === r
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                )}
              >
                {r === 'all' ? 'Todos' : ROLES.find((x) => x.value === r)?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Usuário', 'Cargo', 'Telefone', 'Permissões', 'Status', 'Último acesso', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paged.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getRoleStyle(u.role))}>
                      {getStatusLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{u.phone}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(u.permissions.includes('all') ? ['all'] : u.permissions.slice(0, 3)).map((p) => (
                        <span key={p} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {PERM_LABELS[p] ?? p}
                        </span>
                      ))}
                      {!u.permissions.includes('all') && u.permissions.length > 3 && (
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          +{u.permissions.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(u.status))}>
                      {getStatusLabel(u.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {u.lastLogin ? timeAgo(u.lastLogin) : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(u.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-slate-700 font-medium">
              {page} / {Math.max(1, totalPages)}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {modal.mode === 'add' ? 'Novo Usuário' : 'Editar Usuário'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Nome completo</label>
                  <input
                    value={form.name ?? ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">E-mail</label>
                  <input
                    value={form.email ?? ''}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Telefone</label>
                  <input
                    value={form.phone ?? ''}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="(41) 9 9999-9999"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Cargo</label>
                  <select
                    value={form.role ?? 'operator'}
                    onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 mb-1 block">Status</label>
                  <select
                    value={form.status ?? 'active'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-2 block flex items-center gap-1">
                  <Shield size={12} /> Permissões
                </label>
                <div className="flex flex-wrap gap-2">
                  {PERMISSIONS.map((p) => {
                    const active = (form.permissions ?? []).includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => togglePerm(p)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                          active
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {active && <Check size={10} />}
                        {PERM_LABELS[p]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveUser}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {modal.mode === 'add' ? 'Criar usuário' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">Excluir usuário?</h3>
            <p className="text-sm text-slate-500 text-center mt-1 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={deleteUser}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
