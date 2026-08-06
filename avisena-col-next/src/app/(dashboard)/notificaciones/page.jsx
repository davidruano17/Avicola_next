'use client'; 

import React, { useState } from 'react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'critical',
    title: 'Alta Mortalidad: Galpón 4',
    description: 'El índice ha superado el umbral del 2%.',
    time: 'Hace 5 min',
    unread: true,
  },
  {
    id: 2,
    type: 'success',
    title: 'Producción: Incremento del 5%',
    description: 'Recolección optimizada en Lote 2026-B.',
    time: 'Hace 12 min',
    unread: false,
  },
  {
    id: 3,
    type: 'warning',
    title: 'Silo A: Nivel Bajo (15%)',
    description: 'Se requiere pedido de reposición inmediato.',
    time: 'Hace 1 hora',
    unread: true,
  },
  {
    id: 4,
    type: 'critical',
    title: 'Temp Crítica: Galpón 2 (32°C)',
    description: 'Extractores activados automáticamente.',
    time: 'Hace 5 horas',
    unread: false,
  },
];

export default function Page() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('Todas');

  // Contadores dinámicos
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => n.unread).length;
  const criticalCount = notifications.filter(n => n.type === 'critical').length;

  // Lógica de filtrado por pestaña activa
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'No leídas') return notif.unread === true;
    if (activeTab === 'Críticas') return notif.type === 'critical';
    return true; 
  });

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(n => ({ ...n, unread: false }))
    );
  };

  const handleViewDetails = (id) => {
    alert(`Abriendo detalles del suceso ID: ${id}`);
    setNotifications(prevNotifications =>
      prevNotifications.map(n => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '32px', fontFamily: 'sans-serif', color: '#4A5568' },
    wrapper: { maxWidth: '1024px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    headerText: { display: 'flex', flexDirection: 'column' },
    title: { fontSize: '28px', fontWeight: 'bold', color: '#1A202C', margin: 0, marginBottom: '4px' },
    subtitle: { fontSize: '14px', color: '#718096', margin: 0 },
    btnGroup: { display: 'flex', gap: '8px', alignItems: 'center' },
    btnSecondary: { backgroundColor: '#E2EED8', color: '#39A900', fontSize: '12px', fontWeight: '600', padding: '10px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    btnReset: { backgroundColor: '#E2EED8', color: '#39A900', padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    tabsContainer: { display: 'flex', gap: '24px', borderBottom: '1px solid #E2E8F0', marginBottom: '24px' },
    tabButton: (isActive) => ({
      paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', borderBottom: isActive ? '2px solid #39A900' : '2px solid transparent', color: isActive ? '#39A900' : '#A0AEC0', fontWeight: isActive ? 'bold' : '500', fontSize: '14px', cursor: 'pointer'
    }),
    badge: (bg, text) => ({ fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: bg, color: text }),
    tableCard: { backgroundColor: '#FFFFFF', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #EDF2F7', overflow: 'hidden' },
    tableHeader: { display: 'grid', gridTemplateColumns: '80px 1fr 180px 120px', gap: '16px', backgroundColor: '#FFFFFF', padding: '16px 24px', borderBottom: '1px solid #EDF2F7', fontSize: '11px', fontWeight: 'bold', color: '#1A202C', letterSpacing: '0.05em' },
    row: (isUnread, sideColor) => ({
      display: 'grid', gridTemplateColumns: '80px 1fr 180px 120px', gap: '16px', alignItems: 'center', padding: '16px 24px', borderLeft: `4px solid ${sideColor}`, backgroundColor: isUnread ? '#F1F5F9' : '#FFFFFF', borderBottom: '1px solid #EDF2F7'
    }),
    iconCircle: (bg, text) => ({ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: bg, color: text }),
    detailsCol: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    notifTitle: (color, isCritical, isUnread) => ({ fontSize: '14px', color: color, fontWeight: isUnread ? '700' : '500', marginBottom: '2px', display: 'block' }),
    notifDesc: { fontSize: '12px', color: '#A0AEC0' },
    timeCol: { fontSize: '13px', color: '#A0AEC0', fontWeight: '500' },
    actionCol: { display: 'flex', justifyContent: 'center' },
    btnPrimary: { backgroundColor: '#39A900', color: '#FFFFFF', fontSize: '13px', fontWeight: '600', padding: '8px 28px', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', fontSize: '12px', color: '#A0AEC0' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        
        {/* ENCABEZADO */}
        <div style={styles.header}>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Centro de Notificaciones</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Sincronizado en tiempo real con Galpones A-1 al B-4.</p>
          </div>
          
          <div style={styles.btnGroup}>
            <button onClick={handleMarkAllAsRead} style={styles.btnSecondary}>
              Marcar todo como leído
            </button>
            <button onClick={() => setNotifications(INITIAL_NOTIFICATIONS)} style={styles.btnReset} title="Restablecer datos">
              <svg style={{width: '16px', height: '16px'}} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>
        </div>

        {/* PESTAÑAS */}
        <div style={styles.tabsContainer}>
          <button onClick={() => setActiveTab('Todas')} style={styles.tabButton(activeTab === 'Todas')}>
            Todas <span style={styles.badge(activeTab === 'Todas' ? '#39A900' : '#E2E8F0', activeTab === 'Todas' ? '#FFFFFF' : '#4A5568')}>{totalCount}</span>
          </button>
          
          <button onClick={() => setActiveTab('No leídas')} style={styles.tabButton(activeTab === 'No leídas')}>
            No leídas <span style={styles.badge(activeTab === 'No leídas' ? '#39A900' : '#E2E8F0', activeTab === 'No leídas' ? '#FFFFFF' : '#4A5568')}>{unreadCount}</span>
          </button>
          
          <button onClick={() => setActiveTab('Críticas')} style={styles.tabButton(activeTab === 'Críticas')}>
            Críticas <span style={styles.badge(activeTab === 'Críticas' ? '#E53E3E' : '#FED7D7', activeTab === 'Críticas' ? '#FFFFFF' : '#E53E3E')}>{criticalCount}</span>
          </button>
        </div>

        {/* CONTENEDOR DE LA LISTA */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div style={{paddingLeft: '8px'}}>TIPO</div>
            <div>DETALLES DEL SUCESO</div>
            <div>FECHA/HORA</div>
            <div style={{textAlign: 'center'}}>ACCIÓN</div>
          </div>

          <div style={{display: 'flex', flexDirection: 'column'}}>
            {filteredNotifications.length === 0 ? (
              <div style={{textAlign: 'center', padding: '48px', color: '#A0AEC0', fontSize: '14px'}}>
                No hay notificaciones en esta categoría.
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                let sideColor = '#39A900';
                let iconBg = '#EBF7ED';
                let iconColor = '#39A900';
                let titleColor = '#1A202C';
                let isCritical = false;
                
                let iconPath = <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;

                if (notif.type === 'critical') {
                  sideColor = '#E53E3E';
                  iconBg = '#FFF5F5';
                  iconColor = '#E53E3E';
                  titleColor = '#E53E3E';
                  isCritical = true;
                  iconPath = <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
                } else if (notif.type === 'warning') {
                  sideColor = '#ECC94B';
                  iconBg = '#FFFDF0';
                  iconColor = '#D69E2E';
                  iconPath = <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />;
                }

                if (!notif.unread && notif.type !== 'critical') {
                  titleColor = '#718096';
                }

                return (
                  <div key={notif.id} style={styles.row(notif.unread, sideColor)}>
                    <div style={{display: 'flex', justifyContent: 'flex-start', paddingLeft: '4px'}}>
                      <div style={styles.iconCircle(iconBg, iconColor)}>
                        <svg style={{width: '20px', height: '20px'}} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          {iconPath}
                        </svg>
                      </div>
                    </div>

                    <div style={styles.detailsCol}>
                      <span style={styles.notifTitle(titleColor, isCritical, notif.unread)}>{notif.title}</span>
                      <span style={styles.notifDesc}>{notif.description}</span>
                    </div>

                    <div style={styles.timeCol}>
                      {notif.time}
                    </div>

                    <div style={styles.actionCol}>
                      <button onClick={() => handleViewDetails(notif.id)} style={styles.btnPrimary}>
                        Ver
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PIE DE PÁGINA */}
        <div style={styles.footer}>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#39A900', display: 'inline-block'}}></span>
            <span>Servidor activo</span>
          </div>
          <div>
            AVISENA COL v2.4.0 © 2026
          </div>
        </div>

      </div>
    </div>
  );
} 