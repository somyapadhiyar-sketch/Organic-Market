import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminEditProduct() {
  const { id } = useParams()
  const { products, editProduct, showToast } = useStore()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const foundProduct = products.find(p => p.id == id)
    if (foundProduct) {
      setProduct({ 
        ...foundProduct, 
        whyYouWillLoveThis: Array.isArray(foundProduct.whyYouWillLoveThis) ? foundProduct.whyYouWillLoveThis.join(', ') : (foundProduct.whyYouWillLoveThis || "100% Organic, Farm Fresh, No Pesticides"), 
        shelfLife: foundProduct.shelfLife || '3-4 Days', 
        storage: foundProduct.storage || 'Keep in cool dry place.' 
      })
    }
  }, [id, products])

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProduct({ ...product, image: reader.result });
      reader.readAsDataURL(file);
    }
  }

  const handleEditProduct = (e) => {
    e.preventDefault()
    if (parseFloat(product.price) < 0) return showToast("Price cannot be negative!");
    const formattedProduct = { 
      ...product, 
      whyYouWillLoveThis: product.whyYouWillLoveThis.split(',').map(i => i.trim()) 
    };
    editProduct(product.id, formattedProduct)
    showToast("Product Updated Successfully!")
    navigate('/admin/fruits') 
  }

  if (!product) return <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center items-center font-black text-2xl">Loading Editor...</div>

  const inputStyle = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-inner text-sm"

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl w-full bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100"
      >
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3"><span className="text-4xl">✏️</span> Edit Product</h2>
           <Link to="/admin/fruits">
             <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-slate-500 font-black flex items-center justify-center w-10 h-10">✕</motion.div>
           </Link>
        </div>

        <form onSubmit={handleEditProduct} className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Product Name</label>
              <input required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Price (₹)</label>
                <input required type="number" min="0" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} className={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Category</label>
                <select value={product.category} onChange={e => setProduct({...product, category: e.target.value})} className={inputStyle}>
                  <option value="Fruits">Fruits</option><option value="Vegetables">Vegetables</option><option value="Pulses">Pulses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Short Description</label>
              <textarea required rows="2" value={product.desc} onChange={e => setProduct({...product, desc: e.target.value})} className={inputStyle} />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-600 uppercase ml-2 mb-2 block tracking-wider">Update Image (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-slate-500 cursor-pointer border border-slate-200 p-2 rounded-2xl bg-slate-50" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-blue-50/50 p-6 rounded-[2rem] space-y-5 border border-blue-100">
            <h3 className="text-lg font-black mb-2 text-blue-900">Detailed Information</h3>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block tracking-widest">Selling Points (Comma Separated)</label>
              <input value={product.whyYouWillLoveThis} onChange={e => setProduct({...product, whyYouWillLoveThis: e.target.value})} className={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block tracking-widest">Shelf Life</label>
              <input value={product.shelfLife} onChange={e => setProduct({...product, shelfLife: e.target.value})} className={inputStyle} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-2 mb-1 block tracking-widest">Storage</label>
              <input value={product.storage} onChange={e => setProduct({...product, storage: e.target.value})} className={inputStyle} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2 mt-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-black rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.4)] transition-all">
              Save Changes ➔
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}