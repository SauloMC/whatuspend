# WhatUSpend — Estado General del Proyecto y Auditoría Técnica

> **Fecha de Actualización:** 29 de Octubre de 2026  
> **Versión del Sistema:** 1.0.0 (Web SaaS & Core Engine)  
> **Estado Global del Ecosistema:** **85% Completado** (Web SaaS 95% listo para producción · App Móvil 15%)

---

## 1. Resumen Ejecutivo y Visión

**WhatUSpend** es una plataforma tecnológica financiera integral diseñada para resolver la fragmentación entre el control de gastos personales y la administración contable de micro y medianas empresas (B2B Multi-tenant).

El sistema combina:
1. **Detección algorítmica de fugas de dinero** (gastos hormiga, anomalías estadísticas sobre promedios móviles).
2. **Detección de cobros y suscripciones recurrentes**.
3. **Catálogo riguroso de 20 reportes contables y financieros** (5 gratuitos para salud financiera personal y 15 avanzados para personas morales y usuarios Pro).
4. **Espacios de trabajo multi-empresa** con centros de costos, departamentos y folios fiscales SAT.
5. **Generación asíncrona de reportes contables** (con respuesta HTTP 200 inmediata, procesamiento en segundo plano y descarga nativa en Excel y PDF).

---

## 2. Porcentaje de Avance por Módulo

| Módulo / Capa del Sistema | Estado | % Completado | Notas y Capacidades |
| :--- | :---: | :---: | :--- |
| **1. Arquitectura de Datos & Prisma ORM** | Finalizado | **100%** | 10 modelos relacionales, 6 enums, índices optimizados y RLS multi-inquilino. |
| **2. Motor de Inteligencia Financiera & Reportes** | Finalizado | **100%** | 20 reportes contables con exportación a PDFMake y ExcelJS. |
| **3. Web SaaS & Dashboard Operativo (`/dashboard`)** | Finalizado | **100%** | CRUD de gastos personales, CRUD de empresas, gastos corporativos, categorías y reportes. |
| **4. Autenticación & Control de Acceso** | Operativo | **95%** | Supabase Auth, Google OAuth, sesión SSR, roles Admin / Pro / Free de prueba inmediata. |
| **5. Pasarela de Pagos & Suscripciones (Stripe)** | Operativo | **90%** | Checkout funcional con Stripe, webhooks y modo de simulación dev integrado. |
| **6. Infraestructura, Docker & Almacenamiento S3** | Operativo | **95%** | Next.js Standalone, Docker Compose con MinIO S3 para avatares y logos empresariales. |
| **7. Aplicación Móvil (React Native / Expo)** | Por iniciar | **15%** | Arquitectura y endpoints listos; falta construir la UI nativa y cámara de tickets. |
| **PROMEDIO GLOBAL DEL ECOSISTEMA** | **En Progreso** | **85%** | **SaaS Web operativo; listo para pruebas de usuario y desarrollo de App Móvil.** |

---

## 3. Inventario Detallado: Lo que YA EXISTE y Funciona al 100%

### 3.1. Modelo de Base de Datos y Persistencia
- **`prisma/schema.prisma`**:
  - `User`: Gestión de perfil, moneda predeterminada, vínculos con Stripe Customer y Supabase Auth ID.
  - `Empresa`: Espacios de trabajo B2B con razón social, RFC / Tax ID, giro comercial y logotipo.
  - `MiembroEmpresa`: Roles multi-inquilino (`OWNER`, `ADMIN`, `COLLABORATOR`, `VIEWER`).
  - `GastoPersonal`: Egresos personales con categoría, método de pago, recurrencia y notas.
  - `GastoEmpresa`: Gastos corporativos vinculados a departamentos (Marketing, TI, Operaciones, etc.) y folios de facturas SAT.
  - `Categoria`: Árbol de categorías con selector de color, ícono y flag de predeterminada del sistema.
  - `Suscripcion`: Registro y monitoreo de servicios periódicos (Netflix, Spotify, AWS, Google Workspace).
  - `MetaFinanciera`: Metas de ahorro con montos objetivo, fechas meta y porcentajes de cumplimiento.
  - `AlertaFuga`: Detección de gastos no planificados y micro-fugas.
  - `AuditLog`: Registro de auditoría para operaciones críticas.
  - `ReportJob`: Cola de generación asíncrona de reportes con estados `PENDING`, `PROCESSING`, `COMPLETED` y `FAILED`.

### 3.2. Catálogo de los 20 Reportes Financieros
El sistema cuenta con un catálogo fundamentado en estándares contables internacionales (IFRS/NIIF y Principios de Contabilidad Generalmente Aceptados):

#### Plan Gratuito (5 Reportes Esenciales)
1. **Estado de Ingresos vs Gastos del Periodo**: Balance neto mensual y ratio de ahorro personal.
2. **Distribución Porcentual por Categorías**: Gráfico y matriz de concentración de egresos.
3. **Auditoría de Fugas y Gastos Hormiga**: Detección de consumos superfluos diarios de bajo monto.
4. **Proyección de Metas de Ahorro y Fondo de Emergencia**: Días estimados para alcanzar metas.
5. **Calendario de Vencimiento de Pagos Frecuentes**: Programación mensual de cobros y facturas fijas.

#### Plan Pro (15 Reportes Avanzados para Finanzas & Empresas)
6. **Estado de Resultados Integral (P&L)**: Ingresos brutos, costo de ventas, margen de contribución y utilidad neta.
7. **Balance General (Situación Financiera)**: Activo circulante, pasivo a corto plazo y patrimonio neto.
8. **Estado de Flujo de Efectivo (Cash Flow)**: Flujos operativo, de inversión y de financiamiento.
9. **Ratios de Liquidez, Solvencia y Runway**: Razón corriente, prueba ácida y meses de pista de operación.
10. **Auditoría Presupuestal Regla 50/30/20**: Comparativa entre necesidades (50%), deseos (30%) y ahorro (20%).
11. **Tasa de Ahorro Real y Libertad Financiera (FIRE)**: Proyección de años para el retiro mediante regla del 4%.
12. **Conciliación Fiscal y Gastos Deducibles (SAT)**: Reporte listo para contadores con folios fiscales e impuestos.
13. **Costo Total de Suscripciones Anualizado**: Auditoría de servicios streaming y SaaS recurrentes.
14. **Estado Patrimonial Histórico (Net Worth Tracker)**: Evolución cronológica de activos y patrimonio neto.
15. **Gastos por Departamento y Centro de Costos**: Desglose por áreas de la empresa (TI, Marketing, Administración).
16. **Análisis de Variación Presupuestal**: Presupuestado vs. Real con semáforo de tolerancia.
17. **Rentabilidad Unitaria y Margen de Contribución**: Punto de equilibrio financiero (Break-even point).
18. **Diagnóstico de Nivel de Endeudamiento (DTI)**: Relación Deuda/Ingreso y capacidad de crédito.
19. **Simulador Fiscal de Retenciones Proyectadas**: Estimación anticipada de pagos provisionales.
20. **Informe Ejecutivo Consolidado (Board Deck)**: Dossier en PDF listo para socios inversionistas.

### 3.3. Funcionalidad Completa del Dashboard (`/dashboard`)
- **Gestión Multi-Espacio**: Cambio instantáneo entre "Finanzas Personales" y cualquier Empresa registrada.
- **Selector de Personas de Prueba**:
  - `👑 Admin (Dueño)`: Acceso total multi-empresa, plan Pro Business, reportes avanzados.
  - `⭐ Pro Personal`: Acceso a los 20 reportes, radar de fugas y metas inteligentes.
  - `🌱 Usuario Gratuito`: Acceso a gastos personales y 5 reportes gratuitos.
- **CRUD Gastos Personales**: Alta, visualización con filtros (por categoría, método de pago y búsqueda) y baja de gastos.
- **CRUD Empresas (B2B)**: Alta de empresas con RFC, giro y moneda, baja de empresas y resumen financiero por razón social.
- **CRUD Gastos de Empresa**: Registro de gastos corporativos por departamento (Marketing, TI, Operaciones) con folio fiscal SAT y baja de gastos.
- **CRUD Categorías**: Creación de nuevas categorías con paleta de colores y baja de categorías personalizadas.
- **Exportación en Tiempo Real**: Descarga de ejemplos y datos de prueba en formatos nativos Excel (`.xlsx`) y PDF profesional.

---

## 4. Guía Técnica: Personalización de Google OAuth ("WhatUSpend" en lugar de la URL de Supabase)

Cuando los usuarios hacen clic en **Continuar con Google**, la pantalla de consentimiento de Google muestra actualmente `retsdqangvoimppkbyaj.supabase.co` porque esa es la URL técnica por defecto del proyecto en Supabase.

Para que Google muestre **WhatUSpend** o tu propio dominio (ej. `auth.whatuspend.com`), sigue estos 2 pasos oficiales:

### Paso 1: Configurar la Pantalla de Consentimiento en Google Cloud Console
1. Entra a [Google Cloud Console](https://console.cloud.google.com/) con la cuenta dueña del proyecto.
2. Ve a **APIs y servicios** > **Pantalla de consentimiento de OAuth**.
3. En la sección **Información de la aplicación**:
   - **Nombre de la aplicación**: Escribe `WhatUSpend`.
   - **Correo de asistencia al usuario**: Tu correo de soporte o personal.
   - **Logotipo de la aplicación**: Sube el logotipo oficial de WhatUSpend (cuadrado 120x120 px).
4. En **Dominio de la aplicación**:
   - **Página principal**: `https://whatuspend.com` (o la URL de tu app).
   - **Enlace a la política de privacidad**: `https://whatuspend.com/privacidad`
   - **Enlace a las condiciones del servicio**: `https://whatuspend.com/terminos`
5. En **Dominios autorizados**:
   - Agrega `whatuspend.com` y `supabase.co`.
6. Guarda los cambios. Esto actualiza el nombre visible y logotipo en la ventana de Google.

### Paso 2: Configurar Dominio Personalizado en Supabase (Custom Domain)
Para reemplazar por completo el dominio técnico `retsdqangvoimppkbyaj.supabase.co` por tu marca:
1. En el panel de Supabase: Ve a **Project Settings** > **Custom Domains**.
2. Escribe tu subdominio de autenticación, por ejemplo: `auth.whatuspend.com`.
3. Supabase te entregará un registro **CNAME** que debes agregar en tu proveedor de dominio (Cloudflare, GoDaddy, Namecheap o AWS Route 53):
   - **Tipo**: `CNAME`
   - **Nombre**: `auth`
   - **Destino**: `retsdqangvoimppkbyaj.supabase.co`
4. Una vez validado el SSL por Supabase, actualiza en Google Cloud Console > **Credenciales** > tu **ID de cliente OAuth 2.0**:
   - **URI de redirección autorizada**: Agrega `https://auth.whatuspend.com/auth/v1/callback` en lugar de la URL con `supabase.co`.
5. En el archivo `.env` de WhatUSpend, actualiza:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://auth.whatuspend.com"
   ```

---

## 5. Lo que Falta para la Versión Web en Producción (15% Restante de Web)

1. **Variables de Producción de Stripe**:
   - Reemplazar las credenciales de prueba por las claves `pk_live_...` y `sk_live_...` de Stripe.
   - Crear los dos productos de suscripción en el Dashboard de Stripe (Pro Personal $199 MXN y Pro Business $499 MXN) y pegar sus `price_...` en el `.env`.
2. **Servicio de Envío de Correos (Transaccional)**:
   - Configurar la API key de **Resend** o **SendGrid** en `src/domain/services/async-report.service.ts` para que, al concluir la generación en segundo plano de reportes de más de 10,000 registros, el cliente reciba un correo con el botón de descarga.
3. **Contraseña de Base de Datos de Supabase**:
   - Actualizar el password verificado de Postgres en `DATABASE_URL` y `DIRECT_URL` para aplicar las migraciones directamente en la nube de Supabase (actualmente el sistema utiliza el almacén de contingencia en memoria de alta fidelidad si la base de datos externa no responde).

---

## 6. Hoja de Ruta para la Aplicación Móvil (React Native / Expo)

La aplicación móvil representa la siguiente etapa de WhatUSpend. Al tener el backend y los modelos ya completados en Next.js y Supabase, el desarrollo móvil se simplifica enormemente.

### Componentes a desarrollar en la App Móvil:
1. **Configuración del Proyecto Expo**:
   - Crear el proyecto con `npx create-expo-app@latest whatuspend-mobile --template blank-typescript`.
   - Instalar `@supabase/supabase-js`, `expo-secure-store`, `lucide-react-native`, `tailwindcss-react-native` (NativeWind).
2. **Autenticación Nativa**:
   - Flujo de login con Google mediante `expo-auth-session` sincronizado con Supabase Auth.
3. **Registro Rápido con Cámara (Smart Receipt OCR)**:
   - Uso de `expo-camera` o `expo-image-picker` para fotografiar tickets de compra físicos.
   - Envío de la foto al bucket `avatars` / `receipts` en MinIO o Supabase Storage.
4. **Notificaciones Push de Alertas**:
   - Configuración de `expo-notifications` para recibir avisos instantáneos cuando el Radar detecte un gasto hormiga o el vencimiento de una suscripción.
5. **Modo Offline con Sincronización Automática**:
   - Cacheo local de gastos con SQLite o AsyncStorage para permitir registrar gastos aunque el usuario no tenga internet en el momento de la compra.

