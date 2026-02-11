import React from "react";

function ProductCard(props) {
  return (
    <div className="w-[260px] bg-white rounded-xl shadow-lg p-4 
                    transform transition duration-300 hover:scale-105">

      <img
        src={props.image}
        alt={props.name}
        className="w-full h-[180px] object-cover rounded-md"
      />

      <h2 className="mt-3 text-lg font-semibold">{props.name}</h2>

      <p className="text-green-600 font-bold mt-1">
        ₹ {props.price}
      </p>

      <button
        className="mt-3 w-full py-2 bg-blue-600 text-white rounded-md
                   hover:bg-blue-500 transition duration-300"
      >
        Buy Now
      </button>
    </div>
  );
}

export {ProductCard};
