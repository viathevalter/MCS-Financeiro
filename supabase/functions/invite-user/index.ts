import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 1. Create Supabase client with Service Role Key (securely accessed from env)
        // The service role key is required to bypass RLS and invite users
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // 2. Get the user from the Authorization header (JWT)
        // This ensures only authenticated users can call this function
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
            authHeader.replace('Bearer ', '')
        )

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to invite users.' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Parse request body
        const { email, force, origin: bodyOrigin } = await req.json()

        if (!email) {
            return new Response(
                JSON.stringify({ error: 'Bad Request', message: 'Email is required.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Use origin from body (preferred) or header
        const origin = bodyOrigin || req.headers.get('origin')

        const inviteOptions = {
            redirectTo: `${origin}?next=/update-password`
        }

        // 4. Invite the user
        let { data, error } = await supabaseClient.auth.admin.inviteUserByEmail(email, inviteOptions)

        // Handle "User already exists" with Force option
        if (error && (error.message.includes('already been registered') || error.message.includes('User already registered')) && force) {
            console.log('User exists, force is true. Deleting and re-inviting...')

            // Find the user to get ID
            const { data: { users } } = await supabaseClient.auth.admin.listUsers()
            const existingUser = users.find((u: any) => u.email === email)

            if (existingUser) {
                const { error: deleteError } = await supabaseClient.auth.admin.deleteUser(existingUser.id)
                if (deleteError) {
                    throw deleteError
                }
                // Retry invite
                const retry = await supabaseClient.auth.admin.inviteUserByEmail(email, inviteOptions)
                data = retry.data
                error = retry.error
            }
        }

        if (error) {
            console.error('Error inviting user:', error)
            return new Response(
                JSON.stringify({ error: error.code || 'InviteFailed', message: error.message }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        return new Response(
            JSON.stringify({ message: 'User invited successfully!', data }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Unexpected error:', error)
        return new Response(
            JSON.stringify({ error: 'Internal Server Error', message: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
