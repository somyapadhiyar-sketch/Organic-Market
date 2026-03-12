import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { Plus, Minus, MapPin, CreditCard, Banknote, CheckCircle2, Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Cart() {
  const { cart, addToCart, decreaseCartQuantity, getCartTotal, placeOrder, currentUser, showToast } = useStore()
  const total = getCartTotal()
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1 = Cart Review, 2 = Payment
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Address State
  const [address, setAddress] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    flat: '',
    area: ''
  });

  const grandTotal = total + (total > 500 ? 0 : 30) + 5; // 30 Delivery, 5 Handling

  const handleCheckout = () => {
    if (!currentUser) return showToast("Please login to place an order!");
    setStep(2);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.flat || !address.area) {
      return showToast("Please fill all delivery details!");
    }
    
    setIsProcessing(true);
    
    // Simulate real payment gateway delay
    setTimeout(() => {
      placeOrder({ 
        items: cart, 
        customer: address, 
        total: grandTotal, 
        paymentMethod,
        date: new Date().toLocaleString()
      });
      setIsProcessing(false);
      setOrderSuccess(true);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/user/home');
      }, 3000);
    }, 2000);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <CheckCircle2 size={80} className="text-[#0A8745] mb-6" />
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 font-medium text-lg">Your Zepto delivery partner is packing your order.</p>
        <p className="text-gray-400 mt-4">Redirecting to home...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans text-[#1C1C1C]">
      <Navbar />
      <main className="max-w-[1000px] mx-auto px-4 md:px-6 pt-[120px] pb-20">
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm mt-8">
            <div className="text-[80px] mb-4 opacity-80">🛒</div>
            <h2 className="text-[24px] font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-[15px] mb-8">Add items to start your basket.</p>
            <Link to="/user/fruits">
              <button className="px-8 py-3.5 bg-[#FF3269] text-white font-bold rounded-xl hover:bg-[#E21B70] transition-colors">Browse Products</button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* LEFT COLUMN: Cart Items OR Payment Form */}
            <div className="flex-1 space-y-6">
              
              {/* STEP 1: CART REVIEW */}
              {step === 1 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                    <span className="bg-[#E5F7ED] text-[#0A8745] text-xs font-black px-2.5 py-1 rounded">⚡ 10 MINS</span>
                    <span className="font-bold text-[15px] text-gray-800">Delivery to your location</span>
                  </div>

                  <div className="space-y-6">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                        <div className="w-16 h-16 bg-[#F8F8F8] border border-gray-200 rounded-xl p-2 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" onError={(e) => { e.target.src = `https://placehold.co/100x100/F8F8F8/767676?text=Img` }} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-[14px] text-gray-900 leading-tight">{item.name}</h4>
                          <p className="text-[12px] font-medium text-gray-500 mt-1">1 kg</p>
                          <p className="text-[15px] font-bold text-gray-900 mt-1">₹{item.price}</p>
                        </div>
                        <div className="flex items-center bg-[#FF3269] text-white rounded-lg h-9 shadow-sm">
                          <button onClick={() => decreaseCartQuantity(item.id, 1)} className="px-3 h-full flex items-center justify-center rounded-l-lg hover:bg-[#E21B70]"><Minus size={16} strokeWidth={3}/></button>
                          <span className="font-bold text-[14px] w-6 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item.name, item.price, 1, item.image, item.id)} className="px-3 h-full flex items-center justify-center rounded-r-lg hover:bg-[#E21B70]"><Plus size={16} strokeWidth={3}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: ADDRESS & PAYMENT SECURE CHECKOUT */}
              {step === 2 && (
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Address Section */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-[18px] mb-4 text-gray-900 flex items-center gap-2"><MapPin size={20} className="text-[#FF3269]" /> Delivery Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required type="text" placeholder="Full Name" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF3269] font-medium text-[14px]" />
                      <input required type="tel" maxLength="10" placeholder="10-digit Mobile Number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value.replace(/\\D/g, '')})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF3269] font-medium text-[14px]" />
                      <input required type="text" placeholder="Flat / House / Office No." value={address.flat} onChange={e => setAddress({...address, flat: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF3269] font-medium text-[14px]" />
                      <input required type="text" placeholder="Area, Street, Sector" value={address.area} onChange={e => setAddress({...address, area: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#FF3269] font-medium text-[14px]" />
                    </div>
                  </div>

                  {/* Payment Methods Section */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-[18px] mb-4 text-gray-900 flex items-center gap-2"><CreditCard size={20} className="text-[#FF3269]" /> Payment Method</h3>
                    <div className="space-y-3">
                      
                      <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[#FF3269] bg-[#FFF5F7]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="w-4 h-4 text-[#FF3269] focus:ring-[#FF3269] border-gray-300" />
                        <div className="ml-3 flex-1">
                          <span className="block text-[15px] font-bold text-gray-900">Google Pay / PhonePe / UPI</span>
                          <span className="block text-[12px] text-gray-500">Pay instantly via any UPI app</span>
                        </div>
                        <img src="https://cdn-icons-png.flaticon.com/512/12140/12140590.png" className="w-8 h-8 opacity-80" alt="UPI" />
                      </label>

                      <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-[#FF3269] bg-[#FFF5F7]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="w-4 h-4 text-[#FF3269] focus:ring-[#FF3269] border-gray-300" />
                        <div className="ml-3 flex-1">
                          <span className="block text-[15px] font-bold text-gray-900">Credit / Debit Card</span>
                          <span className="block text-[12px] text-gray-500">Visa, MasterCard, RuPay</span>
                        </div>
                        <CreditCard className="w-6 h-6 text-gray-400" />
                      </label>

                      <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#FF3269] bg-[#FFF5F7]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="w-4 h-4 text-[#FF3269] focus:ring-[#FF3269] border-gray-300" />
                        <div className="ml-3 flex-1">
                          <span className="block text-[15px] font-bold text-gray-900">Cash on Delivery</span>
                          <span className="block text-[12px] text-gray-500">Pay at your doorstep</span>
                        </div>
                        <Banknote className="w-6 h-6 text-gray-400" />
                      </label>

                    </div>
                  </div>

                  {/* Hidden Submit Button triggered by Right Panel */}
                  <button id="real-checkout-btn" type="submit" className="hidden"></button>
                </form>
              )}
            </div>

            {/* RIGHT COLUMN: Bill Details */}
            <div className="w-full lg:w-[350px]">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm sticky top-[100px]">
                <h3 className="font-bold text-[16px] mb-4 text-gray-900 border-b border-gray-100 pb-3">Bill Details</h3>
                <div className="space-y-3 text-[14px] text-gray-600 font-medium mb-4">
                  <div className="flex justify-between"><span>Item Total</span><span>₹{total}</span></div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    {total > 500 ? <span className="text-[#0A8745]">FREE</span> : <span>₹30</span>}
                  </div>
                  <div className="flex justify-between"><span>Handling Charge</span><span>₹5</span></div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-4 mb-6">
                  <span className="font-bold text-[16px] text-gray-900">Grand Total</span>
                  <span className="font-black text-[22px] text-gray-900">₹{grandTotal}</span>
                </div>

                {step === 1 ? (
                  <button onClick={handleCheckout} className="w-full py-4 bg-[#FF3269] text-white font-bold text-[16px] rounded-xl hover:bg-[#E21B70] transition-colors">
                    Select Address at Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => document.getElementById('real-checkout-btn').click()} 
                    disabled={isProcessing}
                    className="w-full py-4 bg-[#0A8745] text-white font-bold text-[16px] rounded-xl hover:bg-[#086a36] transition-colors flex justify-center items-center gap-2 disabled:bg-gray-400"
                  >
                    {isProcessing ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : `Pay ₹${grandTotal} Securely`}
                  </button>
                )}
                
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="w-full mt-3 py-3 text-gray-500 font-bold text-[13px] hover:text-gray-800">
                    ← Back to Cart
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}