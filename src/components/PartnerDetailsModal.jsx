import React from 'react';
import { X, Download, FileText, Package, Truck, CheckCircle2, MapPin, Phone, Mail } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PartnerDetailsModal({ partner, onClose }) {
  const { orders } = useStore();

  if (!partner) return null;

  // Find all orders assigned to this delivery partner's email
  const partnerOrders = orders.filter(o => o.deliveryPartnerEmail === partner.email);
  const activeOrders = partnerOrders.filter(o => o.status === 'Out for Delivery');
  const completedOrders = partnerOrders.filter(o => o.status === 'Delivered');

  const exportToExcel = () => {
    const data = partnerOrders.map(o => ({
      "Order ID": o.id,
      "Date": o.date,
      "Customer Name": o.customer?.name || 'N/A',
      "Customer Phone": o.customer?.phone || 'N/A',
      "Delivery Address": o.customer ? `${o.customer.street}, ${o.customer.city} - ${o.customer.pincode}` : 'N/A',
      "Status": o.status,
      "Amount (Rs)": o.total,
      "Payment Method": o.paymentMethod
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
    XLSX.writeFile(wb, `${partner.name.replace(/\s+/g, '_')}_Deliveries.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Delivery Partner Report`, 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Name: ${partner.name}`, 14, 25);
    doc.text(`Email: ${partner.email}`, 14, 31);
    doc.text(`Phone: ${partner.phone}`, 14, 37);
    doc.text(`Total Deliveries Assigned: ${partnerOrders.length}`, 14, 43);

    const tableData = partnerOrders.map(o => [
      o.id, 
      o.date, 
      o.customer?.name || 'N/A', 
      o.customer?.phone || 'N/A', 
      o.status, 
      `Rs. ${o.total}`
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Order ID', 'Date', 'Customer', 'Phone', 'Status', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] } // Blue-600
    });

    doc.save(`${partner.name.replace(/\s+/g, '_')}_Deliveries.pdf`);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
        
        {/* Modal Container */}
        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-black uppercase">
                {partner.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">{partner.name}</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1"><Phone size={12}/> {partner.phone}</span>
                  <span className="flex items-center gap-1"><Mail size={12}/> {partner.email}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors shadow-sm border border-slate-200">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white custom-scrollbar">
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-center">
                <Package size={24} className="text-blue-500 mb-2"/>
                <span className="text-3xl font-black text-blue-700">{partnerOrders.length}</span>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">Total Assigned</span>
              </div>
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center justify-center text-center">
                <Truck size={24} className="text-orange-500 mb-2"/>
                <span className="text-3xl font-black text-orange-700">{activeOrders.length}</span>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider mt-1">On The Way</span>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100 flex flex-col items-center justify-center text-center">
                <CheckCircle2 size={24} className="text-green-500 mb-2"/>
                <span className="text-3xl font-black text-green-700">{completedOrders.length}</span>
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Delivered</span>
              </div>
            </div>

            {/* Order Table */}
            <div>
              <h3 className="font-bold text-lg text-slate-800 mb-4">Delivery History</h3>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer Info</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {partnerOrders.length > 0 ? partnerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-bold text-blue-600">{order.id}</td>
                        <td className="p-4"><p className="font-bold">{order.customer?.name}</p><p className="text-xs text-slate-500">{order.customer?.street}</p></td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{order.status}</span></td>
                        <td className="p-4 text-right font-black">₹{order.total}</td>
                      </tr>
                    )) : <tr><td colSpan="4" className="p-8 text-center text-slate-400">No deliveries assigned yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button onClick={exportToExcel} disabled={partnerOrders.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-bold rounded-xl transition-colors disabled:opacity-50"><FileText size={18}/> Export Excel</button>
            <button onClick={exportToPDF} disabled={partnerOrders.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-xl transition-colors disabled:opacity-50"><Download size={18}/> Export PDF</button>
          </div>
        </div>
      </div>
    </>
  );
}