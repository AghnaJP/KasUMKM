/* eslint-disable no-undef */
import http from 'k6/http';
import {check, sleep} from 'k6';
import {Rate} from 'k6/metrics';

export let failureRate = new Rate('http_failures');

export let options = {
  stages: [
    {duration: '1m', target: 20},
    {duration: '1m', target: 50},
    {duration: '1m', target: 100},
    {duration: '1m', target: 150},
    {duration: '1m', target: 200},
    {duration: '1m', target: 250},
    {duration: '2m', target: 0},
  ],
  thresholds: {
    http_req_failed: ['rate<0.1'],
    http_req_duration: ['p(95)<5000'],
  },
};

const API_BASE = 'https://hzkglnqsiamcclyxlyjb.supabase.co/functions/v1';

function jsonHeaders(token = null) {
  const h = {'Content-Type': 'application/json'};
  if (token) {
    // eslint-disable-next-line dot-notation
    h['Authorization'] = `Bearer ${token}`;
  }
  return h;
}

function generatePhoneNumber() {
  const prefix = '628';
  const vuPart = String(__VU).padStart(3, '0');
  const iterPart = String(__ITER).padStart(4, '0');
  const randomPart = String(Math.floor(Math.random() * 1000)).padStart(2, '0');
  return prefix + vuPart + iterPart + randomPart;
}

export default function () {
  const iterationId = `${__VU}-${__ITER}`;
  const user = {
    phone: generatePhoneNumber(),
    password: 'TestPass123!',
    name: `LoadTest-${__ITER}`,
  };

  console.log(`[${iterationId}] Starting - Phone: ${user.phone}`);

  const regPayload = JSON.stringify({
    name: user.name,
    phone: user.phone,
    password: user.password,
  });

  let r = http.post(`${API_BASE}/register`, regPayload, {
    headers: jsonHeaders(),
    timeout: '30s',
    tags: {endpoint: 'register'},
  });

  if (r.status === 0 || !r.body) {
    console.log(
      `[${iterationId}] Register timeout/failed - Status: ${r.status}`,
    );
    failureRate.add(1);
    return;
  }

  const registerOk = check(r, {
    'register: 200/201/409': res => [200, 201, 409].includes(res.status),
  });

  if (!registerOk) {
    failureRate.add(1);
    const bodyPreview = r.body ? r.body.substring(0, 200) : 'no body';
    console.log(
      `[${iterationId}] Register failed: ${r.status} - ${bodyPreview}`,
    );
  }

  sleep(1);

  const loginPayload = JSON.stringify({
    phone: user.phone,
    password: user.password,
  });

  r = http.post(`${API_BASE}/login`, loginPayload, {
    headers: jsonHeaders(),
    timeout: '30s',
    tags: {endpoint: 'login'},
  });

  if (r.status === 0 || !r.body) {
    console.log(`[${iterationId}] Login timeout/failed - Status: ${r.status}`);
    failureRate.add(1);
    return;
  }

  const loginOk = check(r, {
    'login: 200': res => res.status === 200,
  });

  if (!loginOk) {
    failureRate.add(1);
    const bodyPreview = r.body ? r.body.substring(0, 200) : 'no body';
    console.log(`[${iterationId}] Login failed: ${r.status} - ${bodyPreview}`);
    return;
  }

  let token = null;
  let companyId = null;
  try {
    const body = JSON.parse(r.body);
    token =
      body.access_token ||
      body.token ||
      body.data?.access_token ||
      body.data?.token;

    companyId =
      body.default_company_id ||
      body.data?.default_company_id ||
      body.memberships?.[0]?.company_id;

    if (!token) {
      console.log(`[${iterationId}] Token not found. Full response: ${r.body}`);
    }

    if (!companyId) {
      console.log(
        `[${iterationId}] Company ID not found in response: ${r.body}`,
      );
    }
  } catch (e) {
    console.log(
      `[${iterationId}] Failed to parse login response: ${e.message}`,
    );
  }

  const tokenOk = check(token, {
    'login: got token': t => t !== null && t !== undefined && t !== '',
  });

  if (!tokenOk) {
    failureRate.add(1);
    return;
  }

  console.log(
    `[${iterationId}] Login successful - Token: ${token.substring(0, 10)}...`,
  );
  console.log(`[${iterationId}] Default company ID: ${companyId}`);
  sleep(1);

  if (companyId) {
    console.log(
      `[${iterationId}] Found company_id: ${companyId} — running sync tests`,
    );
    const now = new Date().toISOString();
    const pushType = Math.random() < 0.5 ? 'menus' : 'transactions';

    let pushPayload;

    if (pushType === 'menus') {
      pushPayload = JSON.stringify({
        company_id: companyId,
        menus_upsert: [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            name: `Demo Menu ${iterationId}`,
            price: 12000,
            category: Math.random() < 0.5 ? 'food' : 'drink',
            occurred_at: now,
            created_at: now,
            updated_at: now,
          },
        ],
        menus_delete: [],
        transactions_upsert: [],
        transactions_delete: [],
      });
    } else {
      pushPayload = JSON.stringify({
        company_id: companyId,
        transactions_upsert: [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            menu_id: null,
            name: `Test TX ${iterationId}`,
            type: Math.random() < 0.5 ? 'INCOME' : 'EXPENSE',
            amount: Math.floor(Math.random() * 50000) + 10000,
            quantity: 1,
            unit_price: 0,
            occurred_at: now,
            created_at: now,
            updated_at: now,
          },
        ],
        transactions_delete: [],
        menus_upsert: [],
        menus_delete: [],
      });
    }

    let push = http.post(`${API_BASE}/sync/push`, pushPayload, {
      headers: jsonHeaders(token),
      timeout: '30s',
      tags: {endpoint: 'sync-push'},
    });

    const pushOk = check(push, {
      'sync push: 200/201': res => [200, 201].includes(res.status),
    });

    if (pushOk) {
      console.log(`[${iterationId}] Push sync success (${push.status})`);
    } else {
      console.log(
        `[${iterationId}] Push sync failed (${
          push.status
        }) - ${push.body.substring(0, 100)}`,
      );
      failureRate.add(1);
    }

    sleep(1);

    const since = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // last 5 min
    let pull = http.get(
      `${API_BASE}/sync/pull?company_id=${encodeURIComponent(
        companyId,
      )}&since=${encodeURIComponent(since)}`,
      {
        headers: jsonHeaders(token),
        timeout: '30s',
        tags: {endpoint: 'sync-pull'},
      },
    );

    const pullOk = check(pull, {
      'sync pull: 200': res => res.status === 200,
    });

    if (pullOk) {
      console.log(`[${iterationId}] Pull sync success (${pull.status})`);
    } else {
      console.log(
        `[${iterationId}] Pull sync failed (${
          pull.status
        }) - ${pull.body.substring(0, 100)}`,
      );
      failureRate.add(1);
    }
  } else {
    console.log(`[${iterationId}] No company_id found — skipping sync`);
  }

  if (companyId) {
    console.log(
      `[${iterationId}] Found company_id: ${companyId} — running sync tests`,
    );
    const now = new Date().toISOString();
    const pushType = Math.random() < 0.5 ? 'menus' : 'transactions';

    let pushPayload;

    if (pushType === 'menus') {
      pushPayload = JSON.stringify({
        company_id: companyId,
        menus_upsert: [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            name: `Demo Menu ${iterationId}`,
            price: 12000,
            category: Math.random() < 0.5 ? 'food' : 'drink',
            occurred_at: now,
            created_at: now,
            updated_at: now,
          },
        ],
        menus_delete: [],
        transactions_upsert: [],
        transactions_delete: [],
      });
    } else {
      pushPayload = JSON.stringify({
        company_id: companyId,
        transactions_upsert: [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            menu_id: null,
            name: `Test TX ${iterationId}`,
            type: Math.random() < 0.5 ? 'INCOME' : 'EXPENSE',
            amount: Math.floor(Math.random() * 50000) + 10000,
            quantity: 1,
            unit_price: 0,
            occurred_at: now,
            created_at: now,
            updated_at: now,
          },
        ],
        transactions_delete: [],
        menus_upsert: [],
        menus_delete: [],
      });
    }

    let push = http.post(`${API_BASE}/sync/push`, pushPayload, {
      headers: jsonHeaders(token),
      timeout: '30s',
      tags: {endpoint: 'sync-push'},
    });

    const pushOk = check(push, {
      'sync push: 200/201': res => [200, 201].includes(res.status),
    });

    if (pushOk) {
      console.log(`[${iterationId}] Push sync success (${push.status})`);
    } else {
      console.log(
        `[${iterationId}] Push sync failed (${
          push.status
        }) - ${push.body.substring(0, 100)}`,
      );
      failureRate.add(1);
    }

    sleep(1);

    const since = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // last 5 min
    let pull = http.get(
      `${API_BASE}/sync/pull?company_id=${encodeURIComponent(
        companyId,
      )}&since=${encodeURIComponent(since)}`,
      {
        headers: jsonHeaders(token),
        timeout: '30s',
        tags: {endpoint: 'sync-pull'},
      },
    );

    const pullOk = check(pull, {
      'sync pull: 200': res => res.status === 200,
    });

    if (pullOk) {
      console.log(`[${iterationId}] Pull sync success (${pull.status})`);
    } else {
      console.log(
        `[${iterationId}] Pull sync failed (${
          pull.status
        }) - ${pull.body.substring(0, 100)}`,
      );
      failureRate.add(1);
    }
  } else {
    console.log(`[${iterationId}] No company_id found — skipping sync`);
  }

  if (companyId) {
    console.log(
      `[${iterationId}] Found company_id: ${companyId} — running sync tests`,
    );
    const now = new Date().toISOString();
    const pushType = Math.random() < 0.5 ? 'menus' : 'transactions';

    let pushPayload;

    if (pushType === 'menus') {
      pushPayload = JSON.stringify({
        company_id: companyId,
        menus_upsert: [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            name: `Demo Menu ${iterationId}`,
            price: 12000,
            category: Math.random() < 0.5 ? 'food' : 'drink',
            occurred_at: now,
            created_at: now,
            updated_at: now,
          },
        ],
        menus_delete: [],
        transactions_upsert: [],
        transactions_delete: [],
      });
    } else {
      pushPayload = JSON.stringify({
        company_id: companyId,
        transactions_upsert: [
          {
            id: crypto.randomUUID(),
            company_id: companyId,
            menu_id: null,
            name: `Test TX ${iterationId}`,
            type: Math.random() < 0.5 ? 'INCOME' : 'EXPENSE',
            amount: Math.floor(Math.random() * 50000) + 10000,
            quantity: 1,
            unit_price: 0,
            occurred_at: now,
            created_at: now,
            updated_at: now,
          },
        ],
        transactions_delete: [],
        menus_upsert: [],
        menus_delete: [],
      });
    }

    let push = http.post(`${API_BASE}/sync/push`, pushPayload, {
      headers: jsonHeaders(token),
      timeout: '30s',
      tags: {endpoint: 'sync-push'},
    });

    const pushOk = check(push, {
      'sync push: 200/201': res => [200, 201].includes(res.status),
    });

    if (pushOk) {
      console.log(`[${iterationId}] Push sync success (${push.status})`);
    } else {
      console.log(
        `[${iterationId}] Push sync failed (${
          push.status
        }) - ${push.body.substring(0, 100)}`,
      );
      failureRate.add(1);
    }

    sleep(1);

    const since = new Date(Date.now() - 1000 * 60 * 5).toISOString(); // last 5 min
    let pull = http.get(
      `${API_BASE}/sync/pull?company_id=${encodeURIComponent(
        companyId,
      )}&since=${encodeURIComponent(since)}`,
      {
        headers: jsonHeaders(token),
        timeout: '30s',
        tags: {endpoint: 'sync-pull'},
      },
    );

    const pullOk = check(pull, {
      'sync pull: 200': res => res.status === 200,
    });

    if (pullOk) {
      console.log(`[${iterationId}] Pull sync success (${pull.status})`);
    } else {
      console.log(
        `[${iterationId}] Pull sync failed (${
          pull.status
        }) - ${pull.body.substring(0, 100)}`,
      );
      failureRate.add(1);
    }
  } else {
    console.log(`[${iterationId}] No company_id found — skipping sync`);
  }
}
