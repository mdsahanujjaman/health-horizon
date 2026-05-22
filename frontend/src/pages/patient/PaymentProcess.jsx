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
  QrCode,
  Landmark,
  Wallet,
  Smartphone,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import PatientSidebar from '../../components/PatientSidebar';
import { playPaymentSuccessSound, playTapSound } from '../../utils/audio';

const PaymentProcess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId, amount, doctorName } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  // Dynamic Payment States
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'wallet'
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [cardHolder, setCardHolder] = useState('Test User');

  const [cardData] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '999',
  });

  useEffect(() => {
    if (!appointmentId) {
      navigate('/patient/dashboard');
      return;
    }

    const initPayment = async () => {
      try {
        const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
        const res = await api.post('/payments', {
          appointmentId: parseInt(appointmentId),
          amount: numericAmount || 50.00,
          currency: 'USD'
        });
        setPaymentId(res.data.id);
      } catch (err) {
        console.error('Failed to initiate payment', err);
      }
    };

    initPayment();
  }, [appointmentId, amount, navigate]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    let method = 'CARD';
    if (activeTab === 'upi') method = 'UPI';
    if (activeTab === 'netbanking') method = 'NETBANKING';
    if (activeTab === 'wallet') method = 'WALLET';

    // Simulate network delay
    setTimeout(async () => {
      try {
        await api.put(`/payments/${paymentId}/complete`, {
          transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
          paymentMethod: method
        });
        setLoading(false);
        setVerifying(true);

        // Simulate verification delay
        setTimeout(() => {
          setVerifying(false);
          setSuccess(true);
          playPaymentSuccessSound();
        }, 2000);
      } catch (err) {
        console.error('Payment failed', err);
        setLoading(false);
      }
    }, 1500);
  };

  const handleVerifyUpi = (e) => {
    e.preventDefault();
    if (!upiId.includes('@')) return;
    setUpiVerified(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <PatientSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center scale-up-center animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 font-medium mb-8 text-sm">
              Your appointment with <strong>Dr. {doctorName}</strong> has been secured successfully.
            </p>
            <button
              onClick={() => {
                playTapSound();
                navigate('/patient/dashboard');
              }}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:bg-slate-800 transition-all"
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
        <div className="max-w-4xl mx-auto space-y-6">
          <button
            onClick={() => {
              playTapSound();
              navigate(-1);
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-950 font-bold text-sm transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Cancel and return
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Summary Pane */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-wider">Checkout</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-400">Consultation</span>
                    <span className="text-slate-800">Dr. {doctorName}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-400">Status</span>
                    <span className="text-emerald-500 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">Live Secure</span>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <span className="text-2xl font-black text-primary leading-none">{amount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-sky-50 p-6 rounded-[2rem] border border-indigo-100/50">
                <div className="flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                  <div className="text-[11px] text-indigo-900 font-medium leading-relaxed">
                    This session is protected by Health Horizon virtual environment. No real funds are moved or stored.
                  </div>
                </div>
              </div>
            </div>

            {/* Right Gateway Panel */}
            <div className="lg:col-span-8 space-y-6">
              {/* Payment Tab Headers */}
              <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-4 gap-1.5">
                {[
                  { id: 'card', label: 'Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI', icon: QrCode },
                  { id: 'netbanking', label: 'Net Banking', icon: Landmark },
                  { id: 'wallet', label: 'Wallets', icon: Wallet }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        playTapSound();
                        setActiveTab(tab.id);
                      }}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${active ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Details Card */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden min-h-[350px]">
                {verifying && (
                  <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center backdrop-blur-sm animate-fade-in">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <h3 className="text-lg font-black text-slate-900">Verifying payment gateway...</h3>
                    <p className="text-sm text-slate-500 font-medium">Securing appointment locks</p>
                  </div>
                )}

                {/* Card Option Render */}
                {activeTab === 'card' && (
                  <div className="space-y-8">
                    {/* Glowing Credit Card Mockup */}
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-indigo-950/20 group hover:scale-[1.02] transition-transform duration-300">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none"></div>
                      
                      <div className="flex justify-between items-start mb-10">
                        <div>
                          <h4 className="text-xs font-black tracking-[0.2em] text-slate-400 uppercase">Health Horizon</h4>
                          <span className="text-[8px] font-bold text-primary tracking-widest uppercase">Premium Card</span>
                        </div>
                        {/* Gold Microchip Mockup */}
                        <div className="w-10 h-8 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-lg shadow-inner flex flex-col justify-between p-1.5 opacity-90 border border-yellow-200">
                          <div className="w-full h-px bg-yellow-600/30"></div>
                          <div className="w-full h-px bg-yellow-600/30"></div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-xl sm:text-2xl font-black font-mono tracking-widest text-slate-100">
                          {cardData.number}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Card Holder</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{cardHolder}</span>
                          </div>
                          <div>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Expires</span>
                            <span className="text-xs font-bold font-mono">{cardData.expiry}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Card Holder Name</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="e.g. Test User"
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                          <input
                            type="text"
                            readOnly
                            value={cardData.expiry}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-semibold font-mono text-sm cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                          <div className="relative">
                            <input
                              type="password"
                              readOnly
                              value={cardData.cvv}
                              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-semibold font-mono text-sm cursor-not-allowed"
                            />
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !paymentId}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Secure Card...
                          </>
                        ) : (
                          `Pay ${amount}`
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* UPI Option Render */}
                {activeTab === 'upi' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-950">Pay using UPI Gateway</h3>
                    
                    {/* Visual QR Code Generator */}
                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-100 mb-6">
                      <div className="relative w-40 h-40 bg-white p-3 rounded-2xl shadow-md border border-slate-200/50 flex flex-col justify-between items-center group hover:scale-105 transition-transform duration-300">
                        {/* QR Corners */}
                        <div className="absolute top-3 left-3 w-8 h-8 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-slate-900 rounded-sm"></div>
                        </div>
                        <div className="absolute top-3 right-3 w-8 h-8 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-slate-900 rounded-sm"></div>
                        </div>
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-4 border-slate-900 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-slate-900 rounded-sm"></div>
                        </div>
                        {/* QR Grid Dot Pattern */}
                        <div className="grid grid-cols-6 gap-1.5 w-full h-full opacity-85 pl-9 pt-9 pr-1 pb-1">
                          {[...Array(24)].map((_, i) => (
                            <div key={i} className={`rounded-sm ${(i % 2 === 0 || i % 5 === 0) ? 'bg-slate-900' : 'bg-transparent'} w-full h-full`} style={{ minHeight: '8px' }}></div>
                          ))}
                        </div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">Scan using GPay, PhonePe, or Paytm</p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Or Enter UPI ID</label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => {
                                setUpiId(e.target.value);
                                setUpiVerified(false);
                              }}
                              placeholder="e.g. testuser@upi"
                              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                              required
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyUpi}
                            disabled={!upiId.includes('@')}
                            className={`px-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${upiVerified ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {upiVerified ? 'Verified ✓' : 'Verify'}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !paymentId || (!upiVerified && upiId !== '')}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Awaiting UPI confirmation...
                          </>
                        ) : (
                          `Pay ${amount} securely`
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Net Banking Option Render */}
                {activeTab === 'netbanking' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-950">Select Your Bank</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
                        { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
                        { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
                        { id: 'axis', name: 'Axis Bank', code: 'AXIS' }
                      ].map((bank) => (
                        <div
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className={`p-4 rounded-2xl border cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden flex flex-col justify-between h-20 ${selectedBank === bank.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`w-3 h-3 rounded-full ${selectedBank === bank.id ? 'bg-primary' : 'bg-slate-200'}`}></span>
                            <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{bank.code}</span>
                          </div>
                          <span className="font-bold text-xs text-slate-800 leading-tight">{bank.name}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Other Bank Services</label>
                        <select 
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        >
                          <option value="">Choose another bank...</option>
                          <option value="kotak">Kotak Mahindra Bank</option>
                          <option value="pnb">Punjab National Bank</option>
                          <option value="yes">Yes Bank</option>
                          <option value="bob">Bank of Baroda</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !paymentId || !selectedBank}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Routing to secure bank...
                          </>
                        ) : (
                          `Proceed to Secure Bank`
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Wallets Option Render */}
                {activeTab === 'wallet' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-950">Select Digital Wallet</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'gpay', name: 'Google Pay', label: 'GPAY' },
                        { id: 'phonepe', name: 'PhonePe', label: 'PHONEPE' },
                        { id: 'paytm', name: 'Paytm Wallet', label: 'PAYTM' },
                        { id: 'apple', name: 'Apple Pay', label: 'APPLE PAY' }
                      ].map((wallet) => (
                        <div
                          key={wallet.id}
                          onClick={() => setSelectedWallet(wallet.id)}
                          className={`p-4 rounded-2xl border cursor-pointer hover:border-primary/50 transition-all flex items-center justify-between h-16 ${selectedWallet === wallet.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-slate-100 bg-white hover:bg-slate-50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${selectedWallet === wallet.id ? 'bg-primary' : 'bg-slate-200'}`}></span>
                            <span className="font-bold text-xs text-slate-800">{wallet.name}</span>
                          </div>
                          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">{wallet.label}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handlePayment} className="space-y-4">
                      <button
                        type="submit"
                        disabled={loading || !paymentId || !selectedWallet}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Connecting wallet provider...
                          </>
                        ) : (
                          `Pay with Wallet`
                        )}
                      </button>
                    </form>
                  </div>
                )}

              </div>

              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs uppercase tracking-widest font-black">
                <Activity className="w-4 h-4 text-primary" />
                Health Horizon Gateway Link
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentProcess;
