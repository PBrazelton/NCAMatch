import { useState, useEffect, useRef } from 'react'

const CATEGORY_META = [
  { key: 'sports',    label: 'Sports',                 emoji: '🏅', type: 'chips' },
  { key: 'forensics', label: 'Forensics & Competitions', emoji: '⚖️', type: 'chips' },
  { key: 'clubs',     label: 'Clubs',                  emoji: '🏛️', type: 'chips' },
  { key: 'priorities', label: 'Match Priorities',       emoji: '🎯', type: 'priorities' },
]

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 30)
}

function ChipEditor({ items, onChange }) {
  const [adding, setAdding] = useState(false)
  const [newEmoji, setNewEmoji] = useState('')
  const [newName, setNewName] = useState('')
  const nameRef = useRef(null)

  const add = () => {
    const emoji = newEmoji.trim() || '⭐'
    const name = newName.trim()
    if (!name) return
    onChange([...items, [emoji, name]])
    setNewEmoji('')
    setNewName('')
    setAdding(false)
  }

  const update = (idx, emoji, name) => {
    onChange(items.map((item, i) => i === idx ? [emoji, name] : item))
  }

  const remove = (idx) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const move = (idx, dir) => {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="config-items">
      {items.map(([em, name], i) => (
        <div key={`${name}-${i}`} className="config-item">
          <div className="config-item-preview">
            <span
              className="config-item-emoji config-editable"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => { const v = e.target.textContent.trim(); if (v && v !== em) update(i, v, name) }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur() } }}
            >{em}</span>
            <span
              className="config-item-name config-editable"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => { const v = e.target.textContent.trim(); if (v && v !== name) update(i, em, v) }}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur() } }}
            >{name}</span>
          </div>
          <div className="config-item-actions">
            <button type="button" className="config-action-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${name} up`}>↑</button>
            <button type="button" className="config-action-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`Move ${name} down`}>↓</button>
            <button type="button" className="config-action-btn config-remove-btn" onClick={() => remove(i)} aria-label={`Remove ${name}`}>✕</button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="config-add-form">
          <input
            type="text"
            className="config-emoji-input"
            placeholder="⭐"
            value={newEmoji}
            onChange={e => setNewEmoji(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); nameRef.current?.focus() } }}
            autoFocus
          />
          <input
            ref={nameRef}
            type="text"
            className="config-name-input"
            placeholder="Item name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          />
          <button type="button" className="btn btn-gold config-confirm-btn" onClick={add} disabled={!newName.trim()}>✓</button>
          <button type="button" className="config-action-btn" onClick={() => { setAdding(false); setNewEmoji(''); setNewName('') }}>✕</button>
        </div>
      ) : (
        <button type="button" className="config-add-btn" onClick={() => setAdding(true)}>
          + Add item
        </button>
      )}
    </div>
  )
}

function PriorityEditor({ items, onChange }) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ e: '', mentee: '', mentor: '' })

  const add = () => {
    const mentee = draft.mentee.trim()
    const mentor = draft.mentor.trim()
    if (!mentee || !mentor) return
    const k = slugify(mentee)
    const e = draft.e.trim() || '⭐'
    onChange([...items, { k, e, mentee, mentor }])
    setDraft({ e: '', mentee: '', mentor: '' })
    setAdding(false)
  }

  const remove = (idx) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  const update = (idx, field, value) => {
    const next = items.map((item, i) => {
      if (i !== idx) return item
      return { ...item, [field]: value }
    })
    onChange(next)
  }

  const move = (idx, dir) => {
    const next = [...items]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="config-items">
      {items.map((p, i) => (
        <div key={`${p.k}-${i}`} className="config-prio-card">
          <div className="config-prio-header">
            <input
              type="text"
              className="config-emoji-input"
              value={p.e}
              onChange={e => update(i, 'e', e.target.value)}
              aria-label="Emoji"
            />
            <span className="config-prio-key">{p.k}</span>
            <div className="config-item-actions">
              <button type="button" className="config-action-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
              <button type="button" className="config-action-btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">↓</button>
              <button type="button" className="config-action-btn config-remove-btn" onClick={() => remove(i)} aria-label="Remove">✕</button>
            </div>
          </div>
          <div className="config-prio-fields">
            <label className="config-prio-label">
              <span className="config-prio-field-label">Mentee sees</span>
              <input type="text" value={p.mentee} onChange={e => update(i, 'mentee', e.target.value)} placeholder="What mentees are looking for" />
            </label>
            <label className="config-prio-label">
              <span className="config-prio-field-label">Mentor sees</span>
              <input type="text" value={p.mentor} onChange={e => update(i, 'mentor', e.target.value)} placeholder="What mentors can offer" />
            </label>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="config-prio-card config-prio-card-new">
          <div className="config-prio-header">
            <input
              type="text"
              className="config-emoji-input"
              placeholder="⭐"
              value={draft.e}
              onChange={e => setDraft(d => ({ ...d, e: e.target.value }))}
              autoFocus
            />
            <span className="config-prio-key">{slugify(draft.mentee) || 'key'}</span>
          </div>
          <div className="config-prio-fields">
            <label className="config-prio-label">
              <span className="config-prio-field-label">Mentee sees</span>
              <input type="text" value={draft.mentee} onChange={e => setDraft(d => ({ ...d, mentee: e.target.value }))} placeholder="e.g. College Admissions Advice" />
            </label>
            <label className="config-prio-label">
              <span className="config-prio-field-label">Mentor sees</span>
              <input type="text" value={draft.mentor} onChange={e => setDraft(d => ({ ...d, mentor: e.target.value }))} placeholder="e.g. Sharing college insights" />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="btn btn-gold" style={{ flex: 1 }} onClick={add} disabled={!draft.mentee.trim() || !draft.mentor.trim()}>Add Priority</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setAdding(false); setDraft({ e: '', mentee: '', mentor: '' }) }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" className="config-add-btn" onClick={() => setAdding(true)}>
          + Add priority
        </button>
      )}
    </div>
  )
}

export default function FormConfigEditor() {
  const [config, setConfig] = useState(null)
  const [original, setOriginal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [openSection, setOpenSection] = useState('sports')

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/form-config')
        if (!res.ok) throw new Error('Failed to load config')
        const data = await res.json()
        setConfig(data)
        setOriginal(JSON.stringify(data))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const isDirty = config && JSON.stringify(config) !== original

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    setError(null)

    try {
      const token = sessionStorage.getItem('admin-token') || 'tap-mode'
      const res = await fetch('/.netlify/functions/form-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error('Save failed')
      setOriginal(JSON.stringify(config))
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateCategory = (key, value) => {
    setConfig(c => ({ ...c, [key]: value }))
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)', fontSize: 14 }}>
        Loading form settings…
      </div>
    )
  }

  if (error && !config) {
    return (
      <div className="error-banner" role="alert">{error}</div>
    )
  }

  return (
    <div className="config-editor">
      {CATEGORY_META.map(cat => {
        const isOpen = openSection === cat.key
        const count = config[cat.key]?.length || 0
        return (
          <div key={cat.key} className={`config-section ${isOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="config-section-header"
              onClick={() => setOpenSection(isOpen ? null : cat.key)}
              aria-expanded={isOpen}
            >
              <div className="config-section-title">
                <span className="config-section-emoji">{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="config-section-count">{count}</span>
              </div>
              <span className={`config-chevron ${isOpen ? 'open' : ''}`}>›</span>
            </button>
            {isOpen && (
              <div className="config-section-body">
                {cat.type === 'chips' ? (
                  <ChipEditor items={config[cat.key]} onChange={v => updateCategory(cat.key, v)} />
                ) : (
                  <PriorityEditor items={config[cat.key]} onChange={v => updateCategory(cat.key, v)} />
                )}
              </div>
            )}
          </div>
        )
      })}

      {error && config && <div className="error-banner" role="alert" style={{ marginTop: 16 }}>{error}</div>}

      {(isDirty || saved) && (
        <div className="config-save-bar">
          <button
            type="button"
            className={`btn btn-gold config-save-btn ${saved ? 'saved' : ''}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  )
}
