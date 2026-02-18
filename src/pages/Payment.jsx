import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function Payment() {
  const { cart, getCartTotal, clearCart } = useCart()

  const [step, setStep] = useState(1)
  
  const [tip, setTip] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [orderPlaced, setOrderPlaced] = useState(false)

  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    address: '',
    type: 'Home' 
  })

  const itemTotal = getCartTotal()
  const deliveryCharge = itemTotal > 500 ? 0 : 50
  const handlingCharge = 5
  const grandTotal = itemTotal + deliveryCharge + handlingCharge + tip

  const handleAddressSubmit = (e) => {
    e.preventDefault()

    if (!userDetails.name || !userDetails.phone || !userDetails.address) {
      return alert("Please fill in all address details.")
    }
    setStep(2)
  }

  const handlePlaceOrder = () => {
    if (cart.length === 0) return alert("Your cart is empty")

    setTimeout(() => {
      clearCart()
      setOrderPlaced(true)
    }, 1500)
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center animate-zoom-in">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-rope-drop">
            <span className="text-5xl">🎉</span>
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Order Confirmed!</h2>
          <p className="text-slate-500 mb-8">Your organic order will be delivered to <b>{userDetails.type}</b> in 12 minutes.</p>
          <Link to="/" className="block w-full py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-200">
            Shop More
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">

      <header className="bg-white sticky top-0 z-50 px-4 py-3 shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="p-2 hover:bg-slate-100 rounded-full transition">←</button>
          ) : (
            <Link to="/cart" className="p-2 hover:bg-slate-100 rounded-full transition">←</Link>
          )}
          <div>
            <h1 className="text-lg font-bold">{step === 1 ? 'Add Delivery Address' : 'Select Payment'}</h1>
            <p className="text-xs text-slate-500">Step {step} of 2</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-6">

          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-fade-in-up">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                📍 Enter Details
              </h3>
              <form id="address-form" onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Name</label>
                  <input 
                    required 
                    value={userDetails.name}
                    onChange={(e) => setUserDetails({...userDetails, name: e.target.value})}
                    placeholder="Receiver's Name" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" 
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone</label>
                  <input 
                    required 
                    type="tel"
                    value={userDetails.phone}
                    onChange={(e) => setUserDetails({...userDetails, phone: e.target.value})}
                    placeholder="10-digit Mobile Number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Flat / Area / Landmark</label>
                  <textarea 
                    required 
                    rows="3"
                    value={userDetails.address}
                    onChange={(e) => setUserDetails({...userDetails, address: e.target.value})}
                    placeholder="Enter complete address details here..." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-green-500" 
                  />
                </div>

                <div className="md:col-span-2 flex gap-3 mt-2">
                  {['Home', 'Work', 'Other'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setUserDetails({...userDetails, type: type})}
                      className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                        userDetails.type === type 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="md:col-span-2 mt-4">
                  <button type="submit" className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition">
                    Save Address & Proceed
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in-up">

              <div className="bg-white p-4 rounded-xl border border-green-200 bg-green-50 flex justify-between items-center">
                 <div>
                   <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold bg-green-200 text-green-800 px-2 py-0.5 rounded uppercase">{userDetails.type}</span>
                      <h4 className="font-bold text-slate-800">{userDetails.name}</h4>
                   </div>
                   <p className="text-sm text-slate-600 truncate max-w-[200px] sm:max-w-sm">{userDetails.address}</p>
                 </div>
                 <button onClick={() => setStep(1)} className="text-xs font-bold text-green-700 uppercase hover:underline">Change</button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-lg mb-4 text-slate-700">Recommended</h3>
                <div className="space-y-4">
                  
                  {/* UPI */}
                  <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${paymentMethod === 'upi' ? 'border-green-500 bg-green-50/30' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-4 p-4 cursor-pointer">
                      <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-green-600 w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">UPI Options</div>
                        <div className="text-xs text-slate-500">GPay, PhonePe, Paytm</div>
                      </div>
                      <span className="text-2xl grayscale opacity-70">📱</span>
                    </label>
                    {paymentMethod === 'upi' && (
                      <div className="px-4 pb-4 animate-fade-in-down">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 flex gap-2">
                           <input placeholder="e.g. 9876543210@upi" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-green-500 text-sm" />
                           <button className="px-4 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">VERIFY</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${paymentMethod === 'card' ? 'border-green-500 bg-green-50/30' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-4 p-4 cursor-pointer">
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="accent-green-600 w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">Credit / Debit Card</div>
                        <div className="text-xs text-slate-500">Visa, Mastercard, Rupay</div>
                      </div>
                      <span className="text-2xl grayscale opacity-70">💳</span>
                    </label>
                    {paymentMethod === 'card' && (
                      <div className="px-4 pb-4 animate-fade-in-down">
                        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                          <input maxLength="19" placeholder="Card Number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          <div className="flex gap-3">
                            <input placeholder="MM/YY" className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            <input type="password" maxLength="3" placeholder="CVV" className="w-24 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* COD */}
                  <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50/30' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-4 p-4 cursor-pointer">
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-green-600 w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">Pay on Delivery</div>
                        <div className="text-xs text-slate-500">Cash or UPI at doorstep</div>
                      </div>
                      <span className="text-2xl grayscale opacity-70">💵</span>
                    </label>
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-slate-700">Order Summary</h3>

            {step === 2 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Tip your partner</p>
                <div className="flex gap-2">
                  {[20, 30, 50].map((amount) => (
                    <button 
                      key={amount}
                      onClick={() => setTip(tip === amount ? 0 : amount)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        tip === amount ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between"><span>Item Total</span><span>₹{itemTotal}</span></div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className={deliveryCharge === 0 ? "text-green-600 font-bold" : ""}>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between"><span>Handling Charge</span><span>₹{handlingCharge}</span></div>
              {tip > 0 && <div className="flex justify-between text-green-600"><span>Delivery Tip</span><span>₹{tip}</span></div>}
            </div>
            
            <div className="my-4 p-3 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center">
               <span className="text-green-700 font-bold text-sm">Grand Total</span>
               <span className="text-green-700 font-black text-xl">₹{grandTotal}</span>
            </div>

            {step === 1 ? (
              <button 
                onClick={handleAddressSubmit}
                className="w-full py-4 bg-slate-300 text-slate-600 font-bold rounded-xl cursor-not-allowed"
              >
                Enter Address to Proceed
              </button>
            ) : (
              <button 
                onClick={handlePlaceOrder}
                className="w-full py-4 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all flex justify-between px-6"
              >
                <span>PAY NOW</span>
                <span>₹{grandTotal}</span>
              </button>
            )}
            
            <div className="text-center mt-4 flex items-center justify-center gap-2 opacity-60">
               <span className="text-xs">🔒 100% Safe & Secure Payments</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}