import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, IndianRupee, ShoppingBag, Calendar, Filter, CalendarDays, Download, FileText } from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { auth } from '../firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminSales() {
  const { orders: contextOrders } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterMode, setFilterMode] = useState('days'); // 'days', 'custom', 'all'
  const [timeframe, setTimeframe] = useState(30); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch all historical orders from Firestore for accurate analytics
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const db = getFirestore(auth.app);
        const querySnapshot = await getDocs(collection(db, "orders"));
        if (!querySnapshot.empty) {
          const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOrders(fetchedOrders);
        } else {
          setOrders(contextOrders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders(contextOrders || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOrders();
  }, [contextOrders]);

  // Process order data to generate daily and monthly statistics
  const { dailyData, monthlyData, totalSales, totalOrders, todaySales, filteredOrdersList } = useMemo(() => {
    const dailyMap = {};
    const monthlyMap = {};
    let totalS = 0;
    let totalO = 0;
    let todayS = 0;
    const currentFilteredOrders = [];

    // Get today's date formatted as YYYY-MM-DD
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
    todayObj.setHours(0, 0, 0, 0); // Normalize to start of day

    // Calculate dynamic cutoff dates
    let cutoffDate = new Date(0); // Epoch start
    let maxDate = new Date();
    maxDate.setHours(23, 59, 59, 999);

    if (filterMode === 'days') {
      cutoffDate = new Date(todayObj);
      cutoffDate.setDate(cutoffDate.getDate() - timeframe + 1);
    } else if (filterMode === 'custom') {
      if (startDate) {
        cutoffDate = new Date(startDate);
        cutoffDate.setHours(0, 0, 0, 0);
      }
      if (endDate) {
        maxDate = new Date(endDate);
        maxDate.setHours(23, 59, 59, 999);
      }
    }

    // Only process orders that aren't cancelled
    const validOrders = orders.filter(o => o.status !== 'Cancelled');

    validOrders.forEach(order => {
      // Try to parse the order date
      let dateObj = new Date(order.date || order.createdAt || Date.now());
      if (isNaN(dateObj.getTime())) {
        // Fallback if order.date is in a non-standard format
        dateObj = new Date();
      }

      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      const monthStr = dateStr.substring(0, 7); // YYYY-MM
      
      const amount = parseFloat(order.total) || 0;

      // Always log today's total sales regardless of the filter
      if (dateStr === todayStr) {
        todayS += amount;
      }

      // Filter out orders outside the selected timeframe
      const normalizedOrderDate = new Date(dateObj);
      normalizedOrderDate.setHours(0, 0, 0, 0);
      if (filterMode !== 'all') {
        if (normalizedOrderDate < cutoffDate || normalizedOrderDate > maxDate) {
          return; // Skip this old/future order
        }
      }

      currentFilteredOrders.push(order);

      totalS += amount;
      totalO += 1;

      // Populate daily data map
      if (!dailyMap[dateStr]) dailyMap[dateStr] = { date: dateStr, sales: 0, orders: 0 };
      dailyMap[dateStr].sales += amount;
      dailyMap[dateStr].orders += 1;

      // Populate monthly data map
      if (!monthlyMap[monthStr]) monthlyMap[monthStr] = { month: monthStr, sales: 0, orders: 0 };
      monthlyMap[monthStr].sales += amount;
      monthlyMap[monthStr].orders += 1;
    });

    // Fill in missing days with zero sales so the area graph remains continuous
    if (filterMode === 'days' && typeof timeframe === 'number') {
      for (let i = 0; i < timeframe; i++) {
        const d = new Date(todayObj);
        d.setDate(d.getDate() - i);
        const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!dailyMap[dStr]) {
          dailyMap[dStr] = { date: dStr, sales: 0, orders: 0 };
        }
      }
    } else if (filterMode === 'custom' && startDate && endDate) {
      let sD = new Date(startDate);
      let eD = new Date(endDate);
      // Cap at 90 days to prevent browser freezing if user selects a massive range
      const diffTime = Math.abs(eD - sD);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (sD <= eD && diffDays <= 90) {
        let currD = new Date(sD);
        while (currD <= eD) {
          const dStr = `${currD.getFullYear()}-${String(currD.getMonth() + 1).padStart(2, '0')}-${String(currD.getDate()).padStart(2, '0')}`;
          if (!dailyMap[dStr]) {
            dailyMap[dStr] = { date: dStr, sales: 0, orders: 0 };
          }
          currD.setDate(currD.getDate() + 1);
        }
      }
    }

    // Convert maps to sorted arrays for the charts
    const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    const monthlyData = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    return { dailyData, monthlyData, totalSales: totalS, totalOrders: totalO, todaySales: todayS, filteredOrdersList: currentFilteredOrders };
  }, [orders, timeframe, filterMode, startDate, endDate]);

  const exportToExcel = () => {
    const data = filteredOrdersList.map(o => ({
      "Order ID": o.id,
      "Date": o.date,
      "Customer Name": o.customer?.name || 'N/A',
      "Customer Phone": o.customer?.phone || 'N/A',
      "Payment Method": o.paymentMethod,
      "Status": o.status,
      "Amount (Rs)": o.total
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Zesty_Sales_Report.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Zesty Sales Report`, 14, 15);
    
    doc.setFontSize(11);
    const reportPeriod = filterMode === 'all' ? 'All Time' : filterMode === 'custom' ? `${startDate} to ${endDate}` : `Last ${timeframe} Days`;
    doc.text(`Period: ${reportPeriod}`, 14, 25);
    doc.text(`Total Revenue: Rs. ${totalSales.toFixed(2)}`, 14, 31);
    doc.text(`Total Orders Generated: ${totalOrders}`, 14, 37);

    const tableData = filteredOrdersList.map(o => [o.id, o.date, o.customer?.name || 'N/A', o.paymentMethod, o.status, `Rs. ${o.total}`]);
    autoTable(doc, {
      startY: 45,
      head: [['Order ID', 'Date', 'Customer', 'Payment', 'Status', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    doc.save(`Zesty_Sales_Report.pdf`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans animate-in fade-in duration-300">
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          Sales Analytics
          {loading && <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg animate-pulse">Syncing Database...</span>}
        </h1>
        
        {/* Custom Date Range Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Export Buttons */}
          <div className="flex gap-2 sm:mr-2 sm:border-r border-slate-200 sm:pr-4">
            <button onClick={exportToExcel} disabled={filteredOrdersList.length === 0} className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-colors disabled:opacity-50 text-xs shadow-sm border border-emerald-200"><FileText size={16}/> Excel</button>
            <button onClick={exportToPDF} disabled={filteredOrdersList.length === 0} className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl transition-colors disabled:opacity-50 text-xs shadow-sm border border-red-200"><Download size={16}/> PDF</button>
          </div>

          {/* Mode Selector */}
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex gap-1 shadow-sm">
            <button onClick={() => setFilterMode('days')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterMode === 'days' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>Last X Days</button>
            <button onClick={() => setFilterMode('custom')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterMode === 'custom' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>Custom Date</button>
            <button onClick={() => setFilterMode('all')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filterMode === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>All Time</button>
          </div>

          {filterMode === 'days' && (
            <div className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-2 rounded-xl shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Filter size={16} className="text-blue-500" />
              <span className="text-sm font-bold text-slate-600">Last</span>
              <input 
                type="number" 
                value={timeframe}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val > 0) setTimeframe(val);
                  else if (e.target.value === '') setTimeframe('');
                }}
                onBlur={() => { if (timeframe === '' || isNaN(timeframe) || timeframe <= 0) setTimeframe(30); }}
                className="w-12 text-sm font-black text-slate-900 bg-transparent outline-none text-center"
              />
              <span className="text-sm font-bold text-slate-600">Days</span>
            </div>
          )}

          {filterMode === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-blue-200 px-3 py-2 rounded-xl shadow-sm transition-all">
              <CalendarDays size={16} className="text-blue-500" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-sm font-bold text-slate-700 outline-none bg-transparent" />
              <span className="text-slate-300 font-bold">-</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-sm font-bold text-slate-700 outline-none bg-transparent" />
            </div>
          )}
        </div>
      </div>
      
      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <IndianRupee size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Revenue</p>
            <p className="text-2xl font-black text-slate-800 leading-none">₹{totalSales.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Today's Sales</p>
            <p className="text-2xl font-black text-slate-800 leading-none">₹{todaySales.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Orders</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
            <Calendar size={28} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Avg. Daily Orders</p>
            <p className="text-2xl font-black text-slate-800 leading-none">
              {dailyData.length > 0 ? (totalOrders / dailyData.length).toFixed(1) : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Daily Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-black text-slate-800 mb-6">
            Daily Revenue {filterMode === 'all' ? '(All Time)' : filterMode === 'custom' ? '(Custom Range)' : `(Last ${timeframe} Days)`}
          </h2>
          <div className="h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} tickMargin={10} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} tickMargin={10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent'}}
                  contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" activeDot={{r: 6, strokeWidth: 0, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-black text-slate-800 mb-6">Monthly Overview</h2>
          <div className="h-72 w-full flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} tickMargin={10} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                  labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                />
                <Bar dataKey="sales" name="Sales" fill="url(#colorBar)" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Information Text */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="text-blue-500 mt-0.5"><Calendar size={18} /></div>
        <p className="text-sm font-medium text-slate-600 leading-relaxed">
          This data is generated starting from your very first recorded order up to today. To view individual order details or specific delivery partner assignments, please visit the <span className="font-bold text-blue-600">Orders</span> section.
        </p>
      </div>
    </div>
  );
}