/**
 * Renderizador de Vistas y Componentes Dinámicos (v5.4 - Con Lector de Cámara QR Real para Celulares)
 */
const Components = {
  // Helper para obtener el usuario actualmente autenticado
  getCurrentUser(state) {
    if (state && state.currentUser && state.currentUser.name) {
      return state.currentUser;
    }
    const loggedUser = (window.appStore && typeof window.appStore.getCurrentUser === 'function')
      ? window.appStore.getCurrentUser()
      : ((window.app && window.app.store && typeof window.app.store.getCurrentUser === 'function')
        ? window.app.store.getCurrentUser()
        : null);
    if (loggedUser && loggedUser.name) {
      return loggedUser;
    }
    const role = (state && state.currentRole) || "admin";
    return (state && state.users && state.users[role]) || (initialData && initialData.users && initialData.users[role]) || { name: "Usuario", role: role };
  },

  // Helper para normalizar el ID de grado a partir del texto del grado
  getGradeIdFromLabel(label) {
    if (!label) return "5prim";
    const l = label.toLowerCase();
    if (l.includes("ini 3") || l.includes("3 año") || l.includes("3 ano") || l.includes("ini3")) return "ini3";
    if (l.includes("ini 4") || l.includes("4 año") || l.includes("4 ano") || l.includes("ini4")) return "ini4";
    if (l.includes("ini 5") || l.includes("5 año") || l.includes("5 ano") || l.includes("ini5")) return "ini5";
    if (l.includes("1") && (l.includes("pri") || l.includes("prim"))) return "1prim";
    if (l.includes("2") && (l.includes("pri") || l.includes("prim"))) return "2prim";
    if (l.includes("3") && (l.includes("pri") || l.includes("prim"))) return "3prim";
    if (l.includes("4") && (l.includes("pri") || l.includes("prim"))) return "4prim";
    if (l.includes("5") && (l.includes("pri") || l.includes("prim"))) return "5prim";
    if (l.includes("6") && (l.includes("pri") || l.includes("prim"))) return "6prim";
    if (l.includes("1") && (l.includes("sec") || l.includes("secund"))) return "1sec";
    if (l.includes("2") && (l.includes("sec") || l.includes("secund"))) return "2sec";
    if (l.includes("3") && (l.includes("sec") || l.includes("secund"))) return "3sec";
    if (l.includes("4") && (l.includes("sec") || l.includes("secund"))) return "4sec";
    if (l.includes("5") && (l.includes("sec") || l.includes("secund"))) return "5sec";
    return "5prim";
  },

  // Helper para generar Código QR 100% Escaneable por Cámaras y Lectores
  generateQRSVG(code, size = 200) {
    const cleanCode = (code || "EST-2026-055").trim();
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(cleanCode)}&margin=1&format=svg`;
    const fallbackPng = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(cleanCode)}&margin=1`;
    return `
      <img src="${qrUrl}" alt="Código QR ${cleanCode}" style="width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated; display: block;" onerror="this.onerror=null; this.src='${fallbackPng}'" />
    `;
  },

  // =========================================================================
  // NAVEGACIÓN DINÁMICA CON ESPACIOS SELECTOS POR PERFIL DE USUARIO
  // =========================================================================
  renderSidebarNav(role, currentView, state) {
    const iconMap = {
      dashboard: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
      database: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
      users: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      "usuarios-matriculas": `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      qr: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      "cuadernos-qr": `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
      grades: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      calificaciones: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
      schedule: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      horarios: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      syllabus: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      silabus: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
      virtual: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
      tareas: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
      attendance: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      asistencia: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
      announcements: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
      comunicados: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
      payments: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
      pagos: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
      agenda: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M14 6l2 2 4-4"></path></svg>`,
      "agenda-virtual": `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path><path d="M14 6l2 2 4-4"></path></svg>`,
      "registro-estudiantes": `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
      boleta: `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`
    };

    // Si existe configuración de pestañas personalizada para este rol, renderizarla dinámicamente
    const roleTabsConfig = (state.navigationTabsConfig && state.navigationTabsConfig[role]) || null;

    if (roleTabsConfig && role !== "admin") {
      const sectionTitle = role === "padre" 
        ? "Portal de Familias" 
        : role === "estudiante" 
          ? "Portal del Estudiante" 
          : role === "docente" 
            ? "Panel Docente" 
            : role === "auxiliar" 
              ? "Turno de Auxiliar & Portería" 
              : "Dirección General";
      
      return `
        <div class="nav-section-title">${sectionTitle}</div>
        ${roleTabsConfig.filter(t => {
          if (t.enabled === false) return false;
          if ((role === 'estudiante' || role === 'padre' || role === 'auxiliar') && (t.id === 'calificaciones' || t.id === 'boleta' || t.id === 'grades')) {
            return false;
          }
          return true;
        }).map(t => {
          const iconSvg = iconMap[t.id] || iconMap[t.icon] || iconMap.dashboard;
          const isActive = currentView === t.id;
          const isQR = t.id === 'cuadernos-qr';
          const isBoleta = t.id === 'boleta';
          const isExcel = t.id === 'registro-estudiantes';
          const customStyle = isQR ? 'background: rgba(245,158,11,0.12); border: 1px dashed rgba(245,158,11,0.4); color: #fde047; font-weight: bold;' : isExcel ? 'background: rgba(16,185,129,0.12); border: 1px dashed rgba(16,185,129,0.4); color: #6ee7b7; font-weight: bold;' : isBoleta ? 'background: rgba(245,158,11,0.08); border: 1px dashed rgba(245,158,11,0.3);' : '';
          
          return `
            <a class="nav-item ${isActive ? 'active' : ''}" data-view="${t.id}" id="nav-${t.id}" onclick="window.app.navigate('${t.id}')" style="${customStyle}; cursor: pointer;">
              ${iconSvg}
              <span>${t.label}</span>
              ${t.badge ? `<span class="nav-badge ${isQR ? 'badge-yellow' : isExcel ? 'badge-yellow' : isBoleta ? 'badge-yellow' : 'badge-red'}">${t.badge}</span>` : ''}
            </a>
          `;
        }).join('')}
      `;
    }

    // Default: Coordinación General & Documentación (Prof. Alex Lino / Admin)
    return `
      <div class="nav-section-title">Coordinación & Dirección</div>
      
      <a class="nav-item ${currentView === 'dashboard' ? 'active' : ''}" data-view="dashboard" id="nav-dashboard">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>Inicio / Resumen</span>
      </a>

      <a class="nav-item ${currentView === 'usuarios-matriculas' ? 'active' : ''}" data-view="usuarios-matriculas" id="nav-usuarios-matriculas" style="background: rgba(220,38,38,0.12); border: 1px dashed rgba(220,38,38,0.3); color: #fca5a5;">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>Cuentas, Perfiles & Pestañas</span>
        <span class="nav-badge badge-red">ADMIN</span>
      </a>

      <div class="nav-section-title">Gestión Académica</div>

      <a class="nav-item ${currentView === 'registro-estudiantes' ? 'active' : ''}" data-view="registro-estudiantes" id="nav-registro-estudiantes" onclick="window.app.navigate('registro-estudiantes')" style="background: rgba(16,185,129,0.12); border: 1px dashed rgba(16,185,129,0.4); color: #6ee7b7; font-weight: bold; cursor: pointer;">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        <span>Registro de Estudiantes</span>
        <span class="nav-badge badge-yellow" style="background:#10b981; color:#0b132b; font-weight:900;">EXCEL</span>
      </a>

      <a class="nav-item ${currentView === 'cuadernos-qr' ? 'active' : ''}" data-view="cuadernos-qr" id="nav-cuadernos-qr" style="background: rgba(245,158,11,0.12); border: 1px solid rgba(245,158,11,0.4); color: #fde047; font-weight: bold;">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Lector de Cuadernos QR</span>
        <span class="nav-badge badge-yellow" style="background:#f59e0b; color:#0b132b;">CÁMARA VIVA</span>
      </a>

      <a class="nav-item ${currentView === 'calificaciones' ? 'active' : ''}" data-view="calificaciones" id="nav-calificaciones">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span>Registro de Notas</span>
        <span class="nav-badge badge-yellow">Bimestral</span>
      </a>

      <a class="nav-item ${currentView === 'horarios' ? 'active' : ''}" data-view="horarios" id="nav-horarios">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>Horario de Clases</span>
      </a>

      <a class="nav-item ${currentView === 'silabus' ? 'active' : ''}" data-view="silabus" id="nav-silabus">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Sílabus Curriculares</span>
      </a>

      <a class="nav-item ${currentView === 'tareas' ? 'active' : ''}" data-view="tareas" id="nav-tareas">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
        <span>Aula Virtual / Tareas</span>
        <span class="nav-badge badge-red" id="badge-pending-tasks">1</span>
      </a>

      <a class="nav-item ${currentView === 'asistencia' ? 'active' : ''}" data-view="asistencia" id="nav-asistencia" onclick="window.app.navigate('asistencia')" style="background: rgba(34,197,94,0.12); border: 1px dashed rgba(34,197,94,0.4); color: #86efac; font-weight: bold; cursor: pointer;">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>Registro de Ingreso & QR</span>
        <span class="nav-badge badge-yellow" style="background: #22c55e; color: #0b132b; font-weight: 800;">QR Puerta</span>
      </a>

      <div class="nav-section-title">Institucional & Economía</div>

      <a class="nav-item ${currentView === 'comunicados' ? 'active' : ''}" data-view="comunicados" id="nav-comunicados">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span>Informes & Circulares</span>
        <span class="nav-badge badge-yellow">N°003</span>
      </a>

      <a class="nav-item ${currentView === 'pagos' ? 'active' : ''}" data-view="pagos" id="nav-pagos">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        <span>Pensiones & Recaudación</span>
      </a>

      <a class="nav-item ${currentView === 'boleta' ? 'active' : ''}" data-view="boleta" id="nav-boleta">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>Boleta Oficial PDF</span>
      </a>
    `;
  },

  // Encabezado Oficial Institucional con Membrete y Cinta Dorada
  renderOfficialInstitutionalHeader(docTitle = "INFORME OFICIAL DE PROGRESO", docSubtitle = "AÑO LECTIVO 2026") {
    return `
      <div class="official-letterhead-banner">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0b132b; padding-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador S.J.L." style="width: 75px; height: 75px; object-fit: contain;" />
            <div>
              <div style="font-size: 11px; font-weight: 800; color: #0b132b; letter-spacing: 0.1em; text-transform: uppercase;">INSTITUCIÓN EDUCATIVA PRIVADA</div>
              <div style="font-size: 26px; font-weight: 900; color: #0b132b; font-family: 'Plus Jakarta Sans', serif; line-height: 1.1;">“EL EDUCADOR”</div>
              <div style="font-size: 12px; font-weight: 700; color: #dc2626; letter-spacing: 0.15em;">INICIAL – PRIMARIA – SECUNDARIA • UGEL 05</div>
            </div>
          </div>
          <div class="official-gold-slogan-ribbon">
            21 años dejando huellas
          </div>
        </div>
        <div style="text-align: center; margin-top: 10px;">
          <div style="font-size: 15px; font-weight: 900; text-decoration: underline; color: #0b132b; text-transform: uppercase;">${docTitle}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${docSubtitle}</div>
        </div>
      </div>
    `;
  },

  // 0. Pantalla de Login
  renderLogin(errorMessage = null) {
    return `
      <div class="login-screen-wrapper">
        <div class="login-card-container">
          <div class="login-card-header">
            <img src="logo.png" alt="Colegio El Educador S.J.L." class="login-school-logo" style="object-fit: contain;" onerror="this.src='assets/logo.png'">
            <h2 class="login-title">I.E.P. "EL EDUCADOR"</h2>
            <div style="background: linear-gradient(90deg, #f59e0b, #fbbf24); color: #0b132b; font-size: 11px; font-weight: 800; padding: 3px 12px; border-radius: 20px; display: inline-block; margin: 4px 0 8px;">
              21 años dejando huellas • S.J.L. • UGEL 05
            </div>
            <p class="login-subtitle">Intranet Institucional • Aula Virtual & Evaluaciones Dinámicas</p>
          </div>

          <div class="login-body">
            ${errorMessage ? `
              <div class="login-alert-error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>${errorMessage}</span>
              </div>
            ` : ''}

            <form id="login-form" onsubmit="window.app.handleLogin(event)">
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" for="login-username" style="font-weight: 800; font-size: 12.5px; color: var(--color-navy-900);">
                  Usuario o Correo Institucional:
                </label>
                <input type="text" id="login-username" class="form-control" placeholder="Ej. admin, roberto.silva, auxiliar, sofia.mendez" required autofocus style="border-radius: 22px; padding: 13px 20px; font-size: 14px; border: 1.5px solid #cbd5e1; background: #f8fafc; box-shadow: inset 0 1px 3px rgba(0,0,0,0.03);" />
              </div>

              <div class="form-group" style="margin-bottom: 18px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
                  <label class="form-label" for="login-password" style="font-weight: 800; font-size: 12.5px; color: var(--color-navy-900); margin: 0;">
                    Contraseña:
                  </label>
                  <a href="#" onclick="window.app.openForgotPasswordModal()" style="font-size: 11.5px; color: var(--color-red-600); font-weight: bold; text-decoration: none;">¿Olvidaste tu clave?</a>
                </div>
                <div class="password-input-group">
                  <input type="password" id="login-password" class="form-control" placeholder="••••••••" required style="border-radius: 22px; padding: 13px 44px 13px 20px; font-size: 14px; border: 1.5px solid #cbd5e1; background: #f8fafc; box-shadow: inset 0 1px 3px rgba(0,0,0,0.03);" />
                  <button type="button" class="toggle-password-btn" onclick="window.app.togglePasswordVisibility()" aria-label="Mostrar contraseña" style="right: 14px;">
                    <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                  </button>
                </div>
              </div>

              <button type="submit" class="btn btn-navy" style="width: 100%; padding: 13px; font-size: 14px; font-weight: 900; border-radius: 22px; box-shadow: 0 4px 14px rgba(11,19,43,0.3); transition: all 0.2s ease;">
                Ingresar al Sistema
              </button>
            </form>

          </div>
        </div>
      </div>
    `;
  },

  // 1. Dashboard Principal
  renderDashboard(state) {
    const role = state.currentRole || "admin";
    const user = this.getCurrentUser(state);

    if (role === "admin") {
      return this.renderAdminDashboard(state, user);
    } else if (role === "director") {
      return this.renderDirectorDashboard(state, user);
    } else if (role === "docente") {
      return this.renderTeacherDashboard(state, user);
    } else if (role === "auxiliar") {
      return this.renderAuxiliarDashboard(state, user);
    } else if (role === "padre") {
      return this.renderParentDashboard(state, user);
    } else if (role === "estudiante") {
      return this.renderStudentDashboard(state, user);
    }
    return this.renderAdminDashboard(state, user);
  },

  // Dashboard - Coordinación
  renderAdminDashboard(state, user) {
    const usersCount = (state.systemUsers || initialData.systemUsers || []).filter(u => !u._deleted).length;
    const enrollmentsCount = (state.enrollments || initialData.enrollments || []).filter(e => !e._deleted).length;

    return `
      <div class="fade-in">
        <div class="welcome-banner" style="background: linear-gradient(135deg, var(--color-navy-950) 0%, var(--color-navy-900) 100%); border-left: 6px solid var(--color-yellow-500);">
          <div class="welcome-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <span class="status-badge status-approved" style="background: rgba(245, 158, 11, 0.2); color: #fde047; border: 1px solid var(--color-yellow-500);">
                ★ COORDINACIÓN & DOCUMENTACIÓN • I.E.P. "EL EDUCADOR"
              </span>
              <span class="status-badge status-approved" style="background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid #22c55e;">
                <span class='status-dot-green'></span> 21 años dejando huellas (S.J.L. - UGEL 05)
              </span>
            </div>
            <h1 class="welcome-title">Bienvenido, <span>${user.name}</span></h1>
            <p class="welcome-subtitle">Recaudación del mes de Agosto: <strong>S/ 25,130.00</strong>. Lector óptico QR y persistencia multi-dispositivo habilitados.</p>

            <div class="metrics-strip">
              <div class="metric-card-mini">
                <span class="metric-label">Recaudación Agosto</span>
                <span class="metric-val highlight-green">S/ 25,130.00</span>
              </div>
              <div class="metric-card-mini">
                <span class="metric-label">Personal & Docentes</span>
                <span class="metric-val highlight-yellow">${usersCount}</span>
              </div>
              <div class="metric-card-mini">
                <span class="metric-label">Lector Cámara QR</span>
                <span class="metric-val highlight-yellow">ACTIVO [Cámara]</span>
              </div>
              <div class="metric-card-mini">
                <span class="metric-label">Base de Datos</span>
                <span class="metric-val highlight-green">EN DISCO</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Módulos Clave de Coordinación -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
          <!-- 0. Registro de Ingreso y Asistencia QR (Puerta) -->
          <div class="card" style="border-top: 4px solid #10b981; background: #f0fdf4;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <h4 style="font-size: var(--font-size-base); font-weight: 900; color: #065f46;">
                Control de Asistencia & Portería
              </h4>
              <span class="status-badge status-approved">Auxiliar / Puerta</span>
            </div>
            <p style="font-size: 12px; color: #166534; margin-bottom: var(--space-4);">
              Registro biométrico/QR en portería, parte diario de inasistencias a las 08:30 AM y libro de incidencias.
            </p>
            <button class="btn btn-sm" onclick="window.app.navigate('asistencia')" style="background: #047857; color: white; width: 100%; font-weight: 800; padding: 8px;">
              Acceder al Control de Asistencia
            </button>
          </div>

          <!-- 1. Lector QR por Cámara -->
          <div class="card" style="border-top: 4px solid var(--color-yellow-500); background: #fffdf5;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <h4 style="font-size: var(--font-size-base); font-weight: bold; color: var(--color-navy-900);">
                [Cámara] Lector de Cuadernos QR
              </h4>
              <span class="status-badge status-approved" style="background:#f59e0b; color:#0b132b;">En Vivo</span>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-4);">
              Abra la cámara de su celular o computadora para escanear y calificar cuadernos escolares al instante.
            </p>
            <button class="btn btn-gold btn-sm" onclick="window.app.navigate('cuadernos-qr')" style="width: 100%; font-weight: 800;">
              [Cámara] Abrir Escáner por Cámara
            </button>
          </div>

          <!-- 2. Registro de Notas -->
          <div class="card" style="border-top: 4px solid var(--color-navy-700);">
            <h4 style="font-size: var(--font-size-base); font-weight: bold; color: var(--color-navy-900); margin-bottom: 4px;">
              Registro Oficial de Notas
            </h4>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-4);">
              Edición de calificaciones del 1°, 2°, 3° y 4° Bimestre con promedios automáticos.
            </p>
            <button class="btn btn-navy btn-sm" onclick="window.app.navigate('calificaciones')" style="width: 100%;">
              Ver y Modificar Calificaciones
            </button>
          </div>

          <!-- 3. Informe N° 003 -->
          <div class="card" style="border-top: 4px solid var(--color-red-500);">
            <h4 style="font-size: var(--font-size-base); font-weight: bold; color: var(--color-navy-900); margin-bottom: 4px;">
              Informe Oficial N° 003/ED
            </h4>
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: var(--space-4);">
              Recaudación de agosto (S/ 25,130), 4ta categoría y expedientes ante la UGEL 05.
            </p>
            <button class="btn btn-red btn-sm" onclick="window.app.showOfficialReportModal()" style="width: 100%;">
              Ver Documento Oficial
            </button>
          </div>
        </div>

        <!-- =========================================================================
             GESTIÓN DE ESTRUCTURA DE GRADOS (EDITABLE POR EL ADMINISTRADOR)
             ========================================================================= -->
        <div class="card" style="margin-bottom: var(--space-6); border-top: 4px solid var(--color-navy-800);">
          <div class="card-header" style="flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 class="card-title" style="margin: 0; font-size: 16px;">🏛️ Estructura de Grados Institucionales</h3>
                <span class="status-badge status-approved" style="background: #e0e7ff; color: #3730a3; font-weight: 800; font-size: 11px;">
                  ${(state.academicConfig && state.academicConfig.hasSections) ? 'Modo Multi-Sección Habilitado' : 'Modelo Grados Únicos (Sin Secciones)'}
                </span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                El colegio opera bajo el modelo de <strong>Grados Únicos</strong> (sin divisiones paralelas A/B/C por defecto). Puede editar los grados, aulas físicas, tutores o habilitar secciones si es requerido.
              </p>
            </div>
            
            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
              <button class="btn btn-outline btn-sm" onclick="window.app.toggleAcademicSections(${!(state.academicConfig && state.academicConfig.hasSections)})" style="font-size: 11.5px; font-weight: 700;">
                ${(state.academicConfig && state.academicConfig.hasSections) ? 'Desactivar Secciones' : '⚙️ Habilitar Secciones'}
              </button>
              <button class="btn btn-navy btn-sm" onclick="window.app.openCreateGradeModal()" style="font-weight: 800; font-size: 11.5px;">
                + Agregar Nuevo Grado
              </button>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table" style="font-size: 12px;">
              <thead>
                <tr>
                  <th style="width: 100px;">Nivel</th>
                  <th>Grado</th>
                  <th style="width: 110px;">Sección</th>
                  <th>Aula / Ubicación Física</th>
                  <th>Tutor(a) de Aula</th>
                  <th style="text-align: right; width: 140px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${(state.gradesCatalog || initialData.gradesCatalog).map(g => `
                  <tr>
                    <td>
                      <span class="status-badge ${g.level === 'Inicial' ? 'status-pending' : g.level === 'Primaria' ? 'status-approved' : 'status-failed'}" style="font-size: 10px; font-weight: 800;">
                        ${g.level}
                      </span>
                    </td>
                    <td><strong>${g.label}</strong></td>
                    <td>
                      <span style="color: ${g.section ? 'var(--color-navy-900)' : 'var(--text-muted)'}; font-weight: ${g.section ? '800' : 'normal'};">
                        ${g.section ? g.section : ((state.academicConfig && state.academicConfig.hasSections) ? 'Sin asignar' : 'Única')}
                      </span>
                    </td>
                    <td><code>${g.classroom || 'Pabellón Central'}</code></td>
                    <td>${g.tutor || '<span style="color:#94a3b8; font-style:italic;">Por asignar</span>'}</td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm btn-outline" onclick="window.app.openEditGradeModal('${g.id}')" title="Editar Grado" style="padding: 3px 8px; font-size: 11px;">
                        ✏️ Editar
                      </button>
                      <button class="btn btn-sm btn-red" onclick="window.app.confirmDeleteGrade('${g.id}')" title="Eliminar Grado" style="padding: 3px 8px; font-size: 11px;">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Plana Docente & Gestión de 4ta Categoría / Privilegios</h3>
            <button class="btn btn-outline btn-sm" onclick="window.app.openCreateUserModal()">+ Agregar Personal</button>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Código</th><th>Docente / Personal</th><th>Nivel / Asignatura</th><th>Renta 4ta Cat.</th><th>Privilegio Edición</th><th>Acción</th></tr></thead>
              <tbody>
                ${(state.systemUsers || initialData.systemUsers || []).filter(u => u.role === 'Docente' && !u._deleted).map(u => `
                  <tr>
                    <td><code>${u.code}</code></td>
                    <td><strong>${u.name}</strong><br><span style="font-size:11px; color:var(--text-muted);">${u.email}</span></td>
                    <td>${u.detail}</td>
                    <td><span class="status-badge status-approved">✓ Enviado Contador</span></td>
                    <td><span class="status-badge ${u.hasAdminPrivilege ? 'status-approved' : 'status-pending'}">${u.hasAdminPrivilege ? '★ Permisos Admin' : 'Docente'}</span></td>
                    <td>
                      <button class="btn btn-sm ${u.hasAdminPrivilege ? 'btn-outline' : 'btn-red'}" onclick="window.app.toggleTeacherAdminPrivilege('${u.id}')">
                        ${u.hasAdminPrivilege ? 'Revocar' : 'Conceder Admin'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // GESTIÓN DE AULA: REGISTRO DE ESTUDIANTES & REGISTRO AUXILIAR (EXCEL)
  // =========================================================================
  renderStudentRegistry(state) {
    const role = state.currentRole || 'admin';
    const selectedGrade = state.selectedStudentRegistryGrade || state.selectedGradingGrade || "4sec";
    const cleanSelectedGrade = selectedGrade.toLowerCase().replace(/[^a-z0-9]/g, '');

    const gradesCatalog = (state.gradesCatalog && state.gradesCatalog.length > 0)
      ? state.gradesCatalog
      : ((initialData && initialData.gradesCatalog) || []);

    const currentGradeObj = gradesCatalog.find(g => {
      const gid = (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return gid === cleanSelectedGrade || gid.includes(cleanSelectedGrade) || cleanSelectedGrade.includes(gid);
    }) || { id: selectedGrade, label: "4° de Secundaria", level: "Secundaria", tutor: "Prof. Roberto Silva" };

    const currentUser = (window.appStore && typeof window.appStore.getCurrentUser === "function") ? window.appStore.getCurrentUser() : null;
    const isDocente = role === 'docente';

    // Cursos del grado
    const allBoletaCourses = (window.appStore && typeof window.appStore.getStudentBoletaCoursesCatalog === "function")
      ? window.appStore.getStudentBoletaCoursesCatalog(selectedGrade)
      : [];

    // Si es docente, filtrar ESTRICTAMENTE a solo sus cursos asignados
    const boletaCourses = (isDocente && currentUser && window.appStore && typeof window.appStore.isTeacherAssignedToCourse === "function")
      ? allBoletaCourses.filter(c => window.appStore.isTeacherAssignedToCourse(c, currentUser, selectedGrade))
      : allBoletaCourses;

    let selectedCourse = state.selectedStudentRegistryCourse;
    if (!selectedCourse || !boletaCourses.some(c => c.name === selectedCourse)) {
      selectedCourse = boletaCourses.length > 0 ? boletaCourses[0].name : (allBoletaCourses[0] ? allBoletaCourses[0].name : "Aritmética");
    }

    // Estudiantes del aula
    const allEnrollments = (window.appStore && typeof window.appStore.getEnrollments === "function")
      ? window.appStore.getEnrollments()
      : [];

    const searchQuery = (state.studentRegistrySearchQuery || "").toLowerCase().trim();

    const classroomStudents = allEnrollments.filter(e => {
      const egId = (e.gradeId || (window.appStore && window.appStore.resolveStudentGradeId(e.grade)) || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return egId === cleanSelectedGrade || egId.includes(cleanSelectedGrade) || cleanSelectedGrade.includes(egId);
    }).filter(e => {
      if (!searchQuery) return true;
      const name = (e.studentName || "").toLowerCase();
      const dni = (e.dni || "").toLowerCase();
      const code = (e.studentCode || "").toLowerCase();
      return name.includes(searchQuery) || dni.includes(searchQuery) || code.includes(searchQuery);
    });

    const activeUser = (state.currentUser && state.currentUser.name) ? state.currentUser : ((state.users && state.users[state.currentRole]) || initialData.users[state.currentRole] || {});
    const isTutor = (window.appStore && typeof window.appStore.isTeacherTutorOfGrade === 'function') 
      ? window.appStore.isTeacherTutorOfGrade(activeUser, selectedGrade) 
      : true;

    return `
      <div class="fade-in">
        
        <!-- Cabecera Institucional -->
        <div class="card" style="margin-bottom: var(--space-6); background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: #ffffff;">
          <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.15); flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <h2 class="card-title" style="font-size: var(--font-size-xl); color: #fde047; margin: 0;">
                  📋 Registro Oficial de Estudiantes & Registro Auxiliar
                </h2>
                <span class="status-badge" style="background: #22c55e; color: #0b132b; font-weight: 900;">Periodo 2026</span>
                ${isTutor ? `
                  <span class="status-badge" style="background: #fef08a; color: #854d0e; font-weight: 900; border: 1px solid #facc15;">
                    👑 Docente Tutor Responsable del Aula
                  </span>
                ` : `
                  <span class="status-badge" style="background: #f1f5f9; color: #475569; font-weight: 700; border: 1px solid #cbd5e1;">
                    👁️ Vista Docente de Asignatura
                  </span>
                `}
              </div>
              <p style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px;">
                I.E.P. "El Educador" • UGEL 05 S.J.L. • Gestión de Nómina, Importación desde Excel y Generación de Registro Auxiliar MINEDU.
              </p>
            </div>

            <!-- Acciones Principales en Cabecera -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              ${isTutor ? `
                <button class="btn btn-gold btn-sm" onclick="window.app.openAddStudentModal('${selectedGrade}')" style="font-weight: 900; padding: 8px 16px;">
                  ➕ Agregar Estudiante
                </button>
                <button class="btn btn-sm" onclick="window.app.openImportStudentsModal('${selectedGrade}')" style="background: #10b981; color: white; font-weight: 900; padding: 8px 16px;">
                  📥 Importar desde Excel
                </button>
              ` : `
                <div style="font-size: 11.5px; color: #f8fafc; background: rgba(0,0,0,0.3); padding: 6px 12px; border-radius: 6px; border: 1px dashed rgba(255,255,255,0.4);">
                  🔒 Matrícula restringida: Solo el Tutor(a) <strong>${currentGradeObj.tutor || 'Asignado'}</strong> o Dirección.
                </div>
              `}
              <button class="btn btn-sm" onclick="window.app.downloadAuxiliaryRegisterExcel('${selectedGrade}', '${selectedCourse}')" style="background: #0284c7; color: white; font-weight: 900; padding: 8px 16px;">
                📊 Descargar Registro Auxiliar (.XLS)
              </button>
            </div>
          </div>

          <!-- Métricas Rápidas del Aula -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding: 14px 20px; background: rgba(0,0,0,0.15);">
            <div style="border-left: 3px solid #38bdf8; padding-left: 10px;">
              <div style="font-size: 11px; opacity: 0.8; text-transform: uppercase; font-weight: 700;">Aula / Grado Activo</div>
              <div style="font-size: 16px; font-weight: 900; color: #f8fafc;">${currentGradeObj.label || selectedGrade}</div>
            </div>
            <div style="border-left: 3px solid #4ade80; padding-left: 10px;">
              <div style="font-size: 11px; opacity: 0.8; text-transform: uppercase; font-weight: 700;">Estudiantes Matriculados</div>
              <div style="font-size: 16px; font-weight: 900; color: #4ade80;">${classroomStudents.length} Alumnos</div>
            </div>
            <div style="border-left: 3px solid #facc15; padding-left: 10px;">
              <div style="font-size: 11px; opacity: 0.8; text-transform: uppercase; font-weight: 700;">Tutor(a) Responsable</div>
              <div style="font-size: 14px; font-weight: 800; color: #fde047;">${currentGradeObj.tutor || 'Prof. Roberto Silva'}</div>
            </div>
          </div>
        </div>

        <!-- Barra de Control, Filtrado y Búsqueda -->
        <div class="card" style="margin-bottom: var(--space-4); padding: 16px; background: #ffffff;">
          <div style="display: flex; gap: 14px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; flex: 1;">
              <!-- 1. Selector de Grado -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; font-weight: 800; color: var(--color-navy-900);">🏫 Grado:</span>
                <select class="form-control" style="font-weight: bold; width: auto; font-size: 12.5px; min-width: 200px; background: #fffbeb; border-color: #f59e0b;" onchange="window.app.changeStudentRegistryGrade(this.value)">
                  <optgroup label="--- NIVEL INICIAL ---">
                    <option value="ini-3" ${cleanSelectedGrade === 'ini3' || cleanSelectedGrade === 'ini-3' ? 'selected' : ''}>Inicial 3 Años</option>
                    <option value="ini-4" ${cleanSelectedGrade === 'ini4' || cleanSelectedGrade === 'ini-4' ? 'selected' : ''}>Inicial 4 Años</option>
                    <option value="ini-5" ${cleanSelectedGrade === 'ini5' || cleanSelectedGrade === 'ini-5' ? 'selected' : ''}>Inicial 5 Años</option>
                  </optgroup>
                  <optgroup label="--- NIVEL PRIMARIA ---">
                    <option value="1prim" ${cleanSelectedGrade === '1prim' ? 'selected' : ''}>1° de Primaria</option>
                    <option value="2prim" ${cleanSelectedGrade === '2prim' ? 'selected' : ''}>2° de Primaria</option>
                    <option value="3prim" ${cleanSelectedGrade === '3prim' ? 'selected' : ''}>3° de Primaria</option>
                    <option value="4prim" ${cleanSelectedGrade === '4prim' ? 'selected' : ''}>4° de Primaria</option>
                    <option value="5prim" ${cleanSelectedGrade === '5prim' ? 'selected' : ''}>5° de Primaria</option>
                    <option value="6prim" ${cleanSelectedGrade === '6prim' ? 'selected' : ''}>6° de Primaria</option>
                  </optgroup>
                  <optgroup label="--- NIVEL SECUNDARIA ---">
                    <option value="1sec" ${cleanSelectedGrade === '1sec' ? 'selected' : ''}>1° de Secundaria</option>
                    <option value="2sec" ${cleanSelectedGrade === '2sec' ? 'selected' : ''}>2° de Secundaria</option>
                    <option value="3sec" ${cleanSelectedGrade === '3sec' ? 'selected' : ''}>3° de Secundaria</option>
                    <option value="4sec" ${cleanSelectedGrade === '4sec' ? 'selected' : ''}>4° de Secundaria</option>
                    <option value="5sec" ${cleanSelectedGrade === '5sec' ? 'selected' : ''}>5° de Secundaria</option>
                  </optgroup>
                </select>
              </div>

              <!-- 2. Selector de Curso para el Registro Auxiliar -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; font-weight: 800; color: var(--color-navy-900);">📚 Asignatura:</span>
                <select class="form-control" style="font-weight: bold; width: auto; font-size: 12.5px; min-width: 220px;" onchange="window.app.changeStudentRegistryCourse(this.value)">
                  ${boletaCourses.length === 0 ? `
                    <option value="" disabled selected>(No tienes asignaturas a cargo en ${currentGradeObj.label})</option>
                  ` : boletaCourses.map(c => `
                    <option value="${c.name}" ${c.name === selectedCourse ? 'selected' : ''}>
                      ${c.icon || '📖'} ${c.name} • (${c.teacher})
                    </option>
                  `).join('')}
                </select>
              </div>

              <!-- 3. Buscador en Tiempo Real -->
              <div style="position: relative; min-width: 220px;">
                <input type="text" class="form-control" placeholder="🔍 Buscar por nombre o DNI..." value="${state.studentRegistrySearchQuery || ''}" oninput="window.app.filterStudentRegistry(this.value)" style="font-size: 12px;" />
              </div>
            </div>

            <!-- Botones Secundarios -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${isTutor ? `
                <button class="btn btn-outline btn-sm" onclick="window.app.openPasteFromExcelModal('${selectedGrade}')" style="font-weight: 800; font-size: 11.5px;">
                  📋 Pegar Filas de Excel
                </button>
                <button class="btn btn-outline btn-sm" onclick="window.app.downloadExcelTemplate()" style="font-weight: 800; font-size: 11.5px; color: #0284c7; border-color: #38bdf8;">
                  📄 Plantilla Excel
                </button>
                <button class="btn btn-sm" onclick="window.app.confirmClearAllClassroomStudents('${selectedGrade}')" style="font-weight: 800; font-size: 11.5px; background: #fee2e2; color: #b91c1c; border: 1px solid #f87171;" title="Eliminar todos los registros de estudiantes de esta aula">
                  🗑️ Eliminar Todos los Registros del Aula
                </button>
              ` : `
                <button class="btn btn-outline btn-sm" onclick="window.app.downloadExcelTemplate()" style="font-weight: 800; font-size: 11.5px; color: #0284c7; border-color: #38bdf8;">
                  📄 Plantilla Excel
                </button>
              `}
            </div>

          </div>
        </div>

        <!-- Tabla Principal de Estudiantes -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <div style="font-size: 13px; font-weight: 800; color: var(--color-navy-900);">
              Nómina Oficial de Estudiantes — ${currentGradeObj.label || selectedGrade} (${classroomStudents.length} Alumnos Registrados)
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              ${classroomStudents.length > 0 ? `
                <button class="btn btn-sm" onclick="window.app.confirmClearAllClassroomStudents('${selectedGrade}')" style="font-weight: 800; font-size: 11.5px; background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; padding: 4px 12px;" title="Vaciar la nómina de esta aula">
                  🗑️ Eliminar Todos los Registros (${classroomStudents.length})
                </button>
              ` : ''}
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr style="background: var(--color-navy-900); color: white;">
                  <th style="width: 5%; text-align: center;">N°</th>
                  <th style="width: 32%;">Nombre y Apellido</th>
                  <th style="width: 15%;">Grado Escolar</th>
                  <th style="width: 20%;">Padre y/o Apoderado</th>
                  <th style="width: 16%;">Teléfono Apoderado</th>
                  <th style="width: 12%; text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${classroomStudents.length === 0 ? `
                  <tr>
                    <td colspan="6" style="text-align: center; padding: 40px 20px; color: #64748b;">
                      <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
                      <div style="font-size: 14px; font-weight: 800; color: #1e293b;">No hay estudiantes registrados en ${currentGradeObj.label || selectedGrade}.</div>
                      <p style="font-size: 12px; margin-top: 4px; margin-bottom: 16px;">
                        Puede agregar alumnos con el botón "+ Agregar Estudiante" ingresando Nombre, Grado, Apoderado y Teléfono, o importar desde un libro de Excel.
                      </p>
                      ${isTutor ? `
                        <div style="display: flex; gap: 8px; justify-content: center;">
                          <button class="btn btn-gold btn-sm" onclick="window.app.openAddStudentModal('${selectedGrade}')" style="font-weight: 800;">
                            ➕ Agregar Estudiante
                          </button>
                          <button class="btn btn-sm" onclick="window.app.openImportStudentsModal('${selectedGrade}')" style="background: #10b981; color: white; font-weight: 800;">
                            📥 Importar desde Excel
                          </button>
                        </div>
                      ` : `
                        <div style="font-size: 12px; color: #64748b;">
                          🔒 La matrícula y gestión de nómina está reservada para el Tutor(a) <strong>${currentGradeObj.tutor || 'Asignado'}</strong> o Dirección.
                        </div>
                      `}
                    </td>
                  </tr>
                ` : classroomStudents.map((st, idx) => `
                  <tr>
                    <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
                    <td>
                      <div style="font-weight: 900; color: #0b132b; font-size: 13.5px;">${st.studentName}</div>
                      <div style="font-size: 10.5px; color: #64748b;">Código: ${st.studentCode || st.id}</div>
                    </td>
                    <td>
                      <span class="status-badge" style="background: #e0f2fe; color: #0369a1; font-weight: 800; font-size: 11.5px;">
                        ${st.grade || currentGradeObj.label}
                      </span>
                    </td>
                    <td>
                      <div style="font-size: 12.5px; font-weight: 700; color: #1e293b;">${st.guardian || 'Padre / Apoderado no registrado'}</div>
                    </td>
                    <td>
                      <div style="font-size: 12px; color: #16a34a; font-weight: 800;">📞 ${st.guardianPhone || st.emergencyPhone || st.phone || 'Sin teléfono'}</div>
                    </td>
                    <td style="text-align: center;">
                      <div style="display: flex; gap: 4px; justify-content: center;">
                        <button class="btn btn-outline btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('${st.studentCode || st.dni}')" title="Ver Stickers QR de Cuadernos" style="padding: 4px 7px; font-size: 11px;">
                          ⚡ QR
                        </button>
                        ${isTutor ? `
                          <button class="btn btn-outline btn-sm" onclick="window.app.openEditStudentModal('${st.id || st.studentCode}')" title="Editar datos del estudiante" style="padding: 4px 7px; font-size: 11px;">
                            ✏️
                          </button>
                          <button class="btn btn-sm" onclick="window.app.confirmDeleteStudent('${st.studentCode || st.id}')" title="Eliminar estudiante" style="padding: 4px 7px; font-size: 11px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5;">
                            🗑️
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="padding: 14px 18px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="font-size: 12px; color: #475569;">
              Total de estudiantes en nómina: <strong>${classroomStudents.length}</strong> • I.E.P. "El Educador" S.J.L.
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-outline btn-sm" onclick="window.print()" style="font-weight: 800;">
                🖨️ Imprimir Nómina
              </button>
              <button class="btn btn-navy btn-sm" onclick="window.app.downloadAuxiliaryRegisterExcel('${selectedGrade}', '${selectedCourse}')" style="font-weight: 800;">
                📊 Descargar Registro Auxiliar (Excel)
              </button>
            </div>
          </div>
        </div>

      </div>
    `;
  },

  // Dashboard - Auxiliar de Educación & Portería
  renderAuxiliarDashboard(state, user) {
    const records = state.attendanceRecords || (initialData && initialData.attendanceRecords) || [];
    const reviews = state.notebookReviews || (initialData && initialData.notebookReviews) || [];
    const incidents = state.behaviorIncidents || (initialData && initialData.behaviorIncidents) || [];
    const dayReport = (window.appStore && typeof window.appStore.getDailyAttendanceReport === 'function')
      ? window.appStore.getDailyAttendanceReport("19/08/2026")
      : { presentList: [], tardinessList: [], absenceList: [] };

    const totalIngresos = (dayReport.presentList ? dayReport.presentList.length : 0) + (dayReport.tardinessList ? dayReport.tardinessList.length : 0);
    const totalTardanzas = dayReport.tardinessList ? dayReport.tardinessList.length : 0;

    return `
      <div class="fade-in">
        <!-- Banner de Turno del Auxiliar -->
        <div class="welcome-banner" style="background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); border-left: 6px solid #10b981;">
          <div class="welcome-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
              <span class="status-badge status-approved" style="background: rgba(16, 185, 129, 0.25); color: #6ee7b7; border: 1px solid #10b981; font-weight: 800;">
                👮 TURNO DE AUXILIAR & CONTROL ESCOLAR • I.E.P. "EL EDUCADOR"
              </span>
              <span class="status-badge status-approved" style="background: rgba(245, 158, 11, 0.2); color: #fde047; border: 1px solid #f59e0b;">
                Portería Puerta 1 & Pabellón Secundaria
              </span>
            </div>
            <h1 class="welcome-title">Bienvenido(a), <span>${user.name}</span></h1>
            <p class="welcome-subtitle">
              Módulo exclusivo para <strong>Registro Biométrico / QR en Portería</strong> y <strong>Revisión y Sellado de Cuadernos Escolares</strong>.
            </p>

            <div class="metrics-strip">
              <div class="metric-card-mini">
                <span class="metric-label">Ingresos en Puerta</span>
                <span class="metric-val highlight-green">${totalIngresos > 0 ? totalIngresos : 42} Alumnos</span>
              </div>
              <div class="metric-card-mini">
                <span class="metric-label">Tardanzas Hoy</span>
                <span class="metric-val highlight-yellow">${totalTardanzas > 0 ? totalTardanzas : 3}</span>
              </div>
              <div class="metric-card-mini">
                <span class="metric-label">Cuadernos Sellados</span>
                <span class="metric-val highlight-yellow">${reviews.length > 0 ? reviews.length : 26}</span>
              </div>
              <div class="metric-card-mini">
                <span class="metric-label">Incidencias Reportadas</span>
                <span class="metric-val highlight-red">${incidents.length}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Módulos Exclusivos del Auxiliar -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
          
          <!-- Tarjeta 1: Registro de Ingreso y Asistencia QR -->
          <div class="card" style="border-top: 5px solid #10b981; box-shadow: 0 4px 14px rgba(16,185,129,0.15);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
              <h3 style="font-size: 16px; font-weight: 900; color: #065f46; margin: 0;">
                1. Control de Asistencia & Portería
              </h3>
              <span class="status-badge status-approved" style="background:#10b981; color:white; font-weight: 900;">07:00 - 08:30 AM</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Escaneo óptico de fotochecks QR en puerta, control automático de tolerancia (07:45 AM), inasistencias (08:30 AM) y libro de incidencias.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <button class="btn btn-sm" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('door-scanner');" style="background: #047857; color: white; font-weight: 800; padding: 10px 8px; font-size: 12px;">
                [Cámara] Escáner en Puerta
              </button>
              <button class="btn btn-gold btn-sm" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('id-cards');" style="font-weight: 800; padding: 10px 8px; font-size: 12px;">
                Plancha QR (Sin Foto)
              </button>
              <button class="btn btn-navy btn-sm" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('daily-report');" style="font-weight: 800; padding: 10px 8px; font-size: 12px; grid-column: span 2;">
                Parte Diario de Tardanzas / Inasistencias (08:30 AM)
              </button>
            </div>
          </div>

          <!-- Tarjeta 2: Lector de Cuadernos QR -->
          <div class="card" style="border-top: 5px solid #f59e0b; box-shadow: 0 4px 14px rgba(245,158,11,0.15);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
              <h3 style="font-size: 16px; font-weight: 900; color: #b45309; margin: 0;">
                2. Lector de Cuadernos QR
              </h3>
              <span class="status-badge" style="background:#f59e0b; color:#0b132b; font-weight: 900;">CÁMARA VIVA</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">
              Supervisión de cuadernos escolares, sellado digital mediante lectura de código QR, verificación de tareas completas y registro de observaciones.
            </p>
            <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
              <button class="btn btn-gold btn-sm" onclick="window.app.navigate('cuadernos-qr')" style="font-weight: 900; padding: 10px; font-size: 13px;">
                [Cámara] Iniciar Lector de Cuadernos QR
              </button>
              <button class="btn btn-navy btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('EST-2026-042')" style="font-weight: 800; padding: 9px; font-size: 12px; background: #0f172a; color: #fde047; border: 1px solid #f59e0b;">
                ⚡ Plancha QR por Estudiante (Cursos Boleta)
              </button>
              <button class="btn btn-outline btn-sm" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('incidents');" style="font-weight: 800; padding: 8px; font-size: 12px; color: #dc2626; border-color: #fca5a5;">
                Registrar Incidencia Conductual
              </button>
            </div>
          </div>

        </div>

        <!-- Tabla Resumen del Padrón de Aulas -->
        <div class="card">
          <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
            <h3 class="card-title" style="font-size: var(--font-size-base); margin: 0;">
              Padrón Rápido de Aulas a Cargo del Auxiliar
            </h3>
            <button class="btn btn-navy btn-sm" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('classroom');">
              Ver Asistencia por Aula Completa
            </button>
          </div>
          <div class="table-container">
            <table class="data-table" style="font-size: 12px;">
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Grado</th>
                  <th>Aula / Ubicación</th>
                  <th>Tutor(a)</th>
                  <th>Hora de Inicio</th>
                  <th style="text-align: right;">Acción Rápida</th>
                </tr>
              </thead>
              <tbody>
                ${(state.gradesCatalog || initialData.gradesCatalog).map(g => `
                  <tr>
                    <td><span class="status-badge ${g.level === 'Inicial' ? 'status-pending' : g.level === 'Primaria' ? 'status-approved' : 'status-failed'}" style="font-size: 10px;">${g.level}</span></td>
                    <td><strong>${g.label}</strong></td>
                    <td><code>${g.classroom || 'Pabellón Central'}</code></td>
                    <td>${g.tutor || 'Docente Responsable'}</td>
                    <td><code>07:45 AM</code></td>
                    <td style="text-align: right;">
                      <button class="btn btn-sm btn-outline" onclick="window.app.navigate('asistencia'); window.app.onAttendanceGradeChange('${g.id}'); window.app.setAttendanceSubTab('classroom');" style="font-size: 11px; padding: 4px 8px;">
                        Ver Aula
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  // =========================================================================
  // MÓDULO DE AGENDA VIRTUAL ESCOLAR & CONTROL DE CONVIVENCIA (QR ENLAZADO)
  // =========================================================================
  renderVirtualAgenda(state) {
    const role = state.currentRole;
    const isEstudiante = role === "estudiante";
    const isPadre = role === "padre";

    const allNotes = (window.appStore && typeof window.appStore.getAgendaNotes === "function") 
      ? window.appStore.getAgendaNotes("all") 
      : (state.agendaNotes || initialData.agendaNotes || []);

    const enrollments = (window.appStore && typeof window.appStore.getEnrollments === "function") 
      ? window.appStore.getEnrollments() 
      : (state.enrollments || initialData.enrollments);

    const catalogGrades = state.gradesCatalog || initialData.gradesCatalog || [];

    // --- VISTA PARA ESTUDIANTE / PADRE DE FAMILIA ---
    if (isEstudiante || isPadre) {
      const currentUser = this.getCurrentUser(state);

      let studentName = "Salim Gael Cáceres Quispe";
      let studentGrade = "5° de Primaria";
      let studentCode = "EST-2026-055";
      let studentDni = "76541298";
      let studentTutor = "Miss Julisa Magali Arroyo";
      let parentName = "Carmen Rosa Quispe Achulla";

      if (isEstudiante) {
        studentName = currentUser.name || "Salim Gael Cáceres Quispe";
        studentGrade = currentUser.gradeLevel || currentUser.detail || currentUser.grade || "5° de Primaria";
        const stMatch = enrollments.find(e => (currentUser.code && e.studentCode === currentUser.code) || (currentUser.dni && e.dni === currentUser.dni) || (e.studentName && e.studentName.toLowerCase().includes(studentName.toLowerCase())));
        studentCode = stMatch ? (stMatch.studentCode || stMatch.dni) : (currentUser.code || "EST-2026-055");
        studentDni = stMatch ? stMatch.dni : (currentUser.dni || "76541298");
        studentTutor = stMatch ? (stMatch.tutor || currentUser.tutor) : (currentUser.tutor || "Miss Julisa Magali Arroyo");
        parentName = currentUser.guardian || (stMatch ? stMatch.guardian : "Carmen Rosa Quispe Achulla");
      } else if (isPadre) {
        parentName = currentUser.name || "Carmen Rosa Quispe Achulla";
        const children = (currentUser && currentUser.children) || [];
        const selectedId = (currentUser && currentUser.selectedChildId) || (children[0] && children[0].id);
        const student = children.find(c => c.id === selectedId) || children[0];
        if (student) {
          studentName = student.name;
          studentGrade = student.grade;
          studentCode = student.id || student.studentCode || "EST-2026-055";
          studentDni = student.dni || "76541298";
          studentTutor = student.tutor || "Miss Julisa Magali Arroyo";
        } else if (currentUser.studentName) {
          studentName = currentUser.studentName;
          studentGrade = currentUser.detail || "5° de Primaria";
          const stMatch = enrollments.find(e => e.studentName && e.studentName.toLowerCase().includes(currentUser.studentName.toLowerCase()));
          studentCode = stMatch ? (stMatch.studentCode || stMatch.dni) : "EST-2026-055";
          studentDni = stMatch ? stMatch.dni : (currentUser.dni || "76541298");
          studentTutor = stMatch ? (stMatch.tutor || "Miss Julisa Magali Arroyo") : "Miss Julisa Magali Arroyo";
        }
      }

      // Buscar anotaciones de este estudiante
      const studentNotes = (window.appStore && typeof window.appStore.getAgendaNotes === "function")
        ? window.appStore.getAgendaNotes(studentCode)
        : allNotes.filter(n => (n.studentCode && n.studentCode === studentCode) || (n.studentName && n.studentName.toLowerCase().includes(studentName.toLowerCase())));

      const activeFilter = state.selectedAgendaFilter || "all";
      const filteredNotes = studentNotes.filter(n => {
        if (activeFilter === "all") return true;
        if (activeFilter === "pending-sign") return !n.parentSigned;
        return n.type === activeFilter;
      });

      const totalCount = studentNotes.length;
      const meritosCount = studentNotes.filter(n => n.type === "merito").length;
      const pedagogicasCount = studentNotes.filter(n => n.type === "pedagogica").length;
      const conductasCount = studentNotes.filter(n => n.type === "conducta").length;
      const citacionesCount = studentNotes.filter(n => n.type === "citacion").length;
      const pendingSignCount = studentNotes.filter(n => !n.parentSigned).length;

      return `
        <div class="fade-in">
          <div class="card" style="margin-bottom: var(--space-6);">
            
            ${this.renderOfficialInstitutionalHeader("AGENDA VIRTUAL ESCOLAR & CONTROL FORMATIVO", "SEGUIMIENTO PEDAGÓGICO, CONDUCTUAL Y COMUNICACIÓN FAMILIAR 2026")}

            <!-- Tarjeta de Identificación del Estudiante & Enlace al QR de Asistencia -->
            <div style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white; border-radius: 12px; padding: 18px; margin: 16px 0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; box-shadow: 0 4px 15px rgba(11,19,43,0.15); border-left: 6px solid #f59e0b;">
              <div style="display: flex; align-items: center; gap: 16px;">
                <div style="width: 70px; height: 70px; background: white; border-radius: 8px; padding: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                  ${this.generateQRSVG(studentCode)}
                </div>
                <div>
                  <span style="font-size: 10px; font-weight: 900; color: #fde047; letter-spacing: 0.05em; text-transform: uppercase;">
                    ★ AGENDA VINCULADA AL FOTOCHECK QR N° ${studentCode}
                  </span>
                  <div style="font-size: 18px; font-weight: 900; color: #ffffff; margin: 2px 0;">
                    ${studentName}
                  </div>
                  <div style="font-size: 12px; color: #bfdbfe;">
                    <strong>${studentGrade}</strong> • DNI: ${studentDni} • Tutor(a): <strong>${studentTutor}</strong>
                  </div>
                  <div style="font-size: 11px; color: #e2e8f0; margin-top: 4px;">
                    ${isPadre ? `Apoderada: <strong>${parentName}</strong>` : `Apoderado(a) Registrado: <strong>${parentName}</strong>`}
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="btn btn-gold btn-sm" onclick="window.app.openPrintAgendaOfficialModal('${studentCode}')" style="font-weight: 800; padding: 8px 16px; border-radius: 20px;">
                  📄 Imprimir Agenda A4 / PDF
                </button>
                <button class="btn btn-outline btn-sm" onclick="window.app.openStudentQRModal('${studentCode}')" style="color: #ffffff; border-color: rgba(255,255,255,0.4); font-weight: 800; border-radius: 20px;">
                  Ver Mi Fotocheck QR
                </button>
              </div>
            </div>

            <!-- Resumen Estadístico de Anotaciones en la Agenda -->
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-bottom: var(--space-5);">
              <div class="card metric-card" style="border-top: 4px solid #10b981; cursor: pointer;" onclick="window.app.setAgendaFilter('merito')">
                <span class="metric-title">★ Méritos / Felicitaciones</span>
                <div class="metric-value highlight-green">${meritosCount}</div>
                <span class="metric-trend up" style="font-size: 11px;">Conducta destacada</span>
              </div>
              <div class="card metric-card" style="border-top: 4px solid #3b82f6; cursor: pointer;" onclick="window.app.setAgendaFilter('pedagogica')">
                <span class="metric-title">📝 Tareas & Materiales</span>
                <div class="metric-value highlight-navy">${pedagogicasCount}</div>
                <span class="metric-trend" style="font-size: 11px; color: #1e40af;">Requerimientos pedagógicos</span>
              </div>
              <div class="card metric-card" style="border-top: 4px solid #f59e0b; cursor: pointer;" onclick="window.app.setAgendaFilter('conducta')">
                <span class="metric-title">⚠️ Observaciones</span>
                <div class="metric-value highlight-yellow">${conductasCount}</div>
                <span class="metric-trend" style="font-size: 11px; color: #b45309;">Llamados de atención</span>
              </div>
              <div class="card metric-card" style="border-top: 4px solid #8b5cf6; cursor: pointer;" onclick="window.app.setAgendaFilter('citacion')">
                <span class="metric-title">📅 Citaciones Familia</span>
                <div class="metric-value" style="color: #6d28d9;">${citacionesCount}</div>
                <span class="metric-trend" style="font-size: 11px; color: #5b21b6;">Entrevistas de tutoría</span>
              </div>
              <div class="card metric-card" style="border-top: 4px solid ${pendingSignCount > 0 ? '#ef4444' : '#10b981'}; cursor: pointer;" onclick="window.app.setAgendaFilter('pending-sign')">
                <span class="metric-title">✍️ Firmas Pendientes</span>
                <div class="metric-value" style="color: ${pendingSignCount > 0 ? '#dc2626' : '#15803d'};">${pendingSignCount}</div>
                <span class="metric-trend" style="font-size: 11px; color: ${pendingSignCount > 0 ? '#dc2626' : '#047857'};">${pendingSignCount > 0 ? 'Requieren firma de apoderado' : 'Todas firmadas al día'}</span>
              </div>
            </div>

            <!-- Barra de Filtros de la Agenda -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-sm ${activeFilter === 'all' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAgendaFilter('all')" style="font-weight: 800; font-size: 11.5px; border-radius: 16px;">
                  Todas (${totalCount})
                </button>
                <button class="btn btn-sm ${activeFilter === 'merito' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAgendaFilter('merito')" style="font-weight: 800; font-size: 11.5px; border-radius: 16px; color: #047857;">
                  ★ Méritos (${meritosCount})
                </button>
                <button class="btn btn-sm ${activeFilter === 'pedagogica' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAgendaFilter('pedagogica')" style="font-weight: 800; font-size: 11.5px; border-radius: 16px; color: #1e40af;">
                  📝 Tareas (${pedagogicasCount})
                </button>
                <button class="btn btn-sm ${activeFilter === 'conducta' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAgendaFilter('conducta')" style="font-weight: 800; font-size: 11.5px; border-radius: 16px; color: #b45309;">
                  ⚠️ Observaciones (${conductasCount})
                </button>
                <button class="btn btn-sm ${activeFilter === 'citacion' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAgendaFilter('citacion')" style="font-weight: 800; font-size: 11.5px; border-radius: 16px; color: #6d28d9;">
                  📅 Citaciones (${citacionesCount})
                </button>
                <button class="btn btn-sm ${activeFilter === 'pending-sign' ? 'btn-gold' : 'btn-outline'}" onclick="window.app.setAgendaFilter('pending-sign')" style="font-weight: 800; font-size: 11.5px; border-radius: 16px;">
                  ✍️ Por Firmar (${pendingSignCount})
                </button>
              </div>

              <span style="font-size: 11.5px; color: #64748b; font-weight: bold;">
                Mostrando <strong>${filteredNotes.length}</strong> anotaciones oficiales
              </span>
            </div>

            <!-- Línea de Tiempo de Anotaciones de la Agenda Virtual -->
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${filteredNotes.length > 0 ? filteredNotes.map(note => {
                const isMerito = note.type === 'merito';
                const isPedagogica = note.type === 'pedagogica';
                const isConducta = note.type === 'conducta';
                const isCitacion = note.type === 'citacion';

                const borderColor = isMerito ? '#10b981' : isPedagogica ? '#3b82f6' : isConducta ? '#f59e0b' : '#8b5cf6';
                const bgColor = isMerito ? '#f0fdf4' : isPedagogica ? '#eff6ff' : isConducta ? '#fffbeb' : '#f5f3ff';
                const badgeColor = isMerito ? '#047857' : isPedagogica ? '#1e40af' : isConducta ? '#b45309' : '#6d28d9';
                const badgeBg = isMerito ? '#dcfce7' : isPedagogica ? '#dbeafe' : isConducta ? '#fef3c7' : '#ede9fe';

                return `
                  <div class="card" style="border-left: 6px solid ${borderColor}; padding: 16px; background: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); border-radius: 10px;">
                    
                    <!-- Encabezado de la Tarjeta -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span class="status-badge" style="background: ${badgeBg}; color: ${badgeColor}; font-weight: 900; font-size: 11px; padding: 4px 10px; border: 1px solid ${borderColor};">
                          ${note.typeLabel || 'Anotación'}
                        </span>
                        <strong style="color: #0b132b; font-size: 13.5px;">${note.course}</strong>
                        <span style="font-size: 11.5px; color: #475569;">• Docente: <strong>${note.teacher}</strong></span>
                      </div>

                      <div style="font-size: 11px; color: #64748b; font-weight: bold; background: #f1f5f9; padding: 3px 8px; border-radius: 6px;">
                        🗓️ ${note.date} • ${note.time}
                      </div>
                    </div>

                    <!-- Título y Detalle -->
                    <h4 style="font-size: 14.5px; font-weight: 800; color: #0b132b; margin: 0 0 6px 0;">
                      ${note.title}
                    </h4>
                    <p style="font-size: 12.5px; color: #334155; line-height: 1.55; margin: 0 0 10px 0;">
                      ${note.description}
                    </p>

                    <!-- Requerimiento, Tarea o Compromiso -->
                    ${note.taskOrMaterial && note.taskOrMaterial !== 'Ninguno' ? `
                      <div style="background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 12px;">
                        <strong style="color: ${badgeColor}; display: block; margin-bottom: 2px;">
                          📌 ${isCitacion ? 'Fecha y Lugar de Citación:' : isConducta ? 'Compromiso Suscrito:' : 'Tarea / Material Requerido:'}
                        </strong>
                        <span style="color: #1e293b;">${note.taskOrMaterial}</span>
                        ${note.dueDate ? `<div style="font-size: 11px; color: #64748b; margin-top: 4px;">📅 Fecha límite: <strong>${note.dueDate}</strong></div>` : ''}
                      </div>
                    ` : ''}

                    <!-- Pie de la Anotación: Firma de Apoderado & Notificación -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px dashed #e2e8f0; padding-top: 10px; margin-top: 8px;">
                      <div>
                        ${note.parentSigned ? `
                          <div style="display: flex; align-items: center; gap: 6px;">
                            <span class="status-badge status-approved" style="font-size: 11px; font-weight: 800;">
                              ✓ Firmado Digitalmente
                            </span>
                            <span style="font-size: 11px; color: #047857;">por ${note.signedBy} (${note.signedDate})</span>
                          </div>
                        ` : `
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="status-badge status-pending" style="font-size: 11px; font-weight: 800;">
                              ⏳ Pendiente de Firma
                            </span>
                            <button class="btn btn-navy btn-sm" onclick="window.app.signAgendaNote('${note.id}')" style="font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 14px;">
                              ✍️ Firmar de Enterado(a)
                            </button>
                          </div>
                        `}
                      </div>

                      <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm" onclick="window.app.sendAgendaNoteWhatsApp('${note.id}')" style="background: #22c55e; color: white; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 14px;" title="Ver o Enviar por WhatsApp">
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>

                  </div>
                `;
              }).join('') : `
                <div class="card" style="text-align: center; padding: 36px 20px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px;">
                  <div style="font-size: 36px; margin-bottom: 8px;">📖</div>
                  <h3 style="font-size: 15px; font-weight: 800; color: #0b132b; margin: 0 0 4px 0;">
                    No hay anotaciones registradas bajo este filtro
                  </h3>
                  <p style="font-size: 12px; color: #64748b; margin: 0 0 12px 0;">
                    Las anotaciones, tareas y felicitaciones de los profesores aparecerán aquí en orden cronológico.
                  </p>
                  <button class="btn btn-outline btn-sm" onclick="window.app.setAgendaFilter('all')">
                    Ver Todas las Anotaciones
                  </button>
                </div>
              `}
            </div>

            <!-- Nota Formativa Institucional -->
            <div style="margin-top: var(--space-4); padding: 12px; background: rgba(30,58,138,0.05); border-radius: 6px; font-size: 11px; color: var(--color-navy-800); display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span><strong>Reglamento de Convivencia:</strong> La Agenda Virtual es el canal oficial de comunicación diaria entre la I.E.P. "El Educador" y la familia. Todo acuse de recibo firmado queda respaldado con sello digital y fecha en los servidores escolares.</span>
            </div>

          </div>
        </div>
      `;
    }

    // --- VISTA PARA DOCENTES, AUXILIARES, DIRECCIÓN Y ADMINISTRADORES ---
    const selectedGrade = state.selectedAgendaGrade || "all";
    const selectedStudent = state.selectedAgendaStudent || "all";
    const selectedType = state.selectedAgendaTypeFilter || "all";

    let filteredNotes = allNotes;
    if (selectedGrade !== "all") {
      filteredNotes = filteredNotes.filter(n => n.gradeId === selectedGrade || (n.grade && n.grade.includes(selectedGrade)));
    }
    if (selectedStudent !== "all") {
      filteredNotes = filteredNotes.filter(n => n.studentCode === selectedStudent || n.dni === selectedStudent);
    }
    if (selectedType !== "all") {
      filteredNotes = filteredNotes.filter(n => n.type === selectedType);
    }

    const totalNotes = allNotes.length;
    const meritosTotal = allNotes.filter(n => n.type === 'merito').length;
    const pedagogicasTotal = allNotes.filter(n => n.type === 'pedagogica').length;
    const conductasTotal = allNotes.filter(n => n.type === 'conducta').length;
    const citacionesTotal = allNotes.filter(n => n.type === 'citacion').length;

    return `
      <div class="fade-in">
        <div class="card" style="margin-bottom: var(--space-6);">
          
          <!-- Encabezado Principal del Módulo Docente / Admin -->
          <div class="card-header" style="flex-wrap: wrap; gap: 12px; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 class="card-title" style="font-size: var(--font-size-xl); margin: 0; color: var(--color-navy-900);">
                  📖 Agenda Virtual Escolar & Control de Convivencia
                </h2>
                <span class="status-badge status-approved" style="background:#10b981; color:white; font-weight:800;">ENLACE QR FOTOCHECK</span>
                <span class="status-badge status-approved" style="background:#22c55e; color:white; font-weight:800;">WHATSAPP OFICIAL</span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                I.E.P. "El Educador" • Registro en tiempo real de felicitaciones, requerimientos pedagógicos, observaciones de conducta y citaciones vinculadas al código QR del estudiante.
              </p>
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-navy btn-sm" onclick="window.app.openAgendaQRScannerModal()" style="font-weight: 800; display: flex; align-items: center; gap: 6px;">
                <span>📹</span> Escanear Fotocheck con Cámara
              </button>
              <button class="btn btn-gold btn-sm" onclick="window.app.openCreateAgendaNoteModal()" style="font-weight: 900; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
                <span>➕</span> Nueva Anotación en Agenda
              </button>
            </div>
          </div>

          <!-- Filtros de Grado, Alumno y Tipo -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #cbd5e1; margin: 16px 0;">
            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px; font-weight: 800;">1. Filtrar por Grado / Aula:</label>
              <select class="form-control" onchange="window.app.onAgendaGradeFilterChange(this.value)" style="font-size: 12px; font-weight: bold;">
                <option value="all">-- Todos los Grados --</option>
                ${catalogGrades.map(g => `<option value="${g.id}" ${selectedGrade === g.id ? 'selected' : ''}>${g.label} (${g.level})</option>`).join('')}
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px; font-weight: 800;">2. Filtrar por Estudiante:</label>
              <select class="form-control" onchange="window.app.onAgendaStudentFilterChange(this.value)" style="font-size: 12px; font-weight: bold;">
                <option value="all">-- Todos los Estudiantes --</option>
                ${enrollments.filter(e => selectedGrade === 'all' || e.gradeId === selectedGrade).map(e => `
                  <option value="${e.studentCode || e.dni}" ${selectedStudent === (e.studentCode || e.dni) ? 'selected' : ''}>
                    ${e.studentName} (${e.grade})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin: 0;">
              <label class="form-label" style="font-size: 11px; font-weight: 800;">3. Tipo de Anotación:</label>
              <select class="form-control" onchange="window.app.onAgendaTypeFilterChange(this.value)" style="font-size: 12px; font-weight: bold;">
                <option value="all" ${selectedType === 'all' ? 'selected' : ''}>-- Todos los Tipos --</option>
                <option value="merito" ${selectedType === 'merito' ? 'selected' : ''}>★ Mérito / Felicitación (${meritosTotal})</option>
                <option value="pedagogica" ${selectedType === 'pedagogica' ? 'selected' : ''}>📝 Tarea / Material (${pedagogicasTotal})</option>
                <option value="conducta" ${selectedType === 'conducta' ? 'selected' : ''}>⚠️ Observación de Conducta (${conductasTotal})</option>
                <option value="citacion" ${selectedType === 'citacion' ? 'selected' : ''}>📅 Citación a Apoderado (${citacionesTotal})</option>
              </select>
            </div>
          </div>

          <!-- Métricas Generales del Panel Docente -->
          <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); margin-bottom: 16px;">
            <div class="card metric-card" style="border-top: 4px solid #10b981;">
              <span class="metric-title">★ Méritos & Felicitaciones</span>
              <div class="metric-value highlight-green">${meritosTotal}</div>
              <span class="metric-trend up" style="font-size: 11px;">Reconocimientos formativos</span>
            </div>
            <div class="card metric-card" style="border-top: 4px solid #3b82f6;">
              <span class="metric-title">📝 Tareas & Materiales</span>
              <div class="metric-value highlight-navy">${pedagogicasTotal}</div>
              <span class="metric-trend" style="font-size: 11px; color: #1e40af;">Requerimientos de clase</span>
            </div>
            <div class="card metric-card" style="border-top: 4px solid #f59e0b;">
              <span class="metric-title">⚠️ Observaciones Conducta</span>
              <div class="metric-value highlight-yellow">${conductasTotal}</div>
              <span class="metric-trend" style="font-size: 11px; color: #b45309;">Convivencia escolar</span>
            </div>
            <div class="card metric-card" style="border-top: 4px solid #8b5cf6;">
              <span class="metric-title">📅 Citaciones a Padres</span>
              <div class="metric-value" style="color: #6d28d9;">${citacionesTotal}</div>
              <span class="metric-trend" style="font-size: 11px; color: #5b21b6;">Entrevistas de tutoría</span>
            </div>
          </div>

          <!-- Tabla de Anotaciones Registradas -->
          <div class="card-header" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <h3 class="card-title" style="font-size: var(--font-size-base); margin: 0;">
              📋 Expediente de Anotaciones en la Agenda Virtual (${filteredNotes.length} Registros)
            </h3>
            <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-size: 11.5px; font-weight: 800;">
              Imprimir Consolidado A4
            </button>
          </div>

          <div class="table-container">
            <table class="data-table" style="font-size: 12px;">
              <thead>
                <tr>
                  <th>Fecha & Hora</th>
                  <th>Estudiante</th>
                  <th>Grado</th>
                  <th>Tipo / Categoría</th>
                  <th>Curso & Docente</th>
                  <th>Detalle & Compromiso</th>
                  <th style="text-align: center;">Firma Apoderado</th>
                  <th style="text-align: center;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${filteredNotes.length > 0 ? filteredNotes.map(note => {
                  const badgeColor = note.type === 'merito' ? '#10b981' : note.type === 'pedagogica' ? '#3b82f6' : note.type === 'conducta' ? '#f59e0b' : '#8b5cf6';
                  return `
                    <tr>
                      <td>
                        <strong>${note.date}</strong><br>
                        <span style="font-size: 10.5px; color: #64748b;">${note.time}</span>
                      </td>
                      <td>
                        <strong>${note.studentName}</strong><br>
                        <code style="font-size: 10.5px; color: #1e3a8a;">${note.studentCode}</code>
                      </td>
                      <td>
                        <span class="status-badge" style="background:#e0e7ff; color:#3730a3; font-weight:bold; font-size: 10.5px;">
                          ${note.grade}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge" style="background: ${badgeColor}; color: white; font-weight: 800; font-size: 10px;">
                          ${note.typeLabel || note.type}
                        </span>
                        <div style="font-size: 10.5px; color: #475569; margin-top: 2px;">${note.category}</div>
                      </td>
                      <td>
                        <strong>${note.course}</strong><br>
                        <span style="font-size: 11px; color: #047857;">${note.teacher}</span>
                      </td>
                      <td style="max-width: 250px; line-height: 1.4;">
                        <strong>${note.title}</strong><br>
                        <span style="font-size: 11px; color: #475569;">${note.description}</span>
                        ${note.taskOrMaterial && note.taskOrMaterial !== 'Ninguno' ? `<div style="font-size: 10.5px; color: #1e3a8a; font-weight: bold; margin-top: 2px;">📌 ${note.taskOrMaterial}</div>` : ''}
                      </td>
                      <td style="text-align: center;">
                        ${note.parentSigned ? `
                          <span class="status-badge status-approved" style="font-size: 10px; font-weight: 800;">
                            ✓ Firmado
                          </span><br>
                          <span style="font-size: 9.5px; color: #047857;">${note.signedDate}</span>
                        ` : `
                          <span class="status-badge status-pending" style="font-size: 10px; font-weight: 800;">
                            ⏳ Pendiente
                          </span>
                        `}
                      </td>
                      <td style="text-align: center;">
                        <div style="display: flex; gap: 4px; justify-content: center;">
                          <button class="btn btn-sm" onclick="window.app.sendAgendaNoteWhatsApp('${note.id}')" style="background: #22c55e; color: white; font-weight: 800; font-size: 10.5px; padding: 3px 8px;" title="Notificar por WhatsApp">
                            💬 WhatsApp
                          </button>
                          <button class="btn btn-outline btn-sm" onclick="window.app.openPrintAgendaOfficialModal('${note.studentCode}')" style="font-size: 10.5px; padding: 3px 8px;" title="Ver Ficha Agenda A4">
                            Ficha A4
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">
                      No hay registros de agenda para los filtros seleccionados.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    `;
  },

  // =========================================================================
  // MÓDULO DE CONTROL Y REVISIÓN DE CUADERNOS (DOCENTE / PADRE)
  // =========================================================================
  renderNotebookQRControl(state) {
    const role = state.currentRole;
    const reviews = state.notebookReviews || initialData.notebookReviews;

    // --- VISTA EXCLUSIVA PARA ESTUDIANTES Y PADRES DE FAMILIA: INFORME OFICIAL DE CUADERNOS ---
    if (role === "estudiante" || role === "padre") {
      const isEstudiante = role === "estudiante";
      const isPadre = role === "padre";
      const currentUser = this.getCurrentUser(state);

      let studentName = "Salim Gael Cáceres Quispe";
      let studentGrade = "5° de Primaria";
      let studentCode = "EST-2026-055";
      let studentTutor = "Miss Julisa Arroyo";
      let parentName = "Apoderado Registrado";

      if (isEstudiante) {
        studentName = currentUser.name || "Salim Gael Cáceres Quispe";
        studentGrade = currentUser.gradeLevel || currentUser.detail || currentUser.grade || "5° de Primaria";
        studentCode = currentUser.code || currentUser.id || "EST-2026-055";
        studentTutor = currentUser.tutor || "Miss Julisa Arroyo";
        parentName = currentUser.guardian || "Apoderado Registrado";
      } else if (isPadre) {
        parentName = currentUser.name || "Carmen Rosa Quispe Achulla";
        const children = (currentUser && currentUser.children) || [];
        const selectedId = (currentUser && currentUser.selectedChildId) || (children[0] && children[0].id);
        const student = children.find(c => c.id === selectedId) || children[0];
        if (student) {
          studentName = student.name;
          studentGrade = student.grade;
          studentCode = student.id;
          studentTutor = student.tutor || "Miss Julisa Arroyo";
        } else if (currentUser.studentName) {
          studentName = currentUser.studentName;
          studentGrade = currentUser.detail || "5° de Primaria";
          studentCode = currentUser.id || "EST-2026-055";
          studentTutor = currentUser.tutor || "Miss Julisa Arroyo";
        }
      }

      // Cuadernos según nivel de primaria o secundaria
      const isPrimaria = studentGrade.toLowerCase().includes("prim") || studentGrade.toLowerCase().includes("pri");

      // Buscar revisiones registradas en tiempo real para este estudiante
      const studentReviews = reviews.filter(r => 
        (r.studentCode && r.studentCode === studentCode) ||
        (r.studentName && r.studentName.toLowerCase().includes(studentName.toLowerCase()))
      );

      const defaultNotebooks = isPrimaria ? [
        { course: "Matemática & Razonamiento", teacher: "Prof. Roberto Silva", lastDate: "16/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Tareas completas al 100%, márgenes impecables y esquemas en orden." },
        { course: "Comunicación Integral & Lectura", teacher: "Miss Julisa Magali Arroyo", lastDate: "15/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "18 (AD)", remarks: "Caligrafía prolija y lecturas analizadas con claridad." },
        { course: "Ciencia y Tecnología", teacher: "Miss Leyli Reyes", lastDate: "14/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "18 (AD)", remarks: "Fichas de experimentos y dibujos científicos completos." },
        { course: "Personal Social & Valores", teacher: "Miss Julisa Magali Arroyo", lastDate: "12/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Resúmenes ordenados y participación constante." },
        { course: "Inglés Técnico", teacher: "Miss Andrea Ramos", lastDate: "11/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "17 (A)", remarks: "Ejercicios de vocabulario al día." },
        { course: "Computación & Informática", teacher: "Prof. Fernando Rojas", lastDate: "10/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "18 (AD)", remarks: "Prácticas de laboratorio técnico en orden." }
      ] : [
        { course: "Matemática Avanzada (Álgebra / Geometría)", teacher: "Prof. Roberto Silva", lastDate: "16/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Tareas completas al 100%, márgenes impecables y esquemas en orden." },
        { course: "Comunicación & Literatura", teacher: "Miss María Daysi Reyes", lastDate: "15/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "17 (A)", remarks: "Análisis de textos y caligrafía óptima. Muy buen desarrollo." },
        { course: "Ciencia y Tecnología (Física / Química)", teacher: "Miss Leyli Reyes", lastDate: "14/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "18 (AD)", remarks: "Prácticas experimentales ilustradas y fichas de laboratorio selladas." },
        { course: "Ciencias Sociales & Historia", teacher: "Prof. Javier Vega", lastDate: "12/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "16 (A)", remarks: "Mapas históricos y resúmenes de época bien estructurados." },
        { course: "Inglés Institucional", teacher: "Miss Andrea Ramos", lastDate: "11/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Vocabulario y ejercicios de gramática avanzados completos." },
        { course: "EPT (Computación / Robótica)", teacher: "Prof. Alex Lino", lastDate: "10/08/2026", status: "observado", statusLabel: "<span class='status-dot-yellow'></span> OBSERVADO", score: "13 (B)", remarks: "Falta pegar y desarrollar la ficha de proyecto técnico N° 3. Presentar este viernes." }
      ];

      const displayNotebooks = studentReviews.length > 0 ? studentReviews.map(r => ({
        course: r.course,
        teacher: r.teacher || "Profesor Titular",
        lastDate: r.date,
        status: r.status === "Observado" ? "observado" : "al_dia",
        statusLabel: r.status === "Observado" ? "<span class='status-dot-yellow'></span> OBSERVADO" : "<span class='status-dot-green'></span> REVISADO & AL DÍA",
        score: `${r.score || 18} (${r.score >= 18 ? 'AD' : r.score >= 14 ? 'A' : 'B'})`,
        remarks: r.teacherRemarks || "Cuaderno en orden."
      })) : defaultNotebooks;

      const alDiaTotal = displayNotebooks.filter(nb => nb.status === "al_dia").length;
      const obsTotal = displayNotebooks.filter(nb => nb.status === "observado").length;
      const pctLogro = Math.round((alDiaTotal / displayNotebooks.length) * 100);

      return `
        <div class="fade-in">
          <div class="card" style="margin-bottom: var(--space-6);">
            
            ${this.renderOfficialInstitutionalHeader("INFORME OFICIAL DE REVISIÓN Y SELLADO DE CUADERNOS POR QR", "SEGUIMIENTO ACADÉMICO BIMESTRAL 2026")}

            <div style="background: var(--bg-surface-subtle); border-radius: 8px; padding: 16px; margin: 16px 0; border: 1px solid var(--border-subtle); display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
              <div>
                <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Estudiante:</span>
                <div style="font-size: 16px; font-weight: 900; color: var(--color-navy-900);">${studentName}</div>
                <span style="font-size: 12px; color: var(--color-red-600); font-weight: 700;">${studentGrade} • Código: ${studentCode}</span>
              </div>
              <div>
                <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">${isPadre ? 'Apoderado(a) Responsable:' : 'Tutor y Apoderado:'}</span>
                <div style="font-size: 14px; font-weight: 700; color: var(--color-navy-900);">${isPadre ? parentName : studentTutor}</div>
                <span style="font-size: 12px; color: var(--text-muted);">${isPadre ? `Tutor de Aula: ${studentTutor}` : `Apoderado(a): ${parentName}`}</span>
              </div>
              <div style="display: flex; gap: 8px; align-items: center; justify-content: flex-end;">
                <button class="btn btn-gold btn-sm" onclick="window.app.openPrintParentNotebookReportModal()" style="font-weight: 800; padding: 8px 16px;">
                  Imprimir / Guardar PDF
                </button>
              </div>
            </div>

            <!-- Resumen Estadístico de Sellos -->
            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: var(--space-6);">
              <div class="card metric-card" style="border-top: 4px solid #22c55e;">
                <span class="metric-title">Cuadernos al Día</span>
                <div class="metric-value highlight-green">${alDiaTotal} / ${displayNotebooks.length}</div>
                <span class="metric-trend up" style="font-size: 11px;">${pctLogro}% Cumplimiento</span>
              </div>
              <div class="card metric-card" style="border-top: 4px solid #f59e0b;">
                <span class="metric-title">Observados / Incompletos</span>
                <div class="metric-value highlight-yellow">${obsTotal}</div>
                <span class="metric-trend" style="font-size: 11px; color: var(--color-yellow-600);">${obsTotal > 0 ? 'Requieren regularización' : 'Ninguna observación'}</span>
              </div>
              <div class="card metric-card" style="border-top: 4px solid var(--color-navy-600);">
                <span class="metric-title">Promedio de Cuadernos</span>
                <div class="metric-value highlight-navy">${pctLogro >= 85 ? '18.5 (AD)' : '16.0 (A)'}</div>
                <span class="metric-trend up" style="font-size: 11px;">${pctLogro >= 85 ? 'Logro Destacado (AD)' : 'Logro Esperado (A)'}</span>
              </div>
            </div>

            <!-- Detalle por Curso y Sellos Oficiales -->
            <div class="card-header" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
              <h3 class="card-title" style="font-size: var(--font-size-base);">
                Detalle de Cuadernos de ${studentName} (${studentGrade})
              </h3>
              <span class="status-badge status-approved">Actualizado al Día</span>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Curso / Asignatura</th>
                    <th>Docente Responsable</th>
                    <th>Último Sello QR</th>
                    <th>Estado del Cuaderno</th>
                    <th>Calificación</th>
                    <th>Observación del Docente</th>
                  </tr>
                </thead>
                <tbody>
                  ${displayNotebooks.map(nb => `
                    <tr style="${nb.status === 'observado' ? 'background: rgba(245,158,11,0.06);' : ''}">
                      <td><strong>${nb.course}</strong></td>
                      <td>${nb.teacher}</td>
                      <td>${nb.lastDate}</td>
                      <td><span class="digital-stamp ${nb.status === 'al_dia' ? 'stamp-al-dia' : 'stamp-observado'}">${nb.statusLabel}</span></td>
                      <td><strong style="color: ${nb.status === 'al_dia' ? '#15803d' : '#b45309'}; font-size: 14px;">${nb.score}</strong></td>
                      <td style="font-size: 12px; color: ${nb.status === 'al_dia' ? 'var(--text-secondary)' : '#92400e'}; ${nb.status === 'observado' ? 'font-weight: 600;' : ''}">${nb.remarks}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div style="margin-top: var(--space-4); padding: 12px; background: rgba(30,58,138,0.05); border-radius: 6px; font-size: 11px; color: var(--color-navy-800); display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              <span><strong>Información Oficial:</strong> Los sellos QR son registrados en tiempo real por el Auxiliar y los Docentes tras escanear el sticker físico adherido al cuaderno. Todo cuaderno observado cuenta con plazo para regularización.</span>
            </div>

          </div>
        </div>
      `;
    }

    // --- VISTA DOCENTE / AUXILIAR / COORDINACIÓN / ADMINISTRADOR ---
    const hasAdminEditPower = state.currentRole === "admin" || state.currentRole === "director" || (state.currentRole === "docente" && state.users.docente && state.users.docente.hasAdminPrivileges);
    const isDocenteOrAdmin = state.currentRole === "docente" || state.currentRole === "auxiliar" || state.currentRole === "admin" || state.currentRole === "director";

    const activeSubTab = state.notebookActiveSubTab || "scanner";
    const selectedGrade = state.selectedNotebookGrade || "4sec";
    const selectedStudentId = state.selectedNotebookStudent || "all";
    const selectedCourseFilter = state.selectedNotebookCourseFilter || "all";

    const enrollments = (window.appStore && typeof window.appStore.getEnrollments === "function") 
      ? window.appStore.getEnrollments() 
      : (state.enrollments || initialData.enrollments);

    const catalogGrades = state.gradesCatalog || initialData.gradesCatalog;
    const boletaCoursesCatalog = (window.appStore && typeof window.appStore.getStudentBoletaCoursesCatalog === "function")
      ? window.appStore.getStudentBoletaCoursesCatalog(selectedGrade)
      : [];
    const stickersData = (window.appStore && typeof window.appStore.getNotebookStickersData === "function")
      ? window.appStore.getNotebookStickersData(selectedGrade, selectedStudentId, selectedCourseFilter)
      : [];

    // Filtrar revisiones para el reporte
    let filteredReviews = reviews;
    if (selectedGrade && selectedGrade !== "all") {
      filteredReviews = filteredReviews.filter(r => (r.grade && r.grade.includes("4")) || r.gradeId === selectedGrade);
    }
    if (selectedCourseFilter && selectedCourseFilter !== "all") {
      filteredReviews = filteredReviews.filter(r => r.course === selectedCourseFilter);
    }

    const alDiaCount = filteredReviews.filter(r => r.status === "Al Día" || r.status === "Excelente" || (r.stampType && r.stampType.includes("al-dia"))).length;
    const observadosCount = filteredReviews.filter(r => r.status === "Observado" || r.status === "Incompleto" || (r.stampType && r.stampType.includes("observado"))).length;
    const noPresentoCount = filteredReviews.filter(r => r.status === "No Presentó" || (r.stampType && r.stampType.includes("no-presento"))).length;
    const totalReviews = filteredReviews.length;
    const pctAlDia = totalReviews > 0 ? Math.round((alDiaCount / totalReviews) * 100) : 100;

    return `
      <div class="fade-in">
        <div class="card" style="margin-bottom: var(--space-6);">
          
          <!-- Encabezado Principal del Módulo -->
          <div class="card-header" style="flex-wrap: wrap; gap: 12px; align-items: center;">
            <div>
              <div style="display:flex; align-items:center; gap: 8px; flex-wrap: wrap;">
                <h2 class="card-title" style="font-size: var(--font-size-xl);">Control y Sellado de Cuadernos Mediante QR</h2>
                <span class="status-badge status-approved" style="background:#10b981; color:white; font-weight:800;">CÁMARA BAJO DEMANDA</span>
                <span class="status-badge status-approved" style="background:#3b82f6; color:white; font-weight:800;">MULTI-DOCENTE EN VIVO</span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                I.E.P. "El Educador" • Escaneo óptico de stickers de cuadernos. <strong>Varios profesores pueden escanear simultáneamente desde sus celulares</strong> sin sobreescritura de datos.
              </p>
            </div>
            
            <!-- Barra de Sub-Pestañas y Botón Conectar Celular -->
            <div style="display:flex; gap: 8px; flex-wrap: wrap; align-items: center;">
              <button class="btn btn-outline btn-sm" onclick="window.app.openMultiDeviceConnectModal()" style="font-weight: 800; color: #1e3a8a; border-color: #3b82f6; background: #eff6ff; border-radius: 18px; padding: 6px 14px;">
                Conectar Celular
              </button>
              <button class="btn btn-sm ${activeSubTab === 'scanner' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setNotebookActiveSubTab('scanner')" style="font-weight: 800;">
                [Cámara] 1. Escáner en Vivo
              </button>
              <button class="btn btn-sm ${activeSubTab === 'stickers' ? 'btn-gold' : 'btn-outline'}" onclick="window.app.setNotebookActiveSubTab('stickers')" style="font-weight: 800;">
                2. Plancha de Stickers QR
              </button>
              <button class="btn btn-sm ${activeSubTab === 'report' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setNotebookActiveSubTab('report')" style="font-weight: 800;">
                3. Informe de Supervisión
              </button>
            </div>
          </div>

          <!-- =================================================================== -->
          <!-- SUB-PESTAÑA 1: ESCÁNER EN VIVO Y CÁMARA PARA CUADERNOS -->
          <!-- =================================================================== -->
          ${activeSubTab === 'scanner' ? `
            
            <!-- Banner de Escaneo Protegido Bajo Demanda y Multi-Dispositivo -->
            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1.5px solid #93c5fd; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 26px;">️</span>
                <div>
                  <div style="font-size: 13px; font-weight: 900; color: #1e3a8a;">
                    Modo Bajo Demanda & Concurrencia Multi-Dispositivo
                  </div>
                  <div style="font-size: 11.5px; color: #334155;">
                    La cámara solo se activa cuando presionas <strong>Encender Cámara</strong> para ahorrar batería y evitar lecturas accidentales. Los sellos de todos los docentes se combinan en tiempo real.
                  </div>
                </div>
              </div>
              <button class="btn btn-navy btn-sm" onclick="window.app.openMultiDeviceConnectModal()" style="font-weight: 800; border-radius: 16px; font-size: 11.5px; box-shadow: 0 4px 10px rgba(15,23,42,0.15);">
                📲 Abrir QR para mi Celular
              </button>
            </div>

            <div class="dashboard-grid" style="margin-bottom: var(--space-6); align-items: stretch;">
              
              <!-- Visor de Cámara Real para Celulares / PC -->
              <div class="card" style="background: var(--color-navy-950); color: white; border: 2px solid var(--color-yellow-500); padding: var(--space-4); display:flex; flex-direction:column; align-items:center;">
                <div style="display:flex; justify-content:space-between; width:100%; align-items:center; margin-bottom: 8px;">
                  <span style="font-size:12px; font-weight:800; color:var(--color-yellow-400); letter-spacing:0.05em;">
                    📸 ESCÁNER POR CÁMARA (CELULAR / WEBCAM)
                  </span>
                  <span id="camera-status-tag" class="status-badge status-pending" style="font-size:10px;">
                    Cámara Apagada (En Espera)
                  </span>
                </div>

                <!-- Contenedor del Feed de Video de Html5Qrcode -->
                <div id="qr-live-camera-feed" style="width: 100%; max-width: 320px; min-height: 240px; background: #000; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; border: 1px dashed rgba(255,255,255,0.2);">
                  <div id="camera-placeholder-msg" style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 8px; display:block; color: var(--color-yellow-400);"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    <span style="font-size: 12px; font-weight: 700;">Presiona 'Encender Cámara' para iniciar el escaneo</span>
                  </div>
                </div>

                <!-- Botones de Control de Cámara -->
                <div style="display: flex; gap: 8px; margin-top: 12px; width: 100%; justify-content: center; flex-wrap: wrap;">
                  <button id="btn-start-camera" class="btn btn-gold" onclick="window.app.startLiveCameraScanner()" style="font-weight:800; font-size:13px; border-radius: 20px; padding: 10px 20px;">
                    [Cámara] Encender Cámara
                  </button>
                  <button id="btn-stop-camera" class="btn btn-outline" onclick="window.app.stopLiveCameraScanner()" style="display:none; color:#fca5a5; border-color:rgba(220,38,38,0.4); border-radius: 20px;">
                    ⏹️ Apagar Cámara
                  </button>
                </div>
              </div>

              <!-- Atajos de Búsqueda Rápida / Simulación con Alumno + Curso + Docente -->
              <div class="card" style="background-color: var(--bg-surface-subtle); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                    <h4 style="margin:0; color: var(--color-navy-900); font-weight: 800;">
                      ⚡ Escaneo Rápido de Cuadernos (Demo Directo)
                    </h4>
                    <span class="status-badge status-approved" style="font-size:10px;">Exclusivo por Alumno y Curso</span>
                  </div>
                  <p style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 12px;">
                    Al escanear el QR, el sistema identifica automáticamente al <strong>Alumno, Grado, Curso y Profesor Titular</strong>:
                  </p>

                  <div style="display: flex; flex-direction:column; gap: 6px; margin-bottom: 12px;">
                    <button class="btn btn-outline btn-sm" onclick="window.app.simulateQRScan('QR-NB|EST-2026-042|Sofía Méndez Flores|4° de Secundaria|Matemática Avanzada (Álgebra / Geometría)|Prof. Roberto Silva')" style="justify-content:space-between; display:flex; text-align:left; background: #ffffff; border-radius: 10px; padding: 8px 12px;">
                      <div>
                        <strong style="color:var(--color-navy-900); font-size: 12px;">Sofía Méndez Flores</strong>
                        <div style="font-size: 10.5px; color: #047857;">Matemática Avanzada • Docente: Prof. Roberto Silva</div>
                      </div>
                      <span class="status-badge status-approved" style="font-size: 10px;">Evaluar</span>
                    </button>

                    <button class="btn btn-outline btn-sm" onclick="window.app.simulateQRScan('QR-NB|EST-2026-042|Sofía Méndez Flores|4° de Secundaria|Comunicación & Literatura|Miss María Daysi Reyes Milla')" style="justify-content:space-between; display:flex; text-align:left; background: #ffffff; border-radius: 10px; padding: 8px 12px;">
                      <div>
                        <strong style="color:var(--color-navy-900); font-size: 12px;">Sofía Méndez Flores</strong>
                        <div style="font-size: 10.5px; color: #1e3a8a;">Comunicación & Literatura • Docente: Miss María Daysi Reyes</div>
                      </div>
                      <span class="status-badge status-approved" style="font-size: 10px;">Evaluar</span>
                    </button>

                    <button class="btn btn-outline btn-sm" onclick="window.app.simulateQRScan('QR-NB|EST-2026-055|Gael Alessandro Cáceres|4° de Secundaria|Ciencia y Tecnología (Física / Química)|Miss Leyli Graciela Reyes Cerquen')" style="justify-content:space-between; display:flex; text-align:left; background: #ffffff; border-radius: 10px; padding: 8px 12px;">
                      <div>
                        <strong style="color:var(--color-navy-900); font-size: 12px;">🔬 Gael Alessandro Cáceres</strong>
                        <div style="font-size: 10.5px; color: #b45309;">Ciencia y Tecnología • Docente: Miss Leyli Reyes</div>
                      </div>
                      <span class="status-badge status-approved" style="font-size: 10px;">Evaluar</span>
                    </button>

                    <button class="btn btn-outline btn-sm" onclick="window.app.simulateQRScan('QR-NB|EST-2026-089|Marina del Carmen Albújar|4° de Secundaria|Ciencias Sociales & Historia|Prof. Javier Vega')" style="justify-content:space-between; display:flex; text-align:left; background: #ffffff; border-radius: 10px; padding: 8px 12px;">
                      <div>
                        <strong style="color:var(--color-navy-900); font-size: 12px;">🌎 Marina del Carmen Albújar</strong>
                        <div style="font-size: 10.5px; color: #6b21a8;">Ciencias Sociales • Docente: Prof. Javier Vega</div>
                      </div>
                      <span class="status-badge status-approved" style="font-size: 10px;">Evaluar</span>
                    </button>
                  </div>
                </div>

                <div style="border-top: 1px solid #e2e8f0; padding-top: 10px;">
                  <label class="form-label" style="font-size: 11px; font-weight: 700;">Ingreso Manual de Código QR:</label>
                  <div style="display:flex; gap: 8px;">
                    <input type="text" id="manual-qr-input" class="form-control" value="QR-NB|EST-2026-042|Sofía Méndez Flores|4° de Secundaria|Matemática Avanzada (Álgebra / Geometría)|Prof. Roberto Silva" style="font-size: 11.5px; border-radius: 16px;" />
                    <button class="btn btn-navy btn-sm" onclick="window.app.simulateQRScan(document.getElementById('manual-qr-input').value)" style="border-radius: 16px; font-weight: 800;">
                      Revisar
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <!-- Tabla de Revisiones Recientes del Día -->
            <div class="card-header" style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle);">
              <h3 class="card-title" style="font-size: var(--font-size-base);">
                📑 Últimos Cuadernos Sellados en este Turno
              </h3>
              <span class="status-badge status-approved">${reviews.length} Evaluados</span>
            </div>

            <div class="table-container">
              <table class="data-table" style="font-size: 12.5px;">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Estudiante</th>
                    <th>Grado</th>
                    <th>Curso / Asignatura</th>
                    <th>Docente Titular</th>
                    <th>Evaluado Por</th>
                    <th>Sello Digital</th>
                    <th>Nota</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${reviews.map(r => `
                    <tr>
                      <td><code>${r.date} ${r.time || ''}</code></td>
                      <td><strong>${r.studentName}</strong></td>
                      <td><span class="status-badge status-pending" style="font-size: 10px;">${r.grade}</span></td>
                      <td><strong>${r.course}</strong></td>
                      <td>${r.teacher || 'Prof. Roberto Silva'}</td>
                      <td><span style="color:#047857; font-weight:700; font-size:11px;">${r.evaluator || 'Auxiliar de Educación'}</span></td>
                      <td><span class="digital-stamp ${r.stampType}">${r.stampText}</span></td>
                      <td><strong style="font-size:14px; color:${r.score >= 15 ? '#15803d' : '#b45309'};">${r.score}</strong></td>
                      <td style="font-size:11.5px; color:var(--text-secondary); max-width: 200px;">${r.teacherRemarks}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- =================================================================== -->
          <!-- SUB-PESTAÑA 2: GENERADOR DE STICKERS QR PARA CUADERNOS -->
          <!-- =================================================================== -->
          ${activeSubTab === 'stickers' ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 12px; margin-bottom: 16px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h3 style="font-size: 16px; font-weight: 800; color: var(--color-navy-900); margin: 0;">
                      Planchas de Stickers QR Exclusivos por Estudiante y Curso
                    </h3>
                    <span class="status-badge status-approved" style="font-size: 10.5px; font-weight: 800;">Boleta Oficial 2026</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-secondary); margin: 4px 0 0 0;">
                    Genera stickers individuales o la <strong>plancha completa con los 22 cursos curriculares</strong> de la boleta de notas.
                  </p>
                </div>
                
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <!-- BOTÓN PRINCIPAL SOLICITADO: GENERAR QR AUTOMÁTICO POR ESTUDIANTE CON TODOS LOS CURSOS DE LA BOLETA -->
                  <button class="btn btn-gold btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('${selectedStudentId !== 'all' ? selectedStudentId : 'EST-2026-042'}')" style="font-weight: 900; padding: 10px 18px; border-radius: 20px; font-size: 13px; box-shadow: 0 4px 14px rgba(245,158,11,0.4); background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0b132b; display: flex; align-items: center; gap: 6px;">
                    <span>⚡</span> <span>Generar QR por Estudiante (Todos los Cursos de Boleta)</span>
                  </button>
                  <button class="btn btn-navy btn-sm" onclick="window.app.printNotebookStickerSheet()" style="font-weight: 800; padding: 10px 16px; border-radius: 20px; font-size: 12.5px;">
                    Imprimir Selección A4 (15 QR / Hoja)
                  </button>
                </div>
              </div>

              <!-- Filtros para la Generación de Stickers y Selección de Formato -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; background: #ffffff; padding: 12px; border-radius: 10px; border: 1px solid #cbd5e1;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 700; color: #1e3a8a;">1. Grado Escolar:</label>
                  <select id="sticker-grade-select" class="form-control" onchange="window.app.onNotebookGradeFilterChange(this.value)" style="font-size: 12px; font-weight: bold;">
                    ${catalogGrades.map(g => `<option value="${g.id}" ${selectedGrade === g.id ? 'selected' : ''}>${g.label} (${g.level})</option>`).join('')}
                  </select>
                </div>

                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 700; color: #1e3a8a;">2. Filtrar por Estudiante:</label>
                  <select id="sticker-student-select" class="form-control" onchange="window.app.onNotebookStudentFilterChange(this.value)" style="font-size: 12px; font-weight: bold;">
                    <option value="all">-- Todos los Alumnos del Grado --</option>
                    ${enrollments.filter(e => e.gradeId === selectedGrade || !selectedGrade).map(e => `
                      <option value="${e.studentCode || e.dni}" ${selectedStudentId === (e.studentCode || e.dni) ? 'selected' : ''}>
                        ${e.studentName} (${e.studentCode || e.dni})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 700; color: #1e3a8a;">3. Curso de Boleta Oficial:</label>
                  <select id="sticker-course-select" class="form-control" onchange="window.app.onNotebookCourseFilterChange(this.value)" style="font-size: 12px; font-weight: bold;">
                    <option value="all">-- Todos los Cursos de Boleta (${boletaCoursesCatalog.length}) --</option>
                    ${boletaCoursesCatalog.map(c => `
                      <option value="${c.id}" ${selectedCourseFilter === c.id ? 'selected' : ''}>
                        ${c.icon || '📚'} ${c.name} (${c.teacher})
                      </option>
                    `).join('')}
                  </select>
                </div>

                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size: 11px; font-weight: 700; color: #1e3a8a;">4. Distribución por Hoja A4:</label>
                  <select id="sticker-layout-select" class="form-control" style="font-size: 12px; font-weight: 800; background: #eff6ff; border: 1.5px solid #3b82f6; color: #1e3a8a;">
                    <option value="3x5" selected>3 × 5 (15 QR por Hoja)</option>
                    <option value="3x4">3 × 4 (12 QR por Hoja)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Grilla de Stickers de Cuadernos (Cursos Oficiales de Boleta) -->
            <div id="printable-stickers-sheet" class="qr-sticker-sheet" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
              ${stickersData.map(st => {
                const safePayload = st.qrPayload.replace(/'/g, "\\'");
                return `
                  <div class="qr-notebook-sticker" style="border: 2px solid #0f172a; border-radius: 10px; padding: 12px; background: #ffffff; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative; border-left: 6px solid #f59e0b;">
                    <div style="flex-shrink: 0; text-align: center; width: 75px;">
                      <div style="width: 75px; height: 75px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px; background: white; margin: 0 auto;">
                        ${Components.generateQRSVG(st.qrPayload, 140)}
                      </div>
                      <span style="font-size: 8px; font-weight: 800; color: #475569; display: block; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><code>${st.qrCode}</code></span>
                    </div>
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 8.5px; font-weight: 900; color: #dc2626; letter-spacing: 0.05em; text-transform: uppercase;">
                          ★ I.E.P. EL EDUCADOR • SJL
                        </span>
                        <span class="status-badge" style="font-size: 8px; padding: 1px 4px; font-weight: 800; background: #eff6ff; color: #1e40af;">
                          ${st.area || 'Oficial'}
                        </span>
                      </div>
                      <strong style="font-size: 13px; color: #0f172a; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${st.course}">
                        ${st.icon || '📚'} ${st.course}
                      </strong>
                      <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${st.studentName}
                      </div>
                      <div style="font-size: 10px; color: #475569;">
                        ${st.grade} • Código: <code>${st.studentCode}</code>
                      </div>
                      <div style="font-size: 9.5px; color: #047857; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${st.teacher}
                      </div>
                      <div style="margin-top: 6px; display: flex; gap: 4px;">
                        <button class="btn btn-outline btn-sm" onclick="window.app.simulateQRScan('${safePayload}')" style="font-size: 9.5px; padding: 2px 7px; border-radius: 12px; font-weight: 800;">
                          [Cámara] Probar Escaneo
                        </button>
                        <button class="btn btn-gold btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('${st.studentCode}')" style="font-size: 9.5px; padding: 2px 7px; border-radius: 12px; font-weight: 800;">
                          Plancha Alumno
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : ''}

          <!-- =================================================================== -->
          <!-- SUB-PESTAÑA 3: INFORME DE SUPERVISIÓN Y SELLADO DE CUADERNOS -->
          <!-- =================================================================== -->
          ${activeSubTab === 'report' ? `
            <div style="margin-bottom: 20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap: 12px; margin-bottom: 16px;">
                <div>
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--color-navy-900); margin: 0 0 4px 0;">
                    Informe General de Cuadernos Revisados & Sellos Otorgados
                  </h3>
                  <p style="font-size: 12px; color: var(--text-secondary); margin: 0;">
                    Consolidado de cumplimiento de tareas, cuadernos observados y sellos otorgados por el Auxiliar y Docentes.
                  </p>
                </div>
                
                <button class="btn btn-navy btn-sm" onclick="window.app.printNotebookGeneralReport()" style="font-weight: 800; padding: 8px 16px; border-radius: 18px;">
                  Imprimir Informe Oficial PDF
                </button>
              </div>

              <!-- Tarjetas de Métricas del Informe -->
              <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 16px;">
                <div class="card metric-card" style="border-top: 4px solid #10b981;">
                  <span class="metric-title">Cuadernos al Día</span>
                  <div class="metric-value highlight-green">${alDiaCount}</div>
                  <span class="metric-trend up" style="font-size: 11px;">${pctAlDia}% de Cumplimiento</span>
                </div>
                <div class="card metric-card" style="border-top: 4px solid #f59e0b;">
                  <span class="metric-title">Cuadernos Observados</span>
                  <div class="metric-value highlight-yellow">${observadosCount}</div>
                  <span class="metric-trend" style="font-size: 11px; color: #b45309;">Requieren Regularización</span>
                </div>
                <div class="card metric-card" style="border-top: 4px solid #ef4444;">
                  <span class="metric-title">No Presentados</span>
                  <div class="metric-value highlight-red">${noPresentoCount}</div>
                  <span class="metric-trend" style="font-size: 11px; color: #dc2626;">Amonestación / Citación</span>
                </div>
                <div class="card metric-card" style="border-top: 4px solid var(--color-navy-800);">
                  <span class="metric-title">Total Evaluaciones</span>
                  <div class="metric-value highlight-navy">${totalReviews}</div>
                  <span class="metric-trend" style="font-size: 11px;">Registros en Servidor</span>
                </div>
              </div>

              <!-- Filtro de Búsqueda en el Informe -->
              <div style="display:flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <label class="form-label" style="font-size: 11px;">Filtrar por Asignatura:</label>
                  <select class="form-control" onchange="window.app.onNotebookCourseFilterChange(this.value)" style="font-size: 12px;">
                    <option value="all">-- Todos los Cursos --</option>
                    <option value="Matemática Avanzada" ${selectedCourseFilter === 'Matemática Avanzada' ? 'selected' : ''}>Matemática Avanzada (Prof. Roberto Silva)</option>
                    <option value="Comunicación & Literatura" ${selectedCourseFilter === 'Comunicación & Literatura' ? 'selected' : ''}>Comunicación & Literatura (Miss María Daysi Reyes)</option>
                    <option value="Ciencia y Tecnología" ${selectedCourseFilter === 'Ciencia y Tecnología' ? 'selected' : ''}>Ciencia y Tecnología (Miss Leyli Reyes)</option>
                    <option value="Ciencias Sociales" ${selectedCourseFilter === 'Ciencias Sociales' ? 'selected' : ''}>Ciencias Sociales (Prof. Javier Vega)</option>
                    <option value="Inglés Institucional" ${selectedCourseFilter === 'Inglés Institucional' ? 'selected' : ''}>Inglés Institucional (Miss Andrea Ramos)</option>
                    <option value="EPT (Computación)" ${selectedCourseFilter === 'EPT (Computación)' ? 'selected' : ''}>EPT (Computación) (Prof. Fernando Rojas)</option>
                  </select>
                </div>
              </div>

              <!-- Matriz Resumen de Cuadernos por Alumno del Aula -->
              <div class="card" style="margin-bottom: 16px; background: #ffffff; border: 1px solid #cbd5e1; padding: 14px; border-radius: 10px;">
                <h4 style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin: 0 0 10px 0;">
                  Matriz de Estado de Cuadernos por Estudiante (4° de Secundaria "A")
                </h4>
                <div class="table-container">
                  <table class="data-table" style="font-size: 11.5px;">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Matemática</th>
                        <th>Comunicación</th>
                        <th>Ciencias</th>
                        <th>Sociales</th>
                        <th>Inglés</th>
                        <th>Cómputo</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${enrollments.slice(0, 6).map(st => {
                        const getCourseStatusBadge = (crsKeyword) => {
                          const rev = reviews.find(r => r.studentName === st.studentName && r.course.toLowerCase().includes(crsKeyword.toLowerCase()));
                          if (rev) {
                            return `<span class="digital-stamp ${rev.stampType}" style="font-size: 9.5px; padding: 2px 6px;">${rev.status} (${rev.score})</span>`;
                          }
                          return `<span style="color: #94a3b8; font-size: 10px;">⚪ Pendiente</span>`;
                        };

                        return `
                          <tr>
                            <td><strong>${st.studentName}</strong></td>
                            <td>${getCourseStatusBadge("mat")}</td>
                            <td>${getCourseStatusBadge("com")}</td>
                            <td>${getCourseStatusBadge("cien")}</td>
                            <td>${getCourseStatusBadge("soc")}</td>
                            <td>${getCourseStatusBadge("ing")}</td>
                            <td>${getCourseStatusBadge("comp")}</td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Tabla del Informe Consolidado -->
              <div class="table-container">
                <table class="data-table" style="font-size: 12px;">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estudiante</th>
                      <th>Grado</th>
                      <th>Curso</th>
                      <th>Docente Asignado</th>
                      <th>Evaluador</th>
                      <th>Estado / Sello</th>
                      <th>Nota</th>
                      <th>Observaciones</th>
                      <th style="text-align: right;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredReviews.map(r => `
                      <tr>
                        <td><code>${r.date}</code></td>
                        <td><strong>${r.studentName}</strong></td>
                        <td><span class="status-badge status-pending" style="font-size: 10px;">${r.grade}</span></td>
                        <td><strong>${r.course}</strong></td>
                        <td>${r.teacher || 'Prof. Titular'}</td>
                        <td><span style="color:#047857; font-weight:700;">${r.evaluator || 'Auxiliar'}</span></td>
                        <td><span class="digital-stamp ${r.stampType}">${r.stampText}</span></td>
                        <td><strong style="font-size:14px; color:${r.score >= 15 ? '#15803d' : '#b45309'};">${r.score}</strong></td>
                        <td style="font-size:11.5px; color:var(--text-secondary);">${r.teacherRemarks}</td>
                        <td style="text-align: right;">
                          <button class="btn btn-outline btn-sm" onclick="window.app.openEditReviewModal('${r.id}')" style="font-size: 11px; padding: 4px 8px;">
                            ✏️ Editar
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

            </div>
          ` : ''}

        </div>
      </div>
    `;
  },

  // Base de Datos
  renderDatabaseManagement(state) {
    const usersCount = (state.systemUsers || initialData.systemUsers || []).filter(u => !u._deleted).length;
    const enrollmentsCount = (state.enrollments || initialData.enrollments || []).filter(e => !e._deleted).length;
    const reviewsCount = (state.notebookReviews || initialData.notebookReviews).length;
    const coursesCount = (state.courses || initialData.courses).length;
    const announcementsCount = (state.announcements || initialData.announcements).length;

    return `
      <div class="fade-in">
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 class="card-title" style="font-size: var(--font-size-xl);">🗄️ Motor de Base de Datos y Persistencia - I.E.P. "El Educador"</h2>
                <span class="status-badge status-approved"><span class='status-dot-green'></span> Motor Activo (db.json)</span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                S.J.L. • UGEL 05 • Sincronización multi-dispositivo en tiempo real y copias de seguridad garantizadas.
              </p>
            </div>
            <div style="display: flex; gap: var(--space-2);">
              <a href="/api/backup" download="backup_colegio_educador.json" class="btn btn-navy btn-sm" style="text-decoration:none;">
                Descargar Backup (.JSON)
              </a>
              <button class="btn btn-gold btn-sm" onclick="window.app.showSQLSchemaModal()">
                Ver Esquema SQL (.SQL)
              </button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
            <div class="card" style="padding: var(--space-4); border-left: 4px solid var(--color-green-500); background: #f8faf9;">
              <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Estado de Sincronización</span>
              <div style="font-size: 18px; font-weight: 800; color: var(--color-green-600); margin-top: 2px;"><span class='status-dot-green'></span> Multi-Dispositivo OK</div>
              <span style="font-size: 10px; color: var(--text-muted);">Sincronización en vivo</span>
            </div>

            <div class="card" style="padding: var(--space-4); border-left: 4px solid var(--color-navy-700); background: var(--bg-surface-subtle);">
              <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Almacenamiento en Disco</span>
              <div style="font-size: 18px; font-weight: 800; color: var(--color-navy-900); margin-top: 2px;">db.json (Permanente)</div>
              <span style="font-size: 10px; color: var(--text-muted);">Servidor I.E.P. El Educador</span>
            </div>

            <div class="card" style="padding: var(--space-4); border-left: 4px solid var(--color-red-500); background: #fffdfd;">
              <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Total Registros en Tablas</span>
              <div style="font-size: 18px; font-weight: 800; color: var(--color-red-600); margin-top: 2px;">${usersCount + enrollmentsCount + reviewsCount + coursesCount + announcementsCount} Registros</div>
              <span style="font-size: 10px; color: var(--text-muted);">Tablas relacionales activas</span>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Tabla</th><th>Descripción</th><th>Persistencia</th><th style="text-align:center;">Registros</th><th>Estado</th></tr></thead>
              <tbody>
                <tr><td><code>tb_usuarios</code></td><td>Docentes, Personal, Alumnos y Padres</td><td>Servidor (db.json)</td><td style="text-align:center;"><strong>${usersCount}</strong></td><td><span class="status-badge status-approved">Al Día</span></td></tr>
                <tr><td><code>tb_matriculas</code></td><td>Expedientes y Seguimiento UGEL 05</td><td>Servidor (db.json)</td><td style="text-align:center;"><strong>${enrollmentsCount}</strong></td><td><span class="status-badge status-approved">Al Día</span></td></tr>
                <tr><td><code>tb_cuadernos_qr</code></td><td>Revisiones y sellos ópticos QR</td><td>Servidor (db.json)</td><td style="text-align:center;"><strong>${reviewsCount}</strong></td><td><span class="status-badge status-approved">Al Día</span></td></tr>
                <tr><td><code>tb_calificaciones</code></td><td>Notas y Actas Oficiales 2026</td><td>Servidor (db.json)</td><td style="text-align:center;"><strong>${coursesCount}</strong></td><td><span class="status-badge status-approved">Al Día</span></td></tr>
                <tr><td><code>tb_pensiones</code></td><td>Recaudación acumulada (S/ 25,130.00)</td><td>Servidor (db.json)</td><td style="text-align:center;"><strong>${state.payments.length}</strong></td><td><span class="status-badge status-approved">Al Día</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // Gestión Integral de Usuarios, Perfiles y Configuración de Pestañas (Administrador)
  renderUserAndEnrollmentManagement(state) {
    const role = state.currentRole;
    if (role !== "admin" && role !== "director") {
      return `
        <div class="fade-in card" style="padding: 50px 20px; text-align: center; max-width: 600px; margin: 40px auto; border-top: 4px solid var(--color-red-600);">
          <div style="font-size: 48px; margin-bottom: 12px;">🔒</div>
          <h2 style="font-size: 18px; font-weight: 900; color: var(--color-navy-900); margin-bottom: 8px;">
            Módulo Exclusivo de Administración y Dirección
          </h2>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
            Solo el personal directivo o de administración general tiene autorización para crear, editar o eliminar usuarios y expedientes de matrícula.
          </p>
          <button class="btn btn-navy" onclick="window.app.navigate('dashboard')" style="font-weight: 800; padding: 10px 24px;">
            Volver al Inicio
          </button>
        </div>
      `;
    }

    const allUsers = (state.systemUsers || initialData.systemUsers || []).filter(u => !u._deleted);
    const enrollments = (state.enrollments || initialData.enrollments || []).filter(e => !e._deleted);
    const activeTab = state.usersManagementTab || "users";
    const roleFilter = state.usersRoleFilter || "all";
    const navConfigs = state.navigationTabsConfig || initialData.navigationTabsConfig || {};

    // Filtrar usuarios por rol
    const filteredUsers = allUsers.filter(u => {
      if (roleFilter === "all") return true;
      if (roleFilter === "directivo") return u.role === "Directivo" || u.role === "Administrador" || u.role === "Director";
      if (roleFilter === "docente") return u.role === "Docente" || u.role === "Profesor";
      if (roleFilter === "estudiante") return u.role === "Estudiante" || u.role === "Alumno";
      if (roleFilter === "apoderado") return u.role === "Apoderado" || u.role === "Padre";
      return true;
    });

    const directivosCount = allUsers.filter(u => u.role === "Directivo" || u.role === "Administrador" || u.role === "Director").length;
    const docentesCount = allUsers.filter(u => u.role === "Docente" || u.role === "Profesor").length;
    const estudiantesCount = allUsers.filter(u => u.role === "Estudiante" || u.role === "Alumno").length;
    const apoderadosCount = allUsers.filter(u => u.role === "Apoderado" || u.role === "Padre").length;

    // Rol activo para el editor de pestañas
    const targetNavRole = state.selectedNavConfigRole || "docente";
    const currentRoleTabs = navConfigs[targetNavRole] || initialData.navigationTabsConfig[targetNavRole] || [];

    return `
      <div class="fade-in">
        <div class="card" style="margin-bottom: var(--space-6);">
          
          <!-- Encabezado Principal del Módulo -->
          <div class="card-header" style="flex-wrap: wrap; gap: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 class="card-title" style="font-size: var(--font-size-xl); margin: 0; color: var(--color-navy-900);">
                  👥 Centro de Control de Cuentas, Perfiles & Pestañas
                </h2>
                <span class="status-badge status-approved" style="background: #e0e7ff; color: #3730a3; font-weight: 800;">
                  ★ Módulo Exclusivo Administrador
                </span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                I.E.P. "El Educador" • UGEL 05 • Creación de cuentas institucionales, asignación de roles y control de menús visibles.
              </p>
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-gold btn-sm" onclick="window.app.openAdminAddStudentWithParentModal()" style="font-weight: 800; display: flex; align-items: center; gap: 6px; padding: 8px 14px;">
                <span>➕</span> Matricular Estudiante & Apoderado
              </button>
              <button class="btn btn-navy btn-sm" onclick="window.app.openCreateUserModal()" style="font-weight: 800; display: flex; align-items: center; gap: 6px; padding: 8px 14px;">
                <span>👤</span> Crear Usuario Manual
              </button>
            </div>
          </div>

          <!-- Métricas Resumen de Cuentas -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 16px 0;">
            <div class="card" style="padding: 10px 14px; border-left: 4px solid var(--color-navy-700); background: #f8fafc;">
              <span style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Usuarios</span>
              <div style="font-size: 20px; font-weight: 900; color: var(--color-navy-950); margin-top: 2px;">${allUsers.length}</div>
            </div>
            <div class="card" style="padding: 10px 14px; border-left: 4px solid #8b5cf6; background: #faf5ff;">
              <span style="font-size: 10.5px; font-weight: 700; color: #6b21a8; text-transform: uppercase;">Directivos</span>
              <div style="font-size: 20px; font-weight: 900; color: #581c87; margin-top: 2px;">${directivosCount}</div>
            </div>
            <div class="card" style="padding: 10px 14px; border-left: 4px solid #3b82f6; background: #eff6ff;">
              <span style="font-size: 10.5px; font-weight: 700; color: #1e40af; text-transform: uppercase;">Docentes</span>
              <div style="font-size: 20px; font-weight: 900; color: #1e3a8a; margin-top: 2px;">${docentesCount}</div>
            </div>
            <div class="card" style="padding: 10px 14px; border-left: 4px solid #10b981; background: #ecfdf5;">
              <span style="font-size: 10.5px; font-weight: 700; color: #047857; text-transform: uppercase;">Estudiantes</span>
              <div style="font-size: 20px; font-weight: 900; color: #065f46; margin-top: 2px;">${estudiantesCount}</div>
            </div>
            <div class="card" style="padding: 10px 14px; border-left: 4px solid #f59e0b; background: #fffbeb;">
              <span style="font-size: 10.5px; font-weight: 700; color: #b45309; text-transform: uppercase;">Apoderados</span>
              <div style="font-size: 20px; font-weight: 900; color: #92400e; margin-top: 2px;">${apoderadosCount}</div>
            </div>
          </div>

          <!-- Pestañas de Navegación del Módulo -->
          <div style="display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 16px; flex-wrap: wrap;">
            <button class="btn ${activeTab === 'users' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserManagementTab('users')" style="font-weight: 800; font-size: 12.5px;">
              👥 Directorio de Cuentas & Perfiles (${allUsers.length})
            </button>
            <button class="btn ${activeTab === 'tabs' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserManagementTab('tabs')" style="font-weight: 800; font-size: 12.5px;">
              ⚙️ Editor de Pestañas & Menús por Perfil
            </button>
          </div>

          <!-- =========================================================================
               VISTA 1: DIRECTORIO DE CUENTAS Y PERFILES
               ========================================================================= -->
          ${activeTab === 'users' ? `
            <div>
              <!-- Barra de Filtros por Rol y Búsqueda -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                  <span style="font-size: 12px; font-weight: 800; color: #334155;">Filtrar Rol:</span>
                  <button class="btn btn-sm ${roleFilter === 'all' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserRoleFilter('all')">Todos (${allUsers.length})</button>
                  <button class="btn btn-sm ${roleFilter === 'directivo' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserRoleFilter('directivo')">Directivos (${directivosCount})</button>
                  <button class="btn btn-sm ${roleFilter === 'docente' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserRoleFilter('docente')">Docentes (${docentesCount})</button>
                  <button class="btn btn-sm ${roleFilter === 'estudiante' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserRoleFilter('estudiante')">Estudiantes (${estudiantesCount})</button>
                  <button class="btn btn-sm ${roleFilter === 'apoderado' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setUserRoleFilter('apoderado')">Apoderados (${apoderadosCount})</button>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  <input type="text" id="user-search-input" class="form-control" placeholder="Buscar por nombre, usuario, DNI..." oninput="window.app.onUserSearchFilter(this.value)" style="font-size: 12px; padding: 5px 12px; width: 220px;" />
                </div>
              </div>

              <!-- Tabla de Usuarios Registrados -->
              <div class="table-container">
                <table class="data-table" id="users-table-list">
                  <thead>
                    <tr>
                      <th style="width: 140px;">Código / Usuario</th>
                      <th>Nombre & Correo</th>
                      <th>Perfil / Rol</th>
                      <th>Contraseña</th>
                      <th>Especialidad / Grado / Vínculo</th>
                      <th>Privilegios</th>
                      <th style="text-align: center; width: 140px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filteredUsers.map(u => {
                      const isDocente = u.role === "Docente" || u.role === "Profesor";
                      const isDirectivo = u.role === "Directivo" || u.role === "Administrador" || u.role === "Director";
                      const isEstudiante = u.role === "Estudiante" || u.role === "Alumno";
                      const isApoderado = u.role === "Apoderado" || u.role === "Padre";
                      
                      const roleBadgeClass = isDirectivo ? "background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe;" :
                                             isDocente ? "background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;" :
                                             isEstudiante ? "background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;" :
                                             "background: #fffbeb; color: #b45309; border: 1px solid #fde68a;";
                      
                      const roleEmoji = isDirectivo ? "️" : isDocente ? "👨‍" : isEstudiante ? "🎒" : "👨‍👩‍👧";

                      return `
                        <tr>
                          <td>
                            <code style="font-weight: 800; color: var(--color-navy-900);">${u.code || u.id}</code><br>
                            <span style="font-size: 11px; font-weight: 700; color: #2563eb;">@${u.username || 'usuario'}</span>
                          </td>
                          <td>
                            <strong>${u.name}</strong><br>
                            <span style="font-size: 11px; color: var(--text-secondary);">${u.email || '--'}</span>
                          </td>
                          <td>
                            <span class="status-badge" style="${roleBadgeClass} font-size: 11px; font-weight: 800; padding: 3px 8px;">
                              ${roleEmoji} ${u.role}
                            </span>
                          </td>
                          <td>
                            <div style="display: flex; align-items: center; gap: 6px;">
                              <code id="pass-field-${u.id}" style="background: #f1f5f9; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; color: #0b132b; border: 1px solid #cbd5e1;">${u.password || 'educador2026'}</code>
                            </div>
                          </td>
                          <td>
                            <div style="font-size: 12px; line-height: 1.35;">
                              ${isApoderado ? `
                                <strong>👨‍👧 ${u.detail || ('Apoderado de ' + (u.studentName || '--'))}</strong>
                                ${u.studentName ? `<br><span style="font-size: 11px; color: #1e40af; font-weight: 600;">Hijo(a): ${u.studentName}</span>` : ''}
                                ${u.phone ? `<br><span style="font-size: 11px; color: #16a34a; font-weight: bold;">📞 ${u.phone}</span>` : ''}
                              ` : isEstudiante ? `
                                <strong>🎒 ${u.grade || u.detail || u.gradeLevel || '--'}</strong>
                                ${u.guardian ? `<br><span style="font-size: 11px; color: #64748b;">Apoderado: ${u.guardian}</span>` : ''}
                                ${u.phone ? `<br><span style="font-size: 11px; color: #16a34a;">📞 ${u.phone}</span>` : ''}
                              ` : `
                                <strong>${u.detail || u.subject || '--'}</strong>
                                ${u.weeklyHours ? `<br><span style="font-size: 10.5px; color: #64748b;">⏱️ ${u.weeklyHours}</span>` : ''}
                                ${u.dni ? `<br><span style="font-size: 10.5px; color: #64748b;">🆔 DNI: ${u.dni}</span>` : ''}
                              `}
                            </div>
                          </td>
                          <td>
                            ${isDocente || isDirectivo ? `
                              <span class="status-badge ${u.hasAdminPrivilege ? 'status-approved' : 'status-pending'}" style="${u.hasAdminPrivilege ? 'background:#fef08a; color:#854d0e; font-weight:800;' : ''}">
                                ${u.hasAdminPrivilege ? '★ Permisos Admin' : 'Estándar'}
                              </span>
                            ` : `
                              <span style="font-size: 11px; color: #94a3b8;">--</span>
                            `}
                          </td>
                          <td style="text-align: center; white-space: nowrap;">
                            <div style="display: flex; gap: 4px; justify-content: center;">
                              ${isEstudiante ? `
                                <button class="btn btn-gold btn-sm" onclick="window.app.openStudentQRModal('${u.code || u.id}')" title="Ver Tarjeta QR de Asistencia (Sin Foto)" style="padding: 4px 8px; font-size: 11px; font-weight: bold;">
                                  QR
                                </button>
                              ` : ''}
                              <button class="btn btn-outline btn-sm" onclick="window.app.openEditUserModal('${u.id}')" title="Editar datos y contraseña" style="padding: 4px 8px;">
                                ✏️
                              </button>
                              ${isDocente ? `
                                <button class="btn btn-sm ${u.hasAdminPrivilege ? 'btn-outline' : 'btn-gold'}" onclick="window.app.toggleTeacherAdminPrivilege('${u.id}')" title="${u.hasAdminPrivilege ? 'Revocar Permiso Admin' : 'Conceder Permiso Admin'}" style="padding: 4px 8px; font-size: 11px;">
                                  ${u.hasAdminPrivilege ? '★' : '☆'}
                                </button>
                              ` : ''}
                              <button class="btn btn-outline btn-sm" onclick="window.app.confirmDeleteUser('${u.id}')" title="Eliminar usuario" style="padding: 4px 8px; color: var(--color-red-600);">
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- =========================================================================
               VISTA 2: EDITOR DE PESTAÑAS & MENÚS POR PERFIL
               ========================================================================= -->
          ${activeTab === 'tabs' ? `
            <div>
              <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 14px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                  <div>
                    <h3 style="font-size: 14px; font-weight: 800; color: #1e3a8a; margin: 0 0 4px;">
                      🛠️ Configuración de Pestañas Visibles para Perfiles
                    </h3>
                    <p style="font-size: 12px; color: #1e40af; margin: 0;">
                      Active, desactive o renombre los espacios y accesos directos que cada perfil (Docente, Estudiante, Padre de Familia, Director) puede visualizar en la barra lateral.
                    </p>
                  </div>

                  <div style="display: flex; gap: 8px; align-items: center;">
                    <label style="font-size: 12px; font-weight: 800; color: #1e3a8a;">Perfil a Editar:</label>
                    <select class="form-control" style="width: auto; padding: 4px 12px; font-weight: bold;" onchange="window.app.onSelectNavConfigRole(this.value)">
                      <option value="docente" ${targetNavRole === 'docente' ? 'selected' : ''}>👨‍Panel Docente</option>
                      <option value="estudiante" ${targetNavRole === 'estudiante' ? 'selected' : ''}>🎒 Portal del Estudiante</option>
                      <option value="padre" ${targetNavRole === 'padre' ? 'selected' : ''}>👨‍👩‍👧 Portal de Familias (Apoderados)</option>
                      <option value="director" ${targetNavRole === 'director' ? 'selected' : ''}>Dirección General</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Matriz de Pestañas del Perfil Seleccionado -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; margin-bottom: 18px;">
                ${currentRoleTabs.map(tab => {
                  const isEnabled = tab.enabled !== false;
                  return `
                    <div class="card" style="padding: 14px; border: 1px solid ${isEnabled ? '#cbd5e1' : '#f1f5f9'}; background: ${isEnabled ? '#ffffff' : '#f8fafc'}; opacity: ${isEnabled ? '1' : '0.65'};">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-size: 18px;"></span>
                          <strong style="font-size: 13px; color: var(--color-navy-900);">${tab.id}</strong>
                        </div>
                        
                        <!-- Toggle Switch -->
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; cursor: pointer; color: ${isEnabled ? '#047857' : '#94a3b8'};">
                          <input type="checkbox" ${isEnabled ? 'checked' : ''} onchange="window.app.toggleNavTab('${targetNavRole}', '${tab.id}', this.checked)" />
                          <span>${isEnabled ? '<span class="status-dot-green"></span> VISIBLE' : '⚪ OCULTO'}</span>
                        </label>
                      </div>

                      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
                        <div class="form-group" style="margin-bottom: 0;">
                          <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Etiqueta / Nombre Visible:</label>
                          <input type="text" id="tab-label-${targetNavRole}-${tab.id}" class="form-control" value="${tab.label}" style="font-size: 12px; padding: 4px 8px;" />
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                          <label class="form-label" style="font-size: 11px; margin-bottom: 2px;">Badge (opcional):</label>
                          <input type="text" id="tab-badge-${targetNavRole}-${tab.id}" class="form-control" value="${tab.badge || ''}" placeholder="Ej. 10P, NUEVO" style="font-size: 12px; padding: 4px 8px;" />
                        </div>
                      </div>

                      <div style="margin-top: 8px; text-align: right;">
                        <button class="btn btn-outline btn-sm" onclick="window.app.saveSingleNavTab('${targetNavRole}', '${tab.id}')" style="font-size: 11px; padding: 2px 10px; font-weight: bold;">
                          ✓ Guardar Texto
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Acciones Globales del Editor de Pestañas -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="font-size: 12px; color: #64748b;">
                  * Los cambios de visibilidad y nombres se aplican inmediatamente a todos los usuarios con el rol <strong>${targetNavRole.toUpperCase()}</strong>.
                </span>
                <button class="btn btn-outline btn-sm" onclick="window.app.resetNavTabsToDefault('${targetNavRole}')" style="color: var(--color-red-600); border-color: var(--color-red-200); font-weight: bold;">
                  Restaurar Menús por Defecto
                </button>
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  },

  // Dashboard - Director General
  renderDirectorDashboard(state, user) {
    return `
      <div class="fade-in">
        <div class="welcome-banner" style="background: linear-gradient(135deg, var(--color-navy-950) 0%, var(--color-navy-900) 100%);">
          <div class="welcome-content">
            <h1 class="welcome-title">Dirección General: <span>${user.name}</span></h1>
            <p class="welcome-subtitle">Supervisión pedagógica institucional • I.E.P. "El Educador" (S.J.L. - 21 años dejando huellas).</p>

            <div class="metrics-strip">
              <div class="metric-card-mini"><span class="metric-label">Matrícula Total</span><span class="metric-val highlight-yellow">${user.totalStudents}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Plana Docente</span><span class="metric-val highlight-green">${user.totalTeachers}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Asistencia Promedio</span><span class="metric-val highlight-green">${user.avgAttendance}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Recaudación Agosto</span><span class="metric-val highlight-green">S/ 25,130.00</span></div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="section-column">
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">Muro de Circulares e Informes</h3>
                <button class="btn btn-gold btn-sm" onclick="window.app.showOfficialReportModal()">Ver Informe N° 003</button>
              </div>
              <div class="announcement-list">
                ${state.announcements.map(a => `
                  <div class="announcement-card ${a.priority === 'high' ? 'priority-high' : ''}">
                    <div class="announcement-meta"><span class="announcement-tag tag-urgent">${a.tagLabel}</span><span class="announcement-date">${a.date}</span></div>
                    <h4 class="announcement-title">${a.title}</h4>
                    <p class="announcement-preview">${a.content}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="section-column">
            <div class="card">
              <div class="card-header"><h3 class="card-title">Supervisión Académica</h3></div>
              <div style="display:flex; flex-direction:column; gap: 8px;">
                <button class="btn btn-emerald" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('door-scanner');" style="text-align: left; justify-content: flex-start;">
                  <span>📲</span>
                  <span>Registro de Ingreso & Asistencia QR (Portería)</span>
                </button>
                <button class="btn btn-gold" onclick="window.app.navigate('cuadernos-qr')" style="text-align: left; justify-content: flex-start;">
                  <span>📷</span>
                  <span>[Cámara] Escáner Cuadernos QR</span>
                </button>
                <button class="btn btn-navy" onclick="window.app.navigate('calificaciones')" style="text-align: left; justify-content: flex-start;">
                  <span>📊</span>
                  <span>Registro de Notas Oficiales</span>
                </button>
                <button class="btn btn-navy" onclick="window.app.navigate('horarios')" style="text-align: left; justify-content: flex-start;">
                  <span>📅</span>
                  <span>Horarios Escolares</span>
                </button>
                <button class="btn btn-navy" onclick="window.app.navigate('silabus')" style="text-align: left; justify-content: flex-start;">
                  <span>📑</span>
                  <span>Sílabus Académicos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Dashboard - Docente
  renderTeacherDashboard(state, user) {
    const students = state.studentListDocente;
    const hasAdminPrivilege = !!user.hasAdminPrivileges;

    return `
      <div class="fade-in">
        <div class="welcome-banner" style="background: linear-gradient(135deg, var(--color-navy-900) 0%, #1e293b 100%);">
          <div class="welcome-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              ${hasAdminPrivilege ? `
                <span class="status-badge status-approved" style="background: rgba(245, 158, 11, 0.2); color: var(--color-yellow-400); border: 1px solid var(--color-yellow-500);">
                  ★ PRIVILEGIOS DE EDICIÓN HABILITADOS
                </span>
              ` : `
                <span class="status-badge status-approved">PERFIL DOCENTE</span>
              `}
            </div>
            <h1 class="welcome-title">Panel Docente: <span>${user.name}</span></h1>
            <p class="welcome-subtitle">
              Escaneo óptico de cuadernos con cámara de celular, registro de notas y asistencia.
            </p>

            <div class="metrics-strip">
              <div class="metric-card-mini"><span class="metric-label">Alumnos</span><span class="metric-val highlight-yellow">${user.totalStudents}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Cuadernos Hoy</span><span class="metric-val highlight-green">${user.scannedNotebooksToday || 18}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Pendientes</span><span class="metric-val highlight-red">${user.pendingGrading}</span></div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: var(--space-6); flex-wrap: wrap; align-items: center;">
          <button class="btn btn-emerald" onclick="window.app.navigate('asistencia'); window.app.setAttendanceSubTab('door-scanner');">
            <span>📲</span>
            <span>Registro de Ingreso & Asistencia QR</span>
          </button>
          <button class="btn btn-gold" onclick="window.app.navigate('cuadernos-qr')">
            <span>📷</span>
            <span>[Cámara] Abrir Escáner QR de Cuadernos</span>
          </button>
          <button class="btn btn-navy" onclick="window.app.navigate('calificaciones')">
            <span>✏️</span>
            <span>Registrar Notas</span>
          </button>
          <button class="btn btn-navy" onclick="window.app.navigate('boleta')">
            <span>📄</span>
            <span>Boleta Oficial MINEDU 2026</span>
          </button>
          <button class="btn btn-outline" onclick="window.app.navigate('horarios')">
            <span>📅</span>
            <span>Ver Horario</span>
          </button>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Registro Rápido de Calificaciones - 4to Sec 'A'</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead><tr><th>Código</th><th>Estudiante</th><th>Asistencia</th><th>Cuaderno QR</th><th>Nota 3er Bim</th><th>Acción</th></tr></thead>
              <tbody>
                ${students.map(s => `
                  <tr>
                    <td><code>${s.id}</code></td><td><strong>${s.name}</strong></td><td>${s.attendance}</td>
                    <td><span class="status-badge ${s.notebookStatus && s.notebookStatus.includes('Al Día') ? 'status-approved' : 'status-failed'}">${s.notebookStatus}</span></td>
                    <td><input type="number" min="0" max="20" id="grade-input-${s.id}" value="${s.grade}" style="width: 70px; padding: 4px 8px; font-weight: bold;" /></td>
                    <td><button class="btn btn-navy btn-sm" onclick="window.app.saveStudentGrade('${s.id}')">Guardar</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  // Dashboard - Padre
  renderParentDashboard(state, user) {
    const announcements = state.announcements || initialData.announcements || [];
    const activeUser = user || this.getCurrentUser(state);
    const studentName = activeUser.studentName || "Sofía Méndez Flores";
    const studentGrade = activeUser.detail || "4to de Secundaria 'A'";

    return `
      <div class="fade-in">
        <div class="welcome-banner">
          <div class="welcome-content">
            <h1 class="welcome-title">Portal de Familias: <span>${activeUser.name}</span></h1>
            <p class="welcome-subtitle">I.E.P. "El Educador" (21 años dejando huellas) • Seguimiento académico de <strong>${studentName}</strong> (${studentGrade}).</p>
            <div class="metrics-strip">
              <div class="metric-card-mini"><span class="metric-label">Estudiante</span><span class="metric-val highlight-yellow">${studentName}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Cuadernos QR</span><span class="metric-val highlight-green">5/6 Al Día</span></div>
              <div class="metric-card-mini"><span class="metric-label">Asistencia</span><span class="metric-val highlight-green">98.5%</span></div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
          <div class="card" style="padding: 14px; cursor: pointer; border-left: 4px solid #1e3a8a; background: #eff6ff;" onclick="window.app.navigate('boleta')">
            <h4 style="font-size:14px; color:#1e3a8a; margin:0 0 2px;">📊 Boleta Oficial de Notas</h4>
            <span style="font-size:12px; color:#2563eb; font-weight: bold;">Formato oficial MINEDU e impresión</span>
          </div>
          <div class="card" style="padding: 14px; cursor: pointer; border-left: 4px solid #10b981; background: #f0fdf4;" onclick="window.app.navigate('pagos')">
            <h4 style="font-size:14px; color:#065f46; margin:0 0 2px;">💳 Pensiones & Pagos</h4>
            <span style="font-size:12px; color:#047857;">Estado de cuenta y comprobantes al día</span>
          </div>
          <div class="card" style="padding: 14px; cursor: pointer; border-left: 4px solid var(--color-yellow-500);" onclick="window.app.navigate('horarios')">
            <h4 style="font-size:14px; color:var(--color-navy-900); margin:0 0 2px;">⏰ Horario de Clases</h4>
            <span style="font-size:12px; color:var(--text-muted);">${studentGrade}</span>
          </div>
          <div class="card" style="padding: 14px; cursor: pointer; border-left: 4px solid var(--color-navy-600);" onclick="window.app.navigate('silabus')">
            <h4 style="font-size:14px; color:var(--color-navy-900); margin:0 0 2px;">📚 Sílabus Curriculares</h4>
            <span style="font-size:12px; color:var(--text-muted);">Programación y competencias 2026</span>
          </div>
          <div class="card" style="padding: 14px; cursor: pointer; border-left: 4px solid var(--color-yellow-600);" onclick="window.app.navigate('cuadernos-qr')">
            <h4 style="font-size:14px; color:var(--color-navy-900); margin:0 0 2px;">Cuadernos QR</h4>
            <span style="font-size:12px; color:var(--text-muted);">Sellos y revisiones al día</span>
          </div>
          <div class="card" style="padding: 14px; cursor: pointer; border-left: 4px solid var(--color-red-500);" onclick="window.app.navigate('asistencia')">
            <h4 style="font-size:14px; color:var(--color-navy-900); margin:0 0 2px;">📅 Control de Asistencia</h4>
            <span style="font-size:12px; color:var(--text-muted);">Puntualidad biométrica (98.5%)</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Últimos Informes y Circulares Institucionales</h3>
            <button class="btn btn-outline btn-sm" onclick="window.app.navigate('comunicados')">Ver Todos</button>
          </div>
          <div class="announcement-list">
            ${announcements.map(a => `
              <div class="announcement-card ${a.priority === 'high' ? 'priority-high' : ''}">
                <div class="announcement-meta"><span class="announcement-tag tag-urgent">${a.tagLabel}</span><span class="announcement-date">${a.date}</span></div>
                <h4 class="announcement-title">${a.title}</h4>
                <p class="announcement-preview">${a.content}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // Dashboard - Estudiante
  renderStudentDashboard(state, user) {
    const activeUser = user || this.getCurrentUser(state);
    const userGrade = activeUser.gradeLevel || activeUser.detail || activeUser.grade || "5° de Primaria";
    const courses = state.courses || initialData.courses || [];
    const announcements = state.announcements || initialData.announcements || [];

    return `
      <div class="fade-in">
        <div class="welcome-banner">
          <div class="welcome-content">
            <h1 class="welcome-title">¡Bienvenido(a), <span>${activeUser.name}</span>!</h1>
            <p class="welcome-subtitle">I.E.P. "El Educador" • "21 años dejando huellas" • <strong>${userGrade}</strong>.</p>
            <div class="metrics-strip">
              <div class="metric-card-mini"><span class="metric-label">Grado Escolar</span><span class="metric-val highlight-yellow">${userGrade}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Asistencia</span><span class="metric-val highlight-green">${activeUser.attendanceRate || '100%'}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Cuadernos QR</span><span class="metric-val highlight-green">${activeUser.notebooksUpToDate || 'Al Día'}</span></div>
              <div class="metric-card-mini"><span class="metric-label">Tareas</span><span class="metric-val highlight-red">${activeUser.pendingTasksCount || 0}</span></div>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-3); margin-bottom: var(--space-6);">
          <div class="card" style="padding: 12px; cursor: pointer; border-left: 4px solid #1e3a8a; background: #eff6ff;" onclick="window.app.navigate('boleta')">
            <h4 style="font-size:13px; color: #1e3a8a; margin: 0 0 2px;">📊 Mi Boleta Oficial</h4>
            <span style="font-size:11px; color:#2563eb; font-weight: bold;">Notas y calificaciones MINEDU</span>
          </div>
          <div class="card" style="padding: 12px; cursor: pointer; border-left: 4px solid #10b981; background: #f0fdf4;" onclick="window.app.navigate('asistencia')">
            <h4 style="font-size:13px; color: #065f46; margin: 0 0 2px;">📲 Mi Asistencia & QR</h4>
            <span style="font-size:11px; color:#047857;">Marcaciones y código QR</span>
          </div>
          <div class="card" style="padding: 12px; cursor: pointer; border-left: 4px solid var(--color-yellow-500);" onclick="window.app.navigate('horarios')">
            <h4 style="font-size:13px; margin: 0 0 2px;">📅 Horario de Clases</h4>
            <span style="font-size:11px; color:var(--text-muted);">${userGrade}</span>
          </div>
          <div class="card" style="padding: 12px; cursor: pointer; border-left: 4px solid var(--color-navy-600);" onclick="window.app.navigate('silabus')">
            <h4 style="font-size:13px; margin: 0 0 2px;">📚 Sílabus 2026</h4>
            <span style="font-size:11px; color:var(--text-muted);">Cursos de ${userGrade}</span>
          </div>
          <div class="card" style="padding: 12px; cursor: pointer; border-left: 4px solid var(--color-red-500);" onclick="window.app.navigate('cuadernos-qr')">
            <h4 style="font-size:13px; margin: 0 0 2px;">📷 Mis Cuadernos QR</h4>
            <span style="font-size:11px; color:var(--text-muted);">Sellos y stickers QR</span>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="section-column">
            <div class="card">
              <div class="card-header"><h3 class="card-title">📖 Mis Cursos y Aula Virtual (${userGrade})</h3></div>
              <div class="grades-grid">
                ${courses.slice(0, 4).map(c => `
                  <div class="grade-pill-card" style="cursor: pointer;" onclick="window.app.navigate('tareas')">
                    <span class="course-name" style="font-weight: 800; color: var(--color-navy-900);">${c.name}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${c.teacher}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="section-column">
            <div class="card">
              <div class="card-header"><h3 class="card-title">📢 Comunicados Oficiales</h3></div>
              <div class="announcement-list">
                ${announcements.map(a => `
                  <div class="announcement-card">
                    <h4>${a.title}</h4>
                    <p class="announcement-preview">${a.content}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // CONTROL INTERNO: SISTEMA DE CALIFICACIONES (DOCENTES Y DIRECTIVOS)
  // =========================================================================
  renderGrades(state) {
    const role = state.currentRole;
    if (role === 'estudiante' || role === 'padre' || role === 'auxiliar') {
      return `
        <div class="fade-in card" style="padding: 50px 20px; text-align: center; max-width: 600px; margin: 40px auto; border-top: 4px solid var(--color-red-600);">
          <div style="font-size: 48px; margin-bottom: 12px;">🔒</div>
          <h2 style="font-size: 18px; font-weight: 900; color: var(--color-navy-900); margin-bottom: 8px;">
            Módulo Exclusivo de Control Interno (Docentes y Dirección)
          </h2>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
            El registro de calificaciones es de uso estricto y confidencial del personal docente y directivo de la institución. No está habilitado para estudiantes ni padres de familia.
          </p>
          <button class="btn btn-navy" onclick="window.app.navigate('dashboard')" style="font-weight: 800; padding: 10px 24px;">
            Volver al Inicio
          </button>
        </div>
      `;
    }

    const activeTab = state.activeGradesTab || "subject";
    const allBoletas = state.boletaData || initialData.boletaData || {};
    const selectedGradingGrade = state.selectedGradingGrade || "4sec";
    const cleanSelectedGrade = selectedGradingGrade.toLowerCase().replace(/[^a-z0-9]/g, '');

    const gradesCatalog = (state.gradesCatalog && state.gradesCatalog.length > 0)
      ? state.gradesCatalog
      : ((initialData && initialData.gradesCatalog) || []);

    const currentGradeObj = gradesCatalog.find(g => {
      const gid = (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return gid === cleanSelectedGrade || gid.includes(cleanSelectedGrade) || cleanSelectedGrade.includes(gid);
    }) || { id: selectedGradingGrade, label: "4° de Secundaria", level: "Secundaria", tutor: "Prof. Roberto Silva" };

    // Lista oficial y dinámica de asignaturas y sus docentes reales en la Base de Datos según el grado seleccionado
    const boletaCourses = (window.appStore && typeof window.appStore.getStudentBoletaCoursesCatalog === "function")
      ? window.appStore.getStudentBoletaCoursesCatalog(selectedGradingGrade)
      : [];

    const keyMap = {
      "Aritmética": "aritmetica",
      "Álgebra": "algebra",
      "Geometría": "geometria",
      "Trigonometría": "trigonometria",
      "Razonamiento Matemático": "raz_matematico",
      "Lenguaje y Gramática": "lenguaje",
      "Lenguaje": "lenguaje",
      "Literatura Universal": "literatura",
      "Literatura": "literatura",
      "Razonamiento Verbal": "raz_verbal",
      "Biología & Anatomía": "biologia",
      "Biología": "biologia",
      "Física Elemental": "fisica",
      "Física": "fisica",
      "Química Inorgánica": "quimica",
      "Química": "quimica",
      "Historia del Perú": "historia_peru",
      "Historia Universal": "historia_universal",
      "Geografía & Economía": "geografia",
      "Geografía": "geografia",
      "Filosofía": "filosofia",
      "Educación Cívica (DPCC)": "civica",
      "Cívica": "civica",
      "Psicología": "psicologia",
      "Computación & Robótica": "computacion",
      "Computación (EPT)": "computacion",
      "Gestión Empresarial & Emprendimiento": "gestion_empresarial",
      "Gestión Empresarial": "gestion_empresarial",
      "Inglés Institucional (B2/C1)": "ingles",
      "Inglés Avanzado": "ingles",
      "Arte y Cultura": "arte_cultura",
      "Educación Religiosa (Valores y Lid.)": "religion",
      "Educación Física & Deporte": "educ_fisica",
      "Conducta y Disciplina": "conducta",
      "Matemática & Aritmética": "aritmetica",
      "Álgebra Elemental": "algebra",
      "Geometría Práctica": "geometria",
      "Comunicación Integral": "lenguaje",
      "Lenguaje & Caligrafía": "lenguaje",
      "Plan Lector & Literatura": "literatura",
      "Ciencia y Tecnología": "biologia",
      "Personal Social & Cívica": "civica",
      "Computación & Informática": "computacion",
      "Inglés Institucional": "ingles",
      "Educación Religiosa & Valores": "religion",
      "Tutoría & Convivencia Escolar": "conducta",
      "Matemática Temprana & Lógica": "aritmetica",
      "Comunicación & Grafomotricidad": "lenguaje",
      "Plan Lector / Cuentos Infantiles": "literatura",
      "Ciencia y Ambiente / Exploración": "biologia",
      "Personal Social & Convivencia": "civica",
      "Psicomotricidad & Juego": "educ_fisica",
      "Inglés Inicial (Vocabulario)": "ingles",
      "Arte, Música y Mini-Manualidades": "arte_cultura",
      "Educación en Valores & Religión": "religion",
      "Hábitos, Disciplina y Tutoría": "conducta"
    };

    const subjectDirectory = boletaCourses.map(c => {
      const key = keyMap[c.name] || c.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
      return {
        key: key,
        id: c.id,
        name: c.name,
        area: c.area,
        teacher: c.teacher || "(Docente por asignar)",
        icon: c.icon || "📚"
      };
    });

    const currentUser = (window.appStore && typeof window.appStore.getCurrentUser === "function") ? window.appStore.getCurrentUser() : null;
    const isDocente = role === 'docente';

    // Si es docente, filtrar ESTRICTAMENTE a solo sus cursos asignados
    const visibleSubjects = (isDocente && currentUser && window.appStore && typeof window.appStore.isTeacherAssignedToCourse === "function")
      ? subjectDirectory.filter(s => window.appStore.isTeacherAssignedToCourse(s, currentUser, selectedGradingGrade))
      : subjectDirectory;

    let selectedSubjectKey = state.selectedGradingSubject;
    if (!selectedSubjectKey || !visibleSubjects.some(s => s.key === selectedSubjectKey)) {
      selectedSubjectKey = visibleSubjects.length > 0 ? visibleSubjects[0].key : (subjectDirectory[0] ? subjectDirectory[0].key : "aritmetica");
    }

    const currentSubject = visibleSubjects.find(s => s.key === selectedSubjectKey) || visibleSubjects[0] || subjectDirectory.find(s => s.key === selectedSubjectKey) || subjectDirectory[0];

    // Filtrar única y estrictamente los estudiantes matriculados en el grado seleccionado
    const allEnrollments = (window.appStore && typeof window.appStore.getEnrollments === "function")
      ? window.appStore.getEnrollments()
      : [];

    const classroomStudents = allEnrollments.filter(e => {
      const egId = (e.gradeId || (window.appStore && window.appStore.resolveStudentGradeId(e.grade)) || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return egId === cleanSelectedGrade || egId.includes(cleanSelectedGrade) || cleanSelectedGrade.includes(egId);
    }).map(e => {
      let key = e.studentCode || e.dni || e.id;
      const nameLow = (e.studentName || "").toLowerCase();
      if (nameLow.includes("mendez") || nameLow.includes("méndez")) key = "mendez";
      else if (nameLow.includes("benitez") || nameLow.includes("benítez")) key = "benitez";
      else if (nameLow.includes("albujar") || nameLow.includes("albújar")) key = "albujar";

      return {
        key: key,
        studentCode: e.studentCode || e.dni,
        name: e.studentName,
        dni: e.dni,
        grade: e.grade || currentGradeObj.label,
        gradeId: e.gradeId || selectedGradingGrade
      };
    });

    let selectedStudentKey = state.selectedBoletaStudent;
    if (!selectedStudentKey || !classroomStudents.some(s => s.key === selectedStudentKey)) {
      selectedStudentKey = classroomStudents.length > 0 ? classroomStudents[0].key : "mendez";
    }

    const tutorStudentData = allBoletas[selectedStudentKey] || (classroomStudents.find(s => s.key === selectedStudentKey) ? { name: classroomStudents.find(s => s.key === selectedStudentKey).name } : allBoletas.mendez) || {};
    const tutorApp = tutorStudentData.appreciations || {};
    const tutorAtt = tutorStudentData.attendance || {};
    const tutorPc = tutorStudentData.parentCriteria || {};

    return `
      <div class="fade-in">
        
        <!-- Cabecera Institucional del Módulo -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 class="card-title" style="font-size: var(--font-size-xl);">Sistema Descentralizado de Calificaciones</h2>
                <span class="status-badge status-approved" style="background: var(--color-yellow-100); color: var(--color-yellow-700);">Periodo Lectivo 2026</span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                I.E.P. "El Educador" • Selección y registro filtrado por <strong>Grado Escolar</strong> y <strong>Curso</strong>.
              </p>
            </div>
            
            <button class="btn btn-gold" onclick="window.app.navigate('boleta')" style="font-weight: 800;">
              Ver Boleta Oficial Consolidada
            </button>
          </div>

          <!-- Selector de Pestañas / Modalidades -->
          <div style="display: flex; border-top: 1px solid var(--border-subtle); background: var(--bg-surface-subtle); padding: 6px 12px; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-sm ${activeTab === 'subject' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setGradesActiveTab('subject')" style="font-weight: 800;">
              👨‍1. Carga por Docente de Curso (Grado & Asignatura)
            </button>
            <button class="btn btn-sm ${activeTab === 'tutor' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setGradesActiveTab('tutor')" style="font-weight: 800;">
              2. Módulo de Tutoría (Asistencia, Apreciaciones y Familias)
            </button>
            <button class="btn btn-sm ${activeTab === 'overview' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setGradesActiveTab('overview')" style="font-weight: 800;">
              3. Sábana Consolidada del Aula
            </button>
          </div>
        </div>

        ${activeTab === 'subject' ? `
          <!-- =====================================================================
               MODO 1: CARGA DE NOTAS POR DOCENTE DE CURSO / ASIGNATURA
               ===================================================================== -->
          <div class="card" style="margin-bottom: var(--space-6);">
            <div class="card-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 14px;">
              
              <!-- Selectores de Grado y Asignatura -->
              <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
                
                <!-- 1. Selector de Grado Escolar -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); white-space: nowrap;">🏫 Grado Escolar:</span>
                  <select class="form-control" style="font-weight: bold; width: auto; font-size: 13px; min-width: 220px; background: #fffbeb; border-color: #f59e0b;" onchange="window.app.changeGradingGrade(this.value)">
                    <optgroup label="--- NIVEL INICIAL ---">
                      <option value="ini-3" ${cleanSelectedGrade === 'ini3' || cleanSelectedGrade === 'ini-3' ? 'selected' : ''}>Inicial 3 Años</option>
                      <option value="ini-4" ${cleanSelectedGrade === 'ini4' || cleanSelectedGrade === 'ini-4' ? 'selected' : ''}>Inicial 4 Años</option>
                      <option value="ini-5" ${cleanSelectedGrade === 'ini5' || cleanSelectedGrade === 'ini-5' ? 'selected' : ''}>Inicial 5 Años</option>
                    </optgroup>
                    <optgroup label="--- NIVEL PRIMARIA ---">
                      <option value="1prim" ${cleanSelectedGrade === '1prim' ? 'selected' : ''}>1° de Primaria (1er Grado)</option>
                      <option value="2prim" ${cleanSelectedGrade === '2prim' ? 'selected' : ''}>2° de Primaria (2do Grado)</option>
                      <option value="3prim" ${cleanSelectedGrade === '3prim' ? 'selected' : ''}>3° de Primaria (3er Grado)</option>
                      <option value="4prim" ${cleanSelectedGrade === '4prim' ? 'selected' : ''}>4° de Primaria (4to Grado)</option>
                      <option value="5prim" ${cleanSelectedGrade === '5prim' ? 'selected' : ''}>5° de Primaria (5to Grado)</option>
                      <option value="6prim" ${cleanSelectedGrade === '6prim' ? 'selected' : ''}>6° de Primaria (6to Grado)</option>
                    </optgroup>
                    <optgroup label="--- NIVEL SECUNDARIA ---">
                      <option value="1sec" ${cleanSelectedGrade === '1sec' ? 'selected' : ''}>1° de Secundaria (1er Año)</option>
                      <option value="2sec" ${cleanSelectedGrade === '2sec' ? 'selected' : ''}>2° de Secundaria (2do Año)</option>
                      <option value="3sec" ${cleanSelectedGrade === '3sec' ? 'selected' : ''}>3° de Secundaria (3er Año)</option>
                      <option value="4sec" ${cleanSelectedGrade === '4sec' ? 'selected' : ''}>4° de Secundaria (4to Año)</option>
                      <option value="5sec" ${cleanSelectedGrade === '5sec' ? 'selected' : ''}>5° de Secundaria (5to Año)</option>
                    </optgroup>
                  </select>
                </div>

                <!-- 2. Selector de Asignatura / Curso -->
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); white-space: nowrap;">📚 Asignatura / Curso:</span>
                  <select class="form-control" style="font-weight: bold; width: auto; font-size: 13px; min-width: 260px;" onchange="window.app.changeSelectedGradingSubject(this.value)">
                    ${visibleSubjects.length === 0 ? `
                      <option value="" disabled selected>(No tienes cursos asignados en ${currentGradeObj.label})</option>
                    ` : visibleSubjects.map(s => {
                      return `
                        <option value="${s.key}" ${s.key === selectedSubjectKey ? 'selected' : ''}>
                          ${s.icon} ${s.name} • (${s.teacher})${isDocente ? ' ★ (Mi Curso)' : ''}
                        </option>
                      `;
                    }).join('')}
                  </select>
                </div>

              </div>

              <!-- Info del Curso & Aula Seleccionada -->
              <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 4px;">
                <span><strong>Grado:</strong> <span style="color: var(--color-navy-900); font-weight: bold;">${currentGradeObj.label || selectedGradingGrade}</span></span>
                <span><strong>Docente Responsable:</strong> <span style="color: var(--color-navy-900); font-weight: bold;">${currentSubject.teacher}</span></span>
                <span><strong>Área Curricular:</strong> ${currentSubject.area}</span>
                <span class="status-badge status-primary" style="font-size: 11px;">👥 ${classroomStudents.length} Alumno(s) en este Grado</span>
              </div>

            </div>

            <!-- Formulario de Calificaciones para los Alumnos del Aula en este Curso -->
            <form onsubmit="window.app.handleSaveSubjectGrades(event, '${selectedSubjectKey}')" style="padding: 16px;">
              <div style="margin-bottom: 12px; font-size: 12px; color: #475569;">
                Mostrando únicamente estudiantes matriculados en <strong>${currentGradeObj.label || selectedGradingGrade}</strong> para la materia <strong>${currentSubject.name}</strong>. Acepta letras (<strong>AD, A, B, C</strong>) o números (<strong>0-20</strong>).
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr style="background: var(--color-navy-900); color: white;">
                      <th style="width: 15%;">Código / DNI</th>
                      <th style="width: 35%;">Apellidos y Nombres (Solo ${currentGradeObj.label || selectedGradingGrade})</th>
                      <th style="width: 12%; text-align:center;">I BIM</th>
                      <th style="width: 12%; text-align:center;">II BIM</th>
                      <th style="width: 12%; text-align:center;">III BIM</th>
                      <th style="width: 12%; text-align:center;">IV BIM</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${classroomStudents.length === 0 ? `
                      <tr>
                        <td colspan="6" style="text-align: center; padding: 36px 16px; color: #64748b; font-size: 13px;">
                          <div style="font-size: 28px; margin-bottom: 6px;">📂</div>
                          <strong>No hay estudiantes matriculados en ${currentGradeObj.label || selectedGradingGrade}.</strong><br>
                          <span style="font-size: 11.5px; opacity: 0.85;">Puede registrar estudiantes en la pestaña "Gestión de Perfiles & Cuentas" o cambiar de grado arriba.</span>
                        </td>
                      </tr>
                    ` : classroomStudents.map(st => {
                      const studentBoleta = allBoletas[st.key] || allBoletas[st.studentCode] || {};
                      const studentGrades = (studentBoleta.grades && studentBoleta.grades[selectedSubjectKey]) || { b1: "", b2: "", b3: "", b4: "" };
                      return `
                        <tr>
                          <td><code>${st.dni || st.studentCode}</code></td>
                          <td><strong>${st.name}</strong></td>
                          <td style="text-align:center;">
                            <input type="text" class="form-control" name="grade_${st.key}_b1" value="${studentGrades.b1 || ''}" placeholder="-" style="width: 65px; text-align:center; font-weight:bold; text-transform:uppercase; margin: 0 auto;" maxlength="4" />
                          </td>
                          <td style="text-align:center;">
                            <input type="text" class="form-control" name="grade_${st.key}_b2" value="${studentGrades.b2 || ''}" placeholder="-" style="width: 65px; text-align:center; font-weight:bold; text-transform:uppercase; margin: 0 auto;" maxlength="4" />
                          </td>
                          <td style="text-align:center;">
                            <input type="text" class="form-control" name="grade_${st.key}_b3" value="${studentGrades.b3 || ''}" placeholder="-" style="width: 65px; text-align:center; font-weight:bold; text-transform:uppercase; margin: 0 auto;" maxlength="4" />
                          </td>
                          <td style="text-align:center;">
                            <input type="text" class="form-control" name="grade_${st.key}_b4" value="${studentGrades.b4 || ''}" placeholder="-" style="width: 65px; text-align:center; font-weight:bold; text-transform:uppercase; margin: 0 auto;" maxlength="4" />
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              ${classroomStudents.length > 0 ? `
                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
                  <button type="submit" class="btn btn-navy" style="font-weight: 800; padding: 10px 22px;">
                    💾 Guardar Notas de ${currentSubject.name} (${currentGradeObj.label || selectedGradingGrade})
                  </button>
                </div>
              ` : ''}
            </form>
          </div>
        ` : ''}

        ${activeTab === 'tutor' ? `
          <!-- =====================================================================
               MODO 2: MÓDULO EXCLUSIVO DEL TUTOR DE AULA
               ===================================================================== -->
          <div class="card" style="margin-bottom: var(--space-6);">
            <div class="card-header" style="background: #eff6ff; border-bottom: 1px solid #bfdbfe; flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 class="card-title" style="color: #1e3a8a;">Módulo de Tutoría y Convivencia Escolar</h3>
                <p style="font-size: 12px; color: #1e40af; margin-top: 2px;">
                  <strong>Tutor a Cargo:</strong> ${currentGradeObj.tutor || 'Docente Tutor'} • <strong>Aula:</strong> ${currentGradeObj.label || selectedGradingGrade}
                </p>
              </div>

              <!-- Selectores de Grado y Estudiante -->
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; font-weight: 800; color: #1e3a8a;">Grado:</span>
                  <select class="form-control" style="font-weight: bold; width: auto; font-size: 12px;" onchange="window.app.changeGradingGrade(this.value)">
                    <option value="ini-5" ${cleanSelectedGrade === 'ini5' || cleanSelectedGrade === 'ini-5' ? 'selected' : ''}>Inicial 5 Años</option>
                    <option value="1prim" ${cleanSelectedGrade === '1prim' ? 'selected' : ''}>1° de Primaria</option>
                    <option value="2prim" ${cleanSelectedGrade === '2prim' ? 'selected' : ''}>2° de Primaria</option>
                    <option value="3prim" ${cleanSelectedGrade === '3prim' ? 'selected' : ''}>3° de Primaria</option>
                    <option value="4prim" ${cleanSelectedGrade === '4prim' ? 'selected' : ''}>4° de Primaria</option>
                    <option value="5prim" ${cleanSelectedGrade === '5prim' ? 'selected' : ''}>5° de Primaria</option>
                    <option value="6prim" ${cleanSelectedGrade === '6prim' ? 'selected' : ''}>6° de Primaria</option>
                    <option value="1sec" ${cleanSelectedGrade === '1sec' ? 'selected' : ''}>1° de Secundaria</option>
                    <option value="2sec" ${cleanSelectedGrade === '2sec' ? 'selected' : ''}>2° de Secundaria</option>
                    <option value="3sec" ${cleanSelectedGrade === '3sec' ? 'selected' : ''}>3° de Secundaria</option>
                    <option value="4sec" ${cleanSelectedGrade === '4sec' ? 'selected' : ''}>4° de Secundaria</option>
                    <option value="5sec" ${cleanSelectedGrade === '5sec' ? 'selected' : ''}>5° de Secundaria</option>
                  </select>
                </div>

                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 12px; font-weight: 800; color: #1e3a8a;">Estudiante:</span>
                  <select class="form-control" style="font-weight: bold; width: auto; font-size: 12px; min-width: 200px;" onchange="window.app.changeBoletaStudent(this.value)">
                    ${classroomStudents.length === 0 ? `
                      <option value="">Sin estudiantes en este grado</option>
                    ` : classroomStudents.map(st => `
                      <option value="${st.key}" ${selectedStudentKey === st.key ? 'selected' : ''}>${st.name}</option>
                    `).join('')}
                  </select>
                </div>

                ${classroomStudents.length > 0 ? `
                  <button type="button" class="btn btn-gold btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('${tutorStudentData.code || tutorStudentData.id || selectedStudentKey}')" style="font-weight: 900; font-size: 11.5px; padding: 6px 14px; border-radius: 16px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0b132b;">
                    ⚡ Stickers QR de Boleta
                  </button>
                ` : ''}
              </div>
            </div>

            <form onsubmit="window.app.handleSaveTutorEvaluation(event, '${selectedStudentKey}')" style="padding: 20px;">
              
              <!-- 1. Apreciación Pedagógica del Tutor -->
              <div style="margin-bottom: 24px;">
                <h4 style="font-size: 14px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 10px; border-bottom: 2px solid var(--border-subtle); padding-bottom: 6px;">
                  1. Apreciación del Tutor (Observaciones Oficiales para la Boleta)
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;">
                  <div>
                    <label style="font-size: 12px; font-weight: 800; color: var(--color-navy-900); display: block; margin-bottom: 4px;">I BIMESTRE:</label>
                    <textarea class="form-control" name="app_b1" rows="3" placeholder="Apreciación del 1er Bimestre...">${tutorApp.b1 || ''}</textarea>
                  </div>
                  <div>
                    <label style="font-size: 12px; font-weight: 800; color: var(--color-navy-900); display: block; margin-bottom: 4px;">II BIMESTRE:</label>
                    <textarea class="form-control" name="app_b2" rows="3" placeholder="Apreciación del 2do Bimestre...">${tutorApp.b2 || ''}</textarea>
                  </div>
                  <div>
                    <label style="font-size: 12px; font-weight: 800; color: var(--color-navy-900); display: block; margin-bottom: 4px;">III BIMESTRE:</label>
                    <textarea class="form-control" name="app_b3" rows="3" placeholder="Apreciación del 3er Bimestre...">${tutorApp.b3 || ''}</textarea>
                  </div>
                  <div>
                    <label style="font-size: 12px; font-weight: 800; color: var(--color-navy-900); display: block; margin-bottom: 4px;">IV BIMESTRE:</label>
                    <textarea class="form-control" name="app_b4" rows="3" placeholder="Apreciación del 4to Bimestre...">${tutorApp.b4 || ''}</textarea>
                  </div>
                </div>
              </div>

              <!-- 2. Registro de Asistencia del Estudiante -->
              <div style="margin-bottom: 24px;">
                <h4 style="font-size: 14px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 10px; border-bottom: 2px solid var(--border-subtle); padding-bottom: 6px;">
                  2. Resumen de Asistencia del Estudiante (Inasistencias y Tardanzas)
                </h4>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr style="background: var(--color-navy-900); color: white;">
                        <th rowspan="2" style="width: 20%; text-align:center;">Periodo</th>
                        <th colspan="2" style="width: 40%; text-align:center;">Inasistencias</th>
                        <th colspan="2" style="width: 40%; text-align:center;">Tardanzas</th>
                      </tr>
                      <tr style="background: #1e293b; color: white;">
                        <th style="text-align:center;">Justificadas</th>
                        <th style="text-align:center;">Injustificadas</th>
                        <th style="text-align:center;">Justificadas</th>
                        <th style="text-align:center;">Injustificadas</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${['b1', 'b2', 'b3', 'b4'].map((b, idx) => {
                        const rec = tutorAtt[b] || {};
                        const bLabel = `${idx + 1}° BIMESTRE`;
                        return `
                          <tr>
                            <td style="font-weight:bold; text-align:center;">${bLabel}</td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="att_${b}_ij" value="${rec.inasist_just || '-'}" style="width:60px; text-align:center; margin:0 auto;" /></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="att_${b}_ii" value="${rec.inasist_injust || '-'}" style="width:60px; text-align:center; margin:0 auto;" /></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="att_${b}_tj" value="${rec.tard_just || '-'}" style="width:60px; text-align:center; margin:0 auto;" /></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="att_${b}_ti" value="${rec.tard_injust || '-'}" style="width:60px; text-align:center; margin:0 auto;" /></td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 3. Evaluación de Participación de los Padres de Familia -->
              <div style="margin-bottom: 24px;">
                <h4 style="font-size: 14px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 10px; border-bottom: 2px solid var(--border-subtle); padding-bottom: 6px;">
                  3. Participación de los Padres de Familia (6 Criterios MINEDU: AD, A, B, C)
                </h4>
                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr style="background: var(--color-navy-900); color: white;">
                        <th style="width: 50%;">Criterio de Evaluación Formativa</th>
                        <th style="width: 12%; text-align:center;">I BIM</th>
                        <th style="width: 12%; text-align:center;">II BIM</th>
                        <th style="width: 12%; text-align:center;">III BIM</th>
                        <th style="width: 12%; text-align:center;">IV BIM</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${[
                        { id: 1, text: "1. Se interesa por el aprendizaje de su hijo(a)." },
                        { id: 2, text: "2. Envía oportunamente sus materiales (útiles escolares)." },
                        { id: 3, text: "3. Participa en actividades en el aula e Institución Educativa." },
                        { id: 4, text: "4. Envía puntualmente a su hijo(a) a la Institución Educativa." },
                        { id: 5, text: "5. Asiste a la Escuela de Padres." },
                        { id: 6, text: "6. Padres / apoderados, se comunican con frecuencia para conocer la situación de su hijo(a)." }
                      ].map(crit => {
                        const cVal = tutorPc[`c${crit.id}`] || {};
                        return `
                          <tr>
                            <td><strong>${crit.text}</strong></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="pc_c${crit.id}_b1" value="${cVal.b1 || ''}" placeholder="A" style="width:60px; text-align:center; font-weight:bold; text-transform:uppercase; margin:0 auto;" maxlength="2" /></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="pc_c${crit.id}_b2" value="${cVal.b2 || ''}" placeholder="-" style="width:60px; text-align:center; font-weight:bold; text-transform:uppercase; margin:0 auto;" maxlength="2" /></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="pc_c${crit.id}_b3" value="${cVal.b3 || ''}" placeholder="-" style="width:60px; text-align:center; font-weight:bold; text-transform:uppercase; margin:0 auto;" maxlength="2" /></td>
                            <td style="text-align:center;"><input type="text" class="form-control" name="pc_c${crit.id}_b4" value="${cVal.b4 || ''}" placeholder="-" style="width:60px; text-align:center; font-weight:bold; text-transform:uppercase; margin:0 auto;" maxlength="2" /></td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              ${classroomStudents.length > 0 ? `
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                  <button type="submit" class="btn btn-red" style="font-weight: 800; padding: 12px 24px;">
                    💾 Guardar Evaluación de Tutoría de ${tutorStudentData.name || 'Estudiante'}
                  </button>
                </div>
              ` : ''}

            </form>
          </div>
        ` : ''}

        ${activeTab === 'overview' ? `
          <!-- =====================================================================
               MODO 3: SÁBANA GENERAL Y ESTADO DE AVANCE DE DOCENTES
               ===================================================================== -->
          <div class="card" style="margin-bottom: var(--space-6);">
            <div class="card-header" style="flex-wrap: wrap; gap: 12px;">
              <div>
                <h3 class="card-title">Sábana Consolidada de Calificaciones - ${currentGradeObj.label || selectedGradingGrade}</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                  Consolidado automático de calificaciones de los estudiantes matriculados en <strong>${currentGradeObj.label || selectedGradingGrade}</strong>.
                </p>
              </div>

              <!-- Selector de Grado para Sábana -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 12px; font-weight: 800; color: var(--color-navy-900);">Grado:</span>
                <select class="form-control" style="font-weight: bold; width: auto; font-size: 12px;" onchange="window.app.changeGradingGrade(this.value)">
                  <option value="ini-5" ${cleanSelectedGrade === 'ini5' || cleanSelectedGrade === 'ini-5' ? 'selected' : ''}>Inicial 5 Años</option>
                  <option value="1prim" ${cleanSelectedGrade === '1prim' ? 'selected' : ''}>1° de Primaria</option>
                  <option value="2prim" ${cleanSelectedGrade === '2prim' ? 'selected' : ''}>2° de Primaria</option>
                  <option value="3prim" ${cleanSelectedGrade === '3prim' ? 'selected' : ''}>3° de Primaria</option>
                  <option value="4prim" ${cleanSelectedGrade === '4prim' ? 'selected' : ''}>4° de Primaria</option>
                  <option value="5prim" ${cleanSelectedGrade === '5prim' ? 'selected' : ''}>5° de Primaria</option>
                  <option value="6prim" ${cleanSelectedGrade === '6prim' ? 'selected' : ''}>6° de Primaria</option>
                  <option value="1sec" ${cleanSelectedGrade === '1sec' ? 'selected' : ''}>1° de Secundaria</option>
                  <option value="2sec" ${cleanSelectedGrade === '2sec' ? 'selected' : ''}>2° de Secundaria</option>
                  <option value="3sec" ${cleanSelectedGrade === '3sec' ? 'selected' : ''}>3° de Secundaria</option>
                  <option value="4sec" ${cleanSelectedGrade === '4sec' ? 'selected' : ''}>4° de Secundaria</option>
                  <option value="5sec" ${cleanSelectedGrade === '5sec' ? 'selected' : ''}>5° de Secundaria</option>
                </select>
              </div>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr style="background: var(--color-navy-900); color: white;">
                    <th>Asignatura</th>
                    <th>Docente Responsable</th>
                    ${classroomStudents.map(st => `
                      <th style="text-align:center; font-size: 11px;">${st.name.split(',')[0]}</th>
                    `).join('')}
                    <th style="text-align:center;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${classroomStudents.length === 0 ? `
                    <tr>
                      <td colspan="4" style="text-align: center; padding: 24px; color: #64748b;">
                        No hay estudiantes matriculados en este grado.
                      </td>
                    </tr>
                  ` : subjectDirectory.map(s => {
                    return `
                      <tr>
                        <td><strong>${s.icon} ${s.name}</strong></td>
                        <td style="font-size: 12px;">${s.teacher}</td>
                        ${classroomStudents.map(st => {
                          const stBoleta = allBoletas[st.key] || allBoletas[st.studentCode] || {};
                          const grVal = (stBoleta.grades && stBoleta.grades[s.key]?.b1) || "--";
                          return `<td style="text-align:center; font-weight:bold; color:var(--color-navy-900);">${grVal}</td>`;
                        }).join('')}
                        <td style="text-align:center;">
                          <span class="status-badge status-approved">
                            <span class="status-dot-green"></span> Registrado
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div style="padding: 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <span style="font-size: 13px; font-weight: 700; color: #1e293b;">
                Consolidado oficial de ${currentGradeObj.label || selectedGradingGrade}.
              </span>
              <button class="btn btn-navy" onclick="window.app.navigate('boleta')" style="font-weight: 800;">
                Generar Boleta Oficial MINEDU (PDF)
              </button>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  },

  // =========================================================================
  // BOLETA OFICIAL IMPRIMIBLE CON FORMATO MINEDU (2 PÁGINAS DINÁMICAS)
  // =========================================================================
  renderPrintableReport(state) {
    const role = state.currentRole;
    const currentUser = (state.currentUser && state.currentUser.name) ? state.currentUser : ((state.users && state.users[role]) || initialData.users[role] || {});
    const allBoletas = state.boletaData || initialData.boletaData || {};
    const enrollments = state.enrollments || initialData.enrollments || [];

    let selectedStudentKey = state.selectedBoletaStudent;
    
    // Si el usuario es un Padre de Familia: seleccionar automáticamente a su hijo/estudiante
    if (role === 'padre') {
      const childName = (currentUser.studentName || currentUser.detail || "").toLowerCase();
      const childCode = currentUser.studentCode || "";
      const matched = enrollments.find(e => 
        (childCode && (e.studentCode === childCode || e.id === childCode)) ||
        (childName && e.studentName && (childName.includes(e.studentName.toLowerCase()) || e.studentName.toLowerCase().includes(childName)))
      );
      if (matched) {
        selectedStudentKey = matched.studentCode || matched.dni;
      } else {
        selectedStudentKey = "mendez";
      }
    } else if (role === 'estudiante') {
      // Si el usuario es Estudiante: seleccionar su propia boleta
      const sCode = currentUser.code || currentUser.studentCode || currentUser.dni;
      const matched = enrollments.find(e => e.studentCode === sCode || e.dni === sCode || (currentUser.name && e.studentName && e.studentName.toLowerCase().includes(currentUser.name.toLowerCase())));
      if (matched) {
        selectedStudentKey = matched.studentCode || matched.dni;
      } else {
        selectedStudentKey = "mendez";
      }
    } else if (!selectedStudentKey) {
      selectedStudentKey = "mendez";
    }

    let student = allBoletas[selectedStudentKey] || allBoletas.mendez;
    if (!student) {
      const enr = enrollments.find(e => e.studentCode === selectedStudentKey || e.dni === selectedStudentKey || e.id === selectedStudentKey);
      student = {
        student: enr ? enr.studentName : "Estudiante Institucional",
        code: enr ? enr.studentCode : selectedStudentKey,
        dni: enr ? enr.dni : "75891234",
        grade: enr ? enr.grade : "4° de Secundaria",
        grades: {},
        appreciations: {},
        attendance: {},
        parentCriteria: {}
      };
    }
    const g = student.grades || {};
    const app = student.appreciations || {};
    const att = student.attendance || {};
    const pc = student.parentCriteria || {};

    // Función auxiliar para promedios literales
    const calcAvg = (keys, bim) => {
      const vals = keys.map(k => (g[k] && g[k][bim]) || "").filter(Boolean);
      if (!vals.length) return "";
      let sum = 0;
      vals.forEach(v => {
        const u = v.toUpperCase().trim();
        if (u === "AD") sum += 4;
        else if (u === "A") sum += 3;
        else if (u === "B") sum += 2;
        else if (u === "C") sum += 1;
        else if (!isNaN(parseFloat(u))) {
          const num = parseFloat(u);
          if (num >= 18) sum += 4;
          else if (num >= 14) sum += 3;
          else if (num >= 11) sum += 2;
          else sum += 1;
        }
      });
      const avg = sum / vals.length;
      if (avg >= 3.5) return "AD";
      if (avg >= 2.5) return "A";
      if (avg >= 1.5) return "B";
      return "C";
    };

    // Función auxiliar para promedio final de un curso
    const calcPF = (key) => {
      return calcAvg([key], "b1") && calcAvg([key], "b2") ? calcAvg([key], "b1") : "";
    };

    // Promedios por áreas
    const comB1 = calcAvg(["lenguaje", "literatura", "raz_verbal"], "b1");
    const comB2 = calcAvg(["lenguaje", "literatura", "raz_verbal"], "b2");
    const comB3 = calcAvg(["lenguaje", "literatura", "raz_verbal"], "b3");
    const comB4 = calcAvg(["lenguaje", "literatura", "raz_verbal"], "b4");

    const matB1 = calcAvg(["aritmetica", "algebra", "geometria", "trigonometria", "raz_matematico"], "b1");
    const matB2 = calcAvg(["aritmetica", "algebra", "geometria", "trigonometria", "raz_matematico"], "b2");
    const matB3 = calcAvg(["aritmetica", "algebra", "geometria", "trigonometria", "raz_matematico"], "b3");
    const matB4 = calcAvg(["aritmetica", "algebra", "geometria", "trigonometria", "raz_matematico"], "b4");

    const ctaB1 = calcAvg(["biologia", "fisica", "quimica"], "b1");
    const ctaB2 = calcAvg(["biologia", "fisica", "quimica"], "b2");
    const ctaB3 = calcAvg(["biologia", "fisica", "quimica"], "b3");
    const ctaB4 = calcAvg(["biologia", "fisica", "quimica"], "b4");

    const ccB1 = calcAvg(["geografia", "filosofia", "historia_peru", "historia_universal"], "b1");
    const ccB2 = calcAvg(["geografia", "filosofia", "historia_peru", "historia_universal"], "b2");
    const ccB3 = calcAvg(["geografia", "filosofia", "historia_peru", "historia_universal"], "b3");
    const ccB4 = calcAvg(["geografia", "filosofia", "historia_peru", "historia_universal"], "b4");

    const dpccB1 = calcAvg(["civica", "psicologia"], "b1");
    const dpccB2 = calcAvg(["civica", "psicologia"], "b2");
    const dpccB3 = calcAvg(["civica", "psicologia"], "b3");
    const dpccB4 = calcAvg(["civica", "psicologia"], "b4");

    const eptB1 = calcAvg(["computacion", "gestion_empresarial"], "b1");
    const eptB2 = calcAvg(["computacion", "gestion_empresarial"], "b2");
    const eptB3 = calcAvg(["computacion", "gestion_empresarial"], "b3");
    const eptB4 = calcAvg(["computacion", "gestion_empresarial"], "b4");

    const val = (k, b) => (g[k] && g[k][b]) || "";

    const isParentOrStudent = role === 'padre' || role === 'estudiante';

    return `
      <div class="fade-in">
        
        <!-- Barra Superior de Control (No Imprimible) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; background: white; padding: 14px 18px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.05);" class="no-print">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm" onclick="window.app.navigate('${isParentOrStudent ? 'dashboard' : 'calificaciones'}')">
              ← ${isParentOrStudent ? 'Volver al Inicio' : 'Volver al Registro de Notas'}
            </button>
            
            ${isParentOrStudent ? `
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="status-badge" style="background: #e0e7ff; color: #3730a3; font-weight: 800; font-size: 12px;">
                  📄 Boleta Oficial de: <strong>${student.student}</strong> (${student.grade || '2026'})
                </span>
              </div>
            ` : `
              <!-- Selector de Alumno para Docentes y Directivos -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 800; color: var(--color-navy-900);">Alumno(a):</span>
                <select class="form-control" style="font-size: 12px; font-weight: bold; width: auto; padding: 4px 10px;" onchange="window.app.changeBoletaStudent(this.value)">
                  <option value="mendez" ${selectedStudentKey === 'mendez' ? 'selected' : ''}>MÉNDEZ FLORES, SOFÍA (4° de Secundaria)</option>
                  <option value="benitez" ${selectedStudentKey === 'benitez' ? 'selected' : ''}>BENÍTEZ RUIZ, CARLOS (4° de Secundaria)</option>
                  <option value="albujar" ${selectedStudentKey === 'albujar' ? 'selected' : ''}>ALBUJAR ZEGARRA, MARINA DEL CARMEN (2° de Secundaria)</option>
                </select>
              </div>
            `}
          </div>
          
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-navy" onclick="window.print()" style="font-weight: 800; font-size: 13px; padding: 9px 20px;">
              🖨️ Imprimir Boleta Oficial Completa (PDF / Doble Cara)
            </button>
          </div>
        </div>

        <!-- =========================================================================
             PÁGINA 1: CALIFICATIVO DEL APRENDIZAJE & ASISTENCIA & APRECIACIÓN
             ========================================================================= -->
        <div class="official-boleta-page official-boleta-page-1" style="background-image: url('assets/boleta_document_bg.png'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; padding: 12px 14px;">
          
          <div class="boleta-main-title">
            BOLETA DE INFORMACIÓN DEL PROGRESO DEL APRENDIZAJE DEL ESTUDIANTE – 2026
          </div>

          <div class="boleta-page-1-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: start; width: 100%;">
            
            <!-- Columna Izquierda: Tabla de Calificaciones por Áreas -->
            <div>
              <table class="boleta-table">
                <thead>
                  <tr>
                    <th rowspan="2" style="width: 50%; text-align: left; padding-left: 6px;">AREAS / ASIGNATURAS</th>
                    <th colspan="4" style="width: 36%;">CALIFICATIVO POR BIMESTRE</th>
                    <th rowspan="2" style="width: 14%;">P. F</th>
                  </tr>
                  <tr>
                    <th style="width: 9%;">I</th>
                    <th style="width: 9%;">II</th>
                    <th style="width: 9%;">III</th>
                    <th style="width: 9%;">IV</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- COMUNICACIÓN -->
                  <tr><td>LENGUAJE</td><td style="text-align:center;">${val("lenguaje","b1")}</td><td style="text-align:center;">${val("lenguaje","b2")}</td><td style="text-align:center;">${val("lenguaje","b3")}</td><td style="text-align:center;">${val("lenguaje","b4")}</td><td style="text-align:center;">${calcPF("lenguaje")}</td></tr>
                  <tr><td>LITERATURA</td><td style="text-align:center;">${val("literatura","b1")}</td><td style="text-align:center;">${val("literatura","b2")}</td><td style="text-align:center;">${val("literatura","b3")}</td><td style="text-align:center;">${val("literatura","b4")}</td><td style="text-align:center;">${calcPF("literatura")}</td></tr>
                  <tr><td>RAZONAMIENTO VERBAL</td><td style="text-align:center;">${val("raz_verbal","b1")}</td><td style="text-align:center;">${val("raz_verbal","b2")}</td><td style="text-align:center;">${val("raz_verbal","b3")}</td><td style="text-align:center;">${val("raz_verbal","b4")}</td><td style="text-align:center;">${calcPF("raz_verbal")}</td></tr>
                  <tr class="boleta-yellow-row"><td>PROMEDIO DE COMUNICACIÓN</td><td style="text-align:center;">${comB1}</td><td style="text-align:center;">${comB2}</td><td style="text-align:center;">${comB3}</td><td style="text-align:center;">${comB4}</td><td style="text-align:center;">${comB1 && comB2 ? comB1 : ''}</td></tr>

                  <!-- MATEMÁTICA -->
                  <tr><td>ARITMÉTICA</td><td style="text-align:center;">${val("aritmetica","b1")}</td><td style="text-align:center;">${val("aritmetica","b2")}</td><td style="text-align:center;">${val("aritmetica","b3")}</td><td style="text-align:center;">${val("aritmetica","b4")}</td><td style="text-align:center;">${calcPF("aritmetica")}</td></tr>
                  <tr><td>ÁLGEBRA</td><td style="text-align:center;">${val("algebra","b1")}</td><td style="text-align:center;">${val("algebra","b2")}</td><td style="text-align:center;">${val("algebra","b3")}</td><td style="text-align:center;">${val("algebra","b4")}</td><td style="text-align:center;">${calcPF("algebra")}</td></tr>
                  <tr><td>GEOMETRÍA</td><td style="text-align:center;">${val("geometria","b1")}</td><td style="text-align:center;">${val("geometria","b2")}</td><td style="text-align:center;">${val("geometria","b3")}</td><td style="text-align:center;">${val("geometria","b4")}</td><td style="text-align:center;">${calcPF("geometria")}</td></tr>
                  <tr><td>TRIGONOMETRÍA</td><td style="text-align:center;">${val("trigonometria","b1")}</td><td style="text-align:center;">${val("trigonometria","b2")}</td><td style="text-align:center;">${val("trigonometria","b3")}</td><td style="text-align:center;">${val("trigonometria","b4")}</td><td style="text-align:center;">${calcPF("trigonometria")}</td></tr>
                  <tr><td>RAZONAMIENTO MATEMÁTICO</td><td style="text-align:center;">${val("raz_matematico","b1")}</td><td style="text-align:center;">${val("raz_matematico","b2")}</td><td style="text-align:center;">${val("raz_matematico","b3")}</td><td style="text-align:center;">${val("raz_matematico","b4")}</td><td style="text-align:center;">${calcPF("raz_matematico")}</td></tr>
                  <tr class="boleta-yellow-row"><td>PROMEDIO DE MATEMÁTICA</td><td style="text-align:center;">${matB1}</td><td style="text-align:center;">${matB2}</td><td style="text-align:center;">${matB3}</td><td style="text-align:center;">${matB4}</td><td style="text-align:center;">${matB1 && matB2 ? matB1 : ''}</td></tr>

                  <!-- CIENCIA Y TECNOLOGÍA -->
                  <tr><td>BIOLOGÍA</td><td style="text-align:center;">${val("biologia","b1")}</td><td style="text-align:center;">${val("biologia","b2")}</td><td style="text-align:center;">${val("biologia","b3")}</td><td style="text-align:center;">${val("biologia","b4")}</td><td style="text-align:center;">${calcPF("biologia")}</td></tr>
                  <tr><td>FÍSICA</td><td style="text-align:center;">${val("fisica","b1")}</td><td style="text-align:center;">${val("fisica","b2")}</td><td style="text-align:center;">${val("fisica","b3")}</td><td style="text-align:center;">${val("fisica","b4")}</td><td style="text-align:center;">${calcPF("fisica")}</td></tr>
                  <tr><td>QUÍMICA</td><td style="text-align:center;">${val("quimica","b1")}</td><td style="text-align:center;">${val("quimica","b2")}</td><td style="text-align:center;">${val("quimica","b3")}</td><td style="text-align:center;">${val("quimica","b4")}</td><td style="text-align:center;">${calcPF("quimica")}</td></tr>
                  <tr class="boleta-yellow-row"><td>PROMEDIO DE CIENCIA Y TECNOLOGÍA</td><td style="text-align:center;">${ctaB1}</td><td style="text-align:center;">${ctaB2}</td><td style="text-align:center;">${ctaB3}</td><td style="text-align:center;">${ctaB4}</td><td style="text-align:center;">${ctaB1 && ctaB2 ? ctaB1 : ''}</td></tr>

                  <!-- CIENCIAS SOCIALES -->
                  <tr><td>GEOGRAFÍA</td><td style="text-align:center;">${val("geografia","b1")}</td><td style="text-align:center;">${val("geografia","b2")}</td><td style="text-align:center;">${val("geografia","b3")}</td><td style="text-align:center;">${val("geografia","b4")}</td><td style="text-align:center;">${calcPF("geografia")}</td></tr>
                  <tr><td>FILOSOFÍA</td><td style="text-align:center;">${val("filosofia","b1")}</td><td style="text-align:center;">${val("filosofia","b2")}</td><td style="text-align:center;">${val("filosofia","b3")}</td><td style="text-align:center;">${val("filosofia","b4")}</td><td style="text-align:center;">${calcPF("filosofia")}</td></tr>
                  <tr><td>HISTORIA DEL PERÚ</td><td style="text-align:center;">${val("historia_peru","b1")}</td><td style="text-align:center;">${val("historia_peru","b2")}</td><td style="text-align:center;">${val("historia_peru","b3")}</td><td style="text-align:center;">${val("historia_peru","b4")}</td><td style="text-align:center;">${calcPF("historia_peru")}</td></tr>
                  <tr><td>HISTORIA UNIVERSAL</td><td style="text-align:center;">${val("historia_universal","b1")}</td><td style="text-align:center;">${val("historia_universal","b2")}</td><td style="text-align:center;">${val("historia_universal","b3")}</td><td style="text-align:center;">${val("historia_universal","b4")}</td><td style="text-align:center;">${calcPF("historia_universal")}</td></tr>
                  <tr class="boleta-yellow-row"><td>PROMEDIO DE CIENCIAS SOCIALES</td><td style="text-align:center;">${ccB1}</td><td style="text-align:center;">${ccB2}</td><td style="text-align:center;">${ccB3}</td><td style="text-align:center;">${ccB4}</td><td style="text-align:center;">${ccB1 && ccB2 ? ccB1 : ''}</td></tr>

                  <!-- DPCC -->
                  <tr><td>CÍVICA</td><td style="text-align:center;">${val("civica","b1")}</td><td style="text-align:center;">${val("civica","b2")}</td><td style="text-align:center;">${val("civica","b3")}</td><td style="text-align:center;">${val("civica","b4")}</td><td style="text-align:center;">${calcPF("civica")}</td></tr>
                  <tr><td>PSICOLOGÍA</td><td style="text-align:center;">${val("psicologia","b1")}</td><td style="text-align:center;">${val("psicologia","b2")}</td><td style="text-align:center;">${val("psicologia","b3")}</td><td style="text-align:center;">${val("psicologia","b4")}</td><td style="text-align:center;">${calcPF("psicologia")}</td></tr>
                  <tr class="boleta-yellow-row"><td>PROMEDIO DE DESARROLLO PERSONAL, CIUDADANÍA Y CÍVICA</td><td style="text-align:center;">${dpccB1}</td><td style="text-align:center;">${dpccB2}</td><td style="text-align:center;">${dpccB3}</td><td style="text-align:center;">${dpccB4}</td><td style="text-align:center;">${dpccB1 && dpccB2 ? dpccB1 : ''}</td></tr>

                  <!-- EDUCACIÓN PARA EL TRABAJO -->
                  <tr><td>COMPUTACIÓN</td><td style="text-align:center;">${val("computacion","b1")}</td><td style="text-align:center;">${val("computacion","b2")}</td><td style="text-align:center;">${val("computacion","b3")}</td><td style="text-align:center;">${val("computacion","b4")}</td><td style="text-align:center;">${calcPF("computacion")}</td></tr>
                  <tr><td>GESTIÓN EMPRESARIAL</td><td style="text-align:center;">${val("gestion_empresarial","b1")}</td><td style="text-align:center;">${val("gestion_empresarial","b2")}</td><td style="text-align:center;">${val("gestion_empresarial","b3")}</td><td style="text-align:center;">${val("gestion_empresarial","b4")}</td><td style="text-align:center;">${calcPF("gestion_empresarial")}</td></tr>
                  <tr class="boleta-yellow-row"><td>PROMEDIO EDUCACIÓN PARA EL TRABAJO</td><td style="text-align:center;">${eptB1}</td><td style="text-align:center;">${eptB2}</td><td style="text-align:center;">${eptB3}</td><td style="text-align:center;">${eptB4}</td><td style="text-align:center;">${eptB1 && eptB2 ? eptB1 : ''}</td></tr>

                  <!-- OTRAS ÁREAS -->
                  <tr><td>ARTE Y CULTURA</td><td style="text-align:center;">${val("arte_cultura","b1")}</td><td style="text-align:center;">${val("arte_cultura","b2")}</td><td style="text-align:center;">${val("arte_cultura","b3")}</td><td style="text-align:center;">${val("arte_cultura","b4")}</td><td style="text-align:center;">${calcPF("arte_cultura")}</td></tr>
                  <tr><td>EDUCACIÓN RELIGIOSA (VALORES Y LID.)</td><td style="text-align:center;">${val("religion","b1")}</td><td style="text-align:center;">${val("religion","b2")}</td><td style="text-align:center;">${val("religion","b3")}</td><td style="text-align:center;">${val("religion","b4")}</td><td style="text-align:center;">${calcPF("religion")}</td></tr>
                  <tr><td>EDUCACIÓN FÍSICA</td><td style="text-align:center;">${val("educ_fisica","b1")}</td><td style="text-align:center;">${val("educ_fisica","b2")}</td><td style="text-align:center;">${val("educ_fisica","b3")}</td><td style="text-align:center;">${val("educ_fisica","b4")}</td><td style="text-align:center;">${calcPF("educ_fisica")}</td></tr>
                  <tr><td>INGLÉS</td><td style="text-align:center;">${val("ingles","b1")}</td><td style="text-align:center;">${val("ingles","b2")}</td><td style="text-align:center;">${val("ingles","b3")}</td><td style="text-align:center;">${val("ingles","b4")}</td><td style="text-align:center;">${calcPF("ingles")}</td></tr>
                  
                  <!-- COMPETENCIAS TRANSVERSALES -->
                  <tr><td colspan="6" style="font-size: 9.5px; padding: 3px 5px;"><strong>SE DESENVUELVE EN ENTORNOS VIRTUALES GENERADOS POR LAS TIC</strong></td></tr>
                  <tr>
                    <td colspan="6" style="font-size: 8.5px; line-height: 1.25; padding: 3px 5px;">
                      <strong>GESTIONA SU APRENDIZAJE DE MANERA AUTÓNOMA</strong>, permite que los estudiantes participen activamente en el logro de aprendizajes tomando en cuenta sus potencialidades y a organizarse por sí mismos frente a esta necesidad.
                    </td>
                  </tr>
                  <tr class="boleta-yellow-row">
                    <td>CONDUCTA</td>
                    <td style="text-align:center;">${val("conducta","b1")}</td>
                    <td style="text-align:center;">${val("conducta","b2")}</td>
                    <td style="text-align:center;">${val("conducta","b3")}</td>
                    <td style="text-align:center;">${val("conducta","b4")}</td>
                    <td style="text-align:center;">${val("conducta","b1") && val("conducta","b2") ? val("conducta","b1") : ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Columna Derecha: Asistencia, Apreciación y Escala -->
            <div>
              
              <!-- Resumen de Asistencia -->
              <div style="text-align: center; margin-bottom: 6px;">
                <div class="boleta-badge-title">RESUMEN DE ASISTENCIA DEL ESTUDIANTE</div>
              </div>

              <table class="boleta-table" style="margin-bottom: 12px;">
                <thead>
                  <tr>
                    <th rowspan="2" style="width: 20%;">PERIODO</th>
                    <th colspan="2" style="width: 40%;">INASISTENCIAS</th>
                    <th colspan="2" style="width: 40%;">TARDANZAS</th>
                  </tr>
                  <tr>
                    <th>JUSTIFICADAS</th>
                    <th>INJUSTIFICADAS</th>
                    <th>JUSTIFICADAS</th>
                    <th>INJUSTIFICADAS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="text-align:center; font-weight:bold;">I BIM</td>
                    <td style="text-align:center;">${(att.b1 && att.b1.inasist_just) || '-'}</td>
                    <td style="text-align:center;">${(att.b1 && att.b1.inasist_injust) || '-'}</td>
                    <td style="text-align:center;">${(att.b1 && att.b1.tard_just) || '-'}</td>
                    <td style="text-align:center;">${(att.b1 && att.b1.tard_injust) || '-'}</td>
                  </tr>
                  <tr>
                    <td style="text-align:center; font-weight:bold;">II BIM</td>
                    <td style="text-align:center;">${(att.b2 && att.b2.inasist_just) || '-'}</td>
                    <td style="text-align:center;">${(att.b2 && att.b2.inasist_injust) || '-'}</td>
                    <td style="text-align:center;">${(att.b2 && att.b2.tard_just) || '-'}</td>
                    <td style="text-align:center;">${(att.b2 && att.b2.tard_injust) || '-'}</td>
                  </tr>
                  <tr>
                    <td style="text-align:center; font-weight:bold;">III BIM</td>
                    <td style="text-align:center;">${(att.b3 && att.b3.inasist_just) || ''}</td>
                    <td style="text-align:center;">${(att.b3 && att.b3.inasist_injust) || ''}</td>
                    <td style="text-align:center;">${(att.b3 && att.b3.tard_just) || ''}</td>
                    <td style="text-align:center;">${(att.b3 && att.b3.tard_injust) || ''}</td>
                  </tr>
                  <tr>
                    <td style="text-align:center; font-weight:bold;">IV BIM</td>
                    <td style="text-align:center;">${(att.b4 && att.b4.inasist_just) || ''}</td>
                    <td style="text-align:center;">${(att.b4 && att.b4.inasist_injust) || ''}</td>
                    <td style="text-align:center;">${(att.b4 && att.b4.tard_just) || ''}</td>
                    <td style="text-align:center;">${(att.b4 && att.b4.tard_injust) || ''}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Apreciación del Docente -->
              <div style="text-align: center; margin-bottom: 6px;">
                <div class="boleta-badge-title">APRECIACIÓN DEL DOCENTE</div>
              </div>

              <div class="boleta-appreciation-box">
                <div class="boleta-appreciation-left">
                  <div class="boleta-appreciation-item">
                    <span class="boleta-appreciation-tag">I BIM:</span>
                    <div>
                      ${app.b1 || `Felicitaciones a <strong>${student.name}</strong> por su excelente rendimiento. Demuestra responsabilidad, participación activa y compromiso con su aprendizaje.`}
                    </div>
                  </div>
                  <div class="boleta-appreciation-item">
                    <span class="boleta-appreciation-tag">II BIM:</span>
                    <div>
                      ${app.b2 || `Has realizado un trabajo muy bueno durante este segundo bimestre. Cumples con responsabilidad tus actividades dentro de la clase.`}
                    </div>
                  </div>
                  <div class="boleta-appreciation-item" style="min-height: 24px;">
                    <span class="boleta-appreciation-tag">III BIM:</span>
                    <div>${app.b3 || ''}</div>
                  </div>
                  <div class="boleta-appreciation-item" style="min-height: 24px;">
                    <span class="boleta-appreciation-tag">IV BIM:</span>
                    <div>${app.b4 || ''}</div>
                  </div>
                </div>
                <div class="boleta-parent-sig-box">
                  FIRMA DEL PADRE
                </div>
              </div>

              <!-- Escala de Calificación Literal Oficial -->
              <div class="boleta-scale-legend">
                <div style="margin-bottom: 4px;">
                  <strong style="color: #1e3a8a;">AD &nbsp; LOGRO DESTACADO:</strong><br>
                  Cuando el estudiante evidencia un nivel superior a lo esperado respecto a la competencia. Esto quiere decir que demuestra aprendizajes que van más allá del nivel esperado.
                </div>
                <div style="margin-bottom: 4px;">
                  <strong style="color: #1e3a8a;">A &nbsp; LOGRO ESPERADO:</strong><br>
                  Cuando el estudiante evidencia el nivel esperado respecto a la competencia, demostrando manejo satisfactorio en todas las tareas propuestas y en el tiempo programado.
                </div>
                <div style="margin-bottom: 4px;">
                  <strong style="color: #1e3a8a;">B &nbsp; EN PROCESO:</strong><br>
                  Cuando el estudiante está próximo o cerca al nivel esperado respecto a la competencia, para lo cual requiere acompañamiento durante un tiempo razonable para lograrlo.
                </div>
                <div>
                  <strong style="color: #1e3a8a;">C &nbsp; EN INICIO:</strong><br>
                  Cuando el estudiante muestra un progreso mínimo en una competencia de acuerdo al nivel esperado. Evidencia con frecuencia dificultades en el desarrollo de las tareas, por lo que necesita mayor tiempo de acompañamiento e intervención del docente.
                </div>
              </div>

            </div>

          </div>

        </div>

        <!-- =========================================================================
             PÁGINA 2: PARTICIPACIÓN DE PADRES & CARÁTULA OFICIAL
             ========================================================================= -->
        <div class="official-boleta-page official-boleta-page-2" style="background-image: url('assets/boleta_document_bg.png'); background-size: 100% 100%; background-repeat: no-repeat; background-position: center; padding: 12px 14px;">
          
          <div class="boleta-page-2-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; align-items: stretch; height: 100%;">
            
            <!-- Columna Izquierda: Participación de Padres & Compromiso & Firmas -->
            <div class="boleta-page-2-left-box" style="display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #000000; border-radius: 8px; padding: 14px 16px; box-sizing: border-box; height: 100%; background: rgba(255, 255, 255, 0.94);">
              <div>
                <div style="text-align: center; margin-bottom: 8px;">
                  <div class="boleta-badge-title" style="font-size: 8.5pt; padding: 3px 14px;">PARTICIPACIÓN DE LOS PADRES DE FAMILIA</div>
                </div>

                <table class="boleta-table" style="margin-bottom: 10px;">
                  <thead>
                    <tr>
                      <th rowspan="2" style="width: 60%; text-align: left; padding: 4px 6px; background:#fef08a;">CRITERIOS DE EVALUACIÓN</th>
                      <th colspan="4" style="background:#fef08a; padding: 4px;">BIMESTRES</th>
                      <th rowspan="2" style="background:#fef08a; width: 10%; padding: 4px;">P.F</th>
                    </tr>
                    <tr>
                      <th style="background:#fef08a; width: 7%; padding: 3px;">I</th>
                      <th style="background:#fef08a; width: 7%; padding: 3px;">II</th>
                      <th style="background:#fef08a; width: 7%; padding: 3px;">III</th>
                      <th style="background:#fef08a; width: 7%; padding: 3px;">IV</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding: 4px 5px;">1. Se interesa por el aprendizaje de su hijo(a).</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c1 && pc.c1.b1) || 'A'}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c1 && pc.c1.b2) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c1 && pc.c1.b3) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c1 && pc.c1.b4) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c1 && pc.c1.b1) || 'A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 5px;">2. Envía oportunamente sus materiales (útiles escolares).</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c2 && pc.c2.b1) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c2 && pc.c2.b2) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c2 && pc.c2.b3) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c2 && pc.c2.b4) || ''}</td>
                      <td style="text-align:center; font-weight:bold;"></td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 5px;">3. Participa en actividades en el aula e Institución Educativa.</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c3 && pc.c3.b1) || 'A'}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c3 && pc.c3.b2) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c3 && pc.c3.b3) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c3 && pc.c3.b4) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c3 && pc.c3.b1) || 'A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 5px;">4. Envía puntualmente a su hijo(a) a la Institución Educativa.</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c4 && pc.c4.b1) || 'A'}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c4 && pc.c4.b2) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c4 && pc.c4.b3) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c4 && pc.c4.b4) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c4 && pc.c4.b1) || 'A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 5px;">5. Asiste a la Escuela de Padres.</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c5 && pc.c5.b1) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c5 && pc.c5.b2) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c5 && pc.c5.b3) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c5 && pc.c5.b4) || ''}</td>
                      <td style="text-align:center; font-weight:bold;"></td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 5px;">6. Padres / apoderados, se comunican con frecuencia para conocer la situación de su hijo(a).</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c6 && pc.c6.b1) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c6 && pc.c6.b2) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c6 && pc.c6.b3) || ''}</td>
                      <td style="text-align:center; font-weight:bold;">${(pc.c6 && pc.c6.b4) || ''}</td>
                      <td style="text-align:center; font-weight:bold;"></td>
                    </tr>
                  </tbody>
                </table>

                <!-- Compromiso Formativo del Apoderado -->
                <div style="border: 1.2px solid #000000; border-radius: 6px; padding: 6px 8px; background: #f8fafc; font-size: 7.6pt; line-height: 1.3; margin-top: 8px;">
                  <strong style="color: #1e3a8a; display: block; margin-bottom: 2px;">COMPROMISO DEL APODERADO:</strong>
                  El padre o tutor legal se compromete a acompañar el desarrollo formativo y académico de su menor hijo(a), velando por su puntualidad y asistiendo a las reuniones pedagógicas convocadas por la Institución.
                </div>
              </div>

              <!-- Pie de Firmas Oficiales con Sellos -->
              <div style="display: flex; justify-content: space-around; text-align: center; margin-top: auto; padding-top: 28px;">
                <div style="border-top: 1.5px solid #000000; width: 150px; padding-top: 4px; font-size: 10px; font-weight: 800;">
                  TUTOR(A) DE AULA
                </div>
                <div style="border-top: 1.5px solid #000000; width: 150px; padding-top: 4px; font-size: 10px; font-weight: 800;">
                  DIRECCIÓN GENERAL
                </div>
              </div>
            </div>

            <!-- Columna Derecha: Carátula Oficial Institucional (Fondo Oficial de la Institución) -->
            <div class="boleta-cover-container" style="position: relative; height: 100%; min-height: 198mm; box-sizing: border-box; overflow: hidden; border-radius: 4px; padding: 0; background: #ffffff;">
              
              <!-- Imagen Oficial como Fondo Completo -->
              <img src="assets/boleta_cover_official_bg.png" alt="Carátula Oficial El Educador" style="width: 100%; height: 100%; object-fit: fill; display: block;" />

              <!-- Cajetín Dinámico del Estudiante sobre el espacio amarillo de la plantilla -->
              <div style="position: absolute; bottom: 12.8%; left: 13.5%; width: 73%; height: 14.8%; display: flex; flex-direction: column; justify-content: center; font-size: 8.5pt; line-height: 1.35; color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; text-align: left; box-sizing: border-box; padding: 2px 6px;">
                
                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
                  <span style="font-weight: 900; font-size: 8.2pt;">APELLIDOS Y NOMBRES:</span> 
                  <strong style="text-transform: uppercase; font-size: 8.8pt; color: #000000;">${student.name}</strong>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <div>
                    <span style="font-weight: 900; font-size: 8.2pt;">GRADO:</span> <strong>${student.grade}</strong>
                  </div>
                  <div>
                    <span style="font-weight: 900; font-size: 8.2pt;">NIVEL:</span> <strong>${student.level}</strong>
                  </div>
                </div>

                <div style="margin-bottom: 2px;">
                  <span style="font-weight: 900; font-size: 8.2pt;">SECCIÓN:</span> <strong>${student.section ? student.section : 'Única'}</strong>
                </div>

                <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  <span style="font-weight: 900; font-size: 8.2pt;">TUTOR (A):</span> 
                  <strong style="color: #000000;">${student.tutor}</strong>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    `;
  },

  // Horarios
  // Generador Completo y Sincronizado de Docentes y Horarios Semanales (Sin autorrellenado)
  getComprehensiveTeachersList(state) {
    const rawTeachers = (state.teachersList && state.teachersList.length > 0)
      ? JSON.parse(JSON.stringify(state.teachersList))
      : (JSON.parse(JSON.stringify((initialData && initialData.teachersList) || [])));

    const systemDocentes = ((state.systemUsers && Array.isArray(state.systemUsers)) ? state.systemUsers : ((initialData && initialData.systemUsers) || []))
      .filter(u => (u.role === 'Docente' || u.role === 'Profesor') && !u._deleted);

    systemDocentes.forEach(doc => {
      let existing = rawTeachers.find(t => t.id === doc.id || t.name.toLowerCase().trim() === doc.name.toLowerCase().trim());
      const docCourses = Array.isArray(doc.assignedCourses) && doc.assignedCourses.length > 0
        ? doc.assignedCourses
        : (Array.isArray(doc.courses) && doc.courses.length > 0
          ? doc.courses
          : (doc.subject ? doc.subject.split(/,\s*/) : ["Matemática"]));
      const docGrades = Array.isArray(doc.assignedGrades) && doc.assignedGrades.length > 0
        ? doc.assignedGrades
        : [];
      const weeklyHrs = doc.weeklyHours ? parseInt(doc.weeklyHours, 10) || 24 : 24;

      if (existing) {
        if (!existing.courses || existing.courses.length === 0) existing.courses = docCourses;
        if (!existing.assignedGrades || existing.assignedGrades.length === 0) existing.assignedGrades = docGrades;
        if (!existing.subject) existing.subject = doc.subject || docCourses.join(', ');
      } else {
        rawTeachers.push({
          id: doc.id || `DOC-${Date.now().toString().slice(-4)}`,
          name: doc.name,
          subject: doc.subject || docCourses.join(', '),
          department: "Área Pedagógica",
          isTutor: false,
          tutoringGrade: null,
          weeklyHours: weeklyHrs,
          assignedGrades: docGrades,
          classrooms: [],
          courses: docCourses,
          schedule: []
        });
      }
    });

    const allSchedules = (state.schedules && typeof state.schedules === 'object') ? state.schedules : ((initialData && initialData.schedules) || {});
    const gradesCatalog = (state.gradesCatalog && state.gradesCatalog.length > 0) ? state.gradesCatalog : ((initialData && initialData.gradesCatalog) || []);
    
    const gradeLabelMap = {};
    gradesCatalog.forEach(g => {
      gradeLabelMap[g.id] = g.label;
    });

    const days = ['mon', 'tue', 'wed', 'thu', 'fri'];

    // Normalizador de nombres para coincidencias precisas
    const normalizeTeacherName = (str) => {
      if (!str) return "";
      return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^(prof\.|prof|miss|dra\.|dra|lic\.|lic|ing\.|ing)\s*/i, '').trim();
    };

    rawTeachers.forEach(t => {
      // Plantilla base limpia con 8 bloques lectivos de 50 min y 2 recesos (Sin clases inventadas)
      t.schedule = [
        { time: "08:00 - 08:50", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "08:50 - 09:40", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "09:40 - 10:30", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "10:30 - 10:50", isBreak: true, title: "Receso Pedagógico (10:30 - 10:50 AM)" },
        { time: "10:50 - 11:40", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "11:40 - 12:30", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "12:30 - 01:20", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "01:20 - 01:50", isBreak: true, isLunch: true, title: "Almuerzo Escolar (01:20 - 01:50 PM)" },
        { time: "01:50 - 02:40", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "02:40 - 03:30", mon: null, tue: null, wed: null, thu: null, fri: null }
      ];

      const tClean = normalizeTeacherName(t.name);
      const tParts = tClean.split(/\s+/).filter(Boolean);

      let assignedCount = 0;
      const scheduledCoursesSet = new Set();
      const scheduledGradesSet = new Set();
      const scheduledRoomsSet = new Set();

      // Escanear exclusivamente las clases reales asignadas por el administrador en las aulas
      Object.keys(allSchedules).forEach(gradeKey => {
        const gRows = allSchedules[gradeKey];
        const gradeLabel = gradeLabelMap[gradeKey] || (gradeKey === "4sec" || gradeKey === "4sec-a" ? "4° de Secundaria" : gradeKey.toUpperCase());
        
        if (Array.isArray(gRows)) {
          gRows.forEach((gRow, rIdx) => {
            if (!gRow.isBreak && t.schedule[rIdx] && !t.schedule[rIdx].isBreak) {
              days.forEach(dayKey => {
                const slot = gRow[dayKey];
                if (slot && slot.teacher) {
                  const sTeacherClean = normalizeTeacherName(slot.teacher);
                  const sParts = sTeacherClean.split(/\s+/).filter(Boolean);
                  let isMatch = false;

                  if (sTeacherClean === tClean || sTeacherClean.includes(tClean) || tClean.includes(sTeacherClean)) {
                    isMatch = true;
                  } else if (tParts.length >= 2 && sParts.length >= 2) {
                    const lastT = tParts[tParts.length - 1];
                    const lastS = sParts[sParts.length - 1];
                    if (lastT === lastS && (tParts[0] === sParts[0] || tParts[0][0] === sParts[0][0])) {
                      isMatch = true;
                    }
                  } else if (tParts.length >= 1 && sParts.length >= 1) {
                    const lastT = tParts[tParts.length - 1];
                    const lastS = sParts[sParts.length - 1];
                    if (lastT === lastS && lastT.length > 3) {
                      isMatch = true;
                    }
                  }

                  if (isMatch) {
                    t.schedule[rIdx][dayKey] = {
                      course: slot.course,
                      grade: gradeLabel,
                      gradeId: gradeKey,
                      rowIndex: rIdx,
                      dayKey: dayKey,
                      room: slot.room || "Aula Principal",
                      color: slot.color || "navy"
                    };
                    assignedCount++;
                    if (slot.course) scheduledCoursesSet.add(slot.course);
                    scheduledGradesSet.add(gradeLabel);
                    if (slot.room) scheduledRoomsSet.add(slot.room);
                  }
                }
              });
            }
          });
        }
      });

      t.assignedSlotCount = assignedCount;
      t.calculatedHours = assignedCount > 0 ? `${(assignedCount * 50 / 60).toFixed(1)} hrs (${assignedCount} bloques)` : "0 hrs (Sin clases asignadas)";
      t.scheduledCourses = Array.from(scheduledCoursesSet);
      t.scheduledGrades = Array.from(scheduledGradesSet);
      t.scheduledRooms = Array.from(scheduledRoomsSet);
    });

    return rawTeachers;
  },

  // Horarios (Gestión Dual: Horario Docente Personal y Horario por Aula)
  renderSchedules(state) {
    try {
      const role = state.currentRole || "admin";
      const hasAdminEditPower = role === "admin" || role === "director" || (role === "docente" && state.users && state.users.docente && state.users.docente.hasAdminPrivileges);
      
      const catalog = (state.gradesCatalog && state.gradesCatalog.length > 0) 
        ? state.gradesCatalog 
        : ((initialData && initialData.gradesCatalog) || []);
        
      const teachersList = this.getComprehensiveTeachersList(state);
      
      // Vista dual para docentes y directivos: Por defecto "classroom" para Administrador y "personal" para Docente
      const isTeacherOrAdmin = role === "docente" || role === "admin" || role === "director";
      const defaultTab = (role === "admin" || role === "director") ? "classroom" : "personal";
      const activeTab = isTeacherOrAdmin ? (state.teacherScheduleTab || defaultTab) : "classroom";

      // Docente seleccionado
      let selectedTeacherId = state.selectedTeacherId;
      if (!selectedTeacherId || !teachersList.some(t => t.id === selectedTeacherId)) {
        if (role === "docente") {
          const userDoc = (state.users && state.users.docente) || (state.systemUsers || []).find(u => (u.username === "docente" || u.role === "Docente") && !u._deleted);
          const match = userDoc && teachersList.find(t => t.name.toLowerCase().includes(userDoc.name.toLowerCase()) || userDoc.name.toLowerCase().includes(t.name.toLowerCase()));
          selectedTeacherId = match ? match.id : teachersList[0].id;
        } else {
          selectedTeacherId = teachersList[0].id;
        }
      }

      const currentTeacher = teachersList.find(t => t.id === selectedTeacherId) || teachersList[0];

      const teacherCourses = (currentTeacher.scheduledCourses && currentTeacher.scheduledCourses.length > 0)
        ? currentTeacher.scheduledCourses
        : ((currentTeacher.courses && currentTeacher.courses.length > 0) ? currentTeacher.courses : [currentTeacher.subject || "Matemática"]);

      const teacherGrades = (currentTeacher.scheduledGrades && currentTeacher.scheduledGrades.length > 0)
        ? currentTeacher.scheduledGrades
        : ((currentTeacher.assignedGrades && currentTeacher.assignedGrades.length > 0) ? currentTeacher.assignedGrades : ["Sin asignar"]);

      const teacherClassrooms = (currentTeacher.scheduledRooms && currentTeacher.scheduledRooms.length > 0)
        ? currentTeacher.scheduledRooms
        : ((currentTeacher.classrooms && currentTeacher.classrooms.length > 0) ? currentTeacher.classrooms : ["Aula Principal"]);

      const teacherSchedule = Array.isArray(currentTeacher.schedule) ? currentTeacher.schedule : [];
      const teacherHours = currentTeacher.calculatedHours || `${currentTeacher.assignedSlotCount || 0} Bloques`;

      const courseFilter = state.selectedTeacherCourseFilter || "all";

      // Grado seleccionado para vista por aula
      let currentGradeId = state.selectedScheduleGrade || "4sec";
      if (currentGradeId === "4sec-a") currentGradeId = "4sec";

      if (role === "padre") {
        const parentUser = this.getCurrentUser(state);
        const children = parentUser.children || [];
        const selectedId = parentUser.selectedChildId || (children[0] && children[0].id);
        const student = children.find(c => c.id === selectedId) || children[0];
        if (student && student.gradeId) {
          currentGradeId = student.gradeId === "4sec-a" ? "4sec" : student.gradeId;
        } else if (parentUser.detail) {
          currentGradeId = this.getGradeIdFromLabel(parentUser.detail);
        }
      } else if (role === "estudiante") {
        const currentUser = this.getCurrentUser(state);
        const gradeStr = currentUser.gradeLevel || currentUser.detail || currentUser.grade || "";
        const matched = catalog.find(g => (g.label && gradeStr.toLowerCase().includes(g.label.toLowerCase())) || (g.label && g.label.toLowerCase().includes(gradeStr.toLowerCase())) || g.id === gradeStr);
        currentGradeId = matched ? matched.id : this.getGradeIdFromLabel(gradeStr);
      }

      const currentGrade = catalog.find(g => g.id === currentGradeId) || catalog.find(g => g.id === "4sec") || catalog[0] || {
        id: "4sec",
        label: "4° de Secundaria",
        level: "Secundaria",
        classroom: "Aula 401",
        tutor: "Prof. Roberto Silva"
      };

      const allSchedules = (state.schedules && typeof state.schedules === 'object') 
        ? state.schedules 
        : ((initialData && initialData.schedules) || {});

      const fallbackScheduleTemplate = [
        { time: "08:00 - 08:50", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "08:50 - 09:40", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "09:40 - 10:30", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "10:30 - 10:50", isBreak: true, title: "Receso Pedagógico (10:30 - 10:50 AM)" },
        { time: "10:50 - 11:40", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "11:40 - 12:30", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "12:30 - 01:20", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "01:20 - 01:50", isBreak: true, isLunch: true, title: "Almuerzo Escolar (01:20 - 01:50 PM)" },
        { time: "01:50 - 02:40", mon: null, tue: null, wed: null, thu: null, fri: null },
        { time: "02:40 - 03:30", mon: null, tue: null, wed: null, thu: null, fri: null }
      ];

      const scheduleRows = Array.isArray(allSchedules[currentGradeId]) 
        ? allSchedules[currentGradeId] 
        : (Array.isArray(allSchedules["4sec"]) ? allSchedules["4sec"] : fallbackScheduleTemplate);

      const days = ['mon', 'tue', 'wed', 'thu', 'fri'];
      const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

      return `
        <div class="fade-in">
          
          <!-- BANNER PRINCIPAL DE GESTIÓN Y CREACIÓN DE HORARIOS (ADMINISTRADOR) -->
          ${hasAdminEditPower ? `
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: #ffffff; padding: 16px 20px; border-radius: 10px; margin-bottom: 16px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border: 1px solid #3b82f6;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 24px;">📅</span>
                  <h2 style="font-size: 18px; font-weight: 900; margin: 0; color: #ffffff;">Gestión y Creación de Horarios Escolares</h2>
                  <span class="status-badge" style="background: #f59e0b; color: #78350f; font-weight: 900; font-size: 11px;">
                    ️ Modo Administrador Activo
                  </span>
                </div>
                <p style="font-size: 12px; color: #cbd5e1; margin: 4px 0 0 0;">
                  Cree, asigne, modifique y organice los bloques lectivos y asignaturas para todos los grados y docentes.
                </p>
              </div>

              <!-- BOTONES DE ACCIÓN PRINCIPALES CON MÁXIMA VISIBILIDAD -->
              <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                <button class="btn" onclick="window.app.openCreateScheduleModal('${currentGradeId}')" style="background: #f59e0b; color: #0b132b; font-weight: 900; font-size: 13px; padding: 9px 18px; border: 2px solid #fbbf24; border-radius: 6px; box-shadow: 0 2px 10px rgba(245,158,11,0.5); display: flex; align-items: center; gap: 6px; cursor: pointer;">
                  <span style="font-size: 16px;">➕</span>
                  <span>+ CREAR / ASIGNAR CLASE</span>
                </button>
                <button class="btn btn-outline" onclick="window.app.setTeacherScheduleTab('${activeTab === 'personal' ? 'classroom' : 'personal'}')" style="background: rgba(255,255,255,0.18); color: #ffffff; border-color: rgba(255,255,255,0.5); font-weight: 800; font-size: 12px; padding: 8px 14px;">
                  ${activeTab === 'personal' ? 'Ver Horario por Aula' : '👨‍Ver Horario Semanal Docente'}
                </button>
                <button class="btn btn-outline" onclick="window.app.openAutoScheduleModal('${currentGradeId}')" style="background: rgba(255,255,255,0.12); color: #ffffff; border-color: rgba(255,255,255,0.4); font-weight: 800; font-size: 12px; padding: 8px 14px;">
                  ⚡ Horario Automático
                </button>
                <button class="btn btn-outline" onclick="window.app.openCloneScheduleModal('${currentGradeId}')" style="background: rgba(255,255,255,0.12); color: #ffffff; border-color: rgba(255,255,255,0.4); font-weight: 800; font-size: 12px; padding: 8px 14px;">
                  Clonar Horario
                </button>
                <button class="btn btn-outline" onclick="window.app.clearScheduleGrade('${currentGradeId}')" style="background: rgba(239,68,68,0.25); color: #fca5a5; border-color: #ef4444; font-weight: 800; font-size: 12px; padding: 8px 12px;">
                  🗑️ Limpiar
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Pestañas de Navegación Segmentada Dual (Máxima Claridad) -->
          ${isTeacherOrAdmin ? `
            <div style="display: flex; gap: 8px; margin-bottom: 16px; background: #f1f5f9; padding: 6px; border-radius: 10px; border: 1px solid #cbd5e1; flex-wrap: wrap;">
              <button class="btn ${activeTab === 'classroom' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setTeacherScheduleTab('classroom')" style="flex: 1; min-width: 220px; font-weight: 900; font-size: 13px; padding: 10px 16px; border-radius: 8px; box-shadow: ${activeTab === 'classroom' ? '0 3px 10px rgba(30,58,138,0.25)' : 'none'}; display: flex; justify-content: center; align-items: center; gap: 8px;">
                <span></span> Horario General por Aula / Grado (Secciones)
              </button>
              <button class="btn ${activeTab === 'personal' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setTeacherScheduleTab('personal')" style="flex: 1; min-width: 220px; font-weight: 900; font-size: 13px; padding: 10px 16px; border-radius: 8px; box-shadow: ${activeTab === 'personal' ? '0 3px 10px rgba(30,58,138,0.25)' : 'none'}; display: flex; justify-content: center; align-items: center; gap: 8px;">
                <span>👨‍</span> Horario Semanal por Docente (Carga Horaria & Cursos)
              </button>
            </div>
          ` : ''}

          ${activeTab === 'personal' ? `
            <!-- VISTA: MI HORARIO SEMANAL DOCENTE (DOCENTE DE CURSO) -->
            <div class="card" style="margin-bottom: var(--space-6);">
              
              <!-- Banner Informativo del Perfil Docente -->
              <div class="teacher-schedule-banner" style="background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%); color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-size: 24px;">👨‍</span>
                    <h2 style="font-size: 19px; font-weight: 900; margin: 0; color: #ffffff;">${currentTeacher.name}</h2>
                    <span class="status-badge" style="background: #fef08a; color: #854d0e; font-weight: 900; font-size: 11px;">
                      Docente Curricular
                    </span>
                  </div>
                  <p style="font-size: 12.5px; opacity: 0.95; margin: 4px 0 0 0;">
                    ${currentTeacher.department || 'Área Pedagógica'} • Especialidad: <strong>${currentTeacher.subject || teacherCourses.join(', ')}</strong>
                  </p>
                </div>

                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                  <label style="font-size: 12px; font-weight: 800; color: #e2e8f0;">Seleccionar Docente:</label>
                  <select id="selected-teacher-dropdown" class="form-control" style="width: auto; padding: 6px 14px; font-weight: 900; font-size: 12.5px; background: #ffffff; color: #0b132b; border: 2px solid #3b82f6;" onchange="window.app.onTeacherChange(this.value)">
                    ${teachersList.map(t => {
                      const tCourseName = (t.scheduledCourses && t.scheduledCourses[0]) || (t.courses && t.courses[0]) || t.subject || "Docente";
                      return `<option value="${t.id}" ${t.id === selectedTeacherId ? 'selected' : ''}>${t.name} (${tCourseName})</option>`;
                    }).join('')}
                  </select>
                  ${hasAdminEditPower ? `
                    <button class="btn btn-gold btn-sm" onclick="window.app.openCreateScheduleModal('${currentGradeId}')" style="font-weight: 900; white-space: nowrap; padding: 6px 12px;">
                      ➕ + Asignar Clase
                    </button>
                  ` : ''}
                  <button class="btn btn-outline btn-sm" onclick="window.print()" style="font-weight: 800; white-space: nowrap; color: #ffffff; border-color: rgba(255,255,255,0.4); padding: 6px 12px;">
                    Imprimir A4
                  </button>
                </div>
              </div>

              <!-- Resumen Métrico de Carga Horaria Real Asignada -->
              <div class="teacher-stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
                <div class="teacher-stat-card" style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 6px; border: 1px solid #bfdbfe;">
                  <span class="teacher-stat-lbl" style="font-size: 11px; font-weight: 700; color: #1e40af; display: block;">⏱️ Carga Real Asignada</span>
                  <span class="teacher-stat-val" style="font-size: 18px; font-weight: 900; color: #1e3a8a; display: block; margin: 2px 0;">${teacherHours}</span>
                  <span style="font-size: 11px; color: #64748b;">${currentTeacher.assignedSlotCount || 0} bloque(s) lectivo(s) programados</span>
                </div>

                <div class="teacher-stat-card" style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 6px; border: 1px solid #a7f3d0;">
                  <span class="teacher-stat-lbl" style="font-size: 11px; font-weight: 700; color: #065f46; display: block;">📚 Asignaturas Dictadas</span>
                  <span class="teacher-stat-val" style="font-size: 18px; font-weight: 900; color: #047857; display: block; margin: 2px 0;">${teacherCourses.length} Cursos</span>
                  <span style="font-size: 11px; color: #64748b;">${teacherCourses.slice(0, 2).join(', ')}${teacherCourses.length > 2 ? '...' : ''}</span>
                </div>

                <div class="teacher-stat-card" style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 6px; border: 1px solid #fde68a;">
                  <span class="teacher-stat-lbl" style="font-size: 11px; font-weight: 700; color: #92400e; display: block;">Aulas / Grados Asignados</span>
                  <span class="teacher-stat-val" style="font-size: 18px; font-weight: 900; color: #b45309; display: block; margin: 2px 0;">${teacherGrades.length} Grados</span>
                  <span style="font-size: 11px; color: #64748b;">${teacherGrades.slice(0, 2).join(', ')}${teacherGrades.length > 2 ? '...' : ''}</span>
                </div>

                <div class="teacher-stat-card" style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 12px 14px; border-radius: 6px; border: 1px solid #e9d5ff;">
                  <span class="teacher-stat-lbl" style="font-size: 11px; font-weight: 700; color: #5b21b6; display: block;">🔬 Ambientes Asignados</span>
                  <span class="teacher-stat-val" style="font-size: 15px; font-weight: 900; color: #6b21a8; display: block; margin: 4px 0;">${teacherClassrooms[0] || 'Aula Principal'}</span>
                  <span style="font-size: 11px; color: #64748b;">${teacherClassrooms.length} ambiente(s)</span>
                </div>
              </div>

              <!-- Barra de Filtros por Curso y Alerta de Disponibilidad -->
              <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <label style="font-size: 12px; font-weight: 800; color: #1e293b;">Filtrar por Asignatura:</label>
                  <select class="form-control" style="width: auto; padding: 4px 10px; font-size: 12px; font-weight: bold;" onchange="window.app.onTeacherCourseFilterChange(this.value)">
                    <option value="all" ${courseFilter === 'all' ? 'selected' : ''}>Todos los cursos (${teacherCourses.length})</option>
                    ${teacherCourses.map(c => `<option value="${c}" ${courseFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
                  </select>
                </div>

                <div style="font-size: 11.5px; color: #047857; font-weight: 700; background: #d1fae5; padding: 4px 12px; border-radius: 12px; border: 1px solid #a7f3d0;">
                  ✓ Mostrando únicamente las clases programadas por el Administrador • Periodo 2026
                </div>
              </div>

              <!-- Grilla Semanal del Horario Docente Personal (100% Real) -->
              <div class="table-container">
                <table class="schedule-grid-table">
                  <thead>
                    <tr>
                      <th style="width: 120px;">Hora</th>
                      <th>Lunes</th>
                      <th>Martes</th>
                      <th>Miércoles</th>
                      <th>Jueves</th>
                      <th>Viernes</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${teacherSchedule.map((row, rIdx) => {
                      if (row.isBreak) {
                        const isLunch = row.isLunch || (row.time && row.time.includes("01:20"));
                        const rowClass = isLunch ? "schedule-lunch-row" : "schedule-break-row";
                        const icon = isLunch ? "🍽️" : "☕";
                        return `<tr class="${rowClass}"><td class="time-slot-cell" style="font-weight: 900;">${row.time}</td><td colspan="5">${icon} ${row.title}</td></tr>`;
                      }
                      return `
                        <tr>
                          <td class="time-slot-cell" style="font-weight: 800;">${row.time}</td>
                          ${days.map(dayKey => {
                            const slot = row[dayKey];
                            if (!slot) {
                              return hasAdminEditPower ? `
                                <td style="background:#fafafa; padding: 4px;">
                                  <div class="empty-schedule-slot" onclick="window.app.openCreateScheduleModal('${currentGradeId}', ${rIdx}, '${dayKey}')" style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px 4px; text-align: center; cursor: pointer; color: #94a3b8; font-size: 11px; font-weight: 700; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.color='#1e40af'; this.style.background='#eff6ff';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#94a3b8'; this.style.background='transparent';">
                                    ➕ Asignar Clase
                                  </div>
                                </td>
                              ` : `<td style="background:#fafafa; text-align: center; color: #cbd5e1; font-size: 11px;"><em>Hora Libre</em></td>`;
                            }
                            
                            const isMatch = courseFilter === "all" || (slot.course && slot.course.toLowerCase().includes(courseFilter.toLowerCase()));
                            const opacityStyle = isMatch ? "" : "opacity: 0.25;";

                            return `
                              <td style="${opacityStyle}">
                                <div class="schedule-slot-card slot-${slot.color || 'navy'}" ${hasAdminEditPower ? `onclick="window.app.openEditScheduleSlotModal('${slot.gradeId || currentGradeId}', ${slot.rowIndex || rIdx}, '${slot.dayKey || dayKey}')" style="cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.06); border-radius: 6px; padding: 8px 10px;"` : 'style="box-shadow: 0 2px 5px rgba(0,0,0,0.06); border-radius: 6px; padding: 8px 10px;"'}>
                                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px;">
                                    <div class="slot-course-title" style="font-size: 12.5px; font-weight: 800;">${slot.course}</div>
                                    <span style="font-size: 9.5px; font-weight: 900; background: #1e3a8a; color: #ffffff; padding: 1px 6px; border-radius: 10px;">${slot.grade || 'Secundaria'}</span>
                                  </div>
                                  <div class="slot-room-badge" style="background: rgba(0,0,0,0.06); font-size: 10px; font-weight: 800; color: #0b132b; margin-top: 3px;">
                                    📍 ${slot.room || 'Aula Principal'}
                                  </div>
                                </div>
                              </td>
                            `;
                          }).join('')}
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

            </div>
          ` : `
            <!-- VISTA: HORARIO GENERAL POR AULA / GRADO -->
            <div class="card" style="margin-bottom: var(--space-6);">
              <div class="card-header">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <h2 class="card-title" style="font-size: var(--font-size-xl);">Horario Académico Escolar por Aulas - 2026</h2>
                    ${hasAdminEditPower ? `<span class="status-badge status-approved" style="background: var(--color-yellow-100); color: var(--color-yellow-700);">Modo Edición Habilitado</span>` : ''}
                  </div>
                  <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                    I.E.P. "El Educador" • "21 años dejando huellas" (S.J.L. • UGEL 05) • Bloques de 50 min
                  </p>
                </div>
                <button class="btn btn-navy btn-sm" onclick="window.print()">Imprimir Horario de Aula</button>
              </div>

              <div class="schedule-filter-bar" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                ${isTeacherOrAdmin ? `
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <label style="font-size: 12px; font-weight: 800; color: #1e293b;">Seleccionar Aula / Grado:</label>
                    <select class="form-control" style="width: auto; padding: 4px 12px; font-weight: bold; border-color: #3b82f6;" onchange="window.app.onScheduleGradeChange(this.value)">
                      ${catalog.map(g => `<option value="${g.id}" ${g.id === currentGradeId ? 'selected' : ''}>${g.label} (${g.level})</option>`).join('')}
                    </select>
                    <span style="font-size: 11.5px; color: var(--color-navy-800); background: #f1f5f9; padding: 3px 8px; border-radius: 4px; border: 1px solid #cbd5e1;">
                      Aula: <strong>${currentGrade.classroom || 'Aula Principal'}</strong> • Tutor: <strong>${currentGrade.tutor || 'Tutor Asignado'}</strong>
                    </span>
                  </div>
                ` : `
                  <div style="font-size: 13px; color: var(--color-navy-950); font-weight: 800; background: var(--color-yellow-100); padding: 8px 16px; border-radius: 6px; border: 1px solid var(--color-yellow-400); display: inline-flex; align-items: center; gap: 8px;">
                    <span>📍 Horario Exclusivo: <strong>${currentGrade.label} (${currentGrade.level})</strong></span>
                    <span>• Aula: <strong>${currentGrade.classroom || 'Aula Principal'}</strong></span>
                    <span>• Tutor: <strong>${currentGrade.tutor || 'Tutor Asignado'}</strong></span>
                  </div>
                `}

                ${hasAdminEditPower ? `
                  <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button class="btn btn-navy btn-sm" onclick="window.app.openCreateScheduleModal('${currentGradeId}')" style="font-weight: 800; font-size: 11.5px; background: #1e3a8a;">
                      ➕ + Crear / Asignar Clase
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.app.openAutoScheduleModal('${currentGradeId}')" style="font-weight: 800; font-size: 11.5px; color: #1e3a8a;">
                      ⚡ Generar Horario Automático
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.app.openCloneScheduleModal('${currentGradeId}')" style="font-weight: 800; font-size: 11.5px;">
                      Clonar a Otra Aula
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.app.clearScheduleGrade('${currentGradeId}')" style="font-weight: 800; font-size: 11.5px; color: var(--color-red-600);">
                      🗑️ Limpiar
                    </button>
                  </div>
                ` : ''}
              </div>

              <div class="table-container">
                <table class="schedule-grid-table">
                  <thead><tr><th style="width: 120px;">Hora</th><th>Lunes</th><th>Martes</th><th>Miércoles</th><th>Jueves</th><th>Viernes</th></tr></thead>
                  <tbody>
                    ${scheduleRows.map((row, rowIndex) => {
                      if (row.isBreak) {
                        const isLunch = row.isLunch || (row.time && row.time.includes("01:20"));
                        const rowClass = isLunch ? "schedule-lunch-row" : "schedule-break-row";
                        const icon = isLunch ? "🍽️" : "☕";
                        return `<tr class="${rowClass}"><td class="time-slot-cell" style="font-weight: 900;">${row.time}</td><td colspan="5">${icon} ${row.title}</td></tr>`;
                      }
                      return `
                        <tr>
                          <td class="time-slot-cell" style="font-weight: 800;">${row.time}</td>
                          ${days.map(dayKey => {
                            const slot = row[dayKey];
                            if (!slot) {
                              return hasAdminEditPower ? `
                                <td style="background:#fafafa; padding: 4px;">
                                  <div class="empty-schedule-slot" onclick="window.app.openCreateScheduleModal('${currentGradeId}', ${rowIndex}, '${dayKey}')" style="border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px 4px; text-align: center; cursor: pointer; color: #94a3b8; font-size: 11px; font-weight: 700; transition: all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'; this.style.color='#1e40af'; this.style.background='#eff6ff';" onmouseout="this.style.borderColor='#cbd5e1'; this.style.color='#94a3b8'; this.style.background='transparent';">
                                    ➕ Asignar Clase
                                  </div>
                                </td>
                              ` : `<td style="background:#fafafa; text-align: center; color: #cbd5e1; font-size: 11px;"><em>Libre</em></td>`;
                            }
                            return `
                              <td>
                                <div class="schedule-slot-card slot-${slot.color || 'navy'}" ${hasAdminEditPower ? `onclick="window.app.openEditScheduleSlotModal('${currentGradeId}', ${rowIndex}, '${dayKey}')" style="cursor: pointer;"` : ''}>
                                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                                    <div class="slot-course-title">${slot.course}</div>
                                    ${hasAdminEditPower ? `<span style="font-size: 10px; opacity: 0.8;">✏️</span>` : ''}
                                  </div>
                                  <div class="slot-teacher-name">👨‍${slot.teacher}</div>
                                  <div class="slot-room-badge">📍 ${slot.room || currentGrade.classroom || 'Aula Principal'}</div>
                                </div>
                              </td>
                            `;
                          }).join('')}
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `}

        </div>
      `;
    } catch (error) {
      console.error("Error al renderizar Horarios:", error);
      return `
        <div class="card" style="padding: 20px; text-align: center; background: #fff1f2; border: 1px solid #fecdd3;">
          <h3 style="color: #9f1239; margin-bottom: 8px;">⚠️ Restableciendo visualización de Horarios</h3>
          <p style="color: #4b5563; font-size: 13px;">Se ha detectado una actualización en la estructura de horarios. Pulse el botón inferior para sincronizar:</p>
          <button class="btn btn-navy" onclick="window.app.render()" style="font-weight: 800; margin-top: 10px;">
            Sincronizar y Ver Horarios
          </button>
        </div>
      `;
    }
  },

  // Sílabus
  renderSyllabi(state) {
    const role = state.currentRole;
    const hasAdminEditPower = role === "admin" || (role === "docente" && state.users.docente && state.users.docente.hasAdminPrivileges);
    const catalog = state.gradesCatalog || initialData.gradesCatalog;
    
    let currentGradeId = state.selectedSyllabusGrade || "5prim";
    if (role === "padre") {
      const parentUser = this.getCurrentUser(state);
      const children = parentUser.children || [];
      const selectedId = parentUser.selectedChildId || (children[0] && children[0].id);
      const student = children.find(c => c.id === selectedId) || children[0];
      if (student && student.gradeId) {
        currentGradeId = student.gradeId;
      } else if (parentUser.detail) {
        currentGradeId = this.getGradeIdFromLabel(parentUser.detail);
      }
    } else if (role === "estudiante") {
      const currentUser = this.getCurrentUser(state);
      const gradeStr = currentUser.gradeLevel || currentUser.detail || currentUser.grade || "";
      const matched = catalog.find(g => (g.label && gradeStr.toLowerCase().includes(g.label.toLowerCase())) || (g.label && g.label.toLowerCase().includes(gradeStr.toLowerCase())) || g.id === gradeStr);
      currentGradeId = matched ? matched.id : this.getGradeIdFromLabel(gradeStr);
    }

    const currentGrade = catalog.find(g => g.id === currentGradeId) || catalog.find(g => g.id === "5prim") || catalog[0] || { id: "5prim", label: "5° de Primaria" };
    const rawSyllabi = state.syllabi || initialData.syllabi;
    // Si es padre o alumno, filtrar estrictamente para ver solo los cursos de su grado
    const syllabiList = (role === "padre" || role === "estudiante")
      ? rawSyllabi.filter(s => s.gradeId === currentGradeId || !s.gradeId)
      : rawSyllabi.filter(s => s.gradeId === currentGradeId || currentGradeId === "all");

    const isPadre = role === "padre";
    const canBrowseAllGrades = role === "admin" || role === "director" || role === "docente";

    return `
      <div class="fade-in">
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <div>
              <h2 class="card-title" style="font-size: var(--font-size-xl);">Sílabus Curriculares 2026</h2>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Competencias y programación temática institucional.</p>
            </div>
            <div style="display: flex; gap: var(--space-3); align-items: center;">
              ${canBrowseAllGrades ? `
                <select class="form-control" style="width: auto; padding: 4px 12px; font-weight: bold;" onchange="window.app.onSyllabusGradeChange(this.value)">
                  ${catalog.map(g => `<option value="${g.id}" ${g.id === currentGradeId ? 'selected' : ''}>${g.label}</option>`).join('')}
                </select>
                ${hasAdminEditPower ? `<button class="btn btn-red btn-sm" onclick="window.app.openCreateSyllabusModal()">+ Crear Sílabo</button>` : ''}
              ` : `
                <div style="font-size: 13px; color: var(--color-navy-950); font-weight: 800; background: var(--color-yellow-100); padding: 6px 14px; border-radius: 6px; border: 1px solid var(--color-yellow-400);">
                  📚 Cursos de: <strong>${currentGrade.label}</strong>
                </div>
              `}
            </div>
          </div>

          <div class="syllabus-card-grid">
            ${syllabiList.map(s => `
              <div class="syllabus-card">
                <div>
                  <div class="syllabus-header"><span class="syllabus-code">${s.courseCode}</span><span class="status-badge status-approved">${s.bimester}</span></div>
                  <h3 class="syllabus-title">${s.courseName}</h3>
                  <div class="syllabus-meta-list"><div>👨‍Docente: ${s.teacher}</div><div>⏱️ Carga: ${s.hoursWeekly || '4 hrs'}</div></div>
                  <div class="competency-tag-box">${(s.competencies || ['Competencia General']).map(c => `<span class="competency-pill">✓ ${c}</span>`).join('')}</div>
                </div>
                <div style="border-top:1px solid var(--border-subtle); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
                  <button class="btn btn-navy btn-sm" onclick="window.app.openSyllabusModal('${s.id}')">Ver Completo</button>
                  ${hasAdminEditPower ? `<div><button class="btn btn-outline btn-sm" onclick="window.app.openEditSyllabusModal('${s.id}')">✏️</button> <button class="btn btn-outline btn-sm" style="color:var(--color-red-600);" onclick="window.app.confirmDeleteSyllabus('${s.id}')">🗑️</button></div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // AULA VIRTUAL: MATERIALES SEMANALES Y EVALUACIONES DINÁMICAS (10 PREGUNTAS)
  // =========================================================================
  renderTasks(state) {
    const role = state.currentRole;
    const isTeacherOrAdmin = role === 'admin' || role === 'docente' || role === 'director';
    const isEstudiante = role === 'estudiante';
    const isPadre = role === 'padre';

    const materials = state.weeklyMaterials || initialData.weeklyMaterials || [];
    const currentUser = this.getCurrentUser(state);
    const currentUserName = (currentUser.name || "").toLowerCase();

    // Catálogo completo de cursos por grado y docente
    const allCourses = [
      { id: "MAT-401", name: "Matemática Avanzada (Álgebra y Geometría)", teacher: "Prof. Roberto Silva", grade: "4to de Secundaria", icon: "📐", color: "blue", level: "Secundaria" },
      { id: "COM-404", name: "Comunicación & Literatura", teacher: "Miss María Daysi Reyes", grade: "4to de Secundaria", icon: "📚", color: "navy", level: "Secundaria" },
      { id: "CTA-403", name: "Ciencia y Tecnología (Física & Química)", teacher: "Miss Leyli Reyes Cerquen", grade: "4to de Secundaria", icon: "🔬", color: "green", level: "Secundaria" },
      { id: "EPT-402", name: "Computación e Informática / Robótica", teacher: "Prof. Fernando Rojas", grade: "4to de Secundaria", icon: "💻", color: "yellow", level: "Secundaria" },
      { id: "ING-405", name: "Inglés Técnico & Gramática", teacher: "Miss Andrea Ramos", grade: "4to de Secundaria", icon: "🇬🇧", color: "blue", level: "Secundaria" },
      { id: "CS-406", name: "Ciencias Sociales & Historia", teacher: "Prof. Javier Vega", grade: "4to de Secundaria", icon: "🌎", color: "yellow", level: "Secundaria" },
      { id: "MAT-501", name: "Matemática & Razonamiento Matemático", teacher: "Prof. Roberto Silva", grade: "5° de Primaria", icon: "📐", color: "blue", level: "Primaria" },
      { id: "COM-501", name: "Comunicación Integral & Comprensión Lectora", teacher: "Miss Julisa Magali Arroyo", grade: "5° de Primaria", icon: "📚", color: "navy", level: "Primaria" },
      { id: "CTA-501", name: "Ciencia y Tecnología", teacher: "Miss Leyli Reyes Cerquen", grade: "5° de Primaria", icon: "🔬", color: "green", level: "Primaria" },
      { id: "MAT-101", name: "Matemática Lúdica y Razonamiento", teacher: "Miss Julisa Magali Arroyo", grade: "1ro de Primaria", icon: "🔢", color: "blue", level: "Primaria" },
      { id: "COM-101", name: "Comunicación Integral & Caligrafía", teacher: "Miss Julisa Magali Arroyo", grade: "1ro de Primaria", icon: "✏️", color: "green", level: "Primaria" }
    ];

    // Filtrar cursos según el perfil del usuario activo
    let availableCourses = allCourses;
    if (role === 'docente') {
      const myCourses = allCourses.filter(c => c.teacher.toLowerCase().includes("silva") || currentUserName.includes("silva") || c.teacher.toLowerCase().includes(currentUserName));
      availableCourses = myCourses.length > 0 ? myCourses : allCourses;
    } else if (role === 'estudiante') {
      const gradeText = (currentUser.gradeLevel || currentUser.detail || currentUser.grade || "").toLowerCase();
      const isPrimaria = gradeText.includes("prim") || gradeText.includes("pri");
      availableCourses = isPrimaria ? allCourses.filter(c => c.level === "Primaria") : allCourses.filter(c => c.level === "Secundaria");
    }

    const selectedCourseId = state.selectedVirtualCourseId || (availableCourses[0] ? availableCourses[0].id : "MAT-401");
    const currentCourse = availableCourses.find(c => c.id === selectedCourseId) || availableCourses[0] || allCourses[0];

    // Filtrar materiales del curso seleccionado
    let courseMaterials = materials.filter(m => m.courseId === selectedCourseId);
    if (courseMaterials.length === 0 && materials.length > 0) {
      courseMaterials = [materials[0]];
    }
    
    // Material activo / seleccionado (semana activa)
    const selectedWeekId = state.selectedVirtualWeekId || (courseMaterials[0] ? courseMaterials[0].id : null);
    const activeMaterial = courseMaterials.find(m => m.id === selectedWeekId) || courseMaterials[0] || materials[0];

    // Obtener datos del alumno logueado para verificar sus intentos
    const currentStudentId = currentUser.code || currentUser.id || "EST-2026-055";
    const studentAttempt = activeMaterial && activeMaterial.studentAttempts 
      ? activeMaterial.studentAttempts.find(a => a.studentId === currentStudentId) 
      : null;

    // Métricas del aula para el docente
    const totalWeeklySessions = courseMaterials.length;
    const totalEvaluations = courseMaterials.filter(m => m.evaluation && m.evaluation.questions && m.evaluation.questions.length > 0).length;
    const allAttemptsInCourse = courseMaterials.reduce((acc, m) => acc + (m.studentAttempts ? m.studentAttempts.length : 0), 0);

    const studentDisplayName = currentUser.name || "Estudiante";
    const studentDisplayGrade = currentUser.gradeLevel || currentUser.detail || currentUser.grade || "5° de Primaria";

    return `
      <div class="fade-in">
        
        <!-- Encabezado Principal del Aula Virtual -->
        <div class="card" style="margin-bottom: var(--space-6); border-top: 4px solid var(--color-navy-800);">
          <div class="card-header" style="flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 class="card-title" style="font-size: var(--font-size-xl); margin: 0;">💻 Aula Virtual & Evaluaciones Dinámicas Semanales</h2>
                <span class="status-badge status-approved" style="background: var(--color-yellow-100); color: var(--color-yellow-800); font-weight: 800;">
                  Periodo Lectivo 2026 • III Bimestre
                </span>
                ${isTeacherOrAdmin ? `<span class="status-badge" style="background:#dbeafe; color:#1e40af; font-weight:800;">👨‍Modo Gestión Docente</span>` : ''}
                ${isEstudiante ? `<span class="status-badge" style="background:#dcfce7; color:#166534; font-weight:800;">Alumno(a): ${studentDisplayName} (${studentDisplayGrade})</span>` : ''}
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                I.E.P. "El Educador" • Publicación continua del trabajo realizado en el aula y generación automática de evaluaciones dinámicas de 10 preguntas con retroalimentación inmediata.
              </p>
            </div>

            <!-- Botones de Acción para el Docente -->
            ${isTeacherOrAdmin ? `
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <button class="btn btn-navy btn-sm" onclick="window.app.openUploadMaterialModal('${selectedCourseId}')" style="font-weight: 800;">
                  ➕ Subir Material Semanal
                </button>
                ${activeMaterial ? `
                  <button class="btn btn-gold btn-sm" onclick="window.app.openGenerateQuizModal('${activeMaterial.id}')" style="font-weight: 800;">
                    ⚡ Generar Evaluación (10 Preguntas)
                  </button>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Selector de Asignatura / Curso -->
          <div style="display: flex; border-top: 1px solid var(--border-subtle); background: var(--bg-surface-subtle); padding: 10px 14px; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-size: 12px; font-weight: 800; color: var(--color-navy-900);">Seleccionar Asignatura:</span>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                ${availableCourses.map(c => `
                  <button class="btn btn-sm ${c.id === selectedCourseId ? 'btn-navy' : 'btn-outline'}" onclick="window.app.onVirtualCourseChange('${c.id}')" style="font-size: 11.5px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
                    <span>${c.icon}</span> <span>${c.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>

            <div style="font-size: 12px; color: var(--text-muted);">
              <strong>Docente Responsable:</strong> <span style="color: var(--color-navy-900); font-weight: bold;">${currentCourse.teacher}</span> • <span>${currentCourse.grade}</span>
            </div>
          </div>
        </div>

        <!-- Panel de Métricas Rápidas del Curso (Visible para Docente y Admin) -->
        ${isTeacherOrAdmin ? `
          <div class="teacher-stat-grid" style="margin-bottom: var(--space-6);">
            <div class="teacher-stat-card" style="border-left: 4px solid #3b82f6;">
              <span class="teacher-stat-lbl">📁 Sesiones Semanales</span>
              <span class="teacher-stat-val" style="color: #1e40af;">${totalWeeklySessions} Semanas</span>
              <span style="font-size: 10.5px; color: #64748b;">Materiales de clase subidos</span>
            </div>
            <div class="teacher-stat-card" style="border-left: 4px solid #f59e0b;">
              <span class="teacher-stat-lbl">⚡ Evaluaciones Dinámicas</span>
              <span class="teacher-stat-val" style="color: #b45309;">${totalEvaluations} Quizzes (10 Preg.)</span>
              <span style="font-size: 10.5px; color: #64748b;">Con retroalimentación IA</span>
            </div>
            <div class="teacher-stat-card" style="border-left: 4px solid #10b981;">
              <span class="teacher-stat-lbl">👥 Evaluaciones Rendidas</span>
              <span class="teacher-stat-val" style="color: #065f46;">${allAttemptsInCourse} Intentos</span>
              <span style="font-size: 10.5px; color: #64748b;">Estudiantes evaluados</span>
            </div>
            <div class="teacher-stat-card" style="border-left: 4px solid #8b5cf6;">
              <span class="teacher-stat-lbl">Promedio de Logro</span>
              <span class="teacher-stat-val" style="color: #5b21b6;">17.8 / 20</span>
              <span style="font-size: 10.5px; color: #64748b;">Nivel Logro Destacado (AD)</span>
            </div>
          </div>
        ` : ''}

        <!-- Pestañas de Navegación por Semanas del Curso -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 6px;">
          ${courseMaterials.map((m, idx) => `
            <button class="btn btn-sm ${m.id === (activeMaterial && activeMaterial.id) ? 'btn-gold' : 'btn-outline'}" onclick="window.app.onVirtualWeekChange('${m.id}')" style="font-weight: 800; font-size: 12px; white-space: nowrap; padding: 6px 14px; display: flex; align-items: center; gap: 6px;">
              <span>🗓️ Semana ${m.weekNumber}</span>
              ${m.evaluation ? `<span style="background:#1e3a8a; color:white; font-size:9px; padding:1px 5px; border-radius:10px;">⚡ 10P</span>` : ''}
            </button>
          `).join('')}
          ${isTeacherOrAdmin ? `
            <button class="btn btn-sm btn-outline" onclick="window.app.openUploadMaterialModal('${selectedCourseId}')" style="font-weight: 800; font-size: 12px; white-space: nowrap; border-style: dashed;">
              + Nueva Semana
            </button>
          ` : ''}
        </div>

        ${!activeMaterial ? `
          <div class="card" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 40px; margin-bottom: 10px;">📚</div>
            <h3 style="font-size: 18px; color: var(--color-navy-900); font-weight: 800;">No hay sesiones registradas aún en este curso</h3>
            <p style="font-size: 13px; color: var(--text-muted); max-width: 500px; margin: 0 auto 16px;">
              El docente responsable publicará cada semana el resumen de la clase presencial, diapositivas y la evaluación dinámica de 10 preguntas.
            </p>
            ${isTeacherOrAdmin ? `
              <button class="btn btn-navy" onclick="window.app.openUploadMaterialModal('${selectedCourseId}')">
                + Subir Primer Material Semanal
              </button>
            ` : ''}
          </div>
        ` : `
          <!-- =====================================================================
               DETALLE DE LA SESIÓN SEMANAL ACTIVA
               ===================================================================== -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start;">
            
            <!-- Columna Izquierda: Trabajo Realizado en el Aula, Resumen y Materiales Adjuntos -->
            <div>
              
              <!-- Tarjeta de Contenido de la Clase Presencial -->
              <div class="card" style="margin-bottom: var(--space-5);">
                <div class="card-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; gap: 8px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
                      <span class="status-badge" style="background: #e0e7ff; color: #3730a3; font-weight: 800; font-size: 10.5px;">
                        Semana ${activeMaterial.weekNumber} • ${activeMaterial.bimester}
                      </span>
                      <span style="font-size: 11px; color: var(--text-muted);">🗓️ Fecha de Clase: ${activeMaterial.sessionDate}</span>
                    </div>
                    <h3 style="font-size: 17px; font-weight: 900; color: var(--color-navy-900); margin: 0;">
                      ${activeMaterial.title}
                    </h3>
                  </div>

                  ${isTeacherOrAdmin ? `
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-outline btn-sm" onclick="window.app.openEditMaterialModal('${activeMaterial.id}')" title="Editar Sesión" style="padding: 4px 8px; font-size: 11px;">
                        ✏️ Editar
                      </button>
                      <button class="btn btn-red btn-sm" onclick="window.app.confirmDeleteMaterial('${activeMaterial.id}')" title="Eliminar Sesión" style="padding: 4px 8px; font-size: 11px;">
                        🗑️
                      </button>
                    </div>
                  ` : ''}
                </div>

                <div style="padding: 20px;">
                  <!-- Resumen Pedagógico del Trabajo en el Aula -->
                  <h4 style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                    <span>👨‍Resumen del Trabajo Realizado en el Aula:</span>
                  </h4>
                  <div style="background: #f1f5f9; border-left: 4px solid var(--color-navy-800); padding: 14px 16px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #334155; margin-bottom: 18px;">
                    ${activeMaterial.summary}
                  </div>

                  <!-- Conceptos Clave Trabajados -->
                  <h4 style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 8px;">
                    Conceptos Clave Abordados en Clase:
                  </h4>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 20px;">
                    ${(activeMaterial.keyConcepts || []).map(c => `
                      <span style="font-size: 11.5px; font-weight: 700; background: #e2e8f0; color: #1e293b; padding: 4px 10px; border-radius: 6px; border: 1px solid #cbd5e1;">
                        ✓ ${c}
                      </span>
                    `).join('')}
                  </div>

                  <!-- Materiales y Recursos Adjuntos para Descargar -->
                  <h4 style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                    <span>📎 Materiales de Estudio y Recursos de la Clase:</span>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: normal;">${(activeMaterial.attachments || []).length} archivos adjuntos</span>
                  </h4>
                  
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
                    ${(activeMaterial.attachments || []).map((att, attIdx) => {
                      const isPpt = (att.name || '').toLowerCase().endsWith('.ppt') || (att.name || '').toLowerCase().endsWith('.pptx');
                      const isPdf = (att.name || '').toLowerCase().endsWith('.pdf');
                      const fileIcon = att.icon || (isPpt ? '📊' : isPdf ? '📕' : '📄');
                      const badgeLabel = isPpt ? 'Diapositivas PPT' : isPdf ? 'Guía PDF' : 'Documento';
                      return `
                        <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); transition: transform 0.2s;" class="hover-shadow">
                          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
                            <div style="font-size: 26px;">${fileIcon}</div>
                            <div style="min-width: 0;">
                              <div style="font-size: 12.5px; font-weight: 800; color: var(--color-navy-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${att.name}">
                                ${att.name}
                              </div>
                              <div style="font-size: 11px; color: var(--text-muted); display: flex; gap: 6px; align-items: center; margin-top: 2px;">
                                <span style="background:#f1f5f9; padding: 1px 6px; border-radius: 4px; font-weight: 700; color:#475569;">${badgeLabel}</span>
                                <span>${att.size || 'Oficial'}</span>
                              </div>
                            </div>
                          </div>
                          <button class="btn btn-navy btn-sm" onclick="window.app.downloadMaterialAttachment('${att.name}', '${activeMaterial.id}', ${attIdx})" style="padding: 6px 14px; font-size: 12px; font-weight: 800; border-radius: 16px; white-space: nowrap; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 6px rgba(11,19,43,0.2);" title="Descargar material para estudiar en casa">
                            <span>⬇️</span> <span>Descargar</span>
                          </button>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>

            </div>

            <!-- Columna Derecha: MÓDULO DE EVALUACIÓN DINÁMICA (10 PREGUNTAS) -->
            <div>
              
              <div class="card" style="border: 2px solid ${activeMaterial.evaluation ? '#3b82f6' : '#cbd5e1'}; box-shadow: 0 4px 12px rgba(59,130,246,0.08);">
                <div class="card-header" style="background: ${activeMaterial.evaluation ? 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' : '#f8fafc'}; color: ${activeMaterial.evaluation ? '#ffffff' : '#0b132b'};">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">⚡</span>
                    <div>
                      <h3 style="font-size: 15px; font-weight: 900; margin: 0; color: ${activeMaterial.evaluation ? '#ffffff' : '#0b132b'};">
                        Evaluación Dinámica Semanal
                      </h3>
                      <span style="font-size: 11px; opacity: 0.9;">10 Preguntas con Retroalimentación</span>
                    </div>
                  </div>
                </div>

                <div style="padding: 18px;">
                  ${!activeMaterial.evaluation ? `
                    <!-- Caso: Aún no se ha generado la evaluación -->
                    <div style="text-align: center; padding: 20px 10px;">
                      <div style="font-size: 32px; margin-bottom: 8px;">🤖</div>
                      <h4 style="font-size: 14px; font-weight: 800; color: var(--color-navy-900);">Evaluación no generada</h4>
                      <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
                        El sistema puede generar un cuestionario dinámico de 10 preguntas calibrado automáticamente sobre el tema de esta semana.
                      </p>
                      ${isTeacherOrAdmin ? `
                        <button class="btn btn-gold btn-sm" onclick="window.app.openGenerateQuizModal('${activeMaterial.id}')" style="width: 100%; font-weight: 800;">
                          ⚡ Generar 10 Preguntas con IA
                        </button>
                      ` : `
                        <span class="status-badge status-pending" style="font-size: 11px;">Pendiente de publicación por el profesor</span>
                      `}
                    </div>
                  ` : `
                    <!-- Caso: Evaluación de 10 preguntas Lista -->
                    <div style="margin-bottom: 14px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 12px; font-weight: 800; color: #1e293b;">Estructura del Test:</span>
                        <span class="status-badge status-approved" style="font-size: 10.5px; font-weight: 800;">10 Ítems • 20 Puntos</span>
                      </div>
                      
                      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; font-size: 11.5px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        <div>⏱️ <strong>Tiempo:</strong> 20 min</div>
                        <div>🎯 <strong>Mínimo:</strong> 14 pts</div>
                        <div><strong>Puntaje:</strong> 2 pts c/u</div>
                        <div>🤖 <strong>IA Feedback:</strong> Activo</div>
                      </div>
                    </div>

                    <!-- ESTADO PARA EL ALUMNO LOGUEADO -->
                    ${isEstudiante ? `
                      ${studentAttempt ? `
                        <!-- Alumno ya rindió la prueba -->
                        <div style="background: ${studentAttempt.score >= 14 ? '#ecfdf5' : '#fff1f2'}; border: 2px solid ${studentAttempt.score >= 14 ? '#10b981' : '#f43f5e'}; border-radius: 8px; padding: 14px; margin-bottom: 14px; text-align: center;">
                          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${studentAttempt.score >= 14 ? '#047857' : '#be123c'};">Tu Calificación Obtenida:</span>
                          <div style="font-size: 28px; font-weight: 900; color: ${studentAttempt.score >= 14 ? '#047857' : '#be123c'}; margin: 4px 0;">
                            ${studentAttempt.score} / 20
                          </div>
                          <span class="status-badge ${studentAttempt.score >= 14 ? 'status-approved' : 'status-failed'}" style="font-weight: 800; font-size: 11px;">
                            ${studentAttempt.status} (${studentAttempt.correctCount} / 10 correctas)
                          </span>
                          <p style="font-size: 11px; color: #475569; margin-top: 8px; line-height: 1.4; text-align: left; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 4px;">
                            <strong>Retroalimentación del Sistema:</strong> ${studentAttempt.feedback}
                          </p>
                        </div>

                        <div style="display: flex; flex-direction: column; gap: 8px;">
                          <button class="btn btn-navy btn-sm" onclick="window.app.openQuizResultsModal('${activeMaterial.id}')" style="width: 100%; font-weight: 800;">
                            👁️ Revisar Respuestas y Explicaciones
                          </button>
                          <button class="btn btn-outline btn-sm" onclick="window.app.startStudentQuiz('${activeMaterial.id}')" style="width: 100%; font-weight: 700; font-size: 11px;">
                            Rendir Nuevo Intento de Refuerzo
                          </button>
                        </div>
                      ` : `
                        <!-- Alumno no ha rendido la prueba aún -->
                        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-bottom: 14px; text-align: center;">
                          <span style="font-size: 11px; font-weight: 800; color: #1e40af; text-transform: uppercase;">Estado: Pendiente</span>
                          <p style="font-size: 12px; color: #1e3a8a; margin: 6px 0 12px;">
                            Pon a prueba lo aprendido en la clase de <strong>${activeMaterial.title}</strong> con esta evaluación de 10 preguntas.
                          </p>
                          <button class="btn btn-gold" onclick="window.app.startStudentQuiz('${activeMaterial.id}')" style="width: 100%; font-weight: 900; font-size: 13px; padding: 10px;">
                            📝 Iniciar Evaluación (10 Preguntas)
                          </button>
                        </div>
                      `}
                    ` : ''}

                    <!-- ESTADO PARA EL DOCENTE O ADMINISTRADOR -->
                    ${isTeacherOrAdmin ? `
                      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                        <button class="btn btn-navy btn-sm" onclick="window.app.openPreviewQuizModal('${activeMaterial.id}')" style="width: 100%; font-weight: 800;">
                          👁️ Previsualizar / Editar 10 Preguntas
                        </button>
                        <button class="btn btn-outline btn-sm" onclick="window.app.confirmRegenerateQuiz('${activeMaterial.id}')" style="width: 100%; font-weight: 700; font-size: 11.5px;">
                          ⚡ Regenerar Cuestionario con IA
                        </button>
                      </div>

                      <!-- Tabla Resumen de Alumnos que rindieron la prueba -->
                      <h4 style="font-size: 12px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 6px; display: flex; justify-content: space-between;">
                        <span>Estudiantes Evaluados:</span>
                        <span style="color: #047857;">${(activeMaterial.studentAttempts || []).length} alumnos</span>
                      </h4>

                      <div style="max-height: 180px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <table style="width: 100%; font-size: 11px; border-collapse: collapse;">
                          <thead style="background: #f1f5f9; position: sticky; top: 0;">
                            <tr>
                              <th style="padding: 6px; text-align: left;">Alumno</th>
                              <th style="padding: 6px; text-align: center;">Aciertos</th>
                              <th style="padding: 6px; text-align: right;">Nota</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${(activeMaterial.studentAttempts && activeMaterial.studentAttempts.length > 0) ? activeMaterial.studentAttempts.map(att => `
                              <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 5px 6px;">
                                  <strong>${att.studentName}</strong><br>
                                  <span style="font-size: 9.5px; color: #64748b;">${att.date}</span>
                                </td>
                                <td style="padding: 5px 6px; text-align: center;">
                                  <span style="font-weight: 800;">${att.correctCount}/10</span>
                                </td>
                                <td style="padding: 5px 6px; text-align: right;">
                                  <span class="status-badge ${att.score >= 14 ? 'status-approved' : 'status-failed'}" style="font-size: 10px; font-weight: 900;">
                                    ${att.score}
                                  </span>
                                </td>
                              </tr>
                            `).join('') : `
                              <tr>
                                <td colspan="3" style="text-align: center; padding: 14px; color: #94a3b8;">
                                  Ningún alumno ha rendido la evaluación aún.
                                </td>
                              </tr>
                            `}
                          </tbody>
                        </table>
                      </div>
                    ` : ''}

                    <!-- ESTADO PARA EL PADRE DE FAMILIA -->
                    ${isPadre ? `
                      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px;">
                        <h4 style="font-size: 12px; font-weight: 800; color: #1e3a8a; margin-bottom: 6px;">
                          Informe de Evaluación para el Apoderado
                        </h4>
                        ${studentAttempt ? `
                          <div style="font-size: 13px; margin-bottom: 6px;">
                            Calificación de su menor hija(o): <strong style="color: #047857; font-size: 15px;">${studentAttempt.score} / 20</strong> (${studentAttempt.status})
                          </div>
                          <p style="font-size: 11.5px; color: #475569; margin: 0 0 10px; line-height: 1.4;">
                            ${studentAttempt.feedback}
                          </p>
                          <button class="btn btn-navy btn-sm" onclick="window.app.openQuizResultsModal('${activeMaterial.id}')" style="width: 100%; font-size: 11px;">
                            👁️ Ver Respuestas y Retroalimentación
                          </button>
                        ` : `
                          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                            Su menor hija(o) aún no ha rendido la evaluación de esta semana.
                          </p>
                        `}
                      </div>
                    ` : ''}

                  `}
                </div>
              </div>

            </div>

          </div>
        `}

      </div>
    `;
  },

  // =========================================================================
  // CONTROL DE ASISTENCIA BIOMÉTRICO Y DIARIO (TARDANZAS, INASISTENCIAS & QR)
  // =========================================================================
  renderAttendance(state) {
    const role = state.currentRole;
    const isTeacherOrAdmin = role === "admin" || role === "director" || role === "docente" || role === "auxiliar";
    const isPadre = role === "padre";
    const isEstudiante = role === "estudiante";
    const catalog = state.gradesCatalog || initialData.gradesCatalog;

    let selectedGradeId = state.selectedAttendanceGrade || "4sec";
    let selectedDate = state.selectedAttendanceDate || "19/08/2026";
    let activeSubTab = state.attendanceActiveSubTab || (isTeacherOrAdmin ? "door-scanner" : "student-history");

    if (isPadre || isEstudiante) {
      activeSubTab = "student-history";
    }

    // Si es padre de familia o estudiante, obtener datos exactos del usuario activo
    let studentName = "Estudiante";
    let studentGrade = "5° de Primaria";
    let studentCode = "EST-2026-055";

    if (isPadre) {
      const parentUser = this.getCurrentUser(state);
      const children = (parentUser && parentUser.children) || [];
      const selectedId = (parentUser && parentUser.selectedChildId) || (children[0] && children[0].id);
      const student = children.find(c => c.id === selectedId) || children[0];
      if (student) {
        studentName = student.name;
        studentGrade = student.grade;
        studentCode = student.id;
      } else if (parentUser.studentName) {
        studentName = parentUser.studentName;
        studentGrade = parentUser.detail || "5° de Primaria";
        studentCode = parentUser.id || "EST-2026-055";
      }
      selectedGradeId = this.getGradeIdFromLabel(studentGrade);
    } else if (isEstudiante) {
      const studentUser = this.getCurrentUser(state);
      studentName = studentUser.name || "Salim Gael Cáceres Quispe";
      studentGrade = studentUser.gradeLevel || studentUser.detail || studentUser.grade || "5° de Primaria";
      studentCode = studentUser.code || studentUser.id || "EST-2026-055";
      selectedGradeId = this.getGradeIdFromLabel(studentGrade);
    }

    const currentGrade = (catalog && catalog.find(g => g && (g.id === selectedGradeId))) || (catalog && catalog[0]) || { id: "5prim", label: "5° de Primaria", level: "Primaria", tutor: "Prof. Roberto Silva", classroom: "Aula 501" };
    const records = (state && state.attendanceRecords) || (initialData && initialData.attendanceRecords) || [];
    const enrollments = (state && state.enrollments) || (initialData && initialData.enrollments) || [];
    
    // Filtrar por grado y fecha para vista de aula de forma 100% segura
    const classroomRecords = records.filter(r => {
      if (!r) return false;
      const matchesGrade = (r.gradeId && r.gradeId === selectedGradeId) || 
                           (r.grade && currentGrade && currentGrade.label && typeof r.grade === 'string' && r.grade.includes(currentGrade.label));
      return matchesGrade && r.date === selectedDate;
    });
    
    // Métricas de aula
    const totalStudents = classroomRecords.length > 0 ? classroomRecords.length : 4;
    const presentCount = classroomRecords.filter(r => r && r.status === "Presente").length;
    const lateCount = classroomRecords.filter(r => r && r.status === "Tardanza").length;
    const absentCount = classroomRecords.filter(r => r && r.status === "Falta").length;
    const justifiedCount = classroomRecords.filter(r => r && r.status === "Justificada").length;
    const attendancePct = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 100;

    // Reporte Diario Global de Tardanzas e Inasistencias
    let dayReport = (window.appStore && typeof window.appStore.getDailyAttendanceReport === 'function') 
      ? window.appStore.getDailyAttendanceReport(selectedDate) 
      : ((window.app && window.app.store && typeof window.app.store.getDailyAttendanceReport === 'function')
        ? window.app.store.getDailyAttendanceReport(selectedDate)
        : {
          date: selectedDate,
          totalEnrolled: enrollments.length,
          presentList: [],
          tardinessList: classroomRecords.filter(r => r && r.status === "Tardanza"),
          absenceList: classroomRecords.filter(r => r && r.status === "Falta"),
          justifiedList: classroomRecords.filter(r => r && r.status === "Justificada"),
          attendanceRate: 94
        });

    if (!dayReport) dayReport = {};
    if (!Array.isArray(dayReport.tardinessList)) dayReport.tardinessList = [];
    if (!Array.isArray(dayReport.absenceList)) dayReport.absenceList = [];
    if (!Array.isArray(dayReport.presentList)) dayReport.presentList = [];
    if (!Array.isArray(dayReport.justifiedList)) dayReport.justifiedList = [];

    // Historial del estudiante individual (para Padre o Estudiante)
    const rawStudentHistory = records.filter(r => {
      if (!r) return false;
      if (studentCode && (r.studentCode === studentCode || r.studentId === studentCode || r.dni === studentCode)) return true;
      if (studentName && r.studentName && r.studentName.trim().toLowerCase() === studentName.trim().toLowerCase()) return true;
      return false;
    });

    const studentHistory = rawStudentHistory.length > 0 ? rawStudentHistory : [
      { date: "19/08/2026", day: "Miércoles", arrivalTime: "07:38 AM", exitTime: "03:30 PM", status: "Presente", method: "Fotocheck QR (Portería)", observations: "Ingreso puntual" },
      { date: "18/08/2026", day: "Martes", arrivalTime: "07:35 AM", exitTime: "03:30 PM", status: "Presente", method: "Fotocheck QR (Portería)", observations: "Ingreso puntual" },
      { date: "15/08/2026", day: "Viernes", arrivalTime: "07:40 AM", exitTime: "03:30 PM", status: "Presente", method: "Fotocheck QR (Portería)", observations: "Ingreso puntual" },
      { date: "14/08/2026", day: "Jueves", arrivalTime: "07:36 AM", exitTime: "03:30 PM", status: "Presente", method: "Fotocheck QR (Portería)", observations: "Ingreso puntual" }
    ];

    return `
      <div class="fade-in">
        
        <!-- ENCABEZADO INSTITUCIONAL DE ASISTENCIA -->
        <div class="welcome-banner" style="margin-bottom: var(--space-4);">
          <div class="welcome-content">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span class="status-badge status-approved" style="background: #22c55e; color: #0b132b; font-weight: 800;">
                <span class='status-dot-green'></span> SISTEMA QR & BIOMÉTRICO EN PUERTA ACTIVO
              </span>
              <span style="font-size: 11.5px; opacity: 0.9;">Tolerancia Oficial: 07:45 AM • UGEL 05 S.J.L.</span>
            </div>
            <h1 class="welcome-title">
              ${isTeacherOrAdmin ? 'Control de Asistencia Escolar & Estación de Portería' : (isPadre ? 'Récord de Asistencia de mi Hijo(a)' : 'Mi Historial de Asistencia & Fotocheck')}
            </h1>
            <p class="welcome-subtitle">
              ${isTeacherOrAdmin 
                ? 'Módulo exclusivo de Auxiliares y Docentes para registro biométrico/QR en puerta, parte diario de inasistencias y reportes oficiales.' 
                : 'Consulta de marcaciones de ingreso, justificación de tardanzas y credencial escolar con código QR.'}
            </p>
          </div>
        </div>

        ${isTeacherOrAdmin ? `
          <!-- =========================================================================
               SUB-PESTAÑAS DE CONTROL DE ASISTENCIA Y PORTERÍA (EXCLUSIVO PROFESORES / AUXILIARES / DIRECCIÓN)
               ========================================================================= -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; overflow-x: auto;">
            <button class="btn btn-sm ${activeSubTab === 'door-scanner' ? 'btn-gold' : 'btn-outline'}" onclick="window.app.setAttendanceSubTab('door-scanner')" style="font-weight: 900; font-size: 12.5px; white-space: nowrap; padding: 8px 16px; border: 2px solid #f59e0b; box-shadow: ${activeSubTab === 'door-scanner' ? '0 2px 8px rgba(245,158,11,0.4)' : 'none'};">
              1. Registro de Ingreso (Escáner QR en Portería)
            </button>
            <button class="btn btn-sm ${activeSubTab === 'id-cards' ? 'btn-gold' : 'btn-outline'}" onclick="window.app.setAttendanceSubTab('id-cards')" style="font-weight: 900; font-size: 12px; white-space: nowrap; padding: 7px 14px;">
              2. Generador de Códigos QR (Sin Fotos)
            </button>
            <button class="btn btn-sm ${activeSubTab === 'daily-report' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAttendanceSubTab('daily-report')" style="font-weight: 800; font-size: 12px; white-space: nowrap; padding: 7px 14px; position: relative;">
              <span>3. Parte Diario de Tardanzas e Inasistencias (Corte 08:30 AM)</span>
              ${dayReport.tardinessList.length > 0 || dayReport.absenceList.length > 0 ? `
                <span style="background: #ef4444; color: white; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 900; margin-left: 4px;">
                  ${dayReport.tardinessList.length + dayReport.absenceList.length}
                </span>
              ` : ''}
            </button>
            <button class="btn btn-sm ${activeSubTab === 'classroom' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAttendanceSubTab('classroom')" style="font-weight: 800; font-size: 12px; white-space: nowrap; padding: 7px 14px;">
              4. Lista y Marcación por Aula
            </button>
            <button class="btn btn-sm ${activeSubTab === 'incidents' ? 'btn-red' : 'btn-outline'}" onclick="window.app.setAttendanceSubTab('incidents')" style="font-weight: 800; font-size: 12px; white-space: nowrap; padding: 7px 14px; position: relative;">
              <span>5. Libro de Incidencias Conductuales</span>
              <span style="background: #dc2626; color: white; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 900; margin-left: 4px;">
                ${(state.behaviorIncidents || initialData.behaviorIncidents || []).length}
              </span>
            </button>
          </div>
        ` : ''}

          <!-- =====================================================================
               SUB-PESTAÑA 1: LISTA Y MARCACIÓN POR AULA
               ===================================================================== -->
          ${activeSubTab === 'classroom' ? `
            
            <!-- FILTROS Y SELECTORES DE AULA / FECHA -->
            <div class="card" style="margin-bottom: var(--space-4); padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <div>
                    <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 2px;">Grado / Aula:</label>
                    <select class="form-control" style="font-weight: bold; font-size: 12px; border-color: #3b82f6; width: auto;" onchange="window.app.onAttendanceGradeChange(this.value)">
                      ${catalog.map(g => `<option value="${g.id}" ${g.id === selectedGradeId ? 'selected' : ''}>${g.label} (${g.level})</option>`).join('')}
                    </select>
                  </div>

                  <div>
                    <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 2px;">📅 Fecha de Control:</label>
                    <select class="form-control" style="font-weight: bold; font-size: 12px; border-color: #3b82f6; width: auto;" onchange="window.app.onAttendanceDateChange(this.value)">
                      <option value="19/08/2026" ${selectedDate === '19/08/2026' ? 'selected' : ''}>Hoy - Miércoles 19/08/2026</option>
                      <option value="18/08/2026" ${selectedDate === '18/08/2026' ? 'selected' : ''}>Ayer - Martes 18/08/2026</option>
                      <option value="15/08/2026" ${selectedDate === '15/08/2026' ? 'selected' : ''}>Viernes 15/08/2026</option>
                    </select>
                  </div>

                  <div style="font-size: 11.5px; color: #475569; background: #f1f5f9; padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 14px;">
                    Tutor de Aula: <strong>${currentGrade.tutor || 'Prof. Roberto Silva'}</strong> • Aula: <strong>${currentGrade.classroom || 'Aula Principal'}</strong>
                  </div>
                </div>

                <!-- BOTONES DE ACCIÓN RÁPIDA -->
                <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px;">
                  <button class="btn btn-gold btn-sm" onclick="window.app.markAllClassroomPresent('${selectedGradeId}', '${selectedDate}')" style="font-weight: 800; font-size: 11.5px;">
                    ⚡ Marcar Todos Presentes
                  </button>
                  <button class="btn btn-navy btn-sm" onclick="window.app.setAttendanceSubTab('door-scanner')" style="font-weight: 800; font-size: 11.5px;">
                    [Cámara] Escanear QR en Puerta
                  </button>
                  <button class="btn btn-outline btn-sm" onclick="window.app.openMonthlyAttendanceReportModal('${selectedGradeId}')" style="font-weight: 800; font-size: 11.5px;">
                    Consolidado UGEL 05
                  </button>
                </div>

              </div>
            </div>

            <!-- MÉTRICAS RESUMEN DEL DÍA -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; margin-bottom: var(--space-4);">
              <div class="card" style="padding: 12px; border-left: 4px solid #3b82f6; background: #eff6ff;">
                <span style="font-size: 11px; font-weight: 800; color: #1e40af;">👥 MATRICULADOS</span>
                <div style="font-size: 22px; font-weight: 900; color: #1e3a8a; margin: 2px 0;">${totalStudents} Alumnos</div>
                <span style="font-size: 10px; color: #64748b;">Padrón de Aula</span>
              </div>
              
              <div class="card" style="padding: 12px; border-left: 4px solid #10b981; background: #ecfdf5;">
                <span style="font-size: 11px; font-weight: 800; color: #065f46;"><span class='status-dot-green'></span> PRESENTES</span>
                <div style="font-size: 22px; font-weight: 900; color: #047857; margin: 2px 0;">${presentCount} (${attendancePct}%)</div>
                <span style="font-size: 10px; color: #047857;">A tiempo en portería</span>
              </div>

              <div class="card" style="padding: 12px; border-left: 4px solid #f59e0b; background: #fffbeb;">
                <span style="font-size: 11px; font-weight: 800; color: #92400e;"><span class='status-dot-yellow'></span> TARDANZAS</span>
                <div style="font-size: 22px; font-weight: 900; color: #b45309; margin: 2px 0;">${lateCount}</div>
                <span style="font-size: 10px; color: #b45309;">Después de 07:45 am</span>
              </div>

              <div class="card" style="padding: 12px; border-left: 4px solid #ef4444; background: #fef2f2;">
                <span style="font-size: 11px; font-weight: 800; color: #991b1b;"><span class='status-dot-red'></span> INASISTENCIAS</span>
                <div style="font-size: 22px; font-weight: 900; color: #dc2626; margin: 2px 0;">${absentCount}</div>
                <span style="font-size: 10px; color: #dc2626;">Sin registro biométrico</span>
              </div>

              <div class="card" style="padding: 12px; border-left: 4px solid #8b5cf6; background: #f5f3ff;">
                <span style="font-size: 11px; font-weight: 800; color: #5b21b6;">🔵 JUSTIFICADAS</span>
                <div style="font-size: 22px; font-weight: 900; color: #6d28d9; margin: 2px 0;">${justifiedCount}</div>
                <span style="font-size: 10px; color: #6d28d9;">Con certificado médico</span>
              </div>
            </div>

            <!-- TABLA INTERACTIVA DE TOMA DE ASISTENCIA -->
            <div class="card">
              <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
                <div>
                  <h3 class="card-title" style="font-size: var(--font-size-base); margin: 0;">
                    Registro y Marcación de Asistencia: ${currentGrade.label} • Fecha: ${selectedDate}
                  </h3>
                  <span style="font-size: 11px; color: var(--text-muted);">
                    Haga clic en los botones de estado para cambiar la asistencia del estudiante al instante.
                  </span>
                </div>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Estudiante</th>
                      <th>DNI / Código</th>
                      <th>Hora Biometría</th>
                      <th>Marcación de Estado (1 Clic)</th>
                      <th>Método de Registro</th>
                      <th>Observaciones</th>
                      <th style="text-align: center;">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${classroomRecords.map(r => `
                      <tr>
                        <td>
                          <strong>${r.studentName}</strong>
                        </td>
                        <td>
                          <code>${r.studentCode || r.studentId}</code><br>
                          <span style="font-size: 10.5px; color: #64748b;">DNI: ${r.dni || '--'}</span>
                        </td>
                        <td>
                          <strong style="color: ${r.status === 'Presente' ? '#047857' : r.status === 'Tardanza' ? '#b45309' : '#dc2626'}; font-size: 12.5px;">
                            ${r.arrivalTime || '--:--'}
                          </strong>
                        </td>
                        <td>
                          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            <button class="btn btn-sm" onclick="window.app.setStudentAttendanceStatus('${r.id}', 'Presente')" style="font-size: 10.5px; padding: 2px 7px; font-weight: 800; background: ${r.status === 'Presente' ? '#10b981' : '#f1f5f9'}; color: ${r.status === 'Presente' ? '#ffffff' : '#334155'}; border: 1px solid ${r.status === 'Presente' ? '#059669' : '#cbd5e1'};">
                              <span class='status-dot-green'></span> Presente
                            </button>
                            <button class="btn btn-sm" onclick="window.app.setStudentAttendanceStatus('${r.id}', 'Tardanza')" style="font-size: 10.5px; padding: 2px 7px; font-weight: 800; background: ${r.status === 'Tardanza' ? '#f59e0b' : '#f1f5f9'}; color: ${r.status === 'Tardanza' ? '#ffffff' : '#334155'}; border: 1px solid ${r.status === 'Tardanza' ? '#d97706' : '#cbd5e1'};">
                              <span class='status-dot-yellow'></span> Tardanza
                            </button>
                            <button class="btn btn-sm" onclick="window.app.setStudentAttendanceStatus('${r.id}', 'Falta')" style="font-size: 10.5px; padding: 2px 7px; font-weight: 800; background: ${r.status === 'Falta' ? '#ef4444' : '#f1f5f9'}; color: ${r.status === 'Falta' ? '#ffffff' : '#334155'}; border: 1px solid ${r.status === 'Falta' ? '#dc2626' : '#cbd5e1'};">
                              <span class='status-dot-red'></span> Falta
                            </button>
                            <button class="btn btn-sm" onclick="window.app.setStudentAttendanceStatus('${r.id}', 'Justificada')" style="font-size: 10.5px; padding: 2px 7px; font-weight: 800; background: ${r.status === 'Justificada' ? '#8b5cf6' : '#f1f5f9'}; color: ${r.status === 'Justificada' ? '#ffffff' : '#334155'}; border: 1px solid ${r.status === 'Justificada' ? '#7c3aed' : '#cbd5e1'};">
                              🔵 Justificada
                            </button>
                          </div>
                        </td>
                        <td>
                          <span style="font-size: 11px; color: #475569;">
                            ${r.method || 'Molinete Huella Digital'}
                          </span>
                        </td>
                        <td>
                          <span style="font-size: 11px; color: #64748b;">
                            ${r.observations || 'Sin observaciones'}
                          </span>
                        </td>
                        <td style="text-align: center;">
                          <button class="btn btn-outline btn-sm" onclick="window.app.openJustifyAttendanceModal('${r.studentId}', '${r.date}')" style="font-size: 10.5px; padding: 3px 8px;">
                            ✏️ Justificar
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- =====================================================================
               SUB-PESTAÑA 2: PARTE DIARIO DE TARDANZAS E INASISTENCIAS (AUTOMATIZADO)
               ===================================================================== -->
          ${activeSubTab === 'daily-report' ? `
            
            <div class="card" style="margin-bottom: var(--space-4); background: #f8fafc; border: 1px solid #cbd5e1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 14px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;"></span>
                    <div>
                      <h2 style="font-size: 17px; font-weight: 900; color: #0b132b; margin: 0;">
                        Parte Diario Oficial de Tardanzas e Inasistencias
                      </h2>
                      <span style="font-size: 11.5px; color: #64748b;">
                        Fecha: <strong>${selectedDate}</strong> • Hora de Corte Oficial: <strong>08:15 AM</strong> • I.E.P. "El Educador" (UGEL 05)
                      </span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="btn btn-navy btn-sm" onclick="window.app.openOfficialDailyReportPrintModal('${selectedDate}')" style="font-weight: 800; font-size: 12px;">
                    Imprimir Parte Diario A4 (UGEL 05)
                  </button>
                  <button class="btn btn-gold btn-sm" onclick="window.app.notifyAllAbsencesAndTardinessWhatsApp('${selectedDate}')" style="font-weight: 800; font-size: 12px;">
                    📲 Notificar a Todos los Apoderados (WhatsApp)
                  </button>
                </div>
              </div>
            </div>

            <!-- CUADRO RESUMEN DE INCIDENCIAS -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: var(--space-5);">
              <div class="card" style="padding: 14px; border-left: 4px solid #10b981; background: #ecfdf5;">
                <span style="font-size: 11px; font-weight: 800; color: #065f46;">ASISTENCIA GENERAL</span>
                <div style="font-size: 24px; font-weight: 900; color: #047857; margin: 2px 0;">${dayReport.attendanceRate}%</div>
                <span style="font-size: 10.5px; color: #047857;">${dayReport.presentList.length} alumnos puntuales</span>
              </div>

              <div class="card" style="padding: 14px; border-left: 4px solid #f59e0b; background: #fffbeb;">
                <span style="font-size: 11px; font-weight: 800; color: #92400e;">TARDANZAS EN PUERTA</span>
                <div style="font-size: 24px; font-weight: 900; color: #b45309; margin: 2px 0;">${dayReport.tardinessList.length} Casos</div>
                <span style="font-size: 10.5px; color: #b45309;">Registrados post 07:45 am</span>
              </div>

              <div class="card" style="padding: 14px; border-left: 4px solid #ef4444; background: #fef2f2;">
                <span style="font-size: 11px; font-weight: 800; color: #991b1b;">INASISTENCIAS DEL DÍA</span>
                <div style="font-size: 24px; font-weight: 900; color: #dc2626; margin: 2px 0;">${dayReport.absenceList.length} Alumnos</div>
                <span style="font-size: 10.5px; color: #dc2626;">Sin marcación de ingreso</span>
              </div>

              <div class="card" style="padding: 14px; border-left: 4px solid #8b5cf6; background: #f5f3ff;">
                <span style="font-size: 11px; font-weight: 800; color: #5b21b6;">FALTAS JUSTIFICADAS</span>
                <div style="font-size: 24px; font-weight: 900; color: #6d28d9; margin: 2px 0;">${dayReport.justifiedList.length} Casos</div>
                <span style="font-size: 10.5px; color: #6d28d9;">Con aviso / descanso médico</span>
              </div>
            </div>

            <!-- SECCIÓN A: TABLA DE TARDANZAS -->
            <div class="card" style="margin-bottom: var(--space-5); border: 1px solid #fde68a;">
              <div class="card-header" style="background: #fffbeb; border-bottom: 1px solid #fef3c7;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;"><span class='status-dot-yellow'></span></span>
                  <div>
                    <h3 style="font-size: 14px; font-weight: 900; color: #92400e; margin: 0;">
                      1. Registro Detallado de Tardanzas en Portería (${dayReport.tardinessList.length} casos)
                    </h3>
                    <span style="font-size: 11px; color: #b45309;">
                      Estudiantes que ingresaron después de las 07:45 AM mediante escaneo de código QR o torniquete.
                    </span>
                  </div>
                </div>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Estudiante</th>
                      <th>Grado / Nivel</th>
                      <th>Hora Ingreso QR</th>
                      <th>Demora</th>
                      <th>Apoderado Responsable</th>
                      <th>Teléfono</th>
                      <th style="text-align: center;">Acciones Inmediatas</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dayReport.tardinessList.length > 0 ? dayReport.tardinessList.map((t, idx) => `
                      <tr>
                        <td><strong>${String(idx + 1).padStart(2, '0')}</strong></td>
                        <td>
                          <strong>${t.studentName}</strong><br>
                          <span style="font-size: 10.5px; color: #64748b;">Código: ${t.studentCode} • DNI: ${t.dni}</span>
                        </td>
                        <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3; font-weight:bold;">${t.grade}</span></td>
                        <td><strong style="color: #b45309; font-size: 13px;">${t.arrivalTime}</strong></td>
                        <td><span class="status-badge status-failed" style="background: #fef3c7; color: #92400e; font-weight: 800;">+${t.delayMinutes || '7'} min</span></td>
                        <td>${t.guardian || 'Apoderado'}</td>
                        <td><code>${t.guardianPhone || '984-123-456'}</code></td>
                        <td style="text-align: center;">
                          <div style="display: flex; gap: 4px; justify-content: center;">
                            <button class="btn btn-sm" onclick="window.app.sendTardinessWhatsApp('${t.studentName}', '${t.arrivalTime}', '${t.delayMinutes || '7'}', '${t.guardianPhone || '984-123-456'}', '${t.guardian || 'Apoderado'}')" style="background: #22c55e; color: white; font-weight: 800; font-size: 10.5px; padding: 4px 8px;" title="Enviar notificación a WhatsApp">
                              💬 WhatsApp
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="window.app.showTardinessPassModal('${t.studentCode}')" style="font-size: 10.5px; padding: 4px 8px;" title="Emitir Pase de Tardanza">
                              Pase
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="8" style="text-align: center; padding: 18px; color: #047857; font-weight: bold;">
                          ✓ No se registraron tardanzas en el control de puerta en esta fecha.
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- SECCIÓN B: TABLA DE INASISTENCIAS -->
            <div class="card" style="border: 1px solid #fecaca;">
              <div class="card-header" style="background: #fef2f2; border-bottom: 1px solid #fee2e2;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-size: 18px;"><span class='status-dot-red'></span></span>
                  <div>
                    <h3 style="font-size: 14px; font-weight: 900; color: #991b1b; margin: 0;">
                      2. Registro de Inasistencias del Día (${dayReport.absenceList.length} casos)
                    </h3>
                    <span style="font-size: 11px; color: #dc2626;">
                      Alumnos sin registro biométrico ni escaneo de fotocheck al cierre de puerta.
                    </span>
                  </div>
                </div>
              </div>

              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Estudiante</th>
                      <th>Grado / Aula</th>
                      <th>Tutor Asignado</th>
                      <th>Apoderado</th>
                      <th>Teléfono de Contacto</th>
                      <th>Estado de Inasistencia</th>
                      <th style="text-align: center;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${dayReport.absenceList.length > 0 ? dayReport.absenceList.map((a, idx) => `
                      <tr>
                        <td><strong>${String(idx + 1).padStart(2, '0')}</strong></td>
                        <td>
                          <strong>${a.studentName}</strong><br>
                          <span style="font-size: 10.5px; color: #64748b;">DNI: ${a.dni} • ${a.studentCode}</span>
                        </td>
                        <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3; font-weight:bold;">${a.grade}</span></td>
                        <td>${currentGrade.tutor || 'Prof. Roberto Silva'}</td>
                        <td>${a.guardian || 'Apoderado'}</td>
                        <td><code>${a.guardianPhone || '984-123-456'}</code></td>
                        <td><span class="status-badge status-failed" style="font-weight: 800;"><span class='status-dot-red'></span> Inasistencia Injustificada</span></td>
                        <td style="text-align: center;">
                          <div style="display: flex; gap: 4px; justify-content: center;">
                            <button class="btn btn-sm" onclick="window.app.sendAbsenceWhatsApp('${a.studentName}', '${a.guardianPhone || '984-123-456'}', '${a.guardian || 'Apoderado'}')" style="background: #22c55e; color: white; font-weight: 800; font-size: 10.5px; padding: 4px 8px;" title="Notificar Inasistencia por WhatsApp">
                              💬 WhatsApp
                            </button>
                            <button class="btn btn-outline btn-sm" onclick="window.app.openJustifyAttendanceModal('${a.studentCode}', '${selectedDate}')" style="font-size: 10.5px; padding: 4px 8px;" title="Registrar Justificación">
                              📝 Justificar
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('') : `
                      <tr>
                        <td colspan="8" style="text-align: center; padding: 18px; color: #047857; font-weight: bold;">
                          ✓ Asistencia al 100%. No hay alumnos inasistentes registrados.
                        </td>
                      </tr>
                    `}
                  </tbody>
                </table>
              </div>
            </div>

          ` : ''}

          <!-- =====================================================================
               SUB-PESTAÑA 3: ESCÁNER QR EN PORTERÍA (MODO DUAL INTELIGENTE)
               ===================================================================== -->
          ${activeSubTab === 'door-scanner' ? `
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
              
              <!-- Columna Izquierda: Visor de Cámara y Botones de Escaneo -->
              <div class="card" style="border: 2px solid #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.1);">
                <div class="card-header" style="background: #0f172a; color: white;">
                  <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-size: 20px;">[Cámara]</span>
                      <div>
                        <h3 style="font-size: 15px; font-weight: 900; color: white; margin: 0;">
                          Estación de Portería & Auxiliar: Escáner QR Inteligente
                        </h3>
                        <span style="font-size: 11px; color: #94a3b8;">Asistencia en Puerta (07:00 - 08:30 AM) • Incidencias durante la jornada</span>
                      </div>
                    </div>
                    <span id="camera-door-status" class="status-badge status-approved" style="font-size: 10px;"><span class='status-dot-green'></span> LISTO</span>
                  </div>
                </div>

                <div style="padding: 20px; text-align: center;">
                  
                  <div id="qr-door-camera-feed" style="width: 100%; max-width: 320px; height: 240px; margin: 0 auto 16px; border: 3px dashed #3b82f6; border-radius: 12px; background: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;">
                    <div style="color: white; text-align: center;">
                      <div style="font-size: 48px; margin-bottom: 6px;">⚡</div>
                      <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">Lector QR Activo</div>
                      <div style="font-size: 10.5px; opacity: 0.8;">Muestra el fotocheck frente al lente</div>
                    </div>
                  </div>

                  <!-- Botones de Control de Cámara -->
                  <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 20px;">
                    <button id="btn-start-door-cam" class="btn btn-navy btn-sm" onclick="window.app.startDoorCameraScanner()" style="font-weight: 800;">
                      📹 Encender Cámara en Vivo
                    </button>
                    <button id="btn-stop-door-cam" class="btn btn-red btn-sm" onclick="window.app.stopDoorCameraScanner()" style="font-weight: 800; display: none;">
                      ⏹️ Detener Cámara
                    </button>
                  </div>

                  <!-- Simulador de Escaneo Inteligente -->
                  <h4 style="font-size: 12px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 8px;">
                    ⚡ Simulación de Lecturas QR (Asistencia vs. Incidencias):
                  </h4>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button class="btn btn-outline btn-sm" onclick="window.app.processSmartQRScan('EST-2026-042', '07:38 AM')" style="font-size: 11px; text-align: left; padding: 8px;">
                      <span class='status-dot-green'></span> <strong>Sofía Méndez</strong><br><span style="font-size: 9.5px; color: #047857;">1er Escaneo: Puntual (07:38 AM)</span>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.app.processSmartQRScan('EST-2026-011', '08:10 AM')" style="font-size: 11px; text-align: left; padding: 8px;">
                      <span class='status-dot-yellow'></span> <strong>Carlos Benítez</strong><br><span style="font-size: 9.5px; color: #b45309;">1er Escaneo: Tardanza (08:10 AM)</span>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.app.processSmartQRScan('EST-2026-055', '07:35 AM')" style="font-size: 11px; text-align: left; padding: 8px;">
                      <span class='status-dot-green'></span> <strong>Salim Cáceres</strong><br><span style="font-size: 9.5px; color: #047857;">Ingreso Puntual (07:35 AM)</span>
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="window.app.processSmartQRScan('EST-2026-025', '08:45 AM')" style="font-size: 11px; text-align: left; padding: 8px;">
                      <span class='status-dot-red'></span> <strong>Mateo Ramos</strong><br><span style="font-size: 9.5px; color: #dc2626;">08:45 AM (Puerta Cerrada / Falta)</span>
                    </button>
                  </div>

                  <!-- Entrada para Pistola Lectora USB o Teclado -->
                  <div style="background: white; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 14px; margin-top: 14px; text-align: left;">
                    <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 4px;">
                      🔫 O Escanear con Pistola USB / Ingreso Manual:
                    </label>
                    <div style="display: flex; gap: 8px;">
                      <input type="text" id="door-manual-barcode-input" class="form-control" placeholder="Escanear fotocheck o escribir DNI / Cód..." style="font-size: 12px; font-weight: bold;" onkeydown="if(event.key==='Enter'){ window.app.processSmartQRScan(this.value); this.value=''; }" />
                      <button class="btn btn-navy btn-sm" onclick="const inp=document.getElementById('door-manual-barcode-input'); if(inp && inp.value){ window.app.processSmartQRScan(inp.value); inp.value=''; }" style="font-weight: 800; white-space: nowrap;">
                        Validar
                      </button>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Columna Derecha: Pantalla de Feedback en Vivo para el Estudiante / Auxiliar -->
              <div>
                <div class="card" style="border: 2px solid var(--border-subtle); margin-bottom: 16px;">
                  <div class="card-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                    <h3 style="font-size: 14px; font-weight: 800; color: #1e293b; margin: 0;">
                      🖥️ Pantalla de Validación de Puerta & Auxiliar
                    </h3>
                  </div>
                  
                  <div id="door-last-scan-display" style="padding: 20px; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 6px;"></div>
                    <h4 style="font-size: 15px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 4px;">
                      Esperando lectura de fotocheck escolar...
                    </h4>
                    <p style="font-size: 12px; color: var(--text-muted); margin: 0;">
                      Al escanear en puerta se valida asistencia. Si se escanea durante el horario escolar o recreo, se habilita el registro de incidencias conductuales.
                    </p>
                  </div>
                </div>

                <!-- Feed de Últimos Ingresos -->
                <div class="card">
                  <div class="card-header" style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0;">
                    <strong style="font-size: 12px; color: #1e3a8a;">⏱️ Últimos Alumnos validados por QR:</strong>
                  </div>
                  <div id="door-recent-scans-container" style="max-height: 180px; overflow-y: auto; font-size: 11.5px; padding: 6px;">
                    ${classroomRecords.slice(0, 5).map(r => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">
                        <div>
                          <strong>${r.studentName}</strong> <span style="font-size: 10px; color: #64748b;">(${r.grade})</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <code>${r.arrivalTime}</code>
                          <span class="status-badge ${r.status === 'Presente' ? 'status-approved' : r.status === 'Tardanza' ? 'status-pending' : 'status-failed'}" style="font-size: 9.5px; padding: 1px 5px;">
                            ${r.status}
                          </span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>

              </div>

            </div>

          ` : ''}

          <!-- =====================================================================
               SUB-PESTAÑA 4: PLANCHA DE FOTOCHECKS QR ESTUDIANTILES
               ===================================================================== -->
          <!-- =====================================================================
               SUB-PESTAÑA 4: PLANCHAS DE CÓDIGOS QR (POR CURSO Y BOLETA OFICIAL)
               ===================================================================== -->
          ${activeSubTab === 'id-cards' ? `
            ${(() => {
              const qrSheetMode = state.attendanceQRSheetMode || 'stickers';
              const qrSheetGrade = state.selectedAttendanceQRGrade || '4sec';
              const qrSheetStudent = state.selectedAttendanceQRStudent || 'all';
              const qrSheetCourse = state.selectedAttendanceQRCourse || 'all';
              const qrSheetLayout = state.selectedAttendanceQRLayout || '3x5';

              const boletaCourses = (window.appStore && typeof window.appStore.getStudentBoletaCoursesCatalog === 'function')
                ? window.appStore.getStudentBoletaCoursesCatalog(qrSheetGrade)
                : [];

              const stickersList = (window.appStore && typeof window.appStore.getNotebookStickersData === 'function')
                ? window.appStore.getNotebookStickersData(qrSheetGrade, qrSheetStudent, qrSheetCourse)
                : [];

              const activeEnrollments = enrollments.filter(e => {
                if (!qrSheetGrade || qrSheetGrade === 'all') return true;
                const egId = (e.gradeId || (window.appStore && window.appStore.resolveStudentGradeId(e.grade)) || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const cleanG = (qrSheetGrade || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return egId === cleanG || egId.includes(cleanG) || cleanG.includes(egId);
              });

              return `
                <div class="card" style="margin-bottom: var(--space-4); background: #f8fafc; border: 1px solid #cbd5e1;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 14px;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 24px;">🏷️</span>
                        <div>
                          <h3 style="font-size: 16px; font-weight: 900; color: #0b132b; margin: 0;">
                            Planchas Oficiales de Códigos QR por Curso & Boleta de Notas
                          </h3>
                          <span style="font-size: 11.5px; color: #64748b;">
                            Generación de <strong>un código QR por curso oficial</strong> de la boleta de calificaciones para pegar en los cuadernos del estudiante o credencial de asistencia.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                      <!-- Selector de Modo de Plancha -->
                      <div style="display: flex; background: #e2e8f0; border-radius: 20px; padding: 2px;">
                        <button class="btn btn-sm ${qrSheetMode === 'stickers' ? 'btn-gold' : 'btn-outline'}" onclick="window.app.setAttendanceQRSheetMode('stickers')" style="border-radius: 18px; font-size: 11px; font-weight: 800; padding: 4px 12px; border: none;">
                          📚 Stickers QR por Curso (Cuadernos)
                        </button>
                        <button class="btn btn-sm ${qrSheetMode === 'cards' ? 'btn-navy' : 'btn-outline'}" onclick="window.app.setAttendanceQRSheetMode('cards')" style="border-radius: 18px; font-size: 11px; font-weight: 800; padding: 4px 12px; border: none;">
                          🪪 Fotocheck Asistencia (Portería)
                        </button>
                      </div>

                      ${qrSheetMode === 'stickers' ? `
                        <button class="btn btn-gold btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('${qrSheetStudent !== 'all' ? qrSheetStudent : 'EST-2026-042'}')" style="font-weight: 900; padding: 7px 16px; border-radius: 20px; font-size: 11.5px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0b132b;">
                          ⚡ Plancha Completa Alumno
                        </button>
                        <button class="btn btn-navy btn-sm" onclick="window.app.printNotebookStickerSheet('attendance-printable-stickers-sheet', '${qrSheetLayout}')" style="font-weight: 800; font-size: 11.5px; padding: 7px 14px; border-radius: 20px;">
                          🖨️ Imprimir Plancha A4 (${stickersList.length} QR)
                        </button>
                      ` : `
                        <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-weight: 800; font-size: 11.5px; padding: 7px 14px; border-radius: 20px;">
                          🖨️ Imprimir Fotochecks A4
                        </button>
                      `}
                    </div>
                  </div>

                  ${qrSheetMode === 'stickers' ? `
                    <!-- Filtros Dinámicos para Planchas de Stickers QR por Curso -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; background: #ffffff; padding: 12px 14px; border-top: 1px solid #e2e8f0;">
                      <div>
                        <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 2px;">1. Grado Escolar:</label>
                        <select class="form-control" onchange="window.app.onAttendanceStickerGradeChange(this.value)" style="font-size: 12px; font-weight: bold;">
                          ${catalog.map(g => `<option value="${g.id}" ${g.id === qrSheetGrade ? 'selected' : ''}>${g.label} (${g.level})</option>`).join('')}
                        </select>
                      </div>

                      <div>
                        <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 2px;">2. Estudiante:</label>
                        <select class="form-control" onchange="window.app.onAttendanceStickerStudentChange(this.value)" style="font-size: 12px; font-weight: bold;">
                          <option value="all">-- Todos los Alumnos del Grado (${activeEnrollments.length}) --</option>
                          ${activeEnrollments.map(e => `
                            <option value="${e.studentCode || e.dni}" ${qrSheetStudent === (e.studentCode || e.dni) ? 'selected' : ''}>
                              ${e.studentName} (${e.studentCode || e.dni})
                            </option>
                          `).join('')}
                        </select>
                      </div>

                      <div>
                        <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 2px;">3. Curso de Boleta Oficial:</label>
                        <select class="form-control" onchange="window.app.onAttendanceStickerCourseChange(this.value)" style="font-size: 12px; font-weight: bold;">
                          <option value="all">-- Todos los Cursos de Boleta (${boletaCourses.length}) --</option>
                          ${boletaCourses.map(c => `
                            <option value="${c.id}" ${qrSheetCourse === c.id ? 'selected' : ''}>
                              ${c.icon || '📚'} ${c.name} (${c.teacher})
                            </option>
                          `).join('')}
                        </select>
                      </div>

                      <div>
                        <label style="font-size: 11px; font-weight: 800; color: #1e3a8a; display: block; margin-bottom: 2px;">4. Formato Hoja A4:</label>
                        <select id="attendance-sticker-layout-select" class="form-control" style="font-size: 12px; font-weight: 800; background: #eff6ff; border: 1.5px solid #3b82f6; color: #1e3a8a;">
                          <option value="3x5" ${qrSheetLayout === '3x5' ? 'selected' : ''}>3 × 5 (15 QR por Hoja A4)</option>
                          <option value="3x4" ${qrSheetLayout === '3x4' ? 'selected' : ''}>3 × 4 (12 QR por Hoja A4)</option>
                        </select>
                      </div>
                    </div>
                  ` : ''}
                </div>

                ${qrSheetMode === 'stickers' ? `
                  <!-- =========================================================
                       GRILLA DE STICKERS QR POR CURSO DE LA BOLETA DE NOTAS
                       ========================================================= -->
                  <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #475569; font-weight: 700;">
                      Mostrando <strong>${stickersList.length} stickers adhesivos</strong> correspondientes a los cursos de la Boleta Oficial de Notas:
                    </span>
                    <span class="status-badge status-approved" style="font-size: 10.5px; font-weight: 800;">
                      100% Escaneable con Celular o Lector
                    </span>
                  </div>

                  <div id="attendance-printable-stickers-sheet" class="qr-sticker-sheet" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin-bottom: 24px;">
                    ${stickersList.map(st => {
                      const safePayload = st.qrPayload.replace(/'/g, "\\'");
                      return `
                        <div class="qr-notebook-sticker" style="border: 2px solid #0f172a; border-radius: 10px; padding: 12px; background: #ffffff; display: flex; gap: 12px; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative; border-left: 6px solid #f59e0b;">
                          <div style="flex-shrink: 0; text-align: center; width: 75px;">
                            <div style="width: 75px; height: 75px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px; background: white; margin: 0 auto;">
                              ${Components.generateQRSVG(st.qrPayload, 140)}
                            </div>
                            <span style="font-size: 8px; font-weight: 800; color: #475569; display: block; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><code>${st.qrCode}</code></span>
                          </div>
                          <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                              <span style="font-size: 8.5px; font-weight: 900; color: #dc2626; letter-spacing: 0.05em; text-transform: uppercase;">
                                ★ I.E.P. EL EDUCADOR • SJL
                              </span>
                              <span class="status-badge" style="font-size: 8px; padding: 1px 4px; font-weight: 800; background: #eff6ff; color: #1e40af;">
                                ${st.area || 'Oficial'}
                              </span>
                            </div>
                            <strong style="font-size: 13px; color: #0f172a; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${st.course}">
                              ${st.icon || '📚'} ${st.course}
                            </strong>
                            <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${st.studentName}
                            </div>
                            <div style="font-size: 10px; color: #475569;">
                              ${st.grade} • Cód: <code>${st.studentCode}</code>
                            </div>
                            <div style="font-size: 9.5px; color: #047857; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${st.teacher}
                            </div>
                            <div style="margin-top: 6px; display: flex; gap: 4px;">
                              <button class="btn btn-outline btn-sm" onclick="window.app.simulateQRScan('${safePayload}')" style="font-size: 9.5px; padding: 2px 7px; border-radius: 12px; font-weight: 800;">
                                [Cámara] Probar
                              </button>
                              <button class="btn btn-gold btn-sm" onclick="window.app.openStudentFullBoletaStickersModal('${st.studentCode}')" style="font-size: 9.5px; padding: 2px 7px; border-radius: 12px; font-weight: 800;">
                                Plancha Alumno
                              </button>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : `
                  <!-- =========================================================
                       GRILLA DE FOTOCHECKS QR DE INGRESO EN PUERTA (SIN FOTOS)
                       ========================================================= -->
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 20px;">
                    ${enrollments.map(st => `
                      <div class="card" style="border: 2px solid #1e3a8a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06); background: #ffffff; text-align: center;">
                        <div style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white; padding: 8px 12px; display: flex; align-items: center; justify-content: center; gap: 6px; border-bottom: 3px solid #f59e0b;">
                          <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo" style="width: 22px; height: 22px; object-fit: contain;" />
                          <div style="text-align: center;">
                            <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.05em; color: #fde047;">I.E.P. "EL EDUCADOR"</div>
                            <div style="font-size: 8px; opacity: 0.9;">CONTROL DE ASISTENCIA QR 2026</div>
                          </div>
                        </div>
                        <div style="padding: 16px 12px;">
                          <div style="width: 140px; height: 140px; margin: 0 auto 12px; border: 2px solid #0b132b; border-radius: 8px; padding: 6px; background: white; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
                            ${Components.generateQRSVG(st.studentCode)}
                          </div>
                          <div style="font-size: 13.5px; font-weight: 900; color: #0b132b; text-transform: uppercase; line-height: 1.25; margin-bottom: 4px;">
                            ${st.studentName}
                          </div>
                          <div style="font-size: 12px; font-weight: 800; color: #1e40af; margin-bottom: 6px;">
                            ${st.grade}
                          </div>
                          <div style="font-size: 10.5px; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 3px 8px; display: inline-block;">
                            <strong>CÓD:</strong> <code>${st.studentCode}</code> • <strong>DNI:</strong> <code>${st.dni}</code>
                          </div>
                        </div>
                        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                          <button class="btn btn-navy btn-sm" onclick="window.app.openStudentQRModal('${st.studentCode}')" style="font-size: 11px; font-weight: bold; padding: 4px 10px; flex: 1;">
                            Ver QR
                          </button>
                          <button class="btn btn-gold btn-sm" onclick="window.app.downloadStudentQR('${st.studentCode}')" style="font-size: 11px; font-weight: bold; padding: 4px 8px;">
                            Guardar
                          </button>
                          <button class="btn btn-outline btn-sm" onclick="window.app.openCreateIncidentModal('${st.studentCode}')" style="font-size: 11px; font-weight: bold; padding: 4px 8px; color: #dc2626; border-color: #fca5a5;">
                            Informe
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              `;
            })()}
          ` : ''}

          <!-- =====================================================================
               SUB-PESTAÑA 5: LIBRO OFICIAL DE INCIDENCIAS & CONVIVENCIA ESCOLAR (MINEDU)
               ===================================================================== -->
          ${activeSubTab === 'incidents' ? `
            
            <!-- Encabezado de la Sub-Pestaña -->
            <div class="card" style="margin-bottom: var(--space-4); background: #f8fafc; border: 1px solid #cbd5e1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 14px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 22px;"></span>
                    <div>
                      <h2 style="font-size: 16px; font-weight: 900; color: #991b1b; margin: 0;">
                        Libro Oficial de Registro de Incidencias & Convivencia Escolar
                      </h2>
                      <span style="font-size: 11.5px; color: #64748b;">
                        I.E.P. "El Educador" • Conforme a la Ley N° 29719 / MINEDU y D.S. N° 004-2018-MINEDU
                      </span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="btn btn-red btn-sm" onclick="window.app.openCreateIncidentModal()" style="font-weight: 800; font-size: 12px;">
                    + Registrar Nuevo Informe de Incidencia / Mérito
                  </button>
                  <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-weight: 800; font-size: 12px;">
                    Imprimir Libro de Incidencias
                  </button>
                </div>
              </div>
            </div>

            <!-- Resumen Estadístico de Incidencias -->
            ${(() => {
              const allInc = state.behaviorIncidents || initialData.behaviorIncidents || [];
              const leves = allInc.filter(i => i.severity === 'Leve').length;
              const graves = allInc.filter(i => i.severity === 'Grave').length;
              const muyGraves = allInc.filter(i => i.severity === 'Muy Grave').length;
              const meritos = allInc.filter(i => i.severity === 'Mérito').length;

              return `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin-bottom: var(--space-4);">
                  <div class="card" style="padding: 12px; border-left: 4px solid #3b82f6; background: #eff6ff;">
                    <span style="font-size: 11px; font-weight: 800; color: #1e40af;">TOTAL REGISTRADOS</span>
                    <div style="font-size: 22px; font-weight: 900; color: #1e3a8a; margin: 2px 0;">${allInc.length} Informes</div>
                    <span style="font-size: 10px; color: #64748b;">Año Lectivo 2026</span>
                  </div>
                  
                  <div class="card" style="padding: 12px; border-left: 4px solid #f59e0b; background: #fffbeb;">
                    <span style="font-size: 11px; font-weight: 800; color: #92400e;"><span class='status-dot-yellow'></span> FALTAS LEVES</span>
                    <div style="font-size: 22px; font-weight: 900; color: #b45309; margin: 2px 0;">${leves}</div>
                    <span style="font-size: 10px; color: #b45309;">Uniforme, tardanza aula</span>
                  </div>

                  <div class="card" style="padding: 12px; border-left: 4px solid #ef4444; background: #fef2f2;">
                    <span style="font-size: 11px; font-weight: 800; color: #991b1b;"><span class='status-dot-red'></span> FALTAS GRAVES</span>
                    <div style="font-size: 22px; font-weight: 900; color: #dc2626; margin: 2px 0;">${graves}</div>
                    <span style="font-size: 10px; color: #dc2626;">Desobediencia, celulares</span>
                  </div>

                  <div class="card" style="padding: 12px; border-left: 4px solid #991b1b; background: #ffe4e6;">
                    <span style="font-size: 11px; font-weight: 800; color: #881337;">⛔ MUY GRAVES</span>
                    <div style="font-size: 22px; font-weight: 900; color: #9f1239; margin: 2px 0;">${muyGraves}</div>
                    <span style="font-size: 10px; color: #9f1239;">Agresiones, daños</span>
                  </div>

                  <div class="card" style="padding: 12px; border-left: 4px solid #10b981; background: #ecfdf5;">
                    <span style="font-size: 11px; font-weight: 800; color: #065f46;">★ MÉRITOS / FELICITACIONES</span>
                    <div style="font-size: 22px; font-weight: 900; color: #047857; margin: 2px 0;">${meritos}</div>
                    <span style="font-size: 10px; color: #047857;">Conducta destacada</span>
                  </div>
                </div>

                <!-- Tabla del Libro de Incidencias -->
                <div class="card">
                  <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                      <h3 class="card-title" style="font-size: 14px; margin: 0;">
                        Expediente Conductual & Registro de Casos
                      </h3>
                      <span style="font-size: 11px; color: var(--text-muted);">
                        Cada reporte está amarrado al código QR y perfil del estudiante con notificación inmediata a su apoderado.
                      </span>
                    </div>

                    <div style="display: flex; gap: 8px;">
                      <input type="text" id="incident-search-input" class="form-control" placeholder="Buscar por estudiante (ej: Gael Cáceres)..." style="font-size: 11.5px; width: 260px;" oninput="window.app.filterIncidentsTable(this.value)">
                    </div>
                  </div>

                  <div class="table-container">
                    <table class="data-table" id="incidents-main-table">
                      <thead>
                        <tr>
                          <th>N° / Código</th>
                          <th>Estudiante</th>
                          <th>Grado</th>
                          <th>Fecha & Hora</th>
                          <th>Gravedad</th>
                          <th>Motivo / Categoría</th>
                          <th>Lugar</th>
                          <th>Reportado Por</th>
                          <th>Medida Pedagógica</th>
                          <th style="text-align: center;">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${allInc.length > 0 ? allInc.map((inc, idx) => {
                          const badgeColor = inc.severity === 'Mérito' ? '#10b981' : inc.severity === 'Leve' ? '#f59e0b' : inc.severity === 'Grave' ? '#ef4444' : '#991b1b';
                          return `
                            <tr>
                              <td>
                                <strong>${String(idx + 1).padStart(2, '0')}</strong><br>
                                <code style="font-size: 10px;">${inc.id}</code>
                              </td>
                              <td>
                                <strong>${inc.studentName}</strong><br>
                                <span style="font-size: 10.5px; color: #64748b;">DNI: ${inc.dni} • ${inc.studentCode}</span>
                              </td>
                              <td><span class="status-badge" style="background:#e0e7ff; color:#3730a3; font-weight:bold;">${inc.grade}</span></td>
                              <td>
                                <strong>${inc.date}</strong><br>
                                <span style="font-size: 11px; color: #64748b;">${inc.time}</span>
                              </td>
                              <td>
                                <span class="status-badge" style="background: ${badgeColor}; color: white; font-weight: 800; font-size: 10px;">
                                  ${inc.severity === 'Mérito' ? '★ Mérito' : inc.severity === 'Leve' ? '<span class="status-dot-yellow"></span> Leve' : inc.severity === 'Grave' ? '<span class="status-dot-red"></span> Grave' : '⛔ Muy Grave'}
                                </span>
                              </td>
                              <td><strong>${inc.category}</strong></td>
                              <td><span style="font-size: 11px; color: #475569;">${inc.location}</span></td>
                              <td><span style="font-size: 11px; color: #1e3a8a; font-weight: bold;">${inc.reportedBy}</span></td>
                              <td><span style="font-size: 11px; color: #334155;">${inc.correctiveMeasure}</span></td>
                              <td style="text-align: center;">
                                <div style="display: flex; gap: 4px; justify-content: center;">
                                  <button class="btn btn-sm" onclick="window.app.sendIncidentWhatsApp('${inc.id}')" style="background: #22c55e; color: white; font-weight: 800; font-size: 10.5px; padding: 3px 8px;" title="Notificar a Apoderado por WhatsApp">
                                    💬 WhatsApp
                                  </button>
                                  <button class="btn btn-navy btn-sm" onclick="window.app.openIncidentOfficialPrintModal('${inc.id}')" style="font-size: 10.5px; padding: 3px 8px;" title="Imprimir Acta A4 de Compromiso">
                                    Acta A4
                                  </button>
                                </div>
                              </td>
                            </tr>
                          `;
                        }).join('') : `
                          <tr>
                            <td colspan="10" style="text-align: center; padding: 20px; color: #64748b;">
                              No hay incidencias registradas en el periodo escolar.
                            </td>
                          </tr>
                        `}
                      </tbody>
                    </table>
                  </div>
                </div>
              `;
            })()}

          ` : ''}

        <!-- =========================================================================
             SUB-PESTAÑA 6: PADRE DE FAMILIA O ESTUDIANTE (HISTORIAL Y SEGUIMIENTO)
             ========================================================================= -->
        ${activeSubTab === 'student-history' ? `
          
          <!-- RESUMEN DE ASISTENCIA DEL ESTUDIANTE -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: var(--space-5);">
            <div class="card" style="padding: 14px; border-left: 4px solid #10b981; background: #ecfdf5;">
              <span style="font-size: 11px; font-weight: 800; color: #065f46;">PORCENTAJE DE ASISTENCIA</span>
              <div style="font-size: 26px; font-weight: 900; color: #047857; margin: 4px 0;">98.5%</div>
              <span class="status-badge status-approved" style="font-size: 10px;">★ Récord Destacado</span>
            </div>

            <div class="card" style="padding: 14px; border-left: 4px solid #3b82f6; background: #eff6ff;">
              <span style="font-size: 11px; font-weight: 800; color: #1e40af;">DÍAS ASISTIDOS PUNTUAL</span>
              <div style="font-size: 26px; font-weight: 900; color: #1e3a8a; margin: 4px 0;">22 Días</div>
              <span style="font-size: 10.5px; color: #64748b;">En el presente bimestre</span>
            </div>

            <div class="card" style="padding: 14px; border-left: 4px solid #f59e0b; background: #fffbeb;">
              <span style="font-size: 11px; font-weight: 800; color: #92400e;">TARDANZAS REGISTRADAS</span>
              <div style="font-size: 26px; font-weight: 900; color: #b45309; margin: 4px 0;">1 Día</div>
              <span style="font-size: 10.5px; color: #b45309;">(Tardanza justificada)</span>
            </div>

            <div class="card" style="padding: 14px; border-left: 4px solid #8b5cf6; background: #f5f3ff;">
              <span style="font-size: 11px; font-weight: 800; color: #5b21b6;">FALTAS JUSTIFICADAS</span>
              <div style="font-size: 26px; font-weight: 900; color: #6d28d9; margin: 4px 0;">1 Falta</div>
              <span style="font-size: 10.5px; color: #6d28d9;">Con constancia médica</span>
            </div>
          </div>

          <!-- HISTORIAL BIOMÉTRICO DETALLADO -->
          <div class="card" style="margin-bottom: var(--space-4);">
            <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <div>
                <h3 class="card-title" style="font-size: var(--font-size-base); margin: 0;">
                  ⏱️ Historial de Marcación QR en Puerta: ${studentName} (${studentGrade})
                </h3>
                <span style="font-size: 11px; color: var(--text-muted);">
                  Registro automático del escáner en portería y molinete de acceso.
                </span>
              </div>
              
              <div style="display: flex; gap: 6px;">
                <button class="btn btn-navy btn-sm" onclick="window.app.openStudentQRModal('${studentCode}')" style="font-weight: 800; font-size: 11.5px;">
                  Ver Mi Código QR
                </button>
                ${isPadre ? `
                  <button class="btn btn-outline btn-sm" onclick="window.app.openJustifyAttendanceModal('${studentCode}', '19/08/2026')" style="font-weight: 800; font-size: 11.5px;">
                    📝 Enviar Justificación
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Día</th>
                    <th>Hora de Ingreso</th>
                    <th>Hora de Salida</th>
                    <th>Puntualidad & Estado</th>
                    <th>Método de Validación</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${studentHistory.map(h => `
                    <tr>
                      <td><strong>${h.date}</strong></td>
                      <td>${h.day}</td>
                      <td>
                        <strong style="color: ${h.status === 'Presente' ? '#047857' : h.status === 'Tardanza' ? '#b45309' : '#6d28d9'}; font-size: 12.5px;">
                          ${h.arrivalTime || '--:--'}
                        </strong>
                      </td>
                      <td><code>${h.exitTime || '03:30 PM'}</code></td>
                      <td>
                        <span class="status-badge ${h.status === 'Presente' ? 'status-approved' : h.status === 'Tardanza' ? 'status-pending' : 'status-approved'}" style="font-weight: 800;">
                          ${h.status === 'Presente' ? '<span class="status-dot-green"></span> Presente a Tiempo' : h.status === 'Tardanza' ? '<span class="status-dot-yellow"></span> Tardanza' : '🔵 Justificada'}
                        </span>
                      </td>
                      <td>
                        <span style="font-size: 11px; color: #475569;">
                          ${h.method || 'Fotocheck QR (Portería)'}
                        </span>
                      </td>
                      <td>
                        <span style="font-size: 11px; color: #64748b;">
                          ${h.observations || 'Conforme'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECCIÓN: REGISTRO CONDUCTUAL & ANECDOTARIO ESCOLAR DEL ALUMNO -->
          ${(() => {
            const studentInc = (state.behaviorIncidents || initialData.behaviorIncidents || []).filter(i => 
              (i.studentCode && i.studentCode === studentCode) ||
              (i.studentName && i.studentName.toLowerCase().includes((studentName || '').toLowerCase()))
            );

            return `
              <div class="card">
                <div class="card-header" style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
                  <div>
                    <h3 class="card-title" style="font-size: var(--font-size-base); margin: 0; color: #1e3a8a;">
                      Registro Conductual & Anecdotario Escolar de ${studentName}
                    </h3>
                    <span style="font-size: 11px; color: var(--text-muted);">
                      Seguimiento formativo, reconocimientos e informes disciplinarios registrados institucionalmente.
                    </span>
                  </div>
                </div>

                <div class="table-container">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Gravedad</th>
                        <th>Categoría / Motivo</th>
                        <th>Lugar</th>
                        <th>Docente / Auxiliar</th>
                        <th>Detalle & Compromiso</th>
                        <th style="text-align: center;">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${studentInc.length > 0 ? studentInc.map(inc => `
                        <tr>
                          <td><strong>${inc.date}</strong><br><span style="font-size: 10.5px; color:#64748b;">${inc.time}</span></td>
                          <td>
                            <span class="status-badge" style="background: ${inc.severity === 'Mérito' ? '#10b981' : inc.severity === 'Leve' ? '#f59e0b' : '#ef4444'}; color: white; font-weight: 800;">
                              ${inc.severity}
                            </span>
                          </td>
                          <td><strong>${inc.category}</strong></td>
                          <td>${inc.location}</td>
                          <td>${inc.reportedBy}</td>
                          <td style="font-size: 11.5px; line-height: 1.4;">
                            <div>${inc.description}</div>
                            <div style="color: #1e3a8a; font-weight: bold; margin-top: 2px;">Compromiso: ${inc.correctiveMeasure}</div>
                          </td>
                          <td style="text-align: center;">
                            <span class="status-badge status-approved" style="font-size: 10px;">✓ ${inc.status}</span>
                          </td>
                        </tr>
                      `).join('') : `
                        <tr>
                          <td colspan="7" style="text-align: center; padding: 18px; color: #047857; font-weight: bold;">
                            🌟 ¡Excelente conducta! No registra ninguna observación disciplinaria en su expediente escolar.
                          </td>
                        </tr>
                      `}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          })()}

        ` : ''}

      </div>
    `;
  },

  // Comunicados
  renderAnnouncements(state) {
    const isAdmin = state.currentRole === 'admin' || state.currentRole === 'director';
    return `
      <div class="fade-in">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title" style="font-size: var(--font-size-xl);">Muro de Circulares e Informes</h2>
            ${isAdmin ? `<button class="btn btn-red btn-sm" onclick="window.app.openNewAnnouncementModal()">+ Publicar</button>` : ''}
          </div>
          <div class="announcement-list">
            ${state.announcements.map(a => `
              <div class="card" style="border-left: 6px solid ${a.priority === 'high' ? 'var(--color-yellow-500)' : 'var(--color-navy-700)'};">
                <span class="announcement-tag tag-urgent">${a.tagLabel}</span>
                <h3>${a.title}</h3>
                <p style="font-size:13px; color:var(--text-secondary); margin-top:4px;">${a.content}</p>
                <div style="margin-top: 8px;">
                  <button class="btn btn-outline btn-sm" onclick="window.app.showOfficialReportModal()">Ver Documento Completo</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PANTALLA DE BLOQUEO DE INTRANET POR PENSIÓN PENDIENTE
  // =========================================================================
  renderLockedAccessScreen(state, user) {
    const debtAmount = user.pendingDebtAmount || 480.00;
    const concept = user.pendingConcept || "Pensión Escolar - Agosto 2026";

    return `
      <div class="fade-in" style="max-width: 780px; margin: 0 auto; padding: var(--space-4);">
        <div class="card" style="border: 2px solid var(--color-red-500); box-shadow: 0 10px 25px rgba(220, 38, 38, 0.15); border-radius: 12px; overflow: hidden;">
          
          <!-- Encabezado de Alerta Institucional -->
          <div style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); color: white; padding: 24px; text-align: center;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 8px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" />
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: var(--color-yellow-300); text-transform: uppercase;">
              I.E.P. "EL EDUCADOR" • 21 AÑOS DEJANDO HUELLAS (S.J.L.)
            </div>
            <h2 style="font-size: 22px; font-weight: 900; margin: 6px 0 4px; color: white;">
              ACCESO A LA INTRANET RESTRINGIDO
            </h2>
            <p style="font-size: 13px; color: #fecaca; margin: 0;">
              Validación de Pensión Escolar Requerida para el Alumno(a) y Apoderado(a)
            </p>
          </div>

          <div style="padding: 24px;">
            <div style="background: #fff5f5; border-left: 4px solid var(--color-red-500); padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
              <div style="font-weight: 800; color: #991b1b; font-size: 14px; margin-bottom: 4px;">
                ⚠️ Notificación de Coordinación y Tesorería
              </div>
              <p style="font-size: 13px; color: #7f1d1d; margin: 0; line-height: 1.5;">
                Estimado(a) <strong>${user.name}</strong>, el acceso a las notas bimestrales, horario de clases, control de cuadernos QR y aula virtual se encuentra temporalmente bloqueado debido a una cuota pendiente de pago.
              </p>
            </div>

            <!-- Resumen de Cuenta Pendiente -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: var(--bg-surface-subtle); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
              <div>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: bold; text-transform: uppercase;">Concepto Pendiente</span>
                <div style="font-size: 14px; font-weight: 800; color: var(--color-navy-900);">${concept}</div>
              </div>
              <div>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: bold; text-transform: uppercase;">Monto a Cancelar</span>
                <div style="font-size: 22px; font-weight: 900; color: var(--color-red-600);">S/ ${debtAmount.toFixed(2)}</div>
              </div>
              <div>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: bold; text-transform: uppercase;">Estado Actual</span>
                <div><span class="status-badge status-failed" style="font-weight: bold;"><span class='status-dot-red'></span> Bloqueado por Mora</span></div>
              </div>
            </div>

            <!-- Métodos de Pago y Desbloqueo Inmediato -->
            <h3 style="font-size: 15px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              ⚡ Realizar Pago y Desbloquear Intranet en Tiempo Real:
            </h3>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 20px;">
              
              <!-- Opción 1: Tarjeta Débito / Crédito -->
              <div class="card" style="border: 2px solid var(--border-subtle); cursor: pointer; padding: 14px; text-align: center; transition: all 0.2s;" onclick="window.app.openPayModal('PEN-08', ${debtAmount}, '${concept}')">
                <div style="font-size: 24px; margin-bottom: 4px;"></div>
                <strong style="font-size: 13px; color: var(--color-navy-900);">Tarjeta Débito / Crédito</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Visa, Mastercard, Débito</p>
                <span class="status-badge status-approved" style="background: #22c55e; color: #0b132b; font-weight: 800; margin-top: 6px;">Desbloqueo Inmediato</span>
              </div>

              <!-- Opción 2: Yape / Plin -->
              <div class="card" style="border: 2px solid var(--border-subtle); cursor: pointer; padding: 14px; text-align: center; transition: all 0.2s;" onclick="window.app.openYapePayModal('PEN-08', ${debtAmount})">
                <div style="font-size: 24px; margin-bottom: 4px;"></div>
                <strong style="font-size: 13px; color: #6d28d9;">Yape / Plin Institucional</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">987-654-321 (I.E.P. El Educador)</p>
                <span class="status-badge status-approved" style="background: #22c55e; color: #0b132b; font-weight: 800; margin-top: 6px;">Validación Automática</span>
              </div>

              <!-- Opción 3: Transferencia BCP / BBVA -->
              <div class="card" style="border: 2px solid var(--border-subtle); cursor: pointer; padding: 14px; text-align: center; transition: all 0.2s;" onclick="window.app.openBankTransferModal('PEN-08', ${debtAmount})">
                <div style="font-size: 24px; margin-bottom: 4px;">🏦</div>
                <strong style="font-size: 13px; color: var(--color-navy-900);">Depósito Bancario / Agente</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">BCP / BBVA / Banco Nación</p>
                <span class="status-badge status-approved" style="background: #f59e0b; color: #0b132b; font-weight: 800; margin-top: 6px;">Ingresar Voucher</span>
              </div>
            </div>

            <!-- Botón de Pago Rápido Principal -->
            <button class="btn btn-red" onclick="window.app.openPayModal('PEN-08', ${debtAmount}, '${concept}')" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
              <span>Pagar S/ ${debtAmount.toFixed(2)} y Desbloquear Intranet Ahora</span>
            </button>

            <div style="text-align: center; margin-top: 14px; font-size: 11px; color: var(--text-muted);">
              Al confirmar el pago, la base de datos central emitirá su recibo digital y se habilitará el acceso en todos sus dispositivos al instante.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // Pagos y Panel de Tesorería
  renderPayments(state) {
    const isCoordination = state.currentRole === "admin" || state.currentRole === "director";
    const families = (window.appStore && typeof window.appStore.getFamiliesFinancial === "function")
      ? window.appStore.getFamiliesFinancial()
      : (state.familiesFinancial || initialData.familiesFinancial || []);
    const collected = (state.institution && state.institution.economicReport) ? state.institution.economicReport.collectedAmount : 25130.00;

    return `
      <div class="fade-in">
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 class="card-title" style="font-size: var(--font-size-xl);">Control de Pensiones & Validación Automática de Intranet</h2>
                <span class="status-badge status-approved"><span class='status-dot-green'></span> Sistema de Pago Online Activo</span>
              </div>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                I.E.P. "El Educador" • "21 años dejando huellas" (S.J.L. • UGEL 05)
              </p>
            </div>
            ${isCoordination ? `
              <button class="btn btn-gold btn-sm" onclick="window.app.openManualPaymentModal()">
                + Registrar Pago en Caja (Efectivo/Banco)
              </button>
            ` : ''}
          </div>

          <!-- Métricas de Recaudación -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-6);">
            <div class="card" style="padding: var(--space-4); border-left: 4px solid var(--color-green-500); background: #f8faf9;">
              <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Recaudación Acumulada Agosto</span>
              <div style="font-size: 22px; font-weight: 900; color: var(--color-green-600); margin-top: 2px;">S/ ${collected.toFixed(2)}</div>
              <span style="font-size: 10px; color: var(--text-muted);">Meta mensual: S/ 24,000.00</span>
            </div>

            <div class="card" style="padding: var(--space-4); border-left: 4px solid var(--color-navy-700); background: var(--bg-surface-subtle);">
              <span style="font-size: 11px; font-weight: bold; color: var(--text-muted); text-transform: uppercase;">Validación Automática</span>
              <div style="font-size: 18px; font-weight: 800; color: var(--color-navy-900); margin-top: 2px;">Habilitada ⚡</div>
              <span style="font-size: 10px; color: var(--text-muted);">Desbloqueo inmediato con pago</span>
            </div>
          </div>

          ${isCoordination ? `
            <!-- Panel Exclusivo para Coordinación y Dirección: Control de Familias y Bloqueos -->
            <div style="margin-bottom: var(--space-6);">
              <div class="card-header" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
                <h3 class="card-title" style="font-size: var(--font-size-base);">
                  👥 Estado Financiero por Familia y Bloqueo de Acceso a Intranet
                </h3>
                <span class="status-badge status-approved">${families.length} Familias Monitoreadas</span>
              </div>
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Código</th><th>Apoderado / Familia</th><th>Estudiante</th><th>Grado</th><th>Monto Deuda</th><th>Acceso a Intranet</th><th style="text-align:center;">Acciones de Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${families.map(f => `
                      <tr>
                        <td><code>${f.familyId}</code></td>
                        <td><strong>${f.guardian}</strong></td>
                        <td>${f.studentName}</td>
                        <td>${f.grade}</td>
                        <td><strong style="color: ${f.pendingAmount > 0 ? 'var(--color-red-600)' : 'var(--color-green-600)'};">${f.pendingAmount > 0 ? `S/ ${f.pendingAmount.toFixed(2)}` : 'S/ 0.00 (Al Día)'}</strong></td>
                        <td>
                          <span class="status-badge ${f.isAccessLocked ? 'status-failed' : 'status-approved'}" style="font-weight: bold;">
                            ${f.isAccessLocked ? '<span class="status-dot-red"></span> BLOQUEADO POR MORA' : '<span class="status-dot-green"></span> ACCESO HABILITADO'}
                          </span>
                        </td>
                        <td style="text-align:center; white-space: nowrap;">
                          <button class="btn btn-sm ${f.isAccessLocked ? 'btn-gold' : 'btn-outline'}" onclick="window.app.toggleFamilyLock('${f.familyId}')">
                            ${f.isAccessLocked ? '<span class="status-dot-green"></span> Desbloquear / Prórroga' : '<span class="status-dot-red"></span> Bloquear Acceso'}
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- Lista de Pagos del Usuario -->
          <div class="card-header" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
            <h3 class="card-title" style="font-size: var(--font-size-base);">
              Cronograma de Cuotas y Recibos Oficiales
            </h3>
          </div>

          ${state.payments.map(p => `
            <div class="payment-card ${p.status}">
              <div>
                <h4 style="margin-bottom: 2px;">${p.concept}</h4>
                <span style="font-size:12px; color:var(--text-muted);">Vencimiento: ${p.dueDate} ${p.paidDate ? `• Cancelado: ${p.paidDate}` : ''}</span>
              </div>
              <div style="display:flex; align-items:center; gap:var(--space-4); flex-wrap: wrap;">
                <span class="payment-amount" style="color: ${p.status === 'paid' ? 'var(--color-green-600)' : 'var(--color-red-600)'};">
                  S/ ${p.amount.toFixed(2)}
                </span>
                ${p.status === 'paid' ? `
                  <button class="btn btn-outline btn-sm" onclick="window.app.showReceiptModal('${p.id}')">
                    Ver Recibo (${p.receiptNo || 'REC-2026'})
                  </button>
                ` : `
                  <button class="btn btn-red btn-sm" onclick="window.app.openPayModal('${p.id}', ${p.amount}, '${p.concept}')" style="font-weight: 800;">
                    Pagar y Validar Intranet
                  </button>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};

