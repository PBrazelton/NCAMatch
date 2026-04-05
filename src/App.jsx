import { useState, useRef } from 'react'
import MatchForm from './components/MatchForm'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const [view, setView] = useState('form') // 'form' | 'success' | 'admin'
  const [submitted, setSubmitted] = useState(null) // { name, role }
  const [tapCount, setTapCount] = useState(0)
  const tapTimer = useRef(null)

  const handleLogoTap = () => {
    clearTimeout(tapTimer.current)
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 5) {
      sessionStorage.setItem('admin-token', 'tap-mode')
      setView('admin')
      setTapCount(0)
    } else {
      tapTimer.current = setTimeout(() => setTapCount(0), 2000)
    }
  }

  const handleSubmitted = ({ name, role }) => {
    setSubmitted({ name, role })
    setView('success')
  }

  const resetAll = () => {
    setSubmitted(null)
    setView('form')
  }

  const firstName = submitted?.name?.split(' ')[0] || ''

  return (
    <div className="app">
      {/* Header */}
      <div style={{ width:'100%', maxWidth:580, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button type="button" onClick={handleLogoTap} aria-label="Nova NHS home" style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:10, background:'none', border:'none', padding:0, WebkitTapHighlightColor:'transparent' }}>
            <img src="/knight-helmet.png" alt="" className="knight-logo" />
            <div>
              <div style={{ color:'var(--gold)', fontFamily:'Cormorant Garamond,serif', fontSize:18, fontWeight:700, lineHeight:1 }}>Nova NHS</div>
              <div style={{ color:'rgba(255,255,255,.45)', fontSize:10, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>Match Program</div>
            </div>
          </button>
          {view !== 'form' && (
            <button className="btn btn-ghost" onClick={resetAll} style={{ fontSize:12, padding:'7px 14px', color:'rgba(255,255,255,.6)', borderColor:'rgba(255,255,255,.2)' }}>
              ← New Form
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ width:'100%', maxWidth:580 }}>
        {view === 'form' && <MatchForm onSubmitted={handleSubmitted} />}

        {view === 'success' && (
          <div className="card" style={{ textAlign:'center' }}>
            <div className="confetti">🎉</div>
            <div className="success-title">You're in, {firstName}!</div>
            <p style={{ color:'var(--slate-600)', fontSize:15, marginBottom:0 }}>
              Your profile has been submitted to the NHS Match Team.
            </p>
            <div className="next-steps">
              <div className="next-title">What happens next?</div>
              <ul>
                <li>The NHS team reviews all submitted profiles</li>
                <li>Matches are made based on shared interests & availability</li>
                <li>You'll be notified with your match soon</li>
                <li>Meet your {submitted?.role === 'mentor' ? 'mentee' : 'mentor'} during House time — say hi! 👋</li>
              </ul>
            </div>
            <button type="button" className="btn btn-gold" style={{ width:'100%' }} onClick={resetAll}>Submit Another Profile</button>
          </div>
        )}

        {view === 'admin' && <AdminDashboard />}
      </div>
    </div>
  )
}
