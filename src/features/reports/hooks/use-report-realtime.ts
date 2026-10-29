// src/features/reports/hooks/use-report-realtime.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
// In runtime, createBrowserClient comes from @supabase/ssr or @supabase/supabase-js
// import { createClient } from '@/lib/supabase/client';

export interface ReportJobState {
  id: string;
  estado: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progreso: number;
  archivoUrl?: string | null;
  archivoNombre?: string | null;
  error?: string | null;
}

export function useReportRealtime(userId?: string) {
  const [activeJob, setActiveJob] = useState<ReportJobState | null>(null);
  const [isCompletedToastVisible, setIsCompletedToastVisible] = useState(false);

  // Callback to track a newly dispatched job
  const trackJob = useCallback((jobId: string) => {
    setActiveJob({
      id: jobId,
      estado: 'PENDING',
      progreso: 0,
    });
    setIsCompletedToastVisible(false);
  }, []);

  useEffect(() => {
    if (!userId || !activeJob || activeJob.estado === 'COMPLETED' || activeJob.estado === 'FAILED') {
      return;
    }

    // ============================================================
    // 1. SUPABASE REALTIME (WEBSOCKET CHANNEL)
    // ============================================================
    // const supabase = createClient();
    // const channel = supabase
    //   .channel(`report-job-${activeJob.id}`)
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'UPDATE',
    //       schema: 'public',
    //       table: 'reportes_jobs',
    //       filter: `id=eq.${activeJob.id}`,
    //     },
    //     (payload) => {
    //       const updated = payload.new as ReportJobState;
    //       setActiveJob(updated);
    //       if (updated.estado === 'COMPLETED') {
    //         setIsCompletedToastVisible(true);
    //         // Play subtle notification chime or browser notification
    //         if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    //           new Notification('WhatUSpend', {
    //             body: `Tu reporte ${updated.archivoNombre || ''} está listo para descargar.`,
    //             icon: '/icons/icon-192.png',
    //           });
    //         }
    //       }
    //     }
    //   )
    //   .subscribe();

    // ============================================================
    // 2. FALLBACK POLLING (In case WebSockets are blocked by proxies)
    // ============================================================
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/reports/jobs/${activeJob.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.job) {
          setActiveJob(data.job);
          if (data.job.estado === 'COMPLETED') {
            setIsCompletedToastVisible(true);
            clearInterval(interval);
          } else if (data.job.estado === 'FAILED') {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2500);

    return () => {
      clearInterval(interval);
      // supabase.removeChannel(channel);
    };
  }, [userId, activeJob?.id, activeJob?.estado]);

  return {
    activeJob,
    trackJob,
    isCompletedToastVisible,
    dismissToast: () => setIsCompletedToastVisible(false),
  };
}

