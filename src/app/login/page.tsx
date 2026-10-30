// src/app/login/page.tsx
import React from 'react';
import Link from 'next/link';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-mono font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              W$
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              What<span className="text-emerald-400">U</span>Spend
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Iniciar Sesión</h2>
          <p className="mt-1 text-xs text-slate-400">
            Accede a tu panel financiero personal y corporativo
          </p>
        </div>

        <div className="pt-2">
          <GoogleSignInButton label="Continuar con Google" redirectTo="/dashboard" />
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500">Acceso Inmediato de Prueba</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Entrar al Dashboard sin credenciales</span>
        </Link>

        <div className="pt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a la página principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

