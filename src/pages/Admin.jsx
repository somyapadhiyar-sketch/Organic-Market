import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, LogOut, Package, Users, ShoppingBag } from 'lucide-react'

export default function Admin() {
  const { products, toggleProductStatus, deleteProduct, deliveryPartners, approveDelivery, orders, logout, updateOrderStatus } = useStore()
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, orders, delivery

  // Stats calculation
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.disabled).length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-[#1C1C1C]">
      
      {/* Sleek Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-[28px] font-black text-[#3B0060] tracking-tighter leading-none">zesty</span>
          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-gray-200">Admin</span>
        </div>
        <div className="flex gap-4">
          <Link to="/admin/add-product" className="flex items-center gap-2 px-4 py-2.5 bg-[#FF3269] text-white rounded-lg font-bold text-[13px] hover:bg-[#E21B70] transition-colors shadow-sm">
            <Plus size={16} /> Add Product
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold text-[13px] hover:bg-gray-50 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="flex max-w-[1400px] mx-auto mt-8 px-4 gap-6">
        
        {/* Left Sidebar Nav */}
        <aside className="w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-3 space-y-1">
            <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-colors ${activeTab === 'inventory' ? 'bg-[#F4F5F7] text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Package size={18} /> Inventory
            </button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-[14px] transition-colors ${activeTab === 'orders' ? 'bg-[#F4F5F7] text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3"><ShoppingBag size={18} /> Orders</div>
              {pendingOrders > 0 && <span className="bg-[#FF3269] text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrders}</span>}
            </button>
            <button onClick={() => setActiveTab('delivery')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[14px] transition-colors ${activeTab === 'delivery' ? 'bg-[#F4F5F7] text-[#3B0060]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Users size={18} /> Delivery Partners
            </button>
          </div>

          {/* Quick Stats Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mt-6">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div><p className="text-[24px] font-black text-gray-900 leading-none">{totalProducts}</p><p className="text-[12px] font-bold text-gray-500 mt-1">Total Products</p></div>
              <div><p className="text-[24px] font-black text-red-500 leading-none">{outOfStock}</p><p className="text-[12px] font-bold text-gray-500 mt-1">Out of Stock</p></div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-12">
          
          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div>
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                 <h2 className="font-black text-gray-900 text-lg">Product Inventory</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-[11px] uppercase tracking-widest font-bold bg-white">
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#F8F8F8] rounded-lg border border-gray-200 p-1 flex items-center justify-center">
                            <img src={p.image} className="max-w-full max-h-full object-contain mix-blend-multiply" onError={(e) => e.target.src="https://placehold.co/100x100/F8F8F8/767676?text=Img"}/>
                          </div>
                          <span className="font-bold text-[14px] text-gray-900">{p.name}</span>
                        </td>
                        <td className="p-4 text-[13px] font-medium text-gray-500">{p.category}</td>
                        <td className="p-4 font-bold text-[15px] text-gray-900">₹{p.price}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${p.disabled ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-[#0A8745] border border-green-100'}`}>
                            {p.disabled ? 'Out of Stock' : 'Active'}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => toggleProductStatus(p.id)} className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-[12px] font-bold hover:bg-gray-50 transition-colors">Toggle</button>
                          <button onClick={() => deleteProduct(p.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[12px] font-bold hover:bg-red-100 transition-colors">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                 <h2 className="font-black text-gray-900 text-lg">Recent Orders</h2>
              </div>
              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-medium">No orders have been placed yet.</div>
              ) : (
                <div className="p-6 space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                        <div>
                          <p className="font-black text-gray-900">{order.id} <span className="text-gray-400 font-medium text-xs ml-2">{order.date}</span></p>
                          <p className="text-sm font-bold text-gray-600 mt-1">{order.customer.name} • {order.customer.phone}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-sm text-gray-600 font-medium">
                          {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 font-bold mb-1">{order.paymentMethod}</p>
                          <p className="font-black text-lg text-gray-900">₹{order.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DELIVERY PARTNERS TAB */}
          {activeTab === 'delivery' && (
            <div>
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                 <h2 className="font-black text-gray-900 text-lg">Delivery Partners</h2>
              </div>
              {deliveryPartners.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-medium">No delivery partner requests found.</div>
              ) : (
                <div className="p-6 space-y-4">
                  {deliveryPartners.map(partner => (
                    <div key={partner.email} className="flex justify-between items-center bg-white border border-gray-200 p-5 rounded-xl">
                      <div>
                        <h4 className="font-black text-[16px] text-gray-900">{partner.name}</h4>
                        <p className="text-[13px] font-bold text-gray-500 mt-1">{partner.phone} • {partner.email}</p>
                        <p className="text-[12px] text-gray-400 mt-1 uppercase tracking-wide">{partner.address}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block mb-2 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${partner.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {partner.status}
                        </span>
                        {partner.status === 'Pending' && (
                          <button onClick={() => approveDelivery(partner.email)} className="block w-full px-4 py-2 bg-[#3B0060] text-white font-bold text-[12px] rounded-lg hover:bg-[#2A0045] transition-colors">
                            Approve Partner
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}