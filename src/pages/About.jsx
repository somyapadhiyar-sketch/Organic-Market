import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useStore } from '../context/StoreContext'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

export default function About() {
  const { currentUser } = useStore()
  const navigate = useNavigate()

  const videoRef = useRef(null);
  const isVideoInView = useInView(videoRef, { margin: "-100px" });

  useEffect(() => {
    if (currentUser?.role === 'admin') navigate('/admin', { replace: true });
    else if (currentUser?.role === 'delivery') navigate('/delivery', { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    if (videoRef.current) {
      if (isVideoInView) {
        videoRef.current.play().catch(() => {
          videoRef.current.muted = true;
          videoRef.current.play().catch(console.error);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoInView]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-16 pt-[140px] overflow-hidden">
        
        {/* Main Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: false }} 
          transition={{ duration: 0.6 }} 
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Our Story</h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Discover the journey behind your fresh, chemical-free groceries.</p>
        </motion.div>

        {/* Highlight Video Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          whileInView={{ opacity: 1, scale: 1 }} 
          viewport={{ once: false, margin: "-100px" }} 
          transition={{ duration: 0.8 }} 
          className="mb-24 w-full rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100 bg-black"
        >
          <video ref={videoRef} controls playsInline loop className="w-full aspect-video object-cover">
            <source src="https://res.cloudinary.com/dbnuemnv5/video/upload/v1774002834/organic_store_wjdjxe.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>
 
        {/* Animated Story Sections */}
        <div className="space-y-24 md:space-y-32 mb-20">
          
          {/* Block 1 */}
          <div
            className="flex flex-col md:flex-row items-center gap-12 lg:gap-20"
          >
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8 }} className="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-xl shadow-green-100 border border-slate-100 bg-slate-50">
              <img src="https://res.cloudinary.com/dbnuemnv5/image/upload/v1773909105/1_kaxbih.png" alt="Pure and Natural" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" onError={e => e.target.src="https://placehold.co/800x600/E2E8F0/94A3B8?text=Image+1"} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl font-black text-slate-800 mb-4">A Simple Mission</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">At our store, we believe that healthy living starts with pure and natural food. Our journey began with a simple mission — to make fresh, organic groceries easily available for everyone.</p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">In today’s fast-paced world, many fruits and vegetables are grown using chemicals that can harm both our health and the environment. We wanted to create a better alternative by bringing truly natural and chemical-free products to people’s homes.</p>
            </motion.div>
          </div>

          {/* Block 2 (Reversed side) */}
          <div 
            className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-20"
          >
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8 }} className="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-xl shadow-blue-100 border border-slate-100 bg-slate-50">
              <img src="https://res.cloudinary.com/dbnuemnv5/image/upload/v1773909106/2_jxvxza.png" alt="Trusted Farmers" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" onError={e => e.target.src="https://placehold.co/800x600/E2E8F0/94A3B8?text=Image+2"} />     
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl font-black text-slate-800 mb-4">Direct from Trusted Farmers</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">To make this possible, we work directly with trusted farmers who grow fruits, vegetables, and pulses using natural farming methods. By connecting farmers directly with customers, we ensure that the food you receive is fresh, authentic, and responsibly sourced.</p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">Our goal is not only to provide organic products but also to make them accessible and convenient. With our fast delivery system, your groceries reach your doorstep in just 12 to 15 minutes, ensuring freshness every time.</p>
            </motion.div>
          </div>
      
          {/* Block 3 */}
          <div    
            className="flex flex-col md:flex-row items-center gap-12 lg:gap-20"
          >
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8 }} className="w-full md:w-1/2 rounded-[2rem] overflow-hidden shadow-xl shadow-orange-100 border border-slate-100 bg-slate-50">
              <img src="https://res.cloudinary.com/dbnuemnv5/image/upload/v1773909105/3_oepx1w.png" alt="Fast Delivery" className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700" onError={e => e.target.src="https://placehold.co/800x600/E2E8F0/94A3B8?text=Image+3"} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full md:w-1/2 space-y-6">
              <h3 className="text-3xl font-black text-slate-800 mb-4">Bridging the Gap</h3>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">We are more than just a grocery platform. We are a bridge between hardworking farmers and health-conscious families.</p>
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100 mt-6 shadow-sm">
                <p className="text-xl font-bold text-green-800 leading-relaxed italic">"Our promise is simple — fresh from the farm, chemical-free, and delivered quickly to your home."</p>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}