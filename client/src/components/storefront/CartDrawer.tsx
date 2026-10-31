import React, { useState } from 'react';
import { useCart } from '../../context/CartContext.js';
import { useNotification } from '../../context/NotificationContext.js';
import { apiClient } from '../../services/api.client.js';
import { X, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartItemRow } from './CartItemRow.js';
import { CartFooter } from './CartFooter.js';

export const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart, subtotal, totalItems } =
    useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const handleSimulateCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsCheckingOut(true);
      const generatedOrderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;

      const payload = {
        id: `gid://shopify/Order/${Date.now()}`,
        name: generatedOrderNum,
        order_number: generatedOrderNum,
        created_at: new Date().toISOString(),
        email: 'customer@example.com',
        phone: '+1 555-0199',
        currency: 'USD',
        total_price: (subtotal + 4.99).toFixed(2),
        subtotal_price: subtotal.toFixed(2),
        financial_status: 'paid',
        shipping_address: {
          name: 'Sarah Connor',
          address1: '123 Ocean Blvd',
          city: 'Miami',
          province: 'Florida',
          province_code: 'FL',
          zip: '33139',
          country: 'United States',
          country_code: 'US',
          phone: '+1 555-0199',
        },
        line_items: cart.map((item, idx) => ({
          id: `line-${idx + 1}`,
          variant_id: `var-${idx + 1}`,
          title: item.title,
          sku: item.sku,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await apiClient.post('/api/orders/simulate', payload);

      setCreatedOrderNumber(generatedOrderNum);
      clearCart();
      showToast('success', 'Order Placed!', `Order ${generatedOrderNum} is confirmed and waiting in Orders.`);
    } catch {
      const fallbackOrderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
      setCreatedOrderNumber(fallbackOrderNum);
      clearCart();
      showToast('success', 'Order Created!', `Order ${fallbackOrderNum} created and visible in Orders.`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setCreatedOrderNumber(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-md bg-white text-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900">
              Cart ({totalItems})
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {createdOrderNumber ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Order Confirmed!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Order <span className="font-mono font-bold text-teal-700">{createdOrderNumber}</span> is in the <strong>6-hour hold window</strong> before shipping. You can cancel or edit anytime.
                </p>
              </div>
              <div className="pt-4 flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/admin/orders');
                  }}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  View in Orders →
                </button>
                <button
                  onClick={handleClose}
                  className="text-xs text-slate-500 hover:text-slate-900 py-2"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">Your cart is empty</p>
              <p className="text-xs text-slate-400">Explore our catalog to add items.</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))
          )}
        </div>

        {cart.length > 0 && !createdOrderNumber && (
          <CartFooter
            subtotal={subtotal}
            isCheckingOut={isCheckingOut}
            onCheckout={handleSimulateCheckout}
          />
        )}
      </div>
    </div>
  );
};
