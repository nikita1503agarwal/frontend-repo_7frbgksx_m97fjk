import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Test from './Test'
import TenantReport from './components/TenantReport'
import PropertyIssues from './components/PropertyIssues'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test" element={<Test />} />
        <Route path="/tenant" element={<TenantReport />} />
        <Route path="/property/:id/issues" element={<PropertyIssues />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
