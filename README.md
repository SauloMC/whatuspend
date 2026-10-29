# WhatUSpend — Modern Personal & Business Expense Management Platform

WhatUSpend es una plataforma SaaS de gestión financiera integral diseñada para personas y empresas, construida bajo los más altos estándares de arquitectura limpia (**Clean Architecture**), diseño modular y escalabilidad.

---

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 15 (App Router, Server Actions), React 19, TypeScript, TailwindCSS, Shadcn/UI, React Hook Form, Zod, TanStack Query.
- **Backend & Persistencia:** Next.js Server Actions & Route Handlers, PostgreSQL 15+, Supabase (Auth, Row Level Security, Storage, Realtime WebSockets), Prisma ORM.
- **Procesamiento Asíncrono de Reportes:** Cola de trabajos en segundo plano (`reportes_jobs`), notificaciones en tiempo real vía WebSockets (**Supabase Realtime**), alertas transaccionales por Email (Resend) con enlaces firmados temporales (24h), exportación en PDF (pdfmake) y Excel (ExcelJS).
- **Pagos & Monetización:** Stripe Billing (Checkout, Webhooks, Customer Portal), Google AdSense (2 banners no intrusivos exclusivos para el plan FREE).
- **Seguridad:** Row Level Security (RLS) nativo en PostgreSQL, Rate Limiting con Upstash Redis, validaciones con Zod, sanitización XSS/CSRF, logs de auditoría inmutables en `audit_logs`.
- **Ecosistema Móvil Futuro:** Diseñado con un paquete universal [`packages/shared`](packages/shared/src/index.ts) para reutilizar hasta el 80% de lógica, esquemas y tipos en **Expo / React Native**.

---

## ⚡ Funciones Diferenciadoras

1. **Radar de Fugas de Dinero:**
   - Detecta incrementos anómalos de consumo por categoría ($>25\%$ y $>\$400\text{ MXN}$) frente al promedio de los últimos 60 días.
   - Detecta acumulación de gastos hormiga ($\le \$120\text{ MXN}$) y emite sugerencias concretas de ahorro.
2. **Detección Automática de Pagos Recurrentes:**
   - Agrupa cargos periódicos (Netflix, Spotify, gimnasio, telefonía) en ventanas de 26 a 34 días y sugiere agregarlos al panel de suscripciones activas.
3. **Metas Financieras Inteligentes:**
   - Calcula ahorro semanal y mensual requerido en base a la fecha objetivo.
   - Simula escenarios de aceleración: *"Si reduces un 20% en restaurantes, alcanzarás tu meta 2 meses antes"*.
4. **Exportación Asíncrona de Reportes (HTTP 200/202 Inmediato):**
   - El usuario solicita un reporte y recibe respuesta 200 de inmediato con el identificador del trabajo.
   - La interfaz muestra una píldora flotante con el progreso en tiempo real recibido por WebSocket.
   - Al finalizar, el cliente recibe un toast interactivo de descarga y un correo electrónico de respaldo con un enlace firmado temporal.

---

## 🛠️ Instalación y Puesta en Marcha

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Generar cliente de Prisma
pnpm prisma:generate

# 4. Ejecutar migraciones de base de datos
pnpm prisma:migrate

# 5. Poblar datos semilla de prueba
pnpm prisma:seed

# 6. Iniciar servidor de desarrollo
pnpm dev
```

---

## 📂 Arquitectura de Directorios

```
whatuspend/
├── prisma/
│   ├── schema.prisma                  # Esquema Prisma con modelos y enums
│   └── seed.ts                        # Script de semillas (usuarios, categorías, gastos)
├── supabase/
│   └── migrations/                    # DDL SQL, RLS Policies, Triggers y Realtime
├── packages/
│   └── shared/                        # Código compartido con Expo móvil
│       ├── src/types.ts
│       └── src/validations.ts
├── src/
│   ├── app/                           # Next.js App Router & Server Actions
│   │   ├── actions/                   # Server Actions (expenses, reports)
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Landing page & demo interactiva
│   ├── domain/                        # Entidades y servicios de dominio
│   │   └── services/                  # Radar de Fugas, Recurrentes, Metas, Reportes
│   ├── features/                      # Módulos basados en funcionalidades
│   │   └── reports/hooks/             # Hook useReportRealtime con WebSockets
│   ├── components/                    # Componentes UI y modales
│   │   └── reports/                   # Modal de reportes con progreso en tiempo real
│   ├── lib/                           # Validaciones Zod, utils y helpers
│   └── styles/                        # Tokens de diseño (Modo claro y oscuro)
└── package.json
```

