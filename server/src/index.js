import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import registerRoute from './routes/register.js';
import loginRoute from './routes/login.js';
import inviteRoute from './routes/invite.js';
import meRoute from './routes/me.js';
import updatePassword from './routes/update_password.js';
import deleteRoute from './routes/delete.js';
import syncRoutes from './routes/sync.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) =>
  res.json({
    ok: true,
    supabase: Boolean(process.env.SUPABASE_URL),
    env: process.env.NODE_ENV || 'dev',
  }),
);

app.use(registerRoute);
app.use(loginRoute);
app.use(inviteRoute);
app.use(meRoute);
app.use(updatePassword);
app.use('/sync', syncRoutes);
app.use(deleteRoute);

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () =>
  console.log(`✅ API listening on http://localhost:${PORT}`),
);
