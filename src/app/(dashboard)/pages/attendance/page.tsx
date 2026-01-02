"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { attendanceService } from '@/services/attendance.services';
import type { Session, Participant } from '@/types/attendance';

function StatCard({ icon, iconBg, label, value }: { icon: string; iconBg: string; label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`${iconBg} p-2 rounded-lg`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
    </div>
  );
}

export default function DashboardAsistencia() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, participantsRes] = await Promise.all([
        attendanceService.getSessionsToday(),
        attendanceService.getParticipants()
      ]);
      const sessionsData = sessionsRes.data.data;
      setSessions(sessionsData?.sessions || []);
      setParticipants(participantsRes.data.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const activeParticipants = participants.filter(p => p.status === 'active' || p.status === 'ACTIVO').length;

  if (loading) return <Loading />;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard de Asistencia
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {formatDate(currentDate)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon="event"
          iconBg="bg-blue-100 text-blue-800"
          label="Sesiones Hoy"
          value={sessions.length}
        />
        <StatCard
          icon="group"
          iconBg="bg-green-100 text-green-600"
          label="Participantes Activos"
          value={activeParticipants}
        />
        <StatCard
          icon="check_circle"
          iconBg="bg-emerald-100 text-emerald-600"
          label="Asistencia Promedio"
          value="85%"
        />
        <StatCard
          icon="calendar_month"
          iconBg="bg-purple-100 text-purple-600"
          label="Sesiones Semana"
          value={sessions.length * 5}
        />
      </div>

      {/* Sessions Today */}
      <div className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-800">today</span>
            Sesiones de Hoy
          </h2>
        </div>
        <div className="p-6">
          {sessions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay sesiones programadas para hoy</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    session.attendance_count > 0 
                      ? 'border-green-300 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{session.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{session.program_name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      session.attendance_count > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {session.attendance_count > 0 ? '✓ Completada' : 'Pendiente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {session.start_time} - {session.end_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">group</span>
                      {session.attendance_count}/{session.participant_count}
                    </span>
                  </div>
                  <Link
                    href={`/pages/attendance/registro?session=${session.schedule_id}`}
                    className={`mt-3 block w-full text-center py-2 rounded-lg text-sm font-medium transition-colors ${
                      session.attendance_count > 0
                        ? 'bg-gray-600 text-white hover:bg-gray-700'
                        : 'bg-blue-800 text-white hover:bg-blue-900'
                    }`}
                  >
                    {session.attendance_count > 0 ? 'Editar Asistencia' : 'Registrar Asistencia'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/pages/attendance/registro"
          className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <span className="material-symbols-outlined text-blue-800 text-2xl">how_to_reg</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Registrar Asistencia</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tomar asistencia de una sesión</p>
            </div>
          </div>
        </Link>

        <Link
          href="/pages/attendance/historial"
          className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
              <span className="material-symbols-outlined text-purple-600 text-2xl">history</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Ver Historial</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Consultar registros anteriores</p>
            </div>
          </div>
        </Link>

        <Link
          href="/pages/attendance/programar"
          className="bg-white dark:bg-gray-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:border-blue-300 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <span className="material-symbols-outlined text-green-600 text-2xl">event</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Programar Sesión</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Crear nuevos horarios</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
