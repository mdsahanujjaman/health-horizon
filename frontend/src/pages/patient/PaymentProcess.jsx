import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Activity,
  Lock,
} from 'lucide-react';
import api from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';

const PaymentProcess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId, amount, doctorName } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [cardData] = useState({
    number: '**** **** **** 4242',
    expiry: '12/26',
    cvv: '***',
  });

  useEffect(() => {
    if (!appointmentId) {
      navigate('/patient/dashboard');
      return;
    }

    const initPayment = async () => {
      try {
        const res = await api.post(`/payments/initiate/${appointmentId}`);
        setPaymentId(res.data.id);
      } catch (err) {
        console.error('Failed to initiate payment', err);
      }
    };

    initPayment();
  }, [appointmentId, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate network delay
    setTimeout(async () => {
      try {
        await api.post(`/payments/process/${paymentId}?paymentMethod=CARD`);
        setLoading(false);
        setVerifying(true);

        // Simulate verification delay
        setTimeout(() => {
          setVerifying(false);
          setSuccess(true);
        }, 2000);
      } catch (err) {
        console.error('Payment failed', err);
        setLoading(false);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <PatientSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center scale-up-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-500 mb-8">
              Your appointment with <strong>Dr. {doctorName}</strong> has been confirmed.
            </p>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-primary/25"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <PatientSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Cancel and return
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Summary Column */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="text-gray-900 font-medium">Consultation</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Doctor</span>
                    <span className="text-gray-900 font-medium">{doctorName}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-primary">{amount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
                <div className="flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="text-xs text-sky-700 leading-relaxed">
                    Your payment is processed through a secure virtual environment. No real funds
                    are moved.
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Column */}
            <div className="md:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                {verifying && (
                  <div className="absolute inset-0 bg-white/90 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">Verifying Transaction...</h3>
                    <p className="text-sm text-gray-500">Contacting your bank</p>
                  </div>
                )}

                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Card Details</h2>
                    <p className="text-sm text-gray-500">Simulated secure checkout</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-6 bg-gray-100 rounded-md"></div>
                    <div className="w-10 h-6 bg-gray-100 rounded-md"></div>
                  </div>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        readOnly
                        value={cardData.number}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">Expiry Date</label>
                      <input
                        type="text"
                        readOnly
                        value={cardData.expiry}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 ml-1">CVV</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={cardData.cvv}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-900 font-mono"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || verifying || !paymentId}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-sky-600 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${amount}`
                    )}
                  </button>
                </form>
              </div>

              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs uppercase tracking-widest font-bold">
                <Activity className="w-4 h-4" />
                Health Horizon Trust Link
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentProcess;
