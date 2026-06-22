import { supabaseAdmin } from '../config/supabase.js'

export async function signup(req, res) {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ success: false, error: 'Email and password required.' })

  const max = parseInt(process.env.MAX_USERS || '10')
  const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
  if (listErr) return res.status(500).json({ success: false, error: 'Server error.' })

  if (users.length >= max)
    return res.status(403).json({ success: false, error: 'Signups are currently closed.' })

  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (createErr) return res.status(400).json({ success: false, error: createErr.message })

  res.json({ success: true })
}
