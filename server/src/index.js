import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';

import registerRoute from './routes/register.js';
import loginRoute from './routes/login.js';
import inviteRoute from './routes/invite.js';
import {pingDB} from './db.js';
import meRoute from './routes/me.js';
import syncRoutes from './routes/sync.js';
import deleteRoute from './routes/delete.js';
import updatePassword from './routes/update_password.js'

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    res.json({ok: await pingDB()});
  } catch {
    res.status(500).json({ok: false});
  }
});

app.use(registerRoute);
app.use(loginRoute);
app.use(inviteRoute);
app.use(meRoute);
app.use(updatePassword);
app.use('/sync', syncRoutes);
app.use(deleteRoute);

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () =>
  console.log(`API listening on http://localhost:${PORT}`),
);
