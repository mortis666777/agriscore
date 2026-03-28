import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const users = [
    { email: "farmer@agri.kz", password: "Demo1234!", full_name: "Фермер Демо", role: "applicant" },
    { email: "expert@agri.kz", password: "Demo1234!", full_name: "Эксперт Демо", role: "expert" },
  ];

  const results = [];

  for (const u of users) {
    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const exists = existingUsers?.users?.find((eu: any) => eu.email === u.email);
    
    if (exists) {
      results.push({ email: u.email, status: "already exists", id: exists.id });
      continue;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });

    if (error) {
      results.push({ email: u.email, status: "error", error: error.message });
    } else {
      results.push({ email: u.email, status: "created", id: data.user?.id });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { "Content-Type": "application/json" },
  });
});
