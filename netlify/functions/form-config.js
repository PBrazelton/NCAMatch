import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const VALID_TOKENS = new Set(['tap-mode'])
const headers = { 'Content-Type': 'application/json' }

export const handler = async (event) => {
  // GET: public read — form options aren't sensitive
  if (event.httpMethod === 'GET') {
    const { data, error } = await supabase
      .from('form_config')
      .select('sports, forensics, clubs, priorities')
      .limit(1)
      .single()

    if (error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) }
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) }
  }

  // PUT: admin-only write
  if (event.httpMethod === 'PUT') {
    const token = event.headers['x-admin-token']
    if (!token || !VALID_TOKENS.has(token)) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
    }

    let body
    try { body = JSON.parse(event.body) } catch {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) }
    }
    const { sports, forensics, clubs, priorities } = body

    // Validate shape: sports/forensics/clubs should be arrays of [emoji, name] tuples
    // priorities should be arrays of { k, e, mentee, mentor } objects
    if (!Array.isArray(sports) || !Array.isArray(forensics) || !Array.isArray(clubs) || !Array.isArray(priorities)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'All fields must be arrays' }) }
    }
    const validTuple = arr => arr.every(item => Array.isArray(item) && item.length === 2)
    const validPrio = arr => arr.every(p => p && typeof p.k === 'string' && typeof p.mentee === 'string' && typeof p.mentor === 'string')
    if (!validTuple(sports) || !validTuple(forensics) || !validTuple(clubs) || !validPrio(priorities)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid data shape' }) }
    }

    // Get the single config row id
    const { data: existing, error: fetchErr } = await supabase
      .from('form_config')
      .select('id')
      .limit(1)
      .single()

    if (fetchErr || !existing) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'No config row found' }) }
    }

    const { error: updateErr } = await supabase
      .from('form_config')
      .update({ sports, forensics, clubs, priorities, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (updateErr) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: updateErr.message }) }
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
}
