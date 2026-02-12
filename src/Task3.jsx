import React from "react";
import {products} from "./ImageData";

function Task3() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
      
      <div className="w-full max-w-7xl text-center px-4">
        <h1 className="text-4xl font-bold text-white mb-12 animate-pulse">
          E-Commerce Store
        </h1>

        {/* Television Section */}
        <h2 className="text-3xl font-bold text-white mb-6">
          Television
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center mb-16">
          {products
            .filter((item) => item.category === "Television")
            .map((item) => (
              <div
                key={item.index}
                className="bg-white w-64 rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
              >
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {item.category}
                  </h3>
                  <p className="text-xl font-bold text-indigo-600 mt-2">
                    ₹ {item.price}
                  </p>
                  {/* Add to Cart Button */}
                  <button className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Mobile Section */}
        <h2 className="text-3xl font-bold text-white mb-6">
          Mobile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center mb-16">
          {products
            .filter((item) => item.category === "Mobile")
            .map((item) => (
              <div
                key={item.index}
                className="bg-white w-64 rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
              >
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {item.category}
                  </h3>
                  <p className="text-xl font-bold text-indigo-600 mt-2">
                    ₹ {item.price}
                  </p>
                  {/* Add to Cart Button */}
                  <button className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Air Conditioner Section */}
        <h2 className="text-3xl font-bold text-white mb-6">
          Air Conditioner
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center mb-16">
          {products
            .filter((item) => item.category === "Air Conditioner")
            .map((item) => (
              <div
                key={item.index}
                className="bg-white w-64 rounded-2xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105"
              >
                <img
                  src={item.image}
                  alt={item.category}
                  className="w-full h-44 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    {item.category}
                  </h3>
                  <p className="text-xl font-bold text-indigo-600 mt-2">
                    ₹ {item.price}
                  </p>
                  {/* Add to Cart Button */}
                  <button className="mt-4 w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
        </div>

      </div>
    </div>
  );
}

export {Task3};
