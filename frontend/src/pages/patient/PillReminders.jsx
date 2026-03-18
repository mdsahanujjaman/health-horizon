import { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Utensils,
} from 'lucide-react';
import api from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';

const PillReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medicationName: '',
    dosage: '',
    reminderTime: '08:00',
    foodInstruction: 'After Food',
    durationDays: 7,
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await api.get('/pill-reminders');
      setReminders(res.data);
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/pill-reminders', {
        ...newReminder,
        reminderTime: newReminder.reminderTime + ':00', // Backend expects HH:mm:ss
      });
      setMessage({ type: 'success', text: 'Reminder added!' });
      setNewReminder({ medicationName: '', dosage: '', reminderTime: '08:00' });
      fetchReminders();
    } catch (err) {
      console.error('Failed to add reminder', err);
      setMessage({ type: 'error', text: 'Failed to add reminder' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pill-reminders/${id}`);
      setReminders(reminders.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pill Reminders</h2>
              <p className="text-gray-500 font-medium">
                Never miss a dose (Level 11 Advanced Notifications)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600 font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* New Reminder Form */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Reminder
                </h3>
                <form onSubmit={handleAddReminder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Medication
                    </label>
                    <input
                      type="text"
                      value={newReminder.medicationName}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, medicationName: e.target.value })
                      }
                      required
                      className="w-full rounded-xl border-gray-200 px-4 py-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g. Paracetamol"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={newReminder.dosage}
                      onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                      required
                      className="w-full rounded-xl border-gray-200 px-4 py-2 focus:ring-primary focus:border-primary"
                      placeholder="e.g. 500mg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newReminder.reminderTime}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, reminderTime: e.target.value })
                      }
                      required
                      className="w-full rounded-xl border-gray-200 px-4 py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Instruction
                      </label>
                      <select
                        value={newReminder.foodInstruction}
                        onChange={(e) =>
                          setNewReminder({ ...newReminder, foodInstruction: e.target.value })
                        }
                        className="w-full rounded-xl border-gray-200 px-4 py-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="With Food">With Food</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Days
                      </label>
                      <input
                        type="number"
                        value={newReminder.durationDays}
                        onChange={(e) =>
                          setNewReminder({ ...newReminder, durationDays: e.target.value })
                        }
                        className="w-full rounded-xl border-gray-200 px-4 py-2 focus:ring-primary focus:border-primary"
                        placeholder="7"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Reminder'}
                  </button>
                </form>
                {message.text && (
                  <p
                    className={`mt-4 text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {message.text}
                  </p>
                )}
              </div>
            </div>

            {/* Reminders List */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                </div>
              ) : reminders.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
                  <Bell className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">No active reminders. Add one to stay on track!</p>
                </div>
              ) : (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group transition-all hover:border-primary/20"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-primary/5 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {reminder.medicationName}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {reminder.dosage}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            {reminder.reminderTime.substring(0, 5)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Utensils className="w-4 h-4 text-amber-500" />
                            {reminder.foodInstruction || 'After Food'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-violet-500" />
                            {reminder.durationDays || '7'} Days
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}

              <div className="mt-8 bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <h5 className="font-bold text-amber-900">Safety Information</h5>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Digital reminders are experimental (Level 11). Always follow the physical
                    prescription instructions provided by your doctor. If you miss a dose, consult
                    your healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PillReminders;
