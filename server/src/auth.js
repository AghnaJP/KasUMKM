import {sb} from './supabase.js';

export async function auth(req, res, next) {
  try {
    const h = req.headers?.authorization || req.headers?.Authorization || '';
    const m = /^Bearer\s+(.+)$/i.exec(String(h).trim());
    if (!m) {
      return res.status(401).json({error: 'auth_error'});
    }

    const sessionId = m[1];
    const now = new Date().toISOString();

    const {data: session, error} = await sb
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('id', sessionId)
      .gt('expires_at', now)
      .single();

    if (error || !session) {
      return res.status(401).json({error: 'auth_error'});
    }

    req.userId = session.user_id;
    req.sessionId = session.id;
    return next();
  } catch (e) {
    return res.status(401).json({error: 'auth_error'});
  }
}
