import apiClient from '../api/client';
import { setStoredAuth } from './auth';

/**
 * Professional Checkout Service
 * Manages the Razorpay integration lifecycle.
 */
class CheckoutService {
  constructor() {
    this.scriptLoaded = false;
  }

  /**
   * Dynamically loads the Razorpay SDK
   */
  loadRazorpay() {
    return new Promise((resolve) => {
      if (this.scriptLoaded) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Starts the checkout process for a specific plan
   */
  async handleUpgrade(planId, onStatusChange) {
    onStatusChange?.('Initializing checkout...');
    
    // 1. Ensure Razorpay is loaded
    const loaded = await this.loadRazorpay();
    if (!loaded) {
      throw new Error('Failed to load payment gateway. Please check your internet connection.');
    }

    // 2. Create the Order on the backend
    onStatusChange?.('Generating order...');
    const orderRes = await apiClient.post('/billing/create-order', { plan: planId });
    const { simulated, key_id, order_id, amount, currency, plan_name } = orderRes.data;

    // 3. Handle Razorpay Gateway
    return new Promise((resolve, reject) => {
      onStatusChange?.('Opening secure payment portal...');
      
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'IntelliScan AI',
        description: `Upgrade to ${plan_name}`,
        image: 'https://intelliscan.ai/logo.png', // Optional
        order_id: order_id,
        handler: async (response) => {
          onStatusChange?.('Verifying transaction...');
          try {
            const verifyRes = await apiClient.post('/billing/verify-payment', {
              plan: planId,
              order_id: order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            
            if (verifyRes.data.success) {
              setStoredAuth({ token: verifyRes.data.token, user: verifyRes.data.user });
              resolve({ success: true, message: verifyRes.data.message });
            } else {
              reject(new Error(verifyRes.data.error || 'Verification failed'));
            }
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name: '', 
          email: '',
          contact: ''
        },
        theme: {
          color: '#4f46e5'
        },
        modal: {
          ondismiss: () => {
            onStatusChange?.(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        reject(new Error(`Payment Failed: ${response.error.description}`));
      });
      rzp.open();
    });
  }
}

export default new CheckoutService();
