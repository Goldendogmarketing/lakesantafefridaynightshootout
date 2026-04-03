"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings);
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMessage('Settings saved successfully!');
      else setMessage('Failed to save settings.');
    } catch {
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tournament Settings</h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Upcoming Tournament */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Tournament</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="text" value={settings.upcoming_date || ''}
                onChange={e => setSettings({ ...settings, upcoming_date: e.target.value })}
                placeholder="e.g., April 12, 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input type="text" value={settings.upcoming_time || ''}
                onChange={e => setSettings({ ...settings, upcoming_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={settings.upcoming_location || ''}
                onChange={e => setSettings({ ...settings, upcoming_location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
              <input type="text" value={settings.upcoming_entry_fee || ''}
                onChange={e => setSettings({ ...settings, upcoming_entry_fee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            </div>
          </div>
        </div>

        {/* Announcement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Announcement</h2>
          <textarea
            rows={3}
            value={settings.upcoming_announcement || ''}
            onChange={e => setSettings({ ...settings, upcoming_announcement: e.target.value })}
            placeholder="Message displayed on the home page"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
          />
        </div>

        {/* Waiver Text */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Waiver Text</h2>
          <textarea
            rows={12}
            value={settings.waiver_text || ''}
            onChange={e => setSettings({ ...settings, waiver_text: e.target.value })}
            placeholder="Full legal waiver text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
          />
        </div>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
            message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#065f46] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#059669] transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
