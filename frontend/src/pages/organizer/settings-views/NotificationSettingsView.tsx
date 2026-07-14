import { useEffect, useState } from 'react'
import {
  FiBell, FiClock, FiCheckCircle
} from 'react-icons/fi'
import { getOrganizationSettings, updateNotificationSettings, type OrganizationSettings } from '../../../lib/settingsApi'
import '../SettingsPage.css'

// Bucket C (CLAUDE.md) — sebelumnya "Delivery Methods" (Push/Browser/SMS) &
// label kategori (Security Alerts/Marketing & News) 100% mock, tidak ada
// field backend yang cocok. Dihapus (bukan diam-diam "diwire" ke field yang
// tidak ada) — cuma 4 boolean notifyEmail* + notificationFrequency yang
// benar-benar ada di OrganizationSettings, jadi cuma itu yang ditampilkan.
export default function NotificationSettingsView() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getOrganizationSettings()
      .then(setSettings)
      .catch((err) => window.alert(err instanceof Error ? err.message : 'Gagal memuat pengaturan.'))
  }, [])

  const patch = (partial: Partial<OrganizationSettings>) => {
    setSettings((prev) => (prev ? { ...prev, ...partial } : prev))
  }

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    try {
      const updated = await updateNotificationSettings({
        notifyEmailNewApplicant: settings.notifyEmailNewApplicant,
        notifyEmailEventReminder: settings.notifyEmailEventReminder,
        notifyEmailBroadcastReceipts: settings.notifyEmailBroadcastReceipts,
        notifyEmailWeeklyDigest: settings.notifyEmailWeeklyDigest,
        notificationFrequency: settings.notificationFrequency,
      })
      setSettings(updated)
      window.alert('Preferensi notifikasi berhasil disimpan.')
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Gagal menyimpan preferensi notifikasi.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!settings) {
    return (
      <section className="card" style={{ padding: '32px' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Memuat pengaturan...</p>
      </section>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <section className="card" style={{ padding: '32px' }}>
            <h2 className="settings-section-title"><FiBell /> Notification Categories</h2>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Volunteer Applications</div>
                <div className="settings-toggle-desc">Notify when a new volunteer applies to your events.</div>
              </div>
              <input
                type="checkbox"
                className="settings-toggle-switch"
                checked={settings.notifyEmailNewApplicant}
                onChange={(e) => patch({ notifyEmailNewApplicant: e.target.checked })}
              />
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Event Reminders</div>
                <div className="settings-toggle-desc">Receive reminders as your events approach.</div>
              </div>
              <input
                type="checkbox"
                className="settings-toggle-switch"
                checked={settings.notifyEmailEventReminder}
                onChange={(e) => patch({ notifyEmailEventReminder: e.target.checked })}
              />
            </div>

            <div className="settings-toggle-row">
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Broadcast Receipts</div>
                <div className="settings-toggle-desc">Get a copy/confirmation whenever you send a broadcast message.</div>
              </div>
              <input
                type="checkbox"
                className="settings-toggle-switch"
                checked={settings.notifyEmailBroadcastReceipts}
                onChange={(e) => patch({ notifyEmailBroadcastReceipts: e.target.checked })}
              />
            </div>

            <div className="settings-toggle-row" style={{ borderBottom: 'none' }}>
              <div className="settings-toggle-info">
                <div className="settings-toggle-title">Weekly Digest</div>
                <div className="settings-toggle-desc">A weekly summary email of activity across your organization.</div>
              </div>
              <input
                type="checkbox"
                className="settings-toggle-switch"
                checked={settings.notifyEmailWeeklyDigest}
                onChange={(e) => patch({ notifyEmailWeeklyDigest: e.target.checked })}
              />
            </div>

            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn--primary"
                style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={handleSave}
                disabled={isSaving}
              >
                <FiCheckCircle /> {isSaving ? 'Menyimpan...' : 'Save Preferences'}
              </button>
            </div>
          </section>
        </div>

        {/* Side Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <section className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiClock /> Notification Schedule
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="schedule"
                  checked={settings.notificationFrequency === 'INSTANT'}
                  onChange={() => patch({ notificationFrequency: 'INSTANT' })}
                  style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Instant</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Send immediately as events occur.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="schedule"
                  checked={settings.notificationFrequency === 'DAILY'}
                  onChange={() => patch({ notificationFrequency: 'DAILY' })}
                  style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Daily Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Roll up notifications into one daily email.</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="schedule"
                  checked={settings.notificationFrequency === 'WEEKLY'}
                  onChange={() => patch({ notificationFrequency: 'WEEKLY' })}
                  style={{ marginTop: '4px', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Weekly Summary</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Roll up notifications into one weekly email.</div>
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
