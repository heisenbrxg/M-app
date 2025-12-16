import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MigraineProvider } from './context/MigraineContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <MigraineProvider>
        <App />
      </MigraineProvider>
    </AuthProvider>
  </StrictMode>,
)
