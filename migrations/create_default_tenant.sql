-- Create default tenant for existing data
INSERT INTO "Tenant" (id, name, slug, status, settings)
VALUES (
  gen_random_uuid(),
  'Default Organization',
  'default',
  'active',
  jsonb_build_object(
    'branding', jsonb_build_object('companyName', 'Benefits Assistant')
  )
) RETURNING id;

-- Associate existing users with default tenant
INSERT INTO "TenantUser" ("tenantId", "userId", role)
SELECT 
  (SELECT id FROM "Tenant" WHERE slug = 'default' LIMIT 1),
  id,
  'member'
FROM "User";

-- Associate existing chats with default tenant
INSERT INTO "TenantChat" ("tenantId", "chatId")
SELECT 
  (SELECT id FROM "Tenant" WHERE slug = 'default' LIMIT 1),
  id
FROM "Chat";
