export default function App2() {
    const images=[ 
        {
            image:"https://images.unsplash.com/photo-1661950159450-566edc48747d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80", 
            text:"Hello World" ,
            price: 50, 
        },
        {  
            image:"https://images.unsplash.com/photo-1661950159450-566edc48747d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
            text:"Art by me" , 
            price:100, 
        } 
    ] 
    return( 
    <div style={{display:'flex' ,justifyContent:"space-evenly"}}> 
    {images.map((im) => <div> <img src={im.image}/> <h1>{im.text}</h1> 
    <h1> {im.price}$</h1> </div>)} 
    </div> 
    ) 
} 
export {App2};



/*Array-Map Method for images only 

export default function App2() { 
    const images=[
        "https://images.unsplash.com/photo-1661950159450-566edc48747d?ixlib=rb1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80", "https://images.unsplash.com/photo-1661950159450-566edc48747d?ixlib=rb1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80" 
    ] 
    return( 
    <div>
        {images.map((im) => <div> <img src={im}/> </div>)} 
    </div>
    )
}
export {App2};*/


/*array filter :

import React from "react"; 
import "./App.css"; 
 
 
function App2() { 
    const price = [1,2,3,4,5,6] 
    const newArray = price.filter((num)=>{ 
    if(num===3) 
    { 
        return false; 
    } 
    else 
    { 
        return true;  
    } 
    }) 
return <div> 
    { 
      newArray.map((index)=> <h1>{index}</h1>) 
    } 
  </div>; 
} 
export {App2};*/


/*Array Mapping:

import React from "react"; 
const price = [1,2,3,4,5,6] 
function App2() { 
  return <div> 
    { 
      price.map((index)=> <h1>{index}</h1>) 
    } 
  </div>; 
} 
export {App2};*/ 