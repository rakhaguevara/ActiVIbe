import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiTerminal, FiCode, FiLayers, FiLink, FiCopy, FiBookOpen, FiPlus, FiCheck
} from 'react-icons/fi'
import { listApiKeys, createApiKey, revokeApiKey, type ApiKey } from '../../../lib/apiKeysApi'
import { getOrganizationSettings, updateWebhookUrl } from '../../../lib/settingsApi'
import '../SettingsPage.css'

// Sama alamat dukungan yang dipakai HelpPage.tsx.
const SUPPORT_EMAIL = 'support@activibe.id'

export default function ApiSettingsView() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyLabel, setNewKeyLabel] = useState('')
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  // Plaintext cuma pernah ada sesaat setelah generate — hilang begitu halaman
  // di-refresh/pindah (tidak pernah disimpan/diambil ulang dari server).
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [webhookUrl, setWebhookUrlState] = useState('')
  const [isSavingWebhook, setIsSavingWebhook] = useState(false)

  const loadKeys = () => {
    listApiKeys()
      .then(setApiKeys)
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat API key.'))
  }

  useEffect(() => {
    loadKeys()
    getOrganizationSettings()
      .then((settings) => setWebhookUrlState(settings.webhookUrl ?? ''))
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat pengaturan webhook.'))
  }, [])

  const handleCreateKey = async () => {
    if (!newKeyLabel.trim()) {
      window.alert('Label API key wajib diisi.')
      return
    }
    setIsCreatingKey(true)
    try {
      const created = await createApiKey(newKeyLabel.trim())
      setJustCreatedKey(created.plaintextKey)
      setNewKeyLabel('')
      loadKeys()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal membuat API key.')
    } finally {
      setIsCreatingKey(false)
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!window.confirm('Cabut API key ini? Aplikasi yang memakainya akan langsung berhenti berfungsi.')) return
    try {
      await revokeApiKey(id)
      loadKeys()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal mencabut API key.')
    }
  }

  const handleCopyKey = async () => {
    if (!justCreatedKey) return
    await navigator.clipboard.writeText(justCreatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveWebhook = async () => {
    setIsSavingWebhook(true)
    try {
      const updated = await updateWebhookUrl(webhookUrl.trim())
      setWebhookUrlState(updated.webhookUrl ?? '')
      window.alert('Webhook URL berhasil disimpan.')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menyimpan webhook URL.')
    } finally {
      setIsSavingWebhook(false)
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="settings-section-title" style={{ margin: 0 }}><FiLayers /> Future Integrations</h2>
              <span className="badge" style={{ background: '#f3e8ff', color: '#7c3aed', padding: '6px 12px', fontSize: '13px' }}>Coming Q4 2026</span>
            </div>

            <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
              We are building a powerful ecosystem to let you connect ActiVibe directly to your existing tools. Prepare your organization for our upcoming webhook and REST API release.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>⚡</div>
                <div style={{ fontWeight: 600 }}>Zapier</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>💬</div>
                <div style={{ fontWeight: 600 }}>Slack</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📅</div>
                <div style={{ fontWeight: 600 }}>Google Calendar</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📧</div>
                <div style={{ fontWeight: 600 }}>Outlook</div>
              </div>
              <div style={{ border: '1px solid var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.7 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🤖</div>
                <div style={{ fontWeight: 600 }}>n8n</div>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Request integrasi aplikasi baru')}`}
                style={{ border: '2px dashed var(--color-border-light)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', textDecoration: 'none' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}><FiLink /></div>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Request App</div>
              </a>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiTerminal /> API Keys</h2>

            {justCreatedKey && (
              <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#854d0e' }}>
                  Simpan key ini sekarang — tidak akan ditampilkan lagi setelah kamu meninggalkan halaman ini.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" value={justCreatedKey} className="settings-input" style={{ flex: 1, fontFamily: 'monospace' }} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
                  <button type="button" className="btn btn--outline" onClick={handleCopyKey}>
                    {copied ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
              </div>
            )}

            <div className="settings-group" style={{ marginBottom: '20px' }}>
              <label>Label API Key Baru</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="settings-input"
                  style={{ flex: 1 }}
                  placeholder="mis. Integrasi Zapier internal"
                  value={newKeyLabel}
                  onChange={(e) => setNewKeyLabel(e.target.value)}
                />
                <button type="button" className="btn btn--primary" onClick={handleCreateKey} disabled={isCreatingKey}>
                  <FiPlus /> {isCreatingKey ? 'Membuat...' : 'Generate'}
                </button>
              </div>
            </div>

            <div className="v-table-wrapper">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>Label</th>
                    <th>Key</th>
                    <th>Last Used</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.length === 0 && (
                    <tr><td colSpan={5} style={{ color: 'var(--color-text-muted)' }}>Belum ada API key.</td></tr>
                  )}
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td>{key.label}</td>
                      <td style={{ fontFamily: 'monospace' }}>{key.keyPrefix}...</td>
                      <td>{key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString('id-ID') : 'Belum pernah'}</td>
                      <td>{key.revokedAt ? <span className="badge badge--danger">Revoked</span> : <span className="badge badge--success">Active</span>}</td>
                      <td>
                        {!key.revokedAt && (
                          <button type="button" className="btn btn--sm btn--outline" onClick={() => handleRevokeKey(key.id)}>Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiTerminal /> Developer API Preview</h2>

            <div className="settings-group" style={{ marginBottom: '24px' }}>
              <label>Event Webhook Target URL</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="https://api.yourdomain.com/webhooks/activibe"
                  className="settings-input"
                  style={{ flex: 1 }}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrlState(e.target.value)}
                />
                <button type="button" className="btn btn--primary" onClick={handleSaveWebhook} disabled={isSavingWebhook}>
                  {isSavingWebhook ? 'Menyimpan...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="settings-group">
              <label>Example Webhook Payload (event.published)</label>
              <div className="api-code-block">
<pre style={{ margin: 0 }}>
{`{
  "event_id": "evt_98328",
  "type": "event.published",
  "created_at": "2026-07-05T14:30:00Z",
  "data": {
    "title": "Beach Cleanup 2026",
    "location": "Parangtritis, ID",
    "required_volunteers": 50
  }
}`}
</pre>
              </div>
            </div>
          </section>
        </div>

        {/* Side Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <section className="card" style={{ padding: '24px', background: 'linear-gradient(145deg, #f8fafc, #ffffff)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary-soft)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '16px' }}>
              <FiCode />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
              API Documentation
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Read our comprehensive guides to learn how to authenticate, paginate, and consume our REST endpoints.
            </p>
            <Link to="/organizer/help" className="btn btn--outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <FiBookOpen /> Read Docs
            </Link>
          </section>
        </div>
      </div>
    </>
  )
}
