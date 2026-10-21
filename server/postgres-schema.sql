-- ====================================================================
-- O'ZBEKISTON RESPUBLIKASI IQTISODIYOT VA MOLIYA VAZIRLIGI HUZURIDAGI
-- KADASTR AGENTLIGI
-- "KO'CHMAS MULK OB'EKTLARI MANZILLARI REESTRINING MA'LUMOTLAR BAZASI" AT
-- POSTGRESQL 18+ MA'LUMOTLAR BAZASI STRUKTURASI VA SCHEMASI
-- Standart: O'zMSt 1987:2018, O'zMSt 2590:2012
-- ====================================================================

-- 1. Kengaytmalarni faollashtirish (PostGIS geofazoviy tahlil uchun)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "postgis"; -- PostGIS serverda o'rnatilgan bo'lsa

-- 2. Foydalanuvchilar va Rollar (RBAC)
CREATE TYPE user_role_enum AS ENUM (
    'RESPUBLIKA_DKP_MM',
    'HUDUD_DKP_MM',
    'FILIAL_RAHBARI_DKP',
    'FILIAL_DKP_MM',
    'ADMIN',
    'INSPECTOR',
    'CITIZEN'
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pinfl VARCHAR(14) NOT NULL UNIQUE,       -- JSHSHIR
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'CITIZEN',
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    department VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- 3. Ko'chmas mulk manzillari reestri (Addresses)
CREATE TYPE address_status_enum AS ENUM ('active', 'cancelled', 'archived');
CREATE TYPE object_type_enum AS ENUM ('turar_joy', 'noturar', 'yer_uchastkasi');
CREATE TYPE street_type_enum AS ENUM (
    'shoh_kocha', 'kocha', 'xiyobon', 'bolak', 'otish_joyi', 
    'maydon', 'sayilgoh', 'berk_kocha', 'chiqish', 'magistral'
);

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    geocode VARCHAR(50) NOT NULL UNIQUE,     -- Unikal geokod (UZ-TAS-CHI-2026-000001)
    cadastre_number VARCHAR(30) NOT NULL,    -- 10:04:02:01:01:0024
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    planning_structure_type VARCHAR(50),     -- mahalla, mavze, daha
    planning_structure_name VARCHAR(150),
    street_type street_type_enum NOT NULL DEFAULT 'kocha',
    street_name VARCHAR(150) NOT NULL,
    house_number VARCHAR(30) NOT NULL,
    block_number VARCHAR(20),
    unit_number VARCHAR(30),
    full_address_uz TEXT NOT NULL,
    full_address_cyrillic TEXT NOT NULL,
    full_address_ru TEXT NOT NULL,
    object_type object_type_enum NOT NULL DEFAULT 'turar_joy',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    boundary_polygon JSONB,                  -- Obyekt kadastr kontur koordinatalari
    status address_status_enum NOT NULL DEFAULT 'active',
    status_reason TEXT,
    legal_grounds TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_addresses_geocode ON addresses(geocode);
CREATE INDEX idx_addresses_cadastre ON addresses(cadastre_number);
CREATE INDEX idx_addresses_region_district ON addresses(region, district);
CREATE INDEX idx_addresses_status ON addresses(status);

-- 4. Kirish va Asosiy kirish nuqtalari (TTZ 4.2.12)
CREATE TYPE entrance_point_type AS ENUM ('main', 'secondary');

CREATE TABLE address_entrance_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address_id UUID REFERENCES addresses(id) ON DELETE CASCADE,
    type entrance_point_type NOT NULL DEFAULT 'main',
    name VARCHAR(150),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    is_on_boundary BOOLEAN NOT NULL DEFAULT TRUE, -- Chegara ustida bo'lishi shart
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bog'lash nuqta va/yoki chiziqlari (TTZ 4.2.11 - max 50m)
CREATE TABLE address_connecting_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    address_id UUID REFERENCES addresses(id) ON DELETE CASCADE,
    target_street_name VARCHAR(150),
    length_meters NUMERIC(6, 2) NOT NULL CHECK (length_meters <= 50.0), -- 50m cheklov!
    points JSONB NOT NULL,                   -- Koordinatalar massivi [[lat, lng], ...]
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Yangi manzil shakllantirish arizalari (C-01)
CREATE TYPE application_stage_enum AS ENUM (
    'FILIAL_REVIEW',
    'FILIAL_HEAD_REVIEW',
    'REGION_AGREEMENT',
    'REPUBLIC_APPROVAL',
    'PAYMENT_PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TABLE applications_c01 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_number VARCHAR(50) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,             -- UZKAD, MYGOV, YIDXP, DXM, DIRECT
    applicant_name VARCHAR(255) NOT NULL,
    applicant_pinfl_or_stir VARCHAR(20) NOT NULL,
    applicant_phone VARCHAR(30) NOT NULL,
    cadastre_number VARCHAR(30) NOT NULL,
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    street_type street_type_enum NOT NULL DEFAULT 'kocha',
    street_name VARCHAR(150) NOT NULL,
    house_number VARCHAR(30) NOT NULL,
    assigned_geocode VARCHAR(50),
    is_paid_service BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_number VARCHAR(50),
    invoice_amount_uzs NUMERIC(12, 2) DEFAULT 0,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    stage application_stage_enum NOT NULL DEFAULT 'FILIAL_REVIEW',
    rejection_reason TEXT,
    timeline JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Manzilni o'chirish takliflari (C-02)
CREATE TYPE cancellation_stage_enum AS ENUM (
    'FILIAL_SUBMITTED',
    'FILIAL_HEAD_REVIEW',
    'REGION_AGREEMENT',
    'REPUBLIC_APPROVAL',
    'COMPLETED',
    'REJECTED'
);

CREATE TABLE cancellations_c02 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number VARCHAR(50) NOT NULL UNIQUE,
    address_id UUID REFERENCES addresses(id),
    geocode VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    legal_document_number VARCHAR(100) NOT NULL,
    legal_document_date DATE NOT NULL,
    stage cancellation_stage_enum NOT NULL DEFAULT 'FILIAL_SUBMITTED',
    rejection_reason TEXT,
    timeline JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. UZKAD Avtomatik o'chirish hodisalari (C-03)
CREATE TABLE uzkad_webhook_events_c03 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id VARCHAR(50) NOT NULL UNIQUE,
    cadastre_number VARCHAR(30) NOT NULL,
    object_deletion_type VARCHAR(100) NOT NULL,
    document_basis TEXT NOT NULL,
    notified_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT TRUE,
    processed_at TIMESTAMP WITH TIME ZONE,
    target_address_id UUID,
    action_taken TEXT NOT NULL
);

-- 9. Tizimdagi barcha amallarni qayd etish (Audit Log - 7 toifa)
CREATE TYPE audit_category_enum AS ENUM (
    'AUTH',
    'AUTHORIZATION',
    'USER_ACTION',
    'ADMIN_ACTION',
    'SYSTEM',
    'DATA_OPERATION',
    'SECURITY'
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    category audit_category_enum NOT NULL,
    action VARCHAR(255) NOT NULL,
    user_id UUID,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50),
    ip_address VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_category ON audit_logs(category);
