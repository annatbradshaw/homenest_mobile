// Supabase Edge Function: validate-upload
// Server-side file validation with magic byte checking
// Security: Prevents malicious file uploads by validating file type at server level

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Magic bytes for allowed file types
const ALLOWED_TYPES: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
  'image/gif': [0x47, 0x49, 0x46, 0x38], // GIF8
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF (need to also check for WEBP)
}

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const projectId = formData.get('projectId') as string | null
    const tenantId = formData.get('tenantId') as string | null

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!projectId || !tenantId) {
      return new Response(
        JSON.stringify({ error: 'Missing projectId or tenantId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Read file bytes for magic number validation
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer.slice(0, 16))

    // Validate file type by magic bytes
    let detectedType: string | null = null
    for (const [mimeType, magicBytes] of Object.entries(ALLOWED_TYPES)) {
      const matches = magicBytes.every((byte, index) => bytes[index] === byte)
      if (matches) {
        // Special check for WebP (RIFF....WEBP)
        if (mimeType === 'image/webp') {
          const webpMarker = new Uint8Array(buffer.slice(8, 12))
          const webpStr = String.fromCharCode(...webpMarker)
          if (webpStr === 'WEBP') {
            detectedType = mimeType
            break
          }
        } else {
          detectedType = mimeType
          break
        }
      }
    }

    if (!detectedType) {
      return new Response(
        JSON.stringify({
          error: 'Invalid file type. Allowed types: PDF, JPEG, PNG, GIF, WebP',
          allowedTypes: Object.keys(ALLOWED_TYPES)
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user has access to this tenant
    const { data: membership, error: membershipError } = await supabaseClient
      .from('tenant_memberships')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single()

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this tenant' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate safe filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin'
    const safeFileName = `${Date.now()}_${crypto.randomUUID()}.${fileExt}`
    const filePath = `${tenantId}/${projectId}/${safeFileName}`

    // Upload the validated file
    const { data: _uploadData, error: uploadError } = await supabaseClient.storage
      .from('documents')
      .upload(filePath, file, {
        contentType: detectedType,
        upsert: false,
      })

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the public URL
    const { data: urlData } = supabaseClient.storage
      .from('documents')
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({
        success: true,
        path: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: detectedType,
        originalName: file.name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Upload validation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
