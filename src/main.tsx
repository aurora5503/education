import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ContentPackProvider } from './content/ContentPackProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentPackProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ContentPackProvider>
  </StrictMode>,
)
