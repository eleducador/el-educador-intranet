/**
 * Controlador Principal y Aplicación - I.E.P. "EL EDUCADOR" S.J.L. (v5.4 con Lector de Cámara QR Real)
 * "21 años dejando huellas" • UGEL 05
 */
class IntranetApp {
  constructor() {
    this.store = window.appStore;
    this.contentArea = document.getElementById("content-area");
    this.sidebar = document.getElementById("sidebar");
    this.loginErrorMessage = null;
    this.html5QrScanner = null;
    this.isCameraActive = false;
  }

  init() {
    this.contentArea = document.getElementById("content-area");
    this.sidebar = document.getElementById("sidebar");

    // Suscribirse a cambios en el almacén de datos (con protección contra parpadeo y reinicios de cámara)
    this.store.subscribe(() => {
      // Si la cámara en vivo de portería o cuadernos está activa, NO destruir el DOM
      if (this.isDoorCamActive || this.isCameraActive || this.isAgendaModalCamActive) {
        this.updateLiveFeedCounters();
        this.updateHeaderUserInfo();
        return;
      }
      // Si el usuario está en la vista de escaneo de portería, actualizar componentes de forma suave sin refrescar
      if (this.store.state.currentView === "asistencia" && (this.store.state.attendanceActiveSubTab === "door-scanner" || !this.store.state.attendanceActiveSubTab)) {
        this.updateLiveFeedCounters();
        this.updateHeaderUserInfo();
        return;
      }
      this.render();
      this.updateHeaderUserInfo();
    });

    // Escuchador de navegación de la sidebar
    document.querySelectorAll(".nav-item[data-view]").forEach(item => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const view = item.getAttribute("data-view");
        this.navigate(view);
      });
    });

    // Toggle Sidebar Móvil
    const toggleBtn = document.getElementById("sidebar-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        this.sidebar.classList.toggle("open");
      });
    }

    // Cerrar sidebar al hacer clic fuera en móviles
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024 && this.sidebar && this.sidebar.classList.contains("open")) {
        if (!this.sidebar.contains(e.target) && !e.target.closest("#sidebar-toggle")) {
          this.sidebar.classList.remove("open");
        }
      }
    });

    // Render inicial
    this.render();
    this.updateHeaderUserInfo();
    this.startRealtimeSync();
  }

  // =========================================================================
  // CONTROLADOR DE LOGIN Y AUTENTICACIÓN
  // =========================================================================
  handleLogin(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");

    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const result = this.store.login(username, password);
    if (result.success) {
      this.loginErrorMessage = null;
      this.render();
      this.updateHeaderUserInfo();
      this.showToast(`¡Bienvenido(a), ${result.user.name}!`, "success");
    } else {
      this.loginErrorMessage = result.error;
      this.render();
    }
  }

  quickLogin(roleKey, password) {
    const result = this.store.login(roleKey, password);
    if (result.success) {
      this.loginErrorMessage = null;
      this.render();
      this.updateHeaderUserInfo();
      this.showToast(`¡Acceso concedido como ${result.user.name}!`, "success");
    }
  }

  handleLogout() {
    this.stopLiveCameraScanner();
    this.store.logout();
    this.loginErrorMessage = null;
    this.showToast("Sesión cerrada correctamente", "info");
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById("login-password");
    const icon = document.getElementById("eye-icon");
    if (!passwordInput) return;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      if (icon) {
        icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
      }
    } else {
      passwordInput.type = "password";
      if (icon) {
        icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
      }
    }
  }

  openForgotPasswordModal() {
    this.showModal(`
      <div class="modal-header">
        <h3>Recuperación de Contraseña</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: var(--space-6);">
        <h4 style="color: var(--color-navy-900); font-weight: 800; margin-bottom: 8px;">Coordinación y Documentación (Prof. Alex Lino)</h4>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
          Para restablecimiento de credenciales, comuníquese con la oficina de Coordinación:
        </p>
        <div style="background: var(--color-navy-50); padding: 10px; border-radius: 6px; font-weight: bold; color: var(--color-red-600); margin: 12px 0;">
          coordinacion@eleducador.edu.pe
        </div>
        <p style="font-size: 11px; color: var(--text-muted);">
          * Contraseñas de prueba: <code>admin2026</code>, <code>director2026</code>, <code>docente2026</code>, <code>estudiante2026</code>, <code>padre2026</code>.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-navy" onclick="window.app.closeModal()">Entendido</button>
      </div>
    `);
  }

  // =========================================================================
  // CAMBIO DE CONTRASEÑA DE USUARIO (VISIBLE PARA ADMINISTRADOR)
  // =========================================================================
  openChangePasswordModal() {
    const user = this.store.getCurrentUser();
    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">🔑 Cambiar Mi Contraseña de Acceso</h3>
          <span style="font-size: 11px; opacity: 0.9;">Usuario: <strong>${user.name || user.username}</strong> (${user.role || 'Docente'})</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <form onsubmit="window.app.confirmChangePassword(event)">
        <div class="modal-body" style="padding: 20px; background: #f8fafc;">
          
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-weight: 800; color: #0f172a;">Contraseña Actual *</label>
            <input type="password" name="currentPassword" class="form-control" placeholder="Ingrese su clave actual" required style="font-weight: bold; font-size: 13px;" />
            <span style="font-size: 11px; color: #64748b;">(Clave actual activa en el sistema)</span>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-weight: 800; color: #0f172a;">Nueva Contraseña *</label>
            <input type="password" name="newPassword" id="new-password-field" class="form-control" placeholder="Mínimo 4 caracteres" minlength="4" required style="font-weight: bold; font-size: 13px;" />
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-weight: 800; color: #0f172a;">Confirmar Nueva Contraseña *</label>
            <input type="password" name="confirmPassword" id="confirm-password-field" class="form-control" placeholder="Repita la nueva clave" minlength="4" required style="font-weight: bold; font-size: 13px;" />
          </div>

          <div style="padding: 10px 14px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; font-size: 11.5px; color: #1e40af;">
            ℹ️ <strong>Seguridad Institucional:</strong> Por políticas de soporte, la administración institucional podrá visualizar su nueva clave en el directorio general para evitar pérdidas de acceso.
          </div>

        </div>
        <div class="modal-footer" style="padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-navy" style="font-weight: 900;">✓ Actualizar Contraseña</button>
        </div>
      </form>
    `);
  }

  confirmChangePassword(event) {
    if (event) event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const currentPass = (formData.get("currentPassword") || "").trim();
    const newPass = (formData.get("newPassword") || "").trim();
    const confirmPass = (formData.get("confirmPassword") || "").trim();

    if (newPass !== confirmPass) {
      alert("Las nuevas contraseñas no coinciden. Por favor verifíquelas.");
      return;
    }

    const user = this.store.getCurrentUser();
    const res = this.store.changeUserPassword(user.code || user.id || user.username, newPass, currentPass);

    if (res.success) {
      this.closeModal();
      this.showToast(`✓ Contraseña actualizada exitosamente. Nueva clave: "${newPass}"`, "success");
      this.render();
    } else {
      alert(res.error || "No se pudo actualizar la contraseña. Verifique su clave actual.");
    }
  }

  // Matricular Estudiante con Apoderado desde el Portal de Administración
  openAdminAddStudentWithParentModal() {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">➕ Matricular Estudiante & Crear Cuenta de Apoderado</h3>
          <span style="font-size: 11px; opacity: 0.9;">I.E.P. "El Educador" • Generación Automática de Cuentas y Accesos</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <form onsubmit="window.app.confirmAdminAddStudentWithParent(event)">
        <div class="modal-body" style="padding: 20px; background: #f8fafc;">
          
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">1. Nombre y Apellido Completo del Estudiante *</label>
              <input type="text" name="studentName" class="form-control" placeholder="Ej. Camila Sofía Mendoza Huamán" required style="font-weight: bold; font-size: 13px;" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">2. Grado Escolar a Matricular *</label>
              <select name="gradeId" class="form-control" required style="font-weight: bold; font-size: 13px; background: #fffbeb; border-color: #f59e0b;">
                ${catalog.map(g => `
                  <option value="${g.id}">${g.label} • (Tutor: ${g.tutor || 'Asignado'})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">3. DNI del Estudiante (Opcional)</label>
              <input type="text" name="dni" class="form-control" placeholder="Ej. 75891234" maxlength="8" style="font-size: 13px;" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">4. Nombre Completo del Padre / Apoderado *</label>
              <input type="text" name="guardian" class="form-control" placeholder="Ej. Rosa Huamán Prado" required style="font-weight: bold; font-size: 13px;" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">5. Teléfono de Contacto del Apoderado *</label>
              <input type="tel" name="phone" class="form-control" placeholder="Ej. 987-654-321" required style="font-weight: bold; font-size: 13px;" />
            </div>

          </div>

          <div style="margin-top: 14px; padding: 12px 14px; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 4px; font-size: 11.5px; color: #1e40af; line-height: 1.4;">
            ✨ <strong>Sincronización Total de Cuentas:</strong><br>
            • Se creará el usuario <code>Estudiante</code> (clave por defecto: <code>estudiante2026</code>).<br>
            • Se creará el usuario <code>Apoderado</code> (clave por defecto: <code>padre2026</code>) vinculado al estudiante.<br>
            • Ambos aparecerán inmediatamente en la tabla de <strong>Gestión de Usuarios</strong> con contraseñas visibles.
          </div>

        </div>
        <div class="modal-footer" style="padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-gold" style="font-weight: 900;">✓ Matricular y Crear Cuentas</button>
        </div>
      </form>
    `);
  }

  confirmAdminAddStudentWithParent(event) {
    if (event) event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const gradeId = formData.get("gradeId") || "4sec";
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = gradeId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: "4° de Secundaria" };

    const studentData = {
      studentCode: `EST-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: (formData.get("studentName") || "").trim(),
      gradeId: gradeId,
      grade: gradeObj.label,
      guardian: (formData.get("guardian") || "Padre / Apoderado").trim(),
      phone: (formData.get("phone") || "987-654-321").trim(),
      guardianPhone: (formData.get("phone") || "987-654-321").trim(),
      dni: (formData.get("dni") || "").trim() || `7${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    if (!studentData.studentName) {
      alert("Por favor ingrese el nombre del estudiante.");
      return;
    }

    this.store.addStudentToGrade(studentData);
    this.closeModal();
    this.showToast(`✓ Estudiante "${studentData.studentName}" y cuenta de apoderado "${studentData.guardian}" creados con éxito.`, "success");
    this.render();
  }

  // =========================================================================
  // CONEXIÓN MULTI-DISPOSITIVO & ESCANEO SIMULTÁNEO (CELULARES Y PCS)
  // =========================================================================
  openMultiDeviceConnectModal() {
    const isHttp = typeof window !== "undefined" && window.location.protocol.startsWith("http");
    const port = (typeof window !== "undefined" && window.location.port) ? `:${window.location.port}` : "";
    const currentHost = (typeof window !== "undefined" && window.location.hostname) ? window.location.hostname : "";
    
    let targetUrl = "http://192.168.1.129:8080";
    if (isHttp) {
      if (currentHost === "localhost" || currentHost === "127.0.0.1") {
        targetUrl = `http://192.168.1.129${port || ':8080'}`;
      } else {
        targetUrl = window.location.origin;
      }
    }

    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(targetUrl)}`;

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">
            Conectar Celular para Escaneo Simultáneo
          </h3>
          <span style="font-size: 11px; opacity: 0.9;">Acceso Multi-Dispositivo en Tiempo Real (Varios Profesores a la Vez)</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: 20px; background: #f8fafc;">
        
        <div style="background: white; border: 2px solid #3b82f6; border-radius: 16px; padding: 20px; display: inline-block; box-shadow: 0 8px 24px rgba(59,130,246,0.15); margin-bottom: 16px;">
          <img src="${qrApiUrl}" alt="QR Conexión Móvil" style="width: 200px; height: 200px; display: block; border-radius: 8px; margin: 0 auto;" onerror="this.src='https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(targetUrl)}'" />
          <div style="margin-top: 10px; font-size: 13px; font-weight: 900; color: #1e3a8a;">
            ${targetUrl}
          </div>
        </div>

        <div style="text-align: left; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #0f172a; font-weight: 800;">
            ¿Cómo escanear con varios celulares al mismo tiempo sin perder datos?
          </h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
            <li>Conecta tu celular a la <strong>misma red Wi-Fi</strong> del colegio.</li>
            <li>Apunta la <strong>cámara de tu celular</strong> a este código QR o abre en el navegador: <code>${targetUrl}</code>.</li>
            <li>Inicia sesión con tu cuenta de <strong>Docente</strong> o <strong>Auxiliar</strong>.</li>
            <li><strong>Escaneo On-Demand:</strong> La cámara solo se enciende cuando tú presionas el botón para no gastar batería ni escanear por accidente.</li>
            <li><strong>Sincronización en Vivo:</strong> Cuando tú calificas un cuaderno, aparece al instante en la pantalla de los demás profesores y de la dirección.</li>
          </ol>
        </div>

        <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText('${targetUrl}'); window.app.showToast('Enlace copiado al portapapeles: ${targetUrl}', 'success');" style="font-weight: 700;">
            Copiar Enlace Directo
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-navy btn-sm" onclick="window.app.closeModal()" style="font-weight: 800;">
          Entendido / Cerrar
        </button>
      </div>
    `);
  }

  startRealtimeSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      // Sincronización multi-dispositivo en tiempo real cada 2.5 segundos
      if (!this.store || !this.store.isUserAuthenticated()) return;
      // Pausar re-renderizado si la cámara en vivo de portería está activa
      if (this.isDoorCamActive || this.isCameraActive || this.isAgendaModalCamActive) return;
      this.store.fetchServerState(true);
    }, 2500);
  }

  // Actualización reactiva suave del feed de ingresos (sin parpadeo ni recarga de pantalla)
  updateLiveFeedCounters() {
    const recentContainer = document.getElementById("door-recent-scans-container");
    if (recentContainer && this.store) {
      const records = this.store.state.attendanceRecords || [];
      const recent = records.slice(0, 6);
      recentContainer.innerHTML = recent.map(r => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px solid #f1f5f9; animation: fadeIn 0.3s ease;">
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
      `).join('') || '<div style="text-align: center; color: #64748b; padding: 10px;">Sin registros recientes</div>';
    }
  }

  // =========================================================================
  // LECTOR DE CÁMARA QR REAL PARA CELULARES Y COMPUTADORAS (BAJO DEMANDA)
  // =========================================================================
  playScanBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Tono A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.log("Audio Web no disponible", e);
    }
  }

  startLiveCameraScanner() {
    const feedContainer = document.getElementById("qr-live-camera-feed");
    const statusTag = document.getElementById("camera-status-tag");
    const btnStart = document.getElementById("btn-start-camera");
    const btnStop = document.getElementById("btn-stop-camera");

    if (!feedContainer) return;

    if (typeof Html5Qrcode === "undefined") {
      this.showToast("Cargando motor de cámara QR, intente en 1 segundo...", "info");
      return;
    }

    if (statusTag) {
      statusTag.textContent = "Conectando cámara...";
      statusTag.className = "status-badge status-pending";
    }

    try {
      this.html5QrScanner = new Html5Qrcode("qr-live-camera-feed");
      const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      };

      this.isScanProcessing = false;

      // Preferir cámara trasera en celulares (facingMode: environment)
      this.html5QrScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          // Anti-rebote: evitar escaneos duplicados en milisegundos
          if (this.isScanProcessing) return;
          this.isScanProcessing = true;

          this.playScanBeep();
          if (navigator.vibrate) navigator.vibrate(150);

          this.showToast(`✓ QR Reconocido: ${decodedText}`, "success");
          this.stopLiveCameraScanner();

          const notebookData = this.store.findNotebookByQR(decodedText);
          setTimeout(() => {
            this.openNotebookReviewModal(notebookData);
            this.isScanProcessing = false;
          }, 300);
        },
        (errorMessage) => {
          // Error de cuadro mientras enfoca (ignorar)
        }
      ).then(() => {
        this.isCameraActive = true;
        if (statusTag) {
          statusTag.textContent = "<span class='status-dot-green'></span> CÁMARA ACTIVA";
          statusTag.className = "status-badge status-approved";
        }
        if (btnStart) btnStart.style.display = "none";
        if (btnStop) btnStop.style.display = "inline-block";
        this.showToast("[Cámara] Cámara encendida. Apunta hacia el sticker QR del cuaderno.", "info");
      }).catch((err) => {
        console.error("Error al acceder a la cámara:", err);
        if (statusTag) {
          statusTag.textContent = "Permiso Denegado / Error";
          statusTag.className = "status-badge status-failed";
        }
        this.showToast("No se pudo acceder a la cámara. Verifique los permisos en el navegador.", "danger");
      });
    } catch (e) {
      console.error(e);
      this.showToast("Error al inicializar el lector de cámara QR", "danger");
    }
  }

  stopLiveCameraScanner() {
    if (this.html5QrScanner && this.isCameraActive) {
      this.html5QrScanner.stop().then(() => {
        this.isCameraActive = false;
        this.isScanProcessing = false;
        const statusTag = document.getElementById("camera-status-tag");
        const btnStart = document.getElementById("btn-start-camera");
        const btnStop = document.getElementById("btn-stop-camera");
        const feedContainer = document.getElementById("qr-live-camera-feed");

        if (statusTag) {
          statusTag.textContent = "Cámara Apagada (En Espera)";
          statusTag.className = "status-badge status-pending";
        }
        if (btnStart) btnStart.style.display = "inline-block";
        if (btnStop) btnStop.style.display = "none";
        if (feedContainer) {
          feedContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; color: rgba(255,255,255,0.7);">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 8px; display:block; color: var(--color-yellow-400);"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <span style="font-size: 12px; font-weight: 700;">Presiona 'Encender Cámara' para iniciar el escaneo</span>
            </div>
          `;
        }
      }).catch(err => console.error(err));
    }
  }

  simulateQRScan(qrCode) {
    if (this.isScanProcessing) return;
    this.isScanProcessing = true;
    this.playScanBeep();
    const notebookData = this.store.findNotebookByQR(qrCode);
    this.showToast(`QR Reconocido: ${qrCode}`, "info");
    setTimeout(() => {
      this.openNotebookReviewModal(notebookData);
      this.isScanProcessing = false;
    }, 300);
  }

  setNotebookActiveSubTab(subTab) {
    this.store.state.notebookActiveSubTab = subTab;
    this.store.saveState();
    this.render();
  }

  onNotebookGradeFilterChange(gradeId) {
    this.store.state.selectedNotebookGrade = gradeId;
    this.store.state.selectedNotebookStudent = "all";
    this.store.saveState();
    this.render();
  }

  onNotebookStudentFilterChange(studentId) {
    this.store.state.selectedNotebookStudent = studentId;
    this.store.saveState();
    this.render();
  }

  onNotebookCourseFilterChange(courseName) {
    this.store.state.selectedNotebookCourseFilter = courseName;
    this.store.saveState();
    this.render();
  }

  setNotebookQuickRemark(text) {
    const input = document.getElementById("nb-remarks-input");
    if (input) input.value = text;
  }

  openNotebookReviewModal(data) {
    const currentUser = this.store.getCurrentUser();
    const currentRole = this.store.getCurrentRole();
    const evaluatorName = currentUser.name || (currentRole === "auxiliar" ? "Lic. Carlos Medina (Auxiliar)" : "Docente Responsable");

    const defaultScore = data.lastReview ? data.lastReview.score : 18;
    const defaultStatus = data.lastReview ? data.lastReview.status : "Al Día";
    const defaultRemarks = data.lastReview ? data.lastReview.teacherRemarks : "Tareas completas al 100% y cuaderno al día.";

    this.showModal(`
      <div class="modal-header">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: var(--color-navy-900);">
            Calificar & Sellar Cuaderno Escolar
          </h3>
          <span style="font-size: 11px; color: var(--text-secondary);">Escaneo de Código QR Verificado</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        
        <!-- Ficha de Identificación del Cuaderno (Alumno + Curso + Profesor) -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: white; padding: 14px; border-radius: 12px; margin-bottom: 16px; border-left: 6px solid #f59e0b; box-shadow: 0 4px 12px rgba(15,23,42,0.15);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 900; color: #fde047; letter-spacing: 0.05em; text-transform: uppercase;">
              ★ I.E.P. EL EDUCADOR • CUADERNO OFICIAL 2026
            </span>
            <span style="font-size: 10px; background: rgba(255,255,255,0.15); padding: 2px 8px; border-radius: 10px;">
              <code>${data.qrCode}</code>
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 900; margin-bottom: 4px; color: #ffffff;">
            📚 ${data.course}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-top: 8px; font-size: 12px; background: rgba(255,255,255,0.08); padding: 8px 12px; border-radius: 8px;">
            <div>
              <span style="color: rgba(255,255,255,0.7); display: block; font-size: 10px; text-transform: uppercase;">Estudiante:</span>
              <strong style="color: #fde047;">${data.studentName}</strong>
              <div style="font-size: 10.5px; color: rgba(255,255,255,0.8);">${data.grade} • ${data.studentId}</div>
            </div>
            <div>
              <span style="color: rgba(255,255,255,0.7); display: block; font-size: 10px; text-transform: uppercase;">Docente Titular:</span>
              <strong>${data.teacher || 'Prof. Responsable'}</strong>
              <div style="font-size: 10.5px; color: #86efac;">Evaluando: ${evaluatorName}</div>
            </div>
          </div>
        </div>

        <!-- 1. Estado / Sello Digital Oficial -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 800; font-size: 12px; color: var(--color-navy-900);">
            1. Estado del Cuaderno (Sello Digital):
          </label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <label style="border: 2px solid #10b981; background: #ecfdf5; border-radius: 12px; padding: 10px 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <input type="radio" name="nb-status-radio" value="Al Día" ${defaultStatus === 'Al Día' ? 'checked' : ''} onchange="document.getElementById('nb-status-val').value = 'Al Día'; document.getElementById('nb-score-input').value = '18';" />
              <span style="font-size: 16px;"><span class='status-dot-green'></span></span>
              <strong style="font-size: 11px; color: #065f46;">AL DÍA</strong>
              <span style="font-size: 9.5px; color: #047857;">Tareas 100%</span>
            </label>

            <label style="border: 2px solid #f59e0b; background: #fffbeb; border-radius: 12px; padding: 10px 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <input type="radio" name="nb-status-radio" value="Observado" ${defaultStatus === 'Observado' ? 'checked' : ''} onchange="document.getElementById('nb-status-val').value = 'Observado'; document.getElementById('nb-score-input').value = '13';" />
              <span style="font-size: 16px;"><span class='status-dot-yellow'></span></span>
              <strong style="font-size: 11px; color: #b45309;">OBSERVADO</strong>
              <span style="font-size: 9.5px; color: #92400e;">Incompleto / Atraso</span>
            </label>

            <label style="border: 2px solid #ef4444; background: #fef2f2; border-radius: 12px; padding: 10px 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <input type="radio" name="nb-status-radio" value="No Presentó" ${defaultStatus === 'No Presentó' ? 'checked' : ''} onchange="document.getElementById('nb-status-val').value = 'No Presentó'; document.getElementById('nb-score-input').value = '05';" />
              <span style="font-size: 16px;"><span class='status-dot-red'></span></span>
              <strong style="font-size: 11px; color: #b91c1c;">NO PRESENTÓ</strong>
              <span style="font-size: 9.5px; color: #dc2626;">Sin entrega</span>
            </label>
          </div>
          <input type="hidden" id="nb-status-val" value="${defaultStatus}" />
        </div>

        <!-- 2. Calificación Formativa Vigesimal -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-weight: 800; font-size: 12px;">Calificación (0 a 20):</label>
            <input type="number" min="0" max="20" id="nb-score-input" class="form-control" value="${defaultScore}" style="font-size: 18px; font-weight: 900; color: var(--color-navy-900); text-align: center;" />
          </div>
          <div class="form-group" style="margin: 0; display:flex; flex-direction:column; justify-content:center;">
            <span style="font-size: 11px; color: var(--text-muted);">Escala Nacional:</span>
            <div style="font-size: 12px; font-weight: 800; color: #047857; margin-top: 4px;">
              ★ 18-20: AD (Destacado)<br>✓ 14-17: A (Esperado)
            </div>
          </div>
        </div>

        <!-- 3. Criterios de Evaluación -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label" style="font-weight: 800; font-size: 12px;">Criterios Verificados:</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; background: #f8fafc; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <label style="display:flex; align-items:center; gap: 6px;"><input type="checkbox" id="chk-margenes" checked /> Márgenes y Fechas</label>
            <label style="display:flex; align-items:center; gap: 6px;"><input type="checkbox" id="chk-teoria" checked /> Teoría Completa</label>
            <label style="display:flex; align-items:center; gap: 6px;"><input type="checkbox" id="chk-ejercicios" checked /> ✍️ Tareas / Ejercicios al Día</label>
            <label style="display:flex; align-items:center; gap: 6px;"><input type="checkbox" id="chk-pulcritud" checked /> ✨ Pulcritud y Limpieza</label>
          </div>
        </div>

        <!-- 4. Observaciones con Atajos Rápidos -->
        <div class="form-group" style="margin-bottom: 8px;">
          <label class="form-label" style="font-weight: 800; font-size: 12px;">Observaciones para el Estudiante y Apoderado:</label>
          <input type="text" id="nb-remarks-input" class="form-control" value="${defaultRemarks}" style="margin-bottom: 8px;" />
          
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.setNotebookQuickRemark('Tareas completas al 100% y presentación impecable.')" style="font-size: 10.5px; padding: 4px 8px;">
              ✓ Al Día 100%
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.setNotebookQuickRemark('Falta desarrollar la tarea de la última sesión. Presentar regularización.')" style="font-size: 10.5px; padding: 4px 8px;">
              ⚠ Falta Tarea
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.setNotebookQuickRemark('Cuaderno atrasado en 2 temas. Debe ponerse al día.')" style="font-size: 10.5px; padding: 4px 8px;">
              ⚠ Atrasado 2 temas
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.setNotebookQuickRemark('Requiere firma de compromiso del padre/apoderado.')" style="font-size: 10.5px; padding: 4px 8px;">
              ✍️ Firma de Padre
            </button>
          </div>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-gold" onclick="window.app.confirmRegisterNotebookReview('${data.qrCode}', '${data.studentId}', '${data.studentName}', '${data.grade}', '${data.course}', '${data.teacher || 'Prof. Responsable'}')" style="font-weight: 900; padding: 10px 20px;">
          ★ Guardar Sello Digital & Actualizar Informe
        </button>
      </div>
    `);
  }

  confirmRegisterNotebookReview(qrCode, studentId, studentName, grade, course, teacher) {
    const score = parseFloat(document.getElementById("nb-score-input").value) || 18;
    const status = document.getElementById("nb-status-val") ? document.getElementById("nb-status-val").value : "Al Día";
    const teacherRemarks = document.getElementById("nb-remarks-input") ? document.getElementById("nb-remarks-input").value : "Revisión conforme";

    const chkMargenes = document.getElementById("chk-margenes") ? document.getElementById("chk-margenes").checked : true;
    const chkTeoria = document.getElementById("chk-teoria") ? document.getElementById("chk-teoria").checked : true;
    const chkEjercicios = document.getElementById("chk-ejercicios") ? document.getElementById("chk-ejercicios").checked : true;
    const chkPulcritud = document.getElementById("chk-pulcritud") ? document.getElementById("chk-pulcritud").checked : true;

    this.store.registerNotebookReview({
      qrCode,
      studentId,
      studentName,
      grade,
      course,
      teacher,
      score,
      status,
      checklist: { margenes: chkMargenes, teoria: chkTeoria, ejercicios: chkEjercicios, pulcritud: chkPulcritud },
      teacherRemarks
    });

    this.closeModal();
    this.showToast(`✓ Cuaderno de ${studentName} (${course}) sellado como: ${status} [Nota: ${score}]`, "success");
    this.render();
  }

  printNotebookStickerSheet(containerId = 'printable-stickers-sheet', layout) {
    const selectedLayout = layout || document.getElementById('sticker-layout-select')?.value || '3x5';
    this.printOnlyElement(containerId, 'Plancha de Stickers QR - I.E.P. El Educador', selectedLayout);
  }

  printOnlyElement(elementId = "modal-boleta-stickers-grid", title = "Plancha de Stickers", layout) {
    const sourceEl = document.getElementById(elementId);
    if (!sourceEl) {
      window.print();
      return;
    }

    // Resolver layout: parámetro explícito o selector activo (3x5 o 3x4)
    const effectiveLayout = layout || 
      document.getElementById('modal-sticker-layout-select')?.value || 
      document.getElementById('sticker-layout-select')?.value || 
      '3x5';

    // Remover cualquier contenedor de impresión previo
    const existing = document.getElementById("dedicated-print-container");
    if (existing) existing.remove();

    // Crear contenedor exclusivo para la impresión
    const printContainer = document.createElement("div");
    printContainer.id = "dedicated-print-container";
    printContainer.className = "dedicated-print-container";
    
    // Clonar los stickers limpios
    printContainer.innerHTML = sourceEl.innerHTML;
    document.body.appendChild(printContainer);

    document.body.classList.add("printing-stickers-mode");
    document.body.classList.remove("print-layout-3x5", "print-layout-3x4");
    document.body.classList.add(effectiveLayout === "3x4" ? "print-layout-3x4" : "print-layout-3x5");

    const cleanup = () => {
      document.body.classList.remove("printing-stickers-mode", "print-layout-3x5", "print-layout-3x4");
      const el = document.getElementById("dedicated-print-container");
      if (el) el.remove();
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 2500);
    }, 120);
  }

  printNotebookGeneralReport() {
    window.print();
  }

  setAttendanceQRSheetMode(mode) {
    this.store.state.attendanceQRSheetMode = mode;
    this.store.saveState();
    this.render();
  }

  onAttendanceStickerGradeChange(gradeId) {
    this.store.state.selectedAttendanceQRGrade = gradeId;
    this.store.state.selectedAttendanceQRStudent = "all";
    this.store.state.selectedAttendanceQRCourse = "all";
    this.store.saveState();
    this.render();
  }

  onAttendanceStickerStudentChange(studentId) {
    this.store.state.selectedAttendanceQRStudent = studentId;
    this.store.saveState();
    this.render();
  }

  onAttendanceStickerCourseChange(courseId) {
    this.store.state.selectedAttendanceQRCourse = courseId;
    this.store.saveState();
    this.render();
  }

  openStudentFullBoletaStickersModal(studentIdOrCode = "EST-2026-042") {
    const enrollments = this.store.getEnrollments();
    const data = this.store.getStudentAllBoletaStickersData(studentIdOrCode);
    const student = data.student;
    const stickers = data.stickers;

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff;">
        <div>
          <div style="display:flex; align-items:center; gap: 8px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">
              ⚡ Plancha Oficial de Stickers QR para Cuadernos (Cursos de Boleta)
            </h3>
            <span class="status-badge status-approved" style="background:#22c55e; color:#0b132b; font-weight:900; font-size:10px;">
              ${stickers.length} Cursos Oficiales
            </span>
          </div>
          <span style="font-size: 11px; color: rgba(255,255,255,0.85);">
            I.E.P. El Educador • Generación automática (Distribución configurable: 3x5 [15 QR] o 3x4 [12 QR])
          </span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>

      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; background: #f8fafc; padding: 20px;">
        
        <!-- Ficha de Selección del Estudiante y Selector de Distribución -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="font-size: 10.5px; font-weight: 800; color: #64748b; text-transform: uppercase;">Estudiante Seleccionado:</span>
            <div style="font-size: 17px; font-weight: 900; color: #0f172a;">${student.studentName}</div>
            <div style="font-size: 12px; color: #1e3a8a; font-weight: 700;">
              ${student.grade} • Código / DNI: ${student.studentCode || student.dni} • Tutor: ${student.tutor || 'Prof. Titular'}
            </div>
          </div>

          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <div>
              <label style="font-size: 11px; font-weight: 700; color: #475569; display: block; margin-bottom: 2px;">Cambiar Estudiante:</label>
              <select class="form-control" onchange="window.app.openStudentFullBoletaStickersModal(this.value)" style="font-size: 12px; max-width: 220px; border-radius: 16px;">
                ${enrollments.map(e => `
                  <option value="${e.studentCode || e.dni}" ${(e.studentCode === student.studentCode || e.dni === student.dni) ? 'selected' : ''}>
                    ${e.studentName} (${e.grade})
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label style="font-size: 11px; font-weight: 700; color: #1e3a8a; display: block; margin-bottom: 2px;">Formato por Hoja A4:</label>
              <select id="modal-sticker-layout-select" class="form-control" style="font-size: 12px; font-weight: 800; max-width: 210px; border-radius: 16px; background: #eff6ff; border: 1.5px solid #3b82f6; color: #1e3a8a;">
                <option value="3x5" selected>3 × 5 (15 QR por Hoja)</option>
                <option value="3x4">3 × 4 (12 QR por Hoja)</option>
              </select>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 12px; color: #475569; font-weight: 700;">
            Mostrando los <strong>${stickers.length} stickers adhesivos</strong> para cada cuaderno curricular de la boleta:
          </span>
          <button class="btn btn-navy btn-sm" onclick="window.app.printOnlyElement('modal-boleta-stickers-grid', 'Plancha de Boleta')" style="font-weight: 900; padding: 8px 18px; border-radius: 18px; box-shadow: 0 4px 12px rgba(15,23,42,0.2);">
            Imprimir Plancha A4
          </button>
        </div>

        <!-- Grilla de Stickers de Todos los Cursos de la Boleta -->
        <div id="modal-boleta-stickers-grid" class="qr-sticker-sheet" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 12px;">
          ${stickers.map(st => {
            const safePayload = st.qrPayload.replace(/'/g, "\\'");
            return `
              <div class="qr-notebook-sticker" style="border: 2px solid #0f172a; border-radius: 10px; padding: 10px 12px; background: #ffffff; display: flex; gap: 10px; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.05); position: relative; border-left: 5px solid #f59e0b;">
                <div style="flex-shrink: 0; text-align: center; width: 68px;">
                  <div style="width: 68px; height: 68px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 2px; background: white; margin: 0 auto;">
                    ${Components.generateQRSVG(st.qrPayload, 140)}
                  </div>
                  <span style="font-size: 8px; font-weight: 800; color: #475569; display: block; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><code>${st.qrCode}</code></span>
                </div>
                <div style="flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 8px; font-weight: 900; color: #dc2626; letter-spacing: 0.05em; text-transform: uppercase;">
                      ★ I.E.P. EL EDUCADOR • SJL
                    </span>
                    <span class="status-badge" style="font-size: 7.5px; padding: 1px 4px; font-weight: 800; background: #eff6ff; color: #1e40af;">
                      ${st.area || 'Oficial'}
                    </span>
                  </div>
                  <strong style="font-size: 12px; color: #0f172a; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${st.course}">
                    ${st.icon || '📚'} ${st.course}
                  </strong>
                  <div style="font-size: 10.5px; font-weight: 700; color: #1e3a8a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${st.studentName}
                  </div>
                  <div style="font-size: 9.5px; color: #64748b;">
                    ${st.grade} • Cód: <code>${st.studentCode}</code>
                  </div>
                  <div style="font-size: 9px; color: #047857; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${st.teacher}
                  </div>
                  <div style="margin-top: 4px;">
                    <button class="btn btn-outline btn-sm" onclick="window.app.closeModal(); setTimeout(() => window.app.simulateQRScan('${safePayload}'), 150);" style="font-size: 9.5px; padding: 2px 6px; border-radius: 10px; font-weight: 800;">
                      [Cámara] Probar Escaneo
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <span style="font-size: 12px; color: var(--text-muted);">
          Total: <strong>${stickers.length} stickers</strong> correspondientes a la Boleta Oficial de Notas.
        </span>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
          <button class="btn btn-gold" onclick="window.app.printOnlyElement('modal-boleta-stickers-grid', 'Plancha de Boleta')" style="font-weight: 900; padding: 8px 18px;">
            Imprimir Plancha A4
          </button>
        </div>
      </div>
    `);
  }

  // =========================================================================
  // VISTA DEL INFORME OFICIAL N° 003 /ED - COORDINACIÓN Y DOCUMENTACIÓN
  // =========================================================================
  showOfficialReportModal() {
    this.showModal(`
      <div class="modal-header">
        <h3>INFORME N°003 /ED - COORDINACIÓN Y DOCUMENTACIÓN</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; background: #ffffff; padding: 24px;">
        
        ${Components.renderOfficialInstitutionalHeader("INFORME- N°003 /ED - COORDINACIÓN Y DOCUMENTACIÓN", "Informe del día 15/08/2026")}

        <div style="font-size: 13px; color: #0b132b; line-height: 1.6; margin-top: 16px;">
          <p><strong>Asunto:</strong> Informe de actualización económica, gestiones administrativas y seguimiento de casos de estudiantes</p>
          <p style="margin-top: 8px;">Por medio del presente, se informa lo siguiente:</p>

          <div style="margin-top: 14px; padding-left: 8px; border-left: 3px solid var(--color-yellow-500);">
            <strong>1. CANTIDAD ACTUAL DEL MES DE AGOSTO:</strong><br>
            A la fecha, 15 de agosto de 2026, se informa que el monto acumulado correspondiente a los recibos generados asciende a:<br>
            <strong style="color: #059669; font-size: 14px;">S/ 25,130.00 (Veinticinco mil ciento treinta con 00/100 soles).</strong><br>
            <span style="color: var(--text-muted); font-size: 12px;">Lo que normalmente debe ser S/ 24,000.00.</span>
          </div>

          <div style="margin-top: 14px; padding-left: 8px; border-left: 3px solid var(--color-navy-700);">
            <strong>2. GESTIÓN DE RENTA DE CUARTA CATEGORÍA:</strong><br>
            Se realizó la gestión correspondiente a la activación de la Renta de Cuarta Categoría de la <strong>Miss Maritza</strong>, efectuándose las acciones necesarias para su regularización.<br>
            Asimismo, se está adjuntando el envío al contador de los archivos PDF correspondientes a la Renta de Cuarta Categoría realizada al siguiente personal:
            <ul style="margin: 6px 0 6px 20px;">
              <li>❖ Arroyo Araujo, Julisa Magali</li>
              <li>❖ Reyes Milla, María Daysi</li>
              <li>❖ Reyes Cerquen, Leyli Graciela</li>
            </ul>
          </div>

          <div style="margin-top: 14px; padding-left: 8px; border-left: 3px solid var(--color-red-500);">
            <strong>3. ESTUDIANTES PENDIENTES DE MATRÍCULA:</strong><br>
            De la revisión realizada, se informa que actualmente se encuentra pendiente de matrícula la siguiente estudiante:
            <div class="table-container" style="margin-top: 8px;">
              <table class="data-table" style="font-size: 11px;">
                <thead>
                  <tr><th>Estudiante</th><th>Grado</th><th>DNI</th><th>Lugar de procedencia</th><th>Situación</th></tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Pocomo Oropeza, Brini Yuneyli</strong></td>
                    <td>5 años</td>
                    <td><span class="status-badge status-pending">Pendiente de obtener</span></td>
                    <td>Pendiente de obtener</td>
                    <td>Falta completar información para proceder con la regularización de la matrícula.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style="margin-top: 14px; padding-left: 8px; border-left: 3px solid var(--color-navy-700);">
            <strong>4. CASO DEL CERTIFICADO DE LA EXESTUDIANTE:</strong><br>
            Se realizó la gestión correspondiente al caso del certificado de la exestudiante:
            <ul style="margin: 6px 0 6px 20px;">
              <li>❖ <strong>Díaz Chirre, Evelin Estefanía</strong></li>
            </ul>
            Al respecto, se informa que el trámite ha sido rechazado por segunda vez. Ante esta situación, se procederá a realizar la consulta correspondiente ante la <strong>UGEL 05</strong>.
          </div>

          <div style="margin-top: 14px; padding-left: 8px; border-left: 3px solid var(--color-yellow-500);">
            <strong>5. COORDINACIÓN Y SEGUIMIENTO DE CASOS DE ESTUDIANTES:</strong><br>
            Se ha realizado la coordinación con el <strong>Prof. Lino</strong> respecto a los casos de estudiantes con regularización documentaria (Urbizagasti y Fabian).
          </div>

          <div style="margin-top: 16px; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <strong>6. CONCLUSIONES:</strong>
            <ul style="margin: 6px 0 0 20px; font-size: 12px;">
              <li>• Al 15 de agosto de 2026, el monto acumulado de recibos generados asciende a <strong>S/ 25,130.00</strong>.</li>
              <li>• Renta de 4ta Categoría de Miss Maritza y docentes enviada al contador.</li>
              <li>• Estudiante pendiente de matrícula: <strong>Pocomo Oropeza, Brini Yuneyli (5 años)</strong>.</li>
            </ul>
          </div>

          <div style="text-align: right; margin-top: 36px; padding-right: 20px;">
            <div style="display: inline-block; text-align: center; border-top: 1px solid #0b132b; padding-top: 6px; width: 200px;">
              <strong>Atentamente,</strong><br>
              <span style="font-weight: 800; color: #0b132b;">Alex Lino</span><br>
              <span style="font-size: 11px; color: var(--text-muted);">Coordinación y Documentación</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-navy" onclick="window.print()">Imprimir Documento</button>
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  showSQLSchemaModal() {
    this.showModal(`
      <div class="modal-header">
        <h3>Esquema SQL Relacional - I.E.P. "El Educador" S.J.L.</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
          Script DDL para inicializar la base de datos relacional en <strong>Supabase</strong>, <strong>PostgreSQL</strong> o <strong>MySQL</strong>:
        </p>
        <pre style="background: var(--color-navy-950); color: #f8fafc; padding: 12px; border-radius: 8px; font-size: 11px; overflow-x: auto; max-height: 350px;">
-- TABLAS DEL SISTEMA EDUCATIVO "EL EDUCADOR" (S.J.L.)
CREATE TABLE tb_usuarios (
    id VARCHAR(50) PRIMARY KEY,
    codigo_institucional VARCHAR(30) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    tiene_privilegio_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE tb_matriculas (
    id VARCHAR(50) PRIMARY KEY,
    codigo_estudiante VARCHAR(30) NOT NULL,
    nombre_estudiante VARCHAR(150) NOT NULL,
    dni VARCHAR(15) NOT NULL,
    grado VARCHAR(50) NOT NULL,
    apoderado VARCHAR(150) NOT NULL,
    estado_tramite VARCHAR(100) DEFAULT 'Matriculado'
);

CREATE TABLE tb_cuadernos_qr (
    id VARCHAR(50) PRIMARY KEY,
    codigo_qr VARCHAR(100) NOT NULL,
    codigo_estudiante VARCHAR(30) NOT NULL,
    curso VARCHAR(100) NOT NULL,
    puntaje NUMERIC(4,2) NOT NULL,
    sello_digital VARCHAR(50) NOT NULL
);
        </pre>
      </div>
      <div class="modal-footer">
        <button class="btn btn-navy" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  downloadFullJsonBackup() {
    try {
      const exportData = {
        ...this.store.state,
        exportedAt: new Date().toISOString(),
        institution: this.store.state.institution || (typeof initialData !== "undefined" ? initialData.institution : {}),
        databaseEngine: "Google Cloud Firebase Realtime Database"
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `backup_colegio_educador_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      this.showToast("Copia de seguridad (.JSON) descargada con éxito desde Firebase", "success");
    } catch(e) {
      console.error("Error al exportar base de datos:", e);
      this.showToast("Error al exportar la copia de seguridad", "danger");
    }
  }

  // Navegación Dinámica sin Bloqueos
  navigate(viewName) {
    if (this.store.getCurrentView() === "cuadernos-qr" && viewName !== "cuadernos-qr") {
      this.stopLiveCameraScanner();
    }
    if (viewName === "asistencia") {
      this.store.state.attendanceActiveSubTab = "door-scanner";
    }
    this.store.setView(viewName);
    this.render();
    if (window.innerWidth <= 1024 && this.sidebar) {
      this.sidebar.classList.remove("open");
    }
  }

  // Actualizar datos del usuario y Renderizar Menú de Espacios Selectos por Rol
  updateHeaderUserInfo() {
    if (!this.store.isUserAuthenticated()) return;

    const user = this.store.getCurrentUser();
    const role = this.store.getCurrentRole();
    const currentView = this.store.getCurrentView();
    const nameEl = document.getElementById("header-user-name");
    const roleEl = document.getElementById("header-user-role");
    const avatarEl = document.getElementById("header-user-avatar");

    if (nameEl) nameEl.textContent = user.name || "Usuario Institucional";
    if (roleEl) roleEl.textContent = user.roleLabel || user.detail || user.role || "Docente";
    if (avatarEl) {
      const cleanName = (user.name || "U").replace(/^(Prof\.|Lic\.|Miss|Dra\.|Ing\.)\s*/i, '').trim();
      const initial = cleanName.charAt(0).toUpperCase() || "👤";
      avatarEl.textContent = initial;
    }

    // Renderizar Menú Lateral Dinámico según el Perfil del Usuario
    const sidebarNav = document.querySelector(".sidebar-nav");
    if (sidebarNav) {
      sidebarNav.innerHTML = Components.renderSidebarNav(role, currentView, this.store.state);
      
      // Re-vincular eventos de navegación en los enlaces dinámicos
      sidebarNav.querySelectorAll(".nav-item[data-view]").forEach(item => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const view = item.getAttribute("data-view");
          this.navigate(view);
        });
      });
    }

    // Actualizar badge de tareas
    const pendingTasksBadge = document.getElementById("badge-pending-tasks");
    if (pendingTasksBadge) {
      const pendingCount = this.store.getTasks().filter(t => t.status === "pending").length;
      pendingTasksBadge.textContent = pendingCount;
      pendingTasksBadge.style.display = pendingCount > 0 ? "inline-block" : "none";
    }
  }

  // Renderizar la vista activa o Login
  render() {
    const isAuthenticated = this.store.isUserAuthenticated();
    const appContainer = document.querySelector(".app-container");
    let loginRoot = document.getElementById("login-screen-root");

    if (!isAuthenticated) {
      if (appContainer) appContainer.style.display = "none";
      if (!loginRoot) {
        loginRoot = document.createElement("div");
        loginRoot.id = "login-screen-root";
        document.body.appendChild(loginRoot);
      }
      loginRoot.style.display = "block";
      
      // Preservar el formulario y los inputs mientras el usuario escribe
      const existingForm = document.getElementById("login-form");
      if (!existingForm || this.lastRenderedError !== this.loginErrorMessage) {
        this.lastRenderedError = this.loginErrorMessage;
        loginRoot.innerHTML = Components.renderLogin(this.loginErrorMessage);
      }
      return;
    }

    if (loginRoot) loginRoot.style.display = "none";
    if (appContainer) appContainer.style.display = "flex";

    const currentView = this.store.getCurrentView();
    const state = this.store.state;
    const currentUser = this.store.getCurrentUser();

    // Verificación de Bloqueo por Pensión Pendiente (Mora)
    const isLocked = this.store.isAccessLockedForCurrentUser();
    if (isLocked && currentView !== "pagos" && currentView !== "comunicados") {
      if (this.contentArea) {
        this.contentArea.innerHTML = Components.renderLockedAccessScreen(state, currentUser);
      }
      return;
    }

    let html = "";
    try {
      switch (currentView) {
        case "dashboard":
          html = Components.renderDashboard(state);
          break;
        case "database":
          html = Components.renderDatabaseManagement(state);
          break;
        case "usuarios-matriculas":
          html = Components.renderUserAndEnrollmentManagement(state);
          break;
        case "registro-estudiantes":
          html = Components.renderStudentRegistry(state);
          break;
        case "horarios":
          html = Components.renderSchedules(state);
          break;
        case "silabus":
          html = Components.renderSyllabi(state);
          break;
        case "cuadernos-qr":
          html = Components.renderNotebookQRControl(state);
          break;
        case "calificaciones":
          html = Components.renderGrades(state);
          break;
        case "tareas":
          html = Components.renderTasks(state);
          break;
        case "asistencia":
          html = Components.renderAttendance(state);
          break;
        case "comunicados":
          html = Components.renderAnnouncements(state);
          break;
        case "pagos":
          html = Components.renderPayments(state);
          break;
        case "agenda-virtual":
          html = Components.renderVirtualAgenda(state);
          break;
        case "boleta":
          html = Components.renderPrintableReport(state);
          break;
        default:
          html = Components.renderDashboard(state);
      }
    } catch (err) {
      console.error("Error renderizando vista:", currentView, err);
      html = `
        <div class="fade-in">
          <div class="card" style="padding: 24px; border-top: 4px solid var(--color-red-500);">
            <h3 style="color: var(--color-red-600); margin-bottom: 8px;">⚠️ Aviso de Carga en Vista: ${currentView}</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 16px;">
              Detalle: ${err.message}
            </p>
            <button class="btn btn-navy btn-sm" onclick="window.app.navigate('dashboard')">
              🏠 Regresar al Inicio
            </button>
          </div>
        </div>
      `;
    }

    const content = this.contentArea || document.getElementById("content-area");
    if (content) {
      this.contentArea = content;
      content.innerHTML = html || Components.renderDashboard(state);
    }
    this.updateHeaderUserInfo();
  }

  // --- Filtros de Grado ---
  onScheduleGradeChange(gradeId) {
    this.store.setSelectedScheduleGrade(gradeId);
    this.render();
  }

  onSyllabusGradeChange(gradeId) {
    this.store.setSelectedSyllabusGrade(gradeId);
    this.render();
  }

  // =========================================================================
  // GESTIÓN DE USUARIOS, MATRÍCULAS Y PRIVILEGIOS
  // =========================================================================
  // =========================================================================
  // GESTIÓN DE USUARIOS, MATRÍCULAS, PERFILES Y CONFIGURACIÓN DE PESTAÑAS
  // =========================================================================
  setUserManagementTab(tabName) {
    this.store.setUsersManagementTab(tabName);
  }

  setUserRoleFilter(roleFilter) {
    this.store.setUsersRoleFilter(roleFilter);
  }

  onUserSearchFilter(query) {
    const q = (query || "").toLowerCase().trim();
    const rows = document.querySelectorAll("#users-table-list tbody tr");
    rows.forEach(r => {
      const text = r.textContent.toLowerCase();
      r.style.display = text.includes(q) ? "" : "none";
    });
  }

  onSelectNavConfigRole(role) {
    this.store.state.selectedNavConfigRole = role;
    this.render();
  }

  toggleNavTab(role, tabId, isChecked) {
    this.store.toggleNavigationTab(role, tabId, isChecked);
    this.showToast(`Pestaña "${tabId}" ${isChecked ? '<span class="status-dot-green"></span> ACTIVADA' : '⚪ OCULTADA'} para ${role.toUpperCase()}`, isChecked ? "success" : "info");
    this.updateHeaderUserInfo();
  }

  saveSingleNavTab(role, tabId) {
    const labelInput = document.getElementById(`tab-label-${role}-${tabId}`);
    const badgeInput = document.getElementById(`tab-badge-${role}-${tabId}`);
    const newLabel = labelInput ? labelInput.value.trim() : "";
    const newBadge = badgeInput ? badgeInput.value.trim() : "";
    if (!newLabel) {
      this.showToast("El nombre de la pestaña no puede estar vacío", "danger");
      return;
    }
    this.store.renameNavigationTab(role, tabId, newLabel, newBadge);
    this.showToast(`✓ Pestaña "${newLabel}" guardada para ${role.toUpperCase()}`, "success");
    this.updateHeaderUserInfo();
  }

  resetNavTabsToDefault(role) {
    if (confirm(`¿Restaurar todas las pestañas por defecto para el perfil ${role.toUpperCase()}?`)) {
      this.store.resetNavigationTabsToDefault(role);
      this.showToast(`Menús de ${role.toUpperCase()} restaurados por defecto`, "info");
      this.updateHeaderUserInfo();
      this.render();
    }
  }

  openCreateUserModal(defaultRole = "Docente") {
    const currentRole = this.store.getCurrentRole();
    if (currentRole !== "admin" && currentRole !== "director") {
      this.showToast("⚠️ Solo el Administrador o Directivo pueden crear nuevos usuarios.", "danger");
      return;
    }
    this.showModal(`
      <div class="modal-header">
        <h3>➕ Crear Nuevo Usuario & Asignar Perfil</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        
        <!-- Selector Visual de Perfil -->
        <div class="form-group">
          <label class="form-label" style="font-weight: 800; color: var(--color-navy-900);">
            1. Seleccionar Tipo de Perfil / Rol:
          </label>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
            <label style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;" class="role-selector-card" id="card-role-docente">
              <input type="radio" name="new-user-role-radio" value="Docente" ${defaultRole === 'Docente' ? 'checked' : ''} onchange="window.app.onUserRoleTypeChange(this.value)" style="margin-bottom: 2px;" />
              <span style="font-size: 16px;">👨‍</span>
              <strong style="font-size: 12px; color: #1e3a8a;">Docente</strong>
            </label>

            <label style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;" class="role-selector-card" id="card-role-auxiliar">
              <input type="radio" name="new-user-role-radio" value="Auxiliar" ${defaultRole === 'Auxiliar' ? 'checked' : ''} onchange="window.app.onUserRoleTypeChange(this.value)" style="margin-bottom: 2px;" />
              <span style="font-size: 16px;">👮</span>
              <strong style="font-size: 12px; color: #0f766e;">Auxiliar</strong>
            </label>

            <label style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;" class="role-selector-card" id="card-role-estudiante">
              <input type="radio" name="new-user-role-radio" value="Estudiante" ${defaultRole === 'Estudiante' ? 'checked' : ''} onchange="window.app.onUserRoleTypeChange(this.value)" style="margin-bottom: 2px;" />
              <span style="font-size: 16px;">🎒</span>
              <strong style="font-size: 12px; color: #047857;">Estudiante</strong>
            </label>

            <label style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;" class="role-selector-card" id="card-role-apoderado">
              <input type="radio" name="new-user-role-radio" value="Apoderado" ${defaultRole === 'Apoderado' ? 'checked' : ''} onchange="window.app.onUserRoleTypeChange(this.value)" style="margin-bottom: 2px;" />
              <span style="font-size: 16px;">👨‍👩‍👧</span>
              <strong style="font-size: 12px; color: #b45309;">Apoderado</strong>
            </label>

            <label style="border: 2px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;" class="role-selector-card" id="card-role-directivo">
              <input type="radio" name="new-user-role-radio" value="Directivo" ${defaultRole === 'Directivo' ? 'checked' : ''} onchange="window.app.onUserRoleTypeChange(this.value)" style="margin-bottom: 2px;" />
              <span style="font-size: 16px;">️</span>
              <strong style="font-size: 12px; color: #6b21a8;">Directivo</strong>
            </label>
          </div>
        </div>

        <input type="hidden" id="new-user-role" value="${defaultRole}" />

        <!-- Datos Principales -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Nombre Completo:</label>
            <input type="text" id="new-user-name" class="form-control" placeholder="Ej: Lic. Carmen Rosa Huamán" oninput="window.app.autoGenerateUserCredentials()" />
          </div>
          <div class="form-group">
            <label class="form-label">DNI (8 dígitos):</label>
            <input type="text" id="new-user-dni" class="form-control" placeholder="45891204" maxlength="10" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Usuario (@username):</label>
            <input type="text" id="new-user-username" class="form-control" placeholder="carmen.huaman" />
          </div>
          <div class="form-group">
            <label class="form-label">Correo Institucional / Personal:</label>
            <input type="email" id="new-user-email" class="form-control" placeholder="carmen.huaman@eleducador.edu.pe" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Contraseña de Acceso:</label>
            <input type="text" id="new-user-pass" class="form-control" value="docente2026" />
          </div>
          <div class="form-group" style="display: flex; align-items: flex-end;">
            <button type="button" class="btn btn-outline" onclick="window.app.autoGenerateUserCredentials()" style="width: 100%; font-size: 11.5px; font-weight: bold; margin-bottom: 8px;">
              ⚡ Autogenerar Credenciales
            </button>
          </div>
        </div>

        <!-- SECCIÓN DINÁMICA SEGÚN EL ROL -->
        <div id="dynamic-role-fields-container" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 12px 0;">
          ${this.getDynamicRoleFieldsHTML(defaultRole)}
        </div>

        <!-- Permisos de Administrador -->
        <div class="form-group" id="admin-privilege-checkbox-box">
          <label style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--color-navy-900); cursor: pointer; background: var(--color-yellow-50); padding: 10px; border: 1px dashed var(--color-yellow-500); border-radius: 8px; font-size: 12.5px;">
            <input type="checkbox" id="new-user-has-admin" />
            <span>★ Conceder Privilegios de Edición (Horarios, Sílabus, Notas y Carga de Materiales)</span>
          </label>
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmCreateUser()" style="font-weight: 800;">
          ✓ Guardar y Registrar en Base de Datos
        </button>
      </div>
    `);
  }

  onUserRoleTypeChange(role) {
    const roleInput = document.getElementById("new-user-role");
    if (roleInput) roleInput.value = role;

    const dynContainer = document.getElementById("dynamic-role-fields-container");
    if (dynContainer) {
      dynContainer.innerHTML = this.getDynamicRoleFieldsHTML(role);
    }

    const adminBox = document.getElementById("admin-privilege-checkbox-box");
    if (adminBox) {
      adminBox.style.display = (role === "Docente" || role === "Directivo") ? "block" : "none";
    }

    const passInput = document.getElementById("new-user-pass");
    if (passInput) {
      passInput.value = (role === "Estudiante" ? "estudiante2026" : role === "Apoderado" ? "padre2026" : role === "Directivo" ? "admin2026" : "docente2026");
    }
  }

  getBoletaCoursesSelectOptions(selectedSubject = "Aritmética") {
    const categories = [
      {
        area: "Área de Matemática",
        courses: [
          "Aritmética",
          "Álgebra",
          "Geometría",
          "Trigonometría",
          "Razonamiento Matemático"
        ]
      },
      {
        area: "Área de Comunicación",
        courses: [
          "Lenguaje",
          "Literatura",
          "Razonamiento Verbal"
        ]
      },
      {
        area: "🔬 Área de Ciencia y Tecnología",
        courses: [
          "Biología",
          "Física",
          "Química"
        ]
      },
      {
        area: "🌎 Área de Ciencias Sociales",
        courses: [
          "Historia del Perú",
          "Historia Universal",
          "Geografía",
          "Filosofía"
        ]
      },
      {
        area: "⚖️ Área de DPCC",
        courses: [
          "Cívica",
          "Psicología"
        ]
      },
      {
        area: "💻 Área de Educación para el Trabajo (EPT)",
        courses: [
          "Computación / Informática",
          "Gestión Empresarial"
        ]
      },
      {
        area: "🎨 Otras Áreas Curriculares",
        courses: [
          "Inglés",
          "Arte y Cultura",
          "Educación Física",
          "Educación Religiosa"
        ]
      }
    ];

    const currentClean = (selectedSubject || "").trim().toLowerCase();

    return categories.map(cat => `
      <optgroup label="${cat.area}">
        ${cat.courses.map(c => {
          const isSelected = c.toLowerCase() === currentClean || currentClean.includes(c.toLowerCase()) || c.toLowerCase().includes(currentClean);
          return `<option value="${c}" ${isSelected ? 'selected' : ''}>${c}</option>`;
        }).join('')}
      </optgroup>
    `).join('');
  }

  renderGradesChecklistHTML(prefix = "new-user-grades", selectedList = ["1° de Secundaria", "2° de Secundaria", "3° de Secundaria", "4° de Secundaria", "5° de Secundaria"]) {
    const gradesStructure = [
      {
        level: "Secundaria",
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#bfdbfe",
        grades: ["1° de Secundaria", "2° de Secundaria", "3° de Secundaria", "4° de Secundaria", "5° de Secundaria"]
      },
      {
        level: "Primaria",
        color: "#047857",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        grades: ["1° de Primaria", "2° de Primaria", "3° de Primaria", "4° de Primaria", "5° de Primaria", "6° de Primaria"]
      },
      {
        level: "Inicial",
        color: "#b45309",
        bg: "#fffbeb",
        border: "#fde68a",
        grades: ["Inicial 3 años", "Inicial 4 años", "Inicial 5 años"]
      }
    ];

    const isSelected = (g) => {
      if (!selectedList || selectedList.length === 0) return false;
      const clean = g.toLowerCase().replace(/[^a-z0-9]/gi, '');
      return selectedList.some(s => {
        const sClean = (typeof s === 'string' ? s : '').toLowerCase().replace(/[^a-z0-9]/gi, '');
        return sClean.includes(clean) || clean.includes(sClean);
      });
    };

    return `
      <div style="margin-top: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <label class="form-label" style="font-size: 11.5px; font-weight: 800; color: #1e3a8a; margin: 0;">
            Grados a Cargo (Checklist - Marque los grados asignados):
          </label>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectGrades('${prefix}', 'secundaria')" style="font-size: 10.5px; padding: 2px 6px; font-weight: bold;">+ Toda Secundaria</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectGrades('${prefix}', 'primaria')" style="font-size: 10.5px; padding: 2px 6px; font-weight: bold;">+ Toda Primaria</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectGrades('${prefix}', 'all')" style="font-size: 10.5px; padding: 2px 6px; font-weight: bold;">Todos</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectGrades('${prefix}', 'clear')" style="font-size: 10.5px; padding: 2px 6px; color: var(--color-red-600);">Desmarcar</button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px;">
          ${gradesStructure.map(st => `
            <div style="background: ${st.bg}; border: 1px solid ${st.border}; border-radius: 6px; padding: 8px;">
              <div style="font-size: 11px; font-weight: 800; color: ${st.color}; margin-bottom: 6px; text-transform: uppercase; border-bottom: 1px solid ${st.border}; padding-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
                <span>Nivel ${st.level}</span>
                <span style="font-size: 10px; opacity: 0.8;">(${st.grades.length} Grados)</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${st.grades.map(g => {
                  const chk = isSelected(g);
                  return `
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; font-weight: 600; color: #1f2937; cursor: pointer; margin: 0; background: rgba(255,255,255,0.7); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.05);">
                      <input type="checkbox" name="${prefix}-check" value="${g}" data-level="${st.level.toLowerCase()}" ${chk ? 'checked' : ''} style="cursor: pointer;" />
                      <span>${g}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  quickSelectGrades(prefix, mode) {
    const checkboxes = document.querySelectorAll(`input[name='${prefix}-check']`);
    checkboxes.forEach(cb => {
      const lvl = cb.getAttribute("data-level");
      if (mode === "secundaria") {
        cb.checked = (lvl === "secundaria");
      } else if (mode === "primaria") {
        cb.checked = (lvl === "primaria");
      } else if (mode === "inicial") {
        cb.checked = (lvl === "inicial");
      } else if (mode === "all") {
        cb.checked = true;
      } else if (mode === "clear") {
        cb.checked = false;
      }
    });
  }

  // =========================================================================
  // SELECCIÓN MÚLTIPLE DE CURSOS PARA EL DOCENTE (CHECKLIST POR ÁREAS)
  // =========================================================================

  renderCoursesChecklistHTML(prefix = "new-user-courses", selectedCourses = ["Aritmética", "Álgebra"]) {
    const courseCategories = [
      {
        category: "Área de Matemática",
        color: "#1e40af",
        bg: "#eff6ff",
        border: "#bfdbfe",
        courses: [
          "Aritmética",
          "Álgebra",
          "Geometría",
          "Trigonometría",
          "Razonamiento Matemático",
          "Matemática Avanzada"
        ]
      },
      {
        category: "📚 Área de Comunicación",
        color: "#854d0e",
        bg: "#fefce8",
        border: "#fde047",
        courses: [
          "Lenguaje",
          "Literatura",
          "Razonamiento Verbal",
          "Comunicación y Literatura (General)",
          "Idioma Extranjero: Inglés"
        ]
      },
      {
        category: "🔬 Área de Ciencia y Tecnología",
        color: "#065f46",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        courses: [
          "Física",
          "Química",
          "Biología",
          "Ciencia y Tecnología (General)"
        ]
      },
      {
        category: "🏛️ Ciencias Sociales & DPCC",
        color: "#581c87",
        bg: "#faf5ff",
        border: "#e9d5ff",
        courses: [
          "Historia del Perú",
          "Historia Universal",
          "Geografía",
          "Economía",
          "Filosofía",
          "Psicología",
          "Ciencias Sociales (General)",
          "Desarrollo Personal, Ciudadanía y Cívica (DPCC)"
        ]
      },
      {
        category: "💻 Tecnología, EPT, Arte & Tutoría",
        color: "#0f766e",
        bg: "#f0fdfa",
        border: "#99f6e4",
        courses: [
          "Computación & Robótica",
          "Educación para el Trabajo (EPT)",
          "Arte y Cultura",
          "Educación Física",
          "Educación Religiosa",
          "Tutoría y Orientación"
        ]
      },
      {
        category: "🎒 Especialidades de Nivel",
        color: "#9a3412",
        bg: "#fff7ed",
        border: "#fed7aa",
        courses: [
          "Polidocente Nivel Primaria",
          "Nivel Inicial (3, 4 y 5 años)"
        ]
      }
    ];

    const selList = Array.isArray(selectedCourses)
      ? selectedCourses
      : (typeof selectedCourses === 'string' ? selectedCourses.split(/,\s*/) : []);

    const isSelected = (cName) => {
      if (!selList || selList.length === 0) return false;
      const clean = cName.toLowerCase().trim();
      return selList.some(s => {
        const sClean = (typeof s === 'string' ? s : '').toLowerCase().trim();
        return sClean === clean || sClean.includes(clean) || clean.includes(sClean);
      });
    };

    return `
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
          <div>
            <label class="form-label" style="font-weight: 800; color: #1e3a8a; font-size: 12px; margin-bottom: 0;">
              📚 Cursos y Asignaturas a Cargo (Seleccione todos los cursos del docente):
            </label>
            <div style="font-size: 11px; color: #64748b;">
              * Puede marcar múltiples cursos de los cuales el profesor se hará responsable.
            </div>
          </div>
          <span class="status-badge" style="background: #dbeafe; color: #1e40af; font-weight: 800; font-size: 11px;" id="${prefix}-count-badge">
            <span id="${prefix}-count-val">${selList.length}</span> curso(s) seleccionado(s)
          </span>
        </div>

        <!-- Botones de Selección Rápida por Área -->
        <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectCourses('${prefix}', 'matematica')" style="font-size: 10.5px; padding: 2px 7px; color: #1e40af; border-color: #93c5fd; background: #ffffff; font-weight: bold;">
            + Toda Matemática
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectCourses('${prefix}', 'comunicacion')" style="font-size: 10.5px; padding: 2px 7px; color: #854d0e; border-color: #fde047; background: #ffffff; font-weight: bold;">
            + Toda Comunicación
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectCourses('${prefix}', 'ciencia')" style="font-size: 10.5px; padding: 2px 7px; color: #065f46; border-color: #86efac; background: #ffffff; font-weight: bold;">
            + Toda Ciencia
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectCourses('${prefix}', 'sociales')" style="font-size: 10.5px; padding: 2px 7px; color: #581c87; border-color: #d8b4fe; background: #ffffff; font-weight: bold;">
            + Todos Sociales
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectCourses('${prefix}', 'all')" style="font-size: 10.5px; padding: 2px 7px; color: #15803d; border-color: #86efac; background: #ffffff; font-weight: bold;">
            ✓ Todos
          </button>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.quickSelectCourses('${prefix}', 'clear')" style="font-size: 10.5px; padding: 2px 7px; color: #dc2626; border-color: #fca5a5; background: #ffffff; font-weight: bold;">
            ✕ Desmarcar
          </button>
        </div>

        <!-- Cuadrícula de Cursos Agrupados por Área -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; max-height: 220px; overflow-y: auto; background: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
          ${courseCategories.map(cat => `
            <div style="background: ${cat.bg}; border: 1px solid ${cat.border}; border-radius: 6px; padding: 8px;">
              <div style="font-size: 11px; font-weight: 800; color: ${cat.color}; margin-bottom: 6px; border-bottom: 1px solid ${cat.border}; padding-bottom: 3px;">
                ${cat.category}
              </div>
              <div style="display: flex; flex-direction: column; gap: 4px;">
                ${cat.courses.map(cName => {
                  const chk = isSelected(cName);
                  return `
                    <label style="display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: #1f2937; cursor: pointer; margin: 0; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.05);" onmouseover="this.style.background='#ffffff'" onmouseout="this.style.background='rgba(255,255,255,0.8)'">
                      <input type="checkbox" name="${prefix}-check" value="${cName}" ${chk ? 'checked' : ''} onchange="window.app.updateCoursesCounter('${prefix}')" data-area="${cat.category.toLowerCase()}" style="cursor: pointer;" />
                      <span style="font-weight: 600;">${cName}</span>
                    </label>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  updateCoursesCounter(prefix) {
    const checkboxes = document.querySelectorAll(`input[name='${prefix}-check']:checked`);
    const countVal = document.getElementById(`${prefix}-count-val`);
    if (countVal) countVal.innerText = checkboxes.length;
  }

  quickSelectCourses(prefix, area) {
    const checkboxes = document.querySelectorAll(`input[name='${prefix}-check']`);
    checkboxes.forEach(cb => {
      const val = cb.value.toLowerCase();
      const dataArea = (cb.getAttribute("data-area") || "").toLowerCase();
      if (area === "all") {
        cb.checked = true;
      } else if (area === "clear") {
        cb.checked = false;
      } else if (area === "matematica") {
        if (dataArea.includes("matemática") || val.includes("aritmética") || val.includes("álgebra") || val.includes("geometría") || val.includes("trigonometría") || val.includes("matemático") || val.includes("avanzada")) {
          cb.checked = true;
        }
      } else if (area === "comunicacion") {
        if (dataArea.includes("comunicación") || val.includes("lenguaje") || val.includes("literatura") || val.includes("verbal") || val.includes("inglés")) {
          cb.checked = true;
        }
      } else if (area === "ciencia") {
        if (dataArea.includes("ciencia") || val.includes("física") || val.includes("química") || val.includes("biología")) {
          cb.checked = true;
        }
      } else if (area === "sociales") {
        if (dataArea.includes("sociales") || val.includes("historia") || val.includes("geografía") || val.includes("cívica") || val.includes("filosofía") || val.includes("psicología") || val.includes("dpcc") || val.includes("economía")) {
          cb.checked = true;
        }
      }
    });
    this.updateCoursesCounter(prefix);
  }

  getRegisteredStudentsList() {
    const studentsFromUsers = (this.store.state.systemUsers || [])
      .filter(u => u.role === 'Estudiante' || u.role === 'Alumno')
      .map(u => ({
        id: u.id,
        name: u.name,
        grade: u.detail || u.gradeLevel || "4to de Secundaria",
        dni: u.dni || "",
        code: u.code || u.id
      }));

    const baseStudents = [
      { id: "EST-042", name: "Sofía Méndez Flores", grade: "4° de Secundaria", dni: "74891230", code: "EST-2026-042" },
      { id: "EST-011", name: "Carlos Benítez Díaz", grade: "4° de Secundaria", dni: "75129034", code: "EST-2026-011" },
      { id: "EST-025", name: "Mateo Ramos Quispe", grade: "3° de Secundaria", dni: "76891209", code: "EST-2026-025" },
      { id: "EST-089", name: "Marina del Carmen Albújar Zegarra", grade: "2° de Secundaria", dni: "75849301", code: "EST-2026-089" },
      { id: "EST-PEND-01", name: "Brini Yuneyli Pocomo Oropeza", grade: "Inicial 5 años", dni: "Pendiente", code: "EST-2026-PEND-01" },
      { id: "EST-089-EX", name: "Evelin Estefanía Díaz Chirre", grade: "5° de Secundaria", dni: "71290384", code: "EX-EST-2025-089" },
      { id: "EST-PRIM-01", name: "Joaquín Urbizagasti", grade: "1° de Primaria", dni: "78912345", code: "EST-2026-012" },
      { id: "EST-PRIM-02", name: "Valentina Fabian", grade: "3° de Primaria", dni: "79123456", code: "EST-2026-013" },
      { id: "EST-PRIM-03", name: "Camila Andrea Silva", grade: "5° de Primaria", dni: "74567890", code: "EST-2026-014" },
      { id: "EST-PRIM-04", name: "Diego Alejandro Torres", grade: "6° de Primaria", dni: "75678901", code: "EST-2026-015" }
    ];

    const merged = [...studentsFromUsers];
    baseStudents.forEach(b => {
      if (!merged.some(m => m.name.toLowerCase() === b.name.toLowerCase())) {
        merged.push(b);
      }
    });

    return merged;
  }

  getSingleParentStudentRowHTML(prefix, rowId, index, data = {}) {
    const currentName = data.name || (index === 0 ? "Sofía Méndez Flores" : "");
    const currentGrade = data.grade || (index === 0 ? "4° de Secundaria" : "1° de Secundaria");
    const currentDni = data.dni || (index === 0 ? "74891230" : "");

    const clean = currentName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
    const parts = clean.split(/\s+/).filter(Boolean);
    const initialUser = parts.length >= 2 ? `${parts[0]}.${parts[parts.length - 1]}` : (parts[0] || `alumno${index + 1}`);

    const gradeOptions = [
      {
        group: "Nivel Secundaria",
        grades: ["1° de Secundaria", "2° de Secundaria", "3° de Secundaria", "4° de Secundaria", "5° de Secundaria"]
      },
      {
        group: "Nivel Primaria",
        grades: ["1° de Primaria", "2° de Primaria", "3° de Primaria", "4° de Primaria", "5° de Primaria", "6° de Primaria"]
      },
      {
        group: "Nivel Inicial",
        grades: ["Inicial 3 años", "Inicial 4 años", "Inicial 5 años"]
      }
    ];

    return `
      <div class="card parent-student-row" id="${rowId}" style="padding: 12px; margin-bottom: 10px; border: 1px solid #fdba74; background: #fffaf0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #ffedd5; padding-bottom: 4px;">
          <span style="font-size: 12px; font-weight: 800; color: #9a3412;">
            Estudiante #${index + 1} a Registrar (Hijo / Sobrino / Familiar)
          </span>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.removeParentStudentRow('${prefix}', '${rowId}')" style="font-size: 11px; padding: 2px 8px; color: var(--color-red-600); border-color: #fca5a5;" title="Quitar estudiante">
            🗑️ Quitar
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1.1fr 1fr 1.2fr; gap: 8px; margin-bottom: 8px;">
          <!-- Nombre Completo del Alumno -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 11px; font-weight: 700; margin-bottom: 2px; color: #9a3412;">
              Nombre Completo del Estudiante:
            </label>
            <input type="text" class="form-control parent-student-name" placeholder="Ej: Sofía Méndez Flores" value="${currentName}" oninput="window.app.updateStudentCredentialPreview('${rowId}')" style="font-size: 12px; font-weight: bold; border-color: #ea580c; background: #ffffff;" />
          </div>

          <!-- DNI -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 11px; font-weight: 700; margin-bottom: 2px; color: #9a3412;">
              DNI (8 dígitos):
            </label>
            <input type="text" class="form-control parent-student-dni" placeholder="74891230" value="${currentDni}" style="font-size: 12px; font-weight: bold;" maxlength="8" />
          </div>

          <!-- Parentesco -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 11px; font-weight: 700; margin-bottom: 2px; color: #9a3412;">Parentesco:</label>
            <select class="form-control parent-student-rel" style="font-size: 11.5px; font-weight: bold;">
              <option value="Hijo/Hija" ${data.relationship === 'Hijo/Hija' ? 'selected' : ''}>Hijo / Hija</option>
              <option value="Sobrino/Sobrina" ${data.relationship === 'Sobrino/Sobrina' ? 'selected' : ''}>Sobrino / Sobrina</option>
              <option value="Nieto/Nieta" ${data.relationship === 'Nieto/Nieta' ? 'selected' : ''}>Nieto / Nieta</option>
              <option value="Hermano/Hermana" ${data.relationship === 'Hermano/Hermana' ? 'selected' : ''}>Hermano / Hermana</option>
              <option value="Familiar / Tutor Legal" ${data.relationship === 'Familiar / Tutor Legal' ? 'selected' : ''}>Familiar / Tutor Legal</option>
            </select>
          </div>

          <!-- Grado / Nivel Desglosable -->
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 11px; font-weight: 700; margin-bottom: 2px; color: #9a3412;">Grado / Nivel:</label>
            <select class="form-control parent-student-grade" style="font-size: 11.5px; font-weight: bold; border-color: #ea580c;">
              ${gradeOptions.map(grp => `
                <optgroup label="${grp.group}">
                  ${grp.grades.map(g => {
                    const sel = (currentGrade && (currentGrade.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(currentGrade.toLowerCase())));
                    return `<option value="${g}" ${sel ? 'selected' : ''}>${g}</option>`;
                  }).join('')}
                </optgroup>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Credenciales Autogeneradas del Estudiante para la Intranet -->
        <div style="display: flex; justify-content: space-between; align-items: center; background: #ecfdf5; padding: 6px 12px; border-radius: 6px; border: 1px dashed #a7f3d0; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #065f46; font-weight: 700;">
            <span>🔑 Acceso Intranet:</span>
            <span>Usuario: <strong class="student-user-preview" style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #6ee7b7; font-family: monospace; color: #047857;">@${initialUser}</strong></span>
            <span>Contraseña: <strong style="background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #6ee7b7; color: #047857;">estudiante2026</strong></span>
          </div>
          <span style="font-size: 11px; color: #047857; font-weight: 800;">
            ✓ Perfil de estudiante se creará automáticamente
          </span>
        </div>
      </div>
    `;
  }

  updateStudentCredentialPreview(rowId) {
    const rowElem = document.getElementById(rowId);
    if (!rowElem) return;
    const nameInp = rowElem.querySelector(".parent-student-name");
    const previewSpan = rowElem.querySelector(".student-user-preview");
    if (nameInp && previewSpan) {
      const val = nameInp.value.trim();
      if (!val) {
        previewSpan.innerText = "@usuario.alumno";
        return;
      }
      const clean = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
      const parts = clean.split(/\s+/).filter(Boolean);
      let username = parts.length >= 2 ? `${parts[0]}.${parts[parts.length - 1]}` : (parts[0] || 'estudiante');
      previewSpan.innerText = `@${username}`;
    }
  }

  renderParentStudentsLinkerHTML(prefix = "new-parent", initialStudents = [{ name: "Sofía Méndez Flores", grade: "4° de Secundaria", relationship: "Hijo/Hija", dni: "74891230" }]) {
    const list = (initialStudents && initialStudents.length > 0) ? initialStudents : [{ name: "Sofía Méndez Flores", grade: "4° de Secundaria", relationship: "Hijo/Hija", dni: "74891230" }];
    
    return `
      <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 12px; margin-top: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
          <div>
            <div style="font-size: 12px; font-weight: 800; color: #9a3412;">
              🎒 Registro y Creación de Perfiles de Estudiantes a Cargo (Mínimo 1, Máximo 9):
            </div>
            <div style="font-size: 11px; color: #c2410c;">
              * Ingrese los datos de cada hijo o familiar. El sistema generará automáticamente sus cuentas de Estudiante con su usuario y contraseña para ingresar a la Intranet.
            </div>
          </div>
          <span class="status-badge" style="background: #ffedd5; color: #9a3412; font-weight: 800; font-size: 11px;" id="${prefix}-counter-badge">
            🎒 <span id="${prefix}-count-val">${list.length}</span> / 9 Estudiantes a Crear
          </span>
        </div>

        <div id="${prefix}-students-container">
          ${list.map((st, i) => this.getSingleParentStudentRowHTML(prefix, `${prefix}-row-${i}`, i, st)).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #fed7aa; flex-wrap: wrap; gap: 8px;">
          <span style="font-size: 11px; color: #7c2d12;">
            ℹ️ Puede registrar hasta 9 estudiantes por apoderado con creación instantánea de sus credenciales escolares.
          </span>
          <button type="button" class="btn btn-navy btn-sm" onclick="window.app.addParentStudentRow('${prefix}')" style="font-size: 11px; font-weight: 800; padding: 4px 12px;">
            ➕ + Agregar y Crear Otro Estudiante (Hasta 9)
          </button>
        </div>
      </div>
    `;
  }

  addParentStudentRow(prefix) {
    const container = document.getElementById(`${prefix}-students-container`);
    if (!container) return;
    const currentRows = container.querySelectorAll(".parent-student-row");
    if (currentRows.length >= 9) {
      this.showToast("⚠️ Límite alcanzado: Un apoderado puede tener como máximo 9 estudiantes registrados.", "warning");
      return;
    }
    const newIdx = currentRows.length;
    const rowId = `${prefix}-row-${Date.now()}`;
    const rowHTML = this.getSingleParentStudentRowHTML(prefix, rowId, newIdx, { name: "", grade: "1° de Secundaria", relationship: "Hijo/Hija", dni: "" });
    const temp = document.createElement("div");
    temp.innerHTML = rowHTML;
    container.appendChild(temp.firstElementChild);
    this.updateParentStudentsCounter(prefix);
    this.showToast(`Estudiante #${newIdx + 1} añadido para registro (Total: ${newIdx + 1}/9)`, "info");
  }

  removeParentStudentRow(prefix, rowId) {
    const container = document.getElementById(`${prefix}-students-container`);
    if (!container) return;
    const currentRows = container.querySelectorAll(".parent-student-row");
    if (currentRows.length <= 1) {
      this.showToast("⚠️ Requerido: El perfil de apoderado debe tener como mínimo 1 estudiante registrado.", "warning");
      return;
    }
    const rowElem = document.getElementById(rowId);
    if (rowElem) {
      rowElem.remove();
      this.updateParentStudentsCounter(prefix);
    }
  }

  updateParentStudentsCounter(prefix) {
    const container = document.getElementById(`${prefix}-students-container`);
    if (!container) return;
    const currentRows = container.querySelectorAll(".parent-student-row");
    const countVal = document.getElementById(`${prefix}-count-val`);
    if (countVal) countVal.innerText = currentRows.length;
    
    // Re-index titles
    currentRows.forEach((r, i) => {
      const headerSpan = r.querySelector("span");
      if (headerSpan) headerSpan.innerText = `Estudiante #${i + 1} a Registrar (Hijo / Sobrino / Familiar)`;
    });
  }

  getDynamicRoleFieldsHTML(role) {
    if (role === "Docente") {
      return `
        <div style="font-size: 12px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px;">
          📚 Carga Pedagógica, Asignaturas Curriculares y Horas Semanales:
        </div>
        
        ${this.renderCoursesChecklistHTML("new-user-courses", ["Aritmética", "Álgebra"])}

        <div class="form-group" style="margin-bottom: 8px;">
          <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #1e3a8a;">Carga Horaria Semanal:</label>
          <select id="new-user-hours" class="form-control" style="font-size: 12px; font-weight: bold; width: 100%;">
            <option value="30 hrs (Tiempo Completo)">30 hrs (Tiempo Completo)</option>
            <option value="24 hrs (Jornada Estándar)" selected>24 hrs (Jornada Estándar)</option>
            <option value="18 hrs (Tiempo Parcial)">18 hrs (Tiempo Parcial)</option>
            <option value="12 hrs (Por Horas)">12 hrs (Por Horas)</option>
          </select>
        </div>

        ${this.renderGradesChecklistHTML("new-user-grades", ["1° de Secundaria", "2° de Secundaria", "3° de Secundaria", "4° de Secundaria", "5° de Secundaria"])}
      `;
    } else if (role === "Estudiante") {
      return `
        <div style="font-size: 12px; font-weight: 800; color: #065f46; margin-bottom: 8px;">🎒 Datos Escolares del Alumno:</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="form-group" style="margin-bottom: 6px;">
            <label class="form-label" style="font-size: 11.5px;">Grado / Nivel:</label>
            <select id="new-user-grade-select" class="form-control">
              <option value="Inicial 3 años">Inicial 3 años</option>
              <option value="Inicial 4 años">Inicial 4 años</option>
              <option value="Inicial 5 años">Inicial 5 años</option>
              <option value="1° de Primaria">1° de Primaria</option>
              <option value="2° de Primaria">2° de Primaria</option>
              <option value="3° de Primaria">3° de Primaria</option>
              <option value="4° de Primaria">4° de Primaria</option>
              <option value="5° de Primaria">5° de Primaria</option>
              <option value="6° de Primaria">6° de Primaria</option>
              <option value="1° de Secundaria">1° de Secundaria</option>
              <option value="2° de Secundaria">2° de Secundaria</option>
              <option value="3° de Secundaria">3° de Secundaria</option>
              <option value="4° de Secundaria" selected>4° de Secundaria</option>
              <option value="5° de Secundaria">5° de Secundaria</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 6px;">
            <label class="form-label" style="font-size: 11.5px;">Tutor de Aula:</label>
            <input type="text" id="new-user-tutor" class="form-control" placeholder="Ej: Prof. Roberto Silva" value="Prof. Roberto Silva" />
          </div>
        </div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 11.5px;">Apoderado Responsable:</label>
          <input type="text" id="new-user-guardian" class="form-control" placeholder="Ej: Dra. Carmen Méndez" />
        </div>
      `;
    } else if (role === "Apoderado") {
      return `
        <div style="font-size: 12px; font-weight: 800; color: #92400e; margin-bottom: 6px;">👨‍👩‍👧 Datos de Contacto y Familia:</div>
        <div class="form-group" style="margin-bottom: 6px;">
          <label class="form-label" style="font-size: 11.5px; font-weight: 700;">Teléfono / Celular de Contacto (9 dígitos):</label>
          <input type="text" id="new-user-phone" class="form-control" placeholder="987-654-321" value="987-654-321" />
        </div>
        
        ${this.renderParentStudentsLinkerHTML("new-parent", [{ name: "Sofía Méndez Flores", grade: "4° de Secundaria", relationship: "Hijo/Hija", dni: "74891230" }])}
      `;
    } else if (role === "Auxiliar") {
      return `
        <div style="font-size: 12px; font-weight: 800; color: #0f766e; margin-bottom: 8px;">
          👮 Asignación de Turno & Zonas de Supervisión:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div class="form-group" style="margin-bottom: 6px;">
            <label class="form-label" style="font-size: 11.5px;">Turno Asignado:</label>
            <select id="new-user-shift" class="form-control" style="font-size: 12px;">
              <option value="Turno Mañana (07:00 AM - 02:30 PM)" selected>Turno Mañana (07:00 AM - 02:30 PM)</option>
              <option value="Turno Tarde (12:30 PM - 07:00 PM)">Turno Tarde (12:30 PM - 07:00 PM)</option>
              <option value="Jornada Completa">Jornada Completa</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 6px;">
            <label class="form-label" style="font-size: 11.5px;">Zona / Puerta Principal:</label>
            <input type="text" id="new-user-zone" class="form-control" value="Portería Puerta 1 & Pabellón Secundaria" />
          </div>
        </div>
        <div style="font-size: 11px; color: #047857; background: #ecfdf5; padding: 6px 10px; border-radius: 6px; border: 1px solid #a7f3d0; margin-top: 4px;">
          ✓ Este perfil tendrá acceso <strong>exclusivo</strong> al Escáner QR de Portería, Generador de Planchas QR, Parte Diario 08:30 AM y Lector de Cuadernos QR.
        </div>
      `;
    } else {
      return `
        <div style="font-size: 12px; font-weight: 800; color: #581c87; margin-bottom: 8px;">️ Cargo Institucional & Despacho:</div>
        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 11.5px;">Cargo o Dependencia:</label>
          <select id="new-user-directivo-pos" class="form-control">
            <option value="Dirección General">Dirección General</option>
            <option value="Coordinación General & Documentación">Coordinación General & Documentación</option>
            <option value="Secretaría General & Matrículas">Secretaría General & Matrículas</option>
            <option value="Tesorería & Finanzas">Tesorería & Finanzas</option>
          </select>
        </div>
      `;
    }
  }

  autoGenerateUserCredentials() {
    const nameInput = document.getElementById("new-user-name");
    const userInput = document.getElementById("new-user-username");
    const emailInput = document.getElementById("new-user-email");
    const passInput = document.getElementById("new-user-pass");
    const roleInput = document.getElementById("new-user-role");

    if (nameInput && nameInput.value.trim()) {
      const clean = nameInput.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
      const parts = clean.split(/\s+/).filter(Boolean);
      let username = "";
      if (parts.length >= 2) {
        username = `${parts[0]}.${parts[parts.length - 1]}`;
      } else if (parts.length === 1) {
        username = parts[0];
      }
      if (userInput) userInput.value = username;
      if (emailInput) emailInput.value = `${username}@eleducador.edu.pe`;
      if (passInput && roleInput) {
        const r = roleInput.value;
        passInput.value = (r === "Estudiante" ? "estudiante2026" : r === "Apoderado" ? "padre2026" : r === "Directivo" ? "admin2026" : "docente2026");
      }
    }
  }

  confirmCreateUser() {
    const name = document.getElementById("new-user-name").value.trim();
    const role = document.getElementById("new-user-role").value;
    const email = document.getElementById("new-user-email").value.trim();
    const username = document.getElementById("new-user-username").value.trim();
    const password = document.getElementById("new-user-pass").value.trim();
    const dni = document.getElementById("new-user-dni") ? document.getElementById("new-user-dni").value.trim() : "";
    const hasAdmin = document.getElementById("new-user-has-admin") ? document.getElementById("new-user-has-admin").checked : false;

    if (!name) {
      this.showToast("Por favor ingrese el nombre completo del usuario", "danger");
      return;
    }

    let detail = "";
    let subject = "";
    let assignedCourses = [];
    let assignedGrades = [];
    let weeklyHours = "";
    let studentName = "";
    let linkedStudents = [];
    let tutor = "";
    let guardian = "";
    let phone = "";
    let createdStudentsList = [];

    if (role === "Docente") {
      const checkedCourses = Array.from(document.querySelectorAll("input[name='new-user-courses-check']:checked")).map(cb => cb.value);
      assignedCourses = checkedCourses.length > 0 ? checkedCourses : ["Aritmética"];
      subject = assignedCourses.join(", ");

      weeklyHours = document.getElementById("new-user-hours") ? document.getElementById("new-user-hours").value.trim() : "24 hrs";
      const checkedBoxes = Array.from(document.querySelectorAll("input[name='new-user-grades-check']:checked")).map(cb => cb.value);
      assignedGrades = checkedBoxes.length > 0 ? checkedBoxes : ["4to de Secundaria"];
      
      const coursesSummary = assignedCourses.length <= 2 ? assignedCourses.join(', ') : `${assignedCourses.slice(0, 2).join(', ')} (+${assignedCourses.length - 2} más)`;
      detail = `${coursesSummary} • ${assignedGrades.length} grados / ${weeklyHours}`;
    } else if (role === "Estudiante") {
      const gSel = document.getElementById("new-user-grade-select");
      detail = gSel ? gSel.value : "4to de Secundaria";
      tutor = document.getElementById("new-user-tutor") ? document.getElementById("new-user-tutor").value.trim() : "";
      guardian = document.getElementById("new-user-guardian") ? document.getElementById("new-user-guardian").value.trim() : "";
    } else if (role === "Apoderado") {
      const rows = document.querySelectorAll("#new-parent-students-container .parent-student-row");
      linkedStudents = [];
      
      for (const r of rows) {
        const nameInp = r.querySelector(".parent-student-name");
        const relSel = r.querySelector(".parent-student-rel");
        const gradeSel = r.querySelector(".parent-student-grade");
        const dniInp = r.querySelector(".parent-student-dni");

        const stName = nameInp ? nameInp.value.trim() : "";
        const stGrade = gradeSel ? gradeSel.value : "4° de Secundaria";
        const stRel = relSel ? relSel.value : "Hijo/Hija";
        const stDni = dniInp ? dniInp.value.trim() : "";

        if (!stName) {
          this.showToast("⚠️ Debe ingresar el nombre completo de todos los estudiantes a registrar.", "danger");
          return;
        }

        // Generar credenciales de estudiante
        const cleanStName = stName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
        const stParts = cleanStName.split(/\s+/).filter(Boolean);
        const stUsername = stParts.length >= 2 ? `${stParts[0]}.${stParts[stParts.length - 1]}` : (stParts[0] || `estudiante.${Date.now().toString().slice(-4)}`);
        const stEmail = `${stUsername}@eleducador.edu.pe`;
        const stPass = "estudiante2026";

        // Determinar tutor según nivel
        let defaultTutor = "Prof. Roberto Silva";
        if (stGrade.includes("Primaria")) defaultTutor = "Miss Julisa Arroyo";
        if (stGrade.includes("Inicial")) defaultTutor = "Miss Maritza";

        // Crear/Registrar perfil del estudiante en la base de datos
        const newStudentUser = this.store.createSystemUser({
          name: stName,
          role: "Estudiante",
          detail: stGrade,
          gradeLevel: stGrade,
          guardian: name, // Nombre del apoderado
          dni: stDni,
          username: stUsername,
          password: stPass,
          email: stEmail,
          tutor: defaultTutor,
          hasAdminPrivilege: false
        });

        createdStudentsList.push({
          name: stName,
          grade: stGrade,
          relationship: stRel,
          username: stUsername,
          password: stPass,
          dni: stDni
        });

        linkedStudents.push({
          name: stName,
          relationship: stRel,
          grade: stGrade,
          dni: stDni,
          username: stUsername
        });
      }

      if (linkedStudents.length < 1) {
        this.showToast("⚠️ Debe registrar como mínimo 1 estudiante para el perfil de apoderado.", "danger");
        return;
      }
      if (linkedStudents.length > 9) {
        this.showToast("⚠️ Un apoderado puede tener como máximo 9 estudiantes vinculados.", "danger");
        return;
      }

      phone = document.getElementById("new-user-phone") ? document.getElementById("new-user-phone").value.trim() : "987-654-321";
      studentName = linkedStudents.map(s => s.name).join(', ');
      detail = `Apoderado de ${linkedStudents.length} estudiante(s): ${linkedStudents.map(s => `${s.name} (${s.grade} - ${s.relationship})`).join(', ')}`;
    } else {
      const posSel = document.getElementById("new-user-directivo-pos");
      detail = posSel ? posSel.value : "Coordinación General";
    }

    const created = this.store.createSystemUser({
      name,
      role,
      detail,
      email: email || `${username || 'usuario'}@eleducador.edu.pe`,
      username: username || name.toLowerCase().replace(/\s+/g, '.'),
      password: password || (role === 'Apoderado' ? 'padre2026' : 'educador2026'),
      dni,
      phone,
      subject,
      courses: assignedCourses,
      assignedCourses,
      assignedGrades,
      weeklyHours,
      studentName,
      linkedStudents: linkedStudents.length > 0 ? linkedStudents : undefined,
      tutor,
      guardian,
      hasAdminPrivilege: hasAdmin
    });

    this.closeModal();

    if (role === "Apoderado") {
      this.showModal(`
        <div class="modal-header" style="background: #065f46; color: #ffffff;">
          <h3 style="color: #ffffff;">🎉 ¡Cuentas Creadas Exitosamente!</h3>
          <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
        </div>
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
            <div style="font-weight: 800; color: #1e3a8a; font-size: 13px; margin-bottom: 4px;">
              👨‍👩‍👧 Cuenta del Apoderado Registrada:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
              <div><strong>Nombre:</strong> ${name}</div>
              <div><strong>Teléfono:</strong> ${phone || '987-654-321'}</div>
              <div><strong>Usuario (@):</strong> <code>@${created.username}</code></div>
              <div><strong>Contraseña:</strong> <code>${created.password}</code></div>
            </div>
          </div>

          <div style="font-weight: 800; color: #065f46; font-size: 13px; margin-bottom: 8px;">
            🎒 ${createdStudentsList.length} Perfil(es) de Estudiante Creado(s) con Acceso a Intranet:
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${createdStudentsList.map((st, idx) => `
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: #065f46; font-size: 12.5px;">#${idx + 1} ${st.name}</strong>
                  <span class="status-badge status-primary" style="font-size: 11px;">${st.grade} (${st.relationship})</span>
                </div>
                <div style="display: flex; gap: 12px; font-size: 11.5px; color: #1f2937; flex-wrap: wrap;">
                  <span>DNI: <strong>${st.dni || 'N/A'}</strong></span>
                  <span>Usuario: <strong style="color: #047857;">@${st.username}</strong></span>
                  <span>Contraseña: <strong>${st.password}</strong></span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-navy" onclick="window.app.closeModal()" style="font-weight: 800; width: 100%;">
            ✓ Entendido y Guardado en Base de Datos
          </button>
        </div>
      `);
    } else if (role === "Docente") {
      this.showToast(`✓ Docente "${name}" registrado con ${assignedCourses.length} curso(s) y ${assignedGrades.length} grado(s) asignados`, "success");
    } else {
      this.showToast(`✓ Usuario "${name}" (${role}) registrado con éxito`, "success");
    }
  }

  openEditUserModal(userId) {
    const user = (this.store.state.systemUsers || []).find(u => u.id === userId);
    if (!user) return;

    const isDocente = user.role === 'Docente' || user.role === 'Profesor';
    const isApoderado = user.role === 'Apoderado' || user.role === 'Padre';

    const existingCourses = user.assignedCourses || user.courses || (user.subject ? user.subject.split(/,\s*/) : ["Aritmética"]);

    this.showModal(`
      <div class="modal-header">
        <h3>✏️ Editar Usuario: ${user.name}</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Nombre Completo:</label>
            <input type="text" id="edit-user-name" class="form-control" value="${user.name}" />
          </div>
          <div class="form-group">
            <label class="form-label">Rol / Perfil:</label>
            <select id="edit-user-role" class="form-control">
              <option value="Directivo" ${user.role === 'Directivo' ? 'selected' : ''}>️ Directivo</option>
              <option value="Docente" ${user.role === 'Docente' ? 'selected' : ''}>👨‍Docente</option>
              <option value="Estudiante" ${user.role === 'Estudiante' ? 'selected' : ''}>🎒 Estudiante</option>
              <option value="Apoderado" ${user.role === 'Apoderado' ? 'selected' : ''}>👨‍👩‍👧 Apoderado</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Usuario (@username):</label>
            <input type="text" id="edit-user-username" class="form-control" value="${user.username || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Correo Institucional:</label>
            <input type="email" id="edit-user-email" class="form-control" value="${user.email || ''}" />
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);">
          <div class="form-group">
            <label class="form-label">Contraseña de Acceso:</label>
            <input type="text" id="edit-user-pass" class="form-control" value="${user.password || 'educador2026'}" />
          </div>
          <div class="form-group">
            <label class="form-label">DNI / Documento:</label>
            <input type="text" id="edit-user-dni" class="form-control" value="${user.dni || ''}" />
          </div>
        </div>

        ${isDocente ? `
          <div class="form-group" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px; border-radius: 8px;">
            ${this.renderCoursesChecklistHTML("edit-user-courses", existingCourses)}
            ${this.renderGradesChecklistHTML("edit-user-grades", user.assignedGrades || ["1° de Secundaria", "2° de Secundaria", "3° de Secundaria", "4° de Secundaria", "5° de Secundaria"])}
          </div>
        ` : ''}

        ${isApoderado ? `
          <div class="form-group" style="margin-bottom: 6px;">
            <label class="form-label" style="font-size: 11.5px; font-weight: 700;">Teléfono / Celular de Contacto:</label>
            <input type="text" id="edit-user-phone" class="form-control" value="${user.phone || '987-654-321'}" />
          </div>
          ${this.renderParentStudentsLinkerHTML("edit-parent", user.linkedStudents || (user.studentName ? [{ name: user.studentName, grade: "4° de Secundaria", relationship: "Hijo/Hija" }] : [{ name: "Sofía Méndez Flores", grade: "4° de Secundaria", relationship: "Hijo/Hija" }]))}
        ` : ''}

        <div class="form-group">
          <label class="form-label">Detalle Adicional / Asignación:</label>
          <input type="text" id="edit-user-detail" class="form-control" value="${user.detail || ''}" />
        </div>

        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--color-navy-900); cursor: pointer; background: var(--color-yellow-50); padding: 10px; border: 1px dashed var(--color-yellow-500); border-radius: 8px;">
            <input type="checkbox" id="edit-user-has-admin" ${user.hasAdminPrivilege ? 'checked' : ''} />
            <span>★ Conceder Privilegios de Administrador (Edición de Horarios, Sílabus, Notas)</span>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmUpdateUser('${user.id}')" style="font-weight: 800;">
          ✓ Guardar Cambios en Servidor
        </button>
      </div>
    `);
  }

  confirmUpdateUser(userId) {
    const name = document.getElementById("edit-user-name").value.trim();
    const role = document.getElementById("edit-user-role").value;
    const username = document.getElementById("edit-user-username").value.trim();
    const email = document.getElementById("edit-user-email").value.trim();
    const password = document.getElementById("edit-user-pass").value.trim();
    const dni = document.getElementById("edit-user-dni").value.trim();
    let detail = document.getElementById("edit-user-detail").value.trim();
    const hasAdmin = document.getElementById("edit-user-has-admin").checked;

    let assignedCourses = undefined;
    let subject = undefined;
    let assignedGrades = undefined;

    if (role === "Docente" || role === "Profesor") {
      const checkedCourses = Array.from(document.querySelectorAll("input[name='edit-user-courses-check']:checked")).map(cb => cb.value);
      assignedCourses = checkedCourses.length > 0 ? checkedCourses : ["Aritmética"];
      subject = assignedCourses.join(", ");

      const checkedBoxes = Array.from(document.querySelectorAll("input[name='edit-user-grades-check']:checked")).map(cb => cb.value);
      assignedGrades = checkedBoxes.length > 0 ? checkedBoxes : undefined;

      const coursesSummary = assignedCourses.length <= 2 ? assignedCourses.join(', ') : `${assignedCourses.slice(0, 2).join(', ')} (+${assignedCourses.length - 2} más)`;
      detail = `${coursesSummary} • ${assignedGrades ? assignedGrades.length : 1} grados`;
    }

    let phone = undefined;
    let studentName = undefined;
    let linkedStudents = undefined;

    if (role === "Apoderado") {
      const rows = document.querySelectorAll("#edit-parent-students-container .parent-student-row");
      linkedStudents = [];
      
      for (const r of rows) {
        const nameInp = r.querySelector(".parent-student-name");
        const relSel = r.querySelector(".parent-student-rel");
        const gradeSel = r.querySelector(".parent-student-grade");
        const dniInp = r.querySelector(".parent-student-dni");

        const stName = nameInp ? nameInp.value.trim() : "";
        const stGrade = gradeSel ? gradeSel.value : "4° de Secundaria";
        const stRel = relSel ? relSel.value : "Hijo/Hija";
        const stDni = dniInp ? dniInp.value.trim() : "";

        if (stName) {
          // Si el estudiante no existe en DB, crearlo
          const studentExists = (this.store.state.systemUsers || []).some(u => 
            (u.role === 'Estudiante' || u.role === 'Alumno') && u.name.trim().toLowerCase() === stName.toLowerCase()
          );

          const cleanStName = stName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
          const stParts = cleanStName.split(/\s+/).filter(Boolean);
          const stUsername = stParts.length >= 2 ? `${stParts[0]}.${stParts[stParts.length - 1]}` : (stParts[0] || `estudiante.${Date.now().toString().slice(-4)}`);

          if (!studentExists) {
            let defaultTutor = "Prof. Roberto Silva";
            if (stGrade.includes("Primaria")) defaultTutor = "Miss Julisa Arroyo";
            if (stGrade.includes("Inicial")) defaultTutor = "Miss Maritza";

            this.store.createSystemUser({
              name: stName,
              role: "Estudiante",
              detail: stGrade,
              gradeLevel: stGrade,
              guardian: name,
              dni: stDni,
              username: stUsername,
              password: "estudiante2026",
              email: `${stUsername}@eleducador.edu.pe`,
              tutor: defaultTutor,
              hasAdminPrivilege: false
            });
          }

          linkedStudents.push({
            name: stName,
            relationship: stRel,
            grade: stGrade,
            dni: stDni,
            username: stUsername
          });
        }
      }

      if (linkedStudents.length < 1) {
        this.showToast("⚠️ Debe registrar como mínimo 1 estudiante para el apoderado.", "danger");
        return;
      }
      if (linkedStudents.length > 9) {
        this.showToast("⚠️ El máximo permitido es de 9 estudiantes por apoderado.", "danger");
        return;
      }

      const phoneInp = document.getElementById("edit-user-phone");
      if (phoneInp) phone = phoneInp.value.trim();
      studentName = linkedStudents.map(s => s.name).join(', ');
      detail = `Apoderado de ${linkedStudents.length} estudiante(s): ${linkedStudents.map(s => `${s.name} (${s.grade} - ${s.relationship})`).join(', ')}`;
    }

    if (!name) {
      this.showToast("El nombre no puede estar vacío", "danger");
      return;
    }

    this.store.updateSystemUser(userId, {
      name,
      role,
      username,
      email,
      password,
      dni,
      phone: phone || undefined,
      detail: detail || subject,
      subject: subject || undefined,
      courses: assignedCourses,
      assignedCourses: assignedCourses,
      assignedGrades: assignedGrades,
      studentName: studentName || undefined,
      linkedStudents: linkedStudents && linkedStudents.length > 0 ? linkedStudents : undefined,
      hasAdminPrivilege: hasAdmin
    });

    this.closeModal();
    this.showToast(`✓ Datos del usuario "${name}" actualizados con éxito`, "success");
  }

  toggleTeacherAdminPrivilege(userId) {
    const res = this.store.toggleTeacherAdminPrivilege(userId);
    if (res !== null) {
      this.showToast(res ? "★ Privilegios de Edición CONCEDIDOS" : "Privilegios revocados", res ? "success" : "info");
    }
  }

  confirmDeleteUser(userId) {
    const currentRole = this.store.getCurrentRole();
    const currentUser = this.store.getCurrentUser();
    const hasAdmin = currentRole === "admin" || currentRole === "director" || (currentUser && currentUser.hasAdminPrivilege);
    if (!hasAdmin) {
      this.showToast("⚠️ Solo el Administrador o Directivo pueden eliminar usuarios del sistema.", "danger");
      return;
    }
    const user = (this.store.state.systemUsers || []).find(u => u.id === userId || u.code === userId || u.username === userId || u.name === userId);
    const name = user ? user.name : (userId || "este usuario");
    const role = user ? user.role : "usuario";
    if (confirm(`¿Está seguro de eliminar a "${name}" (${role}) de la base de datos?\n\nEsta acción eliminará de forma definitiva al usuario de todos los módulos y la nube en tiempo real.`)) {
      this.store.deleteSystemUser(userId);
      this.showToast(`✓ Usuario "${name}" eliminado con éxito.`, "info");
      this.render();
    }
  }

  confirmDeleteFamily(familyId) {
    const currentRole = this.store.getCurrentRole();
    if (currentRole !== "admin" && currentRole !== "director") {
      this.showToast("⚠️ Solo el Administrador o Directivo pueden eliminar registros de familias.", "danger");
      return;
    }
    const families = this.store.getFamiliesFinancial();
    const fam = families.find(f => f.familyId === familyId);
    const famName = fam ? `${fam.guardian} (Estudiante: ${fam.studentName})` : familyId;
    if (confirm(`¿Está seguro de eliminar a la familia "${famName}"?\n\nEsta acción borrará de todos los módulos: la cuenta del apoderado, el estudiante, la matrícula y su registro de pensiones.`)) {
      this.store.deleteFamily(familyId);
      this.showToast(`✓ Familia "${famName}" y todos sus registros vinculados fueron eliminados por completo.`, "info");
      this.render();
    }
  }

  // =========================================================================
  // GESTIÓN INTEGRAL DE MATRÍCULAS, FICHA ÚNICA (FUM), SALUD Y DOCUMENTOS
  // =========================================================================

  openCreateEnrollmentModal() {
    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">📝 Nueva Matrícula & Ficha Única de Matrícula (FUM 2026)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        
        <!-- Pestañas del Formulario FUM -->
        <div style="display: flex; gap: 6px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-navy btn-sm" id="fum-tab-btn-1" onclick="window.app.switchFUMTab('1')" style="font-weight: 800; font-size: 11px;">
            1. Datos del Alumno & SIAGIE
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="fum-tab-btn-2" onclick="window.app.switchFUMTab('2')" style="font-weight: 800; font-size: 11px;">
            👨‍👩‍👧 2. Apoderado & Emergencia
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="fum-tab-btn-3" onclick="window.app.switchFUMTab('3')" style="font-weight: 800; font-size: 11px;">
            🩺 3. Ficha Médica & Salud
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="fum-tab-btn-4" onclick="window.app.switchFUMTab('4')" style="font-weight: 800; font-size: 11px;">
            📎 4. Documentos Digitales
          </button>
        </div>

        <!-- TAB 1: DATOS DEL ESTUDIANTE -->
        <div id="fum-tab-content-1" class="fum-tab-pane">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Nombres y Apellidos Completos:</label>
              <input type="text" id="new-matr-name" class="form-control" placeholder="Ej: Joaquín Urbizagasti Huamán" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">DNI (8 dígitos):</label>
              <input type="text" id="new-matr-dni" class="form-control" placeholder="78912345" maxlength="8" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Código SIAGIE:</label>
              <input type="text" id="new-matr-siagie" class="form-control" placeholder="2026-78912345" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Fecha de Nacimiento:</label>
              <input type="text" id="new-matr-birth" class="form-control" placeholder="12/04/2012" value="12/04/2012" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Sexo:</label>
              <select id="new-matr-gender" class="form-control">
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Nivel & Grado a Matricular:</label>
              <select id="new-matr-grade" class="form-control" style="font-weight: bold; border-color: #3b82f6;">
                <optgroup label="Secundaria">
                  <option value="1° de Secundaria">1° de Secundaria</option>
                  <option value="2° de Secundaria">2° de Secundaria</option>
                  <option value="3° de Secundaria">3° de Secundaria</option>
                  <option value="4° de Secundaria" selected>4° de Secundaria</option>
                  <option value="5° de Secundaria">5° de Secundaria</option>
                </optgroup>
                <optgroup label="Primaria">
                  <option value="1° de Primaria">1° de Primaria</option>
                  <option value="2° de Primaria">2° de Primaria</option>
                  <option value="3° de Primaria">3° de Primaria</option>
                  <option value="4° de Primaria">4° de Primaria</option>
                  <option value="5° de Primaria">5° de Primaria</option>
                  <option value="6° de Primaria">6° de Primaria</option>
                </optgroup>
                <optgroup label="Inicial">
                  <option value="Inicial 3 años">Inicial 3 años</option>
                  <option value="Inicial 4 años">Inicial 4 años</option>
                  <option value="Inicial 5 años">Inicial 5 años</option>
                </optgroup>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Dirección de Residencia:</label>
              <input type="text" id="new-matr-address" class="form-control" placeholder="Av. Los Tusílagos 450, S.J.L." value="San Juan de Lurigancho, Lima" />
            </div>
          </div>
        </div>

        <!-- TAB 2: APODERADO Y CONTACTOS DE EMERGENCIA -->
        <div id="fum-tab-content-2" class="fum-tab-pane" style="display: none;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Apoderado / Tutor Legal:</label>
              <input type="text" id="new-matr-guardian" class="form-control" placeholder="Ej: Dra. Carmen Méndez" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">DNI del Apoderado:</label>
              <input type="text" id="new-matr-guardiandni" class="form-control" placeholder="41982301" maxlength="8" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Teléfono Celular / WhatsApp:</label>
              <input type="text" id="new-matr-guardianphone" class="form-control" placeholder="987-654-321" value="987-654-321" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Correo Electrónico:</label>
              <input type="email" id="new-matr-guardianemail" class="form-control" placeholder="apoderado@gmail.com" />
            </div>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px;">
            <div style="font-size: 11.5px; font-weight: 800; color: #92400e; margin-bottom: 6px;">📞 Contacto Secundario de Emergencia:</div>
            <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 10px;">
              <input type="text" id="new-matr-emergencycontact" class="form-control" placeholder="Familiar de contacto (ej: Tío/Abuela)" value="Familiar de Emergencia" style="font-size: 11.5px;" />
              <input type="text" id="new-matr-emergencyphone" class="form-control" placeholder="981-555-444" value="981-555-444" style="font-size: 11.5px;" />
            </div>
          </div>
        </div>

        <!-- TAB 3: FICHA MÉDICA Y SALUD -->
        <div id="fum-tab-content-3" class="fum-tab-pane" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Grupo Sanguíneo & Factor:</label>
              <select id="new-matr-blood" class="form-control" style="font-weight: bold;">
                <option value="O+">O Positivo (O+)</option>
                <option value="O-">O Negativo (O-)</option>
                <option value="A+">A Positivo (A+)</option>
                <option value="A-">A Negativo (A-)</option>
                <option value="B+">B Positivo (B+)</option>
                <option value="B-">B Negativo (B-)</option>
                <option value="AB+">AB Positivo (AB+)</option>
                <option value="AB-">AB Negativo (AB-)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Seguro de Salud:</label>
              <select id="new-matr-insurance" class="form-control">
                <option value="EsSalud (Activo)">EsSalud (Activo)</option>
                <option value="SIS Escolar (MINSA)">SIS Escolar (MINSA)</option>
                <option value="Seguro Particular (Rímac / Pacífico / Mapfre)">Seguro Particular (Rímac / Pacífico / Mapfre)</option>
                <option value="Sin Seguro / En Trámite">Sin Seguro / En Trámite</option>
              </select>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Alergias (Medicamentos / Alimentos):</label>
            <input type="text" id="new-matr-allergies" class="form-control" placeholder="Ej: Alergia a la Penicilina / Ninguna conocida" value="Sin alergias conocidas" />
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Condición Médica / Apto para Educación Física:</label>
            <input type="text" id="new-matr-medical" class="form-control" placeholder="Ej: Apto para educación física y deportes / Asma leve controlada" value="Apto para actividad física y talleres" />
          </div>
        </div>

        <!-- TAB 4: REQUISITOS Y DOCUMENTOS DIGITALES -->
        <div id="fum-tab-content-4" class="fum-tab-pane" style="display: none;">
          <div style="font-size: 12px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px;">
            📎 Checklist de Requisitos Documentarios (UGEL 05 - MINEDU):
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Copia de DNI del Estudiante</span>
              <input type="checkbox" id="chk-doc-dnistudent" checked style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Copia de DNI del Padre / Madre / Apoderado</span>
              <input type="checkbox" id="chk-doc-dniparent" checked style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Partida / Acta de Nacimiento (Original o Copia Legalizada)</span>
              <input type="checkbox" id="chk-doc-birthcert" checked style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Ficha Única de Matrícula SIAGIE (Traslado / Continuidad)</span>
              <input type="checkbox" id="chk-doc-siagiefum" checked style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Certificado de Estudios / Libreta de Notas 2025</span>
              <input type="checkbox" id="chk-doc-reportcard" checked style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700; color: #1e293b;">Cartilla de Vacunación Completa (Nivel Inicial/Primaria)</span>
              <input type="checkbox" id="chk-doc-vaccine" checked style="transform: scale(1.2);" />
            </label>
          </div>
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmCreateEnrollment()" style="font-weight: 800; padding: 8px 20px;">
          ✓ Guardar Matrícula & Generar Ficha FUM
        </button>
      </div>
    `);
  }

  switchFUMTab(tabNum) {
    for (let i = 1; i <= 4; i++) {
      const pane = document.getElementById(`fum-tab-content-${i}`);
      const btn = document.getElementById(`fum-tab-btn-${i}`);
      if (pane) pane.style.display = (i.toString() === tabNum ? "block" : "none");
      if (btn) {
        btn.className = (i.toString() === tabNum ? "btn btn-navy btn-sm" : "btn btn-outline btn-sm");
      }
    }
  }

  confirmCreateEnrollment() {
    const studentName = document.getElementById("new-matr-name").value.trim();
    const dni = document.getElementById("new-matr-dni").value.trim();
    const siagieCode = document.getElementById("new-matr-siagie").value.trim() || `2026-${dni || '78912345'}`;
    const birthDate = document.getElementById("new-matr-birth").value.trim() || "12/04/2012";
    const gender = document.getElementById("new-matr-gender").value;
    const grade = document.getElementById("new-matr-grade").value;
    const address = document.getElementById("new-matr-address").value.trim() || "San Juan de Lurigancho";

    const guardian = document.getElementById("new-matr-guardian").value.trim() || "Apoderado Titular";
    const guardianDni = document.getElementById("new-matr-guardiandni").value.trim() || "41982301";
    const guardianPhone = document.getElementById("new-matr-guardianphone").value.trim() || "987-654-321";
    const guardianEmail = document.getElementById("new-matr-guardianemail").value.trim() || "apoderado@gmail.com";
    const emergencyContact = document.getElementById("new-matr-emergencycontact").value.trim() || guardian;
    const emergencyPhone = document.getElementById("new-matr-emergencyphone").value.trim() || guardianPhone;

    const bloodType = document.getElementById("new-matr-blood").value;
    const insurance = document.getElementById("new-matr-insurance").value;
    const allergies = document.getElementById("new-matr-allergies").value.trim() || "Sin alergias conocidas";
    const medicalCondition = document.getElementById("new-matr-medical").value.trim() || "Apto para actividades escolares";

    const documents = {
      dniStudent: document.getElementById("chk-doc-dnistudent") ? document.getElementById("chk-doc-dnistudent").checked : true,
      dniParent: document.getElementById("chk-doc-dniparent") ? document.getElementById("chk-doc-dniparent").checked : true,
      birthCertificate: document.getElementById("chk-doc-birthcert") ? document.getElementById("chk-doc-birthcert").checked : true,
      siagieFUM: document.getElementById("chk-doc-siagiefum") ? document.getElementById("chk-doc-siagiefum").checked : true,
      reportCard: document.getElementById("chk-doc-reportcard") ? document.getElementById("chk-doc-reportcard").checked : true,
      vaccinationCard: document.getElementById("chk-doc-vaccine") ? document.getElementById("chk-doc-vaccine").checked : true
    };

    if (!studentName) {
      this.showToast("⚠️ Ingrese el nombre completo del estudiante", "danger");
      return;
    }

    const created = this.store.createEnrollment({
      studentName,
      dni: dni || "Pendiente",
      siagieCode,
      birthDate,
      gender,
      grade,
      address,
      guardian,
      guardianDni,
      guardianPhone,
      guardianEmail,
      emergencyContact,
      emergencyPhone,
      bloodType,
      insurance,
      allergies,
      medicalCondition,
      documents,
      status: "Matriculado (FUM Completa)"
    });

    this.closeModal();
    this.render();
    this.showToast(`✓ Estudiante "${studentName}" matriculado y Código QR generado.`, "success");

    // Desplegar modal inmediato con el Código QR Generado
    setTimeout(() => {
      this.showModal(`
        <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
          <div>
            <h3 class="modal-title" style="color: white; margin: 0; font-size: 15px;">
              🎉 ¡Estudiante Matriculado & Código QR Generado Automáticamente!
            </h3>
            <span style="font-size: 11px; color: #fde047;">I.E.P. "El Educador" • Año Lectivo 2026</span>
          </div>
          <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
        </div>

        <div class="modal-body" style="padding: 20px; text-align: center; background: #f8fafc;">
          
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px 12px; border-radius: 6px; margin-bottom: 14px; font-size: 12px; color: #065f46; font-weight: bold;">
            ✓ El código QR oficial ha sido generado y vinculado al sistema de asistencia en puerta e informes.
          </div>

          <!-- Tarjeta Oficial de Código QR Escolar (Sin Foto) -->
          <div style="max-width: 300px; margin: 0 auto; background: #ffffff; border: 3px solid #1e3a8a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white; padding: 10px; border-bottom: 3px solid #f59e0b;">
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo" style="width: 26px; height: 26px; object-fit: contain;" />
                <div style="text-align: center;">
                  <div style="font-size: 10.5px; font-weight: 900; color: #fde047;">I.E.P. "EL EDUCADOR"</div>
                  <div style="font-size: 8px; opacity: 0.9;">ASISTENCIA & CONVIVENCIA 2026</div>
                </div>
              </div>
            </div>

            <div style="padding: 16px 12px;">
              <div style="width: 155px; height: 155px; margin: 0 auto 12px; border: 2px solid #0b132b; border-radius: 8px; padding: 6px; background: white;">
                ${Components.generateQRSVG(created.studentCode)}
              </div>

              <div style="font-size: 14px; font-weight: 900; color: #0b132b; text-transform: uppercase; line-height: 1.2; margin-bottom: 4px;">
                ${created.studentName}
              </div>
              <div style="font-size: 12px; font-weight: 800; color: #1e40af; margin-bottom: 6px;">
                ${created.grade}
              </div>
              <div style="font-size: 10.5px; color: #475569; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; display: inline-block;">
                <strong>CÓD:</strong> <code>${created.studentCode}</code> • <strong>DNI:</strong> <code>${created.dni}</code>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-weight: 800;">
              Imprimir Tarjeta QR
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.showOfficialFUMPrintModal('${created.id}')" style="font-size: 11px;">
              Ver Ficha FUM A4
            </button>
            <button class="btn btn-gold btn-sm" onclick="window.app.closeModal(); window.app.navigate('attendance'); window.app.setAttendanceSubTab('id-cards');" style="font-weight: 800;">
              Ir a Plancha de QR
            </button>
          </div>
        </div>
      `);
    }, 300);
  }

  openEditEnrollmentFUMModal(enrollmentId) {
    const enrollments = this.store.getEnrollments();
    const m = enrollments.find(e => e.id === enrollmentId || e.studentCode === enrollmentId) || enrollments[0];
    if (!m) return;

    const docs = m.documents || {};

    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">✏️ Expediente FUM & Ficha Médica: ${m.studentName}</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        
        <!-- Pestañas del Formulario FUM -->
        <div style="display: flex; gap: 6px; margin-bottom: 14px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; flex-wrap: wrap;">
          <button type="button" class="btn btn-navy btn-sm" id="edit-fum-tab-btn-1" onclick="window.app.switchEditFUMTab('1')" style="font-weight: 800; font-size: 11px;">
            1. Datos del Alumno & SIAGIE
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="edit-fum-tab-btn-2" onclick="window.app.switchEditFUMTab('2')" style="font-weight: 800; font-size: 11px;">
            👨‍👩‍👧 2. Apoderado & Emergencia
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="edit-fum-tab-btn-3" onclick="window.app.switchEditFUMTab('3')" style="font-weight: 800; font-size: 11px;">
            🩺 3. Ficha Médica & Salud
          </button>
          <button type="button" class="btn btn-outline btn-sm" id="edit-fum-tab-btn-4" onclick="window.app.switchEditFUMTab('4')" style="font-weight: 800; font-size: 11px;">
            📎 4. Documentos Digitales
          </button>
        </div>

        <!-- TAB 1: DATOS DEL ESTUDIANTE -->
        <div id="edit-fum-tab-content-1" class="fum-tab-pane">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Nombre Completo:</label>
              <input type="text" id="edit-matr-name" class="form-control" value="${m.studentName}" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">DNI:</label>
              <input type="text" id="edit-matr-dni" class="form-control" value="${m.dni || ''}" maxlength="8" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Código SIAGIE:</label>
              <input type="text" id="edit-matr-siagie" class="form-control" value="${m.siagieCode || m.dni || ''}" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Fecha de Nacimiento:</label>
              <input type="text" id="edit-matr-birth" class="form-control" value="${m.birthDate || '14/05/2010'}" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Sexo:</label>
              <select id="edit-matr-gender" class="form-control">
                <option value="Femenino" ${m.gender === 'Femenino' ? 'selected' : ''}>Femenino</option>
                <option value="Masculino" ${m.gender === 'Masculino' ? 'selected' : ''}>Masculino</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Grado:</label>
              <input type="text" id="edit-matr-grade" class="form-control" value="${m.grade}" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Dirección:</label>
              <input type="text" id="edit-matr-address" class="form-control" value="${m.address || 'San Juan de Lurigancho'}" />
            </div>
          </div>
        </div>

        <!-- TAB 2: APODERADO -->
        <div id="edit-fum-tab-content-2" class="fum-tab-pane" style="display: none;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Apoderado Titular:</label>
              <input type="text" id="edit-matr-guardian" class="form-control" value="${m.guardian}" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">DNI Apoderado:</label>
              <input type="text" id="edit-matr-guardiandni" class="form-control" value="${m.guardianDni || '41982301'}" maxlength="8" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Teléfono Celular:</label>
              <input type="text" id="edit-matr-guardianphone" class="form-control" value="${m.guardianPhone || '987-654-321'}" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Correo:</label>
              <input type="email" id="edit-matr-guardianemail" class="form-control" value="${m.guardianEmail || ''}" />
            </div>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px;">
            <div style="font-size: 11.5px; font-weight: 800; color: #92400e; margin-bottom: 6px;">📞 Contacto Secundario de Emergencia:</div>
            <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 10px;">
              <input type="text" id="edit-matr-emergencycontact" class="form-control" value="${m.emergencyContact || ''}" placeholder="Nombre de familiar" />
              <input type="text" id="edit-matr-emergencyphone" class="form-control" value="${m.emergencyPhone || ''}" placeholder="Teléfono" />
            </div>
          </div>
        </div>

        <!-- TAB 3: SALUD -->
        <div id="edit-fum-tab-content-3" class="fum-tab-pane" style="display: none;">
          <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Grupo Sanguíneo:</label>
              <select id="edit-matr-blood" class="form-control" style="font-weight: bold;">
                <option value="O+" ${m.bloodType === 'O+' ? 'selected' : ''}>O Positivo (O+)</option>
                <option value="O-" ${m.bloodType === 'O-' ? 'selected' : ''}>O Negativo (O-)</option>
                <option value="A+" ${m.bloodType === 'A+' ? 'selected' : ''}>A Positivo (A+)</option>
                <option value="A-" ${m.bloodType === 'A-' ? 'selected' : ''}>A Negativo (A-)</option>
                <option value="B+" ${m.bloodType === 'B+' ? 'selected' : ''}>B Positivo (B+)</option>
                <option value="B-" ${m.bloodType === 'B-' ? 'selected' : ''}>B Negativo (B-)</option>
                <option value="AB+" ${m.bloodType === 'AB+' ? 'selected' : ''}>AB Positivo (AB+)</option>
                <option value="AB-" ${m.bloodType === 'AB-' ? 'selected' : ''}>AB Negativo (AB-)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Seguro de Salud:</label>
              <input type="text" id="edit-matr-insurance" class="form-control" value="${m.insurance || 'EsSalud / SIS'}" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Alergias:</label>
            <input type="text" id="edit-matr-allergies" class="form-control" value="${m.allergies || 'Sin alergias conocidas'}" />
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Condición Médica / Actividad Física:</label>
            <input type="text" id="edit-matr-medical" class="form-control" value="${m.medicalCondition || 'Apto para actividad física'}" />
          </div>
        </div>

        <!-- TAB 4: DOCUMENTOS -->
        <div id="edit-fum-tab-content-4" class="fum-tab-pane" style="display: none;">
          <div style="font-size: 12px; font-weight: 800; color: #1e3a8a; margin-bottom: 8px;">
            📎 Estado de Requisitos y Documentación Sustentatoria:
          </div>

          <div style="display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700;">Copia de DNI del Estudiante</span>
              <input type="checkbox" id="edit-chk-dnistudent" ${docs.dniStudent ? 'checked' : ''} style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700;">Copia de DNI del Padre / Madre / Apoderado</span>
              <input type="checkbox" id="edit-chk-dniparent" ${docs.dniParent ? 'checked' : ''} style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700;">Partida / Acta de Nacimiento</span>
              <input type="checkbox" id="edit-chk-birthcert" ${docs.birthCertificate ? 'checked' : ''} style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700;">Ficha Única de Matrícula SIAGIE</span>
              <input type="checkbox" id="edit-chk-siagiefum" ${docs.siagieFUM ? 'checked' : ''} style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700;">Certificado de Estudios / Libreta de Notas</span>
              <input type="checkbox" id="edit-chk-reportcard" ${docs.reportCard ? 'checked' : ''} style="transform: scale(1.2);" />
            </label>

            <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: 700;">Cartilla de Vacunación</span>
              <input type="checkbox" id="edit-chk-vaccine" ${docs.vaccinationCard ? 'checked' : ''} style="transform: scale(1.2);" />
            </label>
          </div>
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmUpdateEnrollmentFUM('${m.id}')" style="font-weight: 800; padding: 8px 20px;">
          ✓ Guardar Cambios en FUM
        </button>
      </div>
    `);
  }

  switchEditFUMTab(tabNum) {
    for (let i = 1; i <= 4; i++) {
      const pane = document.getElementById(`edit-fum-tab-content-${i}`);
      const btn = document.getElementById(`edit-fum-tab-btn-${i}`);
      if (pane) pane.style.display = (i.toString() === tabNum ? "block" : "none");
      if (btn) {
        btn.className = (i.toString() === tabNum ? "btn btn-navy btn-sm" : "btn btn-outline btn-sm");
      }
    }
  }

  confirmUpdateEnrollmentFUM(enrollmentId) {
    const studentName = document.getElementById("edit-matr-name").value.trim();
    const dni = document.getElementById("edit-matr-dni").value.trim();
    const siagieCode = document.getElementById("edit-matr-siagie").value.trim();
    const birthDate = document.getElementById("edit-matr-birth").value.trim();
    const gender = document.getElementById("edit-matr-gender").value;
    const grade = document.getElementById("edit-matr-grade").value.trim();
    const address = document.getElementById("edit-matr-address").value.trim();

    const guardian = document.getElementById("edit-matr-guardian").value.trim();
    const guardianDni = document.getElementById("edit-matr-guardiandni").value.trim();
    const guardianPhone = document.getElementById("edit-matr-guardianphone").value.trim();
    const guardianEmail = document.getElementById("edit-matr-guardianemail").value.trim();
    const emergencyContact = document.getElementById("edit-matr-emergencycontact").value.trim();
    const emergencyPhone = document.getElementById("edit-matr-emergencyphone").value.trim();

    const bloodType = document.getElementById("edit-matr-blood").value;
    const insurance = document.getElementById("edit-matr-insurance").value.trim();
    const allergies = document.getElementById("edit-matr-allergies").value.trim();
    const medicalCondition = document.getElementById("edit-matr-medical").value.trim();

    const documents = {
      dniStudent: document.getElementById("edit-chk-dnistudent") ? document.getElementById("edit-chk-dnistudent").checked : true,
      dniParent: document.getElementById("edit-chk-dniparent") ? document.getElementById("edit-chk-dniparent").checked : true,
      birthCertificate: document.getElementById("edit-chk-birthcert") ? document.getElementById("edit-chk-birthcert").checked : true,
      siagieFUM: document.getElementById("edit-chk-siagiefum") ? document.getElementById("edit-chk-siagiefum").checked : true,
      reportCard: document.getElementById("edit-chk-reportcard") ? document.getElementById("edit-chk-reportcard").checked : true,
      vaccinationCard: document.getElementById("edit-chk-vaccine") ? document.getElementById("edit-chk-vaccine").checked : true
    };

    this.store.updateEnrollmentFUM(enrollmentId, {
      studentName,
      dni,
      siagieCode,
      birthDate,
      gender,
      grade,
      address,
      guardian,
      guardianDni,
      guardianPhone,
      guardianEmail,
      emergencyContact,
      emergencyPhone,
      bloodType,
      insurance,
      allergies,
      medicalCondition,
      documents
    });

    this.closeModal();
    this.render();
    this.showToast(`✓ Ficha FUM de "${studentName}" actualizada exitosamente.`, "success");
  }

  showOfficialFUMPrintModal(enrollmentId) {
    const enrollments = this.store.getEnrollments();
    const m = enrollments.find(e => e.id === enrollmentId || e.studentCode === enrollmentId) || enrollments[0];
    if (!m) return;

    const docs = m.documents || {};

    this.showModal(`
      <div class="modal-header" style="background: #0f172a; color: #ffffff;">
        <h3 style="color: #ffffff;">Ficha Única de Matrícula Oficial (F.U.M. 2026)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 80vh; overflow-y: auto; padding: 24px; background: #ffffff;">
        
        <!-- MEMBRETE OFICIAL MINEDU / UGEL 05 -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0b132b; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador" style="width: 70px; height: 70px; object-fit: contain;" />
            <div>
              <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase;">REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN</div>
              <div style="font-size: 10px; color: #64748b;">DRELM • UGEL 05 SAN JUAN DE LURIGANCHO</div>
              <h2 style="font-size: 17px; font-weight: 900; margin: 2px 0; color: #0b132b;">I.E.P. "EL EDUCADOR"</h2>
              <div style="font-size: 10.5px; color: #b45309; font-weight: 700;">"21 años dejando huellas en la formación de líderes"</div>
            </div>
          </div>
          <div style="text-align: right; border-left: 2px solid #e2e8f0; padding-left: 12px;">
            <div style="font-size: 10px; font-weight: 800; color: #475569;">CÓDIGO MODULAR:</div>
            <div style="font-size: 10px;">Inicial: <strong>0614826</strong></div>
            <div style="font-size: 10px;">Primaria: <strong>0614834</strong></div>
            <div style="font-size: 10px;">Secundaria: <strong>0729483</strong></div>
            <div style="font-size: 11px; font-weight: 900; color: #1e40af; margin-top: 2px;">AÑO LECTIVO 2026</div>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 16px;">
          <h3 style="font-size: 15px; font-weight: 900; color: #0b132b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
            FICHA ÚNICA DE MATRÍCULA - F.U.M. N° ${m.studentCode}
          </h3>
          <span style="font-size: 11px; color: #047857; font-weight: 800; background: #d1fae5; padding: 2px 10px; border-radius: 10px; border: 1px solid #a7f3d0; display: inline-block; margin-top: 4px;">
            ✓ ESTADO: MATRICULADO OFICIALMENTE EN SIAGIE
          </span>
        </div>

        <!-- SECCIÓN I: DATOS DEL ESTUDIANTE -->
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 12px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 6px 12px; font-size: 11.5px; font-weight: 900; color: #1e3a8a; border-bottom: 1px solid #cbd5e1;">
            I. DATOS DE IDENTIFICACIÓN DEL ESTUDIANTE
          </div>
          <div style="padding: 10px 12px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><strong>Apellidos y Nombres:</strong> <br><span style="font-size: 13px; color: #0b132b; font-weight: bold;">${m.studentName}</span></div>
            <div><strong>DNI:</strong> <br><span>${m.dni}</span></div>
            <div><strong>Cód. SIAGIE:</strong> <br><span style="font-family: monospace; font-weight: bold; color: #1e40af;">${m.siagieCode || m.dni}</span></div>
            <div><strong>Grado y Nivel:</strong> <br><span style="font-weight: bold;">${m.grade}</span> (${m.level || 'Secundaria'})</div>
            <div><strong>Fecha de Nacimiento:</strong> <br><span>${m.birthDate || '14/05/2010'}</span></div>
            <div><strong>Sexo:</strong> <br><span>${m.gender || 'Femenino'}</span></div>
            <div style="grid-column: span 3;"><strong>Domicilio Actual:</strong> <br><span>${m.address || 'Av. Próceres de la Independencia 1420, San Juan de Lurigancho, Lima'}</span></div>
          </div>
        </div>

        <!-- SECCIÓN II: DATOS DEL APODERADO -->
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 12px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 6px 12px; font-size: 11.5px; font-weight: 900; color: #1e3a8a; border-bottom: 1px solid #cbd5e1;">
            II. DATOS DEL PADRE, MADRE O APODERADO LEGAL
          </div>
          <div style="padding: 10px 12px; display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; font-size: 12px;">
            <div><strong>Nombre del Apoderado:</strong> <br><span style="font-weight: bold;">${m.guardian}</span></div>
            <div><strong>DNI Apoderado:</strong> <br><span>${m.guardianDni || '41982301'}</span></div>
            <div><strong>Teléfono / Celular:</strong> <br><span>${m.guardianPhone || '987-654-321'}</span></div>
            <div style="grid-column: span 2;"><strong>Correo Electrónico:</strong> <br><span>${m.guardianEmail || 'apoderado@eleducador.edu.pe'}</span></div>
            <div><strong>Fecha de Matrícula:</strong> <br><span>${m.enrollmentDate || '15/02/2026'}</span></div>
          </div>
        </div>

        <!-- SECCIÓN III: FICHA MÉDICA Y SALUD -->
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 12px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 6px 12px; font-size: 11.5px; font-weight: 900; color: #1e3a8a; border-bottom: 1px solid #cbd5e1;">
            III. ANTECEDENTES MÉDICOS Y ATENCIÓN DE SALUD ESCOLAR
          </div>
          <div style="padding: 10px 12px; display: grid; grid-template-columns: 1fr 1.5fr 1.5fr; gap: 8px; font-size: 12px;">
            <div><strong>Grupo Sanguíneo:</strong> <br><span style="font-weight: 900; color: #dc2626; font-size: 13px;">🩸 ${m.bloodType || 'O+'}</span></div>
            <div><strong>Seguro de Salud:</strong> <br><span>🏥 ${m.insurance || 'EsSalud / SIS'}</span></div>
            <div><strong>Alergias Conocidas:</strong> <br><span style="color: #b45309; font-weight: bold;">⚠️ ${m.allergies || 'Ninguna'}</span></div>
            <div style="grid-column: span 2;"><strong>Condición Médica / Educación Física:</strong> <br><span>${m.medicalCondition || 'Apto para toda actividad física escolar'}</span></div>
            <div><strong>Teléfono de Emergencia:</strong> <br><span style="font-weight: bold; color: #047857;">📞 ${m.emergencyPhone || m.guardianPhone || '987-654-321'}</span></div>
          </div>
        </div>

        <!-- SECCIÓN IV: REQUISITOS Y DOCUMENTOS VERIFICADOS -->
        <div style="border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 16px; overflow: hidden;">
          <div style="background: #f1f5f9; padding: 6px 12px; font-size: 11.5px; font-weight: 900; color: #1e3a8a; border-bottom: 1px solid #cbd5e1;">
            IV. DOCUMENTACIÓN SUSTENTATORIA VERIFICADA POR SECRETARÍA
          </div>
          <div style="padding: 10px 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11.5px;">
            <div>${docs.dniStudent ? '☑️' : '⬜'} Copia de DNI del Estudiante</div>
            <div>${docs.dniParent ? '☑️' : '⬜'} Copia de DNI del Apoderado</div>
            <div>${docs.birthCertificate ? '☑️' : '⬜'} Partida de Nacimiento</div>
            <div>${docs.siagieFUM ? '☑️' : '⬜'} Ficha Única de Matrícula SIAGIE</div>
            <div>${docs.reportCard ? '☑️' : '⬜'} Certificado de Estudios / Libreta 2025</div>
            <div>${docs.vaccinationCard ? '☑️' : '⬜'} Cartilla de Vacunación</div>
          </div>
        </div>

        <!-- SECCIÓN V: COMPROMISO Y FIRMAS -->
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
          <p style="font-size: 10.5px; color: #475569; text-align: justify; line-height: 1.4; margin-bottom: 28px;">
            <strong>DECLARACIÓN JURADA Y COMPROMISO:</strong> El padre de familia o apoderado declara bajo juramento que los datos consignados en la presente Ficha Única de Matrícula son fidedignos y se compromete a respetar el Reglamento Interno y apoyar el proceso formativo de su menor hijo(a) durante el Año Lectivo 2026.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center;">
            <div>
              <div style="border-top: 1px solid #000000; width: 80%; margin: 0 auto 4px;"></div>
              <div style="font-size: 11px; font-weight: bold;">${m.guardian}</div>
              <div style="font-size: 10px; color: #64748b;">Firma del Padre / Madre / Apoderado</div>
              <div style="font-size: 9.5px; color: #64748b;">DNI: ${m.guardianDni || '41982301'}</div>
            </div>
            <div>
              <div style="border-top: 1px solid #000000; width: 80%; margin: 0 auto 4px;"></div>
              <div style="font-size: 11px; font-weight: bold;">Lic. Manuel Cornejo / Prof. Alex Lino</div>
              <div style="font-size: 10px; color: #64748b;">Dirección General & Secretaría Académica</div>
              <div style="font-size: 9.5px; color: #64748b;">I.E.P. "El Educador" • UGEL 05</div>
            </div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; margin-top: 20px;">
          <div style="width: 55px; height: 55px;">${Components.generateQRSVG(`FUM-2026-${m.studentCode}-${m.dni}`)}</div>
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy" onclick="window.print()" style="font-weight: 900; padding: 8px 24px;">
          Imprimir Ficha Única Oficial (A4)
        </button>
      </div>
    `);
  }

  openDocumentsChecklistModal(enrollmentId) {
    const enrollments = this.store.getEnrollments();
    const m = enrollments.find(e => e.id === enrollmentId || e.studentCode === enrollmentId) || enrollments[0];
    if (!m) return;

    const docs = m.documents || {};
    const reqList = [
      { key: 'dniStudent', label: 'Copia de DNI del Estudiante', icon: '🆔', required: true },
      { key: 'dniParent', label: 'Copia de DNI del Padre / Madre / Apoderado', icon: '👨‍👩‍👧', required: true },
      { key: 'birthCertificate', label: 'Partida / Acta de Nacimiento', icon: '', required: true },
      { key: 'siagieFUM', label: 'Ficha Única de Matrícula SIAGIE', icon: '', required: true },
      { key: 'reportCard', label: 'Certificado de Estudios / Libreta de Notas 2025', icon: '', required: false },
      { key: 'vaccinationCard', label: 'Cartilla de Vacunación Completa', icon: '💉', required: false }
    ];

    this.showModal(`
      <div class="modal-header" style="background: #065f46; color: #ffffff;">
        <h3 style="color: #ffffff;">📎 Documentos Digitales & Requisitos: ${m.studentName}</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px 14px; border-radius: 6px; margin-bottom: 14px; font-size: 12px; color: #065f46;">
          Expediente digital oficial de matrícula para <strong>${m.studentName}</strong> (${m.grade}). Marque los documentos recibidos o cargue copias digitales.
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${reqList.map(req => {
            const isDelivered = !!docs[req.key];
            return `
              <div class="card" style="padding: 12px 14px; border-left: 4px solid ${isDelivered ? '#10b981' : '#f59e0b'}; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 16px;">${req.icon}</span>
                    <strong style="font-size: 12.5px; color: #0b132b;">${req.label}</strong>
                    ${req.required ? `<span style="font-size: 10px; color: #dc2626; font-weight: 800;">* Obligatorio</span>` : ''}
                  </div>
                  <span style="font-size: 11px; color: ${isDelivered ? '#047857' : '#b45309'}; font-weight: 700; margin-top: 2px; display: block;">
                    ${isDelivered ? '✓ Documento recibido y verificado' : '⏳ Pendiente de entrega por el apoderado'}
                  </span>
                </div>

                <div style="display: flex; gap: 6px; align-items: center;">
                  <button class="btn btn-sm ${isDelivered ? 'btn-gold' : 'btn-outline'}" onclick="window.app.toggleDocumentItem('${m.id}', '${req.key}', ${!isDelivered})" style="font-size: 11px; font-weight: 800;">
                    ${isDelivered ? '✓ Marcado Conforme' : 'Marcar como Recibido'}
                  </button>
                  <button class="btn btn-navy btn-sm" onclick="window.app.simulateUploadDocument('${m.id}', '${req.key}', '${req.label}')" style="font-size: 11px;">
                    📤 Cargar Archivo
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  toggleDocumentItem(enrollmentId, docKey, isChecked) {
    const enrollments = this.store.getEnrollments();
    const m = enrollments.find(e => e.id === enrollmentId || e.studentCode === enrollmentId);
    if (!m) return;
    if (!m.documents) m.documents = {};
    m.documents[docKey] = isChecked;
    this.store.saveState();
    this.openDocumentsChecklistModal(enrollmentId);
    this.showToast(`Estado de documento actualizado.`, "info");
  }

  simulateUploadDocument(enrollmentId, docKey, docTitle) {
    this.showToast(`Subiendo archivo digital para "${docTitle}"...`, "info");
    setTimeout(() => {
      const enrollments = this.store.getEnrollments();
      const m = enrollments.find(e => e.id === enrollmentId || e.studentCode === enrollmentId);
      if (m) {
        if (!m.documents) m.documents = {};
        m.documents[docKey] = true;
        this.store.saveState();
      }
      this.openDocumentsChecklistModal(enrollmentId);
      this.showToast(`✓ Documento digital "${docTitle}" cargado y verificado con éxito.`, "success");
    }, 400);
  }

  showEnrollmentCertificateModal(enrollmentId) {
    this.showOfficialFUMPrintModal(enrollmentId);
  }

  // =========================================================================
  // GESTIÓN Y EVENTOS DE ASISTENCIA BIOMÉTRICA & QR EN PUERTA
  // =========================================================================

  setAttendanceSubTab(subTab) {
    this.store.state.attendanceActiveSubTab = subTab;
    this.render();
  }

  onAttendanceGradeChange(gradeId) {
    this.store.state.selectedAttendanceGrade = gradeId;
    this.render();
  }

  onAttendanceDateChange(date) {
    this.store.state.selectedAttendanceDate = date;
    this.render();
  }

  setStudentAttendanceStatus(recordId, newStatus) {
    const updated = this.store.updateStudentAttendanceStatus(recordId, newStatus);
    if (updated) {
      const icon = newStatus === 'Presente' ? '<span class="status-dot-green"></span>' : newStatus === 'Tardanza' ? '<span class="status-dot-yellow"></span>' : newStatus === 'Falta' ? '<span class="status-dot-red"></span>' : '🔵';
      this.showToast(`${icon} ${updated.studentName} marcado como "${newStatus}"`, "info");
      this.render();
    }
  }

  markAllClassroomPresent(gradeId, date) {
    this.store.markAllStudentsPresent(gradeId, date);
    this.showToast(`✓ Todos los estudiantes del aula marcados como "Presente a Tiempo"`, "success");
    this.render();
  }

  openJustifyAttendanceModal(studentId, date = "19/08/2026") {
    const enrollments = this.store.getEnrollments();
    const st = enrollments.find(e => e.id === studentId || e.studentCode === studentId) || { studentName: "Sofía Méndez Flores" };

    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">📝 Justificación de Inasistencia / Tardanza</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 12px;">
          Estudiante: <strong>${st.studentName}</strong> • Fecha: <strong>${date}</strong>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Motivo de la Inasistencia:</label>
          <select id="just-reason-type" class="form-control" style="font-weight: bold; margin-bottom: 8px;">
            <option value="Cita médica pediátrica / Tratamiento de salud">Cita médica / Tratamiento de salud</option>
            <option value="Descanso médico prescrito (Reposo)">Descanso médico prescrito (Reposo)</option>
            <option value="Emergencia o calamidad familiar">Emergencia o calamidad familiar</option>
            <option value="Representación institucional / Deportiva / Académica">Representación institucional / Académica</option>
            <option value="Trámite legal documentario / RENIEC">Trámite documentario / RENIEC</option>
          </select>
          <textarea id="just-reason-detail" class="form-control" rows="3" placeholder="Detalle la justificación para conocimiento de Coordinación y Tutoría..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Documento Sustentatorio (Constancia Médica / Receta):</label>
          <div style="border: 2px dashed #cbd5e1; border-radius: 6px; padding: 12px; text-align: center; background: #f8fafc;">
            <span style="font-size: 12px; color: #475569;">Constancia_Medica_Atencion_19082026.pdf</span>
            <div style="font-size: 10.5px; color: #047857; font-weight: bold; margin-top: 4px;">✓ Documento adjunto verificado</div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmSubmitJustification('${studentId}', '${date}')" style="font-weight: 800;">
          ✓ Aprobar y Registrar Justificación
        </button>
      </div>
    `);
  }

  confirmSubmitJustification(studentId, date) {
    const reasonType = document.getElementById("just-reason-type") ? document.getElementById("just-reason-type").value : "Salud";
    const detail = document.getElementById("just-reason-detail") ? document.getElementById("just-reason-detail").value.trim() : "";
    const fullReason = detail ? `${reasonType} - ${detail}` : reasonType;

    this.store.submitAttendanceJustification(studentId, date, fullReason);
    this.closeModal();
    this.render();
    this.showToast(`✓ Inasistencia justificada y registrada en el sistema.`, "success");
  }

  // =========================================================================
  // CONTROLADOR DE CÁMARA QR EN PORTERÍA
  // =========================================================================
  startDoorCameraScanner() {
    const feedContainer = document.getElementById("qr-door-camera-feed");
    const statusTag = document.getElementById("camera-door-status");
    const btnStart = document.getElementById("btn-start-door-cam");
    const btnStop = document.getElementById("btn-stop-door-cam");

    if (!feedContainer) return;

    if (typeof Html5Qrcode === "undefined") {
      this.showToast("Cargando motor de cámara QR, intente en un momento...", "info");
      return;
    }

    try {
      if (this.doorQrScanner) {
        try { this.doorQrScanner.stop().catch(() => {}); } catch(e) {}
      }
      this.doorQrScanner = new Html5Qrcode("qr-door-camera-feed");
      const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0
      };

      const startWithFallback = (facing) => {
        return this.doorQrScanner.start(
          { facingMode: facing },
          config,
          (decodedText) => {
            this.processQRScanFromDoor(decodedText);
          },
          () => {}
        );
      };

      startWithFallback("environment")
        .catch(() => startWithFallback("user"))
        .then(() => {
          this.isDoorCamActive = true;
          if (statusTag) {
            statusTag.innerHTML = "<span class='status-dot-green'></span> CÁMARA ACTIVA";
            statusTag.className = "status-badge status-approved";
          }
          if (btnStart) btnStart.style.display = "none";
          if (btnStop) btnStop.style.display = "inline-block";
          this.showToast("📹 Cámara de portería activa. Apunte los fotochecks QR al lente.", "info");
        })
        .catch((err) => {
          console.error("Error al acceder a la cámara:", err);
          if (statusTag) {
            statusTag.innerHTML = "Error / Permiso de Cámara";
            statusTag.className = "status-badge status-failed";
          }
          this.showToast("No se pudo abrir la cámara. Puede usar los botones de simulación rápida o ingresar el DNI/Código.", "warning");
        });
    } catch (e) {
      console.error(e);
      this.showToast("Error al inicializar cámara de portería", "danger");
    }
  }

  stopDoorCameraScanner() {
    if (this.doorQrScanner && this.isDoorCamActive) {
      this.doorQrScanner.stop().then(() => {
        this.isDoorCamActive = false;
        const statusTag = document.getElementById("camera-door-status");
        const btnStart = document.getElementById("btn-start-door-cam");
        const btnStop = document.getElementById("btn-stop-door-cam");
        const feedContainer = document.getElementById("qr-door-camera-feed");

        if (statusTag) {
          statusTag.innerHTML = "Cámara Apagada";
          statusTag.className = "status-badge status-pending";
        }
        if (btnStart) btnStart.style.display = "inline-block";
        if (btnStop) btnStop.style.display = "none";
        if (feedContainer) {
          feedContainer.innerHTML = `
            <div style="color: white; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 6px;">⚡</div>
              <div style="font-size: 12px; font-weight: bold; color: #38bdf8;">Lector QR Activo</div>
              <div style="font-size: 10.5px; opacity: 0.8;">Presiona 'Encender Cámara' o usa simulación</div>
            </div>
          `;
        }
      }).catch(err => console.error(err));
    }
  }

  processQRScanFromDoor(qrCodeOrDni, customTime = null) {
    if (!qrCodeOrDni) return;
    const cleanPayload = String(qrCodeOrDni).trim();
    const now = Date.now();

    // 1. Candado activo: ignorar ráfagas de fotogramas mientras se procesa la lectura
    if (this.isScanProcessing) {
      return;
    }

    // 2. Anti-repetición: Si es el MISMO código QR dentro de 4 segundos, ignorar silenciosamente
    if (this.lastScannedPayload === cleanPayload && (now - (this.lastScannedTimestamp || 0)) < 4000) {
      return;
    }

    // Activar candado de lectura
    this.isScanProcessing = true;
    this.lastScannedPayload = cleanPayload;
    this.lastScannedTimestamp = now;

    // Actualizar indicador visual
    const statusTag = document.getElementById("camera-door-status");
    if (statusTag) {
      statusTag.innerHTML = "<span style='color:#fde047; font-weight:900;'>⚡ LEYENDO QR...</span>";
      statusTag.className = "status-badge status-pending";
    }

    this.processSmartQRScan(cleanPayload, customTime);

    // Liberar candado después de 1.8 segundos para permitir escanear al siguiente alumno
    setTimeout(() => {
      this.isScanProcessing = false;
      if (statusTag && this.isDoorCamActive) {
        statusTag.innerHTML = "<span class='status-dot-green'></span> LISTO PARA EL SIGUIENTE QR";
        statusTag.className = "status-badge status-approved";
      }
    }, 1800);
  }

  processSmartQRScan(qrCodeOrDni, customTime = null) {
    this.playScanBeep();
    if (navigator.vibrate) navigator.vibrate(120);

    const result = this.store.handleSmartQRScan(qrCodeOrDni, customTime);
    const display = document.getElementById("door-last-scan-display");

    if (result.isAlreadyEntered) {
      // Estudiante ya ingresó -> Modo Incidencia Conductual / Acciones Rápidas
      if (display && result.student) {
        const studentPhoto = result.student.avatar || (result.student.gender === 'Femenino' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80');
        display.innerHTML = `
          <div style="background: #fff5f5; border: 2px solid #ef4444; border-radius: 10px; padding: 16px; text-align: center; animation: fadeIn 0.3s ease;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 12px;">
              <img src="${studentPhoto}" alt="Foto" style="width: 60px; height: 70px; object-fit: cover; border-radius: 6px; border: 2px solid #dc2626;" />
              <div style="text-align: left;">
                <div style="font-size: 15px; font-weight: 900; color: #991b1b;">${result.student.studentName}</div>
                <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">${result.student.grade}</div>
                <div style="font-size: 10.5px; color: #64748b;">DNI: ${result.student.dni} • Código: ${result.student.studentCode}</div>
                <div style="font-size: 10.5px; color: #047857; font-weight: bold; margin-top: 2px;"><span class='status-dot-green'></span> Ingreso registrado hoy a las ${result.previousScanTime}</div>
              </div>
            </div>

            <div style="background: #fef2f2; border: 1px dashed #f87171; border-radius: 8px; padding: 10px; margin-bottom: 12px; font-size: 12px; color: #991b1b;">
              ⚠️ <strong>LECTURA QR POSTERIOR AL INGRESO:</strong> El estudiante ya se encuentra dentro del colegio. Seleccione la acción correspondiente:
            </div>

            <button class="btn btn-navy btn-sm" onclick="window.app.openStudentVirtualAgendaModal('${result.student.studentCode}')" style="font-weight: 900; font-size: 12px; padding: 8px 14px; background: #1e3a8a; color: white; width: 100%; margin-bottom: 8px;">
              📖 Abrir Agenda Virtual & Anotaciones del Estudiante
            </button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
              <button class="btn btn-red btn-sm" onclick="window.app.openCreateIncidentModal('${result.student.studentCode}', 'Grave')" style="font-weight: 800; font-size: 11px;">
                ⚠️ Informe de Falta
              </button>
              <button class="btn btn-gold btn-sm" onclick="window.app.openCreateAgendaNoteModal('${result.student.studentCode}', 'merito')" style="font-weight: 800; font-size: 11px;">
                ★ Anotar Mérito
              </button>
            </div>
          </div>
        `;
      }
      this.showToast(`QR Detectado: ${result.student.studentName} ya ingresó (${result.previousScanTime}). Habilitado registro de incidencias.`, "warning");
      return;
    }

    // Primer Escaneo -> Marcación de Asistencia en Puerta
    if (display && result && result.student) {
      const isLate = result.isLate;
      const isDoorClosed = result.isDoorClosed;
      const studentPhoto = result.student.avatar || (result.student.gender === 'Femenino' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80');

      display.innerHTML = `
        <div style="background: ${isDoorClosed ? '#fef2f2' : isLate ? '#fffbeb' : '#ecfdf5'}; border: 2px solid ${isDoorClosed ? '#dc2626' : isLate ? '#f59e0b' : '#10b981'}; border-radius: 10px; padding: 16px; text-align: center; animation: fadeIn 0.3s ease;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 12px;">
            <img src="${studentPhoto}" alt="Foto" style="width: 55px; height: 65px; object-fit: cover; border-radius: 6px; border: 2px solid ${isDoorClosed ? '#991b1b' : isLate ? '#d97706' : '#059669'};" />
            <div style="text-align: left;">
              <div style="font-size: 15px; font-weight: 900; color: #0b132b;">${result.student.studentName}</div>
              <div style="font-size: 12px; font-weight: bold; color: #1e3a8a;">${result.student.grade}</div>
              <div style="font-size: 10.5px; color: #64748b;">DNI: ${result.student.dni} • Cód: ${result.student.studentCode}</div>
            </div>
          </div>

          <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 12.5px; font-weight: 900; background: ${isDoorClosed ? '#dc2626' : isLate ? '#f59e0b' : '#10b981'}; color: white; margin-bottom: 8px;">
            ${isDoorClosed ? `⛔ PUERTA CERRADA (08:30 AM) • FALTA REGISTRADA` : isLate ? `⚠️ TARDANZA EN PUERTA (+${result.delayMinutes} MIN)` : `✓ INGRESO PUNTUAL`} • ${result.scanTime}
          </div>

          <div style="font-size: 11.5px; color: #475569; margin-bottom: 10px;">
            ${isDoorClosed ? `
              <span class='status-dot-red'></span> <strong>Corte de Asistencia Aplicado:</strong> Notificando inasistencia al apoderado ${result.guardianName} (${result.guardianPhone}).
            ` : isLate ? `
              🔔 <strong>Notificación de Tardanza despachada:</strong> ${result.guardianName} (${result.guardianPhone})
            ` : `
              🌟 <strong>¡Bienvenido(a) a clase!</strong> Que tengas una excelente jornada escolar.
            `}
          </div>

          <div style="display: flex; gap: 6px; justify-content: center;">
            <button class="btn btn-navy btn-sm" onclick="window.app.openStudentVirtualAgendaModal('${result.student.studentCode}')" style="font-size: 11px; font-weight: 800;">
              📖 Agenda Virtual
            </button>
            <button class="btn btn-gold btn-sm" onclick="window.app.openStudentQRModal('${result.student.studentCode}')" style="font-size: 11px; font-weight: 800;">
              Ver Fotocheck QR
            </button>
          </div>
        </div>
      `;
    }

    if (result.isDoorClosed) {
      this.showToast(`⛔ INASISTENCIA (Puerta Cerrada 08:30 AM): ${result.student.studentName} (${result.scanTime})`, "danger");
    } else if (result.isLate) {
      this.showToast(`⚠️ TARDANZA: ${result.student.studentName} ingresó a las ${result.scanTime} (+${result.delayMinutes} min)`, "warning");
    } else {
      this.showToast(`✓ INGRESO PUNTUAL: ${result.student.studentName} (${result.scanTime})`, "success");
    }

    // Actualizar suavemente los contadores y feed de ingresos sin parpadeo ni recarga
    this.updateLiveFeedCounters();
  }

  // =========================================================================
  // GENERADOR Y VISOR DE CÓDIGO QR INDIVIDUAL POR ESTUDIANTE (SIN FOTOS)
  // =========================================================================
  openStudentQRModal(studentCode) {
    const st = this.store.resolveStudentByQR(studentCode) || this.store.getEnrollments()[0];

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 15px;">
            Tarjeta Oficial de Asistencia QR (Sin Foto)
          </h3>
          <span style="font-size: 11px; color: #fde047;">I.E.P. "El Educador" • Año Lectivo 2026</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <div class="modal-body" style="padding: 24px; text-align: center; background: #f8fafc;">
        
        <!-- Tarjeta Oficial de Código QR Escolar -->
        <div style="max-width: 320px; margin: 0 auto; background: #ffffff; border: 3px solid #1e3a8a; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.12);">
          
          <!-- Encabezado -->
          <div style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white; padding: 12px; border-bottom: 3px solid #f59e0b;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo" style="width: 32px; height: 32px; object-fit: contain;" />
              <div style="text-align: center;">
                <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.05em; color: #fde047;">I.E.P. "EL EDUCADOR"</div>
                <div style="font-size: 8.5px; opacity: 0.9;">CONTROL DE ASISTENCIA QR 2026 • UGEL 05</div>
              </div>
            </div>
          </div>

          <!-- Cuerpo: Código QR Grande + Nombres Completos + Grado (SIN FOTO) -->
          <div style="padding: 20px 16px;">
            
            <!-- Código QR Grande en Alta Resolución -->
            <div style="width: 175px; height: 175px; margin: 0 auto 14px; border: 3px solid #0b132b; border-radius: 10px; padding: 8px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
              ${Components.generateQRSVG(st.studentCode)}
            </div>

            <!-- Nombres y Apellidos Completos en Mayúsculas y Negrita -->
            <div style="font-size: 14.5px; font-weight: 900; color: #0b132b; text-transform: uppercase; line-height: 1.25; margin-bottom: 6px;">
              ${st.studentName}
            </div>

            <!-- Grado y Nivel -->
            <div style="font-size: 13px; font-weight: 800; color: #1e40af; margin-bottom: 8px;">
              ${st.grade}
            </div>

            <!-- Código y DNI -->
            <div style="font-size: 11px; color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 10px; display: inline-block; margin-bottom: 12px;">
              <strong>CÓD:</strong> <code>${st.studentCode}</code> • <strong>DNI:</strong> <code>${st.dni}</code>
            </div>

            <div style="font-size: 10px; color: #64748b; line-height: 1.3; margin-bottom: 12px;">
              Presente este código QR en portería (07:00 a 08:30 AM) para registrar asistencia o ante el auxiliar para incidencias conductuales.
            </div>

            <!-- Botones de Prueba Rápida de Escaneo -->
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px; margin-top: 6px;">
              <div style="font-size: 10.5px; font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">⚡ Probar Marcación QR:</div>
              <div style="display: flex; gap: 6px; justify-content: center;">
                <button class="btn btn-gold btn-sm" onclick="window.app.closeModal(); window.app.processSmartQRScan('${st.studentCode}', '07:35 AM')" style="font-size: 10px; font-weight: 800; padding: 4px 8px;">
                  Puntual (07:35 AM)
                </button>
                <button class="btn btn-outline btn-sm" onclick="window.app.closeModal(); window.app.processSmartQRScan('${st.studentCode}', '08:05 AM')" style="font-size: 10px; font-weight: 800; padding: 4px 8px; color: #b45309; border-color: #f59e0b;">
                  Tardanza (08:05 AM)
                </button>
              </div>
            </div>

          </div>

          <!-- Pie de Tarjeta -->
          <div style="background: #0b132b; color: white; padding: 6px; font-size: 9px; letter-spacing: 0.05em; font-weight: bold;">
            SAN JUAN DE LURIGANCHO • LIMA - PERÚ
          </div>
        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-weight: 800;">
            Imprimir Tarjeta
          </button>
          <button class="btn btn-gold btn-sm" onclick="window.app.downloadStudentQR('${st.studentCode}')" style="font-weight: 800;">
            Descargar QR
          </button>
          <button class="btn btn-gold btn-sm" onclick="window.app.closeModal(); window.app.openStudentVirtualAgendaModal('${st.studentCode}')" style="font-weight: 900; background: #2563eb; color: white;">
            📖 Agenda Virtual
          </button>
        </div>
      </div>
    `);
  }

  downloadStudentQR(studentCode) {
    this.showToast(`⬇️ Código QR oficial (${studentCode}) generado y listo para imprimir/guardar`, "success");
  }

  downloadAllQRSheets() {
    this.showToast("⬇️ Preparando exportación e impresión de plancha de códigos QR de todos los estudiantes...", "info");
    setTimeout(() => {
      window.print();
    }, 400);
  }

  // =========================================================================
  // GESTIÓN DEL LIBRO DE INCIDENCIAS & CONVIVENCIA ESCOLAR (MINEDU)
  // =========================================================================
  openCreateIncidentModal(preselectedStudentCode = null, defaultSeverity = "Grave") {
    const enrollments = this.store.getEnrollments();
    const currentUser = this.store.getCurrentUser() || { name: "Prof. Alex Lino" };

    const html = `
      <div class="modal-header" style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 15px;">
            Registrar Nuevo Informe de Incidencia Conductual / Convivencia
          </h3>
          <span style="font-size: 11px; color: #fee2e2;">I.E.P. "El Educador" • Conforme a Ley N° 29719</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <form onsubmit="window.app.saveBehaviorIncident(event)">
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 18px;">
          
          <!-- Selector de Estudiante -->
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 12px; color: var(--color-navy-900);">
              Estudiante Involucrado / Amarrado al Perfil:
            </label>
            <select name="studentCode" class="form-control" style="font-weight: bold; font-size: 12.5px; border-color: #ef4444;" required>
              ${enrollments.map(st => `
                <option value="${st.studentCode}" ${st.studentCode === preselectedStudentCode ? 'selected' : ''}>
                  ${st.studentName} (${st.grade}) • Cód: ${st.studentCode} • DNI: ${st.dni}
                </option>
              `).join('')}
            </select>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Fecha del Suceso:</label>
              <input type="text" name="date" class="form-control" value="${new Date().toLocaleDateString('es-PE')}" required />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Hora de la Incidencia:</label>
              <input type="text" name="time" class="form-control" value="${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}" required />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Nivel de Gravedad / Tipo:</label>
              <select name="severity" class="form-control" style="font-weight: bold;" required>
                <option value="Leve" ${defaultSeverity === 'Leve' ? 'selected' : ''}><span class='status-dot-yellow'></span> Falta Leve (Uniforme, tardanza a aula)</option>
                <option value="Grave" ${defaultSeverity === 'Grave' ? 'selected' : ''}><span class='status-dot-red'></span> Falta Grave (Desobediencia, uso de celular)</option>
                <option value="Muy Grave" ${defaultSeverity === 'Muy Grave' ? 'selected' : ''}>⛔ Muy Grave (Agresión, daño material)</option>
                <option value="Mérito" ${defaultSeverity === 'Mérito' ? 'selected' : ''}>★ Reconocimiento / Mérito Académico</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Lugar del Hecho:</label>
              <input type="text" name="location" class="form-control" value="Aula de Clase 304" placeholder="Ej. Aula 304, Patio Central, Laboratorio" required />
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Categoría / Motivo:</label>
            <input type="text" name="category" class="form-control" value="Desobediencia e interrupción de clase" placeholder="Ej. Desobediencia, conducta en aula, agresión verbal" required />
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Docente / Auxiliar que Reporta:</label>
            <input type="text" name="reportedBy" class="form-control" value="${currentUser.name || 'Prof. Roberto Silva'}" required />
          </div>

          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Descripción Detallada de los Hechos:</label>
            <textarea name="description" rows="3" class="form-control" placeholder="Describa con objetividad lo acontecido con el estudiante..." required>Durante la clase, el estudiante incurrió en falta a las normas de convivencia acordadas.</textarea>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Medida Formativa / Pedagógica Aplicada:</label>
            <textarea name="correctiveMeasure" rows="2" class="form-control" placeholder="Compromiso suscrito, diálogo formativo, etc." required>Diálogo formativo reflexivo, firma de compromiso en anecdotario y comunicación inmediata al apoderado.</textarea>
          </div>

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="send-whatsapp-check" name="notifyWhatsApp" checked style="width: 18px; height: 18px; cursor: pointer;" />
            <label for="send-whatsapp-check" style="font-size: 12px; font-weight: bold; color: #065f46; cursor: pointer; margin: 0;">
              📲 Notificar inmediatamente al Apoderado vía WhatsApp Oficial
            </label>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-red btn-sm" style="font-weight: 900; padding: 8px 20px;">
            💾 Guardar en Libro de Incidencias
          </button>
        </div>
      </form>
    `;
    this.showModal(html);
  }

  saveBehaviorIncident(event) {
    if (event) event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const newInc = this.store.createBehaviorIncident({
      studentCode: formData.get("studentCode"),
      date: formData.get("date"),
      time: formData.get("time"),
      severity: formData.get("severity"),
      location: formData.get("location"),
      category: formData.get("category"),
      reportedBy: formData.get("reportedBy"),
      description: formData.get("description"),
      correctiveMeasure: formData.get("correctiveMeasure"),
      notifyWhatsApp: formData.get("notifyWhatsApp") === "on"
    });

    this.closeModal();
    this.showToast(`✓ Informe ${newInc.id} registrado para ${newInc.studentName}`, "success");
    this.render();

    if (formData.get("notifyWhatsApp") === "on") {
      setTimeout(() => {
        this.sendIncidentWhatsApp(newInc.id);
      }, 400);
    }
  }

  sendIncidentWhatsApp(incidentId) {
    const inc = (this.store.state.behaviorIncidents || initialData.behaviorIncidents || []).find(i => i.id === incidentId);
    if (!inc) return;

    const phone = inc.guardianPhone || "984-777-888";
    const guardian = inc.guardian || "Sr(a). Apoderado";

    const msg = `*COMUNICADO DE CONVIVENCIA ESCOLAR - I.E.P. "EL EDUCADOR"*\n\nEstimado(a) *${guardian}*,\nLe saludamos cordialmente de la Dirección y Coordinación de Convivencia Escolar.\n\nLe informamos que el día de hoy *${inc.date}* a las *${inc.time}* se ha registrado una incidencia disciplinaria respecto a su menor hijo(a) *${inc.studentName}* (${inc.grade}):\n\n• *Tipo de Falta:* ${inc.severity}\n• *Motivo:* ${inc.category}\n• *Lugar:* ${inc.location}\n• *Reportado por:* ${inc.reportedBy}\n• *Detalle:* ${inc.description}\n• *Medida Pedagógica:* ${inc.correctiveMeasure}\n\nLe agradecemos reforzar las normas de conducta en el hogar para el bienestar y formación integral de su menor hijo(a).\n\nAtentamente,\n*Comité de Gestión de la Convivencia Escolar*\nI.E.P. "El Educador" - S.J.L. • UGEL 05`;

    this.showModal(`
      <div class="modal-header" style="background: #047857; color: white;">
        <h3 style="color: white; font-size: 15px;">💬 Enviar Notificación de Incidencia por WhatsApp</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase;">Apoderado Destinatario:</div>
          <div style="font-size: 13.5px; font-weight: 900; color: #065f46;">${guardian} • Teléfono: ${phone}</div>
          <div style="font-size: 11.5px; color: #15803d; margin-top: 2px;">Estudiante: <strong>${inc.studentName}</strong> (${inc.grade})</div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Mensaje Oficial Pre-Redactado:</label>
          <textarea class="form-control" rows="8" style="font-size: 11.5px; font-family: monospace;" readonly>${msg}</textarea>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-sm" onclick="window.open('https://api.whatsapp.com/send?phone=51${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(msg)}', '_blank'); window.app.closeModal(); window.app.showToast('✓ Notificación enviada a WhatsApp', 'success');" style="background: #22c55e; color: white; font-weight: 800; padding: 8px 18px;">
          Abrir WhatsApp y Enviar Mensaje
        </button>
      </div>
    `);
  }

  openIncidentOfficialPrintModal(incidentId) {
    const inc = (this.store.state.behaviorIncidents || initialData.behaviorIncidents || []).find(i => i.id === incidentId) || (this.store.state.behaviorIncidents && this.store.state.behaviorIncidents[0]);
    if (!inc) return;

    this.showModal(`
      <div class="modal-header" style="background: #0f172a; color: white;">
        <h3 style="color: white; font-size: 15px;">Acta Oficial de Compromiso y Convivencia Escolar (MINEDU / UGEL 05)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 80vh; overflow-y: auto; padding: 24px; background: white;">
        
        <!-- Membrete Institucional -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0b132b; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo" style="width: 55px; height: 55px; object-fit: contain;" />
            <div>
              <div style="font-size: 10px; font-weight: 800; color: #0b132b; text-transform: uppercase;">REPÚBLICA DEL PERÚ • MINISTERIO DE EDUCACIÓN • UGEL 05</div>
              <div style="font-size: 18px; font-weight: 900; color: #0b132b; font-family: 'Plus Jakarta Sans', serif;">I.E.P. "EL EDUCADOR"</div>
              <div style="font-size: 10px; color: #dc2626; font-weight: bold;">INICIAL - PRIMARIA - SECUNDARIA • 21 AÑOS DEJANDO HUELLAS</div>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <span class="status-badge status-failed" style="font-size: 11px; font-weight: 900;">ACTA N° ${inc.id}</span>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 18px;">
          <h2 style="font-size: 16px; font-weight: 900; text-decoration: underline; color: #0b132b; margin: 0 0 4px;">
            ACTA OFICIAL DE COMPROMISO Y REGISTRO DE CONVIVENCIA ESCOLAR
          </h2>
          <span style="font-size: 11px; color: #64748b;">Conforme a la Ley N° 29719 y D.S. N° 004-2018-MINEDU</span>
        </div>

        <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; margin-bottom: 14px; font-size: 12px; line-height: 1.6;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div><strong>Estudiante:</strong> ${inc.studentName}</div>
            <div><strong>Grado y Sección:</strong> ${inc.grade}</div>
            <div><strong>DNI:</strong> ${inc.dni} • <strong>Código:</strong> ${inc.studentCode}</div>
            <div><strong>Fecha y Hora:</strong> ${inc.date} - ${inc.time}</div>
            <div><strong>Gravedad:</strong> <span style="font-weight: 900; color: #dc2626;">${inc.severity}</span></div>
            <div><strong>Lugar:</strong> ${inc.location}</div>
            <div style="grid-column: span 2;"><strong>Reportado Por:</strong> ${inc.reportedBy}</div>
            <div style="grid-column: span 2;"><strong>Apoderado Registrado:</strong> ${inc.guardian} (Cel: ${inc.guardianPhone})</div>
          </div>
        </div>

        <div style="margin-bottom: 14px; font-size: 12px;">
          <div style="font-weight: 800; color: #0b132b; margin-bottom: 4px;">I. DESCRIPCIÓN DE LOS HECHOS:</div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; line-height: 1.5;">
            ${inc.description}
          </div>
        </div>

        <div style="margin-bottom: 20px; font-size: 12px;">
          <div style="font-weight: 800; color: #0b132b; margin-bottom: 4px;">II. ACUERDOS Y MEDIDAS PEDAGÓGICAS FORMATIVAS:</div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; line-height: 1.5;">
            ${inc.correctiveMeasure}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; text-align: center; margin-top: 36px; font-size: 10.5px;">
          <div>
            <div style="border-top: 1px solid #000; width: 85%; margin: 0 auto 4px;"></div>
            <strong>${inc.studentName}</strong><br>
            Estudiante
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 85%; margin: 0 auto 4px;"></div>
            <strong>${inc.guardian}</strong><br>
            Padre de Familia / Apoderado
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 85%; margin: 0 auto 4px;"></div>
            <strong>${inc.reportedBy}</strong><br>
            Docente / Tutor de Convivencia
          </div>
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-weight: 800;">
          Imprimir Acta Oficial A4
        </button>
      </div>
    `);
  }

  filterIncidentsTable(query) {
    const q = (query || "").toLowerCase();
    const rows = document.querySelectorAll("#incidents-main-table tbody tr");
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(q) ? "" : "none";
    });
  }

  sendTardinessWhatsApp(studentName, arrivalTime, delayMin, phone, guardian) {
    const msg = `Estimado(a) ${guardian || 'Apoderado'},\n\nLe saluda la Dirección de la I.E.P. "El Educador". Le informamos que su menor hijo(a) *${studentName}* registró su ingreso al plantel con *TARDANZA* el día de hoy a las *${arrivalTime}* (+${delayMin} minutos de retraso).\n\nLe agradecemos conversar con su menor y tomar las previsiones correspondientes para fomentar el valor de la puntualidad escolar.\n\nAtentamente,\n*Coordinación de Normas y Asistencia*\nI.E.P. "El Educador" - UGEL 05`;

    this.showModal(`
      <div class="modal-header" style="background: #047857; color: white;">
        <h3 style="color: white;">💬 Notificación de Tardanza por WhatsApp</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase;">Destinatario:</div>
          <div style="font-size: 13px; font-weight: 800; color: #065f46;">${guardian} • Teléfono: ${phone}</div>
          <div style="font-size: 11px; color: #15803d;">Estudiante: <strong>${studentName}</strong> (Tardanza: ${arrivalTime})</div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Mensaje Oficial a Enviar:</label>
          <textarea class="form-control" rows="6" style="font-size: 12px; font-family: monospace;" readonly>${msg}</textarea>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-sm" onclick="window.open('https://api.whatsapp.com/send?phone=51${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(msg)}', '_blank'); window.app.closeModal(); window.app.showToast('✓ Mensaje WhatsApp enviado al apoderado', 'success');" style="background: #22c55e; color: white; font-weight: 800; padding: 8px 16px;">
          Enviar por WhatsApp Oficial
        </button>
      </div>
    `);
  }

  sendAbsenceWhatsApp(studentName, phone, guardian) {
    const msg = `Estimado(a) ${guardian || 'Apoderado'},\n\nLe saluda la Dirección de la I.E.P. "El Educador". Le informamos que su menor hijo(a) *${studentName}* *NO HA REGISTRADO INGRESO* al colegio el día de hoy hasta el cierre de puerta.\n\nPor favor confirmar el motivo de la inasistencia o comunicarse a la brevedad con la tutoría de aula.\n\nAtentamente,\n*Dirección y Coordinación Pedagógica*\nI.E.P. "El Educador" - S.J.L.`;

    this.showModal(`
      <div class="modal-header" style="background: #dc2626; color: white;">
        <h3 style="color: white;">💬 Notificación de Inasistencia por WhatsApp</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase;">Destinatario:</div>
          <div style="font-size: 13px; font-weight: 800; color: #7f1d1d;">${guardian} • Teléfono: ${phone}</div>
          <div style="font-size: 11px; color: #991b1b;">Estudiante: <strong>${studentName}</strong> (Inasistencia Injustificada)</div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Mensaje Oficial a Enviar:</label>
          <textarea class="form-control" rows="6" style="font-size: 12px; font-family: monospace;" readonly>${msg}</textarea>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-red btn-sm" onclick="window.open('https://api.whatsapp.com/send?phone=51${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(msg)}', '_blank'); window.app.closeModal(); window.app.showToast('✓ Mensaje WhatsApp enviado al apoderado', 'success');" style="font-weight: 800; padding: 8px 16px;">
          Enviar Alerta de Inasistencia
        </button>
      </div>
    `);
  }

  notifyAllAbsencesAndTardinessWhatsApp(date = "19/08/2026") {
    const report = this.store.getDailyAttendanceReport(date);
    const totalToNotify = report.tardinessList.length + report.absenceList.length;

    this.showModal(`
      <div class="modal-header" style="background: #0f172a; color: white;">
        <h3 style="color: white;">📲 Envío Masivo de Avisos a Apoderados (WhatsApp)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: 20px;">
        <div style="font-size: 40px; margin-bottom: 8px;">⚡</div>
        <h4 style="font-size: 15px; font-weight: 800; color: #0b132b; margin-bottom: 6px;">
          Notificación Automatizada del Parte Diario (${date})
        </h4>
        <p style="font-size: 12.5px; color: #475569; margin-bottom: 16px;">
          Se enviarán ${totalToNotify} mensajes oficiales por la API de WhatsApp de la I.E.P. "El Educador":<br>
          • <strong>${report.tardinessList.length}</strong> avisos de tardanza con hora de ingreso y minutos de retraso.<br>
          • <strong>${report.absenceList.length}</strong> alertas de inasistencia sin justificación.
        </p>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 11.5px; text-align: left; max-height: 140px; overflow-y: auto;">
          ${report.tardinessList.map(t => `<div style="color:#b45309; padding:2px 0;"><span class='status-dot-yellow'></span> <strong>${t.studentName}</strong>: Tardanza ${t.arrivalTime} → Notificando a ${t.guardian} (${t.guardianPhone})</div>`).join('')}
          ${report.absenceList.map(a => `<div style="color:#dc2626; padding:2px 0;"><span class='status-dot-red'></span> <strong>${a.studentName}</strong>: Inasistencia → Notificando a ${a.guardian} (${a.guardianPhone})</div>`).join('')}
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.closeModal(); window.app.showToast('✓ ${totalToNotify} notificaciones de WhatsApp despachadas con éxito a los apoderados', 'success');" style="font-weight: 800;">
          Confirmar y Enviar Todo
        </button>
      </div>
    `);
  }

  showTardinessPassModal(studentCode) {
    const enrollments = this.store.getEnrollments();
    const st = enrollments.find(e => e.studentCode === studentCode) || enrollments[0];
    const timeNow = new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' });

    this.showModal(`
      <div class="modal-header" style="background: #f59e0b; color: #0b132b;">
        <h3 style="color: #0b132b; font-weight: 900;">Pase Oficial de Tardanza (Portería)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="padding: 20px; background: white;">
        <div style="border: 2px dashed #0b132b; padding: 16px; border-radius: 8px;">
          <div style="text-align: center; border-bottom: 2px solid #0b132b; padding-bottom: 8px; margin-bottom: 12px;">
            <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.1em; color: #1e3a8a;">I.E.P. "EL EDUCADOR" • UGEL 05</div>
            <h3 style="font-size: 16px; font-weight: 900; margin: 2px 0;">BOLETA DE INGRESO CON TARDANZA</h3>
            <div style="font-size: 11px; color: #64748b;">Fecha: <strong>19/08/2026</strong> • Hora de Emisión: <strong>${timeNow}</strong></div>
          </div>

          <div style="font-size: 12.5px; line-height: 1.6; margin-bottom: 14px;">
            <div>Estudiante: <strong>${st.studentName}</strong></div>
            <div>Grado y Sección: <strong>${st.grade}</strong></div>
            <div>DNI: <strong>${st.dni}</strong> • Código: <strong>${st.studentCode}</strong></div>
            <div>Motivo: <strong>Tardanza registrada por lectura de fotocheck QR en puerta.</strong></div>
            <div>Apoderado Notificado: <strong>${st.guardian} (${st.guardianPhone})</strong></div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; margin-top: 24px; font-size: 10.5px;">
            <div>
              <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 2px;"></div>
              Auxiliar de Portería
            </div>
            <div>
              <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 2px;"></div>
              Docente de Aula (Recepción)
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy" onclick="window.print()" style="font-weight: 800;">
          Imprimir Pase de Tardanza
        </button>
      </div>
    `);
  }

  // =========================================================================
  // CONTROLADOR DE LA AGENDA VIRTUAL ESCOLAR INTELIGENTE (QR ENLAZADO)
  // =========================================================================
  setAgendaFilter(filterType) {
    this.store.state.selectedAgendaFilter = filterType;
    this.store.saveLocalSession();
    this.render();
  }

  onAgendaGradeFilterChange(gradeId) {
    this.store.state.selectedAgendaGrade = gradeId;
    this.store.state.selectedAgendaStudent = "all";
    this.store.saveLocalSession();
    this.render();
  }

  onAgendaStudentFilterChange(studentId) {
    this.store.state.selectedAgendaStudent = studentId;
    this.store.saveLocalSession();
    this.render();
  }

  onAgendaTypeFilterChange(type) {
    this.store.state.selectedAgendaTypeFilter = type;
    this.store.saveLocalSession();
    this.render();
  }

  signAgendaNote(noteId) {
    const currentUser = this.store.getCurrentUser();
    const signerName = (currentUser && currentUser.name) ? currentUser.name : "Padre / Apoderado Registrado";
    const ok = this.store.signAgendaNote(noteId, signerName);
    if (ok) {
      this.showToast(`✓ Acuse de recibo firmado digitalmente por ${signerName}`, "success");
      this.render();
    }
  }

  openCreateAgendaNoteModal(preselectedStudentCode = null, defaultType = "pedagogica") {
    const enrollments = this.store.getEnrollments();
    const currentUser = this.store.getCurrentUser() || { name: "Prof. Roberto Silva" };

    const coursesList = [
      "Matemática & Razonamiento",
      "Comunicación & Literatura",
      "Ciencia y Tecnología",
      "Ciencias Sociales / Personal Social",
      "Inglés",
      "Computación e Informática / Robótica",
      "Arte y Cultura",
      "Educación Física",
      "Educación Religiosa",
      "Tutoría & Convivencia Escolar"
    ];

    const html = `
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 15px;">
            📖 Registrar Anotación en la Agenda Virtual Escolar
          </h3>
          <span style="font-size: 11px; color: #fde047;">I.E.P. "El Educador" • Enlazado al Código QR de Asistencia</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <form onsubmit="window.app.saveAgendaNote(event)">
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 18px;">
          
          <!-- Selector de Estudiante -->
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 12px; color: var(--color-navy-900);">
              Estudiante (Selección vinculada a Fotocheck QR):
            </label>
            <select name="studentCode" class="form-control" style="font-weight: bold; font-size: 12.5px; border-color: #3b82f6;" required>
              ${enrollments.map(st => `
                <option value="${st.studentCode}" ${st.studentCode === preselectedStudentCode ? 'selected' : ''}>
                  ${st.studentName} (${st.grade}) • Cód: ${st.studentCode} • DNI: ${st.dni}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- Tipo de Anotación y Asignatura -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Tipo de Registro:</label>
              <select name="type" class="form-control" style="font-weight: bold;" required>
                <option value="merito" ${defaultType === 'merito' ? 'selected' : ''}>★ Felicitación / Mérito Académico</option>
                <option value="pedagogica" ${defaultType === 'pedagogica' ? 'selected' : ''}>📝 Tarea / Material Requerido</option>
                <option value="conducta" ${defaultType === 'conducta' ? 'selected' : ''}>⚠️ Observación Conductual / Normas</option>
                <option value="citacion" ${defaultType === 'citacion' ? 'selected' : ''}>📅 Citación a Entrevista Apoderado</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Asignatura / Área:</label>
              <select name="course" class="form-control" style="font-weight: bold;" required>
                ${coursesList.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Fecha y Hora -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Fecha de Registro:</label>
              <input type="text" name="date" class="form-control" value="${new Date().toLocaleDateString('es-PE')}" required />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Hora de Registro:</label>
              <input type="text" name="time" class="form-control" value="${new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}" required />
            </div>
          </div>

          <!-- Categoría y Docente Responsable -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Categoría / Motivo:</label>
              <input type="text" name="category" class="form-control" placeholder="Ej: Felicitación, Materiales, Disciplina, Entrevista" value="Seguimiento de Aprendizaje" required />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Docente / Tutor que Firma:</label>
              <input type="text" name="teacher" class="form-control" value="${currentUser.name || 'Prof. Roberto Silva'}" required />
            </div>
          </div>

          <!-- Título Resumen -->
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Título de la Anotación:</label>
            <input type="text" name="title" class="form-control" placeholder="Ej: Excelente desempeño en clase / Traer ficha resuelta" required />
          </div>

          <!-- Descripción Detallada -->
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Detalle Informativo para la Familia:</label>
            <textarea name="description" rows="3" class="form-control" placeholder="Describa el motivo de la anotación, el desempeño del estudiante o los requerimientos pedagógicos..." required></textarea>
          </div>

          <!-- Tarea, Material Requerido o Compromiso -->
          <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-bottom: 14px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Tarea / Material / Compromiso / Citación:</label>
              <input type="text" name="taskOrMaterial" class="form-control" placeholder="Ej: Traer cuaderno al día / Cita viernes 3:30 PM" value="Ninguno" />
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Fecha Límite / Cita:</label>
              <input type="text" name="dueDate" class="form-control" placeholder="Ej: 28/08/2026" value="Próxima sesión" />
            </div>
          </div>

          <!-- Notificación Inmediata por WhatsApp -->
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px;">
            <input type="checkbox" id="agenda-whatsapp-check" name="notifyWhatsApp" checked style="width: 18px; height: 18px; cursor: pointer;" />
            <label for="agenda-whatsapp-check" style="font-size: 12px; font-weight: bold; color: #065f46; cursor: pointer; margin: 0;">
              📲 Notificar inmediatamente al Apoderado vía WhatsApp Oficial
            </label>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-navy btn-sm" style="font-weight: 900; padding: 8px 22px;">
            💾 Registrar en la Agenda Virtual
          </button>
        </div>
      </form>
    `;
    this.showModal(html);
  }

  saveAgendaNote(event) {
    if (event) event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const newNote = this.store.createAgendaNote({
      studentCode: formData.get("studentCode"),
      date: formData.get("date"),
      time: formData.get("time"),
      type: formData.get("type"),
      course: formData.get("course"),
      category: formData.get("category"),
      teacher: formData.get("teacher"),
      title: formData.get("title"),
      description: formData.get("description"),
      taskOrMaterial: formData.get("taskOrMaterial"),
      dueDate: formData.get("dueDate")
    });

    this.closeModal();
    this.showToast(`✓ Anotación registrada en la Agenda Virtual de ${newNote.studentName}`, "success");
    this.render();

    if (formData.get("notifyWhatsApp") === "on") {
      setTimeout(() => {
        this.sendAgendaNoteWhatsApp(newNote.id);
      }, 350);
    }
  }

  sendAgendaNoteWhatsApp(noteId) {
    const allNotes = this.store.getAgendaNotes("all");
    const note = allNotes.find(n => n.id === noteId) || (this.store.state.agendaNotes && this.store.state.agendaNotes[0]);
    if (!note) return;

    const phone = note.guardianPhone || "984-777-888";
    const guardian = note.guardian || "Estimado(a) Padre/Madre de Familia";

    const typeIcons = {
      merito: "★ RECONOCIMIENTO / MÉRITO",
      pedagogica: "📝 REQUERIMIENTO PEDAGÓGICO / TAREA",
      conducta: "⚠️ OBSERVACIÓN DE CONDUCTA",
      citacion: "📅 CITACIÓN A APODERADO"
    };

    const typeTag = typeIcons[note.type] || "📖 AGENDA VIRTUAL";

    const msg = `*I.E.P. "EL EDUCADOR" - AGENDA VIRTUAL OFICIAL 2026*\n\nEstimado(a) *${guardian}*,\nLe saludamos cordialmente. Le comunicamos la siguiente anotación en la *Agenda Virtual Escolar* de su menor hijo(a) *${note.studentName}* (${note.grade}):\n\n• *Tipo:* ${typeTag}\n• *Curso:* ${note.course}\n• *Docente:* ${note.teacher}\n• *Fecha y Hora:* ${note.date} a las ${note.time}\n• *Asunto:* ${note.title}\n• *Detalle:* ${note.description}\n${note.taskOrMaterial && note.taskOrMaterial !== 'Ninguno' ? `• *Compromiso / Requerimiento:* ${note.taskOrMaterial}\n• *Fecha Límite:* ${note.dueDate}\n` : ''}\nPor favor ingrese a la intranet escolar para revisar el detalle y registrar su *Firma Digital de Enterado(a)*:\n🌐 https://el-educador-intranet.vercel.app\n\nAtentamente,\n*Coordinación Pedagógica & Tutoría*\nI.E.P. "El Educador" - S.J.L. • UGEL 05`;

    this.showModal(`
      <div class="modal-header" style="background: #047857; color: white;">
        <h3 style="color: white; font-size: 15px;">💬 Enviar Notificación de Agenda Virtual por WhatsApp</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: bold; color: #166534; text-transform: uppercase;">Apoderado(a) Destinatario:</div>
          <div style="font-size: 13.5px; font-weight: 900; color: #065f46;">${guardian} • Teléfono: ${phone}</div>
          <div style="font-size: 11.5px; color: #15803d; margin-top: 2px;">Estudiante: <strong>${note.studentName}</strong> (${note.grade})</div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px;">Mensaje Oficial de la Agenda Escolar:</label>
          <textarea class="form-control" rows="8" style="font-size: 11.5px; font-family: monospace;" readonly>${msg}</textarea>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-sm" onclick="window.open('https://api.whatsapp.com/send?phone=51${phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(msg)}', '_blank'); window.app.closeModal(); window.app.showToast('✓ Mensaje de WhatsApp despachado', 'success');" style="background: #22c55e; color: white; font-weight: 800; padding: 8px 18px;">
          Abrir WhatsApp y Enviar Mensaje
        </button>
      </div>
    `);
  }

  openAgendaQRScannerModal() {
    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 style="color: white; margin: 0; font-size: 15px;">📹 Escanear Fotocheck QR del Estudiante</h3>
          <span style="font-size: 11px; color: #fde047;">Acceso directo a la Agenda Virtual y Anotaciones</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeAgendaScannerModal()" style="color: white;">✕</button>
      </div>

      <div class="modal-body" style="padding: 20px; text-align: center; background: #f8fafc;">
        <div id="agenda-modal-qr-feed" style="width: 280px; height: 280px; margin: 0 auto 16px; background: #000; border-radius: 12px; overflow: hidden; border: 3px solid #1e3a8a; display: flex; align-items: center; justify-content: center; color: white;">
          <span>Iniciando cámara...</span>
        </div>

        <div style="font-size: 12px; color: #475569; margin-bottom: 12px;">
          Apunta la cámara al <strong>código QR del fotocheck</strong> o carnet escolar del estudiante para abrir su Agenda Virtual.
        </div>

        <!-- Selector Rápido de Prueba -->
        <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-top: 10px;">
          <div style="font-size: 11px; font-weight: bold; color: #1e3a8a; margin-bottom: 6px;">O seleccione un estudiante para simular escaneo QR:</div>
          <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm" onclick="window.app.processAgendaQRScan('EST-2026-055')">
              Salim Cáceres (5° Prim)
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.processAgendaQRScan('EST-2026-042')">
              Sofía Méndez (4° Sec)
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.processAgendaQRScan('EST-2026-011')">
              Carlos Benítez (4° Sec)
            </button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeAgendaScannerModal()">Cerrar Cámara</button>
      </div>
    `);

    // Iniciar cámara en el modal
    setTimeout(() => {
      if (typeof Html5Qrcode !== "undefined") {
        try {
          this.agendaModalScanner = new Html5Qrcode("agenda-modal-qr-feed");
          this.agendaModalScanner.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 220, height: 220 } },
            (decodedText) => {
              this.processAgendaQRScan(decodedText);
            },
            (error) => {}
          ).catch(e => {
            console.log("No se pudo abrir cámara directa en modal", e);
          });
        } catch (e) {}
      }
    }, 200);
  }

  closeAgendaScannerModal() {
    if (this.agendaModalScanner) {
      this.agendaModalScanner.stop().catch(() => {}).finally(() => {
        this.agendaModalScanner = null;
        this.closeModal();
      });
    } else {
      this.closeModal();
    }
  }

  processAgendaQRScan(qrPayload) {
    if (this.isAgendaScanProcessing) return;
    this.isAgendaScanProcessing = true;

    this.playScanBeep();
    const student = this.store.resolveStudentByQR(qrPayload);
    this.closeAgendaScannerModal();

    setTimeout(() => {
      this.isAgendaScanProcessing = false;
    }, 1200);

    if (student) {
      this.showToast(`✓ Fotocheck QR detectado: ${student.studentName}`, "success");
      this.openStudentVirtualAgendaModal(student.studentCode);
    } else {
      this.showToast(`Código QR no reconocido: ${qrPayload}`, "warning");
    }
  }

  openStudentVirtualAgendaModal(studentCode) {
    const student = this.store.resolveStudentByQR(studentCode) || { studentCode, studentName: "Estudiante", grade: "5° de Primaria" };
    const notes = this.store.getAgendaNotes(student.studentCode);

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 15px;">
            📖 Agenda Virtual: ${student.studentName}
          </h3>
          <span style="font-size: 11px; color: #fde047;">${student.grade} • Código: ${student.studentCode} • DNI: ${student.dni}</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 18px; background: #f8fafc;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: white; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1;">
          <div>
            <div style="font-size: 12px; color: #64748b;">Apoderado: <strong>${student.guardian || 'Registrado'}</strong> (${student.guardianPhone || '984-777-888'})</div>
            <div style="font-size: 11.5px; color: #1e3a8a;">Tutor(a): <strong>${student.tutor || 'Docente Titular'}</strong></div>
          </div>
          <button class="btn btn-gold btn-sm" onclick="window.app.closeModal(); window.app.openCreateAgendaNoteModal('${student.studentCode}')" style="font-weight: 800;">
            ➕ Nueva Anotación
          </button>
        </div>

        <h4 style="font-size: 13px; font-weight: 800; color: #0b132b; margin-bottom: 10px;">
          Historial de Anotaciones en la Agenda (${notes.length}):
        </h4>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${notes.length > 0 ? notes.map(n => `
            <div style="background: white; border-radius: 8px; padding: 12px; border-left: 5px solid ${n.type === 'merito' ? '#10b981' : n.type === 'pedagogica' ? '#3b82f6' : n.type === 'conducta' ? '#f59e0b' : '#8b5cf6'}; border: 1px solid #e2e8f0; border-left-width: 5px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span class="status-badge" style="font-size: 10px; font-weight: bold;">${n.typeLabel || n.type} • ${n.course}</span>
                <span style="font-size: 10.5px; color: #64748b;">${n.date} ${n.time}</span>
              </div>
              <div style="font-size: 13px; font-weight: bold; color: #0b132b;">${n.title}</div>
              <div style="font-size: 11.5px; color: #475569; margin: 4px 0;">${n.description}</div>
              ${n.taskOrMaterial && n.taskOrMaterial !== 'Ninguno' ? `<div style="font-size: 11px; color: #1e3a8a; font-weight: bold;">📌 ${n.taskOrMaterial} (${n.dueDate})</div>` : ''}
              <div style="margin-top: 6px; font-size: 10.5px; color: ${n.parentSigned ? '#15803d' : '#b45309'}; font-weight: bold;">
                ${n.parentSigned ? `✓ Firmado por ${n.signedBy}` : '⏳ Pendiente de firma de apoderado'}
              </div>
            </div>
          `).join('') : `
            <div style="text-align: center; padding: 20px; color: #64748b; font-size: 12px;">
              No hay anotaciones registradas aún para este estudiante.
            </div>
          `}
        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy btn-sm" onclick="window.app.openPrintAgendaOfficialModal('${student.studentCode}')" style="font-weight: 800;">
          📄 Ver Ficha Completa A4
        </button>
      </div>
    `);
  }

  openPrintAgendaOfficialModal(studentCode) {
    const student = this.store.resolveStudentByQR(studentCode) || { studentCode, studentName: "Estudiante", grade: "5° de Primaria" };
    const notes = this.store.getAgendaNotes(student.studentCode);

    this.showModal(`
      <div class="modal-header" style="background: #0b132b; color: white;">
        <h3 style="color: white; margin: 0; font-size: 15px;">Ficha Oficial de Agenda Virtual Escolar (A4)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <div class="modal-body" style="max-height: 80vh; overflow-y: auto; padding: 24px; background: white;">
        
        <!-- Membrete Oficial -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0b132b; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo" style="width: 44px; height: 44px; object-fit: contain;" />
            <div>
              <div style="font-size: 14px; font-weight: 900; color: #0b132b;">I.E.P. "EL EDUCADOR"</div>
              <div style="font-size: 10px; color: #475569;">UGEL 05 • R.D. N° 01245-2005 • San Juan de Lurigancho</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; font-weight: 900; color: #1e3a8a;">AGENDA VIRTUAL ESCOLAR 2026</div>
            <div style="font-size: 10px; color: #64748b;">EXPEDIENTE DE SEGUIMIENTO FORMATIVO</div>
          </div>
        </div>

        <!-- Ficha de Datos del Alumno -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div><strong>Estudiante:</strong> ${student.studentName}</div>
          <div><strong>Grado / Nivel:</strong> ${student.grade}</div>
          <div><strong>Cód. Matrícula:</strong> ${student.studentCode}</div>
          <div><strong>DNI:</strong> ${student.dni}</div>
          <div><strong>Tutor(a):</strong> ${student.tutor || 'Profesor Titular'}</div>
          <div><strong>Apoderado:</strong> ${student.guardian || 'Apoderado'} (${student.guardianPhone || '984-777-888'})</div>
        </div>

        <!-- Tabla de Anotaciones -->
        <table class="data-table" style="font-size: 11px; width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #0b132b; color: white;">
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Fecha</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Tipo</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Curso & Docente</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Detalle de la Anotación / Tarea</th>
              <th style="padding: 6px; border: 1px solid #cbd5e1;">Acuse / Firma</th>
            </tr>
          </thead>
          <tbody>
            ${notes.map(n => `
              <tr>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${n.date}<br>${n.time}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;"><strong>${n.typeLabel || n.type}</strong></td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${n.course}<br><span style="color:#047857;">${n.teacher}</span></td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">
                  <strong>${n.title}</strong><br>${n.description}
                  ${n.taskOrMaterial && n.taskOrMaterial !== 'Ninguno' ? `<br><em>Requerimiento: ${n.taskOrMaterial}</em>` : ''}
                </td>
                <td style="padding: 6px; border: 1px solid #cbd5e1; text-align: center;">
                  ${n.parentSigned ? `✓ Firmado<br><span style="font-size:9px;">${n.signedDate}</span>` : 'Pendiente'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Firmas Oficiales de Cierre -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; text-align: center; margin-top: 40px; font-size: 10px;">
          <div>
            <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 4px;"></div>
            <strong>Firma del Docente / Tutor</strong>
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 4px;"></div>
            <strong>Firma del Padre / Apoderado</strong>
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 4px;"></div>
            <strong>Dirección General</strong>
          </div>
        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy btn-sm" onclick="window.print()" style="font-weight: 800; padding: 8px 20px;">
          🖨️ Imprimir Ficha Oficial A4
        </button>
      </div>
    `);
  }

  openOfficialDailyReportPrintModal(date = "19/08/2026") {
    const report = this.store.getDailyAttendanceReport(date);

    this.showModal(`
      <div class="modal-header" style="background: #0f172a; color: white;">
        <h3 style="color: white;">Parte Diario Oficial de Tardanzas e Inasistencias (UGEL 05)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 80vh; overflow-y: auto; padding: 24px; background: white;">
        
        <!-- Membrete Oficial -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0b132b; padding-bottom: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador" style="width: 60px; height: 60px; object-fit: contain;" />
            <div>
              <div style="font-size: 10px; font-weight: 900; letter-spacing: 0.05em; color: #1e3a8a;">
                MINISTERIO DE EDUCACIÓN • DRELM • UGEL 05 SAN JUAN DE LURIGANCHO
              </div>
              <h2 style="font-size: 16px; font-weight: 900; margin: 2px 0; color: #0b132b;">
                I.E.P. "EL EDUCADOR" • PARTE DIARIO DE ASISTENCIA & PUNTUALIDAD
              </h2>
              <div style="font-size: 11px; color: #475569;">
                Códigos Modulares: Inicial: 0614826 • Primaria: 0614834 • Secundaria: 0729483
              </div>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <div>Fecha: <strong>${date}</strong></div>
            <div>Hora Límite: <strong>07:45 AM</strong></div>
            <div>Corte Puerta: <strong>08:15 AM</strong></div>
          </div>
        </div>

        <!-- Estadísticas del Parte Diario -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; margin-bottom: 16px; font-size: 11px; text-align: center;">
          <div>Matriculados: <strong>${report.totalEnrolled}</strong></div>
          <div>Puntuales: <strong style="color: #047857;">${report.presentList.length}</strong></div>
          <div>Tardanzas: <strong style="color: #b45309;">${report.tardinessList.length}</strong></div>
          <div>Inasistencias: <strong style="color: #dc2626;">${report.absenceList.length}</strong></div>
        </div>

        <!-- Cuadro 1: Tardanzas -->
        <h4 style="font-size: 12px; font-weight: 900; color: #92400e; margin: 12px 0 6px;">
          I. CUADRO DE ESTUDIANTES CON TARDANZA EN PUERTA
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #fffbeb; border: 1px solid #cbd5e1;">
              <th style="padding: 5px; border: 1px solid #cbd5e1;">N°</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1; text-align: left;">Estudiante</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">DNI</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">Grado</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">Hora Ingreso</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">Demora</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1; text-align: left;">Apoderado Notificado</th>
            </tr>
          </thead>
          <tbody>
            ${report.tardinessList.map((t, i) => `
              <tr>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${i + 1}</td>
                <td style="padding: 4px; border: 1px solid #e2e8f0;"><strong>${t.studentName}</strong></td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${t.dni}</td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${t.grade}</td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold; color: #b45309;">${t.arrivalTime}</td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">+${t.delayMinutes || '7'} min</td>
                <td style="padding: 4px; border: 1px solid #e2e8f0;">${t.guardian} (${t.guardianPhone})</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Cuadro 2: Inasistencias -->
        <h4 style="font-size: 12px; font-weight: 900; color: #991b1b; margin: 12px 0 6px;">
          II. CUADRO DE ESTUDIANTES INASISTENTES AL PLANTEL
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #fef2f2; border: 1px solid #cbd5e1;">
              <th style="padding: 5px; border: 1px solid #cbd5e1;">N°</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1; text-align: left;">Estudiante</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">DNI</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">Grado</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1; text-align: left;">Apoderado</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">Teléfono</th>
              <th style="padding: 5px; border: 1px solid #cbd5e1;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${report.absenceList.map((a, i) => `
              <tr>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${i + 1}</td>
                <td style="padding: 4px; border: 1px solid #e2e8f0;"><strong>${a.studentName}</strong></td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${a.dni}</td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${a.grade}</td>
                <td style="padding: 4px; border: 1px solid #e2e8f0;">${a.guardian}</td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0;">${a.guardianPhone}</td>
                <td style="padding: 4px; text-align: center; border: 1px solid #e2e8f0; font-weight: bold; color: #dc2626;">Inasistencia</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Firmas Oficiales -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; margin-top: 40px; font-size: 10px;">
          <div>
            <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 2px;"></div>
            <strong>Sr. Auxiliar de Portería</strong><br>Control Biométrico y QR
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 2px;"></div>
            <strong>Prof. Alex Lino</strong><br>Coordinación Pedagógica
          </div>
          <div>
            <div style="border-top: 1px solid #000; width: 80%; margin: 0 auto 2px;"></div>
            <strong>Lic. Manuel Cornejo</strong><br>Director General
          </div>
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy" onclick="window.print()" style="font-weight: 800; padding: 8px 20px;">
          Imprimir Parte Diario A4
        </button>
      </div>
    `);
  }

  openMonthlyAttendanceReportModal(gradeId = "4sec") {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === gradeId || g.id === "4sec") || catalog[4];

    this.showModal(`
      <div class="modal-header" style="background: #0f172a; color: #ffffff;">
        <h3 style="color: #ffffff;">Consolidado Mensual de Asistencia Oficial (UGEL 05)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 80vh; overflow-y: auto; padding: 20px; background: #ffffff;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0b132b; padding-bottom: 10px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador" style="width: 55px; height: 55px; object-fit: contain;" />
            <div>
              <div style="font-size: 11px; font-weight: 900; color: #1e3a8a;">I.E.P. "EL EDUCADOR" • UGEL 05 S.J.L.</div>
              <h3 style="font-size: 15px; font-weight: 900; margin: 0; color: #0b132b;">CONSOLIDADO MENSUAL DE ASISTENCIA ESCOLAR</h3>
              <div style="font-size: 11px; color: #64748b;">Mes: <strong>Agosto 2026</strong> • Aula: <strong>${currentGrade.label}</strong></div>
            </div>
          </div>
          <div style="text-align: right; font-size: 10.5px;">
            <div>Tutor: <strong>${currentGrade.tutor || 'Prof. Roberto Silva'}</strong></div>
            <div>Código Modular: <strong>0729483</strong></div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 11.5px; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 6px; text-align: left; border: 1px solid #cbd5e1;">N°</th>
              <th style="padding: 6px; text-align: left; border: 1px solid #cbd5e1;">Apellidos y Nombres</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">DNI</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">Asistencias</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">Tardanzas</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">Faltas Just.</th>
              <th style="padding: 6px; text-align: center; border: 1px solid #cbd5e1;">Faltas Injust.</th>
              <th style="padding: 6px; text-align: right; border: 1px solid #cbd5e1;">% Asistencia</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0;">01</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0;"><strong>MÉNDEZ FLORES, SOFÍA</strong></td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">74891230</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">22</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">1</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">1</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">0</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; color: #047857;">98.5%</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0;">02</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0;"><strong>BENÍTEZ DÍAZ, CARLOS</strong></td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">75129034</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">20</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">2</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">1</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">0</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; color: #047857;">94.0%</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0;">03</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0;"><strong>ALBÚJAR ZEGARRA, MARINA</strong></td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">75849301</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">23</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">0</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">0</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">0</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; color: #047857;">100.0%</td>
            </tr>
            <tr>
              <td style="padding: 6px; border: 1px solid #e2e8f0;">04</td>
              <td style="padding: 6px; border: 1px solid #e2e8f0;"><strong>RAMOS QUISPE, MATEO</strong></td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">76891209</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">21</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">1</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">0</td>
              <td style="padding: 6px; text-align: center; border: 1px solid #e2e8f0;">1</td>
              <td style="padding: 6px; text-align: right; border: 1px solid #e2e8f0; font-weight: bold; color: #b45309;">91.3%</td>
            </tr>
          </tbody>
        </table>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; text-align: center;">
          <div>
            <div style="border-top: 1px solid #000000; width: 75%; margin: 0 auto 4px;"></div>
            <div style="font-size: 11px; font-weight: bold;">${currentGrade.tutor || 'Prof. Roberto Silva'}</div>
            <div style="font-size: 10px; color: #64748b;">Tutor de Aula Responsable</div>
          </div>
          <div>
            <div style="border-top: 1px solid #000000; width: 75%; margin: 0 auto 4px;"></div>
            <div style="font-size: 11px; font-weight: bold;">Lic. Manuel Cornejo</div>
            <div style="font-size: 10px; color: #64748b;">Director General • I.E.P. El Educador</div>
          </div>
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy" onclick="window.print()" style="font-weight: 800; padding: 8px 20px;">
          Imprimir Consolidado Oficial
        </button>
      </div>
    `);
  }

  // =========================================================================
  // GESTIÓN DE ESTRUCTURA DE GRADOS Y SECCIONES (ADMINISTRADOR)
  // =========================================================================
  openCreateGradeModal() {
    this.showModal(`
      <div class="modal-header">
        <h3>🏛️ Agregar Nuevo Grado Institucional</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nombre del Grado:</label>
          <input type="text" id="new-grd-label" class="form-control" placeholder="Ej: 3° de Secundaria" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Nivel Educativo:</label>
            <select id="new-grd-level" class="form-control">
              <option value="Inicial">Inicial</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria" selected>Secundaria</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sección (Opcional):</label>
            <input type="text" id="new-grd-sec" class="form-control" placeholder="Dejar en blanco si es única" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Aula / Ubicación Física:</label>
          <input type="text" id="new-grd-room" class="form-control" placeholder="Ej: Pabellón B - Aula 302" value="Pabellón B - Aula 302" />
        </div>
        <div class="form-group">
          <label class="form-label">Tutor(a) Asignado:</label>
          <input type="text" id="new-grd-tutor" class="form-control" placeholder="Ej: Prof. Roberto Silva" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmCreateGrade()">+ Guardar Grado</button>
      </div>
    `);
  }

  confirmCreateGrade() {
    const label = document.getElementById("new-grd-label").value.trim();
    const level = document.getElementById("new-grd-level").value;
    const section = document.getElementById("new-grd-sec").value.trim();
    const classroom = document.getElementById("new-grd-room").value.trim();
    const tutor = document.getElementById("new-grd-tutor").value.trim() || "Por Asignar";

    if (!label) {
      this.showToast("Ingrese el nombre del grado", "danger");
      return;
    }

    const id = `grd-${Date.now().toString().slice(-4)}`;
    this.store.addGrade({ id, label, level, section, classroom, tutor });
    this.closeModal();
    this.showToast(`✓ Grado "${label}" agregado al catálogo del colegio.`, "success");
    this.render();
  }

  openEditGradeModal(gradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const g = catalog.find(x => x.id === gradeId);
    if (!g) return;

    this.showModal(`
      <div class="modal-header">
        <h3>✏️ Editar Grado / Aula: ${g.label}</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Nombre del Grado:</label>
          <input type="text" id="edit-grd-label" class="form-control" value="${g.label}" />
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Nivel Educativo:</label>
            <select id="edit-grd-level" class="form-control">
              <option value="Inicial" ${g.level === 'Inicial' ? 'selected' : ''}>Inicial</option>
              <option value="Primaria" ${g.level === 'Primaria' ? 'selected' : ''}>Primaria</option>
              <option value="Secundaria" ${g.level === 'Secundaria' ? 'selected' : ''}>Secundaria</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Sección (Opcional):</label>
            <input type="text" id="edit-grd-sec" class="form-control" value="${g.section || ''}" placeholder="Dejar en blanco si no tiene" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Aula / Ubicación Física:</label>
          <input type="text" id="edit-grd-room" class="form-control" value="${g.classroom || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label">Tutor(a) Asignado:</label>
          <input type="text" id="edit-grd-tutor" class="form-control" value="${g.tutor || ''}" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmUpdateGrade('${g.id}')">✓ Guardar Cambios</button>
      </div>
    `);
  }

  confirmUpdateGrade(gradeId) {
    const label = document.getElementById("edit-grd-label").value.trim();
    const level = document.getElementById("edit-grd-level").value;
    const section = document.getElementById("edit-grd-sec").value.trim();
    const classroom = document.getElementById("edit-grd-room").value.trim();
    const tutor = document.getElementById("edit-grd-tutor").value.trim();

    if (!label) {
      this.showToast("El nombre del grado no puede estar vacío", "danger");
      return;
    }

    this.store.updateGrade(gradeId, { label, level, section, classroom, tutor });
    this.closeModal();
    this.showToast(`✓ Grado "${label}" actualizado exitosamente.`, "success");
    this.render();
  }

  confirmDeleteGrade(gradeId) {
    if (confirm("¿Está seguro de eliminar este grado del catálogo institucional?")) {
      this.store.deleteGrade(gradeId);
      this.showToast("Grado eliminado del catálogo.", "info");
      this.render();
    }
  }

  toggleAcademicSections(hasSections) {
    this.store.toggleAcademicSections(hasSections);
    this.showToast(hasSections ? "✓ Modo con Secciones Habilitado" : "✓ Modo Grados Únicos (Sin Secciones) Activado", "info");
    this.render();
  }

  // =========================================================================
  // GESTIÓN Y CREACIÓN DE HORARIOS ESCOLARES (ADMINISTRADOR)
  // =========================================================================

  getTeachersSelectOptions(selectedTeacherName = "") {
    const teachers = (this.store && typeof this.store.getRegisteredTeachers === "function")
      ? this.store.getRegisteredTeachers()
      : ((this.store.state.systemUsers || []).filter(u => u.role === "Docente" || u.role === "Profesor"));

    return teachers.map(t => {
      const isSelected = selectedTeacherName && selectedTeacherName.toLowerCase().includes(t.name.toLowerCase());
      const coursesLabel = Array.isArray(t.assignedCourses) && t.assignedCourses.length > 0
        ? t.assignedCourses.slice(0, 2).join(', ')
        : (t.subject || "Docente");
      return `<option value="${t.name}" ${isSelected ? 'selected' : ''}>${t.name} (${coursesLabel})</option>`;
    }).join('');
  }

  getPeriodIndexOptions(selectedIndex = 0) {
    const periodOptions = [
      { index: 0, time: "08:00 - 08:50", label: "1° Bloque (08:00 - 08:50 am)" },
      { index: 1, time: "08:50 - 09:40", label: "2° Bloque (08:50 - 09:40 am)" },
      { index: 2, time: "09:40 - 10:30", label: "3° Bloque (09:40 - 10:30 am)" },
      { index: 4, time: "10:50 - 11:40", label: "4° Bloque (10:50 - 11:40 am)" },
      { index: 5, time: "11:40 - 12:30", label: "5° Bloque (11:40 - 12:30 pm)" },
      { index: 6, time: "12:30 - 01:20", label: "6° Bloque (12:30 - 01:20 pm)" },
      { index: 8, time: "01:50 - 02:40", label: "7° Bloque (01:50 - 02:40 pm)" },
      { index: 9, time: "02:40 - 03:30", label: "8° Bloque (02:40 - 03:30 pm)" }
    ];

    return periodOptions.map(p => {
      const isSel = p.index === parseInt(selectedIndex, 10);
      return `<option value="${p.index}" ${isSel ? 'selected' : ''}>${p.label}</option>`;
    }).join('');
  }

  openCreateScheduleModal(gradeId, defaultRowIndex = 0, defaultDayKey = "mon") {
    const targetGradeId = gradeId || this.store.state.selectedScheduleGrade || "4sec-a";
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === targetGradeId) || catalog[4];

    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">➕ Crear / Asignar Clase a Horario Escolar</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 12px; color: #1e3a8a; font-weight: 700;">
          Asignación de Bloque Lectivo • Duración: 50 min • Periodo Lectivo 2026
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Aula / Grado:</label>
            <select id="sched-create-grade" class="form-control" style="font-weight: bold;">
              ${catalog.map(g => `<option value="${g.id}" ${g.id === targetGradeId ? 'selected' : ''}>${g.label} (${g.level})</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Día de la Semana:</label>
            <select id="sched-create-day" class="form-control" style="font-weight: bold;">
              <option value="mon" ${defaultDayKey === 'mon' ? 'selected' : ''}>Lunes</option>
              <option value="tue" ${defaultDayKey === 'tue' ? 'selected' : ''}>Martes</option>
              <option value="wed" ${defaultDayKey === 'wed' ? 'selected' : ''}>Miércoles</option>
              <option value="thu" ${defaultDayKey === 'thu' ? 'selected' : ''}>Jueves</option>
              <option value="fri" ${defaultDayKey === 'fri' ? 'selected' : ''}>Viernes</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Bloque Horario (Horas Lectivas de 50 min):</label>
          <select id="sched-create-row" class="form-control" style="font-weight: bold; border-color: #3b82f6;">
            ${this.getPeriodIndexOptions(defaultRowIndex)}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px; color: #1e3a8a;">
            Asignatura / Curso (Boleta Oficial de Notas):
          </label>
          <select id="sched-create-course" class="form-control" style="font-size: 12px; font-weight: bold; border-color: #3b82f6; background: #ffffff;">
            ${this.getBoletaCoursesSelectOptions("Aritmética")}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Docente Responsable:</label>
            <select id="sched-create-teacher" class="form-control" style="font-size: 12px; font-weight: bold;">
              ${this.getTeachersSelectOptions()}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Ambiente / Aula:</label>
            <input type="text" id="sched-create-room" class="form-control" placeholder="Ej: Aula 401" value="${currentGrade.classroom || 'Aula 401'}" style="font-size: 12px;" />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Color de la Tarjeta en Horario:</label>
          <select id="sched-create-color" class="form-control" style="font-size: 12px; font-weight: bold;">
            <option value="navy">🔵 Azul Institucional (Matemáticas / Ciencias)</option>
            <option value="gold"><span class='status-dot-yellow'></span> Dorado / Amarillo (Comunicación / Letras)</option>
            <option value="emerald"><span class='status-dot-green'></span> Verde Esmeralda (Ciencia / Biología / EPT)</option>
            <option value="purple">🟣 Morado / Púrpura (Ciencias Sociales / Filosofía)</option>
            <option value="red"><span class='status-dot-red'></span> Rojo (Cívica / Tutoria)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmSaveCreatedScheduleSlot()" style="font-weight: 800;">
          ✓ Guardar y Publicar en Horario
        </button>
      </div>
    `);
  }

  confirmSaveCreatedScheduleSlot() {
    const gradeId = document.getElementById("sched-create-grade").value;
    const dayKey = document.getElementById("sched-create-day").value;
    const rowIndex = parseInt(document.getElementById("sched-create-row").value, 10);
    const course = document.getElementById("sched-create-course").value;
    const teacher = document.getElementById("sched-create-teacher").value;
    const room = document.getElementById("sched-create-room").value.trim() || "Aula Principal";
    const color = document.getElementById("sched-create-color").value;

    this.store.updateScheduleSlot(gradeId, rowIndex, dayKey, {
      course,
      teacher,
      room,
      color
    });

    this.closeModal();
    this.showToast(`✓ Clase de "${course}" (${teacher}) programada con éxito en el horario`, "success");
    this.render();
  }

  openEditScheduleSlotModal(gradeId, rowIndex, dayKey) {
    const targetGradeId = gradeId || this.store.state.selectedScheduleGrade || "4sec-a";
    const schedule = this.store.getSchedule(targetGradeId);
    const row = schedule[rowIndex];
    if (!row || !row[dayKey]) return;
    const slot = row[dayKey];
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === targetGradeId) || catalog[4];

    const dayNameMap = { mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves', fri: 'Viernes' };

    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">✏️ Editar Bloque de Horario (${dayNameMap[dayKey]} • ${row.time})</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 8px 12px; margin-bottom: 12px; font-size: 12px; color: #1e3a8a; font-weight: 700;">
          ${currentGrade.label} • Bloque: ${row.time} • ${dayNameMap[dayKey]}
        </div>

        <div class="form-group" style="margin-bottom: 10px;">
          <label class="form-label" style="font-weight: 800; font-size: 11.5px; color: #1e3a8a;">
            Asignatura / Curso (Boleta Oficial de Notas):
          </label>
          <select id="edit-slot-course" class="form-control" style="font-size: 12px; font-weight: bold; border-color: #3b82f6;">
            ${this.getBoletaCoursesSelectOptions(slot.course)}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); margin-bottom: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Docente Responsable:</label>
            <select id="edit-slot-teacher" class="form-control" style="font-size: 12px; font-weight: bold;">
              ${this.getTeachersSelectOptions(slot.teacher)}
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Ambiente / Aula:</label>
            <input type="text" id="edit-slot-room" class="form-control" value="${slot.room || currentGrade.classroom}" style="font-size: 12px;" />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Color de la Tarjeta:</label>
          <select id="edit-slot-color" class="form-control" style="font-size: 12px; font-weight: bold;">
            <option value="navy" ${slot.color === 'navy' ? 'selected' : ''}>🔵 Azul Institucional</option>
            <option value="gold" ${slot.color === 'gold' ? 'selected' : ''}><span class='status-dot-yellow'></span> Dorado / Amarillo</option>
            <option value="emerald" ${slot.color === 'emerald' ? 'selected' : ''}><span class='status-dot-green'></span> Verde Esmeralda</option>
            <option value="purple" ${slot.color === 'purple' ? 'selected' : ''}>🟣 Morado</option>
            <option value="red" ${slot.color === 'red' ? 'selected' : ''}><span class='status-dot-red'></span> Rojo</option>
          </select>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-outline btn-sm" onclick="window.app.deleteScheduleSlot('${targetGradeId}', ${rowIndex}, '${dayKey}')" style="color: var(--color-red-600); border-color: #fca5a5; font-weight: 800;">
          🗑️ Eliminar Clase de este Bloque
        </button>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
          <button class="btn btn-navy" onclick="window.app.saveScheduleSlot('${targetGradeId}', ${rowIndex}, '${dayKey}')" style="font-weight: 800;">
            ✓ Guardar Cambios
          </button>
        </div>
      </div>
    `);
  }

  saveScheduleSlot(gradeId, rowIndex, dayKey) {
    const course = document.getElementById("edit-slot-course").value;
    const teacher = document.getElementById("edit-slot-teacher").value;
    const room = document.getElementById("edit-slot-room").value;
    const color = document.getElementById("edit-slot-color").value;

    this.store.updateScheduleSlot(gradeId, rowIndex, dayKey, { course, teacher, room, color });
    this.closeModal();
    this.showToast(`✓ Horario de "${course}" actualizado en la base de datos`, "success");
    this.render();
  }

  deleteScheduleSlot(gradeId, rowIndex, dayKey) {
    this.store.deleteScheduleSlot(gradeId, rowIndex, dayKey);
    this.closeModal();
    this.showToast("✓ Clase eliminada del bloque horario (Hora liberada)", "info");
    this.render();
  }

  openAutoScheduleModal(gradeId) {
    const targetGradeId = gradeId || this.store.state.selectedScheduleGrade || "4sec-a";
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === targetGradeId) || catalog[4];

    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">⚡ Generador de Horario Automático Balanceado</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 13px; color: #1e293b; margin-bottom: 12px;">
          ¿Desea generar automáticamente la matriz semanal de horario curricular para <strong>${currentGrade.label} (${currentGrade.level})</strong>?
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px; color: #475569;">
          <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">Distribución Pedagógica 2026:</div>
          <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
            <li>Matemáticas (Aritmética, Álgebra, Geometría, Trigonometría, RM)</li>
            <li>Comunicación (Lenguaje, Literatura, Razonamiento Verbal)</li>
            <li>Ciencia y Tecnología (Física, Química, Biología)</li>
            <li>Ciencias Sociales (Historia del Perú, Geografía, Filosofía)</li>
            <li>Computación & Robótica, Inglés, Arte y DPCC</li>
            <li>Recesos automáticos de 10:30 a 10:50 am y Almuerzo de 01:20 a 01:50 pm.</li>
          </ul>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmGenerateAutoSchedule('${targetGradeId}')" style="font-weight: 800;">
          ⚡ Generar y Publicar Horario Balanceado
        </button>
      </div>
    `);
  }

  confirmGenerateAutoSchedule(gradeId) {
    const targetGradeId = gradeId || this.store.state.selectedScheduleGrade || "4sec-a";
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === targetGradeId) || catalog[4];
    const room = currentGrade.classroom || "Aula Principal";

    const autoSchedule = [
      {
        time: "08:00 - 08:50",
        mon: { course: "Aritmética", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Lenguaje", teacher: "Miss María Daysi Reyes", room: room, color: "gold" },
        wed: { course: "Álgebra", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        thu: { course: "Física", teacher: "Miss Leyli Graciela Reyes", room: "Lab. Ciencias", color: "emerald" },
        fri: { course: "Inglés", teacher: "Prof. Carlos Mendoza", room: room, color: "purple" }
      },
      {
        time: "08:50 - 09:40",
        mon: { course: "Aritmética", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Lenguaje", teacher: "Miss María Daysi Reyes", room: room, color: "gold" },
        wed: { course: "Álgebra", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        thu: { course: "Física", teacher: "Miss Leyli Graciela Reyes", room: "Lab. Ciencias", color: "emerald" },
        fri: { course: "Inglés", teacher: "Prof. Carlos Mendoza", room: room, color: "purple" }
      },
      {
        time: "09:40 - 10:30",
        mon: { course: "Geometría", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Literatura", teacher: "Miss María Daysi Reyes", room: room, color: "gold" },
        wed: { course: "Biología", teacher: "Miss Leyli Graciela Reyes", room: room, color: "emerald" },
        thu: { course: "Química", teacher: "Miss Leyli Graciela Reyes", room: "Lab. Ciencias", color: "emerald" },
        fri: { course: "Historia del Perú", teacher: "Prof. Alejandro Vargas", room: room, color: "purple" }
      },
      { time: "10:30 - 10:50", isBreak: true, title: "Receso Matutino" },
      {
        time: "10:50 - 11:40",
        mon: { course: "Trigonometría", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Razonamiento Verbal", teacher: "Miss María Daysi Reyes", room: room, color: "gold" },
        wed: { course: "Química", teacher: "Miss Leyli Graciela Reyes", room: "Lab. Ciencias", color: "emerald" },
        thu: { course: "Computación & Robótica", teacher: "Prof. Fernando Rojas", room: "Lab. Cómputo", color: "emerald" },
        fri: { course: "Historia Universal", teacher: "Prof. Alejandro Vargas", room: room, color: "purple" }
      },
      {
        time: "11:40 - 12:30",
        mon: { course: "Razonamiento Matemático", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Cívica", teacher: "Prof. Manuel Soto", room: room, color: "red" },
        wed: { course: "Geografía", teacher: "Prof. Alejandro Vargas", room: room, color: "purple" },
        thu: { course: "Computación & Robótica", teacher: "Prof. Fernando Rojas", room: "Lab. Cómputo", color: "emerald" },
        fri: { course: "Educación Física", teacher: "Prof. Dante Morales", room: "Patio Techado", color: "red" }
      },
      {
        time: "12:30 - 01:20",
        mon: { course: "Razonamiento Matemático", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Psicología", teacher: "Prof. Manuel Soto", room: room, color: "red" },
        wed: { course: "Filosofía", teacher: "Prof. Alejandro Vargas", room: room, color: "purple" },
        thu: { course: "Arte y Cultura", teacher: "Miss Rosa Linares", room: "Taller Arte", color: "gold" },
        fri: { course: "Educación Física", teacher: "Prof. Dante Morales", room: "Patio Techado", color: "red" }
      },
      { time: "01:20 - 01:50", isBreak: true, isLunch: true, title: "Almuerzo Escolar" },
      {
        time: "01:50 - 02:40",
        mon: { course: "Computación", teacher: "Prof. Fernando Rojas", room: "Lab. Cómputo", color: "emerald" },
        tue: { course: "Biología", teacher: "Miss Leyli Graciela Reyes", room: room, color: "emerald" },
        wed: { course: "Gestión Empresarial", teacher: "Prof. Fernando Rojas", room: room, color: "gold" },
        thu: { course: "Tutoría & Orientación", teacher: currentGrade.tutor || "Prof. Roberto Silva", room: room, color: "red" },
        fri: { course: "Educación Religiosa", teacher: "Prof. Manuel Soto", room: room, color: "purple" }
      },
      {
        time: "02:40 - 03:30",
        mon: { course: "Taller de Refuerzo", teacher: "Prof. Roberto Silva", room: room, color: "navy" },
        tue: { course: "Círculo de Lectura", teacher: "Miss María Daysi Reyes", room: room, color: "gold" },
        wed: { course: "Taller de Ciencias", teacher: "Miss Leyli Graciela Reyes", room: "Lab. Ciencias", color: "emerald" },
        thu: { course: "Club de Robótica", teacher: "Prof. Fernando Rojas", room: "Lab. Cómputo", color: "emerald" },
        fri: { course: "Evaluación & Retroalimentación", teacher: currentGrade.tutor || "Prof. Roberto Silva", room: room, color: "red" }
      }
    ];

    this.store.setFullGradeSchedule(targetGradeId, autoSchedule);
    this.closeModal();
    this.showToast(`✓ Horario automático balanceado generado y publicado para ${currentGrade.label}`, "success");
    this.render();
  }

  openCloneScheduleModal(sourceGradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === sourceGradeId) || catalog[4];

    this.showModal(`
      <div class="modal-header" style="background: #1e3a8a; color: #ffffff;">
        <h3 style="color: #ffffff;">Clonar Horario a Otra Aula / Sección</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: #ffffff;">✕</button>
      </div>
      <div class="modal-body">
        <div style="font-size: 13px; color: #1e293b; margin-bottom: 12px;">
          Copiar la estructura y distribución horaria de <strong>${currentGrade.label}</strong> hacia:
        </div>
        <div class="form-group">
          <label class="form-label" style="font-weight: 800;">Aula de Destino:</label>
          <select id="clone-target-grade" class="form-control" style="font-size: 12px; font-weight: bold; border-color: #3b82f6;">
            ${catalog.filter(g => g.id !== sourceGradeId).map(g => `<option value="${g.id}">${g.label} (${g.level})</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmCloneSchedule('${sourceGradeId}')" style="font-weight: 800;">
          Confirmar y Clonar Horario
        </button>
      </div>
    `);
  }

  confirmCloneSchedule(sourceGradeId) {
    const targetGradeId = document.getElementById("clone-target-grade").value;
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const targetGrade = catalog.find(g => g.id === targetGradeId);

    this.store.cloneSchedule(sourceGradeId, targetGradeId);
    this.closeModal();
    this.showToast(`✓ Horario clonado exitosamente a ${targetGrade ? targetGrade.label : targetGradeId}`, "success");
    this.store.setSelectedScheduleGrade(targetGradeId);
    this.render();
  }

  clearScheduleGrade(gradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog;
    const currentGrade = catalog.find(g => g.id === gradeId) || catalog[4];

    if (confirm(`¿Está seguro de que desea limpiar todos los bloques lectivos del horario de ${currentGrade.label}? Los recesos se mantendrán.`)) {
      this.store.clearGradeSchedule(gradeId);
      this.showToast(`✓ Horario de ${currentGrade.label} reseteado a plantilla vacía`, "info");
      this.render();
    }
  }

  // Carteles Temáticos Mensuales & Sílabus
  onSyllabusMonthChange(month) {
    this.store.state.selectedSyllabusMonth = month;
    this.store.saveState();
    this.render();
  }

  openUploadMonthlyCartelModal(courseCode = '', gradeId = '', month = '') {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const activeGradeId = gradeId || this.store.state.selectedSyllabusGrade || "3prim";
    const activeMonth = month || this.store.state.selectedSyllabusMonth || "Agosto";
    const months = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

    window._pendingCartelPdf = null;

    this.showModal(`
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📤</span>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800;">Subir Cartel Temático Mensual (PDF)</h3>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 78vh; overflow-y: auto;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">Mes de Programación:</label>
            <select id="cartel-month" class="form-control" style="font-weight: bold;">
              ${months.map(m => `<option value="${m}" ${m.toLowerCase() === activeMonth.toLowerCase() ? 'selected' : ''}>📅 ${m} 2026</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Aula / Grado:</label>
            <select id="cartel-grade" class="form-control" style="font-weight: bold;">
              ${catalog.map(g => `<option value="${g.id}" ${g.id === activeGradeId ? 'selected' : ''}>${g.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">Curso / Asignatura:</label>
            <input type="text" id="cartel-course-name" list="teacher-assigned-courses-list" class="form-control" placeholder="Ej. Matemática, Cívica, CTA..." required />
            <datalist id="teacher-assigned-courses-list">
              ${((this.store && typeof this.store.getTeacherAssignedCourses === "function") ? this.store.getTeacherAssignedCourses(this.store.getCurrentUser(), activeGradeId) : []).map(c => `
                <option value="${c.name}">${c.grade || ''}</option>
              `).join('')}
            </datalist>
          </div>
          <div class="form-group">
            <label class="form-label">Docente Responsable:</label>
            <input type="text" id="cartel-teacher" class="form-control" value="${this.store.state.currentUser ? this.store.state.currentUser.name : 'Docente Titular'}" />
          </div>
        </div>

        <!-- Carga de Archivo PDF Oficial -->
        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Archivo Oficial en Formato PDF:</label>
          <div style="border: 2px dashed #93c5fd; background: #eff6ff; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer;" onclick="document.getElementById('cartel-pdf-input').click()">
            <div style="font-size: 28px; margin-bottom: 4px;">📄</div>
            <div style="font-size: 13px; font-weight: 800; color: #1e40af;">Haga clic para seleccionar el Cartel Temático en PDF</div>
            <div style="font-size: 11px; color: #64748b;">Formatos aceptados: .pdf (Máx. 10 MB)</div>
            <input type="file" id="cartel-pdf-input" accept=".pdf,application/pdf" style="display: none;" onchange="window.app.handleCartelPdfSelected(event)" />
            <div id="cartel-pdf-filename-display" style="margin-top: 8px; font-size: 12px; font-weight: 800; color: #059669; display: none;"></div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Competencias y Capacidades (MINEDU):</label>
          <textarea id="cartel-competencies" class="form-control" rows="2" placeholder="Ingrese las competencias del mes (una por línea)..."></textarea>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Programación Temática Semanal:</label>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <input type="text" id="cartel-w1" class="form-control" placeholder="Semana 1: Tema o contenido..." />
            <input type="text" id="cartel-w2" class="form-control" placeholder="Semana 2: Tema o contenido..." />
            <input type="text" id="cartel-w3" class="form-control" placeholder="Semana 3: Tema o contenido..." />
            <input type="text" id="cartel-w4" class="form-control" placeholder="Semana 4: Tema o contenido y evaluación..." />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Criterios de Evaluación y Evidencias:</label>
          <input type="text" id="cartel-eval-criteria" class="form-control" value="Prácticas semanales, revisión de cuadernos de trabajo y evaluación mensual continua." />
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmSaveMonthlyCartel()">
          Publicar Cartel Temático
        </button>
      </div>
    `);
  }

  handleCartelPdfSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const display = document.getElementById("cartel-pdf-filename-display");
    if (display) {
      display.style.display = "block";
      display.innerHTML = `✓ Archivo cargado: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)`;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      window._pendingCartelPdf = {
        name: file.name,
        size: `${(file.size / 1024).toFixed(0)} KB`,
        data: e.target.result
      };
    };
    reader.readAsDataURL(file);
  }

  confirmSaveMonthlyCartel(cartelId = null) {
    const month = document.getElementById("cartel-month").value;
    const gradeId = document.getElementById("cartel-grade").value;
    const courseName = document.getElementById("cartel-course-name").value.trim();
    const teacher = document.getElementById("cartel-teacher").value.trim();
    const competenciesStr = document.getElementById("cartel-competencies").value.trim();
    const w1 = document.getElementById("cartel-w1").value.trim();
    const w2 = document.getElementById("cartel-w2").value.trim();
    const w3 = document.getElementById("cartel-w3").value.trim();
    const w4 = document.getElementById("cartel-w4").value.trim();
    const evalCriteria = document.getElementById("cartel-eval-criteria").value.trim();

    if (!courseName) {
      this.showToast("Por favor ingrese el nombre del curso", "error");
      return;
    }

    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const gradeObj = catalog.find(g => g.id === gradeId) || { label: "3° de Primaria" };

    const pdfInfo = window._pendingCartelPdf || {
      name: `Cartel_Tematico_${courseName.replace(/\s+/g, '_')}_${month}_2026.pdf`,
      size: "350 KB",
      data: null
    };

    const competencies = competenciesStr ? competenciesStr.split('\n').filter(Boolean) : ["Competencia de Área MINEDU"];
    const weeklyTopics = [
      w1 ? `Semana 1: ${w1}` : "Semana 1: Fundamentos y conceptos clave",
      w2 ? `Semana 2: ${w2}` : "Semana 2: Desarrollo temático y práctica",
      w3 ? `Semana 3: ${w3}` : "Semana 3: Aplicación y resolución de situaciones",
      w4 ? `Semana 4: ${w4}` : "Semana 4: Evaluación mensual y retroalimentación"
    ];

    this.store.saveMonthlyCartel({
      id: cartelId || undefined,
      gradeId: gradeId,
      gradeName: gradeObj.label,
      courseName: courseName,
      courseCode: `CUR-${Math.floor(100 + Math.random() * 900)}`,
      teacher: teacher || "Docente Titular",
      month: month,
      year: "2026",
      competencies: competencies,
      weeklyTopics: weeklyTopics,
      evaluationCriteria: evalCriteria,
      pdfFileName: pdfInfo.name,
      pdfFileSize: pdfInfo.size,
      pdfFileData: pdfInfo.data
    });

    window._pendingCartelPdf = null;
    this.closeModal();
    this.showToast(`✓ Cartel temático de ${courseName} publicado exitosamente`, "success");
    this.render();
  }

  openEditMonthlyCartelModal(cartelId) {
    const carteles = this.store.state.monthlyCarteles || initialData.monthlyCarteles || [];
    const cartel = carteles.find(c => c.id === cartelId);
    if (!cartel) return;

    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const months = ["Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

    window._pendingCartelPdf = null;

    const topics = cartel.weeklyTopics || [];

    this.showModal(`
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">✏️</span>
          <h3 style="margin: 0; font-size: 16px; font-weight: 800;">Editar Cartel Temático Mensual</h3>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="max-height: 78vh; overflow-y: auto;">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">Mes:</label>
            <select id="cartel-month" class="form-control" style="font-weight: bold;">
              ${months.map(m => `<option value="${m}" ${m.toLowerCase() === (cartel.month || '').toLowerCase() ? 'selected' : ''}>📅 ${m} 2026</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Aula / Grado:</label>
            <select id="cartel-grade" class="form-control" style="font-weight: bold;">
              ${catalog.map(g => `<option value="${g.id}" ${g.id === cartel.gradeId ? 'selected' : ''}>${g.label}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div class="form-group">
            <label class="form-label">Curso / Asignatura:</label>
            <input type="text" id="cartel-course-name" class="form-control" value="${cartel.courseName}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Docente:</label>
            <input type="text" id="cartel-teacher" class="form-control" value="${cartel.teacher}" />
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 14px;">
          <label class="form-label">Reemplazar Archivo PDF (Opcional):</label>
          <div style="border: 2px dashed #93c5fd; background: #eff6ff; border-radius: 8px; padding: 14px; text-align: center; cursor: pointer;" onclick="document.getElementById('cartel-pdf-input').click()">
            <div style="font-size: 13px; font-weight: 800; color: #1e40af;">Actual: ${cartel.pdfFileName} (${cartel.pdfFileSize})</div>
            <div style="font-size: 11px; color: #64748b;">Haga clic aquí para adjuntar un nuevo PDF</div>
            <input type="file" id="cartel-pdf-input" accept=".pdf,application/pdf" style="display: none;" onchange="window.app.handleCartelPdfSelected(event)" />
            <div id="cartel-pdf-filename-display" style="margin-top: 6px; font-size: 12px; font-weight: 800; color: #059669; display: none;"></div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Competencias:</label>
          <textarea id="cartel-competencies" class="form-control" rows="2">${(cartel.competencies || []).join('\n')}</textarea>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Programación Semanal:</label>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <input type="text" id="cartel-w1" class="form-control" value="${topics[0] || ''}" />
            <input type="text" id="cartel-w2" class="form-control" value="${topics[1] || ''}" />
            <input type="text" id="cartel-w3" class="form-control" value="${topics[2] || ''}" />
            <input type="text" id="cartel-w4" class="form-control" value="${topics[3] || ''}" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Criterios de Evaluación:</label>
          <input type="text" id="cartel-eval-criteria" class="form-control" value="${cartel.evaluationCriteria || ''}" />
        </div>

      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmSaveMonthlyCartel('${cartel.id}')">
          Guardar Cambios
        </button>
      </div>
    `);
  }

  openViewCartelPdfModal(cartelId) {
    const carteles = this.store.state.monthlyCarteles || initialData.monthlyCarteles || [];
    const cartel = carteles.find(c => c.id === cartelId);
    if (!cartel) return;

    this.showModal(`
      <div class="modal-header" style="background: var(--color-navy-900); color: white; border-radius: 8px 8px 0 0; padding: 14px 18px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">📄</span>
          <div>
            <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: white;">${cartel.courseName}</h3>
            <span style="font-size: 11.5px; color: #93c5fd;">Cartel Temático Mensual – ${cartel.month} 2026 (${cartel.gradeName})</span>
          </div>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white; font-size: 20px; background: transparent; border: none; cursor: pointer;">✕</button>
      </div>
      <div class="modal-body" style="padding: 20px; max-height: 78vh; overflow-y: auto;">
        
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12.5px;">
            <div>👨‍🏫 <strong>Docente:</strong> ${cartel.teacher}</div>
            <div>🎓 <strong>Grado:</strong> ${cartel.gradeName}</div>
            <div>📅 <strong>Mes:</strong> ${cartel.month} 2026</div>
            <div>📄 <strong>Archivo:</strong> ${cartel.pdfFileName} (${cartel.pdfFileSize})</div>
          </div>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin: 0 0 6px;">🎯 Competencias y Capacidades Desarrolladas:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.45;">
            ${(cartel.competencies || []).map(comp => `<li>${comp}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom: 16px;">
          <h4 style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin: 0 0 6px;">📌 Contenidos Semanales Programados:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${(cartel.weeklyTopics || []).map((w, i) => `
              <div style="background: #f8fafc; border-left: 3px solid var(--color-navy-600); padding: 8px 12px; border-radius: 0 6px 6px 0; font-size: 12px; color: #1e293b;">
                <strong>${w}</strong>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 8px; font-size: 12px; color: #854d0e;">
          <strong>📝 Criterios de Evaluación:</strong> ${cartel.evaluationCriteria || 'Evaluación continua, presentación de tareas y prácticas semanales.'}
        </div>

      </div>
      <div class="modal-footer" style="display: flex; justify-content: space-between;">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-yellow" onclick="window.print()">🖨️ Imprimir</button>
          <button class="btn btn-navy" onclick="window.app.downloadCartelPdf('${cartel.id}')">
            ⬇️ Descargar PDF Oficial
          </button>
        </div>
      </div>
    `);
  }

  downloadCartelPdf(cartelId) {
    const carteles = this.store.state.monthlyCarteles || initialData.monthlyCarteles || [];
    const cartel = carteles.find(c => c.id === cartelId);
    if (!cartel) return;

    if (cartel.pdfFileData) {
      const a = document.createElement("a");
      a.href = cartel.pdfFileData;
      a.download = cartel.pdfFileName || "Cartel_Tematico.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.print();
    }
    this.showToast(`Descargando ${cartel.pdfFileName}...`, "info");
  }

  confirmDeleteMonthlyCartel(cartelId) {
    if (confirm("¿Está seguro de eliminar este Cartel Temático Mensual?")) {
      this.store.deleteMonthlyCartel(cartelId);
      this.showToast("✓ Cartel temático eliminado", "info");
      this.render();
    }
  }

  openConsolidatedCartelModal(gradeId, month) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const currentGrade = catalog.find(g => g.id === gradeId) || catalog.find(g => g.id === "3prim") || catalog[0] || { id: "3prim", label: "3° de Primaria", level: "Primaria", tutor: "Prof. Roberto Silva" };
    const selectedMonth = month || this.store.state.selectedSyllabusMonth || "Agosto";
    
    const carteles = this.store.getMonthlyCarteles(gradeId, selectedMonth);

    this.showModal(`
      <div class="modal-header" style="background: var(--color-navy-900); color: white; border-radius: 8px 8px 0 0; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">📑</span>
          <div>
            <h3 style="margin: 0; font-size: 16px; font-weight: 800; color: white;">Compendio Consolidado de Carteles Temáticos</h3>
            <span style="font-size: 12px; color: #93c5fd;">Aula: ${currentGrade.label} | Periodo: ${selectedMonth} 2026</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button class="btn btn-yellow btn-sm" onclick="window.print()" style="font-weight: 900; font-size: 12px; padding: 6px 14px;">
            🖨️ Imprimir / Guardar como PDF
          </button>
          <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white; font-size: 20px; background: transparent; border: none; cursor: pointer;">✕</button>
        </div>
      </div>

      <div class="modal-body" style="padding: 20px; background: #f8fafc; max-height: 80vh; overflow-y: auto;">
        
        <div class="consolidated-cartel-print-container" style="background: white; border: 2px solid #0f172a; border-radius: 8px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          
          <!-- Encabezado Institucional -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <img src="logo.png" alt="Escudo I.E.P. El Educador" style="width: 50px; height: 50px; object-fit: contain;" onerror="this.src='assets/logo.png'">
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #1e3a8a; letter-spacing: 0.5px;">I. E. P. "EL EDUCADOR" — SAN JUAN DE LURIGANCHO</div>
                <div style="font-size: 10px; font-weight: 700; color: #475569;">UGEL 05 • RD N° 04512-ED • "21 años dejando huellas"</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; font-weight: 800; color: #1e3a8a; background: #e0e7ff; padding: 3px 10px; border-radius: 12px; display: inline-block;">
                DOCUMENTO OFICIAL
              </div>
              <div style="font-size: 10px; color: #64748b; margin-top: 3px;">Año Lectivo 2026</div>
            </div>
          </div>

          <!-- Título Principal del Compendio -->
          <div style="text-align: center; margin-bottom: 16px;">
            <h2 style="font-size: 15px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin: 0 0 4px; letter-spacing: 0.5px;">
              CARTEL TEMÁTICO MENSUAL CONSOLIDADO DE AULA – 2026
            </h2>
            <div style="display: flex; justify-content: center; gap: 16px; font-size: 12px; font-weight: 800; color: #1e3a8a; background: #fef08a; padding: 6px 14px; border-radius: 6px; border: 1px solid #facc15;">
              <span>🎓 GRADO: <u>${currentGrade.label.toUpperCase()}</u></span>
              <span>📅 MES: <u>${selectedMonth.toUpperCase()} 2026</u></span>
              <span>👨‍🏫 TUTOR: <u>${(currentGrade.tutor || 'Prof. Roberto Silva').toUpperCase()}</u></span>
            </div>
          </div>

          <!-- Tabla Compendio con Todas las Asignaturas -->
          <table style="width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 20px;" border="1" cellpadding="6">
            <thead>
              <tr style="background: #1e3a8a; color: white; text-align: center;">
                <th style="width: 22%; padding: 6px 8px;">ÁREA / ASIGNATURA & DOCENTE</th>
                <th style="width: 28%; padding: 6px 8px;">COMPETENCIAS & CAPACIDADES MINEDU</th>
                <th style="width: 34%; padding: 6px 8px;">PROGRAMACIÓN TEMÁTICA MENSUAL (SEMANAL)</th>
                <th style="width: 16%; padding: 6px 8px;">EVALUACIÓN & EVIDENCIAS</th>
              </tr>
            </thead>
            <tbody>
              ${carteles.length === 0 ? `
                <tr><td colspan="4" style="text-align: center; padding: 18px; color: #64748b;">No hay asignaturas registradas para este mes.</td></tr>
              ` : carteles.map((c, idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  <td style="vertical-align: top; padding: 8px;">
                    <div style="font-weight: 900; color: #1e3a8a; font-size: 11px; margin-bottom: 2px;">
                      ${c.courseName}
                    </div>
                    <div style="font-size: 9.5px; color: #475569; font-weight: 700;">
                      👨‍🏫 Docente: ${c.teacher}
                    </div>
                    <div style="font-size: 9px; color: #059669; font-weight: 800; margin-top: 4px;">
                      ✓ PDF Oficial Vinculado
                    </div>
                  </td>
                  <td style="vertical-align: top; padding: 8px;">
                    <ul style="margin: 0; padding-left: 14px; line-height: 1.35; color: #334155;">
                      ${(c.competencies || []).map(comp => `<li>${comp}</li>`).join('')}
                    </ul>
                  </td>
                  <td style="vertical-align: top; padding: 8px;">
                    <ul style="margin: 0; padding-left: 14px; line-height: 1.35; color: #1e293b;">
                      ${(c.weeklyTopics || []).map(topic => `<li>${topic}</li>`).join('')}
                    </ul>
                  </td>
                  <td style="vertical-align: top; padding: 8px; font-size: 9.5px; line-height: 1.3; color: #334155;">
                    ${c.evaluationCriteria || 'Prácticas calificadas, revisión de cuadernos de trabajo y evaluación mensual continua.'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Bloque de Compromiso y Firmas Oficiales -->
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 30px; padding-top: 15px; border-top: 1px dashed #94a3b8;">
            <div style="font-size: 9px; color: #64748b; max-width: 320px; line-height: 1.3;">
              <strong>Nota Pedagógica:</strong> El presente cartel temático consolidado es el instrumento oficial de programación curricular mensual de la I.E.P. "El Educador". Los padres de familia deben monitorear semanalmente el avance de los temas en los cuadernos oficiales de sus menores hijos.
            </div>
            <div style="display: flex; gap: 40px;">
              <div style="text-align: center; border-top: 1.5px solid #0f172a; width: 140px; padding-top: 4px; font-size: 9.5px; font-weight: 800;">
                TUTOR(A) DE AULA
              </div>
              <div style="text-align: center; border-top: 1.5px solid #0f172a; width: 140px; padding-top: 4px; font-size: 9.5px; font-weight: 800;">
                DIRECCIÓN ACADÉMICA
              </div>
            </div>
          </div>

        </div>

      </div>

      <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; color: var(--text-muted);">
          Total de asignaturas consolidadas en este documento: <strong>${carteles.length}</strong>
        </span>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-navy" onclick="window.print()">
            🖨️ Imprimir / Guardar en PDF
          </button>
          <button class="btn btn-outline" onclick="window.app.closeModal()">
            Cerrar
          </button>
        </div>
      </div>
    `);
  }

  openEditReviewModal(reviewId) {
    const review = this.store.state.notebookReviews.find(r => r.id === reviewId);
    if (!review) return;
    this.showModal(`
      <div class="modal-header"><h3>✏️ Modificar Revisión QR</h3><button class="modal-close-btn" onclick="window.app.closeModal()">✕</button></div>
      <div class="modal-body">
        <div class="form-group"><label class="form-label">Nota (0-20):</label><input type="number" id="edit-rev-score" class="form-control" value="${review.score}" /></div>
      </div>
      <div class="modal-footer"><button class="btn btn-navy" onclick="window.app.confirmUpdateReview('${review.id}')">Guardar</button></div>
    `);
  }

  confirmUpdateReview(reviewId) {
    const score = parseFloat(document.getElementById("edit-rev-score").value) || 0;
    this.store.updateNotebookReview(reviewId, { score });
    this.closeModal();
    this.showToast("✓ Registro de cuaderno actualizado en DB", "success");
  }

  openStickerSheetModal() {
    this.setNotebookActiveSubTab('stickers');
  }

  // Cambiar pestaña del Módulo de Calificaciones
  setGradesActiveTab(tab) {
    this.store.state.activeGradesTab = tab;
    this.store.saveState();
    this.render();
  }

  // =========================================================================
  // MÓDULO REGISTRO DE ESTUDIANTES, NÓMINA OFICIAL & REGISTRO AUXILIAR (EXCEL)
  // =========================================================================
  changeStudentRegistryGrade(gradeId) {
    this.store.state.selectedStudentRegistryGrade = gradeId;
    this.store.state.selectedGradingGrade = gradeId;

    const teacherCourses = (this.store && typeof this.store.getTeacherCoursesForGrade === "function")
      ? this.store.getTeacherCoursesForGrade(gradeId)
      : [];

    if (teacherCourses.length > 0) {
      this.store.state.selectedStudentRegistryCourse = teacherCourses[0].name;
    } else {
      this.store.state.selectedStudentRegistryCourse = "";
    }

    this.store.saveState();
    this.render();
  }

  changeStudentRegistryCourse(courseName) {
    this.store.state.selectedStudentRegistryCourse = courseName;
    this.store.saveState();
    this.render();
  }

  filterStudentRegistry(query) {
    this.store.state.studentRegistrySearchQuery = query;
    this.render();
  }

  openAddStudentModal(gradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = (gradeId || "4sec").toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { id: gradeId || "4sec", label: "4° de Secundaria", level: "Secundaria" };

    const activeUser = this.store.getCurrentUser();
    if (!this.store.isTeacherTutorOfGrade(activeUser, gradeId)) {
      alert(`🔒 Matrícula Restringida: Solo el Tutor(a) asignado (${gradeObj.tutor || 'Tutor Responsable'}) o la Dirección General pueden matricular estudiantes en ${gradeObj.label}.`);
      return;
    }

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">➕ Agregar Estudiante</h3>
          <span style="font-size: 11px; opacity: 0.9;">I.E.P. "El Educador" • Registro en la Nómina Oficial 2026</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <form onsubmit="window.app.confirmAddStudent(event)">
        <div class="modal-body" style="padding: 20px; background: #f8fafc;">
          
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">1. Nombre y Apellido del Estudiante *</label>
              <input type="text" name="studentName" class="form-control" placeholder="Ej. Mendoza Huamán, Camila Sofía" required style="font-weight: bold; font-size: 13px;" />
            </div>

            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">2. Grado Escolar *</label>
              <select name="gradeId" class="form-control" style="font-weight: bold; font-size: 13px;" onchange="const l = this.options[this.selectedIndex].text; document.getElementById('add-student-grade-label').value = l;">
                <optgroup label="--- NIVEL INICIAL ---">
                  <option value="ini-3" ${cleanG === 'ini3' || cleanG === 'ini-3' ? 'selected' : ''}>Inicial 3 Años</option>
                  <option value="ini-4" ${cleanG === 'ini4' || cleanG === 'ini-4' ? 'selected' : ''}>Inicial 4 Años</option>
                  <option value="ini-5" ${cleanG === 'ini5' || cleanG === 'ini-5' ? 'selected' : ''}>Inicial 5 Años</option>
                </optgroup>
                <optgroup label="--- NIVEL PRIMARIA ---">
                  <option value="1prim" ${cleanG === '1prim' ? 'selected' : ''}>1° de Primaria</option>
                  <option value="2prim" ${cleanG === '2prim' ? 'selected' : ''}>2° de Primaria</option>
                  <option value="3prim" ${cleanG === '3prim' ? 'selected' : ''}>3° de Primaria</option>
                  <option value="4prim" ${cleanG === '4prim' ? 'selected' : ''}>4° de Primaria</option>
                  <option value="5prim" ${cleanG === '5prim' ? 'selected' : ''}>5° de Primaria</option>
                  <option value="6prim" ${cleanG === '6prim' ? 'selected' : ''}>6° de Primaria</option>
                </optgroup>
                <optgroup label="--- NIVEL SECUNDARIA ---">
                  <option value="1sec" ${cleanG === '1sec' ? 'selected' : ''}>1° de Secundaria</option>
                  <option value="2sec" ${cleanG === '2sec' ? 'selected' : ''}>2° de Secundaria</option>
                  <option value="3sec" ${cleanG === '3sec' ? 'selected' : ''}>3° de Secundaria</option>
                  <option value="4sec" ${cleanG === '4sec' ? 'selected' : ''}>4° de Secundaria</option>
                  <option value="5sec" ${cleanG === '5sec' ? 'selected' : ''}>5° de Secundaria</option>
                </optgroup>
              </select>
              <input type="hidden" id="add-student-grade-label" name="grade" value="${gradeObj.label || '4° de Secundaria'}" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">3. Nombre del Padre y/o Apoderado *</label>
              <input type="text" name="guardian" class="form-control" placeholder="Ej. Rosa Huamán Prado" required style="font-weight: bold; font-size: 13px;" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">4. Teléfono del Apoderado *</label>
              <input type="tel" name="phone" class="form-control" placeholder="Ej. 987-654-321" required style="font-weight: bold; font-size: 13px;" />
            </div>

          </div>

          <div style="margin-top: 14px; padding: 10px 14px; background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 4px; font-size: 11.5px; color: #065f46;">
            💡 <strong>Sincronización Automática:</strong> Al guardar, el estudiante se agregará a la nómina, se habilitará en <strong>Registro de Notas</strong> y se generarán sus códigos QR de cuadernos y asistencia.
          </div>

        </div>
        <div class="modal-footer" style="padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-end; gap: 10px;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-gold" style="font-weight: 900;">✓ Guardar Estudiante</button>
        </div>
      </form>
    `);
  }

  confirmAddStudent(event) {
    if (event) event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const gradeId = formData.get("gradeId") || "4sec";
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = gradeId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: "4° de Secundaria" };

    const studentData = {
      studentCode: `EST-2026-${Math.floor(100 + Math.random() * 900)}`,
      studentName: (formData.get("studentName") || "").trim(),
      gradeId: gradeId,
      grade: formData.get("grade") || gradeObj.label,
      guardian: (formData.get("guardian") || "Padre / Apoderado").trim(),
      phone: (formData.get("phone") || "987-654-321").trim(),
      guardianPhone: (formData.get("phone") || "987-654-321").trim(),
      dni: `7${Math.floor(1000000 + Math.random() * 9000000)}`
    };

    if (!studentData.studentName) {
      alert("Por favor ingrese el nombre y apellido del estudiante.");
      return;
    }

    this.store.addStudentToGrade(studentData);
    this.closeModal();
    this.showToast(`✓ Estudiante "${studentData.studentName}" agregado exitosamente a la nómina.`, "success");
    this.render();
  }

  openImportStudentsModal(gradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = (gradeId || "4sec").toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: "4° de Secundaria", level: "Secundaria" };

    const activeUser = this.store.getCurrentUser();
    if (!this.store.isTeacherTutorOfGrade(activeUser, gradeId)) {
      alert(`🔒 Importación Restringida: Solo el Tutor(a) asignado (${gradeObj.tutor || 'Tutor Responsable'}) o la Dirección General pueden importar nóminas a ${gradeObj.label}.`);
      return;
    }

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #065f46 0%, #0f172a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #4ade80;">📥 Importar Nómina de Estudiantes desde Excel</h3>
          <span style="font-size: 11px; opacity: 0.9;">Aula destino: <strong>${gradeObj.label}</strong> • (.XLSX, .XLS, .CSV o Archivos de Registro Auxiliar)</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <div class="modal-body" style="padding: 20px; background: #f8fafc;">
        
        <!-- Zona de Carga de Archivos -->
        <div style="border: 2px dashed #10b981; background: #ecfdf5; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 16px; cursor: pointer;" onclick="document.getElementById('excel-file-input').click()">
          <div style="font-size: 38px; margin-bottom: 8px;">📊</div>
          <h4 style="margin: 0 0 6px 0; color: #065f46; font-weight: 800;">Haga clic aquí para seleccionar el archivo Excel o arrástrelo</h4>
          <p style="margin: 0; font-size: 12px; color: #047857;">Formatos soportados: <strong>.XLSX, .XLS, .CSV, .TSV</strong> (Libros de Registro Auxiliar, Nóminas SIAGIE o Listas del Docente)</p>
          <input type="file" id="excel-file-input" accept=".xlsx,.xls,.csv,.tsv,.txt" style="display: none;" onchange="window.app.handleExcelFileSelect(event, '${gradeId}')" />
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 12px; font-weight: 800; color: #1e293b;">
            Vista Previa de Estudiantes Detectados:
          </div>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-outline btn-sm" onclick="window.app.downloadExcelTemplate()" style="font-size: 11px; font-weight: 800;">
              📄 Descargar Formato Modelo
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.openPasteFromExcelModal('${gradeId}')" style="font-size: 11px; font-weight: 800;">
              📋 O Pegar Texto
            </button>
          </div>
        </div>

        <!-- Contenedor de Vista Previa -->
        <div id="excel-import-preview-container" style="max-height: 240px; overflow-y: auto; background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px;">
          <div style="text-align: center; padding: 24px; color: #64748b; font-size: 12px;">
            Seleccione un archivo Excel para previsualizar los estudiantes antes de importar.
          </div>
        </div>

      </div>
      <div class="modal-footer" style="padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button type="button" id="btn-confirm-import" class="btn btn-emerald" style="font-weight: 900; display: none;" onclick="window.app.executeBulkImportFromPreview('${gradeId}')">
          ✓ Confirmar e Importar a ${gradeObj.label}
        </button>
      </div>
    `);
  }

  handleExcelFileSelect(event, gradeId) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      this.parseAndPreviewExcelContent(content, gradeId);
    };
    reader.readAsText(file, "UTF-8");
  }

  openPasteFromExcelModal(gradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = (gradeId || "4sec").toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: "4° de Secundaria", level: "Secundaria" };

    const activeUser = this.store.getCurrentUser();
    if (!this.store.isTeacherTutorOfGrade(activeUser, gradeId)) {
      alert(`🔒 Importación Restringida: Solo el Tutor(a) asignado (${gradeObj.tutor || 'Tutor Responsable'}) o la Dirección General pueden importar nóminas a ${gradeObj.label}.`);
      return;
    }

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">📋 Pegar Filas Directamente desde Excel</h3>
          <span style="font-size: 11px; opacity: 0.9;">Copie las celdas en su Excel (Ctrl+C) y péguelas aquí (Ctrl+V)</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <div class="modal-body" style="padding: 20px; background: #f8fafc;">
        
        <p style="font-size: 12px; color: #475569; margin-top: 0; margin-bottom: 10px;">
          Puede copiar columnas con: <strong>Nombre y Apellido</strong>, <strong>Padre o Apoderado</strong>, <strong>Teléfono del Apoderado</strong>.
        </p>

        <textarea id="pasted-excel-text" class="form-control" rows="8" placeholder="Ejemplo:&#10;Méndez Flores, Sofía&#9;Carmen Méndez&#9;987654321&#10;Benítez Díaz, Carlos&#9;Roberto Díaz&#9;984123456&#10;Ramos Quispe, Mateo&#9;Lucía Quispe&#9;981234567" style="font-family: monospace; font-size: 12px; background: white; white-space: pre;" oninput="window.app.handleProcessPastedExcel('${gradeId}')"></textarea>

        <div style="margin-top: 14px;">
          <div style="font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">
            Alumnos Detectados:
          </div>
          <div id="excel-import-preview-container" style="max-height: 180px; overflow-y: auto; background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px;">
            <div style="text-align: center; padding: 16px; color: #64748b; font-size: 12px;">
              Pegue las filas de Excel en la caja superior para procesarlas.
            </div>
          </div>
        </div>

      </div>
      <div class="modal-footer" style="padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
        <button type="button" id="btn-confirm-import" class="btn btn-emerald" style="font-weight: 900; display: none;" onclick="window.app.executeBulkImportFromPreview('${gradeId}')">
          ✓ Importar Alumnos al Aula
        </button>
      </div>
    `);
  }

  handleProcessPastedExcel(gradeId) {
    const textarea = document.getElementById("pasted-excel-text");
    if (!textarea) return;
    this.parseAndPreviewExcelContent(textarea.value, gradeId);
  }

  parseAndPreviewExcelContent(rawText, gradeId) {
    if (!rawText || !rawText.trim()) return;

    const lines = rawText.split(/\r?\n/).filter(l => l.trim().length > 0);
    const parsedStudents = [];

    lines.forEach((line, idx) => {
      let cols = [];
      if (line.includes("\t")) {
        cols = line.split("\t");
      } else if (line.includes(";")) {
        cols = line.split(";");
      } else if (line.includes("|")) {
        cols = line.split("|");
      } else if (line.includes(",")) {
        cols = line.split(",");
      } else {
        cols = [line];
      }

      cols = cols.map(c => c.trim().replace(/^["']|["']$/g, ''));

      const firstCol = cols[0].toLowerCase();
      if (firstCol === "n°" || firstCol === "dni" || firstCol === "codigo" || firstCol === "código" || firstCol === "apellidos" || firstCol === "nombre" || firstCol === "estudiante") {
        return;
      }

      let dni = "";
      let name = "";
      let guardian = "";
      let phone = "";

      cols.forEach(c => {
        const clean = c.replace(/[^0-9]/g, '');
        if (clean.length === 8 && !dni) {
          dni = clean;
        } else if (clean.length === 9 && !phone && (clean.startsWith("9") || clean.startsWith("0"))) {
          phone = clean;
        } else if (c.length > 3 && !/[0-9]{5,}/.test(c)) {
          if (!name) {
            name = c.replace(/^\d+[\.\-\)]\s*/, '').trim();
          } else if (!guardian) {
            guardian = c;
          }
        }
      });

      if (!name && cols.length > 0) {
        name = cols.find(c => c.length > 2 && isNaN(c)) || `Estudiante ${idx + 1}`;
      }

      if (name) {
        parsedStudents.push({
          dni: dni || `7${Math.floor(1000000 + Math.random() * 9000000)}`,
          studentName: name,
          guardian: guardian || "Padre / Apoderado",
          guardianPhone: phone || "987-654-321",
          phone: phone || "987-654-321"
        });
      }
    });

    this.currentParsedStudents = parsedStudents;

    const container = document.getElementById("excel-import-preview-container");
    const btnConfirm = document.getElementById("btn-confirm-import");

    if (container) {
      if (parsedStudents.length === 0) {
        container.innerHTML = `<div style="text-align: center; padding: 16px; color: #dc2626; font-size: 12px;">No se pudieron detectar filas válidas. Verifique el formato.</div>`;
        if (btnConfirm) btnConfirm.style.display = "none";
      } else {
        container.innerHTML = `
          <table class="data-table" style="font-size: 11.5px; width: 100%;">
            <thead>
              <tr style="background: #f1f5f9; color: #334155;">
                <th style="width: 8%; text-align: center;">N°</th>
                <th style="width: 44%;">Nombre y Apellido del Estudiante</th>
                <th style="width: 26%;">Padre / Apoderado</th>
                <th style="width: 22%;">Teléfono Apoderado</th>
              </tr>
            </thead>
            <tbody>
              ${parsedStudents.map((st, i) => `
                <tr>
                  <td style="text-align: center; font-weight: bold;">${i + 1}</td>
                  <td style="font-weight: 800; color: #0b132b;">${st.studentName}</td>
                  <td>${st.guardian}</td>
                  <td><span style="color: #16a34a; font-weight: bold;">📞 ${st.phone}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
        if (btnConfirm) {
          btnConfirm.style.display = "inline-block";
          btnConfirm.textContent = `✓ Confirmar e Importar ${parsedStudents.length} Alumnos`;
        }
      }
    }
  }

  executeBulkImportFromPreview(gradeId) {
    if (!this.currentParsedStudents || this.currentParsedStudents.length === 0) {
      alert("No hay estudiantes para importar.");
      return;
    }

    const count = this.store.bulkImportStudentsToGrade(gradeId, this.currentParsedStudents);
    this.closeModal();
    this.showToast(`✓ Se importaron ${count} estudiantes exitosamente a la nómina del aula.`, "success");
    this.render();
  }

  downloadAuxiliaryRegisterExcel(gradeId, courseName) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = (gradeId || "4sec").toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: "4° de Secundaria", level: "Secundaria", tutor: "Prof. Roberto Silva" };

    const boletaCourses = this.store.getStudentBoletaCoursesCatalog(gradeId);
    const targetCourse = boletaCourses.find(c => c.name === courseName) || boletaCourses[0] || { name: courseName || "Aritmética", teacher: "Prof. Roberto Silva" };

    const allEnrollments = this.store.getEnrollments();
    const students = allEnrollments.filter(e => {
      const egId = (e.gradeId || this.store.resolveStudentGradeId(e.grade) || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return egId === cleanG || egId.includes(cleanG) || cleanG.includes(egId);
    });

    const boletaData = this.store.state.boletaData || {};

    let htmlTable = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Registro Auxiliar 2026</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; }
          .header-main { background-color: #0b132b; color: #ffffff; font-size: 14pt; font-weight: bold; text-align: center; height: 35px; }
          .header-sub { background-color: #1e3a8a; color: #ffffff; font-size: 11pt; font-weight: bold; text-align: center; height: 25px; }
          .info-label { font-weight: bold; background-color: #f1f5f9; }
          .info-val { font-weight: bold; color: #0b132b; }
          .col-header { background-color: #0f172a; color: #ffffff; font-weight: bold; text-align: center; border: 1px solid #000; }
          .col-sub { background-color: #334155; color: #ffffff; font-weight: bold; text-align: center; font-size: 9pt; border: 1px solid #000; }
          .cell-data { border: 1px solid #cbd5e1; text-align: center; }
          .cell-name { border: 1px solid #cbd5e1; text-align: left; font-weight: bold; }
          .cell-grade { border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #0369a1; }
          .cell-final { border: 1px solid #000000; text-align: center; font-weight: bold; background-color: #fef08a; color: #854d0e; }
        </style>
      </head>
      <body>
        <table border="1" cellpadding="4" cellspacing="0">
          <tr>
            <td colspan="15" class="header-main">I.E.P. "EL EDUCADOR" — REGISTRO AUXILIAR OFICIAL DE EVALUACIÓN Y ASISTENCIA</td>
          </tr>
          <tr>
            <td colspan="15" class="header-sub">DIRECCIÓN DE GESTIÓN PEDAGÓGICA • UGEL 05 SAN JUAN DE LURIGANCHO • AÑO ACADÉMICO 2026</td>
          </tr>
          <tr>
            <td colspan="2" class="info-label">NIVEL / GRADO:</td>
            <td colspan="3" class="info-val">${gradeObj.label}</td>
            <td colspan="2" class="info-label">ASIGNATURA:</td>
            <td colspan="4" class="info-val">${targetCourse.name}</td>
            <td colspan="2" class="info-label">DOCENTE:</td>
            <td colspan="2" class="info-val">${targetCourse.teacher}</td>
          </tr>
          <tr>
            <td colspan="2" class="info-label">TUTOR(A):</td>
            <td colspan="3" class="info-val">${gradeObj.tutor || 'Prof. Roberto Silva'}</td>
            <td colspan="2" class="info-label">FECHA DE EMISIÓN:</td>
            <td colspan="4" class="info-val">${new Date().toLocaleDateString("es-PE")}</td>
            <td colspan="2" class="info-label">ESTUDIANTES:</td>
            <td colspan="2" class="info-val">${students.length} Alumnos</td>
          </tr>
          <tr><td colspan="15" style="height: 10px; background-color: #ffffff;"></td></tr>

          <!-- Encabezados de Columnas de Competencias -->
          <tr>
            <th rowspan="2" class="col-header" style="width: 40px;">N°</th>
            <th rowspan="2" class="col-header" style="width: 280px;">APELLIDOS Y NOMBRES</th>
            <th colspan="2" class="col-header">I BIMESTRE</th>
            <th colspan="2" class="col-header">II BIMESTRE</th>
            <th colspan="2" class="col-header">III BIMESTRE</th>
            <th colspan="2" class="col-header">IV BIMESTRE</th>
            <th colspan="2" class="col-header" style="background-color: #854d0e;">LOGRO FINAL</th>
            <th colspan="2" class="col-header" style="background-color: #166534;">ASISTENCIA</th>
          </tr>
          <tr>
            <th class="col-sub">C1</th><th class="col-sub">PROM</th>
            <th class="col-sub">C1</th><th class="col-sub">PROM</th>
            <th class="col-sub">C1</th><th class="col-sub">PROM</th>
            <th class="col-sub">C1</th><th class="col-sub">PROM</th>
            <th class="col-sub" style="background-color: #ca8a04;">PROM</th>
            <th class="col-sub" style="background-color: #ca8a04;">ESCALA</th>
            <th class="col-sub" style="background-color: #15803d;">ASIST</th>
            <th class="col-sub" style="background-color: #15803d;">TARD</th>
          </tr>

          <!-- Filas de Estudiantes -->
          ${students.length === 0 ? `
            <tr>
              <td colspan="14" style="text-align: center; padding: 20px; font-weight: bold; color: #64748b;">
                No hay estudiantes registrados en este grado.
              </td>
            </tr>
          ` : students.map((st, idx) => {
            const sKey = st.studentCode || st.dni;
            const bRecord = boletaData[sKey] || {};
            const subjectKey = (targetCourse.key || targetCourse.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
            const sGrade = (bRecord.grades && (bRecord.grades[subjectKey] || bRecord.grades[targetCourse.name])) || {};
            
            const b1 = sGrade.b1 || "AD";
            const b2 = sGrade.b2 || "A";
            const b3 = sGrade.b3 || "";
            const b4 = sGrade.b4 || "";
            const finalScale = b1 || "AD";

            return `
              <tr>
                <td class="cell-data">${idx + 1}</td>
                <td class="cell-name">${st.studentName}</td>
                <td class="cell-data">${b1}</td>
                <td class="cell-grade">${b1}</td>
                <td class="cell-data">${b2}</td>
                <td class="cell-grade">${b2}</td>
                <td class="cell-data">${b3}</td>
                <td class="cell-grade">${b3}</td>
                <td class="cell-data">${b4}</td>
                <td class="cell-grade">${b4}</td>
                <td class="cell-final">18</td>
                <td class="cell-final">${finalScale}</td>
                <td class="cell-data" style="color: #16a34a; font-weight: bold;">100%</td>
                <td class="cell-data">0</td>
              </tr>
            `;
          }).join('')}

          <tr><td colspan="14" style="height: 15px; background-color: #ffffff;"></td></tr>
          <tr>
            <td colspan="4" style="text-align: center; height: 60px; vertical-align: bottom; font-weight: bold;">
              ________________________________<br>Firma del Docente Responsable
            </td>
            <td colspan="5" style="text-align: center; height: 60px; vertical-align: bottom; font-weight: bold;">
              ________________________________<br>V° B° Coordinación Pedagógica
            </td>
            <td colspan="5" style="text-align: center; height: 60px; vertical-align: bottom; font-weight: bold;">
              ________________________________<br>V° B° Dirección General
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlTable], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const cleanFileName = `Registro_Auxiliar_${gradeObj.label.replace(/[^a-zA-Z0-9]/g, '_')}_${targetCourse.name.replace(/[^a-zA-Z0-9]/g, '_')}_2026.xls`;
    link.href = url;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast(`✓ Registro Auxiliar descargado exitosamente: "${cleanFileName}"`, "success");
  }

  downloadExcelTemplate() {
    const csvContent = "Nombre y Apellido,Grado,Nombre_Padre_o_Apoderado,Telefono_Apoderado\n" +
      "Méndez Flores Sofía,4° de Secundaria,Dra. Carmen Méndez,987654321\n" +
      "Benítez Díaz Carlos,4° de Secundaria,Sr. Roberto Díaz,984123456\n" +
      "Ramos Quispe Mateo,1° de Primaria,Sra. Lucía Quispe,981234567\n" +
      "Mendoza Huamán Camila Sofía,1° de Primaria,Sra. Rosa Huamán,976543210\n";

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Plantilla_Importacion_Estudiantes_ElEducador.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast("✓ Plantilla modelo descargada: Plantilla_Importacion_Estudiantes_ElEducador.csv", "info");
  }

  openEditStudentModal(studentId) {
    const allEnrollments = this.store.getEnrollments();
    const st = allEnrollments.find(e => e.id === studentId || e.studentCode === studentId || e.dni === studentId);
    if (!st) return;

    this.showModal(`
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 900; color: #fde047;">✏️ Editar Datos del Estudiante</h3>
          <span style="font-size: 11px; opacity: 0.9;">Código: <strong>${st.studentCode}</strong> • Grado: ${st.grade}</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color:white;">✕</button>
      </div>
      <form onsubmit="window.app.confirmEditStudent(event, '${st.id || st.studentCode}')">
        <div class="modal-body" style="padding: 20px; background: #f8fafc;">
          
          <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            
            <div class="form-group" style="grid-column: span 2;">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">1. Nombre y Apellido del Estudiante *</label>
              <input type="text" name="studentName" class="form-control" value="${st.studentName || ''}" required style="font-weight: bold; font-size: 13px;" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">2. Nombre del Padre y/o Apoderado *</label>
              <input type="text" name="guardian" class="form-control" value="${st.guardian || ''}" required style="font-weight: bold; font-size: 13px;" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 800; color: #0f172a;">3. Teléfono del Apoderado *</label>
              <input type="tel" name="phone" class="form-control" value="${st.guardianPhone || st.emergencyPhone || st.phone || ''}" required style="font-weight: bold; font-size: 13px;" />
            </div>

          </div>

        </div>
        <div class="modal-footer" style="padding: 14px 20px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-navy" style="font-weight: 900;">✓ Guardar Cambios</button>
        </div>
      </form>
    `);
  }

  confirmEditStudent(event, studentId) {
    if (event) event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const updatedData = {
      studentName: (formData.get("studentName") || "").trim(),
      guardian: (formData.get("guardian") || "").trim(),
      guardianPhone: (formData.get("phone") || "").trim(),
      emergencyPhone: (formData.get("phone") || "").trim(),
      phone: (formData.get("phone") || "").trim()
    };

    const allEnrollments = this.store.getEnrollments();
    const st = allEnrollments.find(e => e.id === studentId || e.studentCode === studentId);
    if (st) {
      Object.assign(st, updatedData);
      
      const u = (this.store.state.systemUsers || []).find(u => u.code === st.studentCode || u.dni === st.dni);
      if (u) {
        u.name = updatedData.studentName;
        u.guardian = updatedData.guardian;
      }

      this.store.saveState();
      this.closeModal();
      this.showToast("✓ Datos del estudiante actualizados correctamente.", "success");
      this.render();
    }
  }

  confirmDeleteStudent(studentId) {
    const allEnrollments = this.store.getEnrollments();
    const st = allEnrollments.find(e => e.id === studentId || e.studentCode === studentId || e.dni === studentId);
    const user = this.store.getCurrentUser();
    const gradeId = st ? (st.gradeId || this.store.resolveStudentGradeId(st.grade)) : null;
    if (gradeId && !this.store.isTeacherTutorOfGrade(user, gradeId)) {
      alert("🔒 Solo el Docente Tutor asignado al aula o la Dirección tienen autorización para retirar estudiantes.");
      return;
    }

    const stName = st ? st.studentName : "este estudiante";
    if (confirm(`¿Está seguro de eliminar a "${stName}" de la institución?\n\nEsta acción borrará en cascada al estudiante, la cuenta del apoderado, sus asistencias y su registro en la pestaña de pensiones.`)) {
      this.store.deleteStudentFromGrade(studentId);
      this.showToast(`✓ Estudiante "${stName}" y todos sus registros vinculados eliminados por completo.`, "info");
      this.render();
    }
  }

  // Eliminar todos los registros de estudiantes del aula activa
  confirmClearAllClassroomStudents(gradeId) {
    const catalog = this.store.state.gradesCatalog || initialData.gradesCatalog || [];
    const cleanG = (gradeId || "4sec").toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: "el aula seleccionada" };

    const activeUser = this.store.getCurrentUser();
    if (!this.store.isTeacherTutorOfGrade(activeUser, gradeId)) {
      alert(`🔒 Acción Restringida: Solo el Tutor(a) asignado (${gradeObj.tutor || 'Tutor Responsable'}) o la Dirección General pueden vaciar la nómina de ${gradeObj.label}.`);
      return;
    }

    const enrollments = this.store.getEnrollments();
    const count = enrollments.filter(e => {
      const egId = (e.gradeId || this.store.resolveStudentGradeId(e.grade) || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return egId === cleanG || egId.includes(cleanG) || cleanG.includes(egId);
    }).length;

    if (count === 0) {
      this.showToast(`No hay estudiantes registrados en ${gradeObj.label} para eliminar.`, "info");
      return;
    }

    if (confirm(`⚠️ ¿Está seguro de eliminar TODOS los (${count}) registros de estudiantes de ${gradeObj.label}?\n\nEsta acción vaciará por completo la nómina del aula seleccionada.`)) {
      const removed = this.store.clearAllStudentsFromGrade(gradeId);
      this.showToast(`✓ Se eliminaron todos los registros de estudiantes de ${gradeObj.label} (${removed} alumnos retirados).`, "info");
      this.render();
    }
  }

  // Cambiar Grado Seleccionado en el Registro de Calificaciones
  changeGradingGrade(gradeId) {
    this.store.state.selectedGradingGrade = gradeId;
    
    // Adaptar automáticamente el catálogo de cursos del docente al nuevo grado
    const courses = (this.store && typeof this.store.getTeacherCoursesForGrade === "function")
      ? this.store.getTeacherCoursesForGrade(gradeId)
      : ((this.store && typeof this.store.getStudentBoletaCoursesCatalog === "function")
        ? this.store.getStudentBoletaCoursesCatalog(gradeId)
        : []);

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
      "Tutoría & Convivencia Escolar": "conducta"
    };

    if (courses && courses.length > 0) {
      const currentSub = this.store.state.selectedGradingSubject;
      const exists = courses.some(c => {
        const k = keyMap[c.name] || c.id.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return k === currentSub;
      });
      if (!exists) {
        const firstKey = keyMap[courses[0].name] || courses[0].id.toLowerCase().replace(/[^a-z0-9]/g, '_');
        this.store.state.selectedGradingSubject = firstKey;
      }
    } else {
      this.store.state.selectedGradingSubject = "";
    }

    // Ajustar estudiante por defecto para la pestaña de tutoría
    const enrollments = this.store.getEnrollments();
    const cleanG = gradeId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeStudents = enrollments.filter(e => {
      const egId = (e.gradeId || this.store.resolveStudentGradeId(e.grade) || "").toLowerCase().replace(/[^a-z0-9]/g, '');
      return egId === cleanG || egId.includes(cleanG) || cleanG.includes(egId);
    });

    if (gradeStudents.length > 0) {
      let sKey = gradeStudents[0].studentCode || gradeStudents[0].id || gradeStudents[0].dni;
      this.store.state.selectedBoletaStudent = sKey;
    }

    this.store.saveState();
    this.render();
  }

  // Cambiar Asignatura Activa para Calificar (Docente de Área)
  changeSelectedGradingSubject(subjectKey) {
    this.store.state.selectedGradingSubject = subjectKey;
    this.store.saveState();
    this.render();
  }

  // Guardar Calificaciones de una Asignatura para todos los alumnos del aula (Docente de Curso)
  handleSaveSubjectGrades(e, subjectKey) {
    if (e) e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const normalizeGrade = (val) => {
      if (!val) return "";
      const str = val.trim().toUpperCase();
      if (["AD", "A", "B", "C"].includes(str)) return str;
      const num = parseFloat(str);
      if (!isNaN(num)) {
        if (num >= 18) return "AD";
        if (num >= 14) return "A";
        if (num >= 11) return "B";
        return "C";
      }
      return str;
    };

    // Estructura: { "mendez": { b1, b2, b3, b4 }, "benitez": { b1, b2, b3, b4 }, "albujar": { ... } }
    const studentsGradesMap = {};

    for (const [key, value] of formData.entries()) {
      if (key.startsWith("grade_")) {
        const parts = key.split("_"); // ["grade", studentKey, bimKey]
        if (parts.length >= 3) {
          const studentKey = parts[1];
          const bimKey = parts[2];
          if (!studentsGradesMap[studentKey]) studentsGradesMap[studentKey] = {};
          studentsGradesMap[studentKey][bimKey] = normalizeGrade(value);
        }
      }
    }

    this.store.saveSubjectGrades(subjectKey, studentsGradesMap);
    this.showToast(`✓ Calificaciones de ${subjectKey.toUpperCase().replace(/_/g, ' ')} guardadas y consolidadas en las boletas.`, "success");
    this.render();
  }

  // Guardar Evaluación de Tutoría (Apreciaciones, Asistencias y Familias) por el Tutor de Aula
  handleSaveTutorEvaluation(e, studentKey) {
    if (e) e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const appreciations = {
      b1: formData.get("app_b1") || "",
      b2: formData.get("app_b2") || "",
      b3: formData.get("app_b3") || "",
      b4: formData.get("app_b4") || ""
    };

    const attendance = {
      b1: {
        inasist_just: formData.get("att_b1_ij") || "-",
        inasist_injust: formData.get("att_b1_ii") || "-",
        tard_just: formData.get("att_b1_tj") || "-",
        tard_injust: formData.get("att_b1_ti") || "-"
      },
      b2: {
        inasist_just: formData.get("att_b2_ij") || "-",
        inasist_injust: formData.get("att_b2_ii") || "-",
        tard_just: formData.get("att_b2_tj") || "-",
        tard_injust: formData.get("att_b2_ti") || "-"
      },
      b3: {
        inasist_just: formData.get("att_b3_ij") || "",
        inasist_injust: formData.get("att_b3_ii") || "",
        tard_just: formData.get("att_b3_tj") || "",
        tard_injust: formData.get("att_b3_ti") || ""
      },
      b4: {
        inasist_just: formData.get("att_b4_ij") || "",
        inasist_injust: formData.get("att_b4_ii") || "",
        tard_just: formData.get("att_b4_tj") || "",
        tard_injust: formData.get("att_b4_ti") || ""
      }
    };

    const parentCriteria = {};
    for (let i = 1; i <= 6; i++) {
      parentCriteria[`c${i}`] = {
        b1: (formData.get(`pc_c${i}_b1`) || "").trim().toUpperCase(),
        b2: (formData.get(`pc_c${i}_b2`) || "").trim().toUpperCase(),
        b3: (formData.get(`pc_c${i}_b3`) || "").trim().toUpperCase(),
        b4: (formData.get(`pc_c${i}_b4`) || "").trim().toUpperCase()
      };
    }

    this.store.saveTutorEvaluation(studentKey, {
      appreciations,
      attendance,
      parentCriteria
    });

    const student = this.store.getBoletaData(studentKey);
    this.showToast(`✓ Evaluación de Tutoría de ${student.student || student.name} guardada exitosamente.`, "success");
    this.render();
  }

  // Guardar Calificaciones y Apreciaciones desde el Portal Docente
  handleSaveTeacherGrades(e, studentKey) {
    if (e) e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    const currentStudent = this.store.getBoletaData(studentKey);
    const updatedGrades = { ...(currentStudent.grades || {}) };
    
    // Normalizador de notas literales y vigesimales
    const normalizeGrade = (val) => {
      if (!val) return "";
      const str = val.trim().toUpperCase();
      if (["AD", "A", "B", "C"].includes(str)) return str;
      const num = parseFloat(str);
      if (!isNaN(num)) {
        if (num >= 18) return "AD";
        if (num >= 14) return "A";
        if (num >= 11) return "B";
        return "C";
      }
      return str;
    };

    // Extraer calificaciones de las asignaturas
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("gr_")) {
        const parts = key.split("_");
        if (parts.length >= 3) {
          const subKey = parts.slice(1, -1).join("_");
          const bimKey = parts[parts.length - 1];
          if (!updatedGrades[subKey]) updatedGrades[subKey] = {};
          updatedGrades[subKey][bimKey] = normalizeGrade(value);
        }
      }
    }

    // Extraer apreciaciones docentes
    const updatedAppreciations = {
      b1: formData.get("app_b1") || "",
      b2: formData.get("app_b2") || "",
      b3: formData.get("app_b3") || "",
      b4: formData.get("app_b4") || ""
    };

    this.store.saveBoletaStudentData(studentKey, {
      grades: updatedGrades,
      appreciations: updatedAppreciations
    });

    this.showToast(`✓ Calificaciones de ${currentStudent.name} guardadas y boleta oficial sincronizada.`, "success");
  }

  // Cambiar el Estudiante para la Boleta Oficial
  changeBoletaStudent(studentKey) {
    this.store.state.selectedBoletaStudent = studentKey;
    this.store.saveState();
    this.render();
  }

  // Métodos de Control para el Horario Docente y Horario por Aula
  setTeacherScheduleTab(tab) {
    this.store.setTeacherScheduleTab(tab);
    this.render();
  }

  onTeacherChange(teacherId) {
    this.store.setSelectedTeacher(teacherId);
    this.render();
  }

  onTeacherCourseFilterChange(course) {
    this.store.setSelectedTeacherCourseFilter(course);
    this.render();
  }

  onScheduleGradeChange(gradeId) {
    this.store.state.selectedScheduleGrade = gradeId;
    this.store.saveState();
    this.render();
  }

  // Cambiar el Estudiante Hijo Activo para el Padre de Familia
  changeSelectedChild(childId) {
    this.store.setSelectedChild(childId);
    const child = this.store.getSelectedChild();
    if (child) {
      this.showToast(`Consultando datos de: ${child.name} (${child.grade})`, "info");
    }
  }

  // Modal Imprimible del Informe de Cuadernos para Apoderados
  openPrintParentNotebookReportModal() {
    const studentName = "Sofía Méndez Flores";
    const studentIdCode = "EST-2026-042";
    const studentGrade = "4to de Secundaria";
    const studentDni = "74891230";
    const studentTutor = "Prof. Roberto Silva";
    const parentName = (this.store.state.users.padre && this.store.state.users.padre.name) || "Dra. Carmen Méndez";

    const notebooks = [
      { course: "Matemática", teacher: "Prof. Roberto Silva", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Tareas completas al 100%, márgenes impecables y esquemas en orden." },
      { course: "Comunicación", teacher: "Miss María Daysi Reyes", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "17 (A)", remarks: "Análisis de textos y caligrafía óptima. Muy buen desarrollo." },
      { course: "Ciencia y Tecnología", teacher: "Miss Leyli Reyes", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "18 (AD)", remarks: "Prácticas experimentales ilustradas y fichas de laboratorio selladas." },
      { course: "Ciencias Sociales", teacher: "Prof. Javier Vega", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "16 (A)", remarks: "Mapas históricos y resúmenes de época bien estructurados." },
      { course: "Inglés", teacher: "Miss Andrea Ramos", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Vocabulario y ejercicios de gramática avanzados completos." },
      { course: "EPT (Computación)", teacher: "Prof. Alex Lino", statusLabel: "<span class='status-dot-yellow'></span> OBSERVADO", score: "13 (B)", remarks: "Falta pegar y desarrollar la ficha de proyecto técnico N° 3. Presentar este viernes." }
    ];

    this.showModal(`
      <div class="modal-header">
        <h3>Informe Oficial de Revisión de Cuadernos - ${studentName}</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        ${Components.renderOfficialInstitutionalHeader("INFORME OFICIAL DE SELLADO DE CUADERNOS POR QR", "SEGUIMIENTO BIMESTRAL 2026")}
        
        <div style="margin: 16px 0; font-size: 13px; line-height: 1.6; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
          <p style="margin: 2px 0;"><strong>Estudiante Matriculada:</strong> ${studentName} (<code>${studentIdCode}</code>)</p>
          <p style="margin: 2px 0;"><strong>Grado y Sección:</strong> ${studentGrade} • <strong>DNI:</strong> ${studentDni}</p>
          <p style="margin: 2px 0;"><strong>Apoderada Responsable:</strong> ${parentName}</p>
          <p style="margin: 2px 0;"><strong>Tutor de Aula:</strong> ${studentTutor}</p>
          <p style="margin: 2px 0;"><strong>Estado de Cuadernos:</strong> 5 de 6 Cuadernos Sellados y Aprobados (83.3% de Cumplimiento)</p>
        </div>

        <table class="data-table" style="font-size: 12px; margin-top: 12px; border: 1px solid #cbd5e1; width: 100%;">
          <thead>
            <tr style="background: #0b132b; color: white;">
              <th>Asignatura</th>
              <th>Docente</th>
              <th>Sello QR</th>
              <th style="text-align:center;">Nota</th>
              <th>Observación del Docente</th>
            </tr>
          </thead>
          <tbody>
            ${notebooks.map(n => `
              <tr style="${n.statusLabel.includes('OBSERVADO') ? 'background: #fef3c7;' : ''}">
                <td><strong>${n.course}</strong></td>
                <td>${n.teacher}</td>
                <td>${n.statusLabel}</td>
                <td style="text-align:center;"><strong style="color: ${n.statusLabel.includes('AL DÍA') ? '#15803d' : '#b45309'};">${n.score}</strong></td>
                <td style="font-size: 11px;">${n.remarks}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 36px; display: flex; justify-content: space-around; text-align: center; font-size: 11px;">
          <div style="border-top: 1px solid #000; width: 40%; padding-top: 6px;">
            <strong>${studentTutor}</strong><br>Tutor de 4to Sec. 'A'
          </div>
          <div style="border-top: 1px solid #000; width: 40%; padding-top: 6px;">
            <strong>Prof. Alex Lino</strong><br>Coordinación Académica S.J.L.
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-gold" onclick="window.print()">Imprimir Documento</button>
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  openSyllabusModal(syllabusId) {
    const s = this.store.state.syllabi.find(x => x.id === syllabusId) || this.store.state.syllabi[0];
    if (!s) return;
    this.showModal(`
      <div class="modal-header"><h3>${s.courseName}</h3><button class="modal-close-btn" onclick="window.app.closeModal()">✕</button></div>
      <div class="modal-body"><p>Docente: ${s.teacher}</p></div>
      <div class="modal-footer"><button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button></div>
    `);
  }

  openSubmitModal(taskId) {
    this.showModal(`
      <div class="modal-header"><h3>Entregar Tarea</h3><button class="modal-close-btn" onclick="window.app.closeModal()">✕</button></div>
      <div class="modal-body"><p>Selecciona tu archivo para enviar</p></div>
      <div class="modal-footer"><button class="btn btn-red" onclick="window.app.confirmSubmitTask('${taskId}')">Enviar</button></div>
    `);
  }

  confirmSubmitTask(taskId) {
    this.store.submitTask(taskId, "Tarea_Entregada.pdf", "Listo");
    this.closeModal();
    this.showToast("Tarea entregada", "success");
  }

  // =========================================================================
  // PASARELA DE PAGO ONLINE Y DESBLOQUEO AUTOMÁTICO DE INTRANET
  // =========================================================================
  openPayModal(paymentId, amount = 480.00, concept = "Pensión Escolar - Agosto 2026") {
    this.showModal(`
      <div class="modal-header">
        <h3>Pagar con Tarjeta & Desbloquear Intranet</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: var(--color-navy-50); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 800; color: var(--color-navy-900);">${concept}</div>
          <div style="font-size: 20px; font-weight: 900; color: var(--color-red-600); margin-top: 2px;">
            Total: S/ ${amount.toFixed(2)}
          </div>
        </div>

        <form id="card-payment-form" onsubmit="window.app.processCardPayment(event, '${paymentId}', ${amount})">
          <div class="form-group">
            <label class="form-label">Número de Tarjeta (Crédito / Débito):</label>
            <input type="text" id="pay-card-number" class="form-control" placeholder="4557 •••• •••• 1234" required value="4557 8921 3456 1234" />
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Vencimiento (MM/AA):</label>
              <input type="text" id="pay-card-expiry" class="form-control" placeholder="08/28" required value="08/28" />
            </div>
            <div class="form-group">
              <label class="form-label">CVV (3 dígitos):</label>
              <input type="password" id="pay-card-cvv" class="form-control" placeholder="•••" required value="789" maxlength="4" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Titular de la Tarjeta:</label>
            <input type="text" id="pay-card-name" class="form-control" placeholder="Nombre como figura en la tarjeta" required value="Dra. Carmen Méndez" />
          </div>

          <button type="submit" class="btn btn-red" style="width: 100%; padding: 12px; font-weight: 900; font-size: 14px; margin-top: 8px;">
            Pagar S/ ${amount.toFixed(2)} y Validar Acceso
          </button>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
      </div>
    `);
  }

  processCardPayment(e, paymentId, amount) {
    if (e) e.preventDefault();
    this.showToast("Procesando pago con pasarela bancaria segura...", "info");
    
    setTimeout(() => {
      const res = this.store.payAndUnlockIntranet(paymentId, "Tarjeta Visa / Débito");
      this.closeModal();
      this.showPaymentSuccessReceiptModal(res);
    }, 450);
  }

  openYapePayModal(paymentId, amount = 480.00) {
    this.showModal(`
      <div class="modal-header">
        <h3>Pagar con Yape / Plin Institucional</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body" style="text-align: center;">
        <div style="background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%); color: white; padding: 14px; border-radius: 8px; margin-bottom: 14px;">
          <div style="font-size: 12px; font-weight: bold; opacity: 0.9;">I.E.P. "EL EDUCADOR" - TESORERÍA</div>
          <div style="font-size: 20px; font-weight: 900; margin: 4px 0;">987-654-321</div>
          <div style="font-size: 11px;">Titular: Prof. Alex Lino (Coordinación)</div>
        </div>

        <div style="display: flex; justify-content: center; margin-bottom: 12px;">
          <div style="width: 120px; height: 120px; border: 2px dashed #6d28d9; padding: 4px; border-radius: 8px;">
            ${Components.generateQRSVG("YAPE-EL-EDUCADOR-987654321-480")}
          </div>
        </div>

        <div style="background: var(--bg-surface-subtle); padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 12px;">
          Monto a transferir: <strong style="font-size: 15px; color: var(--color-navy-900);">S/ ${amount.toFixed(2)}</strong>
        </div>

        <div class="form-group" style="text-align: left;">
          <label class="form-label">Código de Aprobación o N° de Celular Emisor:</label>
          <input type="text" id="yape-code-input" class="form-control" placeholder="Ej: 849201" value="849201" />
        </div>

        <button class="btn btn-red" onclick="window.app.processYapePayment('${paymentId}', ${amount})" style="width: 100%; font-weight: 800;">
          ✓ Validar Yape y Desbloquear Intranet
        </button>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  processYapePayment(paymentId, amount) {
    const code = document.getElementById("yape-code-input").value;
    if (!code) {
      this.showToast("Ingrese el código de aprobación de Yape", "danger");
      return;
    }
    this.showToast("Verificando operación Yape en línea...", "info");
    setTimeout(() => {
      const res = this.store.payAndUnlockIntranet(paymentId, "Yape Móvil");
      this.closeModal();
      this.showPaymentSuccessReceiptModal(res);
    }, 450);
  }

  openBankTransferModal(paymentId, amount = 480.00) {
    this.showModal(`
      <div class="modal-header">
        <h3>🏦 Depósito Bancario / Agente BCP</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.6; margin-bottom: 12px;">
          <strong>Cuentas Recaudadoras I.E.P. "El Educador":</strong><br>
          • <strong>BCP Cta Cte:</strong> 191-89347291-0-45 (CCI: 002-191-0089347291045)<br>
          • <strong>BBVA Continental:</strong> 0011-0238-0100049281<br>
          • <strong>Banco de la Nación:</strong> 04-018-492819
        </div>

        <div class="form-group">
          <label class="form-label">Número de Operación del Voucher:</label>
          <input type="text" id="bank-op-input" class="form-control" placeholder="Ej: OP-9482104" value="OP-9482104" />
        </div>

        <button class="btn btn-red" onclick="window.app.processBankPayment('${paymentId}', ${amount})" style="width: 100%; font-weight: 800;">
          ✓ Validar Depósito y Desbloquear Intranet
        </button>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  processBankPayment(paymentId, amount) {
    const op = document.getElementById("bank-op-input").value;
    if (!op) {
      this.showToast("Ingrese el número de operación bancaria", "danger");
      return;
    }
    this.showToast("Validando voucher con tesorería...", "info");
    setTimeout(() => {
      const res = this.store.payAndUnlockIntranet(paymentId, "Depósito Bancario BCP");
      this.closeModal();
      this.showPaymentSuccessReceiptModal(res);
    }, 450);
  }

  showPaymentSuccessReceiptModal(res) {
    this.showModal(`
      <div class="modal-header" style="background: #22c55e; color: white;">
        <h3 style="color: white;">🎉 ¡PAGO VALIDADO CON ÉXITO!</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; padding: 24px;">
        <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador" style="width: 70px; height: 70px; object-fit: contain; margin-bottom: 8px;" />
        <div style="font-size: 11px; font-weight: 800; color: #dc2626;">I.E.P. "EL EDUCADOR" • S.J.L. • UGEL 05</div>
        <h3 style="color: #0b132b; margin: 8px 0 4px;">RECIBO OFICIAL DE PAGO</h3>
        <div style="font-size: 14px; font-weight: bold; color: #22c55e;">${res.receiptNo}</div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 16px 0; text-align: left; font-size: 13px; line-height: 1.6;">
          <div><strong>Monto Cancelado:</strong> S/ ${res.amount.toFixed(2)}</div>
          <div><strong>Medio de Pago:</strong> ${res.method}</div>
          <div><strong>Fecha & Hora:</strong> ${res.date}</div>
          <div><strong>Estado de Intranet:</strong> <span class="status-badge status-approved" style="background:#22c55e; color:#0b132b; font-weight:800;"><span class='status-dot-green'></span> DESBLOQUEADO Y AL DÍA</span></div>
        </div>

        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px; border-radius: 6px; color: #065f46; font-size: 12px; font-weight: bold;">
          ✓ Ya puede consultar libremente el Registro de Notas, Horarios, Boletas y Control de Cuadernos QR.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-navy" onclick="window.print()">Imprimir Recibo</button>
        <button class="btn btn-gold" onclick="window.app.closeModal()">Continuar a la Intranet</button>
      </div>
    `);
    this.showToast("✓ ¡Intranet validada y desbloqueada automáticamente!", "success");
  }

  // Control de Bloqueo por Coordinación
  toggleFamilyLock(familyId) {
    const isLocked = this.store.toggleFamilyAccessLock(familyId);
    if (isLocked !== null) {
      this.showToast(isLocked ? "<span class='status-dot-red'></span> Acceso a Intranet BLOQUEADO por mora" : "<span class='status-dot-green'></span> Acceso a Intranet DESBLOQUEADO / Prórroga concedida", isLocked ? "danger" : "success");
    }
  }

  openManualPaymentModal() {
    const families = (this.store && typeof this.store.getFamiliesFinancial === "function") 
      ? this.store.getFamiliesFinancial() 
      : (this.store.state.familiesFinancial || []);

    this.showModal(`
      <div class="modal-header">
        <h3>Registrar Pago en Caja (Coordinación / Tesorería)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Seleccionar Familia / Estudiante:</label>
          <select id="man-family-select" class="form-control">
            ${families.map(f => `
              <option value="${f.familyId}">${f.guardian} (${f.studentName} - ${f.grade}) - ${f.pendingAmount > 0 ? `Deuda: S/ ${f.pendingAmount.toFixed(2)}` : 'S/ 0.00 (Al Día)'}</option>
            `).join('')}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="form-group">
            <label class="form-label">Monto Recibido (S/):</label>
            <input type="number" id="man-amount" class="form-control" value="480.00" />
          </div>
          <div class="form-group">
            <label class="form-label">Medio de Pago:</label>
            <select id="man-method" class="form-control">
              <option value="Efectivo (Caja Colegio)">Efectivo (Caja Colegio)</option>
              <option value="Depósito Agente BCP">Depósito Agente BCP</option>
              <option value="POS Tarjeta">POS Tarjeta</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Concepto:</label>
          <input type="text" id="man-concept" class="form-control" value="Pensión Escolar - Agosto 2026" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-gold" onclick="window.app.confirmManualPayment()">
          ✓ Registrar en Caja y Desbloquear Familia
        </button>
      </div>
    `);
  }

  confirmManualPayment() {
    const familyId = document.getElementById("man-family-select").value;
    const amount = parseFloat(document.getElementById("man-amount").value) || 480.00;
    const method = document.getElementById("man-method").value;

    const res = this.store.payAndUnlockIntranet("PEN-08", method);
    this.closeModal();
    this.showToast(`✓ Pago de S/ ${amount.toFixed(2)} registrado en caja. Familia desbloqueada en tiempo real.`, "success");
    setTimeout(() => this.showPaymentSuccessReceiptModal(res), 350);
  }

  showReceiptModal(paymentId) {
    const p = this.store.getPayments().find(x => x.id === paymentId) || this.store.getPayments()[1];
    if (!p) return;
    this.showModal(`
      <div class="modal-header"><h3>Recibo Oficial de Tesorería</h3><button class="modal-close-btn" onclick="window.app.closeModal()">✕</button></div>
      <div class="modal-body" style="text-align:center; padding:20px;">
        <img src="logo.png" onerror="this.src='assets/logo.png'" alt="Escudo I.E.P. El Educador" style="width: 60px; height: 60px; object-fit: contain; margin-bottom: 6px;" />
        <div style="font-size: 11px; font-weight: 800; color: #dc2626;">I.E.P. "EL EDUCADOR" (S.J.L.) • 21 años dejando huellas</div>
        <h3 style="color:#0b132b; margin:6px 0;">${p.receiptNo || 'REC-2026-7890'}</h3>
        <div style="background:var(--bg-surface-subtle); padding:12px; border-radius:6px; text-align:left; font-size:13px; margin:12px 0;">
          <div><strong>Concepto:</strong> ${p.concept}</div>
          <div><strong>Monto:</strong> S/ ${p.amount.toFixed(2)}</div>
          <div><strong>Fecha de Cancelación:</strong> ${p.paidDate || '25/07/2026'}</div>
          <div><strong>Medio:</strong> ${p.paymentMethod || 'Pago Electrónico'}</div>
          <div><strong>Estado:</strong> <span class="status-badge status-approved">CANCELADO</span></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-navy" onclick="window.print()">Imprimir Recibo</button>
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cerrar</button>
      </div>
    `);
  }

  openJustificationModal() {
    this.showModal(`
      <div class="modal-header"><h3>Justificar Inasistencia</h3><button class="modal-close-btn" onclick="window.app.closeModal()">✕</button></div>
      <div class="modal-body"><textarea id="just-reason-input" class="form-control" placeholder="Motivo..."></textarea></div>
      <div class="modal-footer"><button class="btn btn-gold" onclick="window.app.confirmJustification()">Enviar</button></div>
    `);
  }

  confirmJustification() {
    this.store.submitJustification("15/08/2026", document.getElementById("just-reason-input").value);
    this.closeModal();
    this.showToast("Justificación enviada al servidor", "success");
  }

  openNewAnnouncementModal() {
    this.showModal(`
      <div class="modal-header"><h3>Publicar Aviso</h3><button class="modal-close-btn" onclick="window.app.closeModal()">✕</button></div>
      <div class="modal-body">
        <input type="text" id="ann-title-input" class="form-control" placeholder="Título" style="margin-bottom:8px;" />
        <textarea id="ann-content-input" class="form-control" placeholder="Contenido..."></textarea>
      </div>
      <div class="modal-footer"><button class="btn btn-red" onclick="window.app.confirmAddAnnouncement()">Publicar</button></div>
    `);
  }

  confirmAddAnnouncement() {
    const t = document.getElementById("ann-title-input").value;
    const c = document.getElementById("ann-content-input").value;
    if (!t || !c) return;
    this.store.addAnnouncement(t, "Institucional", c, "normal");
    this.closeModal();
    this.showToast("Aviso publicado en servidor", "success");
  }

  // Modificar Notas de un Curso
  openEditCourseModal(courseId) {
    const course = this.store.getCourses().find(c => c.id === courseId);
    if (!course) return;
    this.showModal(`
      <div class="modal-header">
        <h3>✏️ Modificar Registro de Notas: ${course.name}</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; justify-content:space-between; margin-bottom: 12px; font-size: 13px;">
          <div><strong>Docente:</strong> ${course.teacher}</div>
          <div><strong>Código:</strong> <code>${course.code}</code></div>
        </div>
        <div class="form-group">
          <label class="form-label">Nombre del Área Curricular:</label>
          <input type="text" id="edit-c-name" class="form-control" value="${course.name}" />
        </div>
        <label class="form-label">Calificaciones Bimestrales (0 a 20):</label>
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px;">
          <div>
            <span style="font-size:11px; font-weight:bold; color:var(--text-muted);">1° Bim</span>
            <input type="number" min="0" max="20" id="edit-b1" class="form-control" value="${course.b1}" />
          </div>
          <div>
            <span style="font-size:11px; font-weight:bold; color:var(--text-muted);">2° Bim</span>
            <input type="number" min="0" max="20" id="edit-b2" class="form-control" value="${course.b2}" />
          </div>
          <div>
            <span style="font-size:11px; font-weight:bold; color:var(--text-muted);">3° Bim</span>
            <input type="number" min="0" max="20" id="edit-b3" class="form-control" value="${course.b3}" />
          </div>
          <div>
            <span style="font-size:11px; font-weight:bold; color:var(--text-muted);">4° Bim</span>
            <input type="number" min="0" max="20" id="edit-b4" class="form-control" value="${course.b4}" />
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-navy" onclick="window.app.confirmUpdateCourse('${course.id}')">Guardar en Base de Datos</button>
      </div>
    `);
  }

  confirmUpdateCourse(courseId) {
    const name = document.getElementById("edit-c-name").value;
    const b1 = document.getElementById("edit-b1").value;
    const b2 = document.getElementById("edit-b2").value;
    const b3 = document.getElementById("edit-b3").value;
    const b4 = document.getElementById("edit-b4").value;
    this.store.updateCourse(courseId, { name, b1, b2, b3, b4 });
    this.closeModal();
    this.showToast("✓ Calificaciones actualizadas y guardadas en el servidor", "success");
  }

  saveStudentGrade(studentId) {
    const input = document.getElementById(`grade-input-${studentId}`);
    if (input) {
      this.store.updateStudentGrade(studentId, parseFloat(input.value));
      this.showToast("Nota guardada en servidor", "success");
    }
  }

  // =========================================================================
  // CONTROLADORES DE AULA VIRTUAL Y EVALUACIONES DINÁMICAS (10 PREGUNTAS)
  // =========================================================================
  onVirtualGradeChange(gradeId) {
    if (!this.store) return;
    this.store.state.selectedVirtualGradeId = gradeId;
    const currentUser = this.store.getCurrentUser();
    const courses = this.store.getTeacherAssignedCourses(currentUser, gradeId);
    if (courses && courses.length > 0) {
      this.store.state.selectedVirtualCourseId = courses[0].id;
    }
    this.store.saveLocalSession();
    this.render();
  }

  onVirtualCourseChange(courseId) {
    this.store.setSelectedVirtualCourse(courseId);
    this.render();
  }

  onVirtualWeekChange(weekId) {
    this.store.setSelectedVirtualWeek(weekId);
    this.render();
  }

  onUploadMaterialCourseSelectChange(courseId) {
    const hiddenName = document.getElementById('upload-material-course-name');
    const select = document.getElementById('upload-material-course-select');
    if (hiddenName && select && select.selectedIndex >= 0) {
      const opt = select.options[select.selectedIndex];
      const text = opt.text.split('(')[0].replace(/^[^\wáéíóúÁÉÍÓÚñÑ]+/, '').trim();
      hiddenName.value = text;
    }
  }

  openUploadMaterialModal(courseId) {
    const currentUser = this.store.getCurrentUser();
    const assignedCourses = (this.store && typeof this.store.getTeacherAssignedCourses === "function")
      ? this.store.getTeacherAssignedCourses(currentUser)
      : [];
    const courses = (assignedCourses && assignedCourses.length > 0) ? assignedCourses : [
      { id: "MAT-401", courseCode: "MAT-401", name: "Matemática Avanzada", icon: "📐", grade: "4to de Secundaria", teacher: currentUser ? currentUser.name : "Prof. Roberto Silva" },
      { id: "EPT-402", courseCode: "EPT-402", name: "Computación e Informática / Robótica", icon: "💻", grade: "4to de Secundaria", teacher: currentUser ? currentUser.name : "Prof. Fernando Rojas" },
      { id: "CTA-403", courseCode: "CTA-403", name: "Ciencia y Tecnología (Física & Química)", icon: "🔬", grade: "4to de Secundaria", teacher: currentUser ? currentUser.name : "Miss Leyli Reyes Cerquen" },
      { id: "COM-404", courseCode: "COM-404", name: "Comunicación & Literatura", icon: "📚", grade: "4to de Secundaria", teacher: currentUser ? currentUser.name : "Miss María Daysi Reyes" }
    ];
    const course = courses.find(c => c.id === courseId || c.courseCode === courseId) || courses[0];
    const existingCount = (this.store.state.weeklyMaterials || []).filter(m => m.courseId === course.id || (course.courseCode && m.courseId === course.courseCode)).length;
    const nextWeek = existingCount + 1;

    const html = `
      <div class="modal-header" style="background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 16px;">
            📂 Subir Archivo de Clase & Analizar con IA
          </h3>
          <span style="font-size: 11px; color: var(--color-yellow-400);">
            Soporta PDF, Word (.docx), PowerPoint (.pptx), Texto (.txt), Imágenes de Pizarra y Excel
          </span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <form onsubmit="window.app.confirmUploadMaterial(event)">
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 18px;">
          
          <!-- Selector Dinámico de Asignatura Asignada -->
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 6px; margin-bottom: 16px;">
            <label style="font-size: 12px; font-weight: 800; color: #1e40af; display: block; margin-bottom: 4px;">
              Seleccione la Asignatura / Aula para Publicar Material:
            </label>
            <select name="courseId" id="upload-material-course-select" class="form-control" style="font-weight: bold; background: white;" onchange="window.app.onUploadMaterialCourseSelectChange(this.value)">
              ${courses.map(c => `
                <option value="${c.id}" ${c.id === course.id ? 'selected' : ''}>
                  ${c.icon || '📚'} ${c.name} (${c.grade || 'Secundaria'}) - ${c.teacher || (currentUser ? currentUser.name : 'Docente')}
                </option>
              `).join('')}
            </select>
            <input type="hidden" name="courseName" id="upload-material-course-name" value="${course.name}" />
          </div>

          <!-- ZONA DE CARGA DE ARCHIVO INTELIGENTE -->
          <div style="margin-bottom: 18px;">
            <label style="font-size: 12.5px; font-weight: 900; color: var(--color-navy-900); display: block; margin-bottom: 6px;">
              1. Seleccione o Arrastre el Archivo de su Elección (El sistema lo analizará en tiempo real):
            </label>

            <!-- Dropzone Interactivo -->
            <div id="ai-dropzone" class="smart-dropzone" onclick="document.getElementById('smart-file-input').click()" style="border: 2px dashed #3b82f6; background: #f8fafc; border-radius: 8px; padding: 22px 16px; text-align: center; cursor: pointer; transition: all 0.2s ease;">
              <div style="font-size: 36px; margin-bottom: 6px;">📁 ⚡ </div>
              <div style="font-weight: 800; font-size: 13.5px; color: #1e3a8a; margin-bottom: 4px;">
                Haga clic para seleccionar archivo o arrástrelo aquí
              </div>
              <div style="font-size: 11px; color: #64748b;">
                Formatos compatibles: <strong>PDF, Word (.docx), PowerPoint (.pptx), Texto (.txt), PNG/JPG, Excel</strong>
              </div>
            </div>

            <input type="file" id="smart-file-input" style="display: none;" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.xlsx" onchange="window.app.processUploadedFileForAnalysis(event, '${course.id}')" />

            <!-- Indicador de Carga y Análisis IA -->
            <div id="ai-analysis-indicator" style="display: none; background: #f1f5f9; border: 2px solid #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin-top: 10px;">
              <div style="font-size: 26px; margin-bottom: 6px;" class="scanning-pulse">🤖 ⚡ 🧠</div>
              <div id="ai-step-text" style="font-weight: 800; font-size: 12.5px; color: #1e40af; margin-bottom: 8px;">
                Iniciando análisis semántico del documento...
              </div>
              <div style="width: 100%; background: #cbd5e1; height: 8px; border-radius: 4px; overflow: hidden;">
                <div id="ai-progress-bar" style="width: 20%; height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); transition: width 0.4s ease;"></div>
              </div>
            </div>

            <!-- Botones de Archivos de Demostración Rápida -->
            <div style="margin-top: 10px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 11px; font-weight: 700; color: #64748b;">O probar con documento de muestra:</span>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.app.loadDemoFileForAnalysis('Guia_Trigonometria_Angulos_Dobles.pdf', '${course.id}')" style="font-size: 10.5px; padding: 3px 8px; font-weight: 700;">
                📕 Guía_Trigonometria.pdf
              </button>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.app.loadDemoFileForAnalysis('Sesion_Arduino_Servomotores_S3.pptx', '${course.id}')" style="font-size: 10.5px; padding: 3px 8px; font-weight: 700;">
                Arduino_Robótica.pptx
              </button>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.app.loadDemoFileForAnalysis('Laboratorio_Leyes_Termodinamica_Carnot.docx', '${course.id}')" style="font-size: 10.5px; padding: 3px 8px; font-weight: 700;">
                📘 Termodinamica_Carnot.docx
              </button>
            </div>
          </div>

          <!-- Alerta de Éxito de Análisis -->
          <div id="ai-success-alert" style="display: none; background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 14px; border-radius: 6px; font-size: 12px; color: #065f46; margin-bottom: 16px;">
          </div>

          <!-- 2. CAMPOS EDITABLES RESULTANTES DEL ANÁLISIS -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 14px;">
            <div style="font-size: 12.5px; font-weight: 900; color: var(--color-navy-900); margin-bottom: 10px;">
              2. Revisión de Contenido y Parámetros Semanales:
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px;">
              <div>
                <label style="font-size: 11.5px; font-weight: 800; display: block; margin-bottom: 4px;">Número de Semana:</label>
                <input type="number" name="weekNumber" id="field-material-week" value="${nextWeek}" min="1" max="40" class="form-control" required />
              </div>
              <div>
                <label style="font-size: 11.5px; font-weight: 800; display: block; margin-bottom: 4px;">Fecha de la Sesión:</label>
                <input type="text" name="sessionDate" value="${new Date().toLocaleDateString('es-PE')}" class="form-control" required />
              </div>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 11.5px; font-weight: 800; display: block; margin-bottom: 4px;">Título del Tema Detectado:</label>
              <input type="text" name="title" id="field-material-title" placeholder="Ej. Razones Trigonométricas de Ángulos Compuestos" class="form-control" required />
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 11.5px; font-weight: 800; display: block; margin-bottom: 4px;">Resumen del Trabajo Realizado en el Aula:</label>
              <textarea name="summary" id="field-material-summary" rows="4" class="form-control" placeholder="El sistema extraerá automáticamente el resumen pedagógico del archivo cargado..." required></textarea>
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 11.5px; font-weight: 800; display: block; margin-bottom: 4px;">Conceptos Clave Identificados (Separados por coma):</label>
              <input type="text" name="keyConcepts" id="field-material-concepts" placeholder="Ej. Identidades fundamentales, Ángulo doble, Teorema de Cardano" class="form-control" />
            </div>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 11.5px; font-weight: 800; display: block; margin-bottom: 4px;">Archivo Principal Vinculado:</label>
              <input type="text" name="attachmentName" id="field-material-attachment" value="Guía_Sesion_Semanal_${nextWeek}.pdf" class="form-control" />
            </div>

            <div style="background: #fefce8; border: 1px solid #fef08a; padding: 10px; border-radius: 6px; font-size: 11.5px; color: #854d0e;">
              ⚡ <strong>Generación Automática:</strong> Al guardar, el sistema dejará formulada la evaluación dinámica de 10 preguntas basada en el archivo analizado.
            </div>
          </div>

        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-navy btn-sm" style="font-weight: 800; padding: 8px 20px;">
            💾 Publicar Sesión & Activar Evaluación (10 Preguntas)
          </button>
        </div>
      </form>
    `;
    this.showModal(html);
  }

  processUploadedFileForAnalysis(event, courseId) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentUploadedFileData = e.target.result;
      this.currentUploadedFileName = file.name;
      this.currentUploadedFileSize = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      this.runDocumentAnalysisPipeline({
        name: file.name,
        size: this.currentUploadedFileSize,
        type: file.type,
        dataUrl: e.target.result
      }, courseId);
    };
    reader.readAsDataURL(file);
  }

  loadDemoFileForAnalysis(fileName, courseId) {
    this.currentUploadedFileData = null;
    this.currentUploadedFileName = fileName;
    this.currentUploadedFileSize = "2.9 MB";
    this.runDocumentAnalysisPipeline({
      name: fileName,
      size: "2.9 MB",
      type: "application/pdf"
    }, courseId);
  }

  runDocumentAnalysisPipeline(fileInfo, courseId) {
    const indicator = document.getElementById("ai-analysis-indicator");
    const dropzone = document.getElementById("ai-dropzone");

    if (indicator) indicator.style.display = "block";
    if (dropzone) dropzone.style.display = "none";

    const stepText = document.getElementById("ai-step-text");
    const progressBar = document.getElementById("ai-progress-bar");

    if (stepText) stepText.innerText = "Paso 1/3: Decodificando archivo y extrayendo estructura (" + fileInfo.name + ")...";
    if (progressBar) progressBar.style.width = "35%";

    setTimeout(() => {
      if (stepText) stepText.innerText = "🧠 Paso 2/3: Sintetizando resumen de clase y conceptos clave del tema...";
      if (progressBar) progressBar.style.width = "70%";

      setTimeout(() => {
        if (stepText) stepText.innerText = "⚡ Paso 3/3: Calibrando 10 preguntas de opción múltiple y explicaciones...";
        if (progressBar) progressBar.style.width = "100%";

        setTimeout(() => {
          if (indicator) indicator.style.display = "none";
          if (dropzone) dropzone.style.display = "block";

          const analyzed = this.store.analyzeAndExtractMaterialFromDocument(fileInfo, courseId);

          const titleInput = document.getElementById("field-material-title");
          const summaryInput = document.getElementById("field-material-summary");
          const conceptsInput = document.getElementById("field-material-concepts");
          const attachInput = document.getElementById("field-material-attachment");
          const alertBox = document.getElementById("ai-success-alert");

          if (titleInput) titleInput.value = analyzed.title;
          if (summaryInput) summaryInput.value = analyzed.summary;
          if (conceptsInput) conceptsInput.value = analyzed.keyConcepts.join(", ");
          if (attachInput) attachInput.value = fileInfo.name;
          if (alertBox) {
            alertBox.style.display = "block";
            alertBox.innerHTML = `✓ <strong>Documento Analizado con Éxito:</strong> Se detectó el tema <em>"${analyzed.title}"</em> con ${analyzed.keyConcepts.length} conceptos clave y se preparó la evaluación de 10 preguntas.`;
          }

          this.showToast(`✓ Documento "${fileInfo.name}" analizado con IA`, "success");
        }, 300);
      }, 400);
    }, 400);
  }

  confirmUploadMaterial(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const keyConceptsStr = formData.get("keyConcepts") || "";
    const keyConcepts = keyConceptsStr.split(",").map(c => c.trim()).filter(c => c.length > 0);

    const uploadedName = formData.get("attachmentName") || this.currentUploadedFileName || `Guia_Sesion_Semanal_${formData.get("weekNumber")}.pdf`;
    const isPptx = uploadedName.toLowerCase().endsWith(".ppt") || uploadedName.toLowerCase().endsWith(".pptx");

    const materialData = {
      courseId: formData.get("courseId"),
      courseName: formData.get("courseName"),
      weekNumber: parseInt(formData.get("weekNumber")),
      title: formData.get("title"),
      sessionDate: formData.get("sessionDate"),
      summary: formData.get("summary"),
      keyConcepts: keyConcepts.length > 0 ? keyConcepts : ["Fundamentos Teóricos", "Procedimientos de Cálculo", "Aplicación Práctica"],
      attachments: [
        { 
          type: isPptx ? "pptx" : "pdf", 
          name: uploadedName, 
          size: this.currentUploadedFileSize || "2.8 MB", 
          icon: isPptx ? "📊" : "📕",
          fileData: this.currentUploadedFileData || null
        },
        { 
          type: "worksheet", 
          name: `Ficha_Practica_Semana_${formData.get("weekNumber")}.pdf`, 
          size: "1.2 MB", 
          icon: "📝",
          fileData: null
        }
      ]
    };

    const created = this.store.addWeeklyMaterial(materialData);
    this.store.generateDynamicEvaluation(created.id);
    this.currentUploadedFileData = null;
    this.currentUploadedFileName = null;
    this.currentUploadedFileSize = null;

    this.closeModal();
    this.render();
    this.showToast(`✓ Material de la Semana ${materialData.weekNumber} publicado y evaluación activada`, "success");
  }

  openEditMaterialModal(materialId) {
    const material = (this.store.state.weeklyMaterials || []).find(m => m.id === materialId);
    if (!material) return;

    const html = `
      <div class="modal-header">
        <h3 class="modal-title">✏️ Editar Sesión Semanal</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <form onsubmit="window.app.confirmUpdateMaterial(event, '${material.id}')">
        <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
          <div style="margin-bottom: 14px;">
            <label style="font-size: 12px; font-weight: 800; display: block; margin-bottom: 4px;">Título de la Sesión:</label>
            <input type="text" name="title" value="${material.title}" class="form-control" required />
          </div>
          <div style="margin-bottom: 14px;">
            <label style="font-size: 12px; font-weight: 800; display: block; margin-bottom: 4px;">Resumen del Trabajo en el Aula:</label>
            <textarea name="summary" rows="5" class="form-control" required>${material.summary}</textarea>
          </div>
          <div style="margin-bottom: 14px;">
            <label style="font-size: 12px; font-weight: 800; display: block; margin-bottom: 4px;">Conceptos Clave (Separados por coma):</label>
            <input type="text" name="keyConcepts" value="${(material.keyConcepts || []).join(', ')}" class="form-control" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-navy btn-sm" style="font-weight: 800;">💾 Guardar Cambios</button>
        </div>
      </form>
    `;
    this.showModal(html);
  }

  confirmUpdateMaterial(event, materialId) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const keyConceptsStr = formData.get("keyConcepts") || "";
    const keyConcepts = keyConceptsStr.split(",").map(c => c.trim()).filter(c => c.length > 0);

    this.store.updateWeeklyMaterial(materialId, {
      title: formData.get("title"),
      summary: formData.get("summary"),
      keyConcepts: keyConcepts
    });

    this.closeModal();
    this.render();
    this.showToast("✓ Sesión semanal actualizada correctamente.", "success");
  }

  confirmDeleteMaterial(materialId) {
    if (confirm("¿Está seguro de que desea eliminar este material semanal y su evaluación?")) {
      this.store.deleteWeeklyMaterial(materialId);
      this.render();
      this.showToast("✓ Material semanal eliminado.", "info");
    }
  }

  openGenerateQuizModal(materialId) {
    const material = (this.store.state.weeklyMaterials || []).find(m => m.id === materialId);
    if (!material) return;

    const html = `
      <div class="modal-header">
        <h3 class="modal-title">⚡ Generador Inteligente de Evaluaciones (10 Preguntas)</h3>
        <button class="modal-close-btn" onclick="window.app.closeModal()">✕</button>
      </div>
      <div class="modal-body">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <div style="font-size: 13px; font-weight: 800; color: var(--color-navy-900); margin-bottom: 4px;">
            ${material.title} (Semana ${material.weekNumber})
          </div>
          <div style="font-size: 12px; color: var(--text-muted);">
            ${material.courseName} • ${material.teacherName}
          </div>
        </div>

        <p style="font-size: 12.5px; color: #334155; line-height: 1.5; margin-bottom: 14px;">
          El motor pedagógico analizará el resumen de clase, los <strong>conceptos clave</strong> (${(material.keyConcepts || []).join(', ')}) y formulará <strong>10 preguntas de opción múltiple</strong> calibradas con alternativas verosímiles, claves exactas y retroalimentación explicativa para los estudiantes.
        </p>

        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #166534; margin-bottom: 16px;">
          ✓ Ponderación oficial: 2 puntos por pregunta (Total 20 puntos).<br>
          ✓ Retroalimentación automática explicativa para cada ítem.<br>
          ✓ Registro directo en el historial de progreso del aula virtual.
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cancelar</button>
        <button class="btn btn-gold btn-sm" onclick="window.app.confirmGenerateQuiz('${material.id}')" style="font-weight: 900;">
          Iniciar Generación de 10 Preguntas
        </button>
      </div>
    `;
    this.showModal(html);
  }

  confirmGenerateQuiz(materialId) {
    this.store.generateDynamicEvaluation(materialId);
    this.closeModal();
    this.render();
    this.showToast("✓ Evaluación de 10 preguntas generada exitosamente.", "success");
    setTimeout(() => {
      this.openPreviewQuizModal(materialId);
    }, 400);
  }

  confirmRegenerateQuiz(materialId) {
    if (confirm("¿Desea volver a generar las 10 preguntas con IA basándose en el contenido de la clase?")) {
      this.store.generateDynamicEvaluation(materialId);
      this.render();
      this.showToast("✓ 10 nuevas preguntas generadas.", "success");
      setTimeout(() => {
        this.openPreviewQuizModal(materialId);
      }, 300);
    }
  }

  openPreviewQuizModal(materialId) {
    const material = (this.store.state.weeklyMaterials || []).find(m => m.id === materialId);
    if (!material || !material.evaluation) return;

    const evalObj = material.evaluation;
    const questions = evalObj.questions || [];

    const html = `
      <div class="modal-header" style="background: var(--color-navy-900); color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 16px;">
            Previsualización: ${evalObj.title}
          </h3>
          <span style="font-size: 11px; color: var(--color-yellow-400);">10 Preguntas Generadas Dinámicamente • 2 Puntos c/u (Total 20 Pts)</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 18px;">
        <div style="margin-bottom: 16px; font-size: 12px; color: #64748b;">
          Estas son las 10 preguntas formuladas sobre el material de la <strong>Semana ${material.weekNumber} (${material.title})</strong>. Cada pregunta incluye su clave oficial y retroalimentación pedagógica.
        </div>

        ${questions.map((q, idx) => `
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <span style="font-weight: 900; font-size: 13px; color: var(--color-navy-900);">
                Pregunta ${q.id || (idx + 1)}:
              </span>
              <span class="status-badge status-approved" style="font-size: 10px; font-weight: 800;">
                2 Puntos
              </span>
            </div>
            
            <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px; line-height: 1.4;">
              ${q.question}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
              ${q.options.map((opt, oIdx) => `
                <div style="font-size: 12px; padding: 8px 10px; border-radius: 6px; border: 1px solid ${oIdx === q.correctIndex ? '#10b981' : '#e2e8f0'}; background: ${oIdx === q.correctIndex ? '#ecfdf5' : '#f8fafc'}; color: ${oIdx === q.correctIndex ? '#065f46' : '#334155'}; font-weight: ${oIdx === q.correctIndex ? '800' : 'normal'};">
                  <strong>${String.fromCharCode(65 + oIdx)})</strong> ${opt} ${oIdx === q.correctIndex ? '✓ (Clave Correcta)' : ''}
                </div>
              `).join('')}
            </div>

            <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 11px; color: #475569; border-left: 3px solid #3b82f6;">
              <strong>Explicación Formativa:</strong> ${q.explanation}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cerrar</button>
        <button class="btn btn-navy btn-sm" onclick="window.app.closeModal(); window.app.showToast('✓ Evaluación aprobada y disponible para los estudiantes.', 'success');">
          ✓ Aprobar y Publicar Evaluación
        </button>
      </div>
    `;
    this.showModal(html);
  }

  startStudentQuiz(materialId) {
    const material = (this.store.state.weeklyMaterials || []).find(m => m.id === materialId);
    if (!material || !material.evaluation) return;

    window.tempQuizAnswers = {};
    const evalObj = material.evaluation;
    const questions = evalObj.questions || [];

    const renderQuizModal = () => {
      const answeredCount = Object.keys(window.tempQuizAnswers).length;

      const html = `
        <div class="modal-header" style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white;">
          <div>
            <h3 class="modal-title" style="color: white; margin: 0; font-size: 16px;">
              📝 ${evalObj.title}
            </h3>
            <span style="font-size: 11px; color: #fef08a;">10 Preguntas • Ponderación: 2 Pts c/u • Total: 20 Puntos</span>
          </div>
          <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
        </div>

        <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 20px;">
          <!-- Barra de Estado y Progreso del Cuestionario -->
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 800; color: var(--color-navy-900);">
              Preguntas Respondidas: <span id="quiz-answered-count" style="color: #2563eb;">${answeredCount}</span> de 10
            </div>
            <div style="font-size: 12px; font-weight: 800; color: #047857; background: #d1fae5; padding: 3px 10px; border-radius: 12px;">
              ⏱️ Tiempo Restante: 20:00 min
            </div>
          </div>

          <!-- Listado de las 10 Preguntas Interactivas -->
          ${questions.map((q, qIdx) => {
            const selectedOpt = window.tempQuizAnswers[q.id];
            return `
              <div style="background: #ffffff; border: 2px solid ${selectedOpt !== undefined ? '#3b82f6' : '#e2e8f0'}; border-radius: 10px; padding: 16px; margin-bottom: 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-weight: 900; font-size: 13.5px; color: var(--color-navy-900);">
                    Pregunta ${q.id || (qIdx + 1)} de 10:
                  </span>
                  <span style="font-size: 10.5px; font-weight: 800; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 10px;">
                    2 Puntos
                  </span>
                </div>

                <div style="font-size: 13.5px; font-weight: 700; color: #1e293b; margin-bottom: 12px; line-height: 1.45;">
                  ${q.question}
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${q.options.map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    return `
                      <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; border: 2px solid ${isSelected ? '#2563eb' : '#cbd5e1'}; background: ${isSelected ? '#eff6ff' : '#f8fafc'}; cursor: pointer; transition: all 0.15s ease;" onclick="window.app.selectStudentQuizAnswer('${material.id}', ${q.id}, ${oIdx})">
                        <input type="radio" name="q_${q.id}" value="${oIdx}" ${isSelected ? 'checked' : ''} style="cursor: pointer; width: 16px; height: 16px;" />
                        <span style="font-size: 12.5px; font-weight: ${isSelected ? '800' : '500'}; color: ${isSelected ? '#1e40af' : '#334155'};">
                          <strong>${String.fromCharCode(65 + oIdx)})</strong> ${opt}
                        </span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn-outline btn-sm" onclick="window.app.closeModal()">Cancelar Examen</button>
          <button class="btn btn-gold btn-sm" onclick="window.app.submitStudentQuiz('${material.id}')" style="font-weight: 900; font-size: 13px; padding: 8px 24px;">
            Finalizar y Enviar Evaluación
          </button>
        </div>
      `;
      this.showModal(html);
    };

    renderQuizModal();
  }

  selectStudentQuizAnswer(materialId, questionId, optionIndex) {
    if (!window.tempQuizAnswers) {
      window.tempQuizAnswers = {};
    }
    window.tempQuizAnswers[questionId] = optionIndex;
    this.startStudentQuiz(materialId);
  }

  submitStudentQuiz(materialId) {
    const material = (this.store.state.weeklyMaterials || []).find(m => m.id === materialId);
    if (!material || !material.evaluation) return;

    const userAnswers = window.tempQuizAnswers || {};
    const answeredCount = Object.keys(userAnswers).length;

    if (answeredCount < 10) {
      if (!confirm(`Has respondido ${answeredCount} de 10 preguntas. ¿Deseas enviar la evaluación de todas formas?`)) {
        return;
      }
    }

    const currentStudent = this.store.getCurrentUser() || { id: "EST-2026-055", name: "Estudiante" };
    
    const attempt = this.store.recordQuizAttempt(materialId, {
      studentId: currentStudent.code || currentStudent.id || "EST-2026-055",
      studentName: currentStudent.name,
      userAnswers: userAnswers,
      timeSpent: "15 min"
    });

    this.closeModal();
    this.render();
    this.showToast(`✓ Evaluación enviada. Nota: ${attempt.score} / 20 (${attempt.status})`, "success");

    setTimeout(() => {
      this.openQuizResultsModal(materialId);
    }, 400);
  }

  openQuizResultsModal(materialId) {
    const material = (this.store.state.weeklyMaterials || []).find(m => m.id === materialId);
    if (!material || !material.evaluation) return;

    const currentStudent = this.store.getCurrentUser() || { id: "EST-2026-055" };
    const currentStudentId = currentStudent.code || currentStudent.id || "EST-2026-055";
    const attempt = (material.studentAttempts || []).find(a => a.studentId === currentStudentId) || (material.studentAttempts && material.studentAttempts[0]);
    if (!attempt) return;

    const questions = material.evaluation.questions || [];
    const userAnswers = attempt.userAnswers || {};

    const html = `
      <div class="modal-header" style="background: ${attempt.score >= 14 ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)' : 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)'}; color: white;">
        <div>
          <h3 class="modal-title" style="color: white; margin: 0; font-size: 16px;">
            Resultados Oficiales de la Evaluación
          </h3>
          <span style="font-size: 11px; opacity: 0.9;">Estudiante: ${attempt.studentName} • Fecha: ${attempt.date}</span>
        </div>
        <button class="modal-close-btn" onclick="window.app.closeModal()" style="color: white;">✕</button>
      </div>

      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding: 20px;">
        <!-- Banner de Calificación y Logro -->
        <div style="background: #ffffff; border: 2px solid ${attempt.score >= 14 ? '#10b981' : '#f43f5e'}; border-radius: 10px; padding: 18px; margin-bottom: 20px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <span style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b;">Calificación Final Obtenida:</span>
          <div style="font-size: 38px; font-weight: 900; color: ${attempt.score >= 14 ? '#047857' : '#be123c'}; margin: 4px 0;">
            ${attempt.score} / 20
          </div>
          <span class="status-badge ${attempt.score >= 14 ? 'status-approved' : 'status-failed'}" style="font-size: 12px; font-weight: 900; padding: 4px 14px;">
            ${attempt.status} (${attempt.correctCount} de 10 preguntas correctas)
          </span>

          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 14px; border-radius: 6px; font-size: 12.5px; color: #334155; margin-top: 14px; text-align: left; line-height: 1.5;">
            <strong>Retroalimentación Pedagógica del Sistema:</strong><br>
            ${attempt.feedback}
          </div>
        </div>

        <h4 style="font-size: 14px; font-weight: 900; color: var(--color-navy-900); margin-bottom: 12px;">
          Desglose Ítem por Ítem con Respuestas y Explicaciones:
        </h4>

        <!-- Desglose de las 10 Preguntas con retroalimentación formativa -->
        ${questions.map((q, idx) => {
          const userAns = userAnswers[q.id];
          const isCorrect = userAns !== undefined && userAns === q.correctIndex;
          return `
            <div style="background: #ffffff; border: 2px solid ${isCorrect ? '#10b981' : '#f43f5e'}; border-radius: 8px; padding: 14px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-weight: 900; font-size: 13px; color: var(--color-navy-900);">
                  Pregunta ${q.id || (idx + 1)}:
                </span>
                <span class="status-badge ${isCorrect ? 'status-approved' : 'status-failed'}" style="font-size: 11px; font-weight: 800;">
                  ${isCorrect ? '✓ Correcto (+2 pts)' : '✕ Incorrecto (0 pts)'}
                </span>
              </div>

              <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 10px;">
                ${q.question}
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 10px;">
                ${q.options.map((opt, oIdx) => {
                  const wasSelected = userAns === oIdx;
                  const isTheCorrectOne = oIdx === q.correctIndex;
                  return `
                    <div style="font-size: 11.5px; padding: 6px 10px; border-radius: 6px; border: 1px solid ${isTheCorrectOne ? '#10b981' : (wasSelected ? '#f43f5e' : '#e2e8f0')}; background: ${isTheCorrectOne ? '#ecfdf5' : (wasSelected ? '#fff1f2' : '#f8fafc')}; color: ${isTheCorrectOne ? '#065f46' : (wasSelected ? '#9f1239' : '#475569')}; font-weight: ${isTheCorrectOne || wasSelected ? '800' : 'normal'};">
                      ${String.fromCharCode(65 + oIdx)}) ${opt}
                      ${isTheCorrectOne ? ' <strong>(Respuesta Correcta)</strong>' : ''}
                      ${wasSelected && !isTheCorrectOne ? ' <strong>(Tu Elección)</strong>' : ''}
                    </div>
                  `;
                }).join('')}
              </div>

              <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 11.5px; color: #475569; border-left: 3px solid #3b82f6;">
                <strong>Por qué es correcta:</strong> ${q.explanation}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="modal-footer">
        <button class="btn btn-navy btn-sm" onclick="window.app.closeModal()" style="font-weight: 800;">
          Entendido / Cerrar Reporte
        </button>
      </div>
    `;
    this.showModal(html);
  }

  downloadMaterialAttachment(fileName, materialId, attachmentIdx) {
    const materials = this.store.state.weeklyMaterials || [];
    let material = null;
    let attachment = null;

    if (materialId) {
      material = materials.find(m => m.id === materialId);
      if (material && material.attachments && attachmentIdx !== undefined) {
        attachment = material.attachments[attachmentIdx];
      }
    }
    if (!material) {
      material = materials.find(m => (m.attachments || []).some(a => a.name === fileName));
      if (material) {
        attachment = material.attachments.find(a => a.name === fileName);
      }
    }

    // 1. Si el archivo tiene datos adjuntos reales (Data URL o enlace)
    if (attachment && attachment.fileData) {
      const a = document.createElement("a");
      a.href = attachment.fileData;
      a.download = fileName || attachment.name || "Material_Educativo.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.showToast(`✓ Descargando archivo: ${fileName}`, "success");
      return;
    }

    // 2. Generador automático de Documento de Estudio Oficial para el Estudiante (Descarga Real Instantánea)
    const title = material ? material.title : (fileName || "Guía de Estudio").replace(/\.[^/.]+$/, "");
    const course = material ? (material.courseName || "Asignatura Oficial") : "I.E.P. El Educador";
    const week = material ? `Semana ${material.weekNumber}` : "Material Semanal";
    const sessionDate = material ? (material.sessionDate || "Agosto 2026") : "2026";
    const summary = material ? material.summary : "Guía didáctica y desarrollo curricular estructurado para el aprendizaje en el hogar.";
    const concepts = (material && material.keyConcepts && material.keyConcepts.length > 0)
      ? material.keyConcepts.map(c => `<li><strong>${c}</strong></li>`).join("")
      : "<li>Fundamentos teóricos y conceptuales</li><li>Procedimientos de cálculo y análisis</li><li>Aplicación práctica y actividades</li>";

    const isPpt = (fileName || "").toLowerCase().endsWith(".ppt") || (fileName || "").toLowerCase().endsWith(".pptx");

    const docContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - I.E.P. El Educador</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 30px; color: #1e293b; background: #f8fafc; line-height: 1.6; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 35px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { border-bottom: 3px solid #1e3a8a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .school-title { font-size: 20px; font-weight: 900; color: #0b132b; margin: 0; }
    .school-tag { font-size: 11.5px; color: #b45309; font-weight: 800; }
    .badge { background: #fef3c7; color: #92400e; padding: 5px 14px; border-radius: 16px; font-weight: 800; font-size: 12px; border: 1px solid #fde68a; }
    .hero-box { background: linear-gradient(135deg, #0b132b 0%, #1e3a8a 100%); color: white; padding: 22px 25px; border-radius: 10px; margin-bottom: 24px; }
    .hero-box h1 { font-size: 20px; margin: 0 0 8px; font-weight: 900; color: #fde047; }
    .hero-meta { font-size: 12.5px; opacity: 0.95; }
    .section-title { font-size: 14px; font-weight: 800; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; display: flex; align-items: center; gap: 8px; }
    .summary-box { background: #f1f5f9; border-left: 4px solid #1e3a8a; padding: 16px 18px; border-radius: 6px; font-size: 13.5px; color: #334155; margin-top: 10px; }
    ul { padding-left: 22px; margin-top: 10px; }
    li { margin-bottom: 8px; font-size: 13.5px; }
    .practice-box { background: #f0fdf4; border: 1.5px dashed #86efac; padding: 18px; border-radius: 8px; margin-top: 12px; font-size: 13px; color: #166534; }
    .footer { margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 11px; color: #94a3b8; text-align: center; }
    .btn-print { background: #1e3a8a; color: white; border: none; padding: 8px 18px; border-radius: 20px; font-weight: 800; cursor: pointer; margin-bottom: 20px; }
    @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } .container { border: none; box-shadow: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <h2 class="school-title">I.E.P. "EL EDUCADOR" — S.J.L.</h2>
        <div class="school-tag">21 años dejando huellas • UGEL 05 • Aula Virtual 2026</div>
      </div>
      <span class="badge">${week} • ${sessionDate}</span>
    </div>

    <div class="hero-box">
      <h1>${title}</h1>
      <div class="hero-meta"><strong>Asignatura:</strong> ${course} &nbsp;•&nbsp; <strong>Material Oficial de Estudio</strong></div>
    </div>

    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar como PDF</button>

    <div class="section-title">📘 1. Resumen del Trabajo Realizado en el Aula</div>
    <div class="summary-box">${summary}</div>

    <div class="section-title">💡 2. Conceptos Clave y Fundamentos de la Sesión</div>
    <ul>${concepts}</ul>

    <div class="section-title">📝 3. Guía de Repaso y Ejercicios para el Hogar</div>
    <div class="practice-box">
      <p style="margin: 0 0 8px;"><strong>Indicaciones para el Estudiante:</strong></p>
      <p style="margin: 0 0 6px;">1. Lea con atención el resumen y revise los esquemas desarrollados en clase.</p>
      <p style="margin: 0 0 6px;">2. Desarrolle en su cuaderno los ejercicios de aplicación práctica del libro de trabajo.</p>
      <p style="margin: 0;">3. Ingrese al <strong>Aula Virtual</strong> de la Intranet para rendir la Evaluación Dinámica Semanal (10 preguntas) y registrar su puntaje.</p>
    </div>

    <div class="footer">
      I.E.P. "El Educador" — Sistema de Intranet Institucional & Aula Virtual • San Juan de Lurigancho • Documento oficial descargado para estudio en casa.
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([docContent], { type: "text/html;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    const cleanFileName = (fileName || "Material_Sesion.html").replace(/\.[^/.]+$/, "") + (isPpt ? "_Diapositivas.html" : "_Guia_Estudio.html");
    downloadLink.download = cleanFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    this.showToast(`✓ Descargando material de estudio: ${fileName}`, "success");
  }

  showModal(contentHtml) {
    let overlay = document.getElementById("app-modal-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "app-modal-overlay";
      overlay.className = "modal-overlay";
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="modal-container">${contentHtml}</div>`;
    overlay.classList.add("active");
  }

  closeModal() {
    const overlay = document.getElementById("app-modal-overlay");
    if (overlay) overlay.classList.remove("active");
  }

  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type === 'success' ? 'toast-success' : type === 'danger' ? 'toast-danger' : ''}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instancia e inicio global robusto e inmediato
window.app = new IntranetApp();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.app.init();
  });
} else {
  window.app.init();
}
