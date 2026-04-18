import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft, ShieldCheck, Check, CreditCard } from 'lucide-react';
import { getStoredToken, setStoredAuth } from '../utils/auth';
import { useRole } from '../context/RoleContext';

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
      <div className="p-8 max-w-3xl mx-auto animate-pulse flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
      </div>
    );
  }

  if (!planDetails) {
    return (
      <div className="p-8 max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Plan Details Unavailable</h2>
        <p className="text-gray-500 mb-6">{message || "We couldn't load the plan you selected."}</p>
        <button onClick={() => navigate('/dashboard/billing')} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm transition-colors">
          Return to Billing
        </button>
      </div>
    );
  }

  // Ensure vibrant UI styling matches the rest of the application
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button 
        onClick={() => navigate('/dashboard/billing')}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Plans
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Left Column: Order Summary */}
        <div>
          <h1 className="text-3xl font-headline font-extrabold text-gray-900 dark:text-white mb-2">Checkout</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">You are upgrading your workspace to the {planDetails.name} tier.</p>

          <div className="bg-[var(--surface-color)] border border-[var(--border-color)] p-6 rounded-3xl shadow-[var(--shadow-vibrant)] mb-6">
            <h3 className="font-headline text-xl font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
            <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-300 font-medium">IntelliScan {planDetails.name} Subscription</span>
              <span className="font-bold text-gray-900 dark:text-white">₹{planDetails.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4 text-sm">
              <span className="text-gray-500">Taxes & Fees</span>
              <span className="text-gray-500">Included</span>
            </div>
            <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Total Due Today</span>
              <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">₹{planDetails.price.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
            <ShieldCheck className="text-emerald-500 shrink-0 mt-0.5" size={24} />
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-1">Secure Transaction</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
                Your payment is processed securely via Razorpay with 256-bit AES encryption. We do not store your full card details.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form Panel */}
        <div className="flex flex-col">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 shadow-xl flex-1 flex flex-col">
            <div className="mb-8 hidden md:flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <CreditCard className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Payment Method</h3>
                <p className="text-xs text-gray-500">Cards, UPI & Net Banking</p>
              </div>
            </div>

            {message && (
              <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-200 dark:border-red-800 rounded-xl">
                {message}
              </div>
            )}

            <div className="space-y-4 mb-8 flex-1">
               <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <Check size={16} className="text-emerald-500" /> Instant account upgrade
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <Check size={16} className="text-emerald-500" /> Automated billing invoice emailed
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-950 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <Check size={16} className="text-emerald-500" /> Unlock all {planDetails.name} features instantly
                  </li>
               </ul>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={processing}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:scale-100 active:scale-95"
            >
              {processing ? (
                <><RefreshCw size={18} className="animate-spin" /> Processing Securely...</>
              ) : (
                <>Pay ₹{planDetails.price.toLocaleString()} via Razorpay</>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-4">By proceeding to payment, you agree to our Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
