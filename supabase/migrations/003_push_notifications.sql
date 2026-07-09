-- =============================================================================
-- Push notifications support
-- =============================================================================

-- Add push_token column to profiles (stores the Expo push token per device)
alter table public.profiles
  add column if not exists push_token text;

-- =============================================================================
-- AFTER running this migration, set up a Database Webhook in Supabase:
--
--   Supabase Dashboard → Database → Webhooks → Create a new hook
--   Name:    send-push-on-notification
--   Table:   public.notifications
--   Events:  INSERT
--   Type:    HTTP Request → POST
--   URL:     https://<your-project-ref>.supabase.co/functions/v1/send-push
--   Headers: Authorization: Bearer <service_role_key>
--            Content-Type: application/json
--
-- Also deploy the Edge Function:
--   supabase functions deploy send-push
-- =============================================================================
