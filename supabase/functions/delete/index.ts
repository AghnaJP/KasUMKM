import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase client
const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  if (req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Extract phone from query parameters
    const url = new URL(req.url);
    const phone = url.searchParams.get('user_phone');

    if (!phone) {
      return new Response(JSON.stringify({ error: 'missing_phone' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Cek user exist by phone
    const { data: user, error: eUser } = await sb
      .from('users')
      .select('id, phone')
      .eq('phone', phone)
      .single();

    if (eUser || !user) {
      return new Response(JSON.stringify({ error: 'user_not_found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Hapus sessions
    const { count: sessionsDeleted, error: eSessDel } = await sb
      .from('sessions')
      .delete()
      .eq('user_id', userId)
      .select('id', { count: 'exact' });
    if (eSessDel) {
      throw eSessDel;
    }

    // Hapus memberships
    const { count: membershipsDeleted, error: eMemDel } = await sb
      .from('memberships')
      .delete()
      .eq('user_id', userId)
      .select('id', { count: 'exact' });
    if (eMemDel) {
      throw eMemDel;
    }

    // Hapus user
    const { count: usersDeleted, error: eUserDel } = await sb
      .from('users')
      .delete()
      .eq('id', userId)
      .select('id', { count: 'exact' });
    if (eUserDel) {
      throw eUserDel;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User deleted successfully',
        deleted: {
          sessions: sessionsDeleted ?? 0,
          memberships: membershipsDeleted ?? 0,
          users: usersDeleted ?? 0,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Delete operation error:', err);
    return new Response(
      JSON.stringify({ error: 'delete_failed', message: err?.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});