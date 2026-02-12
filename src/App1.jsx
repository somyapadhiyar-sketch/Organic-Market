import React from "react";
import {ProductCard} from "./ProductCard";

// Imported downloaded images
import watch from "./assets/watch.jpg";
import headphones from "./assets/headphone.jpg";
import tv from "./assets/tv.jpg"; 
import laptop from "./assets/laptop.jpg";
import phone from "./assets/phone.jpg";
import camera from "./assets/camera.jpg";

function App1() {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-r from-slate-100 to-slate-200">
      <h1 className="text-3xl font-bold text-center mb-8">
        Day 2 Task 2
      </h1>

      <div className="flex flex-row flex-wrap justify-center gap-8">
        <ProductCard image={watch} name="Smart Watch" price="2999" />
        <ProductCard image={headphones} name="Headphones" price="1999" />
        <ProductCard image={tv} name="tv" price="35499" />
        <ProductCard image={laptop} name="Laptop" price="74999" />
        <ProductCard image={phone} name="Smart Phone" price="149999" />
        <ProductCard image={camera} name="Camera" price="49999" />
      </div>
    </div>
  );
}

export {App1};

