import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { DoctorCreatePage } from './pages/DoctorCreatePage'
import { PatientTopicPage } from './pages/PatientTopicPage'
import { PrefillDemoPage } from './pages/PrefillDemoPage'

function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-block">
          <p className="brand-kicker">Psychiatry Education Platform</p>
          <span className="brand-title">明亮版精神科衛教平台 MVP</span>
        </div>
        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink to="/doctor/create" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            醫師端
          </NavLink>
          <NavLink
            to="/patient/topic/major-depression"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            病人端
          </NavLink>
          <NavLink to="/dev/prefill-demo" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            HIS 模擬
          </NavLink>
        </nav>
      </header>

      <main className="site-main">
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/create" replace />} />
          <Route path="/doctor/create" element={<DoctorCreatePage />} />
          <Route path="/patient/topic/:slug" element={<PatientTopicPage />} />
          <Route path="/dev/prefill-demo" element={<PrefillDemoPage />} />
          <Route path="*" element={<Navigate to="/doctor/create" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
