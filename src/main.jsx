import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import {App} from './App.jsx'
//import {App1} from './App1.jsx'
//import {App2} from './App2.jsx'
import {Task3} from './Task3.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Task3 />
  </StrictMode>,
)