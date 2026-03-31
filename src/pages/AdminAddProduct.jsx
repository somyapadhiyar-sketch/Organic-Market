import { useState, useLayoutEffect } from 'react'
import { useStore } from '../context/StoreContext'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function AdminAddProduct() {
  const { products, addNewProduct, showToast } = useStore()
  const navigate = useNavigate()
  const { pathname } = useLocation();
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Fruits', desc: '', about: '', image: '', whyYouWillLoveThis: '100% Organic, Farm Fresh', shelfLife: '3-4 Days', storage: 'Keep cool.'})
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [productType, setProductType] = useState('Solid');

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setProductType(newType);
    setNewProduct(prev => ({
      ...prev,
      category: newType === 'Solid' ? 'Fruits' : 'Oil'
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault(); if(!file) return showToast("Please select an image!");
    setIsUploading(true);
    const fileUrl = await uploadToCloudinary(file);
    if(!fileUrl) { setIsUploading(false); return showToast("Image upload failed!"); }
    
    // Generate automatic ID (e.g. f15, v26, p10) based on max existing number in category
    const prefix = newProduct.category === 'Oil' ? 'o' : newProduct.category.charAt(0).toLowerCase();
    const categoryProducts = products.filter(p => p.category === newProduct.category && p.id && String(p.id).startsWith(prefix));
    let maxIdNum = 0;
    categoryProducts.forEach(p => {
      const num = parseInt(String(p.id).substring(1), 10);
      if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
    });
    const newId = `${prefix}${maxIdNum + 1}`;

    // Generate automatic rating & buying frequency
    const randomRating = Number((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1));
    const randomPurchaseFrequency = parseInt(Math.floor(Math.random() * (98 - 85 + 1)) + 85, 10);

    const formattedProduct = { 
      ...newProduct, 
      id: newId, 
      rating: randomRating, 
      purchase_frequency: randomPurchaseFrequency, 
      image: fileUrl, 
      whyYouWillLoveThis: newProduct.whyYouWillLoveThis.split(',').map(i => i.trim()),
      unit: newProduct.category === 'Oil' ? 'L' : 'kg',
      stock: 150, // Default stock
      disabled: false,
      sold: 0
    };

    try {
      // Trigger the n8n Webhook to sync the new product to MongoDB
      // This payload is structured exactly like the MongoDB collection
      await fetch('http://localhost:5678/webhook/syncdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formattedProduct.name,
          category: formattedProduct.category,
          price: Number(formattedProduct.price),
          rating: formattedProduct.rating,
          purchase_frequency: formattedProduct.purchase_frequency,
          productId: newId
        }),
      });
      console.log("Successfully triggered n8n to sync to MongoDB!");
    } catch (error) {
      console.error("n8n webhook failed to sync:", error);
    }

    addNewProduct(formattedProduct); showToast("Product Added!"); navigate('/admin');
  }

  const inputStyle ="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-colors font-bold text-slate-900 text-base shadow-inner";

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
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
                <select value={productType} onChange={handleTypeChange} className={inputStyle}>
                  <option>Solid</option>
                  <option>Liquid</option>
                </select>
              </div>
            </div>
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className={inputStyle}>
                {productType === 'Solid' ? (
                  <><option>Fruits</option><option>Vegetables</option><option>Pulses</option></>
                ) : (
                  <option>Oil</option>
                )}
              </select></div>
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Short Desc</label><textarea required rows="2" value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">About</label><textarea required rows="3" value={newProduct.about} onChange={e => setNewProduct({...newProduct, about: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 block">Product Image</label><input required type="file" accept="image/*,.pdf" onChange={e => { setFile(e.target.files[0]); setNewProduct({...newProduct, image: URL.createObjectURL(e.target.files[0])}); }} className="w-full border border-slate-200 p-2 rounded-xl bg-slate-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />{isUploading && <p className="text-sm font-bold text-blue-500 mt-2 animate-pulse">Uploading...</p>}</div>
            {newProduct.image && !isUploading && (
              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
                <img src={newProduct.image} alt="Preview" className="w-24 h-24 object-contain rounded-xl mix-blend-multiply" />
              </div>
            )}
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] space-y-6 border border-slate-200">
            <h3 className="font-black text-slate-900 text-xl border-b border-slate-200 pb-3">Specs</h3>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Selling Points</label><input value={newProduct.whyYouWillLoveThis} onChange={e => setNewProduct({...newProduct, whyYouWillLoveThis: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Shelf Life</label><input value={newProduct.shelfLife} onChange={e => setNewProduct({...newProduct, shelfLife: e.target.value})} className={inputStyle} /></div>
            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Storage</label><input value={newProduct.storage} onChange={e => setNewProduct({...newProduct, storage: e.target.value})} className={inputStyle} /></div>
          </div>
          <div className="md:col-span-2 mt-6"><motion.button disabled={isUploading} whileTap={{ scale: 0.95 }} type="submit" className="btn-3d btn-lime w-full py-5 text-xl font-black disabled:opacity-50 disabled:cursor-not-allowed">{isUploading ? 'Processing...' : 'Publish Product'}</motion.button></div>
        </form>
      </motion.div>
    </div>
  )
}