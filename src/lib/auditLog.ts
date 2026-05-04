import { supabase } from "@/integrations/supabase/client";

export const logAudit = async (
  action: string,
  entityType: string,
  entityId: string,
  before?: unknown,
  after?: unknown,
) => {
  try {
    await supabase.rpc("log_admin_action", {
      _action: action,
      _entity_type: entityType,
      _entity_id: entityId,
      _before: (before ?? null) as never,
      _after: (after ?? null) as never,
    });
  } catch (err) {
    console.error("[auditLog] failed", err);
  }
};
