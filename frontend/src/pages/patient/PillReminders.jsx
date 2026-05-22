import { useState, useEffect, useRef } from 'react';
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
  Search,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';
import { playReminderCreatedSound, playTapSound } from '../../utils/audio';

// Comprehensive Clinical Medicines Database (A-Z, Alphabetically Sorted)
const MEDICATIONS_DB = [
  "Acetaminophen", "Amlodipine", "Amoxicillin", "Atorvastatin", "Azithromycin",
  "Baclofen", "Benadryl", "Bilaxten", "Bisoprolol", "Buprenorphine",
  "Cetirizine", "Ciprofloxacin", "Clopidogrel", "Codeine", "Crestor",
  "Dexamethasone", "Diazepam", "Diclofenac", "Digoxin", "Doxycycline",
  "Erythromycin", "Escitalopram", "Esomeprazole", "Ezetimibe",
  "Famotidine", "Fluconazole", "Fluoxetine", "Fluticasone", "Furosemide",
  "Gabapentin", "Gliclazide", "Glimepiride", "Glucophage",
  "Hydrochlorothiazide", "Hydrocodone", "Hydromorphone", "Hydroxyzine",
  "Ibuprofen", "Imatinib", "Insulin Glargine", "Ipratropium",
  "Januvia", "Jardiance",
  "Kevzara", "Klonopin",
  "Lansoprazole", "Latanoprost", "Levothyroxine", "Lisinopril", "Loratadine",
  "Meloxicam", "Metformin", "Methotrexate", "Metoprolol", "Montelukast",
  "Naproxen", "Nasonex", "Neurontin", "Nexium", "Nifedipine",
  "Olanzapine", "Olmesartan", "Omeprazole", "Ondansetron", "Ozempic",
  "Pantoprazole", "Paracetamol", "Penicillin", "Prednisone", "Propranolol",
  "Quetiapine", "Quinapril",
  "Ramipril", "Ranitidine", "Rosuvastatin",
  "Salbutamol", "Sertraline", "Simvastatin", "Spironolactone", "Symbicort",
  "Tamsulosin", "Telmisartan", "Temazepam", "Tramadol", "Trazodone",
  "Uloric", "Uniphyl",
  "Valacyclovir", "Valsartan", "Venlafaxine", "Verapamil", "Viagra",
  "Warfarin", "Wegovy",
  "Xanax", "Xarelto",
  "Yasmin", "Yervoy",
  "Zantac", "Zoloft", "Zolpidem", "Zyrtec"
];

// Comprehensive Common Dosages Suggestions
const DOSAGE_SUGGESTIONS = [
  "100mg",
  "250mg",
  "500mg",
  "650mg",
  "1000mg",
  "1 Tablet",
  "2 Tablets",
  "5ml",
  "10ml"
];

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

  // Autocomplete UI States
  const [filteredMedications, setFilteredMedications] = useState([]);
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [showDoseDropdown, setShowDoseDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Adherence History & Streak States
  const [takenLogs, setTakenLogs] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchReminders();
    fetchLogs();
    const handleLogsUpdate = () => {
      fetchLogs();
    };
    window.addEventListener('medicationLogsUpdated', handleLogsUpdate);
    return () => window.removeEventListener('medicationLogsUpdated', handleLogsUpdate);
  }, []);

  const fetchLogs = () => {
    try {
      const logs = JSON.parse(localStorage.getItem('medication_logs_all') || '[]');
      setTakenLogs(logs);
      setStreak(logs.length);
    } catch (e) {
      console.error("Failed to fetch medication logs", e);
    }
  };

  const deleteLog = (id) => {
    try {
      const updated = takenLogs.filter(log => log.id !== id);
      localStorage.setItem('medication_logs_all', JSON.stringify(updated));
      fetchLogs();
      playDeleteSound();
      window.dispatchEvent(new Event('medicationLogsUpdated'));
    } catch (e) {}
  };

  const clearAllLogs = () => {
    if (window.confirm("Are you sure you want to clear your entire dose history?")) {
      localStorage.removeItem('medication_logs_all');
      fetchLogs();
      playDeleteSound();
      window.dispatchEvent(new Event('medicationLogsUpdated'));
    }
  };

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
        reminderTime: newReminder.reminderTime + ':00', // Backend HH:mm:ss
      });
      setMessage({ type: 'success', text: 'Reminder scheduled successfully!' });
      playReminderCreatedSound();
      setNewReminder({
        medicationName: '',
        dosage: '',
        reminderTime: '08:00',
        foodInstruction: 'After Food',
        durationDays: 7
      });
      fetchReminders();
    } catch (err) {
      console.error('Failed to add reminder', err);
      setMessage({ type: 'error', text: 'Failed to add reminder. Verify connection.' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pill-reminders/${id}`);
      setReminders(reminders.filter((r) => r.id !== id));
      playDeleteSound();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  // Medication Typing Filter handler
  const handleMedNameChange = (val) => {
    setNewReminder((prev) => ({ ...prev, medicationName: val }));
    if (!val.trim()) {
      setFilteredMedications([]);
      setShowMedDropdown(false);
      return;
    }

    // Filter alphabetically A-Z
    const filtered = MEDICATIONS_DB.filter(med => 
      med.toLowerCase().startsWith(val.toLowerCase())
    ).sort();

    setFilteredMedications(filtered);
    setShowMedDropdown(filtered.length > 0);
  };

  const selectMedication = (name) => {
    setNewReminder((prev) => ({ ...prev, medicationName: name }));
    setShowMedDropdown(false);
  };

  const selectDosage = (dose) => {
    setNewReminder((prev) => ({ ...prev, dosage: dose }));
    setShowDoseDropdown(false);
  };

  const handleMedBlur = () => {
    setTimeout(() => setShowMedDropdown(false), 200);
  };

  const handleDoseBlur = () => {
    setTimeout(() => setShowDoseDropdown(false), 200);
  };

  // Filter reminders list by user search query
  const displayedReminders = reminders.filter(r => 
    r.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Dashboard Premium Welcome Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Pill Reminders</h2>
              <p className="text-slate-500 font-medium text-sm mt-0.5">
                Manage your active medications and secure dose timetables
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 text-sm font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Scheduling Card */}
            <div className="lg:col-span-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 relative">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Add New Reminder
                </h3>
                
                <form onSubmit={handleAddReminder} className="space-y-4">
                  {/* Medication Input with Autocomplete */}
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Medication
                    </label>
                    <input
                      type="text"
                      value={newReminder.medicationName}
                      onChange={(e) => handleMedNameChange(e.target.value)}
                      onFocus={() => {
                        if (newReminder.medicationName) {
                          handleMedNameChange(newReminder.medicationName);
                        }
                      }}
                      onBlur={handleMedBlur}
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-150 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="e.g. Paracetamol"
                      autoComplete="off"
                    />

                    {/* Alphabetical Autocomplete Dropdown */}
                    {showMedDropdown && (
                      <div className="absolute left-0 right-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl mt-1 max-h-48 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                          Available Medications
                        </div>
                        {filteredMedications.map((med) => (
                          <div
                            key={med}
                            onMouseDown={() => selectMedication(med)}
                            className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <span>{med}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold scale-90">Select</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dosage Input with Suggestions */}
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={newReminder.dosage}
                      onChange={(e) => setNewReminder({ ...newReminder, dosage: e.target.value })}
                      onFocus={() => setShowDoseDropdown(true)}
                      onBlur={handleDoseBlur}
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-150 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      placeholder="e.g. 500mg"
                      autoComplete="off"
                    />

                    {/* Dosage Suggestions Dropdown */}
                    {showDoseDropdown && (
                      <div className="absolute left-0 right-0 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl mt-1 max-h-48 overflow-y-auto py-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-1 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                          Quick Dosages
                        </div>
                        {DOSAGE_SUGGESTIONS.map((dose) => (
                          <div
                            key={dose}
                            onMouseDown={() => selectDosage(dose)}
                            className="px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors flex items-center justify-between"
                          >
                            <span>{dose}</span>
                            <Check className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Time Input */}
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      value={newReminder.reminderTime}
                      onChange={(e) =>
                        setNewReminder({ ...newReminder, reminderTime: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-150 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm cursor-pointer"
                    />
                  </div>

                  {/* Split Layout Instructions & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Instruction
                      </label>
                      <select
                        value={newReminder.foodInstruction}
                        onChange={(e) =>
                          setNewReminder({ ...newReminder, foodInstruction: e.target.value })
                        }
                        className="w-full px-3 py-3.5 bg-slate-50 border border-slate-150 rounded-2xl text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs cursor-pointer"
                      >
                        <option value="After Food">After Food</option>
                        <option value="Before Food">Before Food</option>
                        <option value="With Food">With Food</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newReminder.durationDays}
                        onChange={(e) =>
                          setNewReminder({ ...newReminder, durationDays: parseInt(e.target.value) || 1 })
                        }
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-150 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={adding}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/25 hover:shadow-slate-900/40 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      'Set Reminder'
                    )}
                  </button>
                </form>

                {message.text && (
                  <div className={`p-4 rounded-2xl border text-xs font-bold text-center animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            {/* Right Reminders List Pane */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Search Filtering bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter scheduled reminders by medication name..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-slate-700 font-semibold focus:outline-none shadow-sm text-sm"
                />
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                </div>
              ) : displayedReminders.length === 0 ? (
                <div className="bg-white p-12 rounded-[2.5rem] border border-dashed border-slate-200 text-center shadow-sm">
                  <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold text-sm">No scheduled pill reminders found.</p>
                  <p className="text-xs text-slate-400 mt-1">Fill out the scheduler on the left to start tracking!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all hover:shadow-md hover:shadow-slate-100/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 bg-slate-50 text-slate-800 rounded-2xl group-hover:bg-primary group-hover:text-white transition-colors border border-slate-100">
                          <Clock className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5">
                          <h4 className="font-black text-slate-900 text-lg leading-none">
                            {reminder.medicationName}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-black tracking-wider uppercase">
                            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {reminder.dosage}
                            </span>
                            <span className="flex items-center gap-1 bg-sky-50 text-sky-600 px-2 py-0.5 rounded-md">
                              <Clock className="w-3.5 h-3.5" />
                              {reminder.reminderTime.substring(0, 5)}
                            </span>
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md">
                              <Utensils className="w-3.5 h-3.5" />
                              {reminder.foodInstruction || 'After Food'}
                            </span>
                            <span className="flex items-center gap-1 bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md">
                              <Calendar className="w-3.5 h-3.5" />
                              {reminder.durationDays || '7'} Days
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(reminder.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Reminder"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                <div>
                  <h5 className="font-extrabold text-amber-900 text-sm">Safety Information</h5>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1 font-semibold">
                    Digital reminders are experimental (Level 11). Always follow the physical
                    prescription instructions provided by your doctor. If you miss a dose, consult
                    your healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Adherence Logs History & Streak Counter */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider">
                    Medication Adherence History
                  </h3>
                  <p className="text-slate-500 font-medium text-xs">
                    Persistent tracking log of your completed medication doses
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-md shadow-orange-500/10">
                  <span>🔥 Streak: {streak} Doses</span>
                </div>
                {takenLogs.length > 0 && (
                  <button
                    onClick={clearAllLogs}
                    className="text-xs font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                  >
                    Clear History
                  </button>
                )}
              </div>
            </div>

            {takenLogs.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-16 h-16 bg-slate-50 text-slate-350 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="text-slate-500 font-bold text-sm">Your medication adherence log is empty.</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  When a reminder triggers on your screen, click "Mark Taken" to start tracking your streak and building history records!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[30rem] overflow-y-auto pr-2">
                {takenLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] flex items-center justify-between group hover:border-emerald-100 hover:bg-emerald-50/10 transition-all animate-in fade-in duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-800 text-sm leading-none flex items-center gap-2">
                          {log.medicationName}
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black uppercase">
                            Taken
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                          <span>Dose: {log.dosage}</span>
                          <span>•</span>
                          <span>{log.foodInstruction}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-black">
                          Scheduled: {log.reminderTime.substring(0, 5)} | Taken: {new Date(log.takenAt).toLocaleDateString()} {new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="p-2 text-slate-350 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PillReminders;
