import { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PatientSidebar from '../../components/PatientSidebar';
import api from '../../services/api';
import ChatWindow from '../../components/ChatWindow';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-4 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-800">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-5 pt-0 text-slate-600 leading-relaxed border-t border-slate-50">
          {answer}
        </div>
      )}
    </div>
  );
};

const Support = () => {
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  const fetchUser = async () => {
    try {
      // Assuming /patients/me returns the patient profile with .user.id or .id
      // Adjust based on your actual API response structure
      const res = await api.get('/patients/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUser();
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <PatientSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Support Center
            </h1>
            <p className="text-slate-500 font-medium">We're here to help you 24/7</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Chat Support */}
            <div
              className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover-lift group cursor-pointer"
              onClick={() => setShowChat(true)}
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors duration-300">
                <MessageCircle className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
              <p className="text-slate-500 text-sm mb-4">Chat with our support team instantly.</p>
              <span className="text-blue-500 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Start Chat <span aria-hidden="true">&rarr;</span>
              </span>
            </div>

            {/* Phone Support */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover-lift group">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors duration-300">
                <Phone className="w-7 h-7 text-emerald-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Call Us</h3>
              <p className="text-slate-500 text-sm mb-4">+1 (800) 123-4567</p>
              <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">
                Available 24/7
              </span>
            </div>

            {/* Email Support */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover-lift group">
              <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-violet-500 transition-colors duration-300">
                <Mail className="w-7 h-7 text-violet-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Email Us</h3>
              <p className="text-slate-500 text-sm mb-4">support@healthhorizon.com</p>
              <span className="text-violet-500 font-bold text-sm flex items-center gap-1">
                Response in 24h
              </span>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-amber-50 rounded-xl">
                <HelpCircle className="w-6 h-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-2">
              <FaqItem
                question="How do I book an appointment?"
                answer="Go to the 'Appointments' tab in the sidebar, select your preferred doctor, choose a date and time slot, and confirm your booking."
              />
              <FaqItem
                question="Can I cancel my appointment?"
                answer="Yes, you can cancel appointments from your dashboard up to 2 hours before the scheduled time with no penalty."
              />
              <FaqItem
                question="Is my medical data secure?"
                answer="Absolutely. We use banking-grade encryption and strict access controls compliant with HIPAA standards to ensure your data is safe."
              />
            </div>
          </div>
        </div>
      </main>

      {/* Chat Window Overlay */}
      {showChat && user && (
        <ChatWindow
          currentUser={{ id: user.userId || user.id }} // Adjust based on DTO
          recipientId={1} // Hardcoded Admin/Support ID for now
          recipientName="Support Team"
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default Support;
