'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Truck, Mail } from 'lucide-react';
import { ordersAPI } from '@/lib/api';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      ordersAPI.getOne(orderId).then(res => setOrder(res.data.order)).catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      {/* Success icon */}
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle size={48} className="text-green-500" />
        </div>
      </div>

      <h1 className="font-display text-4xl mb-3">Order Confirmed!</h1>
      <p className="text-gray-400 text-sm mb-8">
        Thank you for your purchase. We've received your order and will begin processing it shortly.
      </p>

      {order && (
        <div className="bg-brand-beige p-6 mb-8 text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Order Number</p>
              <p className="font-mono font-medium text-lg">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Total</p>
              <p className="font-medium text-lg">${order.total?.toFixed(2)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-400 tracking-widest uppercase mb-3">Items</p>
            <div className="space-y-2">
              {order.items?.map((item: any) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>{item.name} ({item.size}) × {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Mail, title: 'Confirmation Email', desc: "Check your inbox for order details" },
          { icon: Package, title: 'Processing', desc: "We'll prepare your items within 1-2 days" },
          { icon: Truck, title: 'Shipping', desc: "Delivery in 3-5 business days" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 p-4">
            <Icon size={24} className="text-brand-gold mx-auto mb-3" />
            <p className="font-medium text-sm mb-1">{title}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/account/orders" className="btn-primary">
          View My Orders
        </Link>
        <Link href="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
