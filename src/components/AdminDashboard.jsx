import { useState, useEffect } from 'react'
import FormConfigEditor from './FormConfigEditor'

// Dynamic max: 7 sports * 3 + 17 clubs * 2 + 6 forensics * 2 + 5 days * 1 + N priorities * 4
// Approximate with a reasonable cap based on actual priority count
function calcMaxScore(prioCount) {
  return 21 + 34 + 12 + 5 + (prioCount * 4)
}

function computeMatches(submissions, priorities) {
  const mentors = submissions.filter(s => s.role === 'mentor')
  const mentees = submissions.filter(s => s.role === 'mentee')

  return mentees.map(ee => {
    const scored = mentors.map(or => {
      let score = 0
      ;(ee.sports || []).forEach(s => { if ((or.sports || []).includes(s)) score += 3 })
      ;(ee.clubs || []).forEach(c => { if ((or.clubs || []).includes(c)) score += 2 })
      ;(ee.forensics || []).forEach(f => { if ((or.forensics || []).includes(f)) score += 2 })
      ;(ee.avail_days || []).forEach(d => { if ((or.avail_days || []).includes(d)) score += 1 })
      priorities.forEach(p => {
        const eePrio = ee.priorities?.[p.k] ?? 3
        const orPrio = or.priorities?.[p.k] ?? 3
        score += (4 - Math.abs(eePrio - orPrio))
      })
      return { mentor: or, score }
    }).sort((a, b) => b.score - a.score)

    return { mentee: ee, top: scored.slice(0, 3) }
  })
}

const DEFAULT_PRIOS = [
  { k:"balance", e:"⚖️", mentee:"Schoolwork / Life Balance", mentor:"Helping with balance" },
  { k:"connection", e:"👋", mentee:"A friendly face in the halls", mentor:"Being a friendly presence" },
  { k:"college", e:"🎓", mentee:"College Admissions Advice", mentor:"Sharing college insights" },
  { k:"activities", e:"🏅", mentee:"Learning about clubs at Nova", mentor:"Sharing extracurricular knowledge" },
  { k:"chat", e:"💬", mentee:"Just someone to talk to", mentor:"Being a go-to listener" },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('matches')
  const [submissions, setSubmissions] = useState([])
  const [priorities, setPriorities] = useState(DEFAULT_PRIOS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('admin-token') || 'tap-mode'
        const [subRes, configRes] = await Promise.all([
          fetch('/.netlify/functions/admin-data', { headers: { 'x-admin-token': token } }),
          fetch('/.netlify/functions/form-config'),
        ])
        if (!subRes.ok) throw new Error('Failed to load submissions')
        const subData = await subRes.json()
        setSubmissions(subData)

        if (configRes.ok) {
          const configData = await configRes.json()
          if (configData.priorities) setPriorities(configData.priorities)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const mentors = submissions.filter(s => s.role === 'mentor')
  const mentees = submissions.filter(s => s.role === 'mentee')
  const matches = computeMatches(submissions, priorities)
  const MAX_SCORE = calcMaxScore(priorities.length)

  if (loading) {
    return (
      <div className="card" style={{ textAlign:"center", padding:"48px 28px" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
        <div style={{ color:"var(--slate-600)", fontSize:14 }}>Loading…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign:"center", padding:"48px 28px" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
        <div style={{ color:"var(--error-text)", fontSize:14, fontWeight:600 }}>{error}</div>
        <p style={{ color:"var(--slate-600)", fontSize:13, marginTop:8 }}>Make sure Supabase and Netlify functions are configured.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:22 }}>NHS Admin</h3>
        <span className="badge">ADMIN</span>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button type="button" className={`admin-tab ${tab === 'matches' ? 'active' : ''}`} onClick={() => setTab('matches')}>
          🏆 Matches
        </button>
        <button type="button" className={`admin-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          ⚙️ Form Settings
        </button>
      </div>

      {/* Matches Tab */}
      {tab === 'matches' && (
        <>
          <div style={{ display:"flex", gap:10, marginBottom:24 }}>
            <div className="stat-box" style={{ background:"var(--green-bg)", border:"2px solid var(--green-border)" }}>
              <div className="stat-num" style={{ color:"var(--green-text)" }}>{mentors.length}</div>
              <div className="stat-lbl" style={{ color:"var(--green-label)" }}>Mentors</div>
            </div>
            <div className="stat-box" style={{ background:"var(--blue-bg)", border:"2px solid var(--blue-border)" }}>
              <div className="stat-num" style={{ color:"var(--blue-text)" }}>{mentees.length}</div>
              <div className="stat-lbl" style={{ color:"var(--blue-label)" }}>Mentees</div>
            </div>
            <div className="stat-box" style={{ background:"var(--warm-bg)", border:"2px solid var(--warm-border)" }}>
              <div className="stat-num" style={{ color:"var(--amber-text)" }}>{submissions.length}</div>
              <div className="stat-lbl" style={{ color:"var(--amber-label)" }}>Total</div>
            </div>
          </div>

          <h3>Suggested Matches</h3>

          {matches.length === 0 ? (
            <div style={{ textAlign:"center", color:"var(--slate-400)", padding:"32px 0", fontSize:14 }}>
              No mentees yet — check back once submissions arrive!
            </div>
          ) : matches.map(({ mentee, top }) => (
            <div key={mentee.id} className="mentee-block">
              <div className="mentee-header">
                <span style={{ fontWeight:800, color:"var(--navy)", fontSize:14 }}>🌱 {mentee.name}</span>
                <span style={{ color:"var(--slate-600)", fontSize:12, marginLeft:8 }}>
                  {mentee.grad_year} · Available: {(mentee.avail_days || []).join(", ") || "TBD"}
                </span>
              </div>
              <div className="mentee-body">
                {top.length === 0 ? (
                  <div style={{ fontSize:13, color:"var(--slate-400)" }}>No mentors to match yet</div>
                ) : top.map(({ mentor, score }, i) => {
                  const pct = Math.min(100, Math.round(score / MAX_SCORE * 100))
                  const sharedItems = [
                    ...(mentee.sports || []).filter(s => (mentor.sports || []).includes(s)),
                    ...(mentee.clubs || []).filter(c => (mentor.clubs || []).includes(c)),
                    ...(mentee.forensics || []).filter(f => (mentor.forensics || []).includes(f)),
                  ]
                  const sharedDays = (mentor.avail_days || []).filter(d => (mentee.avail_days || []).includes(d))
                  return (
                    <div key={mentor.id} className="mentor-match" style={{ background: i === 0 ? "var(--warm-bg)" : "var(--slate-50)", border: `1.5px solid ${i === 0 ? "var(--warm-border)" : "var(--slate-200)"}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <div style={{ fontWeight:700, fontSize:13, color:"var(--navy)" }}>
                          {i === 0 ? "⭐ " : ""}{mentor.name} <span style={{ color:"var(--slate-600)", fontWeight:400, fontSize:12 }}>{mentor.grad_year}</span>
                        </div>
                        <span className="badge" style={{ fontSize:11 }}>{pct}% match</span>
                      </div>
                      <div className="score-bar"><div className="score-fill" style={{ width:`${pct}%` }} /></div>
                      {sharedItems.length > 0 && (
                        <div style={{ fontSize:11, color:"var(--slate-600)", marginTop:5 }}>
                          Shared: {sharedItems.join(", ")}
                        </div>
                      )}
                      {(mentor.avail_days || []).length > 0 && (
                        <div style={{ fontSize:11, color:"var(--slate-400)", marginTop:2 }}>
                          Available: {sharedDays.length > 0 ? sharedDays.join(", ") : "No overlapping days"}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Form Settings Tab */}
      {tab === 'settings' && <FormConfigEditor />}

      <div className="admin-hint">Tap the knight logo 5 times to access this dashboard</div>
    </div>
  )
}
