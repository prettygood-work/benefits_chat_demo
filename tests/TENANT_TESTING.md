# Multi-Tenant Testing Strategy

## Core Functionality Tests

1. **User Registration & Login**
   - Register new user on tenant subdomain
   - Login existing user on tenant subdomain
   - Verify tenant-specific redirect flows

2. **Chat Functionality**
   - Create new chat in tenant context
   - Verify tenant-specific AI settings applied
   - Test file uploads with tenant file restrictions

3. **Tenant Isolation**
   - Verify users can't access chats from other tenants
   - Test API routes with incorrect tenant headers
   - Ensure tenant-specific data isn't leaked

4. **Theme & Branding**
   - Verify tenant theme applies correctly
   - Test theme persistence across page loads
   - Check responsive design with custom theme values

5. **Admin Functions**
   - Create new tenant
   - Modify tenant settings
   - Add/remove users from tenant
   - Test tenant status changes (active/inactive)

## Integration Test Matrix

| Feature | Default Tenant | Custom Tenant | Public Access | Private Access |
|---------|---------------|--------------|---------------|---------------|
| Chat    | ✓             | ✓            | ✓             | ✓             |
| Auth    | ✓             | ✓            | N/A           | ✓             |
| Upload  | ✓             | ✓            | ⚠️ (if enabled)| ✓             |
| Admin   | ✓             | ✓            | ✗             | ⚠️ (if admin)  |
