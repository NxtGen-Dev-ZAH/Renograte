-- Database indexes for admin dashboard optimization
-- These indexes will significantly improve query performance for the admin dashboard APIs

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Listings table indexes
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_agent_id ON listings(agent_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_status_created_at ON listings(status, created_at);

-- Tasks table indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id_status ON tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Marketing assets table indexes
CREATE INDEX IF NOT EXISTS idx_marketing_assets_type ON marketing_assets(type);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_category ON marketing_assets(category);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_status ON marketing_assets(status);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_created_at ON marketing_assets(created_at);

-- Campaigns table indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);

-- Member profiles table indexes (for early access)
CREATE INDEX IF NOT EXISTS idx_member_profiles_is_early_access ON member_profiles(is_early_access);
CREATE INDEX IF NOT EXISTS idx_member_profiles_status ON member_profiles(status);
CREATE INDEX IF NOT EXISTS idx_member_profiles_is_early_access_status ON member_profiles(is_early_access, status);
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON member_profiles(user_id);

-- Early access quotas table indexes
CREATE INDEX IF NOT EXISTS idx_early_access_quotas_role ON early_access_quotas(role);
CREATE INDEX IF NOT EXISTS idx_early_access_quotas_is_active ON early_access_quotas(is_active);

-- Term sheets table indexes
CREATE INDEX IF NOT EXISTS idx_term_sheets_status ON term_sheets(status);
CREATE INDEX IF NOT EXISTS idx_term_sheets_user_id ON term_sheets(user_id);
CREATE INDEX IF NOT EXISTS idx_term_sheets_created_at ON term_sheets(created_at);
CREATE INDEX IF NOT EXISTS idx_term_sheets_user_id_status ON term_sheets(user_id, status);

-- Users table indexes (for admin operations)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_listings_agent_status_created ON listings(agent_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_priority_status ON tasks(user_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_member_profiles_early_access_pending ON member_profiles(is_early_access, status, created_at);

-- Performance monitoring query
-- You can run this query to check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY idx_scan DESC;
