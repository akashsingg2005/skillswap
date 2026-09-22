/**
 * Razorpay Test Mode Payment Handler
 */

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function initiatePayment(bookingId, amount, clientName = '', clientEmail = '', onSuccess = null) {
  try {
    showToast('Initializing payment checkout...', 'warning');

    const orderRes = await api.createPaymentOrder(bookingId, amount);

    if (!orderRes.success) {
      showToast(orderRes.message || 'Payment initiation failed', 'danger');
      return;
    }

    const orderData = orderRes.data;

    if (orderData.isDemo) {
      showDemoPaymentModal(bookingId, amount, orderData.orderId, onSuccess);
      return;
    }

    await loadRazorpayScript();

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'SkillSwap Marketplace',
      description: 'Creator Service Booking Payment',
      order_id: orderData.orderId,
      prefill: {
        name: clientName,
        email: clientEmail,
      },
      theme: {
        color: '#6366f1',
      },
      handler: async function (response) {
        showToast('Verifying payment signature with backend...', 'warning');
        
        const verifyRes = await api.verifyPayment({
          bookingId,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });

        if (verifyRes.success) {
          showToast('✓ Payment successful! Booking is marked as Paid.', 'success');
          if (typeof onSuccess === 'function') onSuccess(verifyRes.data);
        } else {
          showToast(verifyRes.message || 'Payment verification failed', 'danger');
        }
      },
      modal: {
        ondismiss: function () {
          showToast('Payment checkout canceled.', 'warning');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment error:', err);
    showToast('Error during payment processing', 'danger');
  }
}

function showDemoPaymentModal(bookingId, amount, orderId, onSuccess) {
  const existing = document.getElementById('demo-payment-modal');
  if (existing) existing.remove();

  const modalHtml = `
    <div class="modal-overlay active" id="demo-payment-modal">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">💳 Razorpay Test Mode Checkout</h3>
          <button class="close-btn" onclick="document.getElementById('demo-payment-modal').remove()">×</button>
        </div>
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="font-size: 0.85rem; color: #a5b4fc; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); padding: 0.5rem 1rem; border-radius: 20px; display: inline-block; margin-bottom: 1rem;">
            Test Mode Fallback
          </div>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 0.5rem;">Amount to Pay</p>
          <h2 style="font-size: 2.2rem; font-weight: 800; color: var(--text-primary);">${formatCurrency(amount)}</h2>
          <p style="color: var(--text-muted); font-size: 0.8rem; margin-top: 0.5rem;">Order ID: ${orderId}</p>
        </div>
        <div style="background: var(--bg-main); border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.85rem; color: var(--text-secondary);">
          <strong style="color: var(--text-primary);">Note:</strong> Click below to simulate instant payment verification.
        </div>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" style="flex: 1;" id="confirm-test-payment-btn">
            ✓ Pay & Complete Booking
          </button>
          <button class="btn btn-secondary" onclick="document.getElementById('demo-payment-modal').remove()">
            Cancel
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('confirm-test-payment-btn').addEventListener('click', async () => {
    document.getElementById('confirm-test-payment-btn').disabled = true;
    document.getElementById('confirm-test-payment-btn').innerText = 'Verifying Payment...';

    const verifyRes = await api.verifyPayment({
      bookingId,
      razorpay_order_id: orderId,
      razorpay_payment_id: `pay_demo_${Date.now()}`,
      razorpay_signature: 'demo_test_signature',
    });

    document.getElementById('demo-payment-modal').remove();

    if (verifyRes.success) {
      showToast('✓ Payment successful! Booking updated to Paid.', 'success');
      if (typeof onSuccess === 'function') onSuccess(verifyRes.data);
    } else {
      showToast('Payment verification error', 'danger');
    }
  });
}
