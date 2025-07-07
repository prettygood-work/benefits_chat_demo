import 'server-only';

import { and, eq, inArray, desc, asc, lt } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Tenant, TenantUser, NewTenant, TenantChat } from '../schema';
import { ChatSDKError } from '@/lib/errors';

const { tenant, tenantUser, tenantChat, user, chat } = schema;

// Get tenant by slug (for subdomain routing)
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
	try {
		const [result] = await db
			.select()
			.from(tenant)
			.where(
				and(eq(tenant.slug, slug.toLowerCase()), eq(tenant.status, 'active'))
			)
			.limit(1);
		return result || null;
	} catch (error) {
		console.error('Failed to get tenant by slug:', error);
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to retrieve tenant'
		);
	}
}

// Get tenant by ID
export async function getTenantById(id: string): Promise<Tenant | null> {
	try {
		const [result] = await db
			.select()
			.from(tenant)
			.where(eq(tenant.id, id))
			.limit(1);
		return result || null;
	} catch (error) {
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to retrieve tenant by ID'
		);
	}
}

// Create new tenant
export async function createTenant(data: {
	name: string;
	slug: string;
	ownerId: string;
	settings?: Partial<Tenant['settings']>;
}): Promise<Tenant> {
	try {
		// Start transaction
		const newTenant = await db.transaction(async (tx) => {
			// Create tenant
			const [createdTenant] = await tx
				.insert(tenant)
				.values({
					name: data.name,
					slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
					settings: data.settings as Tenant['settings'] || undefined,
					updatedAt: new Date(),
				})
				.returning();
			// Add owner with privileged role
			await tx.insert(tenantUser).values({
				tenantId: createdTenant.id,
				userId: data.ownerId,
				role: 'owner',
				permissions: ['*'],
			});
			return createdTenant;
		});
		return newTenant;
	} catch (error) {
		if (error instanceof Error && error.message.includes('unique')) {
			throw new ChatSDKError(
				'bad_request:validation',
				'A tenant with this slug already exists'
			);
		}
		throw new ChatSDKError('bad_request:database', 'Failed to create tenant');
	}
}

// Update tenant
export async function updateTenant(
	id: string,
	data: Partial<Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Tenant> {
	try {
		const [updated] = await db
			.update(tenant)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(tenant.id, id))
			.returning();
		if (!updated) {
			throw new ChatSDKError('not_found', 'Tenant not found');
		}
		return updated;
	} catch (error) {
		if (error instanceof ChatSDKError) throw error;
		throw new ChatSDKError('bad_request:database', 'Failed to update tenant');
	}
}

// Get user's tenants
export async function getUserTenants(
	userId: string
): Promise<
	Array<{
		tenant: Tenant;
		role: string;
		permissions: string[];
	}>
> {
	try {
		const results = await db
			.select({
				tenant: tenant,
				role: tenantUser.role,
				permissions: tenantUser.permissions,
			})
			.from(tenantUser)
			.innerJoin(tenant, eq(tenantUser.tenantId, tenant.id))
			.where(
				and(eq(tenantUser.userId, userId), eq(tenant.status, 'active'))
			)
			.orderBy(desc(tenantUser.joinedAt));
		return results;
	} catch (error) {
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to retrieve user tenants'
		);
	}
}

// Check if user has access to tenant
export async function userCanAccessTenant(
	userId: string,
	tenantId: string,
	requiredRole?: TenantUser['role']
): Promise<boolean> {
	try {
		const [access] = await db
			.select({ role: tenantUser.role })
			.from(tenantUser)
			.where(
				and(eq(tenantUser.userId, userId), eq(tenantUser.tenantId, tenantId))
			)
			.limit(1);
		if (!access) return false;
		if (!requiredRole) return true;
		const roleHierarchy = { owner: 3, admin: 2, member: 1 };
		return roleHierarchy[access.role] >= roleHierarchy[requiredRole];
	} catch (error) {
		console.error('Access check failed:', error);
		return false;
	}
}

// Add user to tenant
export async function addUserToTenant(
	tenantId: string,
	userId: string,
	role: 'owner' | 'admin' | 'member' = 'member',
	addedBy?: string
): Promise<TenantUser> {
	try {
		// Verify user exists
		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);
		if (!existingUser) {
			throw new ChatSDKError('not_found', 'User not found');
		}
		const existing = await db
			.select()
			.from(tenantUser)
			.where(
				and(eq(tenantUser.tenantId, tenantId), eq(tenantUser.userId, userId))
			)
			.limit(1);
		if (existing.length > 0) {
			throw new ChatSDKError(
				'bad_request:validation',
				'User is already a member of this tenant'
			);
		}
		const [newMember] = await db
			.insert(tenantUser)
			.values({
				tenantId,
				userId,
				role,
				permissions: role === 'owner' ? ['*'] : [],
			})
			.returning();
		return newMember;
	} catch (error) {
		if (error instanceof ChatSDKError) throw error;
		throw new ChatSDKError('bad_request:database', 'Failed to add user to tenant');
	}
}

// Get tenant chats
export async function getTenantChats(
	tenantId: string,
	options?: { userId?: string; limit?: number; cursor?: string }
): Promise<
	Array<{
		chat: typeof chat;
		tenantMetadata: TenantChat['metadata'];
	}>
> {
	try {
		let query = db
			.select({
				chat: chat,
				tenantMetadata: tenantChat.metadata,
			})
			.from(tenantChat)
			.innerJoin(chat, eq(tenantChat.chatId, chat.id))
			.where(eq(tenantChat.tenantId, tenantId))
			.$dynamic();
		if (options?.userId) {
			query = query.where(eq(chat.userId, options.userId));
		}
		if (options?.cursor) {
			query = query.where(lt(chat.createdAt, new Date(options.cursor)));
		}
		query = query.orderBy(desc(chat.createdAt)).limit(options?.limit || 50);
		return await query;
	} catch (error) {
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to retrieve tenant chats'
		);
	}
}

// Associate existing chat with tenant
export async function associateChatWithTenant(
	chatId: string,
	tenantId: string,
	metadata?: TenantChat['metadata']
): Promise<void> {
	try {
		await db.insert(tenantChat).values({
			tenantId,
			chatId,
			metadata: metadata || {},
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes('unique')) {
			return;
		}
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to associate chat with tenant'
		);
	}
}

// Get all tenants (admin only)
export async function getAllTenants(options?: {
	limit?: number;
	offset?: number;
	status?: 'active' | 'inactive';
}): Promise<Tenant[]> {
	try {
		let query = db.select().from(tenant).$dynamic();
		if (options?.status) {
			query = query.where(eq(tenant.status, options.status));
		}
		query = query
			.orderBy(desc(tenant.createdAt))
			.limit(options?.limit || 50)
			.offset(options?.offset || 0);
		return await query;
	} catch (error) {
		throw new ChatSDKError(
			'bad_request:database',
			'Failed to retrieve tenants'
		);
	}
}
