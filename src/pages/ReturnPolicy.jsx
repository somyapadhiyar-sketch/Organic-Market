import React, { useLayoutEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldAlert } from 'lucide-react';

export default function ReturnPolicy() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-[140px] pb-12">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
            <ShieldAlert size={40} className="text-orange-500 shrink-0" />
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Return Policy
            </h1>
          </div>
          <div className="prose prose-lg max-w-none text-slate-700 font-medium leading-relaxed space-y-4">
            <p>
              At Zesty, we are committed to providing you with the freshest and highest quality organic products. Due to the perishable and consumable nature of our groceries, <strong>we do not accept returns</strong>.
            </p>
            <h2 className="font-bold text-slate-800 !mb-2 !mt-8">No Return Policy</h2>
            <p>
              Once an order has been successfully delivered, it cannot be returned. There is no return option available on our platform for any product category (including fruits, vegetables, pulses, and oils).
            </p>
            <h3 className="font-bold text-slate-800 !mb-2 !mt-6">Damaged, Opened, or Improper Products</h3>
            <p>
              While we do not accept returns, your satisfaction is our priority. If you receive a product that is damaged, already opened, expired, or not proper for consumption, please reach out to us immediately. 
            </p>
            <p>
              Our customer support team will assist you in resolving the issue, which may include a replacement or refund depending on the situation. Please contact us within 24 hours of delivery with details and photos of the item in question.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}