export default function MatchDetail({ mentee, mentor, priorities }) {
  const mteeSports = mentee.sports || []
  const mtorSports = mentor.sports || []
  const mteeClubs = mentee.clubs || []
  const mtorClubs = mentor.clubs || []
  const mteeForensics = mentee.forensics || []
  const mtorForensics = mentor.forensics || []
  const mteeDays = mentee.avail_days || []
  const mtorDays = mentor.avail_days || []

  return (
    <div className="match-detail">
      {/* Names header */}
      <div className="md-header">
        <div className="md-person">
          <div className="md-avatar md-avatar-mentee">🌱</div>
          <div className="md-name">{mentee.name}</div>
          <div className="md-role">Mentee · {mentee.grad_year}</div>
        </div>
        <div className="md-vs">vs</div>
        <div className="md-person">
          <div className="md-avatar md-avatar-mentor">🎓</div>
          <div className="md-name">{mentor.name}</div>
          <div className="md-role">Mentor · {mentor.grad_year}</div>
        </div>
      </div>

      {/* Sports */}
      <CompareChips label="Sports" icon="🏅" left={mteeSports} right={mtorSports} points={3} />

      {/* Clubs */}
      <CompareChips label="Clubs" icon="🏛️" left={mteeClubs} right={mtorClubs} points={2} />

      {/* Forensics */}
      <CompareChips label="Forensics" icon="⚖️" left={mteeForensics} right={mtorForensics} points={2} />

      {/* Availability */}
      <CompareChips label="Availability" icon="📅" left={mteeDays} right={mtorDays} points={1} />

      {/* Priorities */}
      <div className="md-section">
        <div className="md-section-label">🎯 Priorities</div>
        <div className="md-prio-list">
          {priorities.map(p => {
            const mteeVal = mentee.priorities?.[p.k] ?? 3
            const mtorVal = mentor.priorities?.[p.k] ?? 3
            const diff = Math.abs(mteeVal - mtorVal)
            const pts = 4 - diff
            return (
              <div key={p.k} className={`md-prio-row ${diff === 0 ? 'md-match' : diff >= 3 ? 'md-mismatch' : ''}`}>
                <div className="md-prio-label">{p.e} {p.mentee}</div>
                <div className="md-prio-scores">
                  <span className="md-prio-val">{mteeVal}</span>
                  <span className="md-prio-vs">{diff === 0 ? '=' : diff <= 1 ? '≈' : '≠'}</span>
                  <span className="md-prio-val">{mtorVal}</span>
                  <span className={`md-prio-pts ${pts >= 3 ? 'good' : pts <= 1 ? 'weak' : ''}`}>+{pts}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Free time / comments */}
      {(mentee.free_time || mentor.free_time) && (
        <div className="md-section">
          <div className="md-section-label">🎨 Free Time</div>
          <div className="md-freetext-compare">
            <div className="md-freetext">
              <div className="md-freetext-who">🌱 {mentee.name.split(' ')[0]}</div>
              <div className="md-freetext-val">{mentee.free_time || '—'}</div>
            </div>
            <div className="md-freetext">
              <div className="md-freetext-who">🎓 {mentor.name.split(' ')[0]}</div>
              <div className="md-freetext-val">{mentor.free_time || '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Gender pref if specified */}
      {(mentee.gender_pref || mentor.gender_pref) && (
        <div className="md-section">
          <div className="md-section-label">Gender Preferences</div>
          <div className="md-freetext-compare">
            {mentee.gender_pref && <div className="md-freetext"><div className="md-freetext-who">🌱 Mentee</div><div className="md-freetext-val">{mentee.gender_pref}</div></div>}
            {mentor.gender_pref && <div className="md-freetext"><div className="md-freetext-who">🎓 Mentor</div><div className="md-freetext-val">{mentor.gender_pref}</div></div>}
          </div>
        </div>
      )}

      {/* Match/other comments */}
      {(mentee.match_comments || mentor.match_comments) && (
        <div className="md-section">
          <div className="md-section-label">💬 Notes for Match Team</div>
          <div className="md-freetext-compare">
            {mentee.match_comments && <div className="md-freetext"><div className="md-freetext-who">🌱 {mentee.name.split(' ')[0]}</div><div className="md-freetext-val">{mentee.match_comments}</div></div>}
            {mentor.match_comments && <div className="md-freetext"><div className="md-freetext-who">🎓 {mentor.name.split(' ')[0]}</div><div className="md-freetext-val">{mentor.match_comments}</div></div>}
          </div>
        </div>
      )}
    </div>
  )
}

function CompareChips({ label, icon, left, right, points }) {
  const all = [...new Set([...left, ...right])]
  if (all.length === 0) return null

  const shared = left.filter(x => right.includes(x))
  const leftOnly = left.filter(x => !right.includes(x))
  const rightOnly = right.filter(x => !left.includes(x))

  return (
    <div className="md-section">
      <div className="md-section-label">
        {icon} {label}
        {shared.length > 0 && <span className="md-match-count">+{shared.length * points} pts</span>}
      </div>
      <div className="md-chip-list">
        {shared.map(item => (
          <span key={item} className="md-chip md-chip-match">✓ {item}</span>
        ))}
        {leftOnly.map(item => (
          <span key={item} className="md-chip md-chip-left">🌱 {item}</span>
        ))}
        {rightOnly.map(item => (
          <span key={item} className="md-chip md-chip-right">🎓 {item}</span>
        ))}
      </div>
    </div>
  )
}
