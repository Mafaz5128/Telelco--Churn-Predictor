import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import ChurnApp from './ChurnApp'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChurnApp />
  </React.StrictMode>
)