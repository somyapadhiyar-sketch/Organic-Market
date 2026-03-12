import { useStore } from '../context/StoreContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Delivery() {
  const { orders, updateOrderStatus, logout, currentUser } = useStore()
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm transition-all">
        <div className="flex items-center gap-2 group shrink-0">
          <span className="text-3xl">🛵</span>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter group-hover:text-orange-600 transition-colors">Zesty Delivery</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/user/home" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-all shadow-sm text-xs">Store View</Link>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
              {currentUser?.name?.charAt(0) || 'D'}
            </div>
            <div className="text-right hidden lg:block">
              <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.name || 'Partner'}</p>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-600">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto space-y-6 pt-24 px-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-orange-100"><h2 className="text-2xl font-bold text-slate-400">No active orders right now.</h2></div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-orange-100 flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap gap-3 mb-4"><span className="bg-orange-100 text-orange-700 font-black px-3 py-1 rounded-lg text-xs">{order.id}</span><span className={`text-xs font-bold px-3 py-1 rounded-lg ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : order.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span><span className="text-xs text-slate-400 font-medium py-1">{order.date}</span></div>
                <h3 className="font-bold text-xl mb-1 text-slate-900">{order.customer.name}</h3><p className="text-sm text-slate-600 mb-1">📞 {order.customer.phone}</p><p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">📍 {order.customer.address} ({order.customer.type})</p>
                <div className="mt-4"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Order Items:</p><div className="flex flex-wrap gap-2">{order.items.map((item, i) => (<div key={i} className="bg-orange-50 border border-orange-100 px-3 py-1 rounded-lg text-xs font-bold text-orange-800">{item.quantity}x {item.name}</div>))}</div></div>
              </div>
              <div className="md:w-64 bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-center text-center">
                <p className="text-slate-500 font-medium mb-1">To Collect</p><p className="text-4xl font-black text-slate-900 mb-6">₹{order.total}</p>
                {order.status === 'Pending' && (<button onClick={() => updateOrderStatus(order.id, 'Out for Delivery')} className="w-full py-4 bg-orange-500 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(249,115,22,0.4)] hover:bg-orange-600 active:scale-95 transition-all">Pick Up Order</button>)}
                {order.status === 'Out for Delivery' && (<button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="w-full py-4 bg-green-500 text-white font-bold rounded-xl shadow-[0px_10px_20px_rgba(34,197,94,0.4)] hover:bg-green-600 active:scale-95 transition-all">Mark Delivered ✓</button>)}
                {order.status === 'Delivered' && (<button disabled className="w-full py-4 bg-slate-200 text-slate-400 font-bold rounded-xl cursor-not-allowed">Order Complete</button>)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}