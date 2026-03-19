import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminAddProduct() {
  const { addNewProduct, showToast } = useStore()
  const navigate = useNavigate()
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Fruits', desc: '', about: '', image: '', whyYouWillLoveThis: '100% Organic, Farm Fresh', shelfLife: '3-4 Days', storage: 'Keep cool.' })

  const handleAddProduct = (e) => {
    e.preventDefault(); if(!newProduct.image) return showToast("Please select an image!");
    const formattedProduct = { ...newProduct, whyYouWillLoveThis: newProduct.whyYouWillLoveThis.split(',').map(i => i.trim()) };
    addNewProduct(formattedProduct); showToast("Product Added!"); navigate('/admin'); 
  }

  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-colors font-bold text-slate-900 text-base shadow-inner";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center font-sans text-slate-800">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full bg-white p-6 sm:p-10 md:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-xl border border-slate-100 mt-16 md:mt-0">
        
        <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
           <h2 className="text-2xl sm:text-3xl font-black text-slate-900">📦 Add New Product</h2>
           <Link to="/admin" className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700 text-xs sm:text-sm transition-colors shadow-sm whitespace-nowrap">✕ Cancel</Link>
        </div>

        <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Product Name</label><input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className={inputStyle} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Price (₹)</label><input required type="number" min="0" step="any" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className={inputStyle} /></div>
              <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className={inputStyle}><option>Fruits</option><option>Vegetables</option><option>Pulses</option></select></div>
            </div>
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Short Desc</label><textarea required rows="2" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">About</label><textarea required rows="3" value={newProduct.about} onChange={e => setNewProduct({...newProduct, about: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">Image URL</label><input required type="url" placeholder="https://res.cloudinary.com/..." value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} className={inputStyle} /></div>
            {newProduct.image && (
              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
                <img src={newProduct.image} alt="Preview" className="w-24 h-24 object-contain rounded-xl" />
              </div>
            )}
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6 border border-slate-200">
            <h3 className="font-black text-slate-900 text-xl border-b border-slate-200 pb-3">Specs</h3>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Selling Points</label><input value={newProduct.whyYouWillLoveThis} onChange={e => setNewProduct({...newProduct, whyYouWillLoveThis: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Shelf Life</label><input value={newProduct.shelfLife} onChange={e => setNewProduct({...newProduct, shelfLife: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Storage</label><input value={newProduct.storage} onChange={e => setNewProduct({...newProduct, storage: e.target.value})} className={inputStyle} /></div>
          </div>
          <div className="md:col-span-2 mt-6"><motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-5 bg-slate-900 text-white text-xl font-black rounded-2xl shadow-xl hover:bg-blue-600 transition-colors">Publish Product</motion.button></div>
        </form>
      </motion.div>
    </div>
  )
}