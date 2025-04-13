import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ContextWrapper } from './state-management/ContextWrapper.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ContextWrapper>
        <App />
      </ContextWrapper>
    </BrowserRouter>
  
  </StrictMode>,
)
