import type { Metadata } from 'next';
import '@/styles/design-tokens.css';

export const metadata: Metadata = {
  title: 'WhatUSpend — Gestión Inteligente de Gastos Personales y Empresariales',
  description:
    'Controla tus gastos, detecta fugas de dinero invisibles, cancela suscripciones olvidadas y alcanza tus metas financieras con WhatUSpend.',
  keywords: [
    'control de gastos',
    'finanzas personales',
    'gestión de gastos pyme',
    'radar de fugas de dinero',
    'detector de suscripciones',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}

