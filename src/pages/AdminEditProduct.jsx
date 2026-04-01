import { useState, useEffect, useLayoutEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { Edit } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminEditProduct() {
  const { id } = useParams()
  const { products, editProduct, showToast } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation();
  const [product, setProduct] = useState(null)
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [productType, setProductType] = useState('Solid')
  const [isTypeOpen, setIsTypeOpen] = useState(false)

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const foundProduct = products.find(p => p.id == id)
    if (foundProduct) {
      setProductType(foundProduct.category === 'Oil' ? 'Liquid' : 'Solid')
      setProduct({ 
        ...foundProduct, 
        whyYouWillLoveThis: Array.isArray(foundProduct.whyYouWillLoveThis) ? foundProduct.whyYouWillLoveThis.join(', ') : (foundProduct.whyYouWillLoveThis ||"100% Organic, Farm Fresh, No Pesticides"), 
        shelfLife: foundProduct.shelfLife || '3-4 Days', 
        storage: foundProduct.storage || 'Keep in cool dry place.' 
      })
    }
  }, [id, products])

  // 🔴 IMPORTANT: Replace this with your actual unsigned preset name
  const uploadPreset ="zesty store"; 
  const cloudName ="dbnuemnv5";

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method:"POST",
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        console.error("Cloudinary error detail:", data.error.message);
        return null;
      }
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return null;
    }
  };

  const handleTypeChange = (val) => {
    const newType = typeof val === 'string' ? val : val.target.value;
    setProductType(newType);
    setProduct(prev => ({
      ...prev,
      category: newType === 'Solid' ? 'Fruits' : 'Oil'
    }));
  };

  const handleEditProduct = async (e) => {
    e.preventDefault()
    if (parseFloat(product.price) < 0) return showToast("Price cannot be negative!");
    
    setIsUploading(true);
    let finalImageUrl = product.image;
    if (file) {
      finalImageUrl = await uploadToCloudinary(file) || product.image;
    } 

    const formattedProduct = {  
      ...product, 
      image: finalImageUrl,
      whyYouWillLoveThis: typeof product.whyYouWillLoveThis === 'string' ? product.whyYouWillLoveThis.split(',').map(i => i.trim()) : product.whyYouWillLoveThis,
      unit: product.category === 'Oil' ? 'L' : 'kg'
    };
    editProduct(product.id, formattedProduct)
    showToast("Product Updated Successfully!")
    navigate('/admin') 
  }

  if (!product) return <div className="min-h-screen bg-slate-50 text-slate-800 flex justify-center items-center font-black text-2xl">Loading Editor...</div>

  const inputStyle ="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 shadow-inner text-sm"

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease:"easeOut" }}
        className="max-w-3xl w-full bg-white p-6 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 mt-16 md:mt-0"
      >
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3"><Edit size={32} className="text-blue-600" /> Edit Product</h2>
           <Link to="/admin">
             <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors text-slate-500 font-black flex items-center justify-center w-10 h-10">✕</motion.div>
           </Link>
        </div>

        <form onSubmit={handleEditProduct} className="grid md:grid-cols-2 gap-x-8 gap-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Product Name</label>
              <input required value={product.name} onChange={e => setProduct({...product, name: e.target.value})} className={inputStyle} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Price (₹)</label>
                <input required type="number" min="0" step="any" value={product.price} onChange={e => setProduct({...product, price: e.target.value})} className={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Type</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsTypeOpen(!isTypeOpen)} 
                    className={`${inputStyle} pr-10 cursor-pointer flex justify-between items-center`}
                  >
                    <span>{productType}</span>
                    <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isTypeOpen ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                  {isTypeOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsTypeOpen(false)}></div>
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {['Solid', 'Liquid'].map(option => (
                          <div 
                            key={option} 
                            onClick={() => {
                              handleTypeChange(option);
                              setIsTypeOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${productType === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Category</label>
              <div className="relative">
                <div 
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)} 
                  className={`${inputStyle} pr-10 cursor-pointer flex justify-between items-center`}
                >
                  <span>{product.category}</span>
                  <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)}></div>
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      {(productType === 'Solid' ? ['Fruits', 'Vegetables', 'Pulses'] : ['Oil']).map(option => (
                        <div 
                          key={option} 
                          onClick={() => {
                            setProduct({...product, category: option});
                            setIsCategoryOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors cursor-pointer ${product.category === option ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase ml-2 mb-2 block tracking-wider">Short Description</label>
              <textarea required rows="2" value={product.desc} onChange={e => setProduct({...product, desc: e.target.value})} className={inputStyle} />
            </div>

            <div>
              <label className="text-xs font-bold text-blue-600 uppercase ml-2 mb-2 block tracking-wider">Product Image (Upload new to replace)</label>
              <input type="file" accept="image/*,.pdf" onChange={e => { setFile(e.target.files[0]); setProduct({...product, image: URL.createObjectURL(e.target.files[0])}); }} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              {isUploading && <p className="text-sm font-bold text-blue-500 mt-2 animate-pulse ml-2">Uploading...</p>}
            </div>
            {product.image && !isUploading && (
              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
                <img src={product.image} alt="Preview" className="w-24 h-24 object-contain rounded-xl mix-blend-multiply" />
              </div>
            )}
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
            <motion.button disabled={isUploading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg font-black rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_15px_35px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploading ? 'Processing...' : 'Save Changes ➔'}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}