import React from 'react';

// Updated to display simple ingredient names (strings)
export default function CartModal({ isOpen, cart = [], onClose, onClearCart, onRemoveItem }) {
  if (!isOpen) return null;
  const items = Array.isArray(cart) ? cart : [];

  const formatName = (name) => name.replace(/_/g, ' ');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={() => onClose()}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-xl font-semibold text-green-600">Shopping Cart</h2>
          <button type="button" onClick={() => onClose()} className="text-gray-500 text-2xl">×</button>
        </div>

        <div className="p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <p className="text-sm text-gray-600 text-center">Cart is empty</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item, i) => (
                <li key={`${String(item)}-${i}`} className="py-2 text-sm text-gray-800 flex items-center justify-between">
                  {/* Item is a simple string now */}
                  <span className="font-medium">{formatName(item)}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item)} // Pass the ingredient name string for removal
                    className="text-gray-500 text-base hover:text-gray-700"
                    aria-label={`Remove ${formatName(item)}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t p-4 flex justify-end space-x-2">
          <button type="button" onClick={() => onClearCart()} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Clear Cart</button>
          <button type="button" onClick={() => onClose()} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Close</button>
        </div>
      </div>
    </div>
  );
}