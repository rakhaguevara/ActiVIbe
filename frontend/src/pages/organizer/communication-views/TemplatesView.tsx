import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FiFileText, FiRefreshCw, FiFolder, FiEdit2, FiCopy, FiTrash2, FiTag,
} from 'react-icons/fi'
import '../CommunicationPage.css'
import '../../../components/ConfirmDialog.css'
import ConfirmDialog from '../../../components/ConfirmDialog'
import {
  listMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
  duplicateMessageTemplate,
  deleteMessageTemplate,
  type MessageTemplate,
} from '../../../lib/communicationApi'

const EMPTY_FORM = { name: '', category: '', subject: '', body: '' }

function formatRelativeDate(iso: string) {
  const date = new Date(iso)
  const diffMs = Date.now() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Hari ini'
  if (diffDays === 1) return '1 hari lalu'
  if (diffDays < 7) return `${diffDays} hari lalu`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TemplatesView() {
  const location = useLocation()
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplate | null>(null)

  const loadTemplates = async () => {
    try {
      setError(null)
      const data = await listMessageTemplates()
      setTemplates(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat template.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  // Header "Create Template" (CommunicationPage.tsx) navigasi dgn ?new=1 —
  // dibaca di sini supaya Quick Editor otomatis mulai dari mode "template baru"
  // (bukan lift state lintas komponen sibling, cukup query param).
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('new') === '1') {
      setEditingId(null)
      setForm(EMPTY_FORM)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const categories = useMemo(() => {
    const set = new Set(templates.map((t) => t.category).filter((c): c is string => Boolean(c)))
    return Array.from(set).sort()
  }, [templates])

  const filteredTemplates = useMemo(() => {
    if (!categoryFilter) return templates
    return templates.filter((t) => t.category === categoryFilter)
  }, [templates, categoryFilter])

  const recentlyUpdatedCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return templates.filter((t) => new Date(t.updatedAt).getTime() >= weekAgo).length
  }, [templates])

  const mostCommonCategory = useMemo(() => {
    const counts = new Map<string, number>()
    templates.forEach((t) => {
      if (!t.category) return
      counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
    })
    let best: string | null = null
    let bestCount = 0
    counts.forEach((count, category) => {
      if (count > bestCount) {
        best = category
        bestCount = count
      }
    })
    return best
  }, [templates])

  const handleNewTemplate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setSaveError(null)
  }

  const handleEditTemplate = (tpl: MessageTemplate) => {
    setEditingId(tpl.id)
    setForm({ name: tpl.name, category: tpl.category ?? '', subject: tpl.subject ?? '', body: tpl.body })
    setSaveError(null)
  }

  const handleDuplicate = async (tpl: MessageTemplate) => {
    try {
      await duplicateMessageTemplate(tpl.id)
      await loadTemplates()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menduplikasi template.')
    }
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return
    try {
      await deleteMessageTemplate(deleteTarget.id)
      if (editingId === deleteTarget.id) handleNewTemplate()
      setDeleteTarget(null)
      await loadTemplates()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menghapus template.')
      setDeleteTarget(null)
    }
  }

  const handleSave = async () => {
    setSaveError(null)
    if (!form.name.trim() || !form.body.trim()) {
      setSaveError('Nama dan isi pesan template wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || undefined,
        subject: form.subject.trim() || undefined,
        body: form.body.trim(),
      }
      const saved = editingId
        ? await updateMessageTemplate(editingId, payload)
        : await createMessageTemplate(payload)
      setEditingId(saved.id)
      await loadTemplates()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan template.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* KPI Cards — semua dihitung dari data template asli, bukan angka dikarang
          (backend tidak melacak "kali dipakai", jadi metrik itu diganti yang real). */}
      <div className="events-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-card__icon"><FiFileText /></div>
          <div className="stat-card__value">{templates.length}</div>
          <div className="stat-card__label">Total Templates</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: '#f59e0b', background: '#fffbeb' }}><FiTag /></div>
          <div className="stat-card__value" style={{ fontSize: '18px' }}>{mostCommonCategory ?? '—'}</div>
          <div className="stat-card__label">Kategori Terpopuler</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-success)', background: '#f0fdf4' }}><FiRefreshCw /></div>
          <div className="stat-card__value">{recentlyUpdatedCount}</div>
          <div className="stat-card__label">Diperbarui 7 Hari Terakhir</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ color: 'var(--color-primary)', background: 'var(--color-primary-soft)' }}><FiFolder /></div>
          <div className="stat-card__value">{categories.length}</div>
          <div className="stat-card__label">Categories</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Template Library */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Template Library</h2>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="btn btn--outline btn--sm"
              style={{ cursor: 'pointer' }}
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {loading && <p style={{ color: 'var(--color-text-muted)' }}>Memuat template...</p>}
          {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
          {!loading && !error && filteredTemplates.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)' }}>Belum ada template{categoryFilter ? ' di kategori ini' : ''}. Buat template baru lewat panel Quick Editor.</p>
          )}

          <div className="template-grid">
            {filteredTemplates.map((tpl) => (
              <div key={tpl.id} className="template-card">
                <div style={{ marginBottom: '8px' }}>
                  {tpl.category && (
                    <span className="badge" style={{ background: '#f1f5f9', fontSize: '11px', marginBottom: '8px', display: 'inline-block' }}>{tpl.category}</span>
                  )}
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{tpl.name}</h3>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span>Terakhir diperbarui {formatRelativeDate(tpl.updatedAt)}</span>
                  {tpl.createdByName && <span>Dibuat oleh {tpl.createdByName}</span>}
                </div>

                <div className="template-card__actions">
                  <div style={{ display: 'flex', gap: '4px', background: '#fff', padding: '4px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border-light)' }}>
                    <button className="btn btn--sm" style={{ padding: '6px', background: 'transparent', border: 'none' }} title="Edit" onClick={() => handleEditTemplate(tpl)}><FiEdit2 /></button>
                    <button className="btn btn--sm" style={{ padding: '6px', background: 'transparent', border: 'none' }} title="Duplicate" onClick={() => handleDuplicate(tpl)}><FiCopy /></button>
                    <button className="btn btn--sm" style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--color-danger)' }} title="Delete" onClick={() => setDeleteTarget(tpl)}><FiTrash2 /></button>
                  </div>
                </div>

                <button className="btn btn--outline btn--sm" style={{ width: '100%', marginTop: 'auto' }} onClick={() => setPreviewTemplate(tpl)}>Preview Template</button>
              </div>
            ))}
          </div>
        </section>

        {/* Template Editor */}
        <section className="card" style={{ padding: '24px', position: 'sticky', top: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Quick Editor</span>
            {editingId ? (
              <span className="badge badge--success" style={{ fontSize: '10px' }}>Editing: {form.name || '...'}</span>
            ) : (
              <button type="button" className="btn btn--sm btn--outline" onClick={handleNewTemplate}>+ Baru</button>
            )}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Nama Template</label>
              <input
                type="text"
                placeholder="mis. Reminder H-1"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Kategori (opsional)</label>
              <input
                type="text"
                placeholder="mis. Preparation"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Subject (opsional)</label>
              <input
                type="text"
                placeholder="Reminder: {{EventName}} besok!"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Body</label>
              <textarea
                style={{ width: '100%', minHeight: '150px', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border-light)', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                placeholder={'Hi {{VolunteerName}},\n\nTulis isi pesan di sini...'}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>

            {saveError && <div style={{ color: 'var(--color-danger)', fontSize: '13px' }}>{saveError}</div>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                className="btn btn--outline"
                style={{ flex: 1 }}
                disabled={!form.name.trim() && !form.body.trim()}
                onClick={() => setPreviewTemplate({
                  id: editingId ?? 'preview',
                  name: form.name || '(Tanpa nama)',
                  category: form.category || undefined,
                  subject: form.subject || undefined,
                  body: form.body,
                  createdByName: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })}
              >
                Preview
              </button>
              <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </section>
      </div>

      {previewTemplate && (
        <div className="confirm-dialog__backdrop" onClick={() => setPreviewTemplate(null)}>
          <div className="confirm-dialog" role="dialog" aria-modal="true" style={{ maxWidth: '480px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">{previewTemplate.name}</h3>
            {previewTemplate.subject && (
              <p style={{ fontWeight: 600, marginBottom: '8px' }}>Subject: {previewTemplate.subject}</p>
            )}
            <p className="confirm-dialog__message" style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{previewTemplate.body || '(Isi pesan kosong)'}</p>
            <div className="confirm-dialog__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setPreviewTemplate(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus Template?"
          message={`Template "${deleteTarget.name}" akan dihapus permanen dan tidak bisa dikembalikan.`}
          confirmLabel="Hapus"
          tone="danger"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
