-- HMSA Database Schema
-- Run this script to create all required tables
--
-- This schema supports:
-- - Hospital management (hospitals table)
-- - User management with roles and permissions (hospital_users, roles, user_roles)
-- - Patient and clinician management
-- - Appointment scheduling
-- - Message templates and notifications
-- - User preferences (theme, 2FA, etc.)
-- - Session management and login history
-- - In-app notifications system
-- - System activity logging
-- - Impersonation tracking
-- - N8N workflow monitoring
--
-- Last Updated: 2024-01-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(10),
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hospital Users table (includes all user types)
CREATE TABLE IF NOT EXISTS hospital_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'hospital_admin', 'clinician', 'receptionist', 'patient', 'support_staff')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (for role-based access control)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of permission strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User roles assignment (many-to-many relationship)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hospital_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES hospital_users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES hospital_users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    sidebar_collapsed BOOLEAN DEFAULT FALSE,
    telemetry_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Two-factor authentication table
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES hospital_users(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE,
    method VARCHAR(50) CHECK (method IN ('google', 'authenticator')),
    secret VARCHAR(255), -- Encrypted TOTP secret
    backup_codes JSONB, -- Array of backup codes (encrypted)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hospital_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45), -- IPv6 compatible
    user_agent TEXT,
    device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
    is_active BOOLEAN DEFAULT TRUE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Login history table
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hospital_users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    login_successful BOOLEAN DEFAULT TRUE,
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Password history table (for security tracking)
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hospital_users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    changed_by UUID REFERENCES hospital_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- In-app notifications table
CREATE TABLE IF NOT EXISTS app_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES hospital_users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'system_abnormal', 'role_added', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    route TEXT, -- Route to navigate to when clicked
    metadata JSONB, -- Additional data
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System activity logs table
CREATE TABLE IF NOT EXISTS system_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES hospital_users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL, -- 'hospital_created', 'user_deleted', etc.
    entity_type VARCHAR(50), -- 'hospital', 'user', 'role', etc.
    entity_id UUID,
    description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Impersonation logs table
CREATE TABLE IF NOT EXISTS impersonation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    super_admin_id UUID NOT NULL REFERENCES hospital_users(id) ON DELETE CASCADE,
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- N8N workflow logs table
CREATE TABLE IF NOT EXISTS n8n_workflow_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_name VARCHAR(255) NOT NULL,
    workflow_id VARCHAR(255), -- n8n workflow ID
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'running', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    executions_count INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- N8N workflow executions table (detailed execution logs)
CREATE TABLE IF NOT EXISTS n8n_workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_log_id UUID REFERENCES n8n_workflow_logs(id) ON DELETE CASCADE,
    execution_id VARCHAR(255) UNIQUE, -- n8n execution ID
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'error', 'running', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    date_of_birth DATE,
    mrn VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Auto-generate MRN on patient creation
CREATE OR REPLACE FUNCTION generate_mrn()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mrn IS NULL OR NEW.mrn = '' THEN
        NEW.mrn := 'MRN-' || LPAD(NEW.id::TEXT, 8, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_patient_mrn
BEFORE INSERT ON patients
FOR EACH ROW
EXECUTE FUNCTION generate_mrn();

-- Clinicians table
CREATE TABLE IF NOT EXISTS clinicians (
    id SERIAL PRIMARY KEY,
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, email)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    patient_id INTEGER REFERENCES patients(id),
    clinician_id INTEGER REFERENCES clinicians(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Message Templates table
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'voice')),
    subject VARCHAR(255),
    body_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, name, channel)
);

-- Contact Preferences table
CREATE TABLE IF NOT EXISTS contact_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'voice')),
    is_opt_in BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hospital_id, patient_id, channel)
);

-- Notifications table (outbound messages)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id),
    appointment_id UUID REFERENCES appointments(id),
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms', 'voice')),
    provider VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    attempts INTEGER DEFAULT 0,
    next_retry TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hospital_users_hospital_id ON hospital_users(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_users_email ON hospital_users(email);
CREATE INDEX IF NOT EXISTS idx_hospital_users_role ON hospital_users(role);
CREATE INDEX IF NOT EXISTS idx_hospital_users_is_active ON hospital_users(is_active);
CREATE INDEX IF NOT EXISTS idx_hospital_users_last_active ON hospital_users(last_active);

-- Roles and user roles indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- 2FA indexes
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_user_id ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_auth_enabled ON two_factor_auth(enabled);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Login history indexes
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at);
CREATE INDEX IF NOT EXISTS idx_login_history_ip_address ON login_history(ip_address);

-- Password history indexes
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_password_history_created_at ON password_history(created_at);

-- App notifications indexes
CREATE INDEX IF NOT EXISTS idx_app_notifications_user_id ON app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_notifications_is_read ON app_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_app_notifications_created_at ON app_notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_app_notifications_type ON app_notifications(type);

-- System activity logs indexes
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_user_id ON system_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_activity_type ON system_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_entity_type ON system_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_system_activity_logs_created_at ON system_activity_logs(created_at);

-- Impersonation logs indexes
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_super_admin_id ON impersonation_logs(super_admin_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_hospital_id ON impersonation_logs(hospital_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_logs_started_at ON impersonation_logs(started_at);

-- N8N workflow logs indexes
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_logs_workflow_name ON n8n_workflow_logs(workflow_name);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_logs_status ON n8n_workflow_logs(status);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_logs_started_at ON n8n_workflow_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_logs_created_at ON n8n_workflow_logs(created_at);

-- N8N workflow executions indexes
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_executions_workflow_log_id ON n8n_workflow_executions(workflow_log_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_executions_execution_id ON n8n_workflow_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_executions_status ON n8n_workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_executions_started_at ON n8n_workflow_executions(started_at);

-- Existing indexes
CREATE INDEX IF NOT EXISTS idx_patients_hospital_id ON patients(hospital_id);
CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn);
CREATE INDEX IF NOT EXISTS idx_clinicians_hospital_id ON clinicians(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital_id ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinician_id ON appointments(clinician_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_templates_hospital_id ON message_templates(hospital_id);
CREATE INDEX IF NOT EXISTS idx_contact_prefs_hospital_id ON contact_preferences(hospital_id);
CREATE INDEX IF NOT EXISTS idx_contact_prefs_patient_id ON contact_preferences(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_hospital_id ON notifications(hospital_id);
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_id ON notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_hospital_users_updated_at
    BEFORE UPDATE ON hospital_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_two_factor_auth_updated_at
    BEFORE UPDATE ON two_factor_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_active on user activity
CREATE TRIGGER update_user_last_active
    BEFORE UPDATE ON hospital_users
    FOR EACH ROW
    WHEN (OLD.last_active IS DISTINCT FROM NEW.last_active)
    EXECUTE FUNCTION update_last_active();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < CURRENT_TIMESTAMP OR is_active = FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old login history (optional, for performance)
CREATE OR REPLACE FUNCTION archive_old_login_history()
RETURNS void AS $$
BEGIN
    -- Archive login history older than 90 days (adjust as needed)
    DELETE FROM login_history
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to archive old system activity logs (optional)
CREATE OR REPLACE FUNCTION archive_old_activity_logs()
RETURNS void AS $$
BEGIN
    -- Archive activity logs older than 1 year (adjust as needed)
    DELETE FROM system_activity_logs
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to get user's effective roles (including inherited roles)
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(role_id UUID, role_name VARCHAR, permissions JSONB) AS $$
BEGIN
    RETURN QUERY
    SELECT r.id, r.name, r.permissions
    FROM roles r
    INNER JOIN user_roles ur ON r.id = ur.role_id
    WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- View for user details with role information
CREATE OR REPLACE VIEW user_details_view AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.profile_picture_url,
    u.role,
    u.hospital_id,
    h.name AS hospital_name,
    u.is_active,
    u.last_login,
    u.last_active,
    u.created_at,
    COALESCE(json_agg(DISTINCT jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'description', r.description,
        'permissions', r.permissions
    )) FILTER (WHERE r.id IS NOT NULL), '[]'::json) AS roles
FROM hospital_users u
LEFT JOIN hospitals h ON u.hospital_id = h.id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY u.id, h.name;

-- View for unread notifications count per user
CREATE OR REPLACE VIEW user_unread_notifications_count AS
SELECT 
    user_id,
    COUNT(*) AS unread_count
FROM app_notifications
WHERE is_read = FALSE
GROUP BY user_id;

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM hospitals) AS total_hospitals,
    (SELECT COUNT(*) FROM hospital_users WHERE is_active = TRUE) AS active_users,
    (SELECT COUNT(*) FROM hospital_users WHERE role = 'hospital_admin' AND is_active = TRUE) AS hospital_admins,
    (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled') AS scheduled_appointments,
    (SELECT COUNT(*) FROM notifications WHERE status = 'pending') AS pending_notifications,
    (SELECT COUNT(*) FROM n8n_workflow_logs WHERE status = 'error' AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours') AS workflow_errors_24h;
