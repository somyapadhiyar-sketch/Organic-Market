import { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

export default function AdminSales() {
  const { orders, products } = useStore();
  const [dateRange, setDateRange] = useState({ 
    startDate: null,
    endDate: null,
  });

  const setPresetDateRange = (preset) => {
    const end = new Date();
    const start = new Date();
    if (preset === '7days') {
      start.setDate(end.getDate() - 7);
    } else if (preset === '30days') {
      start.setDate(end.getDate() - 30);
    } else if (preset === '1year') {
      start.setFullYear(end.getFullYear() - 1);
    } else if (preset === 'yearly') {
      start.setFullYear(end.getFullYear(), 0, 1);
    }
    setDateRange({ startDate: start, endDate: end });
  };

  const handleCustomDateChange = (e, type) => {
    const { value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [type]: value ? new Date(value) : null,
    }));
  };

  const filteredOrders = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return orders;
    }
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  }, [orders, dateRange]);

  // 1. Total Sales and Orders
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;

  // 2. Sales by Category
  const salesByCategory = useMemo(() => {
    const acc = {};
    products.forEach(p => {
        const category = p.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = { name: category, sales: 0 };
        }
    });

    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const category = product.category || 'Uncategorized';
                if (acc[category]) {
                    acc[category].sales += item.price * item.quantity;
                }
            }
        });
    });
    return Object.values(acc).filter(c => c.sales > 0);
  }, [filteredOrders, products]);

  const categoryData = salesByCategory;
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  // 3. Sales over time (e.g., by month)
  const salesOverTime = useMemo(() => {
    const rangeInDays = dateRange.startDate && dateRange.endDate ? (dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24) : 365;
    
    const format = rangeInDays > 60 
      ? { month: 'short', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' };

    const salesMap = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt);
      const dateKey = date.toLocaleString('default', format);
      if (!acc[dateKey]) {
        const sortDate = rangeInDays > 60 ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date(date.getFullYear(), date.getMonth(), date.getDate());
        acc[dateKey] = { name: dateKey, sales: 0, sortDate: sortDate.getTime() };
      }
      acc[dateKey].sales += order.total;
      return acc;
    }, {});

    return Object.values(salesMap).sort((a, b) => a.sortDate - b.sortDate);
  }, [filteredOrders, dateRange]);

  const monthData = salesOverTime;

  const handlePdfDownload = () => {
    try {
      if (filteredOrders.length === 0) {
        showToast?.('No orders available for report.');
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const dateString = dateRange.startDate && dateRange.endDate 
        ? `${dateRange.startDate.toLocaleDateString('en-IN')} to ${dateRange.endDate.toLocaleDateString('en-IN')}`
        : 'All Time';

      let y = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(39, 163, 234);
      doc.text('Zesty Sales Report', 14, y);
      y += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(75, 85, 99);
      doc.text(`Period: ${dateString}`, 14, y);
      y += 8;
      doc.text(`Total Revenue: ₹${totalSales.toLocaleString('en-IN')}`, 14, y);
      y += 8;
      doc.text(`Total Orders: ${totalOrders.toLocaleString()}`, 14, y);
      y += 15;

      doc.setLineWidth(1.5);
      doc.setDrawColor(39, 163, 234);
      doc.line(14, y, doc.internal.pageSize.getWidth() - 14, y);
      y += 20;

      // Orders table
      const safeOrders = filteredOrders.map(order => ({
        id: order.id,
        customer: order.customer?.name || 'N/A',
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A',
        items: order.items?.length || 0,
        payment: order.paymentMethod || 'N/A',
        total: Number(order.total || 0)
      })).slice(0, 200); // Limit rows

      const columns = ['Order ID', 'Customer', 'Date', 'Items', 'Payment', 'Total ₹'];
      const rows = safeOrders.map(o => [
        o.id,
        o.customer,
        o.date,
        o.items,
        o.payment,
        o.total.toLocaleString('en-IN')
      ]);

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [39, 163, 234], textColor: 255, fontSize: 11 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 50 },
          2: { cellWidth: 30 },
          3: { cellWidth: 20 },
          4: { cellWidth: 40 },
          5: { cellWidth: 35, halign: 'right' }
        },
        margin: { left: 14, right: 14 },
        pageBreak: 'auto',
        didDrawPage: (data) => {
          // Page footer
          doc.setFontSize(9);
          doc.setTextColor(149, 165, 166);
          doc.text(`Page ${data.pageCount}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
        }
      });

      const safeDateString = dateString.replace(/[^\w\s-]/g, '').replace(/ /g, '_').substring(0, 50);
      const filename = `Zesty_Sales_Report_${safeDateString || 'AllTime'}.pdf`;
      doc.save(filename);
      
    } catch (error) {
      console.error('Sales PDF error:', error);
      // No showToast here as not in scope; use console
    }
  };

  const handleXlsxDownload = () => {
    const worksheetData = filteredOrders.map(order => ({
      'Order ID': order.id, 'Customer Name': order.customer.name, 'Customer Phone': order.customer.phone,
      'Address': order.customer.address, 'Date': new Date(order.createdAt).toLocaleString(), 'Status': order.status,
      'Payment Method': order.paymentMethod, 'Item Count': order.items.length, 'Total Amount': order.total,
      'Items': order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet,"Sales Data");

    const cols = Object.keys(worksheetData[0] || {});
    const colWidths = cols.map(col => ({ wch: Math.max(...worksheetData.map(row => row[col]?.toString().length || 0), col.length) }));
    worksheet['!cols'] = colWidths;

    const dateString = dateRange.startDate && dateRange.endDate ? `${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}` : 'All Time';
    XLSX.writeFile(workbook, `zesty-sales-report-${dateString.replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-8">
      {/* Date Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
          <button onClick={() => setPresetDateRange('7days')} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition text-center whitespace-nowrap">Last 7 Days</button>
          <button onClick={() => setPresetDateRange('30days')} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition text-center whitespace-nowrap">1 Month</button>
          <button onClick={() => setPresetDateRange('1year')} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition text-center whitespace-nowrap">1 Year</button>
          <button onClick={() => setPresetDateRange('yearly')} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition text-center whitespace-nowrap">This Year</button>
          <button onClick={() => setDateRange({ startDate: null, endDate: null })} className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition text-center whitespace-nowrap">All Time</button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full xl:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold flex-1">
            <span className="text-slate-500">Custom:</span>
            <input type="date" onChange={e => handleCustomDateChange(e, 'startDate')} value={dateRange.startDate ? dateRange.startDate.toISOString().split('T')[0] : ''} className="p-1.5 border border-gray-300 rounded-lg bg-slate-50 flex-1 min-w-[110px]" />
            <span className="text-slate-500">to</span>
            <input type="date" onChange={e => handleCustomDateChange(e, 'endDate')} value={dateRange.endDate ? dateRange.endDate.toISOString().split('T')[0] : ''} className="p-1.5 border border-gray-300 rounded-lg bg-slate-50 flex-1 min-w-[110px]" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button onClick={handlePdfDownload} disabled={filteredOrders.length === 0} className="flex-1 sm:flex-none btn-3d btn-danger flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download size={14} /> PDF
              </button>
              <button onClick={handleXlsxDownload} disabled={filteredOrders.length === 0} className="flex-1 sm:flex-none btn-3d btn-emerald flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download size={14} /> XLSX
              </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard title="Total Revenue" value={`₹${totalSales.toFixed(0)}`} />
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Average Order Value" value={`₹${(totalSales / totalOrders || 0).toFixed(0)}`} />
        <StatCard title="Products" value={products.length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-lg mb-4">Sales Over Time</h3>
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="min-w-[400px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis tickFormatter={(value) => `₹${value}`} fontSize={12} width={60} />
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-lg mb-4">Sales by Category</h3>
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="min-w-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
      <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 line-clamp-1">{title}</p>
      <p className="text-xl md:text-3xl font-black text-gray-900 truncate">{value}</p>
    </div>
  );
}