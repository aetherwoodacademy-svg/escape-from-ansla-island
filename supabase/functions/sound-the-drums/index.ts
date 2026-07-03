// Escape from Ansla Island — the drums.
// Deploy as Supabase Edge Function "sound-the-drums".
// Secrets required (Edge Functions → Secrets):
//   DRUM_VAPID_PUBLIC, DRUM_VAPID_PRIVATE, DRUM_CONTACT (mailto:...)
// Called by the app after the colours rise or a hunt begins.

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") ?? "";
    const service = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Who is calling? Must be a signed-in crew device.
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    if (!userData?.user) return new Response("no", { status: 401, headers: corsHeaders });

    const { data: device } = await service
      .from("crew_devices").select("member_id").eq("auth_uid", userData.user.id).maybeSingle();
    if (!device) return new Response("not crew", { status: 403, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const kind = body.kind === "hunt" ? "hunt" : "colours";
    const by = String(body.by ?? "The crew").slice(0, 40);
    const what = String(body.what ?? "").slice(0, 80);

    const payload = JSON.stringify(kind === "hunt"
      ? { title: "The island is watching…", body: by + " lit the lantern. " + (what ? what + " has gone to ground!" : "The hunt is on!"), tag: "ansla-hunt" }
      : { title: "THE COLOURS ARE RAISED!", body: by + " calls the crew" + (what ? ": " + what : "") + ". I'm going, is anyone coming?", tag: "ansla-colours" });

    webpush.setVapidDetails(
      Deno.env.get("DRUM_CONTACT") ?? "mailto:crew@ansla.island",
      Deno.env.get("DRUM_VAPID_PUBLIC")!,
      Deno.env.get("DRUM_VAPID_PRIVATE")!,
    );

    // Sound the drums for everyone except the caller's own member (they know).
    const { data: subs } = await service
      .from("push_subscriptions").select("*")
      .neq("member_id", device.member_id);

    let sent = 0;
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (err) {
        // 404/410: the phone forgot us — prune the dead drum.
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await service.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }
    return new Response(JSON.stringify({ sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(String(e), { status: 500, headers: corsHeaders });
  }
});
