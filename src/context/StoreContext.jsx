import { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, where, updateDoc } from "firebase/firestore";
import { auth } from '../firebase';

let hasAlertedQuota = false;
const safeJSONParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage, resetting it.`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};

const defaultProducts = [
  // FRUITS (14 Items)
  { 
    id: 'f1', 
    category: 'Fruits', 
    name: 'Apple', 
    price: 160, 
    image: 'https://res.cloudinary.com/dbnuemnv5/image/upload/v1773836115/apple_zomrrx.png',
    desc: 'Crisp, sweet, and sourced from high-altitude orchards.', 
    disabled: false,
    shelfLife: '5-7 Days',
    storage: 'Refrigerate to keep fresh.',
    about: 'Our Apples are handpicked from the best orchards in Himachal Pradesh. They are known for their distinct sweetness and crunch. Perfect for salads, pies, or a healthy snack.',
    whyYouWillLoveThis: ['High in Fiber', 'Rich in Vitamin C', '100% Organic']
  },
  { 
    id: 'f2', 
    category: 'Fruits',  
    name: 'Banana', 
    price: 60, 
    image: 'https://res.cloudinary.com/dbnuemnv5/image/upload/v1773838150/banana_wnjilr.png', 
    desc: 'Naturally sweet and rich in essential potassium.', 
    disabled: false,
    shelfLife: '3-4 Days',
    storage: 'Store at room temperature.',
    about: 'Bananas are a versatile fruit that provides instant energy. Great for smoothies, baking, or eating as is. Sourced from organic farms.',
    whyYouWillLoveThis: ['Energy Booster', 'Rich in Potassium', 'Good for Digestion']
  },
  { 
    id: 'f3', 
    category: 'Fruits', 
    name: 'Orange', 
    price: 120, 
    image: '/fruits/orange.png', 
    desc: 'Juicy and packed with Vitamin C.', 
    disabled: false,
    shelfLife: '7-10 Days',
    storage: 'Store in a cool, dry place.',
    about: 'Freshly picked sweet oranges, perfect for juicing or a healthy snack.',
    whyYouWillLoveThis: ['Immunity Booster', 'Citrus Goodness', '100% Organic']
  },
  { 
    id: 'f4', 
    category: 'Fruits', 
    name: 'Mango', 
    price: 250, 
    image: '/fruits/mango.png', 
    desc: 'King of fruits, sweet and incredibly pulpy.', 
    disabled: false,
    shelfLife: '3-5 Days',
    storage: 'Store at room temp until ripe.',
    about: 'Delicious Alphonso mangoes shipped directly from farms to your doorstep.',
    whyYouWillLoveThis: ['Rich in Vitamin A', 'Sweet & Pulpy', 'Farm Fresh']
  },
  { 
    id: 'f5', 
    category: 'Fruits', 
    name: 'Grapes', 
    price: 90, 
    image: '/fruits/grapes.png', 
    desc: 'Fresh, seedless green grapes.', 
    disabled: false,
    shelfLife: '4-5 Days',
    storage: 'Refrigerate in a perforated bag.',
    about: 'Plump and juicy green grapes that make for a perfect refreshing snack.',
    whyYouWillLoveThis: ['Antioxidant Rich', 'Seedless', 'Farm Fresh']
  },
  { 
    id: 'f6', 
    category: 'Fruits', 
    name: 'Watermelon', 
    price: 150, 
    image: '/fruits/watermelon.png', 
    desc: 'Refreshing, hydrating, and naturally sweet.', 
    disabled: false,
    shelfLife: '3-5 Days',
    storage: 'Refrigerate after cutting.',
    about: 'A summer favorite, our watermelons are incredibly juicy and thirst-quenching.',
    whyYouWillLoveThis: ['Hydrating', 'Low Calorie', 'Naturally Sweet']
  },
  { 
    id: 'f7', 
    category: 'Fruits', 
    name: 'Papaya', 
    price: 80, 
    image: '/fruits/papaya.png', 
    desc: 'Tropical fruit known for its digestive benefits.', 
    disabled: false,
    shelfLife: '3-4 Days',
    storage: 'Store at room temp until ripe.',
    about: 'Rich in antioxidants and papain, this tropical fruit is incredibly healthy.',
    whyYouWillLoveThis: ['Improves Digestion', 'Vitamin Rich', 'Organic']
  },
  { 
    id: 'f8', 
    category: 'Fruits', 
    name: 'Kiwi', 
    price: 200, 
    image: '/fruits/kiwi.png', 
    desc: 'Tangy and packed with Vitamin C.', 
    disabled: false,
    shelfLife: '5-7 Days',
    storage: 'Refrigerate to extend freshness.',
    about: 'A nutrient-dense fruit with a delightful balance of sweet and tart flavors.',
    whyYouWillLoveThis: ['Vitamin C Powerhouse', 'Tangy & Sweet', 'Exotic']
  },
  { 
    id: 'f9', 
    category: 'Fruits', 
    name: 'Strawberry', 
    price: 300, 
    image: '/fruits/strawberry.png', 
    desc: 'Juicy, red strawberries fresh from the farm.', 
    disabled: false,
    shelfLife: '2-3 Days',
    storage: 'Refrigerate immediately.',
    about: 'Sweet and slightly tart, perfect for desserts or eating fresh.',
    whyYouWillLoveThis: ['High Antioxidants', 'Farm Fresh', 'Delicious']
  },
  { 
    id: 'f10', 
    category: 'Fruits', 
    name: 'Pineapple', 
    price: 110, 
    image: '/fruits/pineapple.png', 
    desc: 'Sweet, tart, and tropical.', 
    disabled: false,
    shelfLife: '3-5 Days',
    storage: 'Store at room temp until cut.',
    about: 'Freshly harvested pineapples with a bright, vibrant flavor.',
    whyYouWillLoveThis: ['Tropical Flavor', 'Vitamin C', 'Immunity Booster']
  },
  { 
    id: 'f11', 
    category: 'Fruits', 
    name: 'Pomegranate', 
    price: 180, 
    image: '/fruits/promogrenate.png', 
    desc: 'Rich in antioxidants and deliciously sweet.', 
    disabled: false,
    shelfLife: '1-2 Weeks',
    storage: 'Store in a cool, dry place.',
    about: 'Juicy ruby-red seeds packed with vitamins and minerals.',
    whyYouWillLoveThis: ['Heart Healthy', 'Fresh', 'Organic']
  },
  { 
    id: 'f12', 
    category: 'Fruits', 
    name: 'Guava', 
    price: 90, 
    image: '/fruits/gwava.png', 
    desc: 'Tropical, sweet, and highly nutritious.', 
    disabled: false,
    shelfLife: '3-5 Days',
    storage: 'Refrigerate when ripe.',
    about: 'Freshly picked green guavas, perfect for snacking or juices.',
    whyYouWillLoveThis: ['High Vitamin C', 'Tropical Flavor', 'Farm Fresh']
  },
  { 
    id: 'f13', 
    category: 'Fruits', 
    name: 'Cherry', 
    price: 140, 
    image: '/fruits/cherry.png', 
    desc: 'Sweet, juicy, and rich in antioxidants.', 
    disabled: false,
    shelfLife: '5-7 Days',
    storage: 'Refrigerate to keep crisp.',
    about: 'Premium quality cherries grown in organic orchards.',
    whyYouWillLoveThis: ['High Antioxidants', 'Super Juicy', 'Pesticide Free']
  },
  { 
    id: 'f14', 
    category: 'Fruits', 
    name: 'Peach', 
    price: 220, 
    image: '/fruits/peach.png', 
    desc: 'Soft, fragrant, and incredibly juicy.', 
    disabled: false,
    shelfLife: '3-4 Days',
    storage: 'Refrigerate when ripe.',
    about: 'Sweet peaches that are perfect for desserts or eating fresh.',
    whyYouWillLoveThis: ['Sweet & Soft', 'Vitamin A', '100% Organic']
  },

  // VEGETABLES (14 Items)
  { 
    id: 'v1', 
    category: 'Vegetables', 
    name: 'Broccoli', 
    price: 80, 
    image: '/vegetables/Broccoli.png', 
    desc: 'Fresh, vibrant green broccoli rich in vitamins.', 
    disabled: false,
    shelfLife: '2-3 Days',
    storage: 'Refrigerate immediately.',
    about: 'Broccoli is a superfood loaded with fiber and antioxidants. Best consumed steamed or in stir-frys to retain its nutritional value.',
    whyYouWillLoveThis: ['Antioxidant Rich', 'Low Calorie', 'Vitamin K Source']
  },
  { 
    id: 'v2', 
    category: 'Vegetables', 
    name: 'Tomato', 
    price: 40, 
    image: '/vegetables/tomato.png', 
    desc: 'Farm fresh red tomatoes.', 
    disabled: false,
    shelfLife: '5-7 Days',
    storage: 'Keep at room temperature.',
    about: 'Essential for every kitchen, these tomatoes are perfectly ripe and incredibly juicy.',
    whyYouWillLoveThis: ['Rich in Lycopene', 'Fresh & Juicy', 'Pesticide Free']
  },
  { 
    id: 'v3', 
    category: 'Vegetables', 
    name: 'Carrot', 
    price: 60, 
    image: '/vegetables/carrot.png', 
    desc: 'Crunchy and sweet orange carrots.', 
    disabled: false,
    shelfLife: '1-2 Weeks',
    storage: 'Refrigerate in a crisper drawer.',
    about: 'Great for salads, cooking, or eating raw. Rich in Vitamin A and beta-carotene.',
    whyYouWillLoveThis: ['Good for Eyes', 'Super Crunchy', 'Organic']
  },
  { 
    id: 'v4', 
    category: 'Vegetables', 
    name: 'Onion', 
    price: 45, 
    image: '/vegetables/onion.png', 
    desc: 'Red onions with a sharp, bold flavor.', 
    disabled: false,
    shelfLife: '4-6 Weeks',
    storage: 'Store in a cool, dark place.',
    about: 'The flavor foundation for countless recipes. Long-lasting and tear-inducingly fresh.',
    whyYouWillLoveThis: ['Flavorful', 'Long Shelf Life', 'Daily Essential']
  },
  { 
    id: 'v5', 
    category: 'Vegetables', 
    name: 'Potato', 
    price: 35, 
    image: '/vegetables/potato.png', 
    desc: 'Versatile and essential kitchen staple.', 
    disabled: false,
    shelfLife: '3-4 Weeks',
    storage: 'Store in a cool, dark place.',
    about: 'Perfect for boiling, mashing, roasting, or frying.',
    whyYouWillLoveThis: ['Highly Versatile', 'Filling', 'Daily Staple']
  },
  { 
    id: 'v6', 
    category: 'Vegetables', 
    name: 'Cabbage', 
    price: 50, 
    image: '/vegetables/Cabbage.png', 
    desc: 'Crisp green cabbage, great for salads and cooking.', 
    disabled: false,
    shelfLife: '1-2 Weeks',
    storage: 'Refrigerate in a plastic bag.',
    about: 'Packed with nutrients and offers a great crunch.',
    whyYouWillLoveThis: ['High Fiber', 'Crunchy', 'Fresh']
  },
  { 
    id: 'v7', 
    category: 'Vegetables', 
    name: 'Cauliflower', 
    price: 65, 
    image: '/vegetables/Cauliflower.png', 
    desc: 'Fresh white cauliflower heads.', 
    disabled: false,
    shelfLife: '4-5 Days',
    storage: 'Refrigerate immediately.',
    about: 'A highly versatile vegetable, perfect for roasting or curries.',
    whyYouWillLoveThis: ['Low Carb', 'Nutrient Dense', 'Farm Fresh']
  },
  { 
    id: 'v8', 
    category: 'Vegetables', 
    name: 'Capsicum', 
    price: 70, 
    image: '/vegetables/Capsicum.png', 
    desc: 'Crunchy green bell peppers.', 
    disabled: false,
    shelfLife: '4-6 Days',
    storage: 'Refrigerate in the crisper.',
    about: 'Adds a mild, sweet flavor and a great crunch to any dish.',
    whyYouWillLoveThis: ['Rich in Vitamins', 'Crunchy', 'Great for Stir-fry']
  },
  { 
    id: 'v9', 
    category: 'Vegetables', 
    name: 'Cucumber', 
    price: 40, 
    image: '/vegetables/Cucumber.png', 
    desc: 'Crisp, hydrating, and fresh.', 
    disabled: false,
    shelfLife: '1 Week',
    storage: 'Refrigerate.',
    about: 'Perfect for salads and juices, naturally cooling and refreshing.',
    whyYouWillLoveThis: ['Hydrating', 'Low Calorie', 'Farm Fresh']
  },
  { 
    id: 'v10', 
    category: 'Vegetables', 
    name: 'Brinjal', 
    price: 50, 
    image: '/vegetables/Brinjal.png', 
    desc: 'Fresh purple eggplants.', 
    disabled: false,
    shelfLife: '4-5 Days',
    storage: 'Refrigerate.',
    about: 'Versatile and tender, ideal for curries and roasting.',
    whyYouWillLoveThis: ['High Fiber', 'Rich Flavor', 'Organic']
  },
  { 
    id: 'v11', 
    category: 'Vegetables', 
    name: 'Coriander Leaves', 
    price: 35, 
    image: '/vegetables/coriander leaves.png', 
    desc: 'Fresh, aromatic green coriander leaves.', 
    disabled: false,
    shelfLife: '3-5 Days',
    storage: 'Refrigerate.',
    about: 'Essential herb for garnishing and cooking. Adds a fresh, citrusy flavor to dishes.',
    whyYouWillLoveThis: ['Aromatic', 'Farm Fresh', 'Pesticide Free']
  },
  { 
    id: 'v12', 
    category: 'Vegetables', 
    name: 'Lettuce', 
    price: 60, 
    image: '/vegetables/Lettuce.png', 
    desc: 'Crisp, fresh green lettuce leaves.', 
    disabled: false,
    shelfLife: '5-7 Days',
    storage: 'Refrigerate.',
    about: 'Perfect for salads and sandwiches, offering a refreshing crunch and mild flavor.',
    whyYouWillLoveThis: ['Super Crisp', 'Hydrating', 'Organic']
  },
  { 
    id: 'v13', 
    category: 'Vegetables', 
    name: 'Lady Finger', 
    price: 55, 
    image: '/vegetables/ladifingur.png', 
    desc: 'Tender and fresh Bhindi.', 
    disabled: false,
    shelfLife: '3-4 Days',
    storage: 'Refrigerate in paper bag.',
    about: 'A favorite in Indian households, perfect for quick stir-frys.',
    whyYouWillLoveThis: ['Tender', 'Nutritious', 'Farm Fresh']
  },
  { 
    id: 'v14', 
    category: 'Vegetables', 
    name: 'Beetroot', 
    price: 45, 
    image: '/vegetables/rootbit.png', 
    desc: 'Earthy, sweet, and nutrient-dense red beetroots.', 
    disabled: false,
    shelfLife: '2-3 Weeks',
    storage: 'Store in cool dry place.',
    about: 'Rich in iron and antioxidants, perfect for salads, juices, or roasting.',
    whyYouWillLoveThis: ['High Iron', 'Superfood', 'Fresh']
  },

  // PULSES (14 Items)
  { 
    id: 'p1', 
    category: 'Pulses', 
    name: 'Black Gram', 
    price: 90, 
    image: '/pulses/Black Gram.png', 
    desc: 'Whole black gram, packed with nutrients.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'One of the best plant-based protein sources available. Great for hearty curries.',
    whyYouWillLoveThis: ['Maximum Protein', 'Healthy', 'Organic']
  },
  { 
    id: 'p2', 
    category: 'Pulses', 
    name: 'Chana Dal', 
    price: 120, 
    image: '/pulses/Chana Dal.png', 
    desc: 'Split chickpeas, packed with protein.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'A popular dal with a sweet and nutty flavor.',
    whyYouWillLoveThis: ['High Protein', 'Nutty Flavor', 'Unpolished']
  },
  { 
    id: 'p3', 
    category: 'Pulses', 
    name: 'Chickpea', 
    price: 180, 
    image: '/pulses/Chickpea.png', 
    desc: 'Large, premium white chickpeas.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in a dry place.',
    about: 'Ideal for making curries, salads, or hummus.',
    whyYouWillLoveThis: ['Protein Packed', 'Premium Quality', 'Unpolished']
  },
  { 
    id: 'p4', 
    category: 'Pulses', 
    name: 'Cowpea', 
    price: 110, 
    image: '/pulses/Cowpea.png', 
    desc: 'Nutritious Cowpea / Lobia.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in a dry place.',
    about: 'Earthy and quick-cooking, great for curries and salads.',
    whyYouWillLoveThis: ['Fiber Rich', 'Quick Cooking', 'Unpolished']
  },
  { 
    id: 'p5', 
    category: 'Pulses', 
    name: 'Green Gram', 
    price: 125, 
    image: '/pulses/Green Gram.png', 
    desc: 'Whole green moong beans.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'Perfect for sprouting, making salads, or cooking into a healthy dal.',
    whyYouWillLoveThis: ['Great for Sprouting', 'High Vitamins', 'Unpolished']
  },
  { 
    id: 'p6', 
    category: 'Pulses', 
    name: 'Horse Gram', 
    price: 85, 
    image: '/pulses/Horse Gram.png', 
    desc: 'Highly nutritious Kulthi dal.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'A lesser-known superfood pulse with exceptional health benefits.',
    whyYouWillLoveThis: ['Superfood', 'High Iron', 'Unpolished']
  },
  { 
    id: 'p7', 
    category: 'Pulses', 
    name: 'Kidney Beans', 
    price: 90, 
    image: '/pulses/Kidney Beans.png', 
    desc: 'Nutritious whole kidney beans.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'High in protein and fiber, great for curries and salads.',
    whyYouWillLoveThis: ['High Protein', 'Versatile', 'Unpolished']
  },
  { 
    id: 'p8', 
    category: 'Pulses', 
    name: 'Lentils', 
    price: 95, 
    image: '/pulses/Lentils.png', 
    desc: 'Dried healthy lentils.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'An essential ingredient for classic recipes and quick soups.',
    whyYouWillLoveThis: ['High Fiber', 'Quick Cooking', 'Premium Quality']
  },
  { 
    id: 'p9', 
    category: 'Pulses', 
    name: 'Masoor Dal', 
    price: 100, 
    image: '/pulses/Masoor Dal.png', 
    desc: 'Split red lentils, quick to cook.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'A fast-cooking, earthy lentil perfect for quick, healthy meals.',
    whyYouWillLoveThis: ['Quick Cooking', 'High Protein', 'Pesticide Free']
  },
  { 
    id: 'p10', 
    category: 'Pulses', 
    name: 'Moong Dal', 
    price: 110, 
    image: '/pulses/Moong Dal.png', 
    desc: 'Premium quality, unpolished yellow moong dal.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in a cool, dry place.',
    about: 'Our Moong Dal is unpolished and free from artificial chemicals. It cooks fast and is easy to digest.',
    whyYouWillLoveThis: ['High Protein', 'Unpolished', 'Easy Digest']
  },
  { 
    id: 'p11', 
    category: 'Pulses', 
    name: 'Moth Beans', 
    price: 110, 
    image: '/pulses/Moth Beans.png', 
    desc: 'Protein-packed Matki beans.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'Excellent for sprouting and making traditional misal.',
    whyYouWillLoveThis: ['Great for Sprouting', 'Nutrient Dense', 'Organic']
  },
  { 
    id: 'p12', 
    category: 'Pulses', 
    name: 'Rajma', 
    price: 160, 
    image: '/pulses/Rajma.png', 
    desc: 'Premium quality red kidney beans.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in a dry place.',
    about: 'Rich in protein and perfect for hearty curries. These beans boil incredibly soft and absorb flavors beautifully.',
    whyYouWillLoveThis: ['High Iron', 'Very Filling', 'Unpolished']
  },
  { 
    id: 'p13', 
    category: 'Pulses', 
    name: 'Toor Dal', 
    price: 140, 
    image: '/pulses/Toor Dal.png', 
    desc: 'Essential pigeon pea lentils.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in airtight container.',
    about: 'A staple for making classic Indian dal. Completely unpolished to retain maximum nutrients.',
    whyYouWillLoveThis: ['High Protein', 'Daily Staple', '100% Organic']
  },
  { 
    id: 'p14', 
    category: 'Pulses', 
    name: 'Urad Dal', 
    price: 130, 
    image: '/pulses/Urad Dal.png', 
    desc: 'Split black gram, essential for idli/dosa batter.', 
    disabled: false,
    shelfLife: '6 Months',
    storage: 'Store in a dry place.',
    about: 'Rich in dietary fiber and essential for many South Indian dishes.',
    whyYouWillLoveThis: ['Versatile', 'Fiber Rich', 'Organic']
  }
];

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const item = sessionStorage.getItem('currentUser');
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  });
  const [usersDB, setUsersDB] = useState(() => safeJSONParse('usersDB', []));
  const [deliveryPartners, setDeliveryPartners] = useState(() => safeJSONParse('deliveryPartners', []));
  const [userLocation, setUserLocation] = useState(() => localStorage.getItem('userLocation') || 'Ahmedabad, Gujarat');
  const [searchQuery, setSearchQuery] = useState('');

  // Start with default products, but we will overwrite this immediately with Firebase data
  const [products, setProducts] = useState(defaultProducts); 
  const [orders, setOrders] = useState(() => safeJSONParse('orders', []));
  const [cart, setCart] = useState(() => safeJSONParse('cart', []));
  const [wishlist, setWishlist] = useState(() => safeJSONParse('wishlist', []));
  const [salesHistory, setSalesHistory] = useState(() => safeJSONParse('salesHistory', []));
  const [toasts, setToasts] = useState([]);

  // Fetch Products from Firebase on App Load
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const db = getFirestore(auth.app);
        const querySnapshot = await getDocs(collection(db, "products"));
        
        if (querySnapshot.empty) {
          // First time setup: Seed Firestore with your default products
          for (const prod of defaultProducts) {
            await setDoc(doc(db, "products", prod.id), prod);
          }
          setProducts(defaultProducts);
        } else {
          // Load from Firestore
          const fbProducts = querySnapshot.docs.map(doc => doc.data());
          
          // Automatically add any missing default products to Firestore
          const missingProducts = defaultProducts.filter(dp => !fbProducts.some(fbp => fbp.id === dp.id));
          if (missingProducts.length > 0) {
            for (const prod of missingProducts) {
              await setDoc(doc(db, "products", prod.id), prod);
              fbProducts.push(prod);
            }
          }

          setProducts(fbProducts);
        }
      } catch (error) {
        console.error("Error fetching products from Firebase:", error);
      }
    };

    fetchProducts();

        // Fetch Delivery Partners from Firebase
        const fetchPartners = async () => {
          try {
            const db = getFirestore(auth.app);
            const q = query(collection(db, "users"), where("role", "==", "delivery"));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const fbPartners = querySnapshot.docs.map(doc => doc.data());
              setDeliveryPartners(fbPartners);
            }
          } catch (error) {
            console.error("Error fetching delivery partners:", error);
          }
        };
        fetchPartners();
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      } else {
        sessionStorage.removeItem('currentUser');
      }
      localStorage.removeItem('currentUser'); // Clean up old persistent login
      
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
      localStorage.setItem('deliveryPartners', JSON.stringify(deliveryPartners));
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
      localStorage.setItem('userLocation', userLocation);
    } catch (e) {
      console.warn("Storage Quota Exceeded! Could not save to localStorage.", e);
      if (!hasAlertedQuota) {
        alert("⚠️ Browser Memory is FULL! Your image could not be saved. Please right-click -> Inspect -> Application -> Local Storage -> Delete all data, then refresh.");
        hasAlertedQuota = true;
      }
    }
  }, [currentUser, usersDB, deliveryPartners, orders, cart, wishlist, salesHistory, userLocation]);

  const showToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Password Reset Methods
  const checkEmailExists = (email, role) => {
    if (role === 'admin') return email === 'somyapadhiyar@gmail.com';
    if (role === 'delivery') return deliveryPartners.some(d => d.email === email);
    return usersDB.some(u => u.email === email);
  };

  const resetPassword = (email, role, newPassword) => {
    if (role === 'admin') return { success: false, msg: 'Admin password cannot be reset.' };
    if (role === 'delivery') {
      const idx = deliveryPartners.findIndex(d => d.email === email);
      if (idx === -1) return { success: false, msg: 'Account not found.' };
      const updated = [...deliveryPartners];
      updated[idx].password = newPassword;
      setDeliveryPartners(updated);
      return { success: true };
    }
    const idx = usersDB.findIndex(u => u.email === email);
    if (idx === -1) return { success: false, msg: 'Account not found.' };
    const updated = [...usersDB];
    updated[idx].password = newPassword;
    setUsersDB(updated);
    return { success: true };
  };

  // Auth Methods
  const registerUser = (name, email, phone, address, password) => {
    if (usersDB.find(u => u.email === email)) return { success: false, msg: 'Email already exists!' };
    const newUser = { name, email, phone, address, password, role: 'user' };
    setUsersDB([...usersDB, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  };
  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    setUsersDB(prev => prev.map(u => u.email === updatedUser.email ? updatedUser : u));
  };
  const deleteUser = (email) => {
    setUsersDB(prev => prev.filter(u => u.email !== email));
    logout();
  };
  const registerDelivery = (name, email, phone, address, password, photoURL) => {
    if (deliveryPartners.find(d => d.email === email)) return { success: false, msg: 'Email already exists!' };
    const newPartner = { name, email, phone, address, password, role: 'delivery', status: 'Pending', photoURL };
    setDeliveryPartners([...deliveryPartners, newPartner]);
    return { success: true, msg: 'Request sent to Admin for approval!' };
  };
  const loginUser = (email, password, role) => {
    if (role === 'admin') {
      if (email === 'somyapadhiyar@gmail.com' && password === 'somya24092007') {
        setCurrentUser({ name: 'Admin', email, role: 'admin' });
        return { success: true };
      }
      return { success: false, msg: 'Invalid Admin Credentials' };
    }
    if (role === 'delivery') {
      const partner = deliveryPartners.find(d => d.email === email && d.password === password);
      if (!partner) return { success: false, msg: 'Invalid Credentials' };
      if (partner.status !== 'Approved') return { success: false, msg: 'Your account is pending admin approval.' };
      setCurrentUser(partner);
      return { success: true };
    }
    const user = usersDB.find(u => u.email === email && u.password === password);
    if (user) { 
      setCurrentUser(user); 
      return { success: true }; 
    }
    return { success: false, msg: 'Invalid Email or Password' };
  };
  const logout = () => setCurrentUser(null);

  // Admin Methods
  const approveDelivery = async (email) => {
    setDeliveryPartners(prev => prev.map(d => d.email === email ? { ...d, status: 'Approved' } : d));
    try {
      const db = getFirestore(auth.app);
      const q = query(collection(db, "users"), where("email", "==", email), where("role", "==", "delivery"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (document) => {
        await updateDoc(doc(db, "users", document.id), { status: 'Approved' });
      });
    } catch(e) { console.error("Error updating approval in Firestore:", e); }
  };
  
  const toggleProductStatus = async (id) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, disabled: !p.disabled } : p));
    const product = products.find(p => p.id === id);
    if (product) {
      try {
        const db = getFirestore(auth.app);
        await setDoc(doc(db, "products", id), { disabled: !product.disabled }, { merge: true });
      } catch(e) { console.error(e); }
    }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Delete this item?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(item => !item.id.startsWith(id))); // Remove variants
      try {
        const db = getFirestore(auth.app);
        await deleteDoc(doc(db, "products", id));
      } catch(e) { console.error(e); }
    }
  };

  const addNewProduct = async (product) => {
    // Parse "whyYouWillLoveThis" into an array if it comes as a comma-separated string from the UI
    const parsedReasons = Array.isArray(product.whyYouWillLoveThis) 
      ? product.whyYouWillLoveThis 
      : (product.whyYouWillLoveThis ? product.whyYouWillLoveThis.split(',').map(item => item.trim()).filter(Boolean) : []);

    const newProduct = { 
      ...product, 
      whyYouWillLoveThis: parsedReasons,
      id: `new_${Date.now()}`, 
      disabled: false, 
      stock: product.stock || 150, 
      sold: 0 
    };
    setProducts(prev => [newProduct, ...prev]);
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db, "products", newProduct.id), newProduct);
    } catch(e) { console.error(e); }
  };

  const editProduct = async (id, updatedData) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
    try {
      const db = getFirestore(auth.app);
      await setDoc(doc(db, "products", id), updatedData, { merge: true });
    } catch(e) { console.error(e); }
  };
  
  const placeOrder = (details) => {
    setProducts(prev => prev.map(p => {
      const cartItem = details.items.find(i => i.id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        try {
          const db = getFirestore(auth.app);
          setDoc(doc(db, "products", p.id), { stock: newStock }, { merge: true });
        } catch(e) { console.error(e); }
        return { ...p, stock: newStock };
      }
      return p;
    }));
    setOrders([{ id: 'ORD' + Date.now(), date: new Date().toLocaleString(), status: 'Pending', ...details }, ...orders]);
    setCart([]);
  };
  const updateOrderStatus = (id, status, partnerEmail = null) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        const updated = { ...o, status };
        if (partnerEmail) {
          updated.deliveryPartnerEmail = partnerEmail;
          const partner = deliveryPartners.find(d => d.email === partnerEmail);
          if (partner) {
            updated.deliveryPartner = { name: partner.name, phone: partner.phone };
          }
        }
        return updated;
      }
      return o;
    }));
  };

  // --- ZEPTO STYLE CART LOGIC ---
  // Add a specific pack (e.g. 500g). Quantity = Number of packs.
  const addToCart = (name, packPrice, qtyToAdd = 1, image, variantId) => {
    const product = products.find(p => p.id === variantId);
    setCart(prev => {
      const existing = prev.find(item => item.id === variantId);
      const currentQty = existing ? existing.quantity : 0;
      const newQty = currentQty + qtyToAdd;
      
      if (product && newQty > (product.stock || 0)) {
        showToast(`Only ${product.stock || 0} kg available in stock.`);
        return prev;
      }
      if (newQty > 20) { showToast("Max 20 packs allowed."); return prev; }
      
      const newTotal = packPrice * newQty;
      
      if (existing) {
        return prev.map(i => i.id === variantId ? {...i, quantity: newQty, total: newTotal} : i);
      }
      return [...prev, {id: variantId, name, price: packPrice, quantity: newQty, total: newTotal, image}];
    })
  };

  const decreaseCartQuantity = (variantId, qtyToSubtract = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === variantId);
      if (existing) {
        const newQty = existing.quantity - qtyToSubtract;
        if (newQty > 0) {
          return prev.map(i => i.id === variantId ? {...i, quantity: newQty, total: existing.price * newQty} : i);
        }
        return prev.filter(i => i.id !== variantId);
      }
      return prev;
    })
  };

  const removeFromCart = (variantId) => setCart(cart.filter(i => i.id !== variantId));
  const getCartTotal = () => cart.reduce((s, i) => s + i.total, 0);
  const toggleWishlist = (product) => setWishlist(prev => prev.some(i => i.id === product.id) ? prev.filter(i => i.id !== product.id) : [...prev, product]);

  return (
    <StoreContext.Provider value={{ 
      currentUser, setCurrentUser, updateUser, deleteUser, registerUser, registerDelivery, loginUser, logout, deliveryPartners, approveDelivery,
      userLocation, setUserLocation, searchQuery, setSearchQuery,
      products, toggleProductStatus, addNewProduct, deleteProduct, editProduct,
      orders, placeOrder, updateOrderStatus, salesHistory, showToast,
      cart, addToCart, removeFromCart, getCartTotal, decreaseCartQuantity, wishlist, toggleWishlist,
      checkEmailExists, resetPassword
    }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div layout key={toast.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="pointer-events-auto bg-gray-900 text-white shadow-xl p-4 rounded-xl flex items-center gap-4 min-w-[300px] border border-gray-700">
              <p className="text-[14px] font-bold flex-1">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext);