"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { TournamentWeek, Result, WeekPhoto } from "@/types";
import Image from "next/image";

export default function AdminResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [weeks, setWeeks] = useState<TournamentWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [editingResult, setEditingResult] = useState<number | null>(null);
  const [photos, setPhotos] = useState<WeekPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');

  // New week form
  const [newWeek, setNewWeek] = useState({ week_number: '', date: '', location: 'Lake Santa Fe', notes: '' });
  const [showNewWeek, setShowNewWeek] = useState(false);

  // Edit week
  const [editingWeek, setEditingWeek] = useState<TournamentWeek | null>(null);
  const [editWeekForm, setEditWeekForm] = useState({ week_number: '', date: '', location: '', notes: '' });

  // Result form
  const [resultForm, setResultForm] = useState({
    team_name: '', angler1: '', angler2: '', total_weight: '', num_fish: '', big_bass_weight: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => { loadWeeks(); }, []);
  useEffect(() => {
    if (selectedWeek) {
      loadResults(selectedWeek);
      loadPhotos(selectedWeek);
    }
  }, [selectedWeek]);

  async function loadWeeks() {
    const res = await fetch('/api/weeks');
    const data = await res.json();
    setWeeks(data);
    if (data.length > 0 && !selectedWeek) setSelectedWeek(data[0].id);
  }

  async function loadResults(weekId: number) {
    const res = await fetch(`/api/results?weekId=${weekId}`);
    const data = await res.json();
    setResults(data);
  }

  async function loadPhotos(weekId: number) {
    const res = await fetch(`/api/photos?weekId=${weekId}`);
    const data = await res.json();
    setPhotos(data);
  }

  async function handleCreateWeek(e: FormEvent) {
    e.preventDefault();
    await fetch('/api/weeks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWeek),
    });
    setNewWeek({ week_number: '', date: '', location: 'Lake Santa Fe', notes: '' });
    setShowNewWeek(false);
    loadWeeks();
  }

  function startEditWeek(week: TournamentWeek) {
    setEditingWeek(week);
    setEditWeekForm({
      week_number: String(week.week_number),
      date: week.date,
      location: week.location,
      notes: week.notes || '',
    });
  }

  async function handleEditWeek(e: FormEvent) {
    e.preventDefault();
    if (!editingWeek) return;
    await fetch('/api/weeks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingWeek.id,
        week_number: parseInt(editWeekForm.week_number),
        date: editWeekForm.date,
        location: editWeekForm.location,
        notes: editWeekForm.notes || null,
        is_upcoming: editingWeek.is_upcoming,
      }),
    });
    setEditingWeek(null);
    loadWeeks();
  }

  async function handleDeleteWeek(weekId: number) {
    if (!confirm('Delete this week and ALL its results? This cannot be undone.')) return;
    await fetch('/api/weeks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: weekId }),
    });
    if (selectedWeek === weekId) setSelectedWeek(null);
    loadWeeks();
  }

  async function handleSaveResult(e: FormEvent) {
    e.preventDefault();
    const payload = {
      ...resultForm,
      week_id: selectedWeek,
      total_weight: parseFloat(resultForm.total_weight) || 0,
      num_fish: parseInt(resultForm.num_fish) || 0,
      big_bass_weight: resultForm.big_bass_weight ? parseFloat(resultForm.big_bass_weight) : null,
    };

    if (editingResult) {
      await fetch('/api/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingResult, ...payload }),
      });
    } else {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setResultForm({ team_name: '', angler1: '', angler2: '', total_weight: '', num_fish: '', big_bass_weight: '' });
    setEditingResult(null);
    if (selectedWeek) loadResults(selectedWeek);
  }

  async function handleDeleteResult(id: number) {
    if (!confirm('Delete this result?')) return;
    await fetch('/api/results', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (selectedWeek) loadResults(selectedWeek);
  }

  function startEdit(result: Result) {
    setEditingResult(result.id);
    setResultForm({
      team_name: result.team_name,
      angler1: result.angler1,
      angler2: result.angler2,
      total_weight: String(result.total_weight),
      num_fish: String(result.num_fish),
      big_bass_weight: result.big_bass_weight ? String(result.big_bass_weight) : '',
    });
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !selectedWeek) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('photo', files[i]);
      formData.append('weekId', String(selectedWeek));
      formData.append('caption', photoCaption);
      await fetch('/api/photos', { method: 'POST', body: formData });
    }
    setPhotoCaption('');
    e.target.value = '';
    setUploading(false);
    loadPhotos(selectedWeek);
  }

  async function handleDeletePhoto(id: number) {
    if (!confirm('Delete this photo?')) return;
    await fetch('/api/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (selectedWeek) loadPhotos(selectedWeek);
  }

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  if (!session) return null;

  const selectedWeekData = weeks.find(w => w.id === selectedWeek);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Results</h1>

      {/* Week Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Tournament Week</h2>
          <button
            onClick={() => setShowNewWeek(!showNewWeek)}
            className="bg-[#c45e10] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e8940c] transition-colors"
          >
            + New Week
          </button>
        </div>

        {showNewWeek && (
          <form onSubmit={handleCreateWeek} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 p-4 bg-orange-50 rounded-lg">
            <input type="number" placeholder="Week #" required value={newWeek.week_number}
              onChange={e => setNewWeek({ ...newWeek, week_number: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            <input type="date" required value={newWeek.date}
              onChange={e => setNewWeek({ ...newWeek, date: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            <input type="text" placeholder="Location" value={newWeek.location}
              onChange={e => setNewWeek({ ...newWeek, location: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            <input type="text" placeholder="Notes (optional)" value={newWeek.notes}
              onChange={e => setNewWeek({ ...newWeek, notes: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
            <button type="submit" className="bg-[#c45e10] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e8940c]">
              Create Week
            </button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {weeks.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWeek(w.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedWeek === w.id
                  ? 'bg-[#1a0e04] text-[#f5b731]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week {w.week_number} ({w.date})
            </button>
          ))}
          {weeks.length === 0 && <p className="text-gray-500">No weeks created yet. Create one above.</p>}
        </div>
      </div>

      {/* Edit Selected Week */}
      {selectedWeekData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          {editingWeek && editingWeek.id === selectedWeekData.id ? (
            <form onSubmit={handleEditWeek} className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Week {editingWeek.week_number}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Week #</label>
                  <input type="number" required value={editWeekForm.week_number}
                    onChange={e => setEditWeekForm({ ...editWeekForm, week_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" required value={editWeekForm.date}
                    onChange={e => setEditWeekForm({ ...editWeekForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input type="text" value={editWeekForm.location}
                    onChange={e => setEditWeekForm({ ...editWeekForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input type="text" value={editWeekForm.notes}
                    onChange={e => setEditWeekForm({ ...editWeekForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-[#c45e10] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#e8940c]">Save Changes</button>
                <button type="button" onClick={() => setEditingWeek(null)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Week {selectedWeekData.week_number} &mdash; {selectedWeekData.date}</h2>
                <p className="text-sm text-gray-500">{selectedWeekData.location}{selectedWeekData.notes ? ` • ${selectedWeekData.notes}` : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEditWeek(selectedWeekData)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">
                  Edit Week
                </button>
                <button onClick={() => handleDeleteWeek(selectedWeekData.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50">
                  Delete Week
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedWeek && (
        <>
          {/* Add/Edit Result Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingResult ? 'Edit Result' : 'Add Result'}
            </h2>
            <form onSubmit={handleSaveResult} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
                  <input type="text" required value={resultForm.team_name}
                    onChange={e => setResultForm({ ...resultForm, team_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Angler 1 *</label>
                  <input type="text" required value={resultForm.angler1}
                    onChange={e => setResultForm({ ...resultForm, angler1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Angler 2 *</label>
                  <input type="text" required value={resultForm.angler2}
                    onChange={e => setResultForm({ ...resultForm, angler2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (lbs) *</label>
                  <input type="number" step="0.01" required value={resultForm.total_weight}
                    onChange={e => setResultForm({ ...resultForm, total_weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Fish *</label>
                  <select required value={resultForm.num_fish}
                    onChange={e => setResultForm({ ...resultForm, num_fish: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                    <option value="">Select</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Big Bass Weight (lbs)</label>
                  <input type="number" step="0.01" value={resultForm.big_bass_weight}
                    onChange={e => setResultForm({ ...resultForm, big_bass_weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-[#c45e10] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#e8940c] transition-colors">
                  {editingResult ? 'Update Result' : 'Add Result'}
                </button>
                {editingResult && (
                  <button type="button" onClick={() => { setEditingResult(null); setResultForm({ team_name: '', angler1: '', angler2: '', total_weight: '', num_fish: '', big_bass_weight: '' }); }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Results List */}
          <p className="text-sm text-gray-500 mb-2">Placements are auto-calculated by total weight (heaviest = 1st place).</p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Place</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Team</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Anglers</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Fish</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Weight</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Big Bass</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-900">{r.placement || '-'}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.team_name}</td>
                    <td className="px-4 py-3 text-gray-600">{r.angler1} & {r.angler2}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.num_fish}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#c45e10]">{r.total_weight} lbs</td>
                    <td className="px-4 py-3 text-right text-gray-500">{r.big_bass_weight ? `${r.big_bass_weight} lbs` : '-'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => startEdit(r)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                      <button onClick={() => handleDeleteResult(r.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No results for this week yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Photos Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Week Photos</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-orange-50 rounded-lg">
              <input
                type="text" placeholder="Caption (optional)" value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <label className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                uploading ? 'bg-gray-300 text-gray-500' : 'bg-[#c45e10] text-white hover:bg-[#e8940c]'
              }`}>
                {uploading ? 'Uploading...' : 'Upload Photos'}
                <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} disabled={uploading} className="hidden" />
              </label>
            </div>
            {photos.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No photos uploaded for this week yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image src={photo.filename} alt={photo.caption || 'Tournament photo'} width={300} height={300} className="w-full h-full object-cover" />
                    </div>
                    {photo.caption && <p className="text-xs text-gray-500 mt-1 truncate">{photo.caption}</p>}
                    <button onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                      title="Delete photo">X</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
