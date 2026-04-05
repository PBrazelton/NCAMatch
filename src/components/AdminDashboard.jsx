import { useState, useEffect } from 'react'
import { PRIOS } from './MatchForm'

const MAX_SCORE = 60

function computeMatches(submissions) {
  const mentors = submissions.filter(s => s.role === 'mentor')
  const mentees = submissions.filter(s => s.role === 'mentee')

  return mentees.map(ee => {
    const scored = mentors.map(or => {
      let score = 0
      ;(ee.sports || []).forEach(s => { if ((or.sports || []).includes(s)) score += 3 })
      ;(ee.clubs || []).forEach(c => { if ((or.clubs || []).includes(c)) score += 2 })
      ;(ee.forensics || []).forEach(f => { if ((or.forensics || []).includes(f)) score += 2 })
      ;(ee.avail_days || []).forEach(d => { if ((or.avail_days || []).includes(d)) score += 1 })
      PRIOS.forEach(p => {
        const eePrio = ee.priorities?.[p.k] ?? 3
        const orPrio = or.priorities?.[p.k] ?? 3
        score += (4 - Math.abs(eePrio - orPrio))
      })
      return { mentor: or, score }
    }).sort((a, b) => b.score - a.score)

    return { mentee: ee, top: scored.slice(0, 3) }
  })
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('admin-token') || 'tap-mode'
        const res = await fetch('/.netlify/functions/admin-data', {
          headers: { 'x-admin-token': token },
        })
        if (!res.ok) throw new Error('Failed to load submissions')
        const data = await res.json()
        setSubmissions(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const mentors = submissions.filter(s => s.role === 'mentor')
  const mentees = submissions.filter(s => s.role === 'mentee')
  const matches = computeMatches(submissions)

  if (loading) {
    return (
      <div className="card" style={{ textAlign:"center", padding:"48px 28px" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
        <div style={{ color:"#64748b", fontSize:14 }}>Loading submissions…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ textAlign:"center", padding:"48px 28px" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
        <div style={{ color:"#991b1b", fontSize:14, fontWeight:600 }}>{error}</div>
        <p style={{ color:"#64748b", fontSize:13, marginTop:8 }}>Make sure Supabase and Netlify functions are configured.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <h3 style={{ margin:0, fontSize:22 }}>NHS Admin Dashboard</h3>
        <span className="badge">ADMIN</span>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        <div className="stat-box" style={{ background:"#f0fdf4", border:"2px solid #bbf7d0" }}>
          <div className="stat-num" style={{ color:"#166534" }}>{mentors.length}</div>
          <div className="stat-lbl" style={{ color:"#15803d" }}>Mentors</div>
        </div>
        <div className="stat-box" style={{ background:"#eff6ff", border:"2px solid #bfdbfe" }}>
          <div className="stat-num" style={{ color:"#1e40af" }}>{mentees.length}</div>
          <div className="stat-lbl" style={{ color:"#1d4ed8" }}>Mentees</div>
        </div>
        <div className="stat-box" style={{ background:"#fffbeb", border:"2px solid #fde68a" }}>
          <div className="stat-num" style={{ color:"#92400e" }}>{submissions.length}</div>
          <div className="stat-lbl" style={{ color:"#b45309" }}>Total</div>
        </div>
      </div>

      <h3>Suggested Matches</h3>

      {matches.length === 0 ? (
        <div style={{ textAlign:"center", color:"#94a3b8", padding:"32px 0", fontSize:14 }}>
          No mentees yet — check back once submissions arrive!
        </div>
      ) : matches.map(({ mentee, top }) => (
        <div key={mentee.id} className="mentee-block">
          <div className="mentee-header">
            <span style={{ fontWeight:800, color:"#18154a", fontSize:14 }}>🌱 {mentee.name}</span>
            <span style={{ color:"#64748b", fontSize:12, marginLeft:8 }}>
              {mentee.grad_year} · Available: {(mentee.avail_days || []).join(", ") || "TBD"}
            </span>
          </div>
          <div className="mentee-body">
            {top.length === 0 ? (
              <div style={{ fontSize:13, color:"#94a3b8" }}>No mentors to match yet</div>
            ) : top.map(({ mentor, score }, i) => {
              const pct = Math.min(100, Math.round(score / MAX_SCORE * 100))
              const sharedItems = [
                ...(mentee.sports || []).filter(s => (mentor.sports || []).includes(s)),
                ...(mentee.clubs || []).filter(c => (mentor.clubs || []).includes(c)),
                ...(mentee.forensics || []).filter(f => (mentor.forensics || []).includes(f)),
              ]
              const sharedDays = (mentor.avail_days || []).filter(d => (mentee.avail_days || []).includes(d))
              return (
                <div key={mentor.id} className="mentor-match" style={{ background: i === 0 ? "#fffbeb" : "#f8fafc", border: `1.5px solid ${i === 0 ? "#fde68a" : "#e2e8f0"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:"#18154a" }}>
                      {i === 0 ? "⭐ " : ""}{mentor.name} <span style={{ color:"#64748b", fontWeight:400, fontSize:12 }}>{mentor.grad_year}</span>
                    </div>
                    <span className="badge" style={{ fontSize:11 }}>{pct}% match</span>
                  </div>
                  <div className="score-bar"><div className="score-fill" style={{ width:`${pct}%` }} /></div>
                  {sharedItems.length > 0 && (
                    <div style={{ fontSize:11, color:"#64748b", marginTop:5 }}>
                      Shared: {sharedItems.join(", ")}
                    </div>
                  )}
                  {(mentor.avail_days || []).length > 0 && (
                    <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>
                      Available: {sharedDays.length > 0 ? sharedDays.join(", ") : "No overlapping days"}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="admin-hint">Tap the ⚔️ logo 5 times to access this dashboard</div>
    </div>
  )
}
