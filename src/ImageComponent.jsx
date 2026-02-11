import React from "react";

function ImageComponent(props) {
  return (
    <div className="w-[300px] p-4 rounded-xl bg-gradient-to-br from-rose-300 via-slate-400 to-gray-500 text-white text-center shadow-xl transform transition duration-300 hover:scale-105">
      
      <img
        src={props.image}
        alt={props.text}
        className="w-[300px] h-[200px] object-cover rounded-lg"
      />

      <p className="mt-3 text-lg font-semibold">{props.text}</p>

      <button
        className="mt-3 px-4 py-2 rounded-full bg-yellow-400 text-black font-semibold hover:bg-yellow-300 transition duration-300 animate-pulse"
      >
        Explore
      </button>
    </div>
  );
}

export {ImageComponent};
