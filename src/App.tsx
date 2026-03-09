import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { ContentEditorPage } from './pages/ContentEditorPage'
import { DoctorCreatePage } from './pages/DoctorCreatePage'
import { PatientTopicPage } from './pages/PatientTopicPage'

function App() {
  const location = useLocation()
  const isPatientRoute = location.pathname.startsWith('/patient/topic/')

  return (
    <div className={`app-shell${isPatientRoute ? ' patient-app-shell' : ''}`}>
      {isPatientRoute ? null : (
        <header className="site-header">
          <div className="brand-block">
            <p className="brand-kicker">Psychiatry Education Platform</p>
            <span className="brand-title">精神科個人化衛教平台</span>
          </div>
          <nav className="site-nav" aria-label="Primary navigation">
            <NavLink to="/doctor/content" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              內容編輯
            </NavLink>
            <NavLink to="/doctor/create" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              醫師端
            </NavLink>
            <NavLink
              to="/patient/topic/major-depression"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              病人端
            </NavLink>
          </nav>
        </header>
      )}

      <main className={`site-main${isPatientRoute ? ' patient-site-main' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/create" replace />} />
          <Route path="/doctor/content" element={<ContentEditorPage />} />
          <Route path="/doctor/create" element={<DoctorCreatePage />} />
          <Route path="/patient/topic/:slug" element={<PatientTopicPage />} />
          <Route path="*" element={<Navigate to="/doctor/content" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
