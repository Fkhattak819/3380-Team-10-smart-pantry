import React from 'react';

export default function CartModal({ isOpen, cart = [], onClose, onClearCart, onRemoveItem }) {
  if (!isOpen) return null;
  const items = Array.isArray(cart) ? cart : [];

  const formatName = (name) => String(name).replace(/_/g, ' ');

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={() => onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-200 px-5 py-3.5">
          <h2 className="text-lg font-semibold text-slate-900">Shopping Cart</h2>
          <button
            type="button"
            onClick={() => onClose()}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Cart is empty</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <li
                  key={`${String(item)}-${i}`}
                  className="py-2.5 text-sm text-slate-800 flex items-center justify-between"
                >
                  <span className="font-medium">{formatName(item)}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item)}
                    className="text-slate-400 hover:text-slate-700 text-lg"
                    aria-label={`Remove ${formatName(item)}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200 px-5 py-3 flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => onClearCart()}
            className="px-3 py-1.5 rounded-md bg-rose-500 text-white text-xs font-medium hover:bg-rose-600"
          >
            Clear cart
          </button>
          <button
            type="button"
            onClick={() => onClose()}
            className="px-3 py-1.5 rounded-md bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}