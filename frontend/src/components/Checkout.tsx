'use client';

import { useState } from 'react';
import axios from 'axios';
import { ShoppingCart, CreditCard, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSnap } from '../hooks/useSnap';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface SnapResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
}

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const { snap, snapEmbed } = useSnap();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payment/charge', {
        amount: 50000,
        item_details: [
          {
            id: 'ITEM1',
            price: 50000,
            quantity: 1,
            name: 'Midtrans Sims Item',
          },
        ],
        customer_details: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '08123456789',
        },
      });

      const { token } = response.data;

      if (snap) {
        snap.pay(token, {
          onSuccess: function (result: SnapResult) {
            alert('Payment Success!');
            console.log(result);
          },
          onPending: function (result: SnapResult) {
            alert('Waiting for payment!');
            console.log(result);
          },
          onError: function (result: SnapResult) {
            alert('Payment Failed!');
            console.log(result);
          },
          onClose: function () {
            alert('You closed the popup without finishing the payment');
          },
        });
      } else {
        alert('Snap.js is not loaded yet. Please try again.');
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {snapEmbed}
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-80" />
          <h1 className="text-2xl font-bold">Midtrans Store</h1>
          <p className="opacity-80">Simulation Checkout</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Premium Subscription</h3>
                <p className="text-sm text-gray-500">1 Month Access</p>
              </div>
              <span className="font-bold text-gray-900">IDR 50.000</span>
            </div>

            <div className="flex justify-between items-center text-lg font-bold pt-2">
              <span>Total</span>
              <span className="text-indigo-600">IDR 50.000</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || !snap}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all transform active:scale-95',
              loading || !snap
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg',
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay Now
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-400 mt-4">
            Secure payment powered by Midtrans
          </p>
        </div>
      </div>
    </>
  );
}
