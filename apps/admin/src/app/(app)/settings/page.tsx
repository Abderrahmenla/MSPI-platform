'use client';

import { useState } from 'react';
import { useStaff } from '@/modules/staff/hooks/use-staff';
import { useCreateStaff } from '@/modules/staff/hooks/use-create-staff';
import { useToggleStaff } from '@/modules/staff/hooks/use-toggle-staff';
import type {
  CreateStaffData,
  StaffRole,
} from '@/modules/staff/types/staff.types';

const ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  support: 'Support',
};

const ROLE_CLASSES: Record<StaffRole, string> = {
  admin: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  support: 'bg-gray-100 text-gray-700',
};

const EMPTY_FORM: CreateStaffData = {
  name: '',
  email: '',
  password: '',
  role: 'support',
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function SettingsPage() {
  const { data: staff, isLoading, isError } = useStaff();
  const createStaff = useCreateStaff();
  const toggleStaff = useToggleStaff();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateStaffData>(EMPTY_FORM);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    try {
      await createStaff.mutateAsync(form);
      createStaff.reset();
      setForm(EMPTY_FORM);
      setShowForm(false);
      setFeedback({ type: 'success', message: 'Membre créé avec succès.' });
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la création.' });
    }
  }

  async function handleToggle(id: number, currentlyActive: boolean) {
    setToggleError(null);
    try {
      await toggleStaff.mutateAsync({ id, activate: !currentlyActive });
    } catch {
      setToggleError('Impossible de modifier le statut. Veuillez réessayer.');
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

      {/* Staff section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Équipe &amp; Accès
          </h2>
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setFeedback(null);
            }}
            className="rounded-md px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#ec4130' }}
          >
            {showForm ? 'Annuler' : '+ Nouveau membre'}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 font-medium text-gray-900">Créer un membre</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  style={
                    { '--tw-ring-color': '#ec4130' } as React.CSSProperties
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  style={
                    { '--tw-ring-color': '#ec4130' } as React.CSSProperties
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mot de passe *
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  style={
                    { '--tw-ring-color': '#ec4130' } as React.CSSProperties
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Rôle *
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2"
                  style={
                    { '--tw-ring-color': '#ec4130' } as React.CSSProperties
                  }
                >
                  <option value="support">Support</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>

            {feedback && (
              <p
                className={`mt-3 text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
              >
                {feedback.message}
              </p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                type="submit"
                disabled={createStaff.isPending}
                className="rounded-md px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#ec4130' }}
              >
                {createStaff.isPending ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        )}

        {feedback && !showForm && (
          <p
            className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
          >
            {feedback.message}
          </p>
        )}

        {toggleError && (
          <p className="text-sm font-medium text-red-600">{toggleError}</p>
        )}

        {/* Staff table */}
        <div className="rounded-xl bg-white shadow-sm">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded bg-gray-100"
                />
              ))}
            </div>
          ) : isError ? (
            <p className="px-6 py-8 text-center text-sm text-red-600">
              Erreur lors du chargement de l&apos;équipe.
            </p>
          ) : !staff || staff.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">
              Aucun membre trouvé.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Rôle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Créé le
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {member.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_CLASSES[member.role]}`}
                        >
                          {ROLE_LABELS[member.role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        {member.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                            Inactif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            handleToggle(member.id, member.isActive)
                          }
                          disabled={toggleStaff.isPending}
                          className="rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 disabled:opacity-40"
                        >
                          {member.isActive ? 'Désactiver' : 'Réactiver'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
