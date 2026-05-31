import React, { useEffect, useState, useLayoutEffect } from"react";
import { Link, useNavigate, useLocation } from"react-router-dom";
import { useStore } from"../context/StoreContext";
import Navbar from"../components/Navbar";
import { ShoppingBag, Package, CreditCard, Motorbike, Search as SearchIcon, Phone, Tag, Download } from 'lucide-react'; 
import Footer from"../components/Footer";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function Orders() {
  const navigate = useNavigate();
  const { currentUser, orders, addToCart, showToast, products } = useStore();
  const { pathname } = useLocation();
  const [userOrders, setUserOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState({});

  const filterOptions = ["All","Out for Delivery","Pending","Delivered","Cancelled"];

  useEffect(() => {
    if (!currentUser) {
      navigate("/login/user", { state: { from: '/user/orders' } });
      return;
    }
    if (currentUser.role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    } else if (currentUser.role === 'delivery') {
      navigate('/delivery', { replace: true });
      return;
    }

    const filteredOrders = orders.filter(
      o => o.customer?.phone === currentUser.phone || o.customer?.name === currentUser.name
    );
    setUserOrders(filteredOrders);
  }, [navigate, currentUser, orders]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat("en-IN", {
      style:"currency",
      currency:"INR",
      maximumFractionDigits: 0
    }).format(priceVal);
  };

  const handleBuyAgain = (order) => {
    (order.items || []).forEach((item) => {
      const product = products.find(p => p.id === item.id) || {};
      addToCart(product.name || item.name, product.price || item.price, item.quantity || 1, product.image || item.image, item.id);
    });
    showToast("Items from order added to cart!");
    navigate("/user/cart");
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleCancelOrder = async (order) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        
        // Hit the n8n webhook to restock the products in MongoDB/Admin
        try {
          await fetch(import.meta.env.VITE_WEBHOOK_PRODUCT_SYNC_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "order",
              id: order.id,
              items: order.items,
              status: "Cancelled"
            })
          });
        } catch (error) {
          console.error("Error sending cancel order to n8n webhook:", error);
        }

        showToast("Order cancelled successfully!");
      } catch (error) {
        console.error("Error cancelling order:", error);
        showToast("Failed to cancel order.");
      }
    }
  };

  const handleDownloadBill = (order) => {
    try {
      if (!order?.id) {
        showToast("Invalid order. Please refresh and try again.");
        console.error("Download bill: Invalid order", order);
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // 1. Header Banner
      doc.setFillColor(22, 163, 74); // Vibrant Green background
      doc.rect(0, 0, pageWidth, 45, 'F');
      
      // Branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold');
      doc.text('ZESTY', 20, 25);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Premium Organic Groceries', 20, 33);

      // Invoice Title
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth - 20, 25, { align: 'right' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('zestyfresh.com | support@zestyfresh.com | +91 98765 43210', pageWidth - 20, 33, { align: 'right' });

      // Safe Data
      const safeOrder = {
        id: order.id,
        date: order.date || new Date().toLocaleDateString('en-IN'),
        total: Number(order.total) || 0,
        discountAmount: Number(order.discountAmount) || 0,
        couponCode: order.couponCode || '',
        paymentMethod: order.paymentMethod || 'Cash',
        customer: {
          name: order.customer?.name || 'Customer',
          phone: order.customer?.phone || 'N/A',
          address: order.customer?.street ? `${order.customer.street}, ${order.customer.city || ''} ${order.customer.pincode ? '- ' + order.customer.pincode : ''}`.trim() : order.customer?.address || 'N/A'
        },
        items: (order.items || []).filter(i => i.name)
      };

      // 2. Billing & Order Cards
      let y = 55;
      
      doc.setDrawColor(229, 231, 235); // Gray-200
      doc.setFillColor(255, 255, 255);
      // Bill To Card
      doc.roundedRect(20, y, pageWidth / 2 - 25, 45, 3, 3, 'FD');
      // Order Info Card
      doc.roundedRect(pageWidth / 2 + 5, y, pageWidth / 2 - 25, 45, 3, 3, 'FD');

      // Bill To Data
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Billed To:', 25, y + 8);
      
      doc.setFontSize(9);
      doc.text(safeOrder.customer.name, 25, y + 15);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      const splitAddress = doc.splitTextToSize(safeOrder.customer.address, pageWidth / 2 - 35);
      doc.text(splitAddress, 25, y + 21);
      
      let addressHeight = splitAddress.length * 4;
      doc.setFont('helvetica', 'bold');
      doc.text(`Phone: `, 25, y + 21 + addressHeight + 2);
      doc.setFont('helvetica', 'normal');
      doc.text(safeOrder.customer.phone, 37, y + 21 + addressHeight + 2);

      // Order Info Data
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Information', pageWidth / 2 + 10, y + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      
      doc.text(`Order ID:`, pageWidth / 2 + 10, y + 17);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(safeOrder.id, pageWidth / 2 + 35, y + 17);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(`Date:`, pageWidth / 2 + 10, y + 24);
      doc.text(safeOrder.date, pageWidth / 2 + 35, y + 24);
      
      doc.text(`Payment:`, pageWidth / 2 + 10, y + 31);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(safeOrder.paymentMethod, pageWidth / 2 + 35, y + 31);

      y += 55;

      // 3. Items Table
      if (safeOrder.items.length === 0) {
        doc.setFontSize(10);
        doc.text('No items found in this order.', 20, y);
        y += 15;
      } else {
        const col = ['#', 'Item Description', 'Unit Price', 'Qty', 'Total'];
        const rows = safeOrder.items.map((item, index) => [
          index + 1,
          (item.name || '').toString(),
          `Rs. ${Number(item.price || 0).toLocaleString('en-IN')}`,
          `${item.quantity || 1}`,
          `Rs. ${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`
        ]);

        autoTable(doc, {
          head: [col],
          body: rows,
          startY: y,
          theme: 'grid',
          headStyles: { 
            fillColor: [34, 197, 94], // Vibrant Green
            textColor: [255, 255, 255], 
            fontSize: 9,
            fontStyle: 'bold',
            lineColor: [34, 197, 94],
            lineWidth: 0.1
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [55, 65, 81],
            lineColor: [229, 231, 235],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [250, 253, 251] // Very faint green tint
          },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 70 },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 40, halign: 'right' }
          },
          margin: { left: 20, right: 20 },
          pageBreak: 'auto'
        });

        y = doc.lastAutoTable.finalY + 15;
      }

      // 4. Totals Box
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }

      const subtotal = safeOrder.total + safeOrder.discountAmount;
      const boxHeight = safeOrder.discountAmount > 0 ? 40 : 32;
      
      doc.setFillColor(249, 250, 251); // Gray-50
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(pageWidth / 2, y, pageWidth / 2 - 20, boxHeight, 3, 3, 'FD');

      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      
      let nextY = y + 10;
      doc.text('Subtotal:', pageWidth / 2 + 10, nextY);
      doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, pageWidth - 25, nextY, { align: 'right' });
      nextY += 8;

      if (safeOrder.discountAmount > 0) {
        doc.setTextColor(22, 163, 74); // Green
        const discountText = safeOrder.couponCode ? `Discount (${safeOrder.couponCode}):` : 'Discount:';
        doc.text(discountText, pageWidth / 2 + 10, nextY);
        doc.text(`- Rs. ${safeOrder.discountAmount.toLocaleString('en-IN')}`, pageWidth - 25, nextY, { align: 'right' });
        nextY += 8;
      }

      doc.setDrawColor(229, 231, 235);
      doc.line(pageWidth / 2 + 10, nextY - 2, pageWidth - 25, nextY - 2);
      nextY += 6;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(17, 24, 39);
      doc.text('Grand Total:', pageWidth / 2 + 10, nextY);
      doc.text(`Rs. ${safeOrder.total.toLocaleString('en-IN')}`, pageWidth - 25, nextY, { align: 'right' });

      y += boxHeight + 15;

      // 5. Info Section (Return Policy & About Us)
      nextY = y;
      
      // About Zesty
      const aboutText = doc.splitTextToSize(
        "Zesty is committed to bringing you the freshest, highest quality organic produce directly from local farms. " +
        "We believe in sustainable agriculture, fair trade with farmers, and delivering nature's best right to your doorstep. " +
        "By choosing Zesty, you support local growers and a healthier planet. Eat healthy, live better!", 
        pageWidth - 50
      );
      const aboutBoxHeight = Math.max(30, aboutText.length * 5 + 15);

      if (nextY + aboutBoxHeight > pageHeight - 20) {
        doc.addPage();
        nextY = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(20, nextY, pageWidth - 40, aboutBoxHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text('About Zesty', 25, nextY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(aboutText, 25, nextY + 14);

      nextY += aboutBoxHeight + 8;

      // Return Policy
      const policyText = doc.splitTextToSize(
        "We accept returns within 7 days of delivery for any damaged, defective, or incorrect items. " +
        "To initiate a return, contact our support team at support@zestyfresh.com with your Order ID. " +
        "Items must be in their original condition and packaging. Approved refunds will be processed to the original payment method within 3-5 business days.", 
        pageWidth - 50
      );
      const policyBoxHeight = Math.max(30, policyText.length * 5 + 15);

      if (nextY + policyBoxHeight > pageHeight - 20) {
        doc.addPage();
        nextY = 20;
      }

      doc.setFillColor(249, 250, 251);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(20, nextY, pageWidth - 40, policyBoxHeight, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      doc.text('Return & Refund Policy', 25, nextY + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(policyText, 25, nextY + 14);

      nextY += policyBoxHeight + 8;

      // 6. Thank You Greeting
      if (nextY + 30 > pageHeight - 20) {
        doc.addPage();
        nextY = 20;
      }

      doc.setFillColor(240, 253, 244); // Green-50
      doc.setDrawColor(187, 247, 208); // Green-200
      doc.roundedRect(20, nextY, pageWidth - 40, 25, 3, 3, 'FD');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 101, 52); // Green-800
      doc.text('Thank you for shopping with Zesty!', pageWidth / 2, nextY + 10, { align: 'center' }); // NO EMOJIS!
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(22, 101, 52);
      doc.text('Your trust means the world to us. We look forward to serving you again.', pageWidth / 2, nextY + 18, { align: 'center' });

      // Bottom Page Footer
      const footerY = pageHeight - 12;
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text('Zesty Premium App | Generated dynamically via Zesty Systems', pageWidth / 2, footerY, { align: 'center' });

      const safeFilename = `Zesty_Invoice_${safeOrder.id.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(safeFilename);
      showToast('Invoice downloaded successfully! Check your Downloads folder.');

    } catch (error) {
      console.error('PDF Download Error:', error);
      showToast('Download failed. Please check console and try again.');
    }
  };

  if (!currentUser) return null;

  // Sorting logic to prioritize active deliveries
  const statusWeight = { "Pending": 1, "Out for Delivery": 2, "Delivered": 3, "Cancelled": 4 };

  const displayOrders = userOrders
    .filter(o => statusFilter ==="All" || o.status === statusFilter)
    .sort((a, b) => (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99));

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-[140px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight"><Package className="inline-block mr-2 translate-y-[2px]" size={28} /> My Orders</h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48 shrink-0">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full flex items-center justify-between px-4 py-3 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-base sm:text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm cursor-pointer"
              >
                <span>{statusFilter ==="All" ?"All Orders" : statusFilter}</span>
                <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {filterOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => { setStatusFilter(option); setIsFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${statusFilter === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        {option ==="All" ?"All Orders" : option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link to="/user/fruits" className="text-sm font-bold text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors w-full sm:w-auto text-center whitespace-nowrap">
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
          {displayOrders.length > 0 ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {displayOrders.map((order, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Header Area */}
                  <div className="bg-slate-50/80 border-b border-slate-100 p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-black text-slate-800 uppercase tracking-wide">Order ID: {order.id}</span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2.5 py-0.5 rounded-md">{order.date}</span>
                      </div>
                      {order.deliveryOtp && order.status !== 'Delivered' && (
                        <p className="text-xs font-bold text-orange-600 mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          Delivery OTP: <span className="text-sm font-black tracking-widest bg-orange-100 px-1.5 py-0.5 rounded border border-orange-200">{order.deliveryOtp}</span>
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold w-max border ${order.status === 'Delivered' ? 'bg-green-50 text-green-600 border-green-200' : order.status === 'Out for Delivery' ? 'bg-blue-50 text-blue-600 border-blue-200' : order.status === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-200' : order.deliveryPartnerEmail === 'online_broadcast' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                      {order.status === 'Pending' ? (order.deliveryPartnerEmail === 'online_broadcast' ? 'Assigning Partner...' : 'Processing') : order.status}
                    </span>
                  </div>

                  {/* Body Content Area */}
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 md:gap-8">
                    
                    {/* Left: Items list */}
                    <div className="flex-1 space-y-4">
                      {(() => {
                        const isExpanded = expandedOrders[order.id];
                        const itemsToShow = isExpanded ? (order.items || []) : (order.items || []).slice(0, 3);
                        const hiddenCount = (order.items || []).length - 3;
                        return (
                          <>
                            {itemsToShow.map((item, idx) => {
                              const product = products.find(p => p.id === item.id) || {};
                              const unit = product.category === 'Oil' ? 'L' : 'kg';
                              return (
                                <div key={idx} className="flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-1">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-2 flex-shrink-0">
                                    <img src={product.image || item.image} alt={product.name || item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-sm truncate">{product.name || item.name}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{item.quantity}{unit} × ₹{product.price || item.price}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="font-black text-slate-800 text-sm">₹{Math.round((product.price || item.price) * item.quantity)}</p>
                                  </div>
                                </div>
                              )
                            })}
                            {hiddenCount > 0 && (
                              <button onClick={() => toggleExpand(order.id)} className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 hover:bg-blue-100 transition-colors inline-block px-3 py-1.5 rounded-lg cursor-pointer">
                                {isExpanded ? "Show less" : `+${hiddenCount} more items`}
                              </button>
                            )}
                          </>
                        )
                      })()}
                    </div>

                    {/* Right: Summary & Tracking */}
                    <div className="md:w-64 shrink-0 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-5 md:pt-0 md:pl-8">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order Total</p>
                        <p className="text-3xl font-black text-slate-900">{formatPrice(order.total)}</p>
                        
                        {order.couponCode && (
                          <p className="text-xs font-bold text-green-600 mt-1.5 flex items-center gap-1"><Tag size={12} /> Saved ₹{order.discountAmount} ({order.couponCode})</p>
                        )}
                        <p className="text-xs font-bold text-slate-500 mt-1.5 flex items-center gap-1.5">
                          <CreditCard size={14} className="text-slate-400" /> 
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod === 'NetBanking' ? 'Net Banking' : order.paymentMethod}
                        </p>
                      </div>

                      {order.deliveryPartner && (
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Delivery Partner</p>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-xs font-black text-slate-600 shrink-0 uppercase">
                              {order.deliveryPartner.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{order.deliveryPartner.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 truncate">{order.deliveryPartner.phone}</p>
                            </div>
                            {order.status !== 'Delivered' && (
                              <a href={`tel:${order.deliveryPartner.phone}`} className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors shrink-0">
                                <Phone size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <button onClick={() => handleBuyAgain(order)} className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-auto">
                        <ShoppingBag size={16} /> Buy Again
                      </button>

                      {order.status === 'Pending' && (
                        <button onClick={() => handleCancelOrder(order)} className="w-full py-3 bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-2">
                          Cancel Order
                        </button>
                      )}

                      <button onClick={() => handleDownloadBill(order)} className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 mt-2">
                        <Download size={16} /> Download Bill
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : userOrders.length > 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <SearchIcon size={64} className="mb-4 text-slate-300" />
              <p className="text-slate-800 font-bold text-lg">No orders found</p>
              <p className="text-slate-500 mt-1">You don't have any orders marked as"{statusFilter}".</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag size={80} className="mb-4 text-slate-300" />
              <p className="text-slate-800 font-bold text-lg">No orders yet</p>
              <Link to="/user/fruits" className="btn-3d btn-lime mt-4 px-8 py-3.5 font-bold text-sm">Start Shopping</Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}