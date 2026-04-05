import { useState } from 'react'
import { supabase } from '../lib/supabase'

const SPORTS = [["⚽","Soccer"],["🎾","Tennis"],["🏀","Basketball"],["🥍","Lacrosse"],["⚾","Baseball"],["🏃","Track & Field"],["🌲","Cross-country"]]
const FORENSICS = [["⚖️","Mock Trial"],["🎤","Debate"],["🗣️","Speech"],["🤖","Robotics"],["🎭","Drama"],["🏛️","Youth in Government"]]
const CLUBS = [
  ["🏛️","Student Senate"],["⭐","NHS"],["🌏","AAPI Student Union"],["🌮","Latino Student Group"],
  ["✊","Black Student Union"],["🤝","The Collective"],["📚","Seminar Club"],["🏥","HOSA"],
  ["📰","Knightly Newspaper"],["🐾","Pawsitivity for Animals"],["♟️","Chess Club"],["📖","Bible Study Club"],
  ["🧶","Knitting Club"],["🧠","Bring Change to Mind"],["🌿","Green Team"],["💌","Letters of Love"],["📜","Dante Club"],
]
const PRIOS = [
  { k:"balance",    e:"⚖️", mentee:"Schoolwork / Life Balance",    mentor:"Helping with balance" },
  { k:"connection", e:"👋", mentee:"A friendly face in the halls", mentor:"Being a friendly presence" },
  { k:"college",    e:"🎓", mentee:"College Admissions Advice",     mentor:"Sharing college insights" },
  { k:"activities", e:"🏅", mentee:"Learning about clubs at Nova",  mentor:"Sharing extracurricular knowledge" },
  { k:"chat",       e:"💬", mentee:"Just someone to talk to",       mentor:"Being a go-to listener" },
]
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"]
const BLANK = {
  name:"", gradYear:"", genderPref:"", sports:[], freeTime:"",
  forensics:[], clubs:[], priorities:{balance:3,connection:3,college:3,activities:3,chat:3},
  availDays:[], unavailDays:"", availNotes:"", matchComments:"", otherComments:"",
}
const TOTAL_STEPS = 6

export default function MatchForm({ onSubmitted }) {
  const [step, setStep] = useState(0)
  const [role, setRole] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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

  const ChipGroup = ({ items, selected, onToggle }) => (
    <div className="chip-group">
      {items.map(([em, name]) => (
        <div key={name} className={`chip ${selected.includes(name) ? "on" : ""}`} onClick={() => onToggle(name)}>
          {em} {name}
        </div>
      ))}
    </div>
  )

  const stepContent = () => {
    switch (step) {
      case 0: return (
        <>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>⚔️</div>
            <h1>NHS Match Program</h1>
            <p className="sub" style={{ marginBottom:0 }}>Connecting Nova's seniors and sophomores — through shared interests, shared schedules, and shared goals.</p>
          </div>
          <label>I'm joining as a…</label>
          <div style={{ display:"flex", gap:14, marginBottom:28 }}>
            <div className={`role-card ${role === "mentor" ? "on" : ""}`} onClick={() => setRole("mentor")}>
              <div style={{ fontSize:34 }}>🎓</div>
              <div className="role-title">Senior Mentor</div>
              <div className="role-desc">Class of '27 — guide a sophomore through their Nova journey</div>
            </div>
            <div className={`role-card ${role === "mentee" ? "on" : ""}`} onClick={() => setRole("mentee")}>
              <div style={{ fontSize:34 }}>🌱</div>
              <div className="role-title">Sophomore Mentee</div>
              <div className="role-desc">Class of '28 or '29 — get matched with a senior who gets it</div>
            </div>
          </div>
          <button className="btn btn-gold" style={{ width:"100%" }} disabled={!role} onClick={() => setStep(1)}>Get Started →</button>
        </>
      )

      case 1: return (
        <>
          <h2>The basics</h2>
          <p className="sub">Just a few quick details about you.</p>
          <div className="field-group">
            <label>Your name</label>
            <input type="text" placeholder="First and last name" value={form.name} onChange={e => setF("name", e.target.value)} />
          </div>
          <div className="field-group">
            <label>Graduation year</label>
            <div className="chip-group">
              {(role === "mentor" ? ["'27"] : ["'28","'29"]).map(y => (
                <div key={y} className={`chip ${form.gradYear === y ? "on" : ""}`} onClick={() => setF("gradYear", y)} style={{ padding:"10px 22px", fontWeight:800, fontSize:15 }}>
                  {y}
                </div>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label>Gender preference for your {role === "mentee" ? "mentor" : "mentee"} (optional)</label>
            <textarea value={form.genderPref} onChange={e => setF("genderPref", e.target.value)} placeholder="Leave blank if no preference — feel free to elaborate if you'd like." rows={2} />
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="btn btn-gold" style={{ flex:1 }} disabled={!canNext()} onClick={() => setStep(2)}>Continue →</button>
          </div>
        </>
      )

      case 2: return (
        <>
          <h2>Sports & Interests</h2>
          <p className="sub">What you're into outside the classroom.</p>
          <div className="field-group">
            <label>Sports you play</label>
            <ChipGroup items={SPORTS} selected={form.sports} onToggle={v => tog("sports", v)} />
          </div>
          <div className="field-group">
            <label>What do you do in your free time? <span style={{ color:"#94a3b8", fontWeight:400, textTransform:"none", letterSpacing:0 }}>(list 3–8 things)</span></label>
            <textarea value={form.freeTime} onChange={e => setF("freeTime", e.target.value)} placeholder="e.g. hiking, cooking, painting, video games, journaling, watching F1…" rows={3} />
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-gold" style={{ flex:1 }} onClick={() => setStep(3)}>Continue →</button>
          </div>
        </>
      )

      case 3: return (
        <>
          <h2>Extracurriculars</h2>
          <p className="sub">Your club and activity involvement at Nova.</p>
          <div className="field-group">
            <label>Forensics & competitions</label>
            <ChipGroup items={FORENSICS} selected={form.forensics} onToggle={v => tog("forensics", v)} />
          </div>
          <div className="field-group">
            <label>Clubs you're in (or interested in)</label>
            <ChipGroup items={CLUBS} selected={form.clubs} onToggle={v => tog("clubs", v)} />
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-gold" style={{ flex:1 }} onClick={() => setStep(4)}>Continue →</button>
          </div>
        </>
      )

      case 4: return (
        <>
          <h2>{role === "mentee" ? "What are you looking for?" : "What can you offer?"}</h2>
          <p className="sub">Rate each on a scale of 1 (not really) to 5 (super important). This helps us find your best match.</p>
          <div style={{ marginBottom:24 }}>
            {PRIOS.map(p => (
              <div key={p.k} className="prio-row">
                <div className="prio-label">
                  <div className="prio-label-text">{p.e} {role === "mentee" ? p.mentee : p.mentor}</div>
                  <input type="range" min={1} max={5} value={form.priorities[p.k]} onChange={e => setPrio(p.k, +e.target.value)} />
                  <div className="range-labels"><span>Not really</span><span>Very important</span></div>
                </div>
                <div className="prio-val">{form.priorities[p.k]}</div>
              </div>
            ))}
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => setStep(3)}>← Back</button>
            <button className="btn btn-gold" style={{ flex:1 }} onClick={() => setStep(5)}>Continue →</button>
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
                <div key={d} className={`chip ${form.availDays.includes(d) ? "on" : ""}`} onClick={() => tog("availDays", d)} style={{ padding:"9px 18px", fontWeight:700 }}>
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label>Days that absolutely DON'T work (or "N/A")</label>
            <input type="text" placeholder='e.g. Monday, Thursday — or "N/A"' value={form.unavailDays} onChange={e => setF("unavailDays", e.target.value)} />
          </div>
          <div className="field-group">
            <label>Any notes on changing availability? (optional)</label>
            <textarea value={form.availNotes} onChange={e => setF("availNotes", e.target.value)} placeholder="e.g. Busy in March during Mock Trial season, free every Friday…" rows={2} />
          </div>
          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => setStep(4)}>← Back</button>
            <button className="btn btn-gold" style={{ flex:1 }} onClick={() => setStep(6)}>Continue →</button>
          </div>
        </>
      )

      case 6: return (
        <>
          <h2>Almost there!</h2>
          <p className="sub">Any final thoughts for the NHS team before we preview your profile?</p>
          <div className="field-group">
            <label>Anything else for your match? (optional)</label>
            <textarea value={form.matchComments} onChange={e => setF("matchComments", e.target.value)} placeholder="Specific things you're hoping to get from this program, personality notes, etc." rows={3} />
          </div>
          <div className="field-group">
            <label>Other questions or comments (optional)</label>
            <textarea value={form.otherComments} onChange={e => setF("otherComments", e.target.value)} placeholder="Questions about the program, how it works, etc." rows={2} />
          </div>

          <hr className="divider" />

          <div style={{ fontWeight:700, fontSize:12, color:"#475569", marginBottom:12, textTransform:"uppercase", letterSpacing:".06em" }}>Your Profile Preview</div>
          <div className="preview-card">
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
              <div style={{ width:44, height:44, borderRadius:"50%", background:"#18154a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>
                {role === "mentor" ? "🎓" : "🌱"}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:16, color:"#18154a" }}>{form.name || "—"}</div>
                <div style={{ color:"#64748b", fontSize:13 }}>Class of {form.gradYear || "—"} · {role === "mentor" ? "Senior Mentor" : "Sophomore Mentee"}</div>
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
                {PRIOS.filter(p => form.priorities[p.k] >= 4).map(p => `${p.e} ${role === "mentee" ? p.mentee : p.mentor}`).join(" · ") || "Balanced across all areas"}
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background:"#fef2f2", border:"2px solid #fecaca", borderRadius:12, padding:"12px 16px", marginBottom:16, color:"#991b1b", fontSize:13, fontWeight:600 }}>
              {error}
            </div>
          )}

          <div className="nav-row">
            <button className="btn btn-ghost" onClick={() => setStep(5)}>← Back</button>
            <button className="btn btn-gold" style={{ flex:1 }} disabled={submitting} onClick={handleSubmit}>
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
      {step > 0 && (
        <div style={{ marginTop:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ color:"rgba(255,255,255,.4)", fontSize:11 }}>Step {step} of {TOTAL_STEPS}</span>
            <span style={{ color:"#fbbf24", fontSize:11, fontWeight:700 }}>{Math.round(step / TOTAL_STEPS * 100)}%</span>
          </div>
          <div className="prog-bar"><div className="prog-fill" style={{ width:`${step / TOTAL_STEPS * 100}%` }} /></div>
        </div>
      )}
      <div style={{ width:"100%", maxWidth:580, marginTop: step > 0 ? 20 : 0 }}>
        <div className="card">{stepContent()}</div>
      </div>
    </>
  )
}

export { PRIOS }
