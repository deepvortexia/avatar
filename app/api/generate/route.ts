import Replicate from "replicate";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, style, prompt } = body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ error: 'A photo is required.', success: false }, { status: 400 });
    }
    if (!style || typeof style !== 'string' || !style.trim()) {
      return NextResponse.json({ error: 'A style must be selected.', success: false }, { status: 400 });
    }

    const finalMime = mimeType || 'image/jpeg';
    const inputImage = `data:${finalMime};base64,${imageBase64}`;
    const finalPrompt = prompt?.trim()
      ? `transform this person into a ${style} style portrait, ${prompt.trim()}`
      : `transform this person into a ${style} style portrait`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error.', success: false }, { status: 500 });
    }

    const supabaseAuth = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Please sign in to generate avatars.', success: false }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token. Please sign in again.', success: false }, { status: 401 });
    }

    let remainingCredits: number | undefined;

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('credits').eq('id', user.id).single();

      if (profileError) {
        return NextResponse.json({ error: 'Failed to fetch user profile.', success: false }, { status: 500 });
      }
      if (!profile || profile.credits < 1) {
        return NextResponse.json({ error: 'Insufficient credits. Please purchase more credits to continue.', success: false }, { status: 402 });
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .eq('credits', profile.credits)
        .select().single();

      if (updateError || !updatedProfile) {
        return NextResponse.json({ error: 'Credit check failed, please try again.', success: false }, { status: 409 });
      }

      remainingCredits = updatedProfile.credits;
      console.log('✅ Credit deducted. Remaining:', updatedProfile.credits);
    } catch (error: unknown) {
      console.error('Error deducting credit:', error);
      return NextResponse.json({ error: 'Failed to deduct credit.', success: false }, { status: 500 });
    }

    const userId: string | undefined = user?.id;

    try {
      console.log('🚀 Calling flux-kontext-pro...', { style, promptLength: finalPrompt.length });

      const output = await replicate.run(
        "black-forest-labs/flux-kontext-pro",
        {
          input: {
            prompt: finalPrompt,
            input_image: inputImage,
            output_format: 'jpg',
            output_quality: 80,
          }
        }
      );

      // Extract image URL
      let imageUrl: string | null = null;

      if (typeof output === 'string') {
        imageUrl = output;
      } else if (output instanceof URL) {
        imageUrl = output.toString();
      } else if (Array.isArray(output)) {
        const first = output[0];
        if (typeof first === 'string') imageUrl = first;
        else if (first instanceof URL) imageUrl = first.toString();
        else if (first && typeof first === 'object') {
          if ('url' in first) {
            const u = (first as any).url;
            imageUrl = typeof u === 'function' ? String(await u()) : u instanceof URL ? u.toString() : String(u);
          } else if (first.toString && first.toString !== Object.prototype.toString) {
            const s = first.toString();
            if (s.startsWith('http')) imageUrl = s;
          }
        }
      } else if (output && typeof output === 'object') {
        if ('url' in output) {
          const u = (output as any).url;
          imageUrl = typeof u === 'function' ? String(await u()) : u instanceof URL ? u.toString() : String(u);
        } else if (output.toString && output.toString !== Object.prototype.toString) {
          const s = output.toString();
          if (s.startsWith('http')) imageUrl = s;
        }
        if (!imageUrl && Symbol.asyncIterator in output) {
          const items: any[] = [];
          for await (const item of output as AsyncIterable<any>) items.push(item);
          if (items.length > 0) {
            const first = items[0];
            if (typeof first === 'string') imageUrl = first;
            else if (first instanceof URL) imageUrl = first.toString();
            else if (first?.url) {
              const u = typeof first.url === 'function' ? await first.url() : first.url;
              imageUrl = typeof u === 'string' ? u : String(u);
            }
          }
        }
      }

      if (imageUrl && typeof imageUrl !== 'string') imageUrl = String(imageUrl);
      if (!imageUrl) throw new Error('Could not extract image URL from Replicate response');
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) throw new Error('Invalid image URL format');

      console.log('✅ Avatar generated:', imageUrl);

      // Upload to Supabase Storage
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`Failed to fetch Replicate output: ${imgRes.status}`);
      const imgBuffer = await imgRes.arrayBuffer();
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(fileName, imgBuffer, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);
      const { data: { publicUrl } } = supabase.storage.from('generated-images').getPublicUrl(fileName);
      if (!publicUrl) throw new Error('Failed to get public URL after upload');
      imageUrl = publicUrl;
      console.log('✅ Uploaded to Supabase Storage:', imageUrl);

      let imageId: string | null = null;
      try {
        const { data: insertedImage, error: saveError } = await supabase
          .from('images')
          .insert({ user_id: user.id, prompt: finalPrompt, image_url: imageUrl, aspect_ratio: '1:1', is_favorite: false })
          .select().single();
        if (saveError) console.error('⚠️ Failed to save to database:', saveError);
        else imageId = insertedImage?.id || null;
      } catch (saveError) {
        console.error('⚠️ Failed to save to database:', saveError);
      }

      return NextResponse.json({ imageUrl, imageId, success: true, remainingCredits });

    } catch (generationError: unknown) {
      if (userId) {
        try {
          const { data: currentProfile } = await supabase.from('profiles').select('credits').eq('id', userId).single();
          if (currentProfile) {
            await supabase.from('profiles').update({ credits: currentProfile.credits + 1, updated_at: new Date().toISOString() }).eq('id', userId);
            console.log('✅ Credit restored due to generation failure');
          }
        } catch (restoreError) {
          console.error('❌ Failed to restore credit:', restoreError);
        }
      }
      throw generationError;
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorResponse = (error as any).response;
    console.error('❌ Flux Kontext generation error:', { message: errorMessage, status: errorResponse?.status });

    if (errorMessage?.includes('REPLICATE_API_TOKEN')) {
      return NextResponse.json({ error: 'Server configuration error: Missing API token', success: false }, { status: 500 });
    }
    if (errorResponse?.status === 402) {
      return NextResponse.json({ error: 'Insufficient Replicate credits.', success: false }, { status: 402 });
    }
    if (errorResponse?.status === 429) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please try again in a moment.', success: false }, { status: 429 });
    }
    return NextResponse.json({ error: 'Failed to generate avatar. Please try again.', details: errorMessage, success: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed. Use POST.' }, { status: 405 });
}
