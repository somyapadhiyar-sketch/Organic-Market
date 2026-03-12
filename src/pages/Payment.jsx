import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { useState } from 'react'

export default function Payment() {
  const { cart, getCartTotal, clearCart, placeOrder, showToast } = useStore()
  const [step, setStep] = useState(1)
  const [tip, setTip] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [userDetails, setUserDetails] = useState({ name: '', phone: '', address: '', type: 'Home' })

  const itemTotal = getCartTotal()
  const deliveryCharge = itemTotal > 500 ? 0 : 50
  const handlingCharge = 5
  const grandTotal = itemTotal + deliveryCharge + handlingCharge + tip

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    if (!userDetails.name || !userDetails.phone || !userDetails.address) return showToast("Please fill in all details.")
    if (userDetails.phone.length < 10) return showToast("Please enter a valid 10-digit mobile number.")
    setStep(2)
  }

  const handlePlaceOrder = () => {
    if (cart.length === 0) return showToast("Your cart is empty")
    placeOrder({ items: cart, customer: userDetails, total: grandTotal, paymentMethod })
    setTimeout(() => setOrderPlaced(true), 1000)
  }

  if (orderPlaced) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center animate-zoom-in">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-5xl">🎉</span></div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">Order Confirmed!</h2>
        <p className="text-slate-500 mb-8">Your organic order is on the way to <b>{userDetails.type}</b>.</p>
        <Link to="/user/home" className="block w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">Shop More</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="bg-white sticky top-0 z-50 px-4 py-4 shadow-sm border-b border-slate-100">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {step === 2 ? <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full transition">←</button> : <Link to="/user/cart" className="p-2 hover:bg-slate-100 rounded-full transition">←</Link>}
            <h1 className="text-xl font-black text-slate-800">{step === 1 ? 'Delivery Address' : 'Payment'}</h1>
          </div>
          <p className="text-sm font-bold text-slate-400">Step {step} of 2</p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">📍 Enter Details</h3>
              <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label><input required value={userDetails.name} onChange={(e) => setUserDetails({...userDetails, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-green-500 outline-none" /></div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label>
                  <input required type="tel" maxLength="10" placeholder="10-digit Mobile Number" value={userDetails.phone} onChange={(e) => setUserDetails({...userDetails, phone: e.target.value.replace(/\D/g, '')})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-green-500 outline-none" />
                </div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Address</label><textarea required rows="3" value={userDetails.address} onChange={(e) => setUserDetails({...userDetails, address: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-green-500 outline-none" /></div>
                <div className="md:col-span-2 flex gap-3 mt-2">
                  {['Home', 'Work', 'Other'].map(type => (<button key={type} type="button" onClick={() => setUserDetails({...userDetails, type: type})} className={`px-4 py-2 rounded-full text-sm font-bold border transition ${userDetails.type === type ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-500'}`}>{type}</button>))}
                </div>
                <div className="md:col-span-2 mt-4"><button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition">Save & Proceed</button></div>
              </form>
            </div>
          )}
          {step === 2 && (
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="font-bold text-lg mb-4 text-slate-700">Recommended Payment</h3>
               <div className="border rounded-xl overflow-hidden border-green-500 bg-green-50/30">
                  <label className="flex items-center gap-4 p-4 cursor-pointer">
                    <input type="radio" checked readOnly className="accent-green-600 w-5 h-5" />
                    <div className="flex-1"><div className="font-bold text-slate-800">Pay on Delivery</div></div><span className="text-2xl">💵</span>
                  </label>
               </div>
             </div>
          )}
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-slate-700">Order Summary</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Item Total</span><span>₹{itemTotal}</span></div>
              <div className="flex justify-between"><span>Delivery Charge</span><span className="text-green-600 font-bold">{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span></div>
            </div>
            <div className="my-4 p-3 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
               <span className="text-green-700 font-bold text-sm">Grand Total</span><span className="text-green-700 font-black text-xl">₹{grandTotal}</span>
            </div>
            {step === 2 && (<button onClick={handlePlaceOrder} className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all flex justify-between px-6"><span>PAY NOW</span><span>₹{grandTotal}</span></button>)}
          </div>
        </div>
      </main>
    </div>
  )
}