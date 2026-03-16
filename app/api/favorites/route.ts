import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

const TOOL_TYPE = 'image'

interface AuthResult {
  success: boolean;
  user?: { id: string };
  supabase?: SupabaseClient;
  error?: NextResponse;
}

async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Server configuration error: Supabase credentials not configured', success: false },
        { status: 500 }
      )
    };
  }

  if (!supabaseServiceKey) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Server configuration error: Service role key not configured', success: false },
        { status: 500 }
      )
    };
  }

  const supabaseAuth = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    };
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

  if (authError || !user) {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid authentication token', success: false },
        { status: 401 }
      )
    };
  }

  return { success: true, user, supabase };
}

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (!authResult.success) return authResult.error!;

    const { user, supabase } = authResult;

    const { data, error } = await supabase!
      .from('favorites')
      .select('id, result_url, prompt, metadata, created_at')
      .eq('user_id', user!.id)
      .eq('tool_type', TOOL_TYPE)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: 'Failed to fetch favorites', success: false }, { status: 500 });
    }

    return NextResponse.json({ favorites: data || [], success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in GET /api/favorites:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, prompt } = body;

    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'imageUrl and prompt are required', success: false }, { status: 400 });
    }

    const authResult = await authenticateRequest(req);
    if (!authResult.success) return authResult.error!;

    const { user, supabase } = authResult;

    const { data, error } = await supabase!
      .from('favorites')
      .insert({ user_id: user!.id, tool_type: TOOL_TYPE, result_url: imageUrl, prompt })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving favorite:', error);
      return NextResponse.json({ error: 'Failed to save favorite', success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in POST /api/favorites:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required', success: false }, { status: 400 });
    }

    const authResult = await authenticateRequest(req);
    if (!authResult.success) return authResult.error!;

    const { user, supabase } = authResult;

    const { error } = await supabase!
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user!.id)
      .eq('tool_type', TOOL_TYPE);

    if (error) {
      console.error('Error deleting favorite:', error);
      return NextResponse.json({ error: 'Failed to delete favorite', success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in DELETE /api/favorites:', errorMessage);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
