-- ====================================================================
-- WhatUSpend: Core DDL, Extensions, Row Level Security (RLS) & Triggers
-- Target Database: PostgreSQL 15+ (Supabase)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO_PERSONAL', 'PRO_BUSINESS');
CREATE TYPE "RoleType" AS ENUM ('OWNER', 'ADMIN', 'COLLABORATOR', 'VIEWER');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'BANK_TRANSFER', 'CRYPTO', 'OTHER');
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'ANNUAL');
CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'ACHIEVED', 'CANCELLED', 'PAUSED');
CREATE TYPE "CategoryType" AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER');
CREATE TYPE "LeakSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "ReportType" AS ENUM ('PERSONAL_EXPENSES', 'COMPANY_EXPENSES', 'ANNUAL_SUMMARY', 'CATEGORY_BREAKDOWN', 'LEAK_AUDIT');
CREATE TYPE "ReportFormat" AS ENUM ('PDF', 'EXCEL');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- 3. TABLES

-- Users (public profile mirrored with auth.users)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "supabaseAuthId" VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    "avatarUrl" TEXT,
    plan "PlanType" NOT NULL DEFAULT 'FREE',
    idioma VARCHAR(5) NOT NULL DEFAULT 'es',
    moneda VARCHAR(3) NOT NULL DEFAULT 'MXN',
    "stripeCustomerId" VARCHAR(255) UNIQUE,
    "stripeSubscriptionId" VARCHAR(255) UNIQUE,
    "stripePriceId" VARCHAR(255),
    "stripeCurrentPeriodEnd" TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories (hierarchical / personal / enterprise / system)
CREATE TABLE public.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "usuarioId" UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    "empresaId" UUID, -- FK declared later
    nombre VARCHAR(80) NOT NULL,
    tipo "CategoryType" NOT NULL DEFAULT 'EXPENSE',
    color VARCHAR(20) NOT NULL DEFAULT '#64748B',
    icono VARCHAR(50) NOT NULL DEFAULT 'tag',
    es_sistema BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions (recurrent payment commitments)
CREATE TABLE public.suscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    proveedor VARCHAR(100) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'MXN',
    frecuencia "RecurrenceFrequency" NOT NULL DEFAULT 'MONTHLY',
    proxima_fecha DATE,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    es_detectada_auto BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personal Expenses
CREATE TABLE public.gastos_personales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "usuarioId" UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    "categoriaId" UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    "suscripcion_id" UUID REFERENCES public.suscripciones(id) ON DELETE SET NULL,
    monto NUMERIC(14, 2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'MXN',
    descripcion VARCHAR(255) NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metodo_pago "PaymentMethod" NOT NULL DEFAULT 'DEBIT_CARD',
    es_recurrente BOOLEAN NOT NULL DEFAULT FALSE,
    comprobante_url TEXT,
    notas TEXT,
    etiquetas TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Companies (B2B Multi-tenant)
CREATE TABLE public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "usuarioId" UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    nombre VARCHAR(120) NOT NULL,
    logo_url TEXT,
    giro VARCHAR(120) NOT NULL,
    rfc_tax_id VARCHAR(50),
    moneda_base VARCHAR(3) NOT NULL DEFAULT 'MXN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key from categorias to empresas
ALTER TABLE public.categorias 
ADD CONSTRAINT fk_categorias_empresa 
FOREIGN KEY ("empresaId") REFERENCES public.empresas(id) ON DELETE CASCADE;

-- Company Members (RBAC)
CREATE TABLE public.miembros_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    rol "RoleType" NOT NULL DEFAULT 'COLLABORATOR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_empresa_usuario UNIQUE (empresa_id, usuario_id)
);

-- Company Expenses
CREATE TABLE public.gastos_empresa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
    registrado_por UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    monto NUMERIC(14, 2) NOT NULL CHECK (monto > 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'MXN',
    descripcion VARCHAR(255) NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metodo_pago "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    factura_folio VARCHAR(100),
    comprobante_url TEXT,
    departamento VARCHAR(80),
    notas TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Goals
CREATE TABLE public.metas_financieras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    monto_objetivo NUMERIC(14, 2) NOT NULL CHECK (monto_objetivo > 0),
    monto_actual NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (monto_actual >= 0),
    moneda VARCHAR(3) NOT NULL DEFAULT 'MXN',
    fecha_meta DATE NOT NULL,
    icono VARCHAR(50) NOT NULL DEFAULT 'target',
    color VARCHAR(20) NOT NULL DEFAULT '#10B981',
    estado "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Money Leak Radar Alerts
CREATE TABLE public.alertas_fugas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    titulo VARCHAR(160) NOT NULL,
    mensaje TEXT NOT NULL,
    severidad "LeakSeverity" NOT NULL DEFAULT 'INFO',
    monto_impacto NUMERIC(12, 2),
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    accion VARCHAR(60) NOT NULL,
    entidad VARCHAR(60) NOT NULL,
    entidad_id VARCHAR(255),
    detalles JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asynchronous Report Jobs (Queue & Realtime WebSocket Status)
CREATE TABLE public.reportes_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
    tipo "ReportType" NOT NULL DEFAULT 'PERSONAL_EXPENSES',
    formato "ReportFormat" NOT NULL DEFAULT 'PDF',
    parametros JSONB DEFAULT '{}'::jsonb,
    estado "ReportStatus" NOT NULL DEFAULT 'PENDING',
    progreso INT NOT NULL DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    archivo_url TEXT,
    archivo_nombre VARCHAR(255),
    tamano_bytes INT,
    expira_en TIMESTAMPTZ,
    error TEXT,
    notificado_email BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX idx_usuarios_auth ON public.usuarios("supabaseAuthId");
CREATE INDEX idx_gastos_personales_user_fecha ON public.gastos_personales("usuarioId", fecha DESC);
CREATE INDEX idx_gastos_personales_cat ON public.gastos_personales("usuarioId", "categoriaId");
CREATE INDEX idx_gastos_empresa_emp_fecha ON public.gastos_empresa(empresa_id, fecha DESC);
CREATE INDEX idx_suscripciones_user_activa ON public.suscripciones(usuario_id, activa);
CREATE INDEX idx_metas_user_estado ON public.metas_financieras(usuario_id, estado);
CREATE INDEX idx_alertas_user_leida ON public.alertas_fugas(usuario_id, leida);
CREATE INDEX idx_audit_user_created ON public.audit_logs(usuario_id, created_at DESC);

-- 5. AUTOMATIC updated_at TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_categorias_updated_at BEFORE UPDATE ON public.categorias FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_gastos_personales_updated_at BEFORE UPDATE ON public.gastos_personales FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_empresas_updated_at BEFORE UPDATE ON public.empresas FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_miembros_empresa_updated_at BEFORE UPDATE ON public.miembros_empresa FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_gastos_empresa_updated_at BEFORE UPDATE ON public.gastos_empresa FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_suscripciones_updated_at BEFORE UPDATE ON public.suscripciones FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_metas_financieras_updated_at BEFORE UPDATE ON public.metas_financieras FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_reportes_jobs_updated_at BEFORE UPDATE ON public.reportes_jobs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. AUTOMATIC AUTH USER SYNC TRIGGER
-- Automatically creates a record in public.usuarios when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (
        "supabaseAuthId",
        email,
        nombre,
        "avatarUrl"
    )
    VALUES (
        NEW.id::text,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT ("supabaseAuthId") DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_personales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos_empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_financieras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_fugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes_jobs ENABLE ROW LEVEL SECURITY;

-- Helper function to get public.usuarios.id from auth.uid()
CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID AS $$
    SELECT id FROM public.usuarios WHERE "supabaseAuthId" = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Policies: Usuarios
CREATE POLICY "Users can view own profile"
    ON public.usuarios FOR SELECT
    USING ("supabaseAuthId" = auth.uid()::text);

CREATE POLICY "Users can update own profile"
    ON public.usuarios FOR UPDATE
    USING ("supabaseAuthId" = auth.uid()::text);

-- Policies: Categorias
CREATE POLICY "Users can view system and own categories"
    ON public.categorias FOR SELECT
    USING (es_sistema = TRUE OR "usuarioId" = public.current_app_user_id() OR "empresaId" IN (
        SELECT empresa_id FROM public.miembros_empresa WHERE usuario_id = public.current_app_user_id()
    ));

CREATE POLICY "Users can insert personal categories"
    ON public.categorias FOR INSERT
    WITH CHECK ("usuarioId" = public.current_app_user_id() AND es_sistema = FALSE);

CREATE POLICY "Users can update own personal categories"
    ON public.categorias FOR UPDATE
    USING ("usuarioId" = public.current_app_user_id() AND es_sistema = FALSE);

CREATE POLICY "Users can delete own personal categories"
    ON public.categorias FOR DELETE
    USING ("usuarioId" = public.current_app_user_id() AND es_sistema = FALSE);

-- Policies: Gastos Personales
CREATE POLICY "Users can CRUD own personal expenses"
    ON public.gastos_personales FOR ALL
    USING ("usuarioId" = public.current_app_user_id())
    WITH CHECK ("usuarioId" = public.current_app_user_id());

-- Policies: Suscripciones
CREATE POLICY "Users can CRUD own subscriptions"
    ON public.suscripciones FOR ALL
    USING (usuario_id = public.current_app_user_id())
    WITH CHECK (usuario_id = public.current_app_user_id());

-- Policies: Metas Financieras
CREATE POLICY "Users can CRUD own goals"
    ON public.metas_financieras FOR ALL
    USING (usuario_id = public.current_app_user_id())
    WITH CHECK (usuario_id = public.current_app_user_id());

-- Policies: Alertas Fugas
CREATE POLICY "Users can view and update own leak alerts"
    ON public.alertas_fugas FOR ALL
    USING (usuario_id = public.current_app_user_id())
    WITH CHECK (usuario_id = public.current_app_user_id());

-- Policies: Empresas (B2B Multi-tenant)
CREATE POLICY "Members can view company"
    ON public.empresas FOR SELECT
    USING (
        "usuarioId" = public.current_app_user_id() OR 
        id IN (SELECT empresa_id FROM public.miembros_empresa WHERE usuario_id = public.current_app_user_id())
    );

CREATE POLICY "Owners can update company"
    ON public.empresas FOR UPDATE
    USING ("usuarioId" = public.current_app_user_id());

-- Policies: Gastos Empresa
CREATE POLICY "Company members can view company expenses"
    ON public.gastos_empresa FOR SELECT
    USING (
        empresa_id IN (SELECT empresa_id FROM public.miembros_empresa WHERE usuario_id = public.current_app_user_id())
    );

CREATE POLICY "Company admins and collaborators can insert expenses"
    ON public.gastos_empresa FOR INSERT
    WITH CHECK (
        empresa_id IN (
            SELECT empresa_id FROM public.miembros_empresa 
            WHERE usuario_id = public.current_app_user_id() AND rol IN ('OWNER', 'ADMIN', 'COLLABORATOR')
        )
    );

CREATE POLICY "Company admins or owners can update/delete expenses"
    ON public.gastos_empresa FOR UPDATE
    USING (
        empresa_id IN (
            SELECT empresa_id FROM public.miembros_empresa 
            WHERE usuario_id = public.current_app_user_id() AND rol IN ('OWNER', 'ADMIN')
        )
    );

-- Policies: Report Jobs (Async Background Generation)
CREATE POLICY "Users can CRUD own report jobs"
    ON public.reportes_jobs FOR ALL
    USING (usuario_id = public.current_app_user_id())
    WITH CHECK (usuario_id = public.current_app_user_id());

-- 8. SUPABASE REALTIME (WEBSOCKETS) CONFIGURATION
-- Expose public.reportes_jobs to Supabase Realtime channel so connected clients
-- receive instantaneous WebSocket notifications when their report reaches COMPLETED status.
ALTER PUBLICATION supabase_realtime ADD TABLE public.reportes_jobs;


