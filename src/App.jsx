import './App.css'
import { Home1 } from './Home1'

function App() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-purple-200 to-sky-500 py-10 px-6">
        <h1 className="text-3xl font-bold text-center text-black mb-10">
          Departments
        </h1> 

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          <Home1
            Title="ICT Engineering"
            Description="Computer Engineering is a four year undergraduate programme introducing its students to realms of computer, including the theory and design of data storage, software, operating systems."
          />

          <Home1
            Title="IT Engineering"
            Description="Information Technology is an undergraduate engineering course which focuses on expanding and growing in terms of dissemination of knowledge within and outside curriculum and skill development activities."
          />

          <Home1
            Title="Computer Science"
            Description="Computer Engineering with ML & AI at Silver Oak University is a 4-year undergraduate specialization programme that presents a solid foundation in the principles and technologies to get on the path of an exciting, sprouting career."
          />
        </div>
      </div>
    </>
  )
}

export { App }










/*import React from 'react';
import {Home1} from "./Home1";
function App() {
  return (
    <div>
      <Home1 name="Somya Padhiyar" age={20} />
    </div>
  )
}

export {App};*/





/*import React from 'react';
function App() {
const count = 0;
return (
<div >
<h1>{count}</h1>
</div>
);
} export {App};*/






/*import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [value, setValue] = useState("");

  const handleClick = (val) => {
    setValue(value + val);
  };

  const calculate = () => {
    try {
      setValue(eval(value).toString());
    } catch {
      setValue("Error");
    }
  };
 
  const clear = () => setValue(""); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-300 to-rose-300">
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl shadow-lg p-4">
        
        <input
          type="text"
          value={value}
          readOnly
          className="w-full h-16 mb-4 text-right text-2xl px-4 rounded-xl bg-black text-white"
        />

        <div className="grid grid-cols-4 gap-3">
          {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","+"] .map(btn => (
            <button
              key={btn}
              onClick={() => handleClick(btn)}
              className="h-14 rounded-xl bg-slate-700 text-white text-xl active:scale-95"
            >
              {btn}
            </button>
          ))}

          <button
            onClick={calculate}
            className="col-span-2 h-14 rounded-xl bg-green-500 text-xl font-semibold active:scale-95"
          >
            =
          </button>

          <button
            onClick={clear}
            className="col-span-2 h-14 rounded-xl bg-red-500 text-xl font-semibold active:scale-95"
          >
            C
          </button>
        </div>
      </div>
    </div>
  );
};
export  {App}*/