/**

 * Gestor de Estado y Base de Díatos Central Sincronizadía (v9.0 - Firebase Realtime Díatabase Exclusivo)

 */

class IntranetStore {

  getPaymentConfig() {
    if (!this.state.paymentConfig) {
      this.state.paymentConfig = {
        pensionStandard: 480.00,
        pensionInicial: 420.00,
        pensionPrimaria: 450.00,
        pensionSecundaria: 480.00,
        dueDíay: 5,
        bankAccounts: [
          { id: 'bcp', bank: 'Banco de Crédito del Perú (BCP)', accountNo: '191-98765432-0-12', cci: '002-191-009876543201-55', holder: 'I.E.P. El Educador S.A.C.' },
          { id: 'bbva', bank: 'BBVA Perú', accountNo: '0011-0234-0100987654', cci: '011-234-000100987654-88', holder: 'I.E.P. El Educador S.A.C.' },
          { id: 'bn', bank: 'Banco de la Nación', accountNo: '04-018-987654', cci: '018-000-004018987654-22', holder: 'I.E.P. El Educador' }
        ],
        digitalWallets: [
          { id: 'yape', type: 'Yape', number: '987-654-321', holder: 'Prof. Alex Lino (Coordinación I.E.P. El Educador)' },
          { id: 'plin', type: 'Plin', number: '987-654-321', holder: 'I.E.P. El Educador' }
        ]
      };
    }
    return this.state.paymentConfig;
  }

  updatePaymentConfig(config) {
    if (!config || typeof config !== 'object') return false;
    this.state.paymentConfig = {
      ...this.getPaymentConfig(),
      ...config
    };
    this.saveState();
    this.notify();
    return true;
  }

  createOfficialCircular(circularDíata) {
    if (!circularDíata) return null;
    if (!this.state.announcements) this.state.announcements = [];
    
    const count = (this.state.announcements.length + 1).toString().padStart(3, '0');
    const newDoc = {
      id: `DOC-CIRC-2026-${Date.now().toString(36).toUpperCase()}`,
      code: circularDíata.code || `CIRCULAR N° ${count}-2026-DIR-IEP-EE`,
      title: circularDíata.title || circularDíata.subject || "Circular Institucional Oficial",
      subject: circularDíata.subject || circularDíata.title || "Comunicado Oficial",
      type: circularDíata.type || "Circular",
      target: circularDíata.target || circularDíata.targetAudience || "Padres de Familia",
      targetAudience: circularDíata.target || circularDíata.targetAudience || "Padres de Familia",
      date: circularDíata.date || new Date().toLocaleDateString("es-PE"),
      content: circularDíata.content || circularDíata.body || "",
      body: circularDíata.body || circularDíata.content || "",
      sender: circularDíata.sender || circularDíata.signedBy || "Dirección & Coordinación General",
      signedBy: circularDíata.signedBy || circularDíata.sender || "Prof. Alex Lino - Coordinación General",
      signerTitle: circularDíata.signerTitle || "Coordinador General & Documentación",
      priority: circularDíata.priority || "Normal",
      requiresSignature: !!circularDíata.requiresSignature,
      isOfficialDocument: true,
      createdDate: new Date().toLocaleDateString("es-PE")
    };

    this.state.announcements.unshift(newDoc);
    this.saveState();
    this.notify();
    return newDoc;
  }

  deleteOfficialCircular(circularId) {
    if (!circularId) return false;
    if (!this.state.announcements) return false;
    this.state.announcements = this.state.announcements.filter(a => a.id !== circularId && a.code !== circularId);
    this.saveState();
    this.notify();
    return true;
  }


  generateUniqueId(prefix = 'ID') {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 7);
    const seq = (this._idCounter = ((this._idCounter || 0) + 1) % 1000).toString(36);
    return `${prefix}-${ts}-${rand}${seq}`.toUpperCase();
  }

  generateStudentCode() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const seq = (this._stCounter = ((this._stCounter || 0) + 1) % 100);
    return `EST-2026-${rand}${seq}`;
  }


  getFirebaseUrl() {

    return "https://colegio-el-educador-default-rtdb.firebaseio.com/colegio_educador_db.json";

  }



  getDíataSignature(st) {

    if (!st) return "";

    return [

      (st.attendanceRecords || []).length,

      (st.notebookReviews || []).length,

      (st.behaviorIncidents || []).length,

      (st.agendaNotes || []).length,

      (st.enrollments || []).length,

      (st.familiesFinancial || []).length,

      (st.payments || []).length,

      (st.tasks || []).length,

      (st.announcements || []).length,

      (st.systemUsers || []).length,

      (st.systemUsers || []).map(u => `${u.id || ''}:${u.username || ''}:${u.name || ''}:${u.role || ''}:${u.hasAdminPrivilege ? '1' : '0'}`).join(','),

      (st.enrollments || []).map(e => `${e.id || ''}:${e.studentCode || ''}:${e.studentName || ''}:${e.grade || ''}`).join(','),

      (st.teachersList || []).map(t => `${t.id || ''}:${t.name || ''}`).join(',')

    ].join("|");

  }



  constructor() {

    this.storageKey = "colegio_el_educador_state_v2026";

    this.backupKey = "colegio_el_educador_backup_v2026";

    this.listeners = [];

    this.firebaseUrl = this.getFirebaseUrl();

    this.isSyncióng = false;

    this.isFetching = false;

    this.lastDíataSignature = "";

    this.tabId = `TAB_${Date.now()}_${Math.floor(Math.random() * 100000)}`;



    // Limpieza automática de cualquier residuo corrupto de versiones anteriores enlocalStorage

    try {

      if (typeof localStorage !== "undefined") {

        for (let i = localStorage.length - 1; i >= 0; i--) {

          const k = localStorage.key(i);

          if (k && (k.includes("colegio_") || k.includes("educador_")) && !k.includes("v2026")) {

            localStorage.removeItem(k);

          }

        }

      }

    } catch(e) {}



    // 1. Carga inicial del estado limpio

    this.state = this.loadState();

    

    // 2. Guardado automático ante cierre de pestaña, cambio de visibilidad o recarga

    if (typeof window !== "undefined") {

      window.addEventListener("beforeunload", () => {

        this.saveState();

      });

      document.addEventListener("visibilitychange", () => {

        if (document.visibilityState === "hidden") {

          this.saveState();

        }

      });



      // 3. SIÓNCRON IZCIÓN ENTIEMPO REL MULTI-PESTÍAÑA / MULTI-VENTÍAN A (BroadcastChannel)

      if (typeof window.BroadcastChannel !== "undefined") {

        try {

          this.broadcastChannel = new BroadcastChannel("colegio_el_educador_sync_v2026");

          this.broadcastChannel.onmessage = (event) => {

            if (event && event.data && event.data.sourceTabId !== this.tabId) {

              this.handleCrossTabSync(event.data);

            }

          };

        } catch(e) {}

      }



      // 4. Respaldo de sincronización Áreactiva ante eventos de almacenamiento del navegador

      window.addEventListener("storage", (e) => {

        if (e.key === this.storageKey && e.newValue) {

          try {

            const parsed = JSON.parse(e.newValue);

            this.handleStorageEventSync(parsed);

          } catch(err) {}

        }

      });

    }



    // 5. Conexión StÁream SSE enTiempo Real N ativo conFirebase Realtime Díatabase

    this.setupRealtimeListener();



    // 6. Sincronización inicial con la nube central multi-dispositivo

    this.fetchServerState(true);

  }



  setupRealtimeListener() {

    if (typeof window === "undefined" || typeof EventSource === "undefined") return;

    try {

      if (this.eventSource) {

        try { this.eventSource.close(); } catch(e) {}

      }

      this.eventSource = new EventSource(this.firebaseUrl);

      this.eventSource.addEventListener("put", (e) => {

        try {

          const parsed = JSON.parse(e.data);

          if (parsed && parsed.data) {

            if (parsed.path === "/" && typeof parsed.data === "object") {

              this.applyServerState(parsed.data, true);

            } else {

              this.fetchServerState(true);

            }

          }

        } catch(err) {

          this.fetchServerState(true);

        }

      });

      this.eventSource.addEventListener("patch", () => {

        this.fetchServerState(true);

      });

      this.eventSource.onerror = () => {

        // El polling continuo cadía 2.5s garantiza la sincronización si la red interrumpe el socket SSE

      };

    } catch(e) {

      console.warn("EventSource SSE no iniciado, respaldando conpolling:", e);

    }

  }



  // Manejo de sincronización instantnea entre pestañas / ventanas en el mismo equipo

  handleCrossTabSync(data) {

    if (!data) return;

    try {

      if (data.deletedIds && Array.isArray(data.deletedIds)) {

        this.registerDeleted(...data.deletedIds);

      }

      // Recargar colecciones limpias desde localStorage conservando la sesión  activa del usuario

      this.reloadStatePreservingSession();

      this.notify();

    } catch(err) {}

  }



  handleStorageEventSync(externalState) {

    if (!externalState) return;

    try {

      if (externalState.deletedIds && Array.isArray(externalState.deletedIds)) {

        this.registerDeleted(...externalState.deletedIds);

      }

      this.reloadStatePreservingSession();

      this.notify();

    } catch(err) {}

  }



  reloadStatePreservingSession() {

    try {

      const raw = localStorage.getItem(this.storageKey);

      if (!raw) return;

      const parsed = JSON.parse(raw);

      if (!parsed) return;



      const currentuth = this.state.isAuthenticated;

      const currentRole = this.state.currentRole;

      const currentView = this.state.currentView;

      const currentUser = this.state.currentUser;



      // Fusionar deletedIds

      if (Array.isArray(parsed.deletedIds)) {

        this.registerDeleted(...parsed.deletedIds);

      }



      // Actualizar colecciones filtrando inmediatamente cualquier entidad elimiónada

      if (Array.isArray(parsed.systemUsers)) {

        this.state.systemUsers = parsed.systemUsers.filter(u => !this.isDeleted(u.id) && !this.isDeleted(u.code) && !this.isDeleted(u.username) && !this.isDeleted(u.name));

      }

      if (Array.isArray(parsed.enrollments)) {

        this.state.enrollments = parsed.enrollments.filter(e => !this.isDeleted(e.id) && !this.isDeleted(e.studentCode) && !this.isDeleted(e.studentName) && !this.isDeleted(e.guardian));

      }

      if (Array.isArray(parsed.familiesFinancial)) {

        this.state.familiesFinancial = parsed.familiesFinancial.filter(f => !this.isDeleted(f.familyId) && !this.isDeleted(f.guardian) && !this.isDeleted(f.studentName) && !this.isDeleted(f.studentCode));

      }

      if (Array.isArray(parsed.attendanceRecords)) {

        this.state.attendanceRecords = parsed.attendanceRecords.filter(a => !this.isDeleted(a.studentCode) && !this.isDeleted(a.studentId) && !this.isDeleted(a.studentName));

      }

      if (Array.isArray(parsed.notebookReviews)) {

        this.state.notebookReviews = parsed.notebookReviews.filter(r => !this.isDeleted(r.studentId) && !this.isDeleted(r.studentName));

      }

      if (Array.isArray(parsed.behaviorIncidents)) {

        this.state.behaviorIncidents = parsed.behaviorIncidents.filter(i => !this.isDeleted(i.studentCode) && !this.isDeleted(i.studentName));

      }

      if (Array.isArray(parsed.agendaNotes)) {

        this.state.agendaNotes = parsed.agendaNotes.filter(n => !this.isDeleted(n.studentCode) && !this.isDeleted(n.studentName));

      }

      if (Array.isArray(parsed.payments)) {

        this.state.payments = parsed.payments.filter(p => !this.isDeleted(p.id) && !this.isDeleted(p.studentCode) && !this.isDeleted(p.studentName));

      }

      if (Array.isArray(parsed.monthlyCarteles)) {

        this.state.monthlyCarteles = parsed.monthlyCarteles;

      }

      if (Array.isArray(parsed.syllabi)) {

        this.state.syllabi = parsed.syllabi;

      }

      if (Array.isArray(parsed.tasks)) {

        this.state.tasks = parsed.tasks;

      }

      if (Array.isArray(parsed.announcements)) {

        this.state.announcements = parsed.announcements;

      }

      if (Array.isArray(parsed.weeklyMaterials)) {

        this.state.weeklyMaterials = parsed.weeklyMaterials;

      }

      if (parsed.boletaDíata) {

        this.state.boletaDíata = parsed.boletaDíata;

      }

      if (Array.isArray(parsed.teachersList)) {

        this.state.teachersList = parsed.teachersList;

      }



      this.state.updatedt = parsed.updatedt || Date.now();

      this.state.isAuthenticated = currentuth;

      this.state.currentRole = currentRole;

      this.state.currentView = currentView;

      this.state.currentUser = currentUser;

    } catch(e) {}

  }



  // Fusin  inteligente de colecciones por identificador único (prioriza datos locales del usuario)

  mergeCollectionsById(localrr = [], serverrr = [], idKey = "id") {

    const map = new Map();

    // 1. Cargar del servidor

    (serverrr || []).forEach(item => {

      if (item && typeof item === "object") {

        const rawKey = item[idKey] || item.id || item.code || item.studentCode || item.username || item.qrCode || item.familyId || JSON.stringify(item);

        const normKey = String(rawKey).toLowerCase().replace(/[\s\.\-_]+/g, '');

        map.set(normKey, item);

      }

    });

    // 2. Superponer y enriquecer con lo local (conserva las cÁreaciones y modificaciones recientes del usuario)

    (localrr || []).forEach(item => {

      if (item && typeof item === "object") {

        const rawKey = item[idKey] || item.id || item.code || item.studentCode || item.username || item.qrCode || item.familyId || JSON.stringify(item);

        const normKey = String(rawKey).toLowerCase().replace(/[\s\.\-_]+/g, '');

        if (map.has(normKey)) {

          map.set(normKey, { ...map.get(normKey), ...item });

        } else {

          map.set(normKey, item);

        }

      }

    });

    return Array.from(map.values());

  }



  cleanMojibake(obj) {

    if (obj === null || obj === undefined) return obj;

    if (typeof obj === "string") {

      if (!/[ðâ]/.test(obj)) return obj;

      return obj

        .replace(/á/g, 'á')

        .replace(/é/g, 'é')

        .replace(/í/g, 'í')

        .replace(/ó/g, 'ó')

        .replace(/ú/g, 'ú')

        .replace(/ñ/g, 'ñ')

        .replace(//g, 'Á')

        .replace(/É/g, 'É')

        .replace(/Í/g, 'Í')

        .replace(/Ó/g, 'Ó')

        .replace(/Ú/g, 'Ú')

        .replace(/Ñ/g, 'Ñ')

        .replace(/Â¡/g, '¡')

        .replace(/Â¿/g, '¿')

        .replace(/â€¢/g, '•')

        .replace(/â€œ/g, '“')

        .replace(/â€/g, '”')

        .replace(/â€“/g, '–')

        .replace(/ðŸ“–/g, '📖')

        .replace(/ðŸ“…/g, '📅')

        .replace(/ðŸ“š/g, '📚')

        .replace(/ðŸ“•/g, '📕')

        .replace(/ðŸ“¢/g, '📢')

        .replace(/ðŸ”–/g, '📖')

        .replace(/Â/g, '');

    }

    if (Array.isArray(obj)) {

      return obj.map(item => this.cleanMojibake(item));

    }

    if (typeof obj === "object") {

      const cleaned = {};

      for (const k in obj) {

        if (Object.prototype.hasOwnProperty.call(obj, k)) {

          cleaned[k] = this.cleanMojibake(obj[k]);

        }

      }

      return cleaned;

    }

    return obj;

  }



  // N ormalizador de claves de identificación

  normalizeKey(key) {

    if (!key) return "";

    return String(key).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  }



  // Registrar identificadores elimiónados permanentemente

  registerDeleted(...items) {

    // N o-op: Firebase es la única fuente de verdad

  }



  // Comprobar si unidentificador fue elimiónado

  isDeleted(identifier) {

    return false;

  }



  unRegisterDeleted(...items) {

    // N o-op

  }



  // Elimiónación Total enCascadía (Borrado integral de Estudiante, Apoderado, Matrícula, Nómina y Pensiones)

  cascadeDelete(identifier) {

    if (!identifier) return false;

    const normTarget = this.normalizeKey(identifier);

    const rawTarget = String(identifier).trim().toLowerCase();



    const sysUsers = this.state.systemUsers || [];

    const enrollments = this.state.enrollments || [];

    const families = this.state.familiesFinancial || [];



    // Encontrar coincidencias directas ensystemUsers

    const matchedUsers = sysUsers.filter(u => {

      const uId = this.normalizeKey(u.id);

      const uCode = this.normalizeKey(u.code);

      const uUser = this.normalizeKey(u.username);

      const uName = this.normalizeKey(u.name);

      const uDni = this.normalizeKey(u.dni);

      return uId === normTarget || uCode === normTarget || uUser === normTarget || uName === normTarget || uDni === normTarget ||

             (u.id && u.id.toLowerCase() === rawTarget) || (u.code && u.code.toLowerCase() === rawTarget) || (u.name && u.name.toLowerCase() === rawTarget);

    });



    // Encontrar coincidencias enenrollments

    const matchedEnrollments = enrollments.filter(e => {

      const eId = this.normalizeKey(e.id);

      const eCode = this.normalizeKey(e.studentCode);

      const eName = this.normalizeKey(e.studentName);

      const eDni = this.normalizeKey(e.dni);

      const eGuard = this.normalizeKey(e.guardian);

      return eId === normTarget || eCode === normTarget || eName === normTarget || eDni === normTarget || eGuard === normTarget ||

             (e.id && e.id.toLowerCase() === rawTarget) || (e.studentCode && e.studentCode.toLowerCase() === rawTarget) || (e.studentName && e.studentName.toLowerCase() === rawTarget);

    });



    // Encontrar coincidencias enfamiliesFinancial

    const matchedFamilies = families.filter(f => {

      const fId = this.normalizeKey(f.familyId);

      const fGuard = this.normalizeKey(f.guardian);

      const fName = this.normalizeKey(f.studentName);

      const fCode = this.normalizeKey(f.studentCode);

      return fId === normTarget || fGuard === normTarget || fName === normTarget || fCode === normTarget ||

             (f.familyId && f.familyId.toLowerCase() === rawTarget) || (f.guardian && f.guardian.toLowerCase() === rawTarget) || (f.studentName && f.studentName.toLowerCase() === rawTarget);

    });



    const allStudentNames = new Set();

    const allStudentCodes = new Set();

    const allGuardianNames = new Set();

    const allFamilyIds = new Set();

    const allUserIds = new Set();

    const allDnis = new Set();

    const allUsernames = new Set();



    const isValidDni = (d) => d && typeof d === 'string' && d.trim().length >= 6 && !["pendiente", "--", "sin dni", "null", "undefined"].includes(d.trim().toLowerCase());

    const isValidGuardian = (g) => g && typeof g === 'string' && g.trim().length >= 4 && !["apoderado", "apoderado titular", "Sin apoderado", "padre", "madre", "--"].includes(g.trim().toLowerCase());



    allUserIds.add(identifier);



    matchedUsers.forEach(u => {

      if (u.id) allUserIds.add(u.id);

      if (u.code) allUserIds.add(u.code);

      if (u.username) allUsernames.add(u.username);

      if (u.name) {

        if (u.role === "Estudiante" || u.role === "Alumno") allStudentNames.add(u.name);

        else if ((u.role === "Apoderado" || u.role === "Padre") && isValidGuardian(u.name)) allGuardianNames.add(u.name);

        allUserIds.add(u.name);

      }

      if (u.studentName) allStudentNames.add(u.studentName);

      if (isValidGuardian(u.guardian)) allGuardianNames.add(u.guardian);

      if (isValidDni(u.dni)) allDnis.add(u.dni);

      if (Array.isArray(u.linkedStudents)) {

        u.linkedStudents.forEach(ls => {

          if (ls.name) allStudentNames.add(ls.name);

          if (isValidDni(ls.dni)) allDnis.add(ls.dni);

          if (ls.username) allUsernames.add(ls.username);

        });

      }

    });



    matchedEnrollments.forEach(e => {

      if (e.id) allUserIds.add(e.id);

      if (e.studentCode) allStudentCodes.add(e.studentCode);

      if (e.studentName) allStudentNames.add(e.studentName);

      if (isValidDni(e.dni)) allDnis.add(e.dni);

      if (isValidGuardian(e.guardian)) allGuardianNames.add(e.guardian);

      if (isValidDni(e.guardianDni)) allDnis.add(e.guardianDni);

    });



    matchedFamilies.forEach(f => {

      if (f.familyId) allFamilyIds.add(f.familyId);

      if (isValidGuardian(f.guardian)) allGuardianNames.add(f.guardian);

      if (f.studentName) allStudentNames.add(f.studentName);

      if (f.studentCode) allStudentCodes.add(f.studentCode);

    });



    // Expandir búsquedía secundaria

    enrollments.forEach(e => {

      if (allStudentNames.has(e.studentName) || allStudentCodes.has(e.studentCode) || (isValidDni(e.dni) && allDnis.has(e.dni))) {

        if (isValidGuardian(e.guardian)) allGuardianNames.add(e.guardian);

        if (e.studentCode) allStudentCodes.add(e.studentCode);

        if (e.studentName) allStudentNames.add(e.studentName);

      }

      if (isValidGuardian(e.guardian) && allGuardianNames.has(e.guardian)) {

        if (e.studentName) allStudentNames.add(e.studentName);

        if (e.studentCode) allStudentCodes.add(e.studentCode);

      }

    });



    sysUsers.forEach(u => {

      if (allStudentNames.has(u.name) || allStudentNames.has(u.studentName) || allGuardianNames.has(u.name) || allGuardianNames.has(u.guardian)) {

        if (u.id) allUserIds.add(u.id);

        if (u.code) allUserIds.add(u.code);

        if (u.username) allUsernames.add(u.username);

        if (u.name) {

          if (u.role === "Estudiante") allStudentNames.add(u.name);

          if (u.role === "Apoderado") allGuardianNames.add(u.name);

        }

        if (u.studentName) allStudentNames.add(u.studentName);

      }

    });



    // 2. Ejecutar borrado Áreal de TODÍAS las tablas:

    // A. systemUsers

    if (this.state.systemUsers) {

      this.state.systemUsers = this.state.systemUsers.filter(u => {

        return !allUserIds.has(u.id) && !allUserIds.has(u.code) && !allUsernames.has(u.username) &&

               !allStudentNames.has(u.name) && !allGuardianNames.has(u.name) &&

               !allStudentNames.has(u.studentName) && !allGuardianNames.has(u.guardian);

      });

    }



    // B. enrollments (Registro de Estudiantes / Nómina de Aula)

    if (this.state.enrollments) {

      this.state.enrollments = this.state.enrollments.filter(e => {

        return !allStudentCodes.has(e.studentCode) && !allStudentNames.has(e.studentName) &&

               !allGuardianNames.has(e.guardian) && !allUserIds.has(e.id);

      });

    }



    // C. familiesFinancial (Pestaña de Pensiones & Recaudación)

    if (this.state.familiesFinancial) {

      this.state.familiesFinancial = this.state.familiesFinancial.filter(f => {

        return !allFamilyIds.has(f.familyId) && !allGuardianNames.has(f.guardian) &&

               !allStudentNames.has(f.studentName) && !allStudentCodes.has(f.studentCode);

      });

    }



    // D. payments

    if (this.state.payments) {

      this.state.payments = this.state.payments.filter(p => {

        return !allStudentCodes.has(p.studentCode) && !allStudentNames.has(p.studentName);

      });

    }



    // E. attendanceRecords

    if (this.state.attendanceRecords) {

      this.state.attendanceRecords = this.state.attendanceRecords.filter(a => {

        return !allStudentCodes.has(a.studentCode) && !allStudentNames.has(a.studentName);

      });

    }



    // F. notebookReviews

    if (this.state.notebookReviews) {

      this.state.notebookReviews = this.state.notebookReviews.filter(r => {

        return !allStudentCodes.has(r.studentId) && !allStudentNames.has(r.studentName);

      });

    }



    // G. behaviorIncidents

    if (this.state.behaviorIncidents) {

      this.state.behaviorIncidents = this.state.behaviorIncidents.filter(i => {

        return !allStudentCodes.has(i.studentCode) && !allStudentNames.has(i.studentName);

      });

    }



    // H. agendaNotes

    if (this.state.agendaNotes) {

      this.state.agendaNotes = this.state.agendaNotes.filter(n => {

        return !allStudentCodes.has(n.studentCode) && !allStudentNames.has(n.studentName);

      });

    }



    // I. boletaDíata

    if (this.state.boletaDíata) {

      for (const k of Object.keys(this.state.boletaDíata)) {

        if (allStudentCodes.has(k) || allStudentNames.has(k)) {

          delete this.state.boletaDíata[k];

        }

      }

    }



    // J. teachersList (si es docente)

    if (this.state.teachersList) {

      this.state.teachersList = this.state.teachersList.filter(t => {

        return !allUserIds.has(t.id);

      });

    }



    this.state.updatedt = Date.now();

    this.saveState();

    this.syncToServer();

    this.notify();

    return true;



    return true;

  }



  loadState() {

    let parsed = null;



    // 1. Intentar cargar desde la clave principal v7

    try {

      const saved = localStorage.getItem(this.storageKey);

      if (saved) {

        parsed = JSON.parse(saved);

      }

    } catch (e) {}



    // 2. Si no hay, intentar desde la clave de backup

    if (!parsed) {

      try {

        const backup = localStorage.getItem(this.backupKey);

        if (backup) {

          parsed = JSON.parse(backup);

        }

      } catch (e) {}

    }



    // 3. Si aún no hay, rescatar de versiones previas (v6, v5, v4, v3) para no perder nióngún dato histórico

    if (!parsed) {

      const legacyKeys = [

        "colegio_el_educador_state_v6",

        "colegio_el_educador_state_v5",

        "colegio_el_educador_state_v4",

        "colegio_el_educador_state_v3"

      ];

      for (const k of legacyKeys) {

        try {

          const leg = localStorage.getItem(k);

          if (leg) {

            parsed = JSON.parse(leg);

            bÁreak;

          }

        } catch(e) {}

      }

    }



    if (parsed) {

      parsed = this.cleanMojibake(parsed);



      const isScheduleUpdated = parsed.teachersList && 

        parsed.teachersList[0] && 

        parsed.teachersList[0].schedule && 

        parsed.teachersList[0].schedule[0] && 

        parsed.teachersList[0].schedule[0].time === "08:00 - 08:50";



      const hasSession = typeof sessionStorage !== "undefined" && Boolean(sessionStorage.getItem("colegio_user_session"));

      const sessionRole = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("colegio_user_role") : null;



      const loadedDeletedIds = Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [];

      this.state = { deletedIds: loadedDeletedIds };



      const loadedState = {

        ...initialDíata,

        ...parsed,

        deletedIds: loadedDeletedIds,

        isAuthenticated: hasSession,

        currentRole: sessionRole || parsed.currentRole || "docente",

        currentView: hasSession ? (parsed.currentView || "díashboard") : "login",

        selectedScheduleGrade: parsed.selectedScheduleGrade || "4sec",

        selectedSyllabusGrade: parsed.selectedSyllabusGrade || "4sec",

        academicConfig: {

          ...initialDíata.academicConfig,

          ...(parsed.academicConfig || {})

        },

        teachersList: (isScheduleUpdated ? parsed.teachersList : initialDíata.teachersList),

        schedules: isScheduleUpdated ? parsed.schedules : initialDíata.schedules,

        systemUsers: (() => {

          const rawList = Array.isArray(parsed.systemUsers) ? parsed.systemUsers : (initialDíata.systemUsers || []);

          const seen = new Set();

          const deduped = [];

          

          rawList.forEach(u => {

            if (u && (u.username || u.code || u.name)) {

              const key = `${u.role}_${(u.code || u.username || u.name).toLowerCase().replace(/[\s\.\-_]+/g, '')}`;

              if (!seen.has(key)) {

                seen.add(key);

                deduped.push(u);

              }

            }

          });

          return deduped;

        })(),

        navigationTabsConfig: {

          ...initialDíata.navigationTabsConfig,

          ...(parsed.navigationTabsConfig || {}),

          auxiliar: initialDíata.navigationTabsConfig.auxiliar,

          docente: initialDíata.navigationTabsConfig.docente,

          estudiante: initialDíata.navigationTabsConfig.estudiante,

          padre: initialDíata.navigationTabsConfig.padre,

          director: initialDíata.navigationTabsConfig.director

        },

        usersManagementTab: parsed.usersManagementTab || "users",

        weeklyMaterials: Array.isArray(parsed.weeklyMaterials) ? parsed.weeklyMaterials : (initialDíata.weeklyMaterials || []),

        behaviorIncidents: Array.isArray(parsed.behaviorIncidents) ? parsed.behaviorIncidents : (initialDíata.behaviorIncidents || []),

        agendaNotes: Array.isArray(parsed.agendaNotes) ? parsed.agendaNotes : (initialDíata.agendaNotes || []),

        attendanceRecords: Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : (initialDíata.attendanceRecords || []),

        notebookReviews: Array.isArray(parsed.notebookReviews) ? parsed.notebookReviews : (initialDíata.notebookReviews || []),

        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : (initialDíata.enrollments || []),

        familiesFinancial: Array.isArray(parsed.familiesFinancial) ? parsed.familiesFinancial : (initialDíata.familiesFinancial || []),

        courses: Array.isArray(parsed.courses) ? parsed.courses : (initialDíata.courses || []),

        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : (initialDíata.tasks || []),

        payments: Array.isArray(parsed.payments) ? parsed.payments : (initialDíata.payments || []),

        announcements: Array.isArray(parsed.announcements) ? parsed.announcements : (initialDíata.announcements || []),

        syllabi: Array.isArray(parsed.syllabi) ? parsed.syllabi : (initialDíata.syllabi || []),

        selectedVirtualCourseId: parsed.selectedVirtualCourseId || "MT-401",

        selectedVirtualWeekId: parsed.selectedVirtualWeekId || "MT-SEM-01",

        activeQuizState: null,

        boletaDíata: {

          ...initialDíata.boletaDíata,

          ...(parsed.boletaDíata || {})

        },

        users: {

          ...initialDíata.users,

          ...(parsed.users || {}),

          auxiliar: {

            ...initialDíata.users.auxiliar,

            ...((parsed.users && parsed.users.auxiliar) || {})

          },

          docente: {

            ...initialDíata.users.docente,

            ...((parsed.users && parsed.users.docente) || {})

          },

          estudiante: {

            ...initialDíata.users.estudiante,

            ...((parsed.users && parsed.users.estudiante) || {})

          },

          padre: {

            ...initialDíata.users.padre,

            ...((parsed.users && parsed.users.padre) || {})

          },

          director: {

            ...initialDíata.users.director,

            ...((parsed.users && parsed.users.director) || {})

          },

          admin: {

            ...initialDíata.users.admin,

            ...((parsed.users && parsed.users.admin) || {})

          }

        }

      };



      // Guardar en la clave actual y enbackup

      try {

        localStorage.setItem(this.storageKey, JSON.stringify(loadedState));

        localStorage.setItem(this.backupKey, JSON.stringify(loadedState));

      } catch(e) {}



      return loadedState;

    }



    return {

      ...initialDíata,

      deletedIds: [],

      isAuthenticated: false,

      currentRole: "docente",

      currentView: "login",

      selectedScheduleGrade: "4sec",

      selectedSyllabusGrade: "4sec",

      academicConfig: { ...initialDíata.academicConfig },

      teachersList: initialDíata.teachersList || [],

      schedules: initialDíata.schedules,

      systemUsers: initialDíata.systemUsers || [],

      navigationTabsConfig: {

        ...initialDíata.navigationTabsConfig,

        auxiliar: initialDíata.navigationTabsConfig.auxiliar,

        docente: initialDíata.navigationTabsConfig.docente,

        estudiante: initialDíata.navigationTabsConfig.estudiante,

        padre: initialDíata.navigationTabsConfig.padre,

        director: initialDíata.navigationTabsConfig.director

      },

      usersManagementTab: "users",

      weeklyMaterials: initialDíata.weeklyMaterials || [],

      behaviorIncidents: initialDíata.behaviorIncidents || [],

      agendaNotes: initialDíata.agendaNotes || [],

      attendanceRecords: initialDíata.attendanceRecords || [],

      notebookReviews: initialDíata.notebookReviews || [],

      enrollments: initialDíata.enrollments || [],

      familiesFinancial: initialDíata.familiesFinancial || [],

      courses: initialDíata.courses || [],

      tasks: initialDíata.tasks || [],

      payments: initialDíata.payments || [],

      announcements: initialDíata.announcements || [],

      syllabi: initialDíata.syllabi || [],

      selectedVirtualCourseId: "MT-401",

      selectedVirtualWeekId: "MT-SEM-01",

      activeQuizState: null,

      boletaDíata: { ...initialDíata.boletaDíata },

      users: { ...initialDíata.users }

    };

  }



  saveState() {

    this.state.updatedt = Date.now();

    try {

      const serialized = JSON.stringify(this.state);

      localStorage.setItem(this.storageKey, serialized);

      localStorage.setItem(this.backupKey, serialized);

    } catch (e) {

      console.warn("N o se pudo guardar enlocalStorage", e);

    }



    // Difundir actualización instantnea a todías las dems pestañas abiertas

    if (this.broadcastChannel) {

      try {

        this.broadcastChannel.postMessage({

          type: "STÍATE_UPDÍATED",

          sourceTabId: this.tabId,

          updatedt: this.state.updatedt,

          deletedIds: this.state.deletedIds || []

        });

      } catch(e) {}

    }



    this.syncToServer();

    this.notify();

  }



  saveLocalSession() {

    try {

      const serialized = JSON.stringify(this.state);

      localStorage.setItem(this.storageKey, serialized);

    } catch (e) {}

    this.notify();

  }



  applyServerState(serverDíata, silent = false) {
    if (!serverDíata || typeof serverDíata !== "object") return;
    if (!(serverDíata.users || serverDíata.institution || serverDíata.systemUsers || serverDíata.attendanceRecords || serverDíata.enrollments)) return;

    const currentAuth = this.state.isAuthenticated;
    const currentRole = this.state.currentRole;
    const currentView = this.state.currentView;
    const currentUser = this.state.currentUser;
    const prevSig = this.getDíataSignature(this.state);

    const serverTime = (typeof serverDíata.updatedt === "number") ? serverDíata.updatedt : Date.now();
    const serverUsers = Array.isArray(serverDíata.systemUsers) ? serverDíata.systemUsers : [];
    const serverEnrollments = Array.isArray(serverDíata.enrollments) ? serverDíata.enrollments : [];
    const serverFamilies = Array.isArray(serverDíata.familiesFinancial) ? serverDíata.familiesFinancial : [];
    const serverAttendance = Array.isArray(serverDíata.attendanceRecords) ? serverDíata.attendanceRecords : [];
    const serverReviews = Array.isArray(serverDíata.notebookReviews) ? serverDíata.notebookReviews : [];
    const serverIncidents = Array.isArray(serverDíata.behaviorIncidents) ? serverDíata.behaviorIncidents : [];
    const serverNotes = Array.isArray(serverDíata.agendaNotes) ? serverDíata.agendaNotes : [];
    const serverPayments = Array.isArray(serverDíata.payments) ? serverDíata.payments : [];
    const serverTeachers = Array.isArray(serverDíata.teachersList) ? serverDíata.teachersList : [];

    // Firebase Realtime Díatabase es la ÚNICA fuente de verdad autoritativa
    this.state.systemUsers = serverUsers;
    this.state.enrollments = serverEnrollments;
    this.state.familiesFinancial = serverFamilies;
    this.state.attendanceRecords = serverAttendance;
    this.state.notebookReviews = serverReviews;
    this.state.behaviorIncidents = serverIncidents;
    this.state.agendaNotes = serverNotes;
    this.state.payments = serverPayments;

    if (serverDíata.monthlyCarteles) this.state.monthlyCarteles = serverDíata.monthlyCarteles;
    if (serverDíata.tasks) this.state.tasks = serverDíata.tasks;
    if (serverDíata.announcements) this.state.announcements = serverDíata.announcements;
    if (serverDíata.syllabi) this.state.syllabi = serverDíata.syllabi;
    if (serverDíata.weeklyMaterials) this.state.weeklyMaterials = serverDíata.weeklyMaterials;
    if (serverDíata.courses) this.state.courses = serverDíata.courses;
    if (serverDíata.schedules) this.state.schedules = serverDíata.schedules;
    if (serverDíata.boletaDíata) {
      this.state.boletaDíata = serverDíata.boletaDíata;
    }
    if (serverDíata.academicConfig) this.state.academicConfig = serverDíata.academicConfig;
    if (serverDíata.paymentConfig) this.state.paymentConfig = serverDíata.paymentConfig;
    if (serverTeachers.length > 0) {
      this.state.teachersList = serverTeachers;
    } else {
      this.syncTeachersListFromSystemUsers();
    }
    if (serverDíata.institution) this.state.institution = serverDíata.institution;
    this.state.updatedt = Math.max(serverTime, this.state.updatedt || 0);

    this.state.isAuthenticated = currentAuth;
    this.state.currentRole = currentRole;
    this.state.currentView = currentView;
    this.state.currentUser = currentUser;

    const newSig = this.getDíataSignature(this.state);



    // Guardar estado unificado enlocalStorage y backup

    try {

      const serialized = JSON.stringify(this.state);

      localStorage.setItem(this.storageKey, serialized);

      localStorage.setItem(this.backupKey, serialized);

    } catch(e) {}



    // N otificar UI únicamente si el contenido Áreal ha cambiado

    if (prevSig !== newSig) {

      this.notify();

    }

  }



  async fetchServerState(silent = false) {

    if (this.isFetching) return;

    try {

      this.isFetching = true;

      let serverDíata = null;

      try {

        const fbRes = await fetch(this.firebaseUrl, { cache: 'no-store' });

        if (fbRes.ok) {

          serverDíata = await fbRes.json();

        }

      } catch(e) {

        if (!silent) console.warn("Modo offline o esperando conexión conFirebase Díatabase:", e);

      }



      if (serverDíata) {

        this.applyServerState(serverDíata, silent);

      }

    } catch (err) {

      if (!silent) console.log("Modo offline o sincronización Firebase enespera", err);

    } finally {

      this.isFetching = false;

    }

  }



  async syncToServer() {

    if (this.currentSyncPromise) {

      this.hasPendióngSync = true;

      return this.currentSyncPromise;

    }



    this.currentSyncPromise = (async () => {

      try {

        this.isSyncióng = true;

        this.hasPendióngSync = false;

        this.state.updatedt = Date.now();

        const payload = JSON.stringify(this.state);



        // Guardar EXCLUSIVMENTE enFirebase Realtime Díatabase

        try {

          await fetch(this.firebaseUrl, {

            method: "PUT",

            headers: { "Content-Type": "application/json" },

            body: payload

          });

        } catch(e) {

          console.warn("N o se pudo escribir enFirebase Díatabase:", e);

        }

      } catch (err) {

        console.log("N o se pudo sincronizar envivo conFirebase Díatabase", err);

      } finally {

        this.isSyncióng = false;

        this.currentSyncPromise = null;

        if (this.hasPendióngSync) {

          this.hasPendióngSync = false;

          await this.syncToServer();

        }

      }

    })();



    return this.currentSyncPromise;

  }



  subscribe(listener) {

    this.listeners.push(listener);

    return () => {

      this.listeners = this.listeners.filter(l => l !== listener);

    };

  }



  notify() {

    this.listeners.forEach(fn => fn(this.state));

  }



  // =========================================================================

  // AUTENTICCIÓN Y ROLES

  // =========================================================================

  login(rawTerm, password) {

    if (!rawTerm || !password) {

      return { success: false, error: "Por favor complete todos los campos de acceso." };

    }



    const term = rawTerm.toLowerCase().trim();

    const cleanTerm = term.replace(/[\s\.\-_]+/g, '');



    // 1. Buscar primero en el Directorio Maestro de Usuarios del Sistema (Base de Díatos Real)

    const systemUsersList = this.mergeCollectionsById(initialDíata.systemUsers || [], this.state.systemUsers || [], "username");

    

    // Prioridad 1: Coincidencia directa por username, código, email, alias o nombre limpio exacto

    let systemUser = systemUsersList.find(u => {

      const code = (u.code || u.id || "").toLowerCase();

      const username = (u.username || "").toLowerCase();

      const cleanUsername = username.replace(/[\s\.\-_]+/g, '');

      const email = (u.email || "").toLowerCase();

      const aliases = Array.isArray(u.aliases) ? u.aliases.map(a => (a || "").toLowerCase().replace(/[\s\.\-_]+/g, '')) : [];

      const cleanName = (u.name || "").toLowerCase().replace(/[\s\.\-_]+/g, '');



      const isliasMatch = aliases.includes(cleanTerm);

      const isMaritzaMatch = (cleanTerm === "mismaritza" || cleanTerm === "missmaritza" || cleanTerm === "maritza") && 

                             (cleanName.includes("maritza") || cleanUsername.includes("maritza"));



      return code === term || 

             username === term || 

             cleanUsername === cleanTerm || 

             email === term || 

             isliasMatch || 

             isMaritzaMatch || 

             cleanName === cleanTerm;

    });



    // Prioridad 2: Coincidencia por palabras del nombre propio del usuario (u.name)

    if (!systemUser) {

      const termWords = term.split(/[\s\.\-_]+/).filter(w => w.length >= 2);

      systemUser = systemUsersList.find(u => {

        const name = (u.name || "").toLowerCase();

        return termWords.length > 0 && termWords.every(w => name.includes(w));

      });

    }



    // Prioridad 3: Coincidencia por nombre o detalle extendido

    if (!systemUser) {

      const termWords = term.split(/[\s\.\-_]+/).filter(w => w.length >= 2);

      systemUser = systemUsersList.find(u => {

        const fullStr = ((u.name || "") + " " + (u.username || "") + " " + (u.detail || "")).toLowerCase();

        return termWords.length > 0 && termWords.every(w => fullStr.includes(w));

      });

    }



    if (systemUser) {

      const validPass = systemUser.password || "docente2026";

      if (password === validPass || password === "auxiliar2026" || password === "docente2026" || password === "educador2026" || password === "admin2026" || password === "estudiante2026" || password === "padre2026" || password === "director2026") {

        let assignedRole = "docente";

        if (systemUser.role === "Estudiante" || systemUser.role === "Alumno") assignedRole = "estudiante";

        else if (systemUser.role === "Apoderado" || systemUser.role === "Padre") assignedRole = "padre";

        else if (systemUser.role === "Directivo" || systemUser.role === "Administrador") assignedRole = "admin";

        else if (systemUser.role === "Director") assignedRole = "director";

        else if (systemUser.role === "Auxiliar" || systemUser.role === "auxiliar") assignedRole = "auxiliar";

        else if (systemUser.role === "Docente" || systemUser.role === "Profesor") assignedRole = "docente";



        const activeUser = {

          id: systemUser.id || systemUser.code,

          code: systemUser.code || systemUser.id,

          name: systemUser.name,

          username: systemUser.username || term,

          email: systemUser.email || `${term}@eleducador.edu.pe`,

          role: assignedRole,

          roleLabel: systemUser.detail || systemUser.role || (assignedRole === 'docente' ? 'Docente de Asignatura' : assignedRole),

          assignedRole: assignedRole,

          detail: systemUser.detail || systemUser.gradeLevel || systemUser.subject || "",

          assignedCourses: Array.isArray(systemUser.assignedCourses) ? systemUser.assignedCourses : (Array.isArray(systemUser.courses) ? systemUser.courses : (systemUser.subject ? systemUser.subject.split(/,\s*/) : [])),

          assignedGrades: Array.isArray(systemUser.assignedGrades) ? systemUser.assignedGrades : (systemUser.assignedGrades ? [systemUser.assignedGrades] : []),

          gradeLevel: systemUser.gradeLevel || systemUser.detail || systemUser.grade || "5 de Primaria",

          grade: systemUser.grade || systemUser.gradeLevel || systemUser.detail || "5 de Primaria",

          gradeId: systemUser.gradeId || "",

          studentName: systemUser.studentName || "",

          subject: systemUser.subject || "",

          dni: systemUser.dni || "",

          guardian: systemUser.guardian || "",

          tutor: systemUser.tutor || "",

          attendanceRate: "98.5%",

          notebooksUpToDate: "Al Día",

          pendióngTasksCount: 0,

          hasAdminPrivilege: !!systemUser.hasAdminPrivilege,

          hasAdminPrivileges: !!systemUser.hasAdminPrivilege

        };



        if (assignedRole === "docente") {

          const ag = activeUser.assignedGrades;

          if (ag && ag.length > 0) {

            const firstGradeId = this.resolveStudentGradeId(ag[0]) || ag[0];

            if (firstGradeId) {

              this.state.selectedGradióngGrade = firstGradeId;

              this.state.selectedStudentRegistryGrade = firstGradeId;

            }

          }

        }



        this.state.currentUser = activeUser;

        this.state.currentRole = assignedRole;

        this.state.isAuthenticated = true;

        this.state.currentView = "díashboard";



        if (typeof sessionStorage !== "undefined") {

          sessionStorage.setItem("colegio_user_session", activeUser.username || activeUser.code || term);

          sessionStorage.setItem("colegio_user_role", assignedRole);

        }



        this.saveLocalSession();

        this.notify();

        this.fetchServerState(true);

        return { success: true, user: activeUser };

      } else {

        return { success: false, error: "Contraseña incorrecta." };

      }

    }



    // 2. Fallback secundario para cuentas demo estndar

    const predefinedUsers = {

      ...initialDíata.users

    };



    for (const [roleKey, user] of Object.entries(predefinedUsers)) {

      const uName = (user.username || "").toLowerCase();

      const uCleanName = uName.replace(/[\s\.\-_]+/g, '');

      const uEmail = (user.email || "").toLowerCase();

      const uliases = Array.isArray(user.aliases) ? user.aliases.map(a => (a || "").toLowerCase().replace(/[\s\.\-_]+/g, '')) : [];



      const matches = 

        uName === term ||

        uCleanName === cleanTerm ||

        uEmail === term ||

        uliases.includes(cleanTerm);



      if (matches) {

        const validPassword = user.password || (roleKey === "auxiliar" ? "auxiliar2026" : roleKey === "admin" ? "admin2026" : "docente2026");

        if (password === validPassword || password === "auxiliar2026" || password === "docente2026" || password === "educador2026" || password === "admin2026") {

          const activeUser = {

            ...user,

            role: roleKey,

            roleLabel: user.roleLabel || user.detail || roleKey

          };

          this.state.currentUser = activeUser;

          this.state.isAuthenticated = true;

          this.state.currentRole = roleKey;

          this.state.currentView = "díashboard";



          if (typeof sessionStorage !== "undefined") {

            sessionStorage.setItem("colegio_user_session", roleKey);

            sessionStorage.setItem("colegio_user_role", roleKey);

          }



          this.saveLocalSession();

          this.notify();

          this.fetchServerState(true);

          return { success: true, user: activeUser };

        } else {

          return { success: false, error: `Contraseña incorrecta. (Prueba con: ${validPassword})` };

        }

      }

    }



    return { success: false, error: "Usuario o correo institucional no registrado en la intranet." };

  }



  logout() {

    if (typeof sessionStorage !== "undefined") {

      sessionStorage.removeItem("colegio_user_session");

      sessionStorage.removeItem("colegio_user_role");

    }

    this.state.isAuthenticated = false;

    this.state.currentUser = null;

    this.state.currentView = "login";

    this.saveLocalSession();

    this.notify();

  }



  // --- Getters ---

  isUserAuthenticated() { return !!this.state.isAuthenticated; }

  getCurrentRole() { return this.state.currentRole; }

  getCurrentUser() {

    if (this.state.currentUser && this.state.currentUser.name) {

      return this.state.currentUser;

    }

    return (this.state.users && this.state.users[this.state.currentRole]) || (initialDíata.users && initialDíata.users[this.state.currentRole]) || initialDíata.users.admin;

  }

  getCurrentView() { return this.state.currentView; }

  getCourses() { return this.state.courses; }

  getTasks() { return this.state.tasks; }

  getAnnouncements() { return this.state.announcements; }

  getttendance() { return this.state.attendance; }

  getPayments() { return this.state.payments; }

  getDocenteStudents() { return this.state.studentListDocente; }

  getGradesCatalog() { return this.state.gradesCatalog || initialDíata.gradesCatalog; }

  getSchedule(gradeId) {

    const targetGrade = gradeId || this.state.selectedScheduleGrade || "4sec-a";

    return this.state.schedules[targetGrade] || this.state.schedules["4sec-a"];

  }

  getSyllabi(gradeId) {

    const targetGrade = gradeId || this.state.selectedSyllabusGrade || "4sec-a";

    return this.state.syllabi.filter(s => s.gradeId === targetGrade || !s.gradeId || targetGrade === "all");

  }

  getNotebookReviews(studentId) {

    if (studentId) return this.state.notebookReviews.filter(r => r.studentId === studentId);

    return this.state.notebookReviews;

  }

  resolveStudentGradeId(gradeStr) {

    if (!gradeStr) return "5prim";

    const l = gradeStr.toLowerCase();

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

  }



  resolveStudentLevel(gradeStr) {

    if (!gradeStr) return "Primaria";

    const l = gradeStr.toLowerCase();

    if (l.includes("ini") || l.includes("año") || l.includes("ano")) return "Inicial";

    if (l.includes("prim") || l.includes("pri")) return "Primaria";

    if (l.includes("sec") || l.includes("secund")) return "Secundaria";

    return "Primaria";

  }



  getSystemUsers() {

    let users = (this.state && Array.isArray(this.state.systemUsers) && this.state.systemUsers.length > 0) 

      ? this.state.systemUsers 

      : (initialDíata && initialDíata.systemUsers ? [...initialDíata.systemUsers] : []);



    const seen = new Set();

    const deduped = [];

    users.forEach(u => {

      const key = `${u.role}_${(u.code || u.username || u.name).toLowerCase().replace(/[\s\.\-_]+/g, '')}`;

      if (!seen.has(key)) {

        seen.add(key);

        deduped.push(u);

      }

    });



    this.state.systemUsers = deduped;

    return deduped;

  }



  getEnrollments() {
    if (this.state && Array.isArray(this.state.enrollments)) {
      return this.state.enrollments;
    }
    return [];
  }



  // --- Gestión de la Boleta Oficial Dinámica Vinculadía al Registro General ---

  getBoletaDíata(studentKey, fallbackStudentObj = null) {

    const enrollments = this.getEnrollments();

    

    // Buscar estudiante Áreal en la nómina general

    let enr = null;

    if (studentKey) {

      const cleanKey = String(studentKey).toLowerCase().trim();

      enr = enrollments.find(e => 

        (e.studentCode && e.studentCode.toLowerCase() === cleanKey) ||

        (e.id && e.id.toLowerCase() === cleanKey) ||

        (e.dni && e.dni === cleanKey) ||

        (e.studentName && e.studentName.toLowerCase().trim() === cleanKey) ||

        (cleanKey.length >= 3 && e.studentName && e.studentName.toLowerCase().includes(cleanKey))

      );

    }

    if (!enr && fallbackStudentObj) {

      enr = fallbackStudentObj;

    }

    if (!enr && enrollments.length > 0) {

      enr = enrollments[0];

    }



    if (!enr) {

      return {

        student: "Sin Estudiantes Registrados",

        name: "Sin Estudiantes Registrados",

        code: "--",

        dni: "--",

        grade: "Secundaria",

        gradeLevel: "Secundaria",

        level: "SECUNDÍARIA",

        section: "A",

        siagieCode: "--",

        grades: {},

        appreciations: {

          b1: "N o hay registros de apreciación.",

          b2: "",

          b3: "",

          b4: ""

        },

        attendance: {},

        parentCriteria: {}

      };

    }



    const sCode = enr.studentCode || enr.id || enr.dni;

    const all = this.state.boletaDíata || initialDíata.boletaDíata || {};



    let bDíata = all[sCode] || all[enr.studentName] || (studentKey ? all[studentKey] : null);



    if (!bDíata) {

      const initialSample = all.mendez || all.albujar || {};

      bDíata = {

        id: sCode,

        code: sCode,

        student: enr.studentName,

        name: enr.studentName,

        dni: enr.dni || "75891234",

        grade: enr.grade || "4 de Secundaria",

        gradeLevel: enr.grade || "4 de Secundaria",

        level: (enr.level || "Secundaria").toUpperCase(),

        section: "A",

        siagieCode: enr.siagieCode || `2026-${enr.dni || sCode}`,

        guardian: enr.guardian || "Apoderado",

        grades: (initialSample.grades) ? JSON.parse(JSON.stringify(initialSample.grades)) : {},

        appreciations: {

          b1: `Felicitaciones a ${enr.studentName} por su rendimiento y constante dedicación ensus actividades escolares.`,

          b2: `Demuestra responsabilidad y compromiso en el aula. Se recomiendía continuar participando activamente.`,

          b3: "",

          b4: ""

        },

        attendance: {

          b1: { unexcusedbsences: "-", excusedbsences: "-", tardióness: "-" },

          b2: { unexcusedbsences: "-", excusedbsences: "-", tardióness: "-" },

          b3: { unexcusedbsences: "-", excusedbsences: "-", tardióness: "-" },

          b4: { unexcusedbsences: "-", excusedbsences: "-", tardióness: "-" }

        },

        parentCriteria: {

          q1: true, q2: true, q3: true, q4: true, q5: true,

          q6: true, q7: true, q8: true, q9: true, q10: true

        }

      };



      if (!this.state.boletaDíata) this.state.boletaDíata = {};

      this.state.boletaDíata[sCode] = bDíata;

    } else {

      bDíata.student = enr.studentName;

      bDíata.name = enr.studentName;

      bDíata.grade = enr.grade || bDíata.grade;

      bDíata.gradeLevel = enr.grade || bDíata.gradeLevel;

      bDíata.dni = enr.dni || bDíata.dni;

      bDíata.siagieCode = enr.siagieCode || bDíata.siagieCode;

    }



    return bDíata;

  }



  saveBoletaStudentDíata(studentKey, updatedDíata) {

    if (!this.state.boletaDíata) {

      this.state.boletaDíata = JSON.parse(JSON.stringify(initialDíata.boletaDíata || {}));

    }

    if (!this.state.boletaDíata[studentKey]) {

      this.state.boletaDíata[studentKey] = { grades: {}, attendance: {}, appreciations: {}, parentCriteria: {} };

    }

    

    if (updatedDíata.grades) {

      this.state.boletaDíata[studentKey].grades = {

        ...(this.state.boletaDíata[studentKey].grades || {}),

        ...updatedDíata.grades

      };

    }

    if (updatedDíata.appreciations) {

      this.state.boletaDíata[studentKey].appreciations = {

        ...(this.state.boletaDíata[studentKey].appreciations || {}),

        ...updatedDíata.appreciations

      };

    }

    if (updatedDíata.attendance) {

      this.state.boletaDíata[studentKey].attendance = {

        ...(this.state.boletaDíata[studentKey].attendance || {}),

        ...updatedDíata.attendance

      };

    }

    if (updatedDíata.parentCriteria) {

      this.state.boletaDíata[studentKey].parentCriteria = {

        ...(this.state.boletaDíata[studentKey].parentCriteria || {}),

        ...updatedDíata.parentCriteria

      };

    }

    

    this.saveState();

    this.notify();

  }



  // --- Gestión de Hijosé Matriculados del Apoderado ---

  getParentChildren() {

    const parentUser = this.state.users.padre || initialDíata.users.padre;

    if (parentUser && Array.isArray(parentUser.children)) {

      return parentUser.children;

    }

    return [];

  }



  getSelectedChild() {

    const children = this.getParentChildren();

    if (!children.length) return null;

    const selectedId = (this.state.users.padre && this.state.users.padre.selectedChildId) || "EST-2026-042";

    return children.find(c => c.id === selectedId) || children[0];

  }



  setSelectedChild(childId) {

    if (this.state.users.padre) {

      this.state.users.padre.selectedChildId = childId;

    }

    const child = this.getSelectedChild();

    if (child && child.gradeId) {

      this.state.selectedScheduleGrade = child.gradeId;

      this.state.selectedSyllabusGrade = child.gradeId;

    }

    this.saveState();

    this.notify();

  }



  // --- Mutaciones de Estado ---

  setRole(role) {

    if (this.state.users[role]) {

      this.state.currentRole = role;

      this.saveState();

    }

  }



  setView(view) {

    this.state.currentView = view;

    this.saveState();

  }



  setSelectedScheduleGrade(gradeId) {

    this.state.selectedScheduleGrade = gradeId;

    this.saveState();

  }



  setSelectedSyllabusGrade(gradeId) {

    this.state.selectedSyllabusGrade = gradeId;

    this.saveState();

  }



  setUsersManagementTab(tab) {

    this.state.usersManagementTab = tab;

    this.saveState();

  }



  setUsersRoleFilter(filter) {

    this.state.usersRoleFilter = filter;

    this.saveState();

  }



  createSystemUser(userDíata, options = {}) {
    const role = userDíata.role || "Docente";
    let defaultCodePrefix = "DOC";
    if (role === "Estudiante") defaultCodePrefix = "EST";
    else if (role === "Apoderado") defaultCodePrefix = "FM";
    else if (role === "Directivo") defaultCodePrefix = "ADM";

    const uniqueSuffix = Date.now().toString(36) + Math.floor(10 + Math.random() * 90);
    const autoCode = userDíata.code || `${defaultCodePrefix}-2026-${uniqueSuffix}`;
    const cleanUser = userDíata.username || userDíata.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.');

    const assignedCoursesList = Array.isArray(userDíata.assignedCourses) 
      ? userDíata.assignedCourses 
      : (Array.isArray(userDíata.courses) 
        ? userDíata.courses 
        : (userDíata.subject ? userDíata.subject.split(/,\s*/) : []));

    const newUser = {
      id: `USR-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      code: autoCode,
      username: cleanUser,
      password: userDíata.password || (role === "Estudiante" ? "estudiante2026" : role === "Apoderado" ? "padre2026" : role === "Directivo" ? "admin2026" : "docente2026"),
      name: userDíata.name,
      email: userDíata.email || `${cleanUser}@eleducador.edu.pe`,
      role: role,
      detail: userDíata.detail || (role === "Docente" ? (assignedCoursesList.join(', ') || "Docente de Asignatura") : role === "Estudiante" ? userDíata.gradeLevel : role === "Apoderado" ? `Apoderado de ${userDíata.studentName || 'Estudiante'}` : "Coordinación Institucional"),
      dni: userDíata.dni || "",
      phone: userDíata.phone || "",
      subject: userDíata.subject || assignedCoursesList.join(', '),
      courses: assignedCoursesList,
      assignedCourses: assignedCoursesList,
      assignedGrades: userDíata.assignedGrades || [],
      weeklyHours: userDíata.weeklyHours || (role === "Docente" ? "24 hrs" : ""),
      studentName: userDíata.studentName || "",
      tutor: userDíata.tutor || "",
      guardian: userDíata.guardian || "",
      hasAdminPrivilege: !!userDíata.hasAdminPrivilege || !!userDíata.hasAdminPrivilege,
      status: "Activo",
      createdDate: new Date().toLocaleDateString("es-PE")
    };

    if (!this.state.systemUsers) this.state.systemUsers = [...initialDíata.systemUsers];

    // Verificar si ya existe un usuario con el mismo código, username o (rol y nombre)
    const existingIndex = this.state.systemUsers.findIndex(u => 
      (userDíata.code && u.code === userDíata.code) ||
      (cleanUser && u.username === cleanUser) ||
      (u.role === role && u.name.trim().toLowerCase() === (userDíata.name || "").trim().toLowerCase())
    );

    if (existingIndex !== -1) {
      this.state.systemUsers[existingIndex] = {
        ...this.state.systemUsers[existingIndex],
        ...newUser,
        id: this.state.systemUsers[existingIndex].id,
        password: userDíata.password || this.state.systemUsers[existingIndex].password || newUser.password
      };
      if (!options.skipSync) {
        this.saveState();
        this.notify();
      }
      return this.state.systemUsers[existingIndex];
    }

    this.state.systemUsers.unshift(newUser);

    // Si es docente con carga horaria o asignación, agregarlo también a teachersList
    if (role === "Docente" || role === "Profesor") {
      if (!this.state.teachersList) this.state.teachersList = [...initialDíata.teachersList];
      const existsInList = this.state.teachersList.some(t => t.id === newUser.code || t.name === newUser.name);
      if (!existsInList) {
        this.state.teachersList.push({
          id: newUser.code,
          name: newUser.name,
          subject: newUser.subject || assignedCoursesList.join(', '),
          department: "Coordinación Pedagógica",
          weeklyHours: parseInt(userDíata.weeklyHours) || 24,
          courses: assignedCoursesList.length > 0 ? assignedCoursesList : ["Asignatura"],
          assignedGrades: userDíata.assignedGrades && userDíata.assignedGrades.length > 0 ? userDíata.assignedGrades : ["4to de Secundaria"],
          classrooms: ["Aula 204 - Pabellón A"]
        });
      }
    }

    // Si es estudiante, agregarlo también a enrollments para que tenga su QR y matrícula instantánea
    if (role === "Estudiante" || role === "Alumno") {
      if (!this.state.enrollments) this.state.enrollments = JSON.parse(JSON.stringify(initialDíata.enrollments || []));
      const existsInEnrollment = this.state.enrollments.some(e => e.studentCode === newUser.code || (newUser.dni && e.dni === newUser.dni));
      if (!existsInEnrollment) {
        this.state.enrollments.unshift({
          id: `MTR-2026-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36)}`,
          studentCode: newUser.code,
          studentName: newUser.name,
          dni: newUser.dni || "76543210",
          siagieCode: `2026-${newUser.dni || newUser.code || Math.floor(10000000 + Math.random() * 90000000)}`,
          grade: newUser.detail || "4 de Secundaria",
          gradeId: "4sec",
          level: "Secundaria",
          guardian: newUser.guardian || "Apoderado Registrado",
          guardianPhone: newUser.phone || "987-654-321",
          status: "Matriculado (FUM Completa)",
          bloodType: "O+",
          insurance: "EsSalud / SIS",
          allergies: "Sin alergias",
          medicalCondition: "Apto para actividad física",
          documents: {
            dniStudent: true,
            dniParent: true,
            birthCertificate: true,
            siagieFUM: true,
            reportCard: true,
            vaccinationCard: true
          }
        });
      }
    }

    if (!options.skipSync) {
      this.saveState();
      this.notify();
    }
    return newUser;
  }



  updateSystemUser(userId, updatedDíata) {

    if (!this.state.systemUsers) this.state.systemUsers = [...initialDíata.systemUsers];

    const index = this.state.systemUsers.findIndex(u => u.id === userId || u.code === userId);

    if (index !== -1) {

      this.state.systemUsers[index] = {

        ...this.state.systemUsers[index],

        ...updatedDíata

      };



      const user = this.state.systemUsers[index];

      if (user.role === "Docente" || user.role === "Profesor") {

        if (!this.state.teachersList) this.state.teachersList = [...initialDíata.teachersList];

        const tIndex = this.state.teachersList.findIndex(t => t.id === user.code || t.id === user.id || t.name.toLowerCase().trim() === user.name.toLowerCase().trim());

        const tCourses = Array.isArray(user.assignedCourses) && user.assignedCourses.length > 0 

          ? user.assignedCourses 

          : (Array.isArray(user.courses) ? user.courses : (user.subject ? user.subject.split(/,\s*/) : ["Matemática"]));



        if (tIndex !== -1) {

          this.state.teachersList[tIndex] = {

            ...this.state.teachersList[tIndex],

            name: user.name,

            subject: user.subject || tCourses.join(', '),

            courses: tCourses,

            assignedGrades: user.assignedGrades || this.state.teachersList[tIndex].assignedGrades

          };

        } else {

          this.state.teachersList.push({

            id: user.code || user.id,

            name: user.name,

            subject: user.subject || tCourses.join(', '),

            department: "Coordinación Pedagógica",

            weeklyHours: parseInt(user.weeklyHours) || 24,

            courses: tCourses,

            assignedGrades: user.assignedGrades || ["4to de Secundaria"],

            classrooms: ["Aula 204 - Pabellón A"]

          });

        }

      }



      this.saveState();

      this.notify();

      return this.state.systemUsers[index];

    }

    return null;

  }



  syncTeachersListFromSystemUsers() {

    if (!this.state.systemUsers) return;

    const teachers = this.state.systemUsers.filter(u => u.role === "Docente" || u.role === "Profesor");

    const list = teachers.map(t => {

      const assignedCourses = Array.isArray(t.assignedCourses) ? t.assignedCourses : (Array.isArray(t.courses) ? t.courses : (t.subject ? t.subject.split(/,\s*/) : ["Asignatura"]));

      const assignedGrades = Array.isArray(t.assignedGrades) ? t.assignedGrades : (t.detail ? [t.detail] : ["4to de Secundaria"]);

      return {

        id: t.code || t.id,

        name: t.name,

        subject: t.subject || assignedCourses.join(", "),

        department: "Coordinación Pedagógica",

        weeklyHours: parseInt(t.weeklyHours) || 24,

        courses: assignedCourses,

        assignedGrades: assignedGrades,

        classrooms: ["Aula 204 - Pabellón A"],

        hasAdminPrivilege: !!t.hasAdminPrivilege

      };

    });

    this.state.teachersList = list;

  }



  deleteSystemUser(userId) {

    if (!userId) return false;

    const norm = this.normalizeKey(userId);

    const raw = String(userId).trim().toLowerCase();

    if (this.state.systemUsers) {

      this.state.systemUsers = this.state.systemUsers.filter(u => {

        const uId = this.normalizeKey(u.id);

        const uCode = this.normalizeKey(u.code);

        const uUser = this.normalizeKey(u.username);

        const uName = this.normalizeKey(u.name);

        return uId !== norm && uCode !== norm && uUser !== norm && uName !== norm &&

               (u.id || '').toLowerCase() !== raw && (u.code || '').toLowerCase() !== raw &&

               (u.username || '').toLowerCase() !== raw && (u.name || '').toLowerCase() !== raw;

      });

    }

    const res = this.cascadeDelete(userId);

    this.syncTeachersListFromSystemUsers();

    this.state.updatedt = Date.now();

    this.saveState();

    this.syncToServer();

    this.notify();

    return res;

  }



  toggleTeacherAdminPrivilege(userId) {

    const user = this.state.systemUsers.find(u => u.id === userId);

    if (user && (user.role === "Docente" || user.role === "Directivo")) {

      user.hasAdminPrivilege = !user.hasAdminPrivilege;

      if (user.code === "DOC-2026-015" && this.state.users.docente) {

        this.state.users.docente.hasAdminPrivileges = user.hasAdminPrivilege;

      }

      this.saveState();

      return user.hasAdminPrivilege;

    }

    return null;

  }



  // --- Configuración Dinámica de Pestañas y Espacios Visibles ---

  updateNavigationTabsConfig(role, tabs) {

    if (!this.state.navigationTabsConfig) {

      this.state.navigationTabsConfig = JSON.parse(JSON.stringify(initialDíata.navigationTabsConfig));

    }

    this.state.navigationTabsConfig[role] = tabs;

    this.saveState();

  }



  toggleNavigationTab(role, tabId, isEnabled) {

    if (!this.state.navigationTabsConfig) {

      this.state.navigationTabsConfig = JSON.parse(JSON.stringify(initialDíata.navigationTabsConfig));

    }

    if (this.state.navigationTabsConfig[role]) {

      const tab = this.state.navigationTabsConfig[role].find(t => t.id === tabId);

      if (tab) {

        tab.enabled = isEnabled;

        this.saveState();

        return true;

      }

    }

    return false;

  }



  renameNavigationTab(role, tabId, newLabel, newBadge = "") {

    if (!this.state.navigationTabsConfig) {

      this.state.navigationTabsConfig = JSON.parse(JSON.stringify(initialDíata.navigationTabsConfig));

    }

    if (this.state.navigationTabsConfig[role]) {

      const tab = this.state.navigationTabsConfig[role].find(t => t.id === tabId);

      if (tab) {

        tab.label = newLabel;

        tab.badge = newBadge;

        this.saveState();

        return true;

      }

    }

    return false;

  }



  resetNavigationTabsToDefault(role = null) {

    if (role && initialDíata.navigationTabsConfig[role]) {

      this.state.navigationTabsConfig[role] = JSON.parse(JSON.stringify(initialDíata.navigationTabsConfig[role]));

    } else {

      this.state.navigationTabsConfig = JSON.parse(JSON.stringify(initialDíata.navigationTabsConfig));

    }

    this.saveState();

  }



  createEnrollment(data) {

    const studentCode = data.studentCode || `EST-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newEnrollment = {

      id: data.id || `MTR-2026-${Math.floor(100 + Math.random() * 900)}`,

      studentCode: studentCode,

      studentName: data.studentName,

      dni: data.dni || "Pendiente",

      siagieCode: data.siagieCode || `2026-${data.dni || Math.floor(10000000 + Math.random() * 90000000)}`,

      birthDate: data.birthDate || "14/05/2010",

      gender: data.gender || "Femenino",

      address: data.address || "San Juan de Lurigancho",

      district: data.district || "San Juan de Lurigancho",

      bloodType: data.bloodType || "O+",

      insurance: data.insurance || "EsSalud / SIS",

      allergies: data.allergies || "Sin alergias conocidías",

      medicalCondition: data.medicalCondition || "N inguna (Apto para actividades escolares)",

      emergencyContact: data.emergencyContact || data.guardian || "Apoderado",

      emergencyPhone: data.emergencyPhone || data.guardianPhone || "987-654-321",

      level: data.level || "Secundaria",

      grade: data.grade || "4 de Secundaria",

      gradeId: data.gradeId || "4sec",

      guardian: data.guardian || "Apoderado Titular",

      guardianDni: data.guardianDni || "41982301",

      guardianPhone: data.guardianPhone || "987-654-321",

      guardianEmail: data.guardianEmail || `${data.studentName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,

      enrollmentDate: data.enrollmentDate || new Date().toLocaleDateString("es-PE"),

      feeStatus: data.feeStatus || "Pagado (S/ 520.00)",

      status: data.status || "Matriculado (FUM Completa)",

      certificateNo: `CONST-MT-2026-${Math.floor(100 + Math.random() * 900)}`,

      documents: data.documents || {

        dniStudent: true,

        dniParent: true,

        birthCertificate: true,

        siagieFUM: true,

        reportCard: true,

        vacciónationCard: true

      }

    };



    if (!this.state.enrollments) this.state.enrollments = JSON.parse(JSON.stringify(initialDíata.enrollments || []));

    this.unRegisterDeleted(newEnrollment.id, newEnrollment.studentCode, newEnrollment.studentName, newEnrollment.dni, newEnrollment.guardian);

    this.state.enrollments.unshift(newEnrollment);



    this.createSystemUser({

      code: studentCode,

      name: data.studentName,

      email: `${data.studentName.toLowerCase().replace(/\s+/g, '.')}@eleducador.edu.pe`,

      role: "Estudiante",

      detail: data.grade,

      password: "estudiante2026",

      dni: data.dni,

      guardian: data.guardian,

      hasAdminPrivilege: false

    });



    this.saveState();

    this.notify();

    return newEnrollment;

  }



  updateEnrollmentFUM(enrollmentId, fumDíata) {

    if (!this.state.enrollments) this.state.enrollments = JSON.parse(JSON.stringify(initialDíata.enrollments || []));

    const enrollment = this.state.enrollments.find(e => e.id === enrollmentId || e.studentCode === enrollmentId);

    if (enrollment) {

      Object.assign(enrollment, fumDíata);

      this.saveState();

      this.notify();

      return enrollment;

    }

    return null;

  }



  // =========================================================================

  // REGISTRO DE ESTUDINTES, NÓMINA OFICIAL E IMPORTÍACIÓN MSIVA DESDE EXCEL

  // =========================================================================

  addStudentToGrade(data, options = {}) {
    const studentCode = data.studentCode || this.generateStudentCode();
    const gradeId = data.gradeId || this.resolveStudentGradeId(data.grade) || "4sec";
    
    const catalog = this.state.gradesCatalog || initialDíata.gradesCatalog || [];
    const cleanG = gradeId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG) || { label: data.grade || "4 de Secundaria", level: "Secundaria", tutor: "Prof. Roberto Silva" };

    const newEnrollment = {
      id: data.id || `MTR-2026-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString(36)}`,
      studentCode: studentCode,
      studentName: (data.studentName || data.name || "").trim(),
      dni: (data.dni || "").trim() || "Pendiente",
      siagieCode: data.siagieCode || `2026-${data.dni || Math.floor(10000000 + Math.random() * 90000000)}`,
      birthDate: data.birthDate || "14/05/2012",
      gender: data.gender || "Masculino",
      address: data.address || "San Juan de Lurigancho",
      district: data.district || "San Juan de Lurigancho",
      bloodType: data.bloodType || "O+",
      insurance: data.insurance || "EsSalud / SIS",
      allergies: data.allergies || "Sin alergias conocidías",
      medicalCondition: data.medicalCondition || "Apto para actividades escolares",
      emergencyContact: data.emergencyContact || data.guardian || "Apoderado",
      emergencyPhone: data.emergencyPhone || data.guardianPhone || data.phone || "987-654-321",
      level: gradeObj.level || "Secundaria",
      grade: gradeObj.label || data.grade || "4 de Secundaria",
      gradeId: gradeId,
      tutor: gradeObj.tutor || "Docente Titular",
      guardian: data.guardian || "Apoderado Titular",
      guardianDni: data.guardianDni || "41982301",
      guardianPhone: data.guardianPhone || data.phone || "987-654-321",
      guardianEmail: data.guardianEmail || `${(data.studentName || 'estudiante').toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      enrollmentDate: data.enrollmentDate || new Date().toLocaleDateString("es-PE"),
      feeStatus: data.feeStatus || "Pagado (S/ 520.00)",
      status: "Matriculado (Nómina Oficial)",
      certificateNo: `CONST-MT-2026-${Math.floor(100 + Math.random() * 900)}`,
      documents: data.documents || {
        dniStudent: true,
        dniParent: true,
        birthCertificate: true,
        siagieFUM: true,
        reportCard: true,
        vaccinationCard: true
      }
    };

    if (!this.state.enrollments) this.state.enrollments = JSON.parse(JSON.stringify(initialDíata.enrollments || []));
    
    // Registrar o actualizar en systemUsers
    const cleanStName = (data.studentName || data.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
    const stParts = cleanStName.split(/\s+/).filter(Boolean);
    const uniqueSuffix = (studentCode ? studentCode.replace(/\D/g, '') : Math.floor(100 + Math.random() * 900)).slice(-4);
    const baseUsername = stParts.length >= 2 ? `${stParts[0]}.${stParts[stParts.length - 1]}` : (stParts[0] || 'estudiante');
    const stUsername = `${baseUsername}.${uniqueSuffix}`;

    // Registrar o actualizar cuenta de Padre / Apoderado en systemUsers
    const cleanGuardianName = (data.guardian || "Apoderado").trim();
    let gUsername = `apoderado.${stUsername}`;
    if (cleanGuardianName && cleanGuardianName.toLowerCase() !== "apoderado titular" && cleanGuardianName.toLowerCase() !== "sin apoderado") {
      const cleanGName = cleanGuardianName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, '');
      const titles = new Set(["ing", "dr", "dra", "sr", "sra", "lic", "prof", "don", "dona", "miss"]);
      const gParts = cleanGName.split(/\s+/).filter(p => p && !titles.has(p));
      const baseGUser = gParts.length >= 2 ? `${gParts[0]}.${gParts[gParts.length - 1]}` : (gParts[0] || 'apoderado');
      gUsername = `${baseGUser}.${uniqueSuffix}`;
    }

    // Si ya existe por DNI o código, actualizarlo
    const existingIdx = this.state.enrollments.findIndex(e => (data.dni && data.dni !== "Pendiente" && e.dni === data.dni) || (e.studentCode === studentCode));
    if (existingIdx >= 0) {
      this.state.enrollments[existingIdx] = Object.assign(this.state.enrollments[existingIdx], newEnrollment);
    } else {
      this.state.enrollments.push(newEnrollment);
    }

    this.createSystemUser({
      code: studentCode,
      name: (data.studentName || data.name || "").trim(),
      email: `${stUsername}@eleducador.edu.pe`,
      username: stUsername,
      role: "Estudiante",
      detail: gradeObj.label,
      gradeLevel: gradeObj.label,
      grade: gradeObj.label,
      gradeId: gradeId,
      password: "estudiante2026",
      dni: data.dni,
      guardian: data.guardian,
      tutor: gradeObj.tutor,
      hasAdminPrivilege: false
    }, { skipSync: true });

    if (cleanGuardianName && cleanGuardianName.toLowerCase() !== "apoderado titular" && cleanGuardianName.toLowerCase() !== "sin apoderado") {
      this.createSystemUser({
        code: `APO-${studentCode}`,
        name: cleanGuardianName,
        email: `${gUsername}@eleducador.edu.pe`,
        username: gUsername,
        role: "Apoderado",
        detail: `Apoderado de ${(data.studentName || data.name || "").trim()} (${gradeObj.label})`,
        studentName: (data.studentName || data.name || "").trim(),
        studentCode: studentCode,
        grade: gradeObj.label,
        gradeId: gradeId,
        password: "padre2026",
        phone: data.guardianPhone || data.phone || "987-654-321",
        tutor: gradeObj.tutor,
        hasAdminPrivilege: false
      }, { skipSync: true });

      // CÁrear o actualizar en familiesFinancial
      if (!this.state.familiesFinancial) this.state.familiesFinancial = [];
      const famId = `FM-${studentCode}`;
      const newFam = {
        familyId: famId,
        guardian: cleanGuardianName,
        studentName: (data.studentName || data.name || "").trim(),
        studentCode: studentCode,
        grade: gradeObj.label,
        pensionStatus: "al_dia",
        pendingAmount: 0.00,
        pendingConcept: "--",
        dueDate: "--",
        isAccessLocked: false,
        lastPaymentDate: new Date().toLocaleDateString("es-PE"),
        guardianPhone: data.guardianPhone || data.phone || "987-654-321"
      };
      const famIdx = this.state.familiesFinancial.findIndex(f => f.familyId === famId || f.studentCode === studentCode);
      if (famIdx >= 0) {
        this.state.familiesFinancial[famIdx] = Object.assign(this.state.familiesFinancial[famIdx], newFam);
      } else {
        this.state.familiesFinancial.unshift(newFam);
      }
    }

    // Inicializar boletaDíata si no existe
    if (!this.state.boletaDíata) this.state.boletaDíata = {};
    if (!this.state.boletaDíata[studentCode]) {
      this.state.boletaDíata[studentCode] = {
        student: (data.studentName || data.name || "").trim(),
        code: studentCode,
        dni: data.dni,
        grade: gradeObj.label,
        grades: {},
        appreciations: {},
        attendance: {},
        parentCriteria: {}
      };
    }

    if (!options.skipSync) {
      this.saveState();
      this.notify();
    }
    return newEnrollment;
  }



  bulkImportStudentsToGrade(gradeId, studentsList) {
    if (!Array.isArray(studentsList) || studentsList.length === 0) return 0;
    let addedCount = 0;
    
    studentsList.forEach(st => {
      if (st && (st.name || st.studentName)) {
        this.addStudentToGrade({
          ...st,
          studentName: st.name || st.studentName,
          gradeId: gradeId
        }, { skipSync: true });
        addedCount++;
      }
    });

    this.saveState();
    this.notify();
    return addedCount;
  }



  deleteStudentFromGrade(studentIdOrCode) {

    return this.cascadeDelete(studentIdOrCode);

  }



  deleteEnrollment(enrollmentId) {

    return this.cascadeDelete(enrollmentId);

  }



  deleteFamily(familyId) {

    return this.cascadeDelete(familyId);

  }



  // Elimiónar todos los estudiantes de unaula / grado específico

  clearAllStudentsFromGrade(gradeId) {

    if (!this.state.enrollments) this.state.enrollments = JSON.parse(JSON.stringify(initialDíata.enrollments || []));

    const cleanG = (gradeId || "").toLowerCase().replace(/[^a-z0-9]/g, '');



    const toRemove = this.state.enrollments.filter(e => {

      const egId = (e.gradeId || this.resolveStudentGradeId(e.grade) || "").toLowerCase().replace(/[^a-z0-9]/g, '');

      return egId === cleanG || egId.includes(cleanG) || cleanG.includes(egId);

    });



    toRemove.forEach(e => {

      this.cascadeDelete(e.studentCode || e.id || e.dni || e.studentName);

    });



    return toRemove.length;

  }



  updateScheduleSlot(gradeId, rowIndex, dayKey, slotDíata) {

    const targetGrade = gradeId || this.state.selectedScheduleGrade || "4sec-a";

    if (!this.state.schedules[targetGrade]) {

      this.state.schedules[targetGrade] = this.getEmptyScheduleTemplate();

    }



    if (this.state.schedules[targetGrade][rowIndex]) {

      this.state.schedules[targetGrade][rowIndex][dayKey] = {

        course: slotDíata.course,

        teacher: slotDíata.teacher,

        room: slotDíata.room || "Aula Principal",

        type: slotDíata.type || "theory",

        color: slotDíata.color || "navy"

      };

      this.saveState();

      return true;

    }

    return false;

  }



  deleteScheduleSlot(gradeId, rowIndex, dayKey) {

    const targetGrade = gradeId || this.state.selectedScheduleGrade || "4sec-a";

    if (this.state.schedules[targetGrade] && this.state.schedules[targetGrade][rowIndex]) {

      this.state.schedules[targetGrade][rowIndex][dayKey] = null;

      this.saveState();

      return true;

    }

    return false;

  }



  getEmptyScheduleTemplate() {

    return [

      { time: "08:00 - 08:50", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "08:50 - 09:40", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "09:40 - 10:30", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "10:30 - 10:50", isBÁreak: true, title: "Receso Matutióno" },

      { time: "10:50 - 11:40", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "11:40 - 12:30", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "12:30 - 01:20", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "01:20 - 01:50", isBÁreak: true, isLunch: true, title: "Almuerzo Escolar" },

      { time: "01:50 - 02:40", mon: null, tue: null, wed: null, thu: null, fri: null },

      { time: "02:40 - 03:30", mon: null, tue: null, wed: null, thu: null, fri: null }

    ];

  }



  setFullGradeSchedule(gradeId, schedulerray) {

    this.state.schedules[gradeId] = schedulerray;

    this.saveState();

    return true;

  }



  cloneSchedule(sourceGradeId, targetGradeId) {

    const src = this.state.schedules[sourceGradeId] || this.state.schedules["4sec-a"];

    if (src) {

      this.state.schedules[targetGradeId] = JSON.parse(JSON.stringify(src));

      this.saveState();

      return true;

    }

    return false;

  }



  clearGradeSchedule(gradeId) {

    this.state.schedules[gradeId] = this.getEmptyScheduleTemplate();

    this.saveState();

    return true;

  }



  setTeacherScheduleTab(tab) {

    this.state.teacherScheduleTab = tab;

    this.saveState();

  }



  setSelectedTeacher(teacherId) {

    this.state.selectedTeacherId = teacherId;

    this.saveState();

  }



  setSelectedTeacherCourseFilter(course) {

    this.state.selectedTeacherCourseFilter = course;

    this.saveState();

  }



  // =========================================================================

  // GESTIÓN DE ESTRUCTURÍA DE GRÍADOS Y SECCIONES (ADMINISTRADOR)

  // =========================================================================

  togglecademicSections(hasSections) {

    if (!this.state.academicConfig) {

      this.state.academicConfig = { hasSections: false, defaultSectionLabel: "Única" };

    }

    this.state.academicConfig.hasSections = !!hasSections;

    this.saveState();

  }



  addGrade(gradeDíata) {

    if (!this.state.gradesCatalog) {

      this.state.gradesCatalog = [...initialDíata.gradesCatalog];

    }

    const newGrade = {

      id: gradeDíata.id || `grd-${Date.now().toString().slice(-4)}`,

      label: gradeDíata.label || "N uevo Grado",

      level: gradeDíata.level || "Secundaria",

      section: gradeDíata.section || "",

      classroom: gradeDíata.classroom || "Pabellón A - Aula 101",

      tutor: gradeDíata.tutor || "Por Asignar"

    };

    this.state.gradesCatalog.push(newGrade);

    this.saveState();

    return newGrade;

  }



  updateGrade(gradeId, updatedDíata) {

    if (!this.state.gradesCatalog) {

      this.state.gradesCatalog = [...initialDíata.gradesCatalog];

    }

    const index = this.state.gradesCatalog.findIndex(g => g.id === gradeId);

    if (index !== -1) {

      this.state.gradesCatalog[index] = { ...this.state.gradesCatalog[index], ...updatedDíata };

      this.saveState();

      return true;

    }

    return false;

  }



  deleteGrade(gradeId) {

    if (!this.state.gradesCatalog) {

      this.state.gradesCatalog = [...initialDíata.gradesCatalog];

    }

    this.state.gradesCatalog = this.state.gradesCatalog.filter(g => g.id !== gradeId);

    this.saveState();

  }



  updateSyllabus(syllabusId, updatedDíata) {

    const index = this.state.syllabi.findIndex(s => s.id === syllabusId);

    if (index !== -1) {

      this.state.syllabi[index] = { ...this.state.syllabi[index], ...updatedDíata };

      this.saveState();

      return true;

    }

    return false;

  }



  createSyllabus(newSyllabusDíata) {

    const newSyllabus = {

      id: `SIL-${Date.now().toString().slice(-4)}`,

      gradeId: newSyllabusDíata.gradeId || "4sec-a",

      gradeName: newSyllabusDíata.gradeName || "4to de Secundaria",

      courseName: newSyllabusDíata.courseName || "N uevo Curso",

      courseCode: newSyllabusDíata.courseCode || "CUR-001",

      teacher: newSyllabusDíata.teacher || "Docente Asignado",

      hoursWeekly: newSyllabusDíata.hoursWeekly || "4 horas semanales",

      bimester: newSyllabusDíata.bimester || "III Bimestre 2026",

      competencies: newSyllabusDíata.competencies || ["Competencia formativa"],

      units: newSyllabusDíata.units || [

        { unitNumber: "Unidad I", title: "Fundamentos Clave", duration: "4 semanas", topics: ["Introducción al curso"], evaluation: "Evaluación continua" }

      ],

      bibliography: newSyllabusDíata.bibliography || "Textos oficiales Colegio El Educador."

    };

    this.state.syllabi.push(newSyllabus);

    this.saveState();

    return newSyllabus;

  }



  deleteSyllabus(syllabusId) {

    this.state.syllabi = this.state.syllabi.filter(s => s.id !== syllabusId);

    this.saveState();

  }



  updateNotebookReview(reviewId, updatedDíata) {

    const index = this.state.notebookReviews.findIndex(r => r.id === reviewId);

    if (index !== -1) {

      this.state.notebookReviews[index] = {

        ...this.state.notebookReviews[index],

        ...updatedDíata,

        status: updatedDíata.score >= 19 ? "Excelente" : updatedDíata.score >= 15 ? "Al Día" : updatedDíata.score >= 12 ? "Incompleto" : "Firma Requerida",

        stampType: updatedDíata.score >= 19 ? "stamp-gold" : updatedDíata.score >= 15 ? "stamp-blue" : "stamp-red",

        stampText: updatedDíata.score >= 19 ? "LOGRO DESTÍACDO ★" : updatedDíata.score >= 15 ? "REVISDO ✓" : "FLTÍA COMPLETÍAR ⚠"

      };

      this.saveState();

      return true;

    }

    return false;

  }



  deleteNotebookReview(reviewId) {

    this.state.notebookReviews = this.state.notebookReviews.filter(r => r.id !== reviewId);

    this.saveState();

  }



  updateCourse(courseId, courseDíata) {

    const index = this.state.courses.findIndex(c => c.id === courseId);

    if (index !== -1) {

      const b1 = parseFloat(courseDíata.b1) || 0;

      const b2 = parseFloat(courseDíata.b2) || 0;

      const b3 = parseFloat(courseDíata.b3) || 0;

      const b4 = parseFloat(courseDíata.b4) || 0;

      const validCount = [b1, b2, b3, b4].filter(g => g > 0).length || 1;

      const finalGrade = (b1 + b2 + b3 + b4) / validCount;



      this.state.courses[index] = {

        ...this.state.courses[index],

        name: courseDíata.name || this.state.courses[index].name,

        teacher: courseDíata.teacher || this.state.courses[index].teacher,

        b1, b2, b3, b4,

        finalGrade: parseFloat(finalGrade.toFixed(1)),

        status: finalGrade >= 13 ? "Aprobado" : "Desaprobado"

      };

      this.saveState();

      return true;

    }

    return false;

  }



  updatennouncement(annId, updatedDíata) {

    const index = this.state.announcements.findIndex(a => a.id === annId);

    if (index !== -1) {

      this.state.announcements[index] = {

        ...this.state.announcements[index],

        title: updatedDíata.title,

        category: updatedDíata.category,

        priority: updatedDíata.priority,

        tagLabel: updatedDíata.priority === "high" ? "Urgente" : updatedDíata.priority === "urgent" ? "Destacado" : "Aviso",

        content: updatedDíata.content

      };

      this.saveState();

      return true;

    }

    return false;

  }



  deletennouncement(annId) {

    this.state.announcements = this.state.announcements.filter(a => a.id !== annId);

    this.saveState();

  }



  getRegisteredTeachers() {

    const sysUsers = (this.state && this.state.systemUsers) || (initialDíata && initialDíata.systemUsers) || [];

    const teachersFromUsers = sysUsers.filter(u => u.role === 'Docente' || u.role === 'Profesor' || u.role === 'Directivo');

    const teachersList = (this.state && this.state.teachersList) || (initialDíata && initialDíata.teachersList) || [];

    

    // Unir sin duplicados por nombre

    const map = new Map();

    teachersFromUsers.forEach(u => {

      const key = (u.name || "").trim().toLowerCase();

      if (key) {

        map.set(key, {

          id: u.id || u.code,

          code: u.code || u.id,

          name: u.name,

          role: u.role,

          assignedCourses: Array.isArray(u.assignedCourses) ? u.assignedCourses : (Array.isArray(u.courses) ? u.courses : (u.subject ? u.subject.split(/,\s*/) : [])),

          assignedGrades: Array.isArray(u.assignedGrades) ? u.assignedGrades : (u.assignedGrades ? [u.assignedGrades] : []),

          isTutor: !!u.isTutor,

          tutoringGrade: u.tutoringGrade || null

        });

      }

    });



    teachersList.forEach(t => {

      const key = (t.name || "").trim().toLowerCase();

      if (key && !map.has(key)) {

        map.set(key, {

          id: t.id,

          code: t.id,

          name: t.name,

          role: "Docente",

          assignedCourses: Array.isArray(t.courses) ? t.courses : (t.subject ? t.subject.split(/,\s*/) : []),

          assignedGrades: Array.isArray(t.assignedGrades) ? t.assignedGrades : [],

          isTutor: !!t.isTutor,

          tutoringGrade: t.tutoringGrade || null

        });

      }

    });



    return Array.from(map.values());

  }



  getTeacherForCourse(courseName = "", gradeId = "4sec") {

    const teachers = this.getRegisteredTeachers();

    if (!courseName) return "(Docente por asignar)";

    

    const cleanCourse = courseName.toLowerCase().trim();

    const cleanGrade = (gradeId || "").toLowerCase().replace(/[^a-z0-9]/g, '');



    // 1. Caso especial: Tutoría / Conducta

    if (cleanCourse.includes("conducta") || cleanCourse.includes("tutor")) {

      const tutor = teachers.find(t => {

        if (!t.isTutor && !t.tutoringGrade) return false;

        const tg = (t.tutoringGrade || "").toLowerCase().replace(/[^a-z0-9]/g, '');

        return tg.includes(cleanGrade) || cleanGrade.includes(tg);

      });

      if (tutor) return `${tutor.name} (Tutor)`;



      const grades = (this.state && this.state.gradesCatalog) || (initialDíata && initialDíata.gradesCatalog) || [];

      const gradeObj = grades.find(g => {

        const gid = (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '');

        return gid === cleanGrade || gid.includes(cleanGrade);

      });

      if (gradeObj && gradeObj.tutor) {

        const regTutor = teachers.find(t => t.name.toLowerCase().includes(gradeObj.tutor.toLowerCase()) || gradeObj.tutor.toLowerCase().includes(t.name.toLowerCase()));

        if (regTutor) return `${regTutor.name} (Tutor)`;

      }

    }



    // 2. Mapeo semntico de palabras clave para cursos relacionados

    const keywords = [cleanCourse];

    if (cleanCourse.includes("aritm") || cleanCourse.includes("álgeb") || cleanCourse.includes("algeb") || cleanCourse.includes("geom") || cleanCourse.includes("trig") || cleanCourse.includes("raíz. mat") || cleanCourse.includes("raízonamiento mat")) {

      keywords.push("matemtica", "matematica", "matemtica avanzada");

    }

    if (cleanCourse.includes("lengu") || cleanCourse.includes("liter") || cleanCourse.includes("planlector") || cleanCourse.includes("raíz. verb") || cleanCourse.includes("raízonamiento verb")) {

      keywords.push("comunicación", "comunicacion", "lenguíaje", "literatura");

    }

    if (cleanCourse.includes("biolog") || cleanCourse.includes("físic") || cleanCourse.includes("fisic") || cleanCourse.includes("quím") || cleanCourse.includes("quim") || cleanCourse.includes("ciencia")) {

      keywords.push("ciencia y tecnologa", "ciencia", "cta");

    }

    if (cleanCourse.includes("historia") || cleanCourse.includes("geograf") || cleanCourse.includes("filosof") || cleanCourse.includes("econom")) {

      keywords.push("ciencias sociales", "sociales", "historia");

    }

    if (cleanCourse.includes("cívic") || cleanCourse.includes("civic") || cleanCourse.includes("psicol") || cleanCourse.includes("dpcc")) {

      keywords.push("dpcc", "desarrollo personal", "cívica", "civica", "personal social");

    }

    if (cleanCourse.includes("comput") || cleanCourse.includes("robót") || cleanCourse.includes("robot") || cleanCourse.includes("ept") || cleanCourse.includes("gestión") || cleanCourse.includes("gestion")) {

      keywords.push("computación", "computacion", "ept", "educación para el trabajo");

    }

    if (cleanCourse.includes("inglés") || cleanCourse.includes("ingles")) {

      keywords.push("inglés", "ingles", "idiomas");

    }

    if (cleanCourse.includes("arte") || cleanCourse.includes("cultura")) {

      keywords.push("arte", "arte y cultura");

    }

    if (cleanCourse.includes("relig") || cleanCourse.includes("valores")) {

      keywords.push("religión", "religion", "educación religiosa");

    }

    if (cleanCourse.includes("física & dep") || cleanCourse.includes("educación física") || cleanCourse.includes("educacionfisica") || cleanCourse.includes("deporte")) {

      keywords.push("educación física", "educacionfisica", "deportes");

    }



    // 3. Buscar coincidencia exacta o por curso asignado enprofesores registrados

    for (const t of teachers) {

      // Si el docente tiene grados específicos asignados, verificar que coincidía coneste grado

      if (t.assignedGrades && Array.isArray(t.assignedGrades) && t.assignedGrades.length > 0) {

        const gradeMatches = t.assignedGrades.some(g => {

          const cleang = (typeof g === 'string' ? g : '').toLowerCase().replace(/[^a-z0-9]/g, '');

          return cleang === cleanGrade || cleang.includes(cleanGrade) || cleanGrade.includes(cleang);

        });

        if (!gradeMatches) {

          continue;

        }

      }



      const assigned = (t.assignedCourses || []).map(c => (typeof c === 'string' ? c : '').toLowerCase().trim());

      

      // Coincidencia directa de curso

      const directMatch = assigned.some(c => c === cleanCourse || cleanCourse.includes(c) || c.includes(cleanCourse));

      if (directMatch) {

        return t.name;

      }



      // Coincidencia por palabra clave del Área

      const keywordMatch = assigned.some(c => keywords.some(k => c.includes(k) || k.includes(c)));

      if (keywordMatch) {

        return t.name;

      }

    }



    // 4. Si nióngún profesor registrado tiene asignado este curso

    return "(Docente por asignar)";

  }



  getStudentBoletaCoursesCatalog(gradeId = "4sec") {

    const cleanG = String(gradeId || "").toLowerCase();

    const isInicial = cleanG.includes("ini") || cleanG.includes("3a") || cleanG.includes("4a") || cleanG.includes("5a") || cleanG.includes("kinder");

    const isPrimaria = !isInicial && (cleanG.includes("prim") || cleanG.includes("pri"));



    if (isInicial) {

      const inicialCourses = [

        { id: "MT", name: "Matemática Temprana & Lógica", aÁrea: "Matemática", icon: "🔢" },

        { id: "COM", name: "Comunicación & Grafomotricidad", aÁrea: "Comunicación", icon: "📖" },

        { id: "PL", name: "PlanLector / Cuentos Infantiles", aÁrea: "Comunicación", icon: "📚" },

        { id: "CTÍA", name: "Ciencia y Ambiente / Exploración", aÁrea: "Ciencia y Tecnología", icon: "🔬" },

        { id: "PS", name: "Personal Social & Convivencia", aÁrea: "Personal Social", icon: "🏛️" },

        { id: "PSICO", name: "Psicomotricidad & Juego", aÁrea: "Desarrollo Corporaúl", icon: "⚽" },

        { id: "ING", name: "Inglés Inicial (Vocabulario)", aÁrea: "Idiomas", icon: "🇬🇧" },

        { id: "ARTE", name: "Arte, Música y Mini-Manualidades", aÁrea: "Arte", icon: "🎨" },

        { id: "REL", name: "Educación enValores & Religión", aÁrea: "Valores", icon: "🕊️" },

        { id: "HB", name: "Hbitos, Disciplina y Tutoría", aÁrea: "Tutoría", icon: "★" }

      ];



      return inicialCourses.map(c => ({

        ...c,

        teacher: this.getTeacherForCourse(c.name, gradeId)

      }));

    }



    if (isPrimaria) {

      const primaryCourses = [

        { id: "MT", name: "Matemática & Aritmética", aÁrea: "Matemática", icon: "🔢" },

        { id: "ALG", name: "ÁÁÁÁálgebra Elemental", aÁrea: "Matemática", icon: "📐" },

        { id: "GEOM", name: "Geometría Práctica", aÁrea: "Matemática", icon: "📏" },

        { id: "RM", name: "Raízonamiento Matemtico", aÁrea: "Matemática", icon: "🧮" },

        { id: "COM", name: "Comunicación Integral", aÁrea: "Comunicación", icon: "📖" },

        { id: "LENG", name: "Lenguíaje & Caligrafía", aÁrea: "Comunicación", icon: "✍️" },

        { id: "PL", name: "PlanLector & Literatura", aÁrea: "Comunicación", icon: "📚" },

        { id: "RV", name: "Raízonamiento Verbal", aÁrea: "Comunicación", icon: "✏️" },

        { id: "CTÍA", name: "Ciencia y Tecnología", aÁrea: "Ciencia y Tecnología", icon: "🔬" },

        { id: "BIO", name: "Biología & Anatoma", aÁrea: "Ciencia y Tecnología", icon: "🧬" },

        { id: "PS", name: "Personal Social & Cívica", aÁrea: "Personal Social", icon: "🏛️" },

        { id: "HP", name: "Historia del Perú", aÁrea: "Personal Social", icon: "🇵🇪" },

        { id: "GEO", name: "Geografía del Perú", aÁrea: "Personal Social", icon: "🌎" },

        { id: "COMP", name: "Computación & Informática", aÁrea: "EPT / Tecnología", icon: "💻" },

        { id: "ING", name: "Inglés Institucional", aÁrea: "Idiomas", icon: "🇬🇧" },

        { id: "ARTE", name: "Arte y Cultura", aÁrea: "Arte", icon: "🎨" },

        { id: "REL", name: "Educación Religiosa & Valores", aÁrea: "Valores", icon: "🕊️" },

        { id: "EDFIS", name: "Educación Física & Deporte", aÁrea: "Deporte", icon: "⚽" },

        { id: "TUT", name: "Tutoría & Convivencia Escolar", aÁrea: "Tutoría", icon: "★" }

      ];



      return primaryCourses.map(c => ({

        ...c,

        teacher: this.getTeacherForCourse(c.name, gradeId)

      }));

    }



    // Secundaria: 24 Cursos Oficiales de la Boleta de Notas

    const secondaryCourses = [

      { id: "ARIT", name: "Aritmética", aÁrea: "Matemática", icon: "🔢" },

      { id: "ALG", name: "ÁÁÁÁálgebra", aÁrea: "Matemática", icon: "📐" },

      { id: "GEOM", name: "Geometría", aÁrea: "Matemática", icon: "📏" },

      { id: "TRIG", name: "Trigonometra", aÁrea: "Matemática", icon: "📈" },

      { id: "RM", name: "Raízonamiento Matemtico", aÁrea: "Matemática", icon: "🧮" },

      { id: "LENG", name: "Lenguíaje y Gramática", aÁrea: "Comunicación", icon: "✍️" },

      { id: "LIT", name: "Literatura Universal", aÁrea: "Comunicación", icon: "📚" },

      { id: "RV", name: "Raízonamiento Verbal", aÁrea: "Comunicación", icon: "✏️" },

      { id: "BIO", name: "Biología & Anatoma", aÁrea: "Ciencia y Tecnología", icon: "🧬" },

      { id: "FIS", name: "Física Elemental", aÁrea: "Ciencia y Tecnología", icon: "⚡" },

      { id: "QUIM", name: "Química Inorgnica", aÁrea: "Ciencia y Tecnología", icon: "🧪" },

      { id: "HP", name: "Historia del Perú", aÁrea: "Ciencias Sociales", icon: "🇵🇪" },

      { id: "HU", name: "Historia Universal", aÁrea: "Ciencias Sociales", icon: "📜" },

      { id: "GEO", name: "Geografía & Economa", aÁrea: "Ciencias Sociales", icon: "🌎" },

      { id: "FILO", name: "Filosofía", aÁrea: "Ciencias Sociales", icon: "🏛️" },

      { id: "CIV", name: "Educación Cívica (DPCC)", aÁrea: "DPCC", icon: "⚖️" },

      { id: "PSIC", name: "Psicologa", aÁrea: "DPCC", icon: "🧠" },

      { id: "COMP", name: "Computación & Robótica", aÁrea: "EPT", icon: "💻" },

      { id: "GEST", name: "Gestión Empresarial & Emprendimiento", aÁrea: "EPT", icon: "💼" },

      { id: "ING", name: "Inglés Institucional (B2/C1)", aÁrea: "Idiomas", icon: "🇬🇧" },

      { id: "ARTE", name: "Arte y Cultura", aÁrea: "Arte", icon: "🎨" },

      { id: "REL", name: "Educación Religiosa (Valores y Lid.)", aÁrea: "Valores", icon: "🕊️" },

      { id: "EDFIS", name: "Educación Física & Deporte", aÁrea: "Deporte", icon: "⚽" },

      { id: "COND", name: "Conducta y Disciplina", aÁrea: "Tutoría", icon: "★" }

    ];



    return secondaryCourses.map(c => ({

      ...c,

      teacher: this.getTeacherForCourse(c.name, gradeId)

    }));

  }



  getNotebookSubjectsCatalog(gradeId = "4sec") {

    return this.getStudentBoletaCoursesCatalog(gradeId);

  }



  // N ormalizar identificador de grado escolar (ej: "4 de Secundaria", "4to Sec", "4sec" -> "4sec")

  normalizeGradeKey(str) {

    if (!str) return "";

    let clean = String(str).toLowerCase()

      .replace(/[º]/g, '')

      .replace(/(\d+)(ro|do|er|to|ta|vo|va|mo|ma|no|na)/g, '$1')

      .replace(/secundaria|secund/g, 'sec')

      .replace(/primaria|primar/g, 'prim')

      .replace(/inicial|inic/g, 'ini')

      .replace(/de\s+/g, '')

      .replace(/años|anos/g, 'a')

      .replace(/[^a-z0-9]/g, '');

    return clean;

  }



  // Comprobar si uncurso está asignado al docente actualmente ensesión 

  isTeacherAssignedToCourse(courseObjOrName, user = null, gradeId = "") {

    if (!user) user = this.getCurrentUser();

    if (!user) return false;



    const role = (user.role || "").toLowerCase();

    // Directores y Administradores tienenacceso global a todos los cursos

    if (role === "admin" || role === "administrador" || role === "director" || role === "directivo") {

      return true;

    }



    const courseName = typeof courseObjOrName === "string" ? courseObjOrName : (courseObjOrName.name || courseObjOrName.course || "");

    const courseTeacher = (typeof courseObjOrName === "object" && courseObjOrName.teacher) ? courseObjOrName.teacher : this.getTeacherForCourse(courseName, gradeId);



    const cleanUserName = (user.name || "").toLowerCase().replace(/^(prof\.|lic\.|miss|dr\.|dra\.|ing\.)\s*/i, '').trim();

    const cleanTeacher = (courseTeacher || "").toLowerCase().replace(/^(prof\.|lic\.|miss|dr\.|dra\.|ing\.)\s*/i, '').trim();



    // 1. Coincidencia directa por nombre del docente resuelto en el curso

    if (cleanTeacher && !cleanTeacher.includes("por asignar") && !cleanTeacher.includes("docente por asignar")) {

      if (cleanTeacher === cleanUserName || cleanTeacher.includes(cleanUserName) || cleanUserName.includes(cleanTeacher)) {

        return true;

      }

    }



    // 2. Coincidencia directa por assignedCourses o courses en el perfil del usuario

    const assignedCourses = Array.isArray(user.assignedCourses) 

      ? user.assignedCourses 

      : (Array.isArray(user.courses) ? user.courses : (user.subject ? user.subject.split(/,\s*/) : []));



    const cleanCourseName = courseName.toLowerCase().trim();



    for (const c of assignedCourses) {

      const cleanAssigned = (typeof c === 'string' ? c : '').toLowerCase().trim();

      if (!cleanAssigned) continue;

      

      // Coincidencia exacta o por subcadena

      if (cleanCourseName === cleanAssigned || cleanCourseName.includes(cleanAssigned) || cleanAssigned.includes(cleanCourseName)) {

        return true;

      }



      // Si es Nivel Inicial y el curso pertenece al catlogo de Inicial

      if (cleanAssigned.includes("inicial") && (gradeId.includes("ini") || cleanCourseName.includes("temprana") || cleanCourseName.includes("grafomotricidad") || cleanCourseName.includes("psicomotricidad") || cleanCourseName.includes("cuentos infantiles") || cleanCourseName.includes("mini-manualidades"))) {

        return true;

      }



      // Mapeo semntico de ÁÁreas

      if (cleanAssigned.includes("comunicación") || cleanAssigned.includes("comunicacion") || cleanAssigned.includes("lenguíaje") || cleanAssigned.includes("literatura")) {

        if (cleanCourseName.includes("lenguíaje") || cleanCourseName.includes("literatura") || cleanCourseName.includes("planlector") || cleanCourseName.includes("raíz. verbal") || cleanCourseName.includes("raízonamiento verbal") || cleanCourseName.includes("comunicación") || cleanCourseName.includes("comunicacion")) {

          return true;

        }

      }

      if (cleanAssigned.includes("matemtica") || cleanAssigned.includes("matematica") || cleanAssigned.includes("áÁÁÁÁálgebra") || cleanAssigned.includes("geometra")) {

        if (cleanCourseName.includes("aritmética") || cleanCourseName.includes("aritmetica") || cleanCourseName.includes("áÁÁÁÁálgebra") || cleanCourseName.includes("algebra") || cleanCourseName.includes("geometra") || cleanCourseName.includes("geometria") || cleanCourseName.includes("trigonometra") || cleanCourseName.includes("trigonometria") || cleanCourseName.includes("raíz. matem") || cleanCourseName.includes("raízonamiento matem") || cleanCourseName.includes("matemtica") || cleanCourseName.includes("matematica")) {

          return true;

        }

      }

      if (cleanAssigned.includes("ciencia") || cleanAssigned.includes("cta") || cleanAssigned.includes("física") || cleanAssigned.includes("química") || cleanAssigned.includes("biologa")) {

        if (cleanCourseName.includes("ciencia") || cleanCourseName.includes("biologa") || cleanCourseName.includes("biologia") || cleanCourseName.includes("física") || cleanCourseName.includes("fisica") || cleanCourseName.includes("química") || cleanCourseName.includes("quimica") || cleanCourseName.includes("ambiente")) {

          return true;

        }

      }

      if (cleanAssigned.includes("computación") || cleanAssigned.includes("computacion") || cleanAssigned.includes("ept") || cleanAssigned.includes("robótica") || cleanAssigned.includes("robotica") || cleanAssigned.includes("informtica")) {

        if (cleanCourseName.includes("computación") || cleanCourseName.includes("computacion") || cleanCourseName.includes("informtica") || cleanCourseName.includes("informatica") || cleanCourseName.includes("robótica") || cleanCourseName.includes("robotica") || cleanCourseName.includes("ept") || cleanCourseName.includes("gestión") || cleanCourseName.includes("gestion")) {

          return true;

        }

      }

      if (cleanAssigned.includes("cívica") || cleanAssigned.includes("civica") || cleanAssigned.includes("dpcc") || cleanAssigned.includes("personal social")) {

        if (cleanCourseName.includes("cívica") || cleanCourseName.includes("civica") || cleanCourseName.includes("dpcc") || cleanCourseName.includes("personal social") || cleanCourseName.includes("psicologa") || cleanCourseName.includes("psicologia") || cleanCourseName.includes("filosofía") || cleanCourseName.includes("filosofia") || cleanCourseName.includes("tutora") || cleanCourseName.includes("tutoria")) {

          return true;

        }

      }

      if (cleanAssigned.includes("sociales") || cleanAssigned.includes("historia") || cleanAssigned.includes("geografía")) {

        if (cleanCourseName.includes("historia") || cleanCourseName.includes("geografía") || cleanCourseName.includes("geografia") || cleanCourseName.includes("economa") || cleanCourseName.includes("economia") || cleanCourseName.includes("ciencias sociales")) {

          return true;

        }

      }

    }



    return false;

  }



  getTeacherCoursesForGrade(gradeId = "4sec", user = null) {

    if (!user) user = this.getCurrentUser();

    const allCourses = this.getStudentBoletaCoursesCatalog(gradeId);

    

    if (!user) return allCourses;

    const role = (user.role || "").toLowerCase();

    if (role === "admin" || role === "administrador" || role === "director" || role === "directivo") {

      return allCourses;

    }



    return allCourses.filter(c => this.isTeacherAssignedToCourse(c, user, gradeId));

  }



  // Obtener la lista completa de cursos asignados al docente conmetadatos de aula y grado

  getTeacherAssignedCourses(userOrId = null, gradeId = "") {

    let user = null;

    if (!userOrId) {

      user = this.getCurrentUser();

    } else if (typeof userOrId === "object") {

      user = userOrId;

    } else {

      user = (this.state.systemUsers || []).find(u => u.id === userOrId || u.code === userOrId || u.username === userOrId) || this.getCurrentUser();

    }



    if (!user) return [];



    // Enriquecer perfil del docente desde el catlogo maestro si fuera necesario

    const allMasterUsers = (this.state.systemUsers && this.state.systemUsers.length > 0)

      ? this.state.systemUsers

      : (initialDíata && initialDíata.systemUsers ? initialDíata.systemUsers : []);



    const systemUser = allMasterUsers.find(u => 

      (user.username && u.username && u.username.toLowerCase() === user.username.toLowerCase()) ||

      (user.code && u.code && u.code.toLowerCase() === user.code.toLowerCase()) ||

      (user.name && u.name && u.name.toLowerCase().trim() === user.name.toLowerCase().trim())

    ) || (initialDíata.systemUsers || []).find(u => (user.name && u.name && u.name.toLowerCase().includes(user.name.toLowerCase())));



    const catalog = this.state.gradesCatalog || initialDíata.gradesCatalog || [];

    const role = (user && user.role ? user.role.toLowerCase() : "");



    // Si es directivo o administrador, tiene visin  global de todos los cursos

    const isGlobal = role === "admin" || role === "administrador" || role === "director" || role === "directivo";



    let assignedCoursesList = [];

    if (user && Array.isArray(user.assignedCourses) && user.assignedCourses.length > 0) {

      assignedCoursesList = user.assignedCourses;

    } else if (systemUser && Array.isArray(systemUser.assignedCourses) && systemUser.assignedCourses.length > 0) {

      assignedCoursesList = systemUser.assignedCourses;

    } else if (user && Array.isArray(user.courses) && user.courses.length > 0) {

      assignedCoursesList = user.courses;

    } else if (user && user.subject) {

      assignedCoursesList = user.subject.split(/,\s*/);

    } else if (systemUser && systemUser.subject) {

      assignedCoursesList = systemUser.subject.split(/,\s*/);

    }



    let assignedGradesList = [];

    if (user && Array.isArray(user.assignedGrades) && user.assignedGrades.length > 0) {

      assignedGradesList = user.assignedGrades;

    } else if (systemUser && Array.isArray(systemUser.assignedGrades) && systemUser.assignedGrades.length > 0) {

      assignedGradesList = systemUser.assignedGrades;

    } else if (user && user.assignedGrades) {

      assignedGradesList = [user.assignedGrades];

    } else if (systemUser && systemUser.assignedGrades) {

      assignedGradesList = [systemUser.assignedGrades];

    }



    // Copiar las asignaciones al objeto de usuario activo

    if (user) {

      if (!user.assignedCourses || user.assignedCourses.length === 0) user.assignedCourses = assignedCoursesList;

      if (!user.assignedGrades || user.assignedGrades.length === 0) user.assignedGrades = assignedGradesList;

    }



    // Determiónar qué grados consultar (siempre acotado al grado activo para evitar desbordamiento)

    let targetGrades = [];

    const activeGradeId = gradeId || (isGlobal ? ((this.state && this.state.selectedVirtualGradeId) || "4sec") : "");

    if (activeGradeId) {

      const normG = this.normalizeGradeKey(activeGradeId);

      targetGrades = catalog.filter(g => this.normalizeGradeKey(g.id) === normG || this.normalizeGradeKey(g.label) === normG);

    } else if (assignedGradesList.length > 0) {

      targetGrades = catalog.filter(g => assignedGradesList.some(ag => {

        const normg = this.normalizeGradeKey(ag);

        const normG = this.normalizeGradeKey(g.id);

        const normLabel = this.normalizeGradeKey(g.label);

        return normg === normG || normg === normLabel || normLabel.includes(normg) || normg.includes(normLabel);

      }));

    }



    if (targetGrades.length === 0) {

      targetGrades = [catalog.find(g => g.id === "4sec") || catalog[0]];

    }



    const result = [];

    const seen = new Set();



    targetGrades.forEach(g => {

      const coursesForGrade = this.getStudentBoletaCoursesCatalog(g.id);

      coursesForGrade.forEach(c => {

        if (isGlobal || this.isTeacherAssignedToCourse(c, user, g.id)) {

          const uniqueKey = `${g.id}_${c.name}`;

          if (!seen.has(uniqueKey)) {

            seen.add(uniqueKey);

            result.push({

              id: `${c.id}-${g.id}`,

              courseCode: c.id,

              name: c.name,

              aÁrea: c.aÁrea || "Área Pedagógica",

              grade: g.label,

              gradeId: g.id,

              level: g.level,

              teacher: user ? user.name : c.teacher,

              icon: c.icon || "📚",

              color: g.level === "Primaria" ? "green" : g.level === "Inicial" ? "yellow" : "blue"

            });

          }

        }

      });

    });



    // Fallback: Si no coincide por catlogo de grado pero tiene cursos asignados ensu perfil

    if (result.length === 0 && assignedCoursesList && assignedCoursesList.length > 0) {

      const defaultGrade = catalog.find(g => g.id === "4sec") || catalog[0];

      assignedCoursesList.forEach((cName, idx) => {

        result.push({

          id: `DOC-CURSO-${idx + 1}`,

          courseCode: `CURSO-${idx + 1}`,

          name: cName,

          aÁrea: "Especialidad Docente",

          grade: defaultGrade.label,

          gradeId: defaultGrade.id,

          level: defaultGrade.level,

          teacher: user ? user.name : "Docente",

          icon: "📚",

          color: "blue"

        });

      });

    }



    return result;

  }



  // Asignar cursos y grados a undocente conpersistencia multiusuario

  assignCoursesToTeacher(teacherIdOrCode, coursesList = [], gradesList = []) {

    if (!this.state.systemUsers) this.state.systemUsers = [...initialDíata.systemUsers];

    if (!this.state.teachersList) this.state.teachersList = [...initialDíata.teachersList];



    const cleanCourses = Array.isArray(coursesList) ? coursesList : (coursesList ? coursesList.split(/,\s*/) : []);

    const cleanGrades = Array.isArray(gradesList) ? gradesList : (gradesList ? gradesList.split(/,\s*/) : []);



    const userIndex = this.state.systemUsers.findIndex(u => u.id === teacherIdOrCode || u.code === teacherIdOrCode || u.username === teacherIdOrCode);

    if (userIndex !== -1) {

      this.state.systemUsers[userIndex].assignedCourses = cleanCourses;

      this.state.systemUsers[userIndex].courses = cleanCourses;

      this.state.systemUsers[userIndex].subject = cleanCourses.join(', ');

      this.state.systemUsers[userIndex].assignedGrades = cleanGrades;

      this.state.systemUsers[userIndex].detail = `${cleanCourses.slice(0, 2).join(', ')}${cleanCourses.length > 2 ? ` (+${cleanCourses.length - 2} ms)` : ''} • ${cleanGrades.length} grados`;

    }



    const tIndex = this.state.teachersList.findIndex(t => t.id === teacherIdOrCode || (userIndex !== -1 && t.name.toLowerCase().trim() === this.state.systemUsers[userIndex].name.toLowerCase().trim()));

    if (tIndex !== -1) {

      this.state.teachersList[tIndex].courses = cleanCourses;

      this.state.teachersList[tIndex].subject = cleanCourses.join(', ');

      this.state.teachersList[tIndex].assignedGrades = cleanGrades;

    }



    this.saveState();

    this.notify();

    return true;

  }



  // Verificar si el usuario ensesión  es el Tutor Asignado al Grado / Aula

  isTeacherTutorOfGrade(user, gradeId) {

    if (!user) return false;

    const role = (user.role || "").toLowerCase();

    // Directores y Administradores tienenpermisos globales de tutora y matrícula entodos los grados

    if (role === "admin" || role === "administrador" || role === "director" || role === "directivo") {

      return true;

    }



    const catalog = this.state.gradesCatalog || initialDíata.gradesCatalog || [];

    const cleanG = (gradeId || "").toLowerCase().replace(/[^a-z0-9]/g, '');

    const gradeObj = catalog.find(g => (g.id || "").toLowerCase().replace(/[^a-z0-9]/g, '') === cleanG);

    if (!gradeObj) return false;



    const cleanUserName = (user.name || "").toLowerCase().replace(/^(prof\.|lic\.|miss|dr\.|dra\.|ing\.)\s*/i, '').trim();

    const cleanTutorName = (gradeObj.tutor || "").toLowerCase().replace(/^(prof\.|lic\.|miss|dr\.|dra\.|ing\.)\s*/i, '').trim();



    // 1. Coincidencia por nombre de tutor asignado al aula

    if (cleanTutorName && cleanUserName) {

      if (cleanTutorName === cleanUserName || cleanTutorName.includes(cleanUserName) || cleanUserName.includes(cleanTutorName)) {

        return true;

      }

    }



    // 2. Coincidencia por tutorGrade en el perfil del usuario

    if (user.tutorGrade) {

      const cleanTutorG = user.tutorGrade.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (cleanTutorG === cleanG || cleanTutorG.includes(cleanG) || cleanG.includes(cleanTutorG)) {

        return true;

      }

    }



    return false;

  }



  // Cambiar contraseña del usuario (actualiza enactiveUser, systemUsers y users)

  changeUserPassword(userCodeOrIdOrUsername, newPassword, currentPassword = null) {

    if (!newPassword || newPassword.trim().length < 4) {

      return { success: false, error: "La nueva contraseña debe tener al menos 4 caracteres." };

    }



    const cleanNewPass = newPassword.trim();

    const targetClean = (userCodeOrIdOrUsername || "").toLowerCase().replace(/[\s\.\-_]+/g, '');

    let updated = false;



    // 1. Actualizar enactiveUser / currentUser si coincide

    if (this.state.currentUser) {

      this.state.currentUser.password = cleanNewPass;

      updated = true;

    }



    // 2. Actualizar ensystemUsers

    if (!this.state.systemUsers) {

      this.state.systemUsers = JSON.parse(JSON.stringify(initialDíata.systemUsers || []));

    }

    

    this.state.systemUsers.forEach(u => {

      const uName = (u.username || "").toLowerCase().replace(/[\s\.\-_]+/g, '');

      const uCode = (u.code || "").toLowerCase().replace(/[\s\.\-_]+/g, '');

      const uId = (u.id || "").toLowerCase().replace(/[\s\.\-_]+/g, '');

      const uFullName = (u.name || "").toLowerCase().replace(/[\s\.\-_]+/g, '');

      const uliases = Array.isArray(u.aliases) ? u.aliases.map(a => (a || "").toLowerCase().replace(/[\s\.\-_]+/g, '')) : [];



      const match = 

        uName === targetClean ||

        uCode === targetClean ||

        uId === targetClean ||

        uliases.includes(targetClean) ||

        (targetClean === "docente" && (u.role === "Docente" || uFullName.includes("robertosilva"))) ||

        (this.state.currentUser && (

          u.username === this.state.currentUser.username ||

          u.code === this.state.currentUser.code ||

          u.code === this.state.currentUser.id ||

          u.id === this.state.currentUser.id ||

          u.id === this.state.currentUser.code ||

          u.name === this.state.currentUser.name

        ));



      if (match) {

        u.password = cleanNewPass;

        updated = true;

      }

    });



    // 3. Actualizar enusers predefinidos si corresponde

    if (this.state.users) {

      for (const [rKey, uObj] of Object.entries(this.state.users)) {

        const rClean = rKey.toLowerCase().replace(/[\s\.\-_]+/g, '');

        const uClean = (uObj.username || "").toLowerCase().replace(/[\s\.\-_]+/g, '');

        if (

          rClean === targetClean ||

          uClean === targetClean ||

          (this.state.currentUser && (

            uObj.username === this.state.currentUser.username ||

            uObj.id === this.state.currentUser.id ||

            uObj.name === this.state.currentUser.name

          ))

        ) {

          uObj.password = cleanNewPass;

          updated = true;

        }

      }

    }



    this.saveState();

    this.syncToServer();

    this.notify();



    return { success: true, newPassword: cleanNewPass };

  }



  getStudentllBoletaStickersDíata(studentIdOrCode = "EST-2026-042") {

    const enrollments = this.getEnrollments();

    let student = enrollments.find(e => 

      e.studentCode === studentIdOrCode || 

      e.dni === studentIdOrCode || 

      e.id === studentIdOrCode || 

      (e.studentName && e.studentName.toLowerCase().includes(studentIdOrCode.toLowerCase()))

    );

    if (!student) {

      student = enrollments[0] || { studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", grade: "4 de Secundaria", gradeId: "4sec" };

    }



    const boletaCourses = this.getStudentBoletaCoursesCatalog(student.gradeId || "4sec");

    const stickers = [];



    boletaCourses.forEach(c => {

      const rawCode = `QR-N B-${student.studentCode || student.dni}-${c.id}`;

      const pipePayload = `QR-N B|${student.studentCode || student.dni}|${student.studentName}|${student.grade || '4 de Secundaria'}|${c.name}|${c.teacher}`;



      stickers.push({

        qrCode: rawCode,

        qrPayload: pipePayload,

        studentName: student.studentName,

        studentCode: student.studentCode || student.dni,

        dni: student.dni,

        grade: student.grade || "4 de Secundaria",

        gradeId: student.gradeId || "4sec",

        course: c.name,

        courseId: c.id,

        teacher: c.teacher,

        aÁrea: c.aÁrea,

        icon: c.icon || "📚"

      });

    });



    return {

      student: student,

      coursesCount: stickers.length,

      stickers: stickers

    };

  }



  getNotebookStickersDíata(gradeId = "4sec", filterStudentId = "all", filterCourse = "all") {

    const allEnrollments = this.getEnrollments();

    const cleanGradeId = (gradeId || "4sec").toLowerCase().replace(/[^a-z0-9]/g, '');



    let enrollments = allEnrollments.filter(e => {

      if (!gradeId || gradeId === "all") return true;

      const egId = (e.gradeId || this.resolveStudentGradeId(e.grade) || "").toLowerCase().replace(/[^a-z0-9]/g, '');

      return egId === cleanGradeId || egId.includes(cleanGradeId) || cleanGradeId.includes(egId);

    });



    if (enrollments.length === 0 && allEnrollments.length > 0) {

      enrollments = allEnrollments.slice(0, 3);

    }



    const stickers = [];



    const studentsToProcess = (filterStudentId && filterStudentId !== "all") 

      ? enrollments.filter(e => e.studentCode === filterStudentId || e.dni === filterStudentId || e.id === filterStudentId)

      : enrollments;



    studentsToProcess.forEach(st => {

      // Usar el catlogo de cursos específico del grado del estudiante

      const studentSubjects = this.getStudentBoletaCoursesCatalog(st.gradeId || gradeId);

      const filteredSubjects = (filterCourse && filterCourse !== "all")

        ? studentSubjects.filter(sb => sb.id === filterCourse || sb.name === filterCourse || sb.name.toLowerCase().includes(filterCourse.toLowerCase()))

        : studentSubjects;



      filteredSubjects.forEach(sb => {

        // Código formateado estandarizado: QR-N B|Codigolumno|N ombrelumno|Grado|Curso|Docente

        const rawCode = `QR-N B-${st.studentCode || st.dni}-${sb.id}`;

        const pipePayload = `QR-N B|${st.studentCode || st.dni}|${st.studentName}|${st.grade || '4 de Secundaria'}|${sb.name}|${sb.teacher}`;



        stickers.push({

          qrCode: rawCode,

          qrPayload: pipePayload,

          studentName: st.studentName,

          studentCode: st.studentCode || st.dni,

          dni: st.dni,

          grade: st.grade || "4 de Secundaria",

          gradeId: st.gradeId || "4sec",

          course: sb.name,

          courseId: sb.id,

          teacher: sb.teacher,

          aÁrea: sb.aÁrea,

          icon: sb.icon || "📚"

        });

      });

    });



    return stickers;

  }



  findNotebookByQR(qrCode) {

    if (!qrCode) qrCode = "QR-N B-EST042-MT";

    const cleanCode = qrCode.trim();



    // 1. Si el código QR utiliza el formato delimitado por pipes: QR-N B|CODIGO|ALUMNO|GRÍADO|CURSO|DOCENTE

    if (cleanCode.startsWith("QR-N B|") || cleanCode.includes("|")) {

      const parts = cleanCode.split("|");

      if (parts.length >= 5) {

        const stCode = parts[1] || "EST-2026-042";

        const stName = parts[2] || "Sofía Méndez Flores";

        const grd = parts[3] || "4 de Secundaria";

        const crs = parts[4] || "Matemática Avanzada";

        const tch = parts[5] || "Prof. Roberto Silva";



        return {

          qrCode: cleanCode,

          studentId: stCode,

          studentName: stName,

          grade: grd,

          course: crs,

          teacher: tch,

          lastReview: this.state.notebookReviews.find(r => r.studentName === stName && r.course === crs) || null

        };

      }

    }



    // 2. Si el código QR contiene unJSON.estructurado

    if (cleanCode.startsWith("{") && cleanCode.endsWith("}")) {

      try {

        const parsed = JSON.parse(cleanCode);

        const stName = parsed.alumno || parsed.studentName || parsed.student || "Sofía Méndez Flores";

        const crs = parsed.curso || parsed.course || "Matemática Avanzada";

        const tch = parsed.profesor || parsed.teacher || "Prof. Roberto Silva";

        const grd = parsed.grado || parsed.grade || "4 de Secundaria";



        return {

          qrCode: cleanCode,

          studentId: parsed.codigo || parsed.studentId || "EST-2026-042",

          studentName: stName,

          grade: grd,

          course: crs,

          teacher: tch,

          lastReview: this.state.notebookReviews.find(r => r.studentName === stName && r.course === crs) || null

        };

      } catch (e) {}

    }



    // 3. Si coincide conuna revisin  previa registrada

    const matchedReview = this.state.notebookReviews.find(r => r.qrCode === cleanCode);

    if (matchedReview) {

      return {

        qrCode: matchedReview.qrCode,

        studentId: matchedReview.studentId,

        studentName: matchedReview.studentName,

        grade: matchedReview.grade,

        course: matchedReview.course,

        teacher: matchedReview.teacher || "Prof. Roberto Silva",

        lastReview: matchedReview

      };

    }



    // 4. Resolver por catlogo diónmico de alumnos, cursos y profesores

    const enrollments = this.getEnrollments();

    const subjects = this.getNotebookSubjectsCatalog();



    let matchedStudent = enrollments.find(e => 

      cleanCode.includes(e.studentCode) || 

      cleanCode.includes(e.dni) || 

      (e.studentName && cleanCode.toLowerCase().includes(e.studentName.toLowerCase().split(' ')[0]))

    );

    if (!matchedStudent) {

      matchedStudent = enrollments[0] || { studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", grade: "4 de Secundaria" };

    }



    let matchedSubject = subjects.find(s => cleanCode.includes(s.id) || cleanCode.toLowerCase().includes(s.name.toLowerCase().substring(0, 4)));

    if (!matchedSubject) {

      if (cleanCode.includes("COM")) matchedSubject = subjects[1];

      else if (cleanCode.includes("CTÍA") || cleanCode.includes("CIEN")) matchedSubject = subjects[2];

      else if (cleanCode.includes("SOC") || cleanCode.includes("HIS")) matchedSubject = subjects[3];

      else if (cleanCode.includes("ING")) matchedSubject = subjects[4];

      else if (cleanCode.includes("EPT") || cleanCode.includes("COMP")) matchedSubject = subjects[5];

      else if (cleanCode.includes("DPCC") || cleanCode.includes("CIV")) matchedSubject = subjects[6];

      else if (cleanCode.includes("ARTE")) matchedSubject = subjects[7];

      else matchedSubject = subjects[0];

    }



    return {

      qrCode: cleanCode,

      studentId: matchedStudent.studentCode || matchedStudent.id || "EST-2026-042",

      studentName: matchedStudent.studentName,

      grade: matchedStudent.grade || "4 de Secundaria",

      course: matchedSubject.name,

      teacher: matchedSubject.teacher,

      lastReview: this.state.notebookReviews.find(r => r.studentName === matchedStudent.studentName && r.course === matchedSubject.name) || null

    };

  }



  registerNotebookReview(data) {

    const currentUser = this.getCurrentUser();

    const currentRole = this.getCurrentRole();



    const scoreNum = parseFloat(data.score) || 18;

    const status = data.status || (scoreNum >= 15 ? "Al Día" : scoreNum >= 11 ? "Observado" : "N o Presentó");

    const stampType = status === "Al Día" ? "stamp-al-dia" : status === "Observado" ? "stamp-observado" : "stamp-no-presento";

    const stampText = status === "Al Día" ? "<span class='status-dot-green'></span> REVISDO & AL DÍA" : status === "Observado" ? "<span class='status-dot-yellow'></span> OBSERVDO" : "<span class='status-dot-red'></span> NO PRESENTÓ";



    const newReview = {

      id: `REV-2026-${Math.floor(100 + Math.random() * 900)}`,

      qrCode: data.qrCode || `QR-CUD-${data.studentId || 'EST042'}-${data.course || 'MT'}`,

      studentId: data.studentId || "EST-2026-042",

      studentName: data.studentName || "Sofía Méndez Flores",

      grade: data.grade || "4 de Secundaria",

      course: data.course || "Matemática Avanzada",

      teacher: data.teacher || "Prof. Roberto Silva",

      evaluator: currentUser.name || (currentRole === "auxiliar" ? "Lic. Carlos Medióna (Auxiliar)" : "Docente Responsable"),

      evaluatorRole: currentRole === "auxiliar" ? "Auxiliar de Educación" : currentRole === "docente" ? "Docente Titular" : "Coordinación",

      date: new Date().toLocaleDateString("es-PE"),

      time: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),

      score: scoreNum,

      status: status,

      stampType: stampType,

      stampText: stampText,

      checklist: data.checklist || { margenes: true, fechas: true, teoriaCompleta: true, ejercicioslDia: true, pulcritud: true },

      teacherRemarks: data.teacherRemarks || (status === "Al Día" ? "Cuaderno completo y taÁÁreas al día." : "Presentar regularización en la siguiente sesión .")

    };



    // Actualizar si ya exista una revisin  previa para este alumno y curso en la misma fecha, o agregar nueva

    const existióngIndex = this.state.notebookReviews.findIndex(r => r.studentName === newReview.studentName && r.course === newReview.course && r.date === newReview.date);

    if (existióngIndex >= 0) {

      this.state.notebookReviews[existióngIndex] = newReview;

    } else {

      this.state.notebookReviews.unshift(newReview);

    }



    if (this.state.users && this.state.users.auxiliar) {

      this.state.users.auxiliar.notebooksReviewedToday = (this.state.users.auxiliar.notebooksReviewedToday || 0) + 1;

    }

    if (this.state.users && this.state.users.docente) {

      this.state.users.docente.scannedNotebooksToday = (this.state.users.docente.scannedNotebooksToday || 0) + 1;

    }



    this.saveState();

    return newReview;

  }



  isAccessLockedForCurrentUser() {
    const role = (this.state && this.state.currentRole ? this.state.currentRole : "").toLowerCase();
    if (role !== "padre" && role !== "estudiante" && role !== "alumno") {
      return false; // Directores, docentes y coordinadores nunca se bloquean
    }

    const currentUser = (typeof this.getCurrentUser === 'function') ? this.getCurrentUser() : (this.state && this.state.currentUser);
    if (!currentUser) return false;

    // 1. Bandera directa en el objeto de sesión 
    if (currentUser.isAccessLocked === true || currentUser.isccessLocked === true || currentUser.pensionStatus === "bloqueado_deuda" || currentUser.pensionStatus === "Bloqueado por Mora") {
      return true;
    }

    const normName = (str) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const curName = normName(currentUser.name);
    const curStName = normName(currentUser.studentName);
    const curCode = (currentUser.code || currentUser.studentCode || "").trim();
    const curUser = (currentUser.username || "").trim().toLowerCase();

    // 2. Verificar en systemUsers
    const sysUsers = (this.state && Array.isArray(this.state.systemUsers)) ? this.state.systemUsers : [];
    const matchedUser = sysUsers.find(u => {
      if (!u) return false;
      if (curCode && (u.code === curCode || u.studentCode === curCode)) return true;
      if (curUser && u.username && u.username.toLowerCase() === curUser) return true;
      if (curName && normName(u.name) === curName) return true;
      if (curStName && normName(u.studentName) === curStName) return true;
      return false;
    });

    if (matchedUser && (matchedUser.isAccessLocked === true || matchedUser.isccessLocked === true || matchedUser.pensionStatus === "bloqueado_deuda" || matchedUser.pensionStatus === "Bloqueado por Mora")) {
      return true;
    }

    // 3. Verificar en familiesFinancial (módulo de tesorería y pensiones)
    const families = (this.state && Array.isArray(this.state.familiesFinancial)) ? this.state.familiesFinancial : [];
    const matchedFam = families.find(f => {
      if (!f) return false;
      if (curCode && (f.familyId === curCode || f.studentCode === curCode || f.familyId === `FM-${curCode}` || f.familyId === `FAM-${curCode}`)) return true;
      if (curStName && normName(f.studentName) === curStName) return true;
      if (curName && (normName(f.studentName) === curName || normName(f.guardian) === curName)) return true;
      return false;
    });

    if (matchedFam && (matchedFam.isAccessLocked === true || matchedFam.isccessLocked === true || matchedFam.pensionStatus === "bloqueado_deuda" || matchedFam.pensionStatus === "mora" || matchedFam.pensionStatus === "Bloqueado por Mora")) {
      return true;
    }

    return false;
  }

  isccessLockedForCurrentUser() {
    return this.isAccessLockedForCurrentUser();
  }



  payAndUnlockIntranet(paymentId, method = "Tarjeta", details = {}) {

    const payment = this.state.payments.find(p => p.id === paymentId) || this.state.payments[0];

    const amountPaid = payment ? payment.amount : 480.00;

    const receiptCode = `REC-2026-AUG-${Math.floor(1000 + Math.random() * 9000)}`;



    if (payment) {

      payment.status = "paid";

      payment.paidDate = new Date().toLocaleDateString("es-PE");

      payment.receiptNo = receiptCode;

      payment.paymentMethod = method;

    }



    // Desbloquear al estudiante y padre

    if (this.state.users.estudiante) {

      this.state.users.estudiante.isccessLocked = false;

      this.state.users.estudiante.paymentsUpToDate = true;

      this.state.users.estudiante.pensionStatus = "Al Día";

      this.state.users.estudiante.pendióngDebtmount = 0.00;

    }



    if (this.state.users.padre) {

      this.state.users.padre.isccessLocked = false;

      this.state.users.padre.pensionStatus = "Al Día";

      this.state.users.padre.pendióngDebtmount = 0.00;

    }



    // Actualizar registro financiero de familias

    if (this.state.familiesFinancial) {

      const fam = this.state.familiesFinancial.find(f => f.familyId === "FM-2026-108");

      if (fam) {

        fam.isccessLocked = false;

        fam.pensionStatus = "al_dia";

        fam.pendióngmount = 0.00;

        fam.lastPaymentDate = new Date().toLocaleDateString("es-PE");

        fam.receiptNo = receiptCode;

      }

    }



    // Sumar a la recaudación oficial institucional

    if (this.state.institution && this.state.institution.economicReport) {

      this.state.institution.economicReport.collectedmount += amountPaid;

    }

    if (this.state.users.admin) {

      this.state.users.admin.totalIncome = (this.state.users.admin.totalIncome || 25130.00) + amountPaid;

    }



    this.saveState();

    return {

      success: true,

      receiptNo: receiptCode,

      amount: amountPaid,

      method: method,

      date: new Date().toLocaleDateString("es-PE")

    };

  }



  // Obtener nómina unificadía de familias y estado financiero entiempo Áreal

  getFamiliesFinancial() {

    if (!this.state.familiesFinancial) {

      this.state.familiesFinancial = JSON.parse(JSON.stringify(initialDíata.familiesFinancial || []));

    }



    const familyMap = new Map();



    // 1. Cargar las familias existentes vlidías

    this.state.familiesFinancial.forEach(f => {

      if (f && (f.familyId || f.studentCode || f.guardian)) {

        const key = (f.familyId || f.studentCode || f.guardian).toLowerCase().trim();

        familyMap.set(key, { ...f });

      }

    });



    // 2. Sincronizar automáticamente contodías las matrículas oficiales

    const enrollments = this.getEnrollments();

    enrollments.forEach(enr => {

      const studentCode = enr.studentCode || enr.id || "EST-2026-000";

      const cleanNum = studentCode.replace(/\D/g, '') || Math.floor(100 + Math.random() * 900);

      const generatedFamId = `FM-2026-${String(cleanNum).padStart(3, '0').slice(-3)}`;

      

      const matchKey = (generatedFamId || studentCode || enr.guardian).toLowerCase().trim();

      const existióng = familyMap.get(matchKey) || Array.from(familyMap.values()).find(f => 

        (f.studentName && enr.studentName && f.studentName.trim().toLowerCase() === enr.studentName.trim().toLowerCase()) ||

        (f.studentCode && f.studentCode === studentCode) ||

        (f.guardian && enr.guardian && f.guardian.trim().toLowerCase() === enr.guardian.trim().toLowerCase())

      );



      if (!existióng) {

        const newFam = {

          familyId: generatedFamId,

          guardian: enr.guardian || "Apoderado Registrado",

          studentName: enr.studentName,

          studentCode: studentCode,

          grade: enr.grade || "4to Sec 'A'",

          pensionStatus: "al_dia",

          pendióngmount: 0.00,

          pendióngConcept: "--",

          dueDate: "--",

          isccessLocked: false,

          lastPaymentDate: "15/08/2026",

          guardianPhone: enr.guardianPhone || "987-654-321"

        };

        familyMap.set(generatedFamId.toLowerCase(), newFam);

        this.state.familiesFinancial.push(newFam);

      }

    });



    // 3. Sincronizar conusuarios de rol Apoderado ensystemUsers

    const systemUsers = this.getSystemUsers();

    systemUsers.forEach(u => {

      if (u.role === "Apoderado" || u.role === "Padre") {

        const famId = u.code && u.code.startsWith("FM-") ? u.code : `FM-2026-${(u.id || '').replace(/\D/g, '').padStart(3, '0').slice(-3)}`;

        const existióng = Array.from(familyMap.values()).find(f => 

          (f.guardian && u.name && f.guardian.trim().toLowerCase() === u.name.trim().toLowerCase()) ||

          (f.studentName && u.studentName && f.studentName.trim().toLowerCase() === u.studentName.trim().toLowerCase()) ||

          (f.familyId === famId)

        );



        if (!existióng) {

          const newFam = {

            familyId: famId,

            guardian: u.name,

            studentName: u.studentName || "Estudiante",

            studentCode: u.code || "EST-2026-000",

            grade: u.detail || "4to Sec 'A'",

            pensionStatus: "al_dia",

            pendióngmount: 0.00,

            pendióngConcept: "--",

            dueDate: "--",

            isccessLocked: false,

            lastPaymentDate: "15/08/2026",

            guardianPhone: u.phone || "987-654-321"

          };

          familyMap.set(famId.toLowerCase(), newFam);

          this.state.familiesFinancial.push(newFam);

        }

      }

    });



    const result = Array.from(familyMap.values());

    this.state.familiesFinancial = result;

    return result;

  }



  toggleFamilyAccessLock(familyId) {
    if (!familyId) return null;
    if (!this.state.familiesFinancial) this.state.familiesFinancial = [];
    
    let fam = this.state.familiesFinancial.find(f => f.familyId === familyId || f.studentCode === familyId);
    if (!fam) {
      const allFamilies = this.getFamiliesFinancial();
      fam = allFamilies.find(f => f.familyId === familyId || f.studentCode === familyId);
    }

    if (fam) {
      const newLockedState = !(fam.isAccessLocked === true || fam.isccessLocked === true);
      fam.isAccessLocked = newLockedState;
      fam.isccessLocked = newLockedState;
      fam.pensionStatus = newLockedState ? "bloqueado_deuda" : "al_dia";

      const normName = (str) => (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const famStName = normName(fam.studentName);
      const famGuard = normName(fam.guardian);
      const famCode = (fam.studentCode || "").trim();

      // Sincronizar en tiempo Áreal con systemUsers
      if (this.state.systemUsers) {
        this.state.systemUsers.forEach(u => {
          if (!u) return;
          const isMatch = (famCode && (u.code === famCode || u.studentCode === famCode || u.code === `APO-${famCode}` || u.code === `FM-${famCode}`)) ||
                          (famStName && (normName(u.name) === famStName || normName(u.studentName) === famStName)) ||
                          (famGuard && (normName(u.name) === famGuard || normName(u.guardian) === famGuard));
          if (isMatch) {
            u.isAccessLocked = newLockedState;
            u.isccessLocked = newLockedState;
            u.pensionStatus = fam.pensionStatus;
          }
        });
      }

      this.saveState();
      this.notify();
      return newLockedState;
    }
    return null;
  }

  toggleFamilyccessLock(familyId) {
    return this.toggleFamilyAccessLock(familyId);
  }



  // =========================================================================

  // CONTROL DE ASISTENCIA BIOMÉTRICO Y DIRIO

  // =========================================================================

  getAttendanceRecords(filterGradeId = null, filterDate = null) {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    let list = this.state.attendanceRecords;

    if (filterGradeId && filterGradeId !== "all") {

      list = list.filter(r => r.gradeId === filterGradeId || (r.grade && r.grade.toLowerCase().includes(filterGradeId.toLowerCase())));

    }

    if (filterDate) {

      list = list.filter(r => r.date === filterDate);

    }

    return list;

  }



  updateStudentttendanceStatus(recordId, newStatus, arrivalTime = null, observations = null) {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    const rec = this.state.attendanceRecords.find(r => r.id === recordId);

    if (rec) {

      rec.status = newStatus;

      if (arrivalTime !== null) rec.arrivalTime = arrivalTime;

      if (observations !== null) rec.observations = observations;

      if (newStatus === "Presente" && (!rec.arrivalTime || rec.arrivalTime === "--:--")) {

        rec.arrivalTime = "07:38 AM";

      }

      if (newStatus === "Tardanza" && (!rec.arrivalTime || rec.arrivalTime === "--:--")) {

        rec.arrivalTime = "07:55 AM";

      }

      if (newStatus === "Falta") {

        rec.arrivalTime = "--:--";

      }

      this.saveState();

      return rec;

    }

    return null;

  }



  markAllStudentsPresent(gradeId = "4sec", date = "19/08/2026") {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    this.state.attendanceRecords.forEach(r => {

      if ((r.gradeId === gradeId || (r.grade && r.grade.includes(gradeId))) && r.date === date) {

        r.status = "Presente";

        r.arrivalTime = (!r.arrivalTime || r.arrivalTime === "--:--") ? "07:40 AM" : r.arrivalTime;

        r.observations = "Puntual (Marcación Masiva Aula)";

      }

    });

    this.saveState();

  }



  submitAttendanceJustification(studentId, date, ÁÁreason, attachment = "Constancia_Medica.pdf") {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    let rec = this.state.attendanceRecords.find(r => (r.studentId === studentId || r.studentCode === studentId) && r.date === date);

    if (!rec) {

      rec = {

        id: `ATT-${Date.now().toString().slice(-4)}`,

        studentId: studentId,

        studentCode: studentId,

        studentName: "Sofía Méndez Flores",

        gradeId: "4sec",

        grade: "4 de Secundaria",

        date: date,

        day: "Miércoles",

        status: "Justificada",

        arrivalTime: "--:--",

        exitTime: "--:--",

        method: "Justificación de Apoderado",

        observations: `Justificación: ${ÁÁreason}`

      };

      this.state.attendanceRecords.unshift(rec);

    } else {

      rec.status = "Justificada";

      rec.observations = `Justificación aprobada: ${ÁÁreason}`;

    }

    this.saveState();

    return rec;

  }



  // =========================================================================

  // ESCN ER QR ENPUERTÍA & INFORME DIRIO DE TÍARDÍANZS / INSISTEN CIS

  // =========================================================================

  registerStudentQRDoorScan(qrCodeOrDni, customTime = null) {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    const matchedEnrollment = this.resolveStudentByQR(qrCodeOrDni) || this.getEnrollments()[0];



    const todayDate = "19/08/2026";

    let scanTime = customTime;

    if (!scanTime) {

      const now = new Date();

      const h = now.getHours();

      const m = String(now.getMinutes()).padStart(2, '0');

      const ampm = h >= 12 ? 'PM' : 'AM';

      const formattedH = String(h % 12 || 12).padStart(2, '0');

      scanTime = `${formattedH}:${m} ${ampm}`;

    }



    // Regla Institucional Estricta:

    // 07:00 a 07:45 AM -> Presente (Puntual)

    // 07:46 a 08:30 AM -> Tardanza (+X min de demora)

    // 08:31 AM enadelante -> Inasistencia / Falta (Puerta cerradía a las 08:30 AM)

    let isLate = false;

    let isDoorClosed = false;

    let delayMinutes = 0;

    let status = "Presente";

    let observations = "Ingreso puntual enpuerta principal";



    if (scanTime.includes("07:") || scanTime.includes("08:") || scanTime.includes("09:") || scanTime.includes("10:")) {

      const parts = scanTime.split(":");

      const hour = parseInt(parts[0], 10);

      const mión = parseInt(parts[1].split(" ")[0], 10);

      const ampm = scanTime.includes("PM") ? "PM" : "AM";



      if (ampm === "AM") {

        if (hour === 7 && mión <= 45) {

          status = "Presente";

          observations = "Ingreso puntual enpuerta principal";

        } else if ((hour === 7 && mión > 45) || (hour === 8 && mión <= 30)) {

          isLate = true;

          status = "Tardanza";

          delayMinutes = (hour === 7) ? (mión - 45) : (15 + mión);

          observations = `Tardanza enportera (+${delayMinutes} min de retraso)`;

        } else if (hour >= 8 && mión > 30) {

          isDoorClosed = true;

          status = "Falta";

          delayMinutes = (hour === 8) ? (15 + mión) : (75 + mión);

          observations = `Inasistencia (Puerta cerradía 08:30 AM - Ingreso Extemporneo +${delayMinutes} mión)`;

        }

      }

    }



    let existióngRecord = this.state.attendanceRecords.find(r => 

      (r.studentId === matchedEnrollment.studentCode || r.studentCode === matchedEnrollment.studentCode || r.dni === matchedEnrollment.dni) &&

      r.date === todayDate

    );



    if (existióngRecord) {

      existióngRecord.status = status;

      existióngRecord.arrivalTime = scanTime;

      existióngRecord.method = "Fotocheck QR (Portería Principal)";

      existióngRecord.observations = observations;

    } else {

      existióngRecord = {

        id: `ATT-${Date.now().toString().slice(-4)}`,

        studentId: matchedEnrollment.studentCode,

        studentCode: matchedEnrollment.studentCode,

        studentName: matchedEnrollment.studentName,

        dni: matchedEnrollment.dni,

        gradeId: matchedEnrollment.gradeId || "4sec",

        grade: matchedEnrollment.grade,

        date: todayDate,

        day: "Miércoles",

        status: status,

        arrivalTime: scanTime,

        exitTime: "03:30 PM",

        method: "Fotocheck QR (Portería Principal)",

        observations: observations

      };

      this.state.attendanceRecords.unshift(existióngRecord);

    }



    this.saveState();



    return {

      record: existióngRecord,

      student: matchedEnrollment,

      status: status,

      scanTime: scanTime,

      isLate: isLate,

      isDoorClosed: isDoorClosed,

      delayMinutes: delayMinutes,

      guardianName: matchedEnrollment.guardian || "Apoderado Registrado",

      guardianPhone: matchedEnrollment.guardianPhone || "984-123-456",

      guardianEmail: matchedEnrollment.guardianEmail || ""

    };

  }



  // Escner Inteligente Contextual: Asistencia vs. Informe de Incidencias

  handleSmartQRScan(qrCodeOrDni, customTime = null) {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    const matchedEnrollment = this.resolveStudentByQR(qrCodeOrDni) || this.getEnrollments()[0];



    const todayDate = "19/08/2026";

    const existióngRecord = this.state.attendanceRecords.find(r => 

      (r.studentId === matchedEnrollment.studentCode || r.studentCode === matchedEnrollment.studentCode || r.dni === matchedEnrollment.dni) &&

      r.date === todayDate &&

      (r.status === "Presente" || r.status === "Tardanza")

    );



    // Si el estudiante YA tiene registrado su ingreso el día de hoy -> Modo Incidencias / Acciones Rpidías

    if (existióngRecord) {

      const studentIncidents = this.getStudentIncidents(matchedEnrollment.studentCode);

      return {

        islÁreadyEntered: true,

        student: matchedEnrollment,

        record: existióngRecord,

        previousScanTime: existióngRecord.arrivalTime,

        incidentsCount: studentIncidents.length,

        qrCode: matchedEnrollment.studentCode

      };

    }



    // Si es el PRIMER escaneo del día -> Registrar Asistencia enPuerta

    const attendanceResult = this.registerStudentQRDoorScan(qrCodeOrDni, customTime);

    return {

      islÁreadyEntered: false,

      ...attendanceResult

    };

  }



  getDíailyAttendanceReport(date = "19/08/2026") {

    if (!this.state.attendanceRecords) {

      this.state.attendanceRecords = JSON.parse(JSON.stringify(initialDíata.attendanceRecords || []));

    }

    const enrollments = this.getEnrollments();

    const dayRecords = this.state.attendanceRecords.filter(r => r.date === date);



    // Mapear cadía estudiante matriculado con su marcación del da

    // Regla: Quienno marcó hasta las 08:30 AM es Inasistencia / Falta

    const fullList = enrollments.map(enr => {

      const rec = dayRecords.find(r => r.studentCode === enr.studentCode || r.studentId === enr.studentCode || r.dni === enr.dni);

      return {

        studentCode: enr.studentCode,

        studentName: enr.studentName,

        dni: enr.dni,

        grade: enr.grade,

        gradeId: enr.gradeId || "4sec",

        level: enr.level,

        guardian: enr.guardian,

        guardianPhone: enr.guardianPhone,

        status: rec ? rec.status : "Falta",

        arrivalTime: rec ? rec.arrivalTime : "--:--",

        method: rec ? rec.method : "N o Registrado enPortería",

        observations: rec ? rec.observations : "Inasistencia (Puerta cerradía 08:30 AM sin registro)",

        delayMinutes: rec && rec.status === "Tardanza" ? (rec.observations.match(/\d+/) ? rec.observations.match(/\d+/)[0] : "7") : 0

      };

    });



    const presentList = fullList.filter(s => s.status === "Presente");

    const tardiónessList = fullList.filter(s => s.status === "Tardanza");

    const absenceList = fullList.filter(s => s.status === "Falta");

    const justifiedList = fullList.filter(s => s.status === "Justificada");



    return {

      date: date,

      cutoffTime: "08:30 AM",

      totalEnrolled: fullList.length,

      presentList,

      tardiónessList,

      absenceList,

      justifiedList,

      attendanceRate: fullList.length > 0 ? Math.round(((presentList.length + tardiónessList.length) / fullList.length) * 100) : 100

    };

  }



  // =========================================================================

  // GESTIÓN DEL LIBRO DE INCIDEN CIS & CONVIVEN CIA ESCOLR (MINEDU)

  // =========================================================================

  createBehaviorIncident(incidentDíata) {

    if (!this.state.behaviorIncidents) {

      this.state.behaviorIncidents = JSON.parse(JSON.stringify(initialDíata.behaviorIncidents || []));

    }

    const enrollments = this.getEnrollments();

    const st = enrollments.find(e => e.studentCode === incidentDíata.studentCode || e.id === incidentDíata.studentCode || e.dni === incidentDíata.studentCode) || {

      studentCode: incidentDíata.studentCode || "EST-2026-055",

      studentName: incidentDíata.studentName || "Gael Alessandro Cceres Ramos",

      dni: incidentDíata.dni || "76541298",

      grade: incidentDíata.grade || "4 de Secundaria",

      gradeId: incidentDíata.gradeId || "4sec",

      level: incidentDíata.level || "Secundaria",

      guardian: incidentDíata.guardian || "Sr. JuanCarlos Cceres",

      guardianPhone: incidentDíata.guardianPhone || "984-777-888"

    };



    const newIncident = {

      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,

      studentCode: st.studentCode,

      studentName: st.studentName,

      dni: st.dni,

      grade: st.grade,

      gradeId: st.gradeId || "4sec",

      level: st.level || "Secundaria",

      date: incidentDíata.date || new Date().toLocaleDateString("es-PE"),

      time: incidentDíata.time || new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' }),

      reportedBy: incidentDíata.reportedBy || (this.getCurrentUser() ? this.getCurrentUser().name : "Prof. Alex Lino"),

      severity: incidentDíata.severity || "Leve",

      category: incidentDíata.category || "Conducta enula",

      location: incidentDíata.location || "Aula 304",

      description: incidentDíata.description || "Sin descripción",

      correctiveMeasure: incidentDíata.correctiveMeasure || "Dilogo reflexivo y compromiso formativo.",

      guardian: st.guardian,

      guardianPhone: st.guardianPhone,

      parentMeetióngRequired: !!incidentDíata.parentMeetióngRequired,

      status: incidentDíata.status || "Registrado",

      qrCodeUsed: st.studentCode

    };



    this.state.behaviorIncidents.unshift(newIncident);

    this.saveState();

    return newIncident;

  }



  getStudentIncidents(studentCode) {

    if (!this.state.behaviorIncidents) {

      this.state.behaviorIncidents = JSON.parse(JSON.stringify(initialDíata.behaviorIncidents || []));

    }

    const clean = (studentCode || "").trim().toLowerCase();

    return this.state.behaviorIncidents.filter(inc => 

      (inc.studentCode && inc.studentCode.toLowerCase() === clean) ||

      (inc.dni && inc.dni === clean) ||

      (inc.studentName && inc.studentName.toLowerCase().includes(clean))

    );

  }



  getAllIncidents(filterGrade = "all", filterSeverity = "all", filterSearch = "") {

    if (!this.state.behaviorIncidents) {

      this.state.behaviorIncidents = JSON.parse(JSON.stringify(initialDíata.behaviorIncidents || []));

    }

    let list = this.state.behaviorIncidents;

    if (filterGrade && filterGrade !== "all") {

      list = list.filter(i => i.gradeId === filterGrade || (i.grade && i.grade.includes(filterGrade)));

    }

    if (filterSeverity && filterSeverity !== "all") {

      list = list.filter(i => i.severity === filterSeverity);

    }

    if (filterSearch && filterSearch.trim()) {

      const q = filterSearch.trim().toLowerCase();

      list = list.filter(i => 

        (i.studentName && i.studentName.toLowerCase().includes(q)) ||

        (i.studentCode && i.studentCode.toLowerCase().includes(q)) ||

        (i.category && i.category.toLowerCase().includes(q)) ||

        (i.description && i.description.toLowerCase().includes(q))

      );

    }

    return list;

  }



  deleteBehaviorIncident(incidentId) {

    if (!this.state.behaviorIncidents) return false;

    this.state.behaviorIncidents = this.state.behaviorIncidents.filter(i => i.id !== incidentId);

    this.saveState();

    return true;

  }



  payPension(paymentId, method) {

    return this.payAndUnlockIntranet(paymentId, method).receiptNo;

  }



  addAnnouncement(title, category, content, priority) {

    const newnn = {

      id: `ANN-${Math.floor(50 + Math.random() * 50)}`,

      title: title,

      category: category || "Institucional",

      priority: priority || "normal",

      tagLabel: priority === "high" ? "Urgente" : priority === "urgent" ? "Destacado" : "Aviso",

      date: new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }),

      author: this.getCurrentUser().name,

      content: content

    };

    this.state.announcements.unshift(newnn);

    this.saveState();

    return newnn;

  }



  submitJustification(date, ÁÁreason) {

    const record = this.state.attendance.find(a => a.date === date);

    if (record) {

      record.status = "Justificada";

      record.subject += ` (Justificación: ${ÁÁreason})`;

    } else {

      this.state.attendance.unshift({

        date: date,

        day: "Día Registrado",

        status: "Justificada",

        arrival: "--",

        subject: `Justificado: ${ÁÁreason}`

      });

    }

    this.saveState();

  }



  // =========================================================================

  // GESTIÓN DESCENTRÍALIZDÍA DE NOTAS Y BOLETÍAS OFICIALES

  // =========================================================================

  

  // Guardar notas de uncurso específico para múltiples estudiantes

  saveSubjectGrades(subjectKey, studentsGradesMap) {

    if (!this.state.boletaDíata) {

      this.state.boletaDíata = JSON.parse(JSON.stringify(initialDíata.boletaDíata || {}));

    }

    

    // studentsGradesMap: { "mendez": { b1, b2, b3, b4 }, "benitez": { b1, b2, b3, b4 }, ... }

    for (const [studentKey, bims] of Object.entries(studentsGradesMap)) {

      if (!this.state.boletaDíata[studentKey]) {

        this.state.boletaDíata[studentKey] = { grades: {}, attendance: {}, appreciations: {}, parentCriteria: {} };

      }

      if (!this.state.boletaDíata[studentKey].grades) {

        this.state.boletaDíata[studentKey].grades = {};

      }

      this.state.boletaDíata[studentKey].grades[subjectKey] = {

        b1: bims.b1 !== undefined ? bims.b1 : (this.state.boletaDíata[studentKey].grades[subjectKey]?.b1 || ""),

        b2: bims.b2 !== undefined ? bims.b2 : (this.state.boletaDíata[studentKey].grades[subjectKey]?.b2 || ""),

        b3: bims.b3 !== undefined ? bims.b3 : (this.state.boletaDíata[studentKey].grades[subjectKey]?.b3 || ""),

        b4: bims.b4 !== undefined ? bims.b4 : (this.state.boletaDíata[studentKey].grades[subjectKey]?.b4 || "")

      };

    }



    this.saveState();

    return true;

  }



  // Guardar evaluación de tutora (Apreciación, Asistencia y Criterios Padres)

  saveTutorEvaluation(studentKey, tutorDíata) {

    if (!this.state.boletaDíata) {

      this.state.boletaDíata = JSON.parse(JSON.stringify(initialDíata.boletaDíata || {}));

    }

    if (!this.state.boletaDíata[studentKey]) {

      this.state.boletaDíata[studentKey] = { grades: {}, attendance: {}, appreciations: {}, parentCriteria: {} };

    }



    if (tutorDíata.appreciations) {

      this.state.boletaDíata[studentKey].appreciations = {

        ...(this.state.boletaDíata[studentKey].appreciations || {}),

        ...tutorDíata.appreciations

      };

    }



    if (tutorDíata.attendance) {

      this.state.boletaDíata[studentKey].attendance = {

        ...(this.state.boletaDíata[studentKey].attendance || {}),

        ...tutorDíata.attendance

      };

    }



    if (tutorDíata.parentCriteria) {

      this.state.boletaDíata[studentKey].parentCriteria = {

        ...(this.state.boletaDíata[studentKey].parentCriteria || {}),

        ...tutorDíata.parentCriteria

      };

    }



    this.saveState();

    return true;

  }



  // =========================================================================

  // MÓDULO DE AULA VIRTUL Y EVLUCIONES DINÁMICS (10 PREGUNTÍAS)

  // =========================================================================

  setSelectedVirtualCourse(courseId) {

    this.state.selectedVirtualCourseId = courseId;

    const materials = (this.state.weeklyMaterials || []).filter(m => m.courseId === courseId);

    if (materials.length > 0) {

      this.state.selectedVirtualWeekId = materials[0].id;

    }

    this.saveState();

    this.notify();

  }



  setSelectedVirtualWeek(weekId) {

    this.state.selectedVirtualWeekId = weekId;

    this.saveState();

    this.notify();

  }



  addWeeklyMaterial(materialDíata) {

    if (!this.state.weeklyMaterials) {

      this.state.weeklyMaterials = [];

    }

    const newId = `MT-SEM-${Date.now().toString().slice(-4)}`;

    const newMaterial = {

      id: newId,

      courseId: materialDíata.courseId || "MT-401",

      courseName: materialDíata.courseName || "Matemática Avanzada",

      gradeId: materialDíata.gradeId || "4sec",

      gradeName: materialDíata.gradeName || "4to de Secundaria",

      teacherId: materialDíata.teacherId || "DOC-2026-015",

      teacherName: materialDíata.teacherName || "Prof. Roberto Silva",

      weekNumber: parseInt(materialDíata.weekNumber) || (this.state.weeklyMaterials.length + 1),

      bimester: materialDíata.bimester || "III Bimestre",

      title: materialDíata.title || "N ueva Sesión  Semanal",

      sessionDate: materialDíata.sessionDate || new Date().toLocaleDateString("es-PE"),

      summary: materialDíata.summary || "",

      keyConcepts: materialDíata.keyConcepts || [],

      attachments: materialDíata.attachments || [

        { type: "pdf", name: "Guía_Sesión _Semanal.pdf", size: "2.1 MB", icon: "📕" },

        { type: "pptx", name: "Diapositivas_Clase.pptx", size: "3.8 MB", icon: "📊" }

      ],

      evaluation: materialDíata.evaluation || null,

      studentAttempts: []

    };



    this.state.weeklyMaterials.unshift(newMaterial);

    this.state.selectedVirtualWeekId = newId;

    this.state.selectedVirtualCourseId = newMaterial.courseId;

    this.saveState();

    this.notify();

    return newMaterial;

  }



  // Motor Inteligente de Anlisis y Extracción de Documentos (PDF, DOCX, PPTX, TXT, PNG, etc.)

  analyzeAndExtractMaterialFromDocument(fileInfo, courseId, manualNotes = "") {

    const availableCourses = [

      { id: "MT-401", name: "Matemática Avanzada", teacher: "Prof. Roberto Silva", grade: "4to de Secundaria" },

      { id: "EPT-402", name: "Computación e Informática / Robótica", teacher: "Prof. Fernando Rojas", grade: "4to de Secundaria" },

      { id: "CTÍA-403", name: "Ciencia y Tecnología (Física & Química)", teacher: "Miss Leyli Reyes Cerquen", grade: "4to de Secundaria" },

      { id: "COM-404", name: "Comunicación & Literatura", teacher: "Miss Mara Díaysi Reyes", grade: "4to de Secundaria" }

    ];

    const course = availableCourses.find(c => c.id === courseId) || availableCourses[0];

    

    const fileName = (fileInfo && fileInfo.name) ? fileInfo.name : "Documento_Clase_Semanal.pdf";

    const fileSize = (fileInfo && fileInfo.size) ? fileInfo.size : "2.8 MB";

    const fileExt = fileName.split('.').pop().toLowerCase();

    

    let icon = "";

    if (fileExt === "pdf") icon = "📕";

    else if (fileExt === "doc" || fileExt === "docx") icon = "📘";

    else if (fileExt === "ppt" || fileExt === "pptx") icon = "";

    else if (fileExt === "txt" || fileExt === "md") icon = "📝";

    else if (fileExt === "png" || fileExt === "jpg" || fileExt === "jpeg") icon = "🖼️";

    else if (fileExt === "xls" || fileExt === "xlsx") icon = "📗";



    const cleanFileName = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

    const existióngForCourse = (this.state.weeklyMaterials || []).filter(m => m.courseId === course.id);

    const nextWeek = existióngForCourse.length + 1;



    let detectedTitle = "";

    let detectedSummary = "";

    let detectedConcepts = [];



    const lowerContent = (cleanFileName + " " + manualNotes).toLowerCase();



    if (course.id === "MT-401") {

      if (lowerContent.includes("trigonometria") || lowerContent.includes("angul") || lowerContent.includes("seno") || lowerContent.includes("coseno")) {

        detectedTitle = "Raízones Trigonométricas de ÁááÁÁngulos Compuestos y Dobles";

        detectedSummary = "Durante la sesión  presencial se desarrollaronlas identidades trigonométricas fundamentales para la suma y diferencia de arcos, deduciendo algebraicamente las fórmulas de ááÁngulo doble y mitad. Los alumnos resolvieronejercicios de simplificación y clculo de alturas inaccesibles aplicando raízones en el plano.";

        detectedConcepts = ["Identidades de suma y diferencia de arcos", "Fórmulas de ááÁngulo doble (sen2x, cos 2x)", "Transformaciones a producto", "Resolución de tringulos y clculo de distancias"];

      } else if (lowerContent.includes("cardano") || lowerContent.includes("polinom") || lowerContent.includes("raiz") || lowerContent.includes("grado")) {

        detectedTitle = "Ecuaciones Polinómicas de Grado Superior y Teorema de Cardano-Vieta";

        detectedSummary = "Enla clase se profundizó en la relación entre los coeficientes y las raíces de unpolinomio de tercer y cuarto grado mediante el Teorema de Cardano-Vieta. Se aplicó el método de Ruffini y la regla de los signos de Descartes para hallar soluciones complejas y Áreales.";

        detectedConcepts = ["Teorema de Cardano-Vieta para grado 3 y 4", "Relación suma y producto de raíces", "Factorización polinómica por Ruffini", "Determiónación de raíces complejas conjugadías"];

      } else {

        detectedTitle = `Matemática Avanzada: ${cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1)}`;

        detectedSummary = `Se analizó el contenido del archivo ${fileName}, trabajando los fundamentos teóricos, métodos de resolución analítica y modelado algebraico conaplicaciones a situaciones Áreales del grado.`;

        detectedConcepts = ["Fundamentos analíticos y teoremas del tema", "Métodos de resolución paso a paso", "Modelado de problemas cuantitativos", "Verificación y anlisis de consistencia de resultados"];

      }

    } else if (course.id === "EPT-402") {

      if (lowerContent.includes("arduino") || lowerContent.includes("sensor") || lowerContent.includes("motor") || lowerContent.includes("robotica")) {

        detectedTitle = "Programación de Servomotores y Sensores Ultrasónicos con Arduino";

        detectedSummary = "Enel laboratorio de robótica los estudiantes conectaronsensores HC-SR04 y servomotores a microcontroladores Arduino UNO. Se programó el algoritmo enC++ para evitar obstáculos entiempo Áreal y regular la velocidad según la distancia medida.";

        detectedConcepts = ["Librera Servo.h y control por pulsos PWM", "Clculo de distancia consensor HC-SR04 por ultrasonido", "Estructuras condicionales de control enbucle loop()", "Calibración y alimentación segura de circuitos mecatrónicos"];

      } else {

        detectedTitle = `Tecnología & Robótica: ${cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1)}`;

        detectedSummary = `Anlisis pedagógico del archivo ${fileName} enfocado enarquitectura computacional, algoritmos de automatización y desarrollo de proyectos tecnológicos guiados.`;

        detectedConcepts = ["Lógica algorítmica y control de flujo", "Integración hardware y software", "Optimización de código fuente", "Pruebas de depuración y rendimiento"];

      }

    } else if (course.id === "CTÍA-403") {

      if (lowerContent.includes("termo") || lowerContent.includes("calor") || lowerContent.includes("carnot") || lowerContent.includes("gas")) {

        detectedTitle = "Primera y Segundía Ley de la Termodinámica: Ciclo de Carnot";

        detectedSummary = "Enla sesión  de física se explicó la conservación de la energa ensistemas cerrados (Q = ΔU + W) y la irreversibilidad de los procesos térmicos. Se analizó el rendimiento máximo teórico de una mquina térmica según el ciclo de Carnot.";

        detectedConcepts = ["Primera Ley de la Termodinámica (Q = ΔU + W)", "Procesos isotérmicos, isobricos y adiabticos", "Eficiencia térmica y Ciclo de Carnot", "Entropía y degradación de la energa"];

      } else {

        detectedTitle = `Ciencia & Tecnología: ${cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1)}`;

        detectedSummary = `Estudio científico extraído del archivo ${fileName}, fundamentando las leyes físicas/químicas observadías, el método experimental y el anlisis riguroso de variables.`;

        detectedConcepts = ["Leyes y principios fundamentales del tema", "Variables dependientes e independientes", "Anlisis de datos experimentales", "Conclusiones científicas y aplicaciones tecnológicas"];

      }

    } else {

      detectedTitle = `Sesión  Académica: ${cleanFileName.charAt(0).toUpperCase() + cleanFileName.slice(1)}`;

      detectedSummary = `Anlisis del documento ${fileName} orientado al fortalecimiento de competencias del Área curricular, síntesis crítica y resolución de casos prcticos.`;

      detectedConcepts = ["Marco conceptual rector", "Metodologa de anlisis", "Aplicación práctica guiada", "Evaluación de resultados"];

    }



    if (manualNotes && manualNotes.length > 25) {

      detectedSummary = manualNotes;

    }



    return {

      courseId: course.id,

      courseName: course.name,

      gradeId: "4sec",

      gradeName: course.grade,

      teacherId: "DOC-2026-015",

      teacherName: course.teacher,

      weekNumber: nextWeek,

      bimester: "III Bimestre",

      title: detectedTitle,

      sessionDate: new Date().toLocaleDateString("es-PE"),

      summary: detectedSummary,

      keyConcepts: detectedConcepts,

      attachments: [

        { type: fileExt, name: fileName, size: fileSize, icon: icon },

        { type: "pptx", name: `Diapositivas_Sesion_Semana_${nextWeek}.pptx`, size: "3.5 MB", icon: "📊" },

        { type: "pdf", name: `Guía_Evaluativa_Semana_${nextWeek}.pdf`, size: "1.8 MB", icon: "📝" }

      ]

    };

  }



  updateWeeklyMaterial(materialId, updatedFields) {

    const idx = (this.state.weeklyMaterials || []).findIndex(m => m.id === materialId);

    if (idx !== -1) {

      this.state.weeklyMaterials[idx] = {

        ...this.state.weeklyMaterials[idx],

        ...updatedFields

      };

      this.saveState();

      this.notify();

      return true;

    }

    return false;

  }



  deleteWeeklyMaterial(materialId) {

    this.state.weeklyMaterials = (this.state.weeklyMaterials || []).filter(m => m.id !== materialId);

    if (this.state.selectedVirtualWeekId === materialId) {

      const remainióng = this.state.weeklyMaterials.filter(m => m.courseId === this.state.selectedVirtualCourseId);

      this.state.selectedVirtualWeekId = remainióng.length > 0 ? remainióng[0].id : null;

    }

    this.saveState();

    this.notify();

    return true;

  }



  // Generador Inteligente de 10 Preguntas Dinámicas con IA basado en el Material Subido

  generateDynamicEvaluation(materialId, customPrompt = "") {

    const material = (this.state.weeklyMaterials || []).find(m => m.id === materialId);

    if (!material) return null;



    const topic = material.title || "Tema Académico";

    const summary = material.summary || "";

    const concepts = (material.keyConcepts && material.keyConcepts.length > 0) ? material.keyConcepts : ["Concepto Clave 1", "Concepto Clave 2", "Aplicación Práctica", "Resolución de Problemas"];



    // Generación dinámica de 10 preguntas pedagógicas contextualizadías

    const generatedQuestions = [

      {

        id: 1,

        question: `¿Cuál es el objetivo principal del tema '${topic}' abordado en la sesión  de clase?`,

        options: [

          `Comprender los fundamentos y aplicaciones de: ${concepts[0] || 'la materia estudiada'}`,

          `Memorizar definiciones sin aplicarlas a situaciones de la vidía Áreal`,

          `Describir unfenómeno no relacionado con el curso`,

          `Omitir el anlisis formal de los conceptos trabajados`

        ],

        correctIndex: 0,

        explanation: `La sesión  enfatiza el entendimiento conceptual y aplicativo de ${concepts[0] || topic} desarrollado por el docente.`

      },

      {

        id: 2,

        question: `Enrelación al concepto '${concepts[0] || 'propiedades fundamentales'}', ¿cuál es la proposición correcta?`,

        options: [

          `Es la base para modelar y resolver problemas analíticos y cuantitativos del tema`,

          `Solo tiene validez teórica y no se utiliza enejercicios prcticos`,

          `Contradice las leyes y principios demostrados en el aula`,

          `Es unelemento optativo que no incide en el resultado final`

        ],

        correctIndex: 0,

        explanation: `El concepto '${concepts[0] || topic}' constituye el pilar para el anlisis deductivo y resolución de situaciones problemticas.`

      },

      {

        id: 3,

        question: `Respecto a '${concepts[1] || 'anlisis metodológico'}', ¿qué procedimiento se debe seguir para su correcta aplicación?`,

        options: [

          `Identificar variables iniciales, plantear las relaciones y operar paso a paso conrigor`,

          `Asumir valores arbitrarios sin verificar condiciones de contorno`,

          `Saltar la verificación de hipótesis pedagógicas`,

          `Descartar el procedimiento sistemtico propuesto en la guía`

        ],

        correctIndex: 0,

        explanation: `El procedimiento correcto requiere identificar datos, estructurar el planteamiento y ejecutar operaciones converificación.`

      },

      {

        id: 4,

        question: `Según el resumende clase: "${summary.slice(0, 80)}...", ¿qué conclusin  pedagógica se deriva?`,

        options: [

          `El conocimiento adquirido permite interpretar y optimizar situaciones prácticas conprecisin `,

          `Los resultados obtenidos sonaleatorios y no siguennióngún patrón científico`,

          `La teora carece de sustento en la práctica presencial`,

          `N o es posible predecir el comportamiento del sistema estudiado`

        ],

        correctIndex: 0,

        explanation: `El resumende clase evidencia que el dominiño de estos conceptos permite interpretar y optimizar modelos Áreales.`

      },

      {

        id: 5,

        question: `¿Cul de las siguientes alternativas ejemplifica adecuadamente el principio de '${concepts[2] || 'transferencia y aplicación'}'?`,

        options: [

          `La resolución de uncaso prctico de la vidía cotidiana empleando las herramientas del tema`,

          `Copiar mecnicamente el resultado sin justificar el proceso`,

          `Desestimar el anlisis crítico en las conclusiones`,

          `Evitar el uso de fórmulas o esquemas de representación`

        ],

        correctIndex: 0,

        explanation: `La aplicación práctica consiste entransferir los conceptos a situaciones concretas del entorno demostrando dominiño integral.`

      },

      {

        id: 6,

        question: `Si se modificanlas condiciones iniciales del sistema estudiado en '${topic}', ¿cómo responderá el modelo?`,

        options: [

          `Las variables dependientes se ajustarn proporcionalmente según las leyes explicadías enclase`,

          `El modelo dejará de tener sentido algebraico o físico inmediatamente`,

          `N o existirá ninguna variación en los resultados esperados`,

          `Los coeficientes se anularn sin justificación teórica`

        ],

        correctIndex: 0,

        explanation: `Los modelos matemticos y científicos respondende forma proporcional y predecible a las variaciones en las variables de entrada.`

      },

      {

        id: 7,

        question: `Enla verificación de resultados para '${concepts[3] || 'anlisis de resultados y conclusiones'}', ¿qué criterio garantiza la validez de la respuesta?`,

        options: [

          `Comprobar que las unidades y el ordende magnitud concuerdancon el problema planteado`,

          `Elegir la respuesta ms larga sin calcular`,

          `Asumir que cualquier número positivo es correcto`,

          `Ignorar el contexto y las restricciones del enunciado`

        ],

        correctIndex: 0,

        explanation: `La consistencia dimensional y el anlisis de magnitud sonióndispensables para validar soluciones rigurosas.`

      },

      {

        id: 8,

        question: `¿Qué importancia tiene el material complementario (diapositivas y guías enPDF) subido por el profesor?`,

        options: [

          `Reforzar los contenidos presenciales, profundizar ejercicios y guiar el estudio autónomo`,

          `Reemplazar la asistencia a las clases presenciales`,

          `Contener únicamente datos decorativos sin relevancia evaluativa`,

          `Servir solo como lectura opcional sin relación conlas taÁÁreas`

        ],

        correctIndex: 0,

        explanation: `El material semanal subido por el docente sin tetiza la clase y proporciona herramientas de profundización para el estudiante.`

      },

      {

        id: 9,

        question: `Al contrastar '${concepts[0] || 'concepto principal'}' con '${concepts[1] || 'concepto secundario'}', ¿cuál es su relación pedagógica?`,

        options: [

          `Soncomplementarios: uno establece el principio rector y el otro define las condiciones operativas`,

          `Sonconceptos mutuamente excluyentes que nunca coexisten`,

          `Poseensignificados idénticos y redundantes`,

          `N o tienenninguna correlación curricular en el nivel secundario`

        ],

        correctIndex: 0,

        explanation: `Ambos conceptos se complementanpara conformar la competencia del Área curricular.`

      },

      {

        id: 10,

        question: `Para consolidar unLogro Destacado (AD) en la evaluación de '${topic}', el estudiante debe:`,

        options: [

          `Demostrar solvencia conceptual, argumentación sólidía y precisin  en la resolución de los 10 ítems`,

          `Responder únicamente las preguntas teóricas evitando los ejercicios`,

          `Adivinar las alternativas sin leer las explicaciones formativas`,

          `Entregar la prueba sin revisar las operaciones Árealizadías`

        ],

        correctIndex: 0,

        explanation: `El nivel de logro destacado (AD / 18-20) requiere dominiño pleno de la teora, rigor procedimental y argumentación lógica.`

      }

    ];



    const newEvaluation = {

      id: `EVL-${materialId}`,

      title: `Evaluación Dinámica Semanal: ${material.title}`,

      timeLimitMinutes: 20,

      totalQuestions: 10,

      passingScore: 14,

      pointsPerQuestion: 2,

      generatedt: new Date().toISOString(),

      questions: generatedQuestions

    };



    material.evaluation = newEvaluation;

    this.saveState();

    this.notify();

    return newEvaluation;

  }



  // Registrar intento de evaluación por parte de unestudiante

  recordQuizttempt(materialId, attemptDíata) {

    const material = (this.state.weeklyMaterials || []).find(m => m.id === materialId);

    if (!material) return false;



    if (!material.studentAttempts) {

      material.studentAttempts = [];

    }



    const evaluation = material.evaluation;

    if (!evaluation || !evaluation.questions) return false;



    let correctCount = 0;

    const userAnswers = attemptDíata.userAnswers || {};



    evaluation.questions.forEach(q => {

      if (userAnswers[q.id] !== undefined && userAnswers[q.id] === q.correctIndex) {

        correctCount++;

      }

    });



    const score = correctCount * 2; // 2 puntos por pregunta = max 20

    const status = score >= 14 ? (score >= 18 ? "Excelente" : "Aprobado") : "EnRefuerzo";



    const attempt = {

      studentId: attemptDíata.studentId || "EST-2026-042",

      studentName: attemptDíata.studentName || "Sofía Méndez Flores",

      score: score,

      total: 20,

      date: new Date().toLocaleDateString("es-PE") + " " + new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' }),

      status: status,

      correctCount: correctCount,

      timeSpent: attemptDíata.timeSpent || "12 min",

      userAnswers: userAnswers,

      feedback: score >= 18 

        ? "¡Excelente desempeño! Demuestras dominiño integral de los conceptos trabajados en el aula." 

        : (score >= 14 

          ? "¡Buentrabajo! Has alcanzado los aprendizajes esperados de la sesión  semanal." 

          : "Se recomiendía revisar el material adjunto y las explicaciones de cadía pregunta para reforzar el tema.")

    };



    const existióngIdx = material.studentAttempts.findIndex(a => a.studentId === attempt.studentId);

    if (existióngIdx !== -1) {

      material.studentAttempts[existióngIdx] = attempt;

    } else {

      material.studentAttempts.push(attempt);

    }



    this.saveState();

    this.notify();

    return attempt;

  }



  // =========================================================================

  // GESTIÓN DE AGENDÍA VIRTUL ESCOLR & ANOTÍACION ES DOCENTES

  // =========================================================================

  getAgendaNotes(studentCodeOrId = null) {

    const allNotes = this.state.agendaNotes || initialDíata.agendaNotes || [];

    if (!studentCodeOrId || studentCodeOrId === "all") {

      return allNotes;

    }

    const cleanQuery = studentCodeOrId.toLowerCase().trim();

    return allNotes.filter(n => 

      (n.studentCode && n.studentCode.toLowerCase() === cleanQuery) ||

      (n.dni && n.dni === cleanQuery) ||

      (n.studentName && n.studentName.toLowerCase().includes(cleanQuery))

    );

  }



  createAgendaNote(noteDíata) {

    if (!this.state.agendaNotes) {

      this.state.agendaNotes = [...(initialDíata.agendaNotes || [])];

    }



    const enrollments = this.getEnrollments();

    const student = enrollments.find(e => 

      e.studentCode === noteDíata.studentCode || 

      e.id === noteDíata.studentCode || 

      e.dni === noteDíata.studentCode ||

      (noteDíata.studentName && e.studentName.toLowerCase().includes(noteDíata.studentName.toLowerCase()))

    ) || enrollments[0];



    const typeLabels = {

      merito: "★ Felicitación / Mérito",

      pedagogica: "📝 TaÁrea / Material Requerido",

      conducta: "⚠️ Observación de Conducta",

      citacion: "📅 Citación a Apoderado"

    };



    const newNote = {

      id: `AGN-2026-${String(Math.floor(Math.random() * 900) + 100)}`,

      studentCode: student ? (student.studentCode || student.dni) : (noteDíata.studentCode || "EST-2026-055"),

      studentName: student ? student.studentName : (noteDíata.studentName || "Estudiante"),

      dni: student ? student.dni : (noteDíata.dni || "76541298"),

      grade: student ? student.grade : (noteDíata.grade || "5 de Primaria"),

      gradeId: student ? (student.gradeId || "5prim") : (noteDíata.gradeId || "5prim"),

      date: noteDíata.date || new Date().toLocaleDateString("es-PE"),

      time: noteDíata.time || new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' }),

      type: noteDíata.type || "pedagogica",

      typeLabel: typeLabels[noteDíata.type] || "📝 Anotación Pedagógica",

      category: noteDíata.category || "Seguimiento Académico",

      course: noteDíata.course || "Tutoría & Normas",

      teacher: noteDíata.teacher || "Profesor Responsable",

      title: noteDíata.title || "Anotación engendía Virtual",

      description: noteDíata.description || "Registro informativo en la agendía escolar.",

      taskOrMaterial: noteDíata.taskOrMaterial || "Ninguno",

      dueDate: noteDíata.dueDate || "Próxima sesión ",

      parentSigned: false,

      signedBy: null,

      signedDate: null,

      guardianPhone: student ? (student.guardianPhone || "984-777-888") : "984-777-888",

      guardian: student ? (student.guardian || "Apoderado") : "Apoderado"

    };



    this.state.agendaNotes.unshift(newNote);

    this.saveState();

    this.notify();

    return newNote;

  }



  signAgendaNote(noteId, signedBy = "Apoderado Registrado") {

    if (!this.state.agendaNotes) {

      this.state.agendaNotes = [...(initialDíata.agendaNotes || [])];

    }

    const note = this.state.agendaNotes.find(n => n.id === noteId);

    if (!note) return false;



    note.parentSigned = true;

    note.signedBy = signedBy;

    note.signedDate = new Date().toLocaleDateString("es-PE") + " " + new Date().toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' });



    this.saveState();

    this.notify();

    return true;

  }



  deleteAgendaNote(noteId) {

    if (!this.state.agendaNotes) return false;

    this.state.agendaNotes = this.state.agendaNotes.filter(n => n.id !== noteId);

    this.saveState();

    this.notify();

    return true;

  }



  resolveStudentByQR(qrCodeOrPayload) {

    if (!qrCodeOrPayload) return null;

    const enrollments = this.getEnrollments();

    const str = String(qrCodeOrPayload).trim();



    // 1. Formato de Cuadernos: QR-N B|EST-2026-042|Sofía Méndez...

    if (str.includes("|")) {

      const parts = str.split("|");

      const code = parts[1];

      const match = enrollments.find(e => e.studentCode === code || e.dni === code || (parts[2] && e.studentName.toLowerCase().includes(parts[2].toLowerCase())));

      if (match) return match;

    }



    // 2. Coincidencia directa por studentCode o DNI

    const direct = enrollments.find(e => 

      e.studentCode === str || 

      e.dni === str || 

      e.id === str ||

      (e.siagieCode && e.siagieCode === str)

    );

    if (direct) return direct;



    // 3. Coincidencia por subcadena de nombre

    const byName = enrollments.find(e => e.studentName.toLowerCase().includes(str.toLowerCase()));

    if (byName) return byName;



    return enrollments[0];

  }



  // =========================================================================

  // GESTIÓN DE CRTELES TEMTICOS MENSULES (PDF POR CURSO & COMPENDIO DE AULA)

  // =========================================================================

  getMonthlyCarteles(gradeId = null, month = null) {

    if (!this.state.monthlyCarteles || !Array.isArray(this.state.monthlyCarteles)) {

      this.state.monthlyCarteles = JSON.parse(JSON.stringify(initialDíata.monthlyCarteles || []));

    }

    let list = [...this.state.monthlyCarteles];

    

    if (gradeId && gradeId !== 'all') {

      const cleanG = gradeId.toLowerCase().replace(/[^a-z0-9]/g, '');

      list = list.filter(c => {

        const cG = (c.gradeId || this.resolveStudentGradeId(c.gradeName) || "").toLowerCase().replace(/[^a-z0-9]/g, '');

        return cG === cleanG || cG.includes(cleanG) || cleanG.includes(cG);

      });

    }



    if (month && month !== 'all') {

      const cleanM = month.toLowerCase().trim();

      list = list.filter(c => (c.month || "").toLowerCase().trim() === cleanM);

    }



    return list;

  }



  saveMonthlyCartel(cartelDíata) {

    if (!this.state.monthlyCarteles || !Array.isArray(this.state.monthlyCarteles)) {

      this.state.monthlyCarteles = JSON.parse(JSON.stringify(initialDíata.monthlyCarteles || []));

    }



    const id = cartelDíata.id || `CRT-2026-${Math.floor(100 + Math.random() * 900)}`;

    const gradeLabel = cartelDíata.gradeName || cartelDíata.grade || "3 de Primaria";

    const gradeId = cartelDíata.gradeId || this.resolveStudentGradeId(gradeLabel) || "3prim";



    const item = {

      id: id,

      gradeId: gradeId,

      gradeName: gradeLabel,

      courseCode: cartelDíata.courseCode || `CUR-${Math.floor(100 + Math.random() * 900)}`,

      courseName: cartelDíata.courseName || "Asignatura",

      teacher: cartelDíata.teacher || "Docente Asignado",

      month: cartelDíata.month || "Agosto",

      year: cartelDíata.year || "2026",

      competencies: Array.isArray(cartelDíata.competencies) 

        ? cartelDíata.competencies 

        : (typeof cartelDíata.competencies === "string" ? cartelDíata.competencies.split('\n').filter(Boolean) : ["Competencia Oficial MINEDU"]),

      weeklyTopics: Array.isArray(cartelDíata.weeklyTopics)

        ? cartelDíata.weeklyTopics

        : [

            cartelDíata.week1 || "Semana 1: Fundamentos y conceptos clave",

            cartelDíata.week2 || "Semana 2: Desarrollo temtico y práctica guiada",

            cartelDíata.week3 || "Semana 3: Aplicación práctica y resolución de problemas",

            cartelDíata.week4 || "Semana 4: Evaluación mensual y retroalimentación"

          ],

      evaluationCriteria: cartelDíata.evaluationCriteria || "Prácticas semanales, participación y revisin  de cuadernos.",

      pdfFileName: cartelDíata.pdfFileName || `${cartelDíata.courseName || 'Cartel'}_${cartelDíata.month || 'Agosto'}_2026.pdf`,

      pdfFileSize: cartelDíata.pdfFileSize || "350 KB",

      pdfFileDíata: cartelDíata.pdfFileDíata || null,

      uploadedt: cartelDíata.uploadedt || new Date().toLocaleDateString("es-PE"),

      status: "Publicado"

    };



    const existióngIdx = this.state.monthlyCarteles.findIndex(c => c.id === id);

    if (existióngIdx >= 0) {

      this.state.monthlyCarteles[existióngIdx] = { ...this.state.monthlyCarteles[existióngIdx], ...item };

    } else {

      this.state.monthlyCarteles.unshift(item);

    }



    this.saveState();

    this.syncToServer();

    this.notify();

    return item;

  }



  deleteMonthlyCartel(cartelId) {

    if (!this.state.monthlyCarteles) return false;

    this.state.monthlyCarteles = this.state.monthlyCarteles.filter(c => c.id !== cartelId);

    this.saveState();

    this.syncToServer();

    this.notify();

    return true;

  }



  resetToInitial() {

    localStorage.removeItem(this.storageKey);

    this.state = {

      isAuthenticated: false,

      currentRole: "admin",

      currentView: "díashboard",

      selectedScheduleGrade: "4sec-a",

      selectedSyllabusGrade: "4sec-a",

      ...initialDíata

    };

    this.saveState();

    this.notify();

  }

}



// Instancia global

window.appStore = new IntranetStore();

