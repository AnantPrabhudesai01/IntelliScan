import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, ShieldCheck, Check, CreditCard } from 'lucide-react';
import { getStoredToken, setStoredAuth } from '../utils/auth';
import { useRole } from '../context/RoleContext';
import { formatCurrency, CURRENCY_SYMBOL } from '../utils/currency';

export default function CheckoutPage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { refreshAuth } = useRole();
  const [loading, setLoading] = useState(true);
  const [planDetails, setPlanDetails] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch plan details to show pricing
    const loadPlan = async () => {
      try {
        const res = await fetch('/api/billing/plans');
        if (res.ok) {
          const data = await res.json();
          const found = data.plans?.find(p => p.id === planId);
          if (found) setPlanDetails(found);
          else setMessage('Invalid plan selected.');
        }
      } catch (err) {
        console.error('Failed to load plans:', err);
      }
      setLoading(false);
    };
    loadPlan();
  }, [planId]);

  const handlePayment = async () => {
    setProcessing(true);
    setMessage('');
    try {
      const liveToken = getStoredToken();
      const headers = { Authorization: `Bearer ${liveToken}`, 'Content-Type': 'application/json' };
      
      const orderRes = await fetch('/api/billing/create-order', { 
        method: 'POST', 
        headers: headers, 
        body: JSON.stringify({ plan: planId }) 
      });
      const orderPayload = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) throw new Error(orderPayload?.error || 'Failed to create payment order');
      const order = orderPayload;

      const isSimulated = order.key_id === 'simulated_key';

      const applyVerifyResult = (result) => {
        if (result?.token && result?.user) {
          setStoredAuth({ token: result.token, user: result.user });
          refreshAuth?.();
          // Redirect back to dashboard successfully
          navigate('/dashboard', { state: { upgradeSuccess: true, plan: planId } });
        }
      };

      if (isSimulated) {
        // Handle simulation on client side
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/billing/verify-payment', {
              method: 'POST', headers,
              body: JSON.stringify({ 
                order_id: order.order_id, 
                simulated: true,
                plan: planId 
              })
            });
            const result = await verifyRes.json();
            if (verifyRes.ok) applyVerifyResult(result);
            else {
               setMessage(result.error);
               setProcessing(false);
            }
          } catch (e) {
            setMessage('Simulation verification failed.');
            setProcessing(false);
          }
        }, 2000);
        return;
      }

      const razorpayOptions = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'IntelliScan Premium',
        description: `Upgrade to ${order.plan_name}`,
        order_id: order.order_id,
        handler: async (response) => {
          const verifyRes = await fetch('/api/billing/verify-payment', {
            method: 'POST', headers,
            body: JSON.stringify({ 
              order_id: order.order_id, 
              payment_id: response.razorpay_payment_id, 
              signature: response.razorpay_signature, 
              plan: planId 
            })
          });
          const result = await verifyRes.json().catch(() => ({}));
          if (verifyRes.ok) {
            applyVerifyResult(result);
          } else {
            setMessage(result?.error || 'Payment verification failed.');
            setProcessing(false);
          }
        }
      };

      if (window.Razorpay) {
        new window.Razorpay(razorpayOptions).open();
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => new window.Razorpay(razorpayOptions).open();
        document.body.appendChild(script);
      }
    } catch (err) {
      if (err.message === 'RAZORPAY_NOT_CONFIGURED') {
         setMessage('Payment gateway not configured. Contact admin for setup.');
      } else {
         setMessage(`Error: ${err.message}`);
      }
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-12 h-12 text-[var(--brand)] animate-spin mb-4" />
        <div className="h-4 w-48 bg-[var(--surface)] rounded animate-pulse"></div>
      </div>
    );
  }

  if (!planDetails) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-headline font-black italic tracking-tighter text-[var(--text-main)] mb-4 uppercase">Node Unavailable</h2>
        <p className="text-[var(--text-muted)] mb-8 font-medium">{message || "We couldn't load the plan you selected."}</p>
        <button onClick={() => navigate('/dashboard/billing')} className="px-10 py-4 bg-[var(--surface)] hover:bg-[var(--surface-card)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm">
          Return to Infrastructure
        </button>
      </div>
    );
  }

  // Ensure vibrant UI styling matches the rest of the application
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 animate-fade-in">
      <button 
        onClick={() => navigate('/dashboard/billing')}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--brand)] transition-all mb-12 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Matrix
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
        {/* Left Column: Order Summary */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-headline font-black italic text-[var(--text-main)] tracking-tighter uppercase leading-tight">Architecture <br/>Commit</h1>
            <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed max-w-md">Finalizing the deployment of your <strong>{planDetails.name}</strong> workspace node.</p>
          </div>

          <div className="bg-[var(--surface-card)] border border-[var(--border-subtle)] p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group premium-grain">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <CreditCard size={140} />
            </div>
            
            <h3 className="font-headline text-xl font-black italic tracking-tighter text-[var(--text-main)] mb-8 uppercase">Order Manifest</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center py-4 border-b border-[var(--border-subtle)]">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-[var(--brand)] uppercase tracking-widest">Master Pipeline</p>
                  <p className="text-sm font-black italic tracking-tight text-[var(--text-main)] uppercase font-headline">IntelliScan {planDetails.name}</p>
                </div>
                <span className="font-headline font-black text-lg text-[var(--text-main)]">{CURRENCY_SYMBOL}{formatCurrency(planDetails.price)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                <span>Infrastructure Tax</span>
                <span>Included</span>
              </div>
              
              <div className="pt-8 mt-2 border-t border-[var(--border-strong)] flex justify-between items-end">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] pb-1">Atomic Total</span>
                <span className="text-4xl font-headline font-black italic text-[var(--brand)] tracking-tighter">{CURRENCY_SYMBOL}{formatCurrency(planDetails.price)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-5 p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-label">Vault Secured</p>
              <p className="text-[11px] text-emerald-500/70 leading-relaxed font-medium">
                End-to-end 256-bit AES encryption via Razorpay Gateway. Personal data is never stored on persistent nodes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form Panel */}
        <div className="flex flex-col">
          <div className="bg-[var(--surface-card)] rounded-[2.5rem] border border-[var(--border-subtle)] p-10 md:p-14 shadow-2xl flex-1 flex flex-col relative overflow-hidden premium-grain">
             {/* Subtle Glow */}
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-[var(--brand)]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="mb-12 hidden md:flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 bg-[var(--brand)]/10 rounded-[1.25rem] flex items-center justify-center text-[var(--brand)] shadow-inner">
                <CreditCard size={32} />
              </div>
              <div>
                <h3 className="font-headline font-black italic text-xl text-[var(--text-main)] uppercase tracking-tight">Payment Access</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Card, UPI & Digital Wallets</p>
              </div>
            </div>

            {message && (
              <div className="mb-8 px-6 py-4 bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 rounded-2xl animate-shake relative z-10">
                {message}
              </div>
            )}

            <div className="space-y-4 mb-12 flex-1 relative z-10">
               <ul className="space-y-3">
                  {[
                    `Instant ${planDetails.name} authorization`,
                    "Commence AI follow-up workflows",
                    "Automated tax manifest emailed",
                    "Infinite OCR pipeline active"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] bg-[var(--surface)]/50 p-4 rounded-2xl border border-[var(--border-subtle)] hover:bg-[var(--surface)] transition-all group">
                      <div className="p-1 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform"><Check size={10} className="text-white" strokeWidth={4} /></div>
                      {item}
                    </li>
                  ))}
               </ul>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={processing}
              className="w-full py-6 bg-[var(--brand)] text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-[var(--brand)]/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 relative z-10 flex items-center justify-center gap-3 italic"
            >
              {processing ? (
                <><RefreshCw size={20} className="animate-spin" /> Committing Architecture...</>
              ) : (
                <>Deploy Infrastructure {CURRENCY_SYMBOL}{formatCurrency(planDetails.price)}</>
              )}
            </button>
            <p className="text-center text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-6 relative z-10 opacity-50">Handcrafted Protocol • Subject to Terms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
