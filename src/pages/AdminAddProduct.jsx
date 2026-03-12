import { useState } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminAddProduct() {
  const { addNewProduct } = useStore()
  const navigate = useNavigate()
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Fruits', desc: '', image: '', whyYouWillLoveThis: '100% Organic, Farm Fresh', shelfLife: '3-4 Days', storage: 'Keep cool.' })

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { setNewProduct({ ...newProduct, image: reader.result }); }; reader.readAsDataURL(file); }
  }

  const handleAddProduct = (e) => {
    e.preventDefault(); if(!newProduct.image) return alert("Please select an image!");
    const formattedProduct = { ...newProduct, whyYouWillLoveThis: newProduct.whyYouWillLoveThis.split(',').map(i => i.trim()) };
    addNewProduct(formattedProduct); alert("Product Added!"); navigate('/admin'); 
  }

  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-purple-500 focus:bg-white transition-colors font-bold text-slate-900 text-base shadow-inner";

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex items-center justify-center font-sans text-slate-800">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl w-full bg-white p-10 md:p-12 rounded-[3rem] shadow-xl border border-slate-100">
        
        <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
           <h2 className="text-3xl font-black text-slate-900">📦 Add New Product</h2>
           <Link to="/admin" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-black text-slate-700 text-sm transition-colors shadow-sm">✕ Cancel</Link>
        </div>

        <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Product Name</label><input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className={inputStyle} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Price (₹)</label><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className={inputStyle} /></div>
              <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label><select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className={inputStyle}><option>Fruits</option><option>Vegetables</option><option>Pulses</option></select></div>
            </div>
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Short Desc</label><textarea required rows="2" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2 block">Upload Image</label><input required type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-purple-100 file:text-purple-700 cursor-pointer border border-slate-200 p-2 rounded-2xl bg-slate-50 shadow-inner" /></div>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6 border border-slate-200">
            <h3 className="font-black text-slate-900 text-xl border-b border-slate-200 pb-3">Specs</h3>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Selling Points</label><input value={newProduct.whyYouWillLoveThis} onChange={e => setNewProduct({...newProduct, whyYouWillLoveThis: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Shelf Life</label><input value={newProduct.shelfLife} onChange={e => setNewProduct({...newProduct, shelfLife: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Storage</label><input value={newProduct.storage} onChange={e => setNewProduct({...newProduct, storage: e.target.value})} className={inputStyle} /></div>
          </div>
          <div className="md:col-span-2 mt-6"><motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-5 bg-slate-900 text-white text-xl font-black rounded-2xl shadow-xl hover:bg-purple-600 transition-colors">Publish Product</motion.button></div>
        </form>
      </motion.div>
    </div>
  )
}