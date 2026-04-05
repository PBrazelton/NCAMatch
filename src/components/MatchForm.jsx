import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_SPORTS = [["⚽","Soccer"],["🎾","Tennis"],["🏀","Basketball"],["🥍","Lacrosse"],["⚾","Baseball"],["🏃","Track & Field"],["🌲","Cross-country"]]
const DEFAULT_FORENSICS = [["⚖️","Mock Trial"],["🎤","Debate"],["🗣️","Speech"],["🤖","Robotics"],["🎭","Drama"],["🏛️","Youth in Government"]]
const DEFAULT_CLUBS = [
  ["🏛️","Student Senate"],["⭐","NHS"],["🌏","AAPI Student Union"],["🌮","Latino Student Group"],
  ["✊","Black Student Union"],["🤝","The Collective"],["📚","Seminar Club"],["🏥","HOSA"],
  ["📰","Knightly Newspaper"],["🐾","Pawsitivity for Animals"],["♟️","Chess Club"],["📖","Bible Study Club"],
  ["🧶","Knitting Club"],["🧠","Bring Change to Mind"],["🌿","Green Team"],["💌","Letters of Love"],["📜","Dante Club"],
]
const DEFAULT_PRIOS = [
  { k:"balance",    e:"⚖️", mentee:"Schoolwork / Life Balance",    mentor:"Helping with balance" },
  { k:"connection", e:"👋", mentee:"A friendly face in the halls", mentor:"Being a friendly presence" },
  { k:"college",    e:"🎓", mentee:"College Admissions Advice",     mentor:"Sharing college insights" },
  { k:"activities", e:"🏅", mentee:"Learning about clubs at Nova",  mentor:"Sharing extracurricular knowledge" },
  { k:"chat",       e:"💬", mentee:"Just someone to talk to",       mentor:"Being a go-to listener" },
]
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
const TOTAL_STEPS = 6

function ChipGroup({ items, selected, onToggle, label }) {
  return (
    <div className="chip-group" role="group" aria-label={label}>
      {items.map(([em, name]) => (
        <button type="button" key={name} className={`chip ${selected.includes(name) ? "on" : ""}`} onClick={() => onToggle(name)} aria-pressed={selected.includes(name)}>
          {em} {name}
        </button>
      ))}
    </div>
  )
}

function makeBlank(prios) {
  return {
    name:"", gradYear:"", genderPref:"", sports:[], freeTime:"",
    forensics:[], clubs:[],
    priorities: Object.fromEntries(prios.map(p => [p.k, 3])),
    availDays:[], unavailDays:"", availNotes:"", matchComments:"", otherComments:"",
  }
}

export default function MatchForm({ onSubmitted }) {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState(null)
  const [config, setConfig] = useState({
    sports: DEFAULT_SPORTS, forensics: DEFAULT_FORENSICS,
    clubs: DEFAULT_CLUBS, priorities: DEFAULT_PRIOS,
  })
  const [form, setForm] = useState(makeBlank(DEFAULT_PRIOS))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const topRef = useRef(null)

  useEffect(() => {
    fetch('/.netlify/functions/form-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setConfig(data)
          setForm(f => ({
            ...f,
            priorities: Object.fromEntries(data.priorities.map(p => [p.k, f.priorities[p.k] ?? 3])),
          }))
        }
      })
      .catch(() => {})
  }, [])

  const goTo = (s) => {
    setStep(s)
    requestAnimationFrame(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const tog = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }))
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPrio = (k, v) => setForm(f => ({ ...f, priorities: { ...f.priorities, [k]: v } }))

  const canNext = () => {
    if (step === 0) return !!role
    if (step === 1) return form.name.trim().length > 0 && !!form.gradYear
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)

    const row = {
      role,
      name: form.name.trim(),
      grad_year: form.gradYear,
      gender_pref: form.genderPref || null,
      sports: form.sports,
      free_time: form.freeTime || null,
      forensics: form.forensics,
      clubs: form.clubs,
      priorities: form.priorities,
      avail_days: form.availDays,
      unavail_days: form.unavailDays || null,
      avail_notes: form.availNotes || null,
      match_comments: form.matchComments || null,
      other_comments: form.otherComments || null,
    }

    const { error: dbError } = await supabase.from('submissions').insert([row])

    setSubmitting(false)

    if (dbError) {
      setError('Something went wrong submitting your profile. Please try again.')
      return
    }

    onSubmitted({ name: form.name, role })
  }

  const stepContent = () => {
    switch (step) {
      case 0: return (
        <>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <img src="/knight-helmet.png" alt="Nova Knights" className="knight-logo-hero" />
            <h1>NHS Match Program</h1>
            <p className="sub" style={{ marginBottom:0 }}>Connecting Nova's seniors and sophomores — through shared interests, shared schedules, and shared goals.</p>
          </div>
          <label>I'm joining as a…</label>
          <div style={{ display:"flex", gap:12, marginBottom:28 }}>
            <button type="button" className={`role-card ${role === "mentor" ? "on" : ""}`} onClick={() => setRole("mentor")} aria-pressed={role === "mentor"}>
              <div style={{ fontSize:34 }}>🎓</div>
              <div className="role-title">Senior Mentor</div>
              <div className="role-desc">Class of '27 — guide a sophomore through their Nova journey</div>
            </button>
            <button type="button" className={`role-card ${role === "mentee" ? "on" : ""}`} onClick={() => setRole("mentee")} aria-pressed={role === "mentee"}>
              <div style={{ fontSize:34 }}>🌱</div>
              <div className="role-title">Sophomore Mentee</div>
              <div className="role-desc">Class of '28 or '29 — get matched with a senior who gets it</div>
            </button>
          </div>
          <button type="button" className="btn btn-gold" style={{ width:"100%" }} disabled={!role} onClick={() => goTo(1)}>Get Started →</button>
        </>
      )

      case 1: return (
        <>
          <h2>The basics</h2>
          <p className="sub">Just a few quick details about you.</p>
          <div className="field-group">
            <label htmlFor="name-input">Your name</label>
            <input id="name-input" type="text" placeholder="First and last name" value={form.name} onChange={e => setF("name", e.target.value)} autoComplete="name" />
          </div>
          <div className="field-group">
            <label>Graduation year</label>
            <div className="chip-group">
              {(role === "mentor" ? ["'27"] : ["'28","'29"]).map(y => (
                <button type="button" key={y} className={`chip ${form.gradYear === y ? "on" : ""}`} onClick={() => setF("gradYear", y)} aria-pressed={form.gradYear === y} style={{ padding:"10px 22px", fontWeight:800, fontSize:15 }}>
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="gender-pref">Gender preference for your {role === "mentee" ? "mentor" : "mentee"} <span style={{ color:"var(--slate-400)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <textarea id="gender-pref" value={form.genderPref} onChange={e => setF("genderPref", e.target.value)} placeholder="Leave blank if no preference — feel free to elaborate if you'd like." rows={2} />
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(0)}>← Back</button>
            <button type="button" className="btn btn-gold" style={{ flex:1 }} disabled={!canNext()} onClick={() => goTo(2)}>Continue →</button>
          </div>
        </>
      )

      case 2: return (
        <>
          <h2>Sports & Interests</h2>
          <p className="sub">What you're into outside the classroom.</p>
          <div className="field-group">
            <label>Sports you play</label>
            <ChipGroup items={config.sports} selected={form.sports} onToggle={v => tog("sports", v)} label="Sports you play" />
          </div>
          <div className="field-group">
            <label htmlFor="free-time">What do you do in your free time? <span style={{ color:"var(--slate-400)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(list 3–8 things)</span></label>
            <textarea id="free-time" value={form.freeTime} onChange={e => setF("freeTime", e.target.value)} placeholder="e.g. hiking, cooking, painting, video games, journaling, watching F1…" rows={3} />
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(1)}>← Back</button>
            <button type="button" className="btn btn-gold" style={{ flex:1 }} onClick={() => goTo(3)}>Continue →</button>
          </div>
        </>
      )

      case 3: return (
        <>
          <h2>Extracurriculars</h2>
          <p className="sub">Your club and activity involvement at Nova.</p>
          <div className="field-group">
            <label>Forensics & competitions</label>
            <ChipGroup items={config.forensics} selected={form.forensics} onToggle={v => tog("forensics", v)} label="Forensics and competitions" />
          </div>
          <div className="field-group">
            <label>Clubs you're in (or interested in)</label>
            <ChipGroup items={config.clubs} selected={form.clubs} onToggle={v => tog("clubs", v)} label="Clubs" />
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(2)}>← Back</button>
            <button type="button" className="btn btn-gold" style={{ flex:1 }} onClick={() => goTo(4)}>Continue →</button>
          </div>
        </>
      )

      case 4: return (
        <>
          <h2>{role === "mentee" ? "What are you looking for?" : "What can you offer?"}</h2>
          <p className="sub">Rate each on a scale of 1 (not really) to 5 (super important). This helps us find your best match.</p>
          <div style={{ marginBottom:24 }}>
            {config.priorities.map(p => (
              <div key={p.k} className="prio-row">
                <div className="prio-label">
                  <div className="prio-label-text">{p.e} {role === "mentee" ? p.mentee : p.mentor}</div>
                  <input type="range" min={1} max={5} value={form.priorities[p.k]} onChange={e => setPrio(p.k, +e.target.value)} aria-label={role === "mentee" ? p.mentee : p.mentor} />
                  <div className="range-labels"><span>Not really</span><span>Very important</span></div>
                </div>
                <div className="prio-val">{form.priorities[p.k]}</div>
              </div>
            ))}
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(3)}>← Back</button>
            <button type="button" className="btn btn-gold" style={{ flex:1 }} onClick={() => goTo(5)}>Continue →</button>
          </div>
        </>
      )

      case 5: return (
        <>
          <h2>Availability</h2>
          <p className="sub">When can you meet during House time? Check all days that work.</p>
          <div className="field-group">
            <label>Days that work for you</label>
            <div className="chip-group">
              {DAYS.map(d => (
                <button type="button" key={d} className={`chip ${form.availDays.includes(d) ? "on" : ""}`} onClick={() => tog("availDays", d)} aria-pressed={form.availDays.includes(d)} style={{ padding:"10px 18px", fontWeight:700 }}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="unavail-days">Days that absolutely DON'T work (or "N/A")</label>
            <input id="unavail-days" type="text" placeholder='e.g. Monday, Thursday — or "N/A"' value={form.unavailDays} onChange={e => setF("unavailDays", e.target.value)} />
          </div>
          <div className="field-group">
            <label htmlFor="avail-notes">Any notes on changing availability? <span style={{ color:"var(--slate-400)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <textarea id="avail-notes" value={form.availNotes} onChange={e => setF("availNotes", e.target.value)} placeholder="e.g. Busy in March during Mock Trial season, free every Friday…" rows={2} />
          </div>
          <div className="nav-row">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(4)}>← Back</button>
            <button type="button" className="btn btn-gold" style={{ flex:1 }} onClick={() => goTo(6)}>Continue →</button>
          </div>
        </>
      )

      case 6: return (
        <>
          <h2>Almost there!</h2>
          <p className="sub">Any final thoughts for the NHS team before we preview your profile?</p>
          <div className="field-group">
            <label htmlFor="match-comments">Anything else for your match? <span style={{ color:"var(--slate-400)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <textarea id="match-comments" value={form.matchComments} onChange={e => setF("matchComments", e.target.value)} placeholder="Specific things you're hoping to get from this program, personality notes, etc." rows={3} />
          </div>
          <div className="field-group">
            <label htmlFor="other-comments">Other questions or comments <span style={{ color:"var(--slate-400)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <textarea id="other-comments" value={form.otherComments} onChange={e => setF("otherComments", e.target.value)} placeholder="Questions about the program, how it works, etc." rows={2} />
          </div>

          <hr className="divider" />

          <div style={{ fontWeight:700, fontSize:12, color:"var(--slate-600)", marginBottom:12, textTransform:"uppercase", letterSpacing:".06em" }}>Your profile preview</div>
          <div className="preview-card">
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"var(--navy)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
                {role === "mentor" ? "🎓" : "🌱"}
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontWeight:800, fontSize:16, color:"var(--navy)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{form.name || "—"}</div>
                <div style={{ color:"var(--slate-600)", fontSize:13 }}>Class of {form.gradYear || "—"} · {role === "mentor" ? "Senior Mentor" : "Sophomore Mentee"}</div>
              </div>
            </div>
            {form.sports.length > 0 && <div className="preview-row"><div className="preview-key">Sports</div><div className="preview-val">{form.sports.join(", ")}</div></div>}
            {form.freeTime && <div className="preview-row"><div className="preview-key">Interests</div><div className="preview-val">{form.freeTime}</div></div>}
            {form.clubs.length > 0 && <div className="preview-row"><div className="preview-key">Clubs</div><div className="preview-val">{form.clubs.join(", ")}</div></div>}
            {form.forensics.length > 0 && <div className="preview-row"><div className="preview-key">Forensics</div><div className="preview-val">{form.forensics.join(", ")}</div></div>}
            {form.availDays.length > 0 && <div className="preview-row"><div className="preview-key">Available</div><div className="preview-val">{form.availDays.join(", ")}</div></div>}
            <div className="preview-row">
              <div className="preview-key">Top priorities</div>
              <div className="preview-val">
                {config.priorities.filter(p => form.priorities[p.k] >= 4).map(p => `${p.e} ${role === "mentee" ? p.mentee : p.mentor}`).join(" · ") || "Balanced across all areas"}
              </div>
            </div>
          </div>

          {error && <div className="error-banner" role="alert">{error}</div>}

          <div className="nav-row">
            <button type="button" className="btn btn-ghost" onClick={() => goTo(5)}>← Back</button>
            <button type="button" className="btn btn-gold" style={{ flex:1 }} disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting…" : "Submit My Profile ✓"}
            </button>
          </div>
        </>
      )

      default: return null
    }
  }

  return (
    <>
      <div ref={topRef} />
      {step > 0 && (
        <div style={{ marginTop:14 }}>
          <div className="step-indicator">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div key={i} className={`step-dot ${i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}`} />
            ))}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ color:"rgba(255,255,255,.4)", fontSize:11 }}>Step {step} of {TOTAL_STEPS}</span>
            <span style={{ color:"var(--gold)", fontSize:11, fontWeight:700 }}>{Math.round(step / TOTAL_STEPS * 100)}%</span>
          </div>
          <div className="prog-bar"><div className="prog-fill" style={{ width:`${step / TOTAL_STEPS * 100}%` }} /></div>
        </div>
      )}
      <div style={{ width:"100%", maxWidth:580, marginTop: step > 0 ? 20 : 0 }}>
        <div className="card" key={step}>{stepContent()}</div>
      </div>
    </>
  )
}
