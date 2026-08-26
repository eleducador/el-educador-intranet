/**
 * Datos Iniciales del Sistema - Institución Educativa Privada "EL EDUCADOR" (S.J.L.)
 * "21 años dejando huellas" • UGEL 05
 */

const initialData = {
  institution: {
    name: "INSTITUCIÓN EDUCATIVA PRIVADA \"EL EDUCADOR\"",
    levels: "INICIAL - PRIMARIA - SECUNDARIA",
    slogan: "21 años dejando huellas",
    district: "San Juan de Lurigancho (S.J.L.)",
    ugel: "UGEL 05",
    coordinator: "Prof. Alex Lino",
    economicReport: {
      month: "Agosto 2026",
      collectedAmount: 25130.00,
      targetAmount: 24000.00,
      reportCode: "INFORME- N°003 /ED - COORDINACIÓN Y DOCUMENTACIÓN",
      reportDate: "15/08/2026"
    }
  },

  academicYear: "2026 - Año Lectivo",
  currentPeriod: "3er Bimestre",

  // 1. Usuarios con Credenciales de Acceso Oficiales
  users: {
    admin: {
      id: "ADM-LINO-001",
      username: "admin",
      password: "admin2026",
      name: "Prof. Alex Lino",
      email: "coordinacion@eleducador.edu.pe",
      role: "admin",
      roleLabel: "Coordinación General & Documentación",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      totalUsers: 950,
      activeEnrollments: 850,
      adminTeachersCount: 4,
      totalIncome: 25130.00
    },
    director: {
      id: "DIR-2026-001",
      username: "director",
      password: "director2026",
      name: "Lic. Manuel Cornejo",
      email: "direccion@eleducador.edu.pe",
      role: "director",
      roleLabel: "Director General",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      totalStudents: 850,
      totalTeachers: 48,
      avgAttendance: "96.4%",
      feeCollectionRate: "104.7% (S/ 25,130.00)"
    },
    docente: {
      id: "DOC-2026-015",
      username: "roberto.silva",
      aliases: ["roberto.silva", "prof.silva", "roberto silva", "silva", "docente", "prof. roberto silva"],
      password: "docente2026",
      name: "Prof. Roberto Silva",
      email: "roberto.silva@eleducador.edu.pe",
      role: "docente",
      roleLabel: "Docente de Matemáticas",
      assignedGrades: ["3ro Sec A", "4to Sec A", "5to Sec B"],
      hasAdminPrivileges: true,
      adminPrivilegeLabel: "Coordinador Pedagógico (Permisos de Edición)",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      totalStudents: 92,
      pendingGrading: 4,
      scannedNotebooksToday: 18
    },
    estudiante: {
      id: "EST-2026-042",
      username: "sofia.mendez",
      password: "estudiante2026",
      name: "Sofía Méndez",
      email: "sofia.mendez@eleducador.edu.pe",
      role: "estudiante",
      roleLabel: "Estudiante",
      gradeLevel: "4to Año - Secundaria 'A'",
      gradeId: "4sec-a",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      tutor: "Prof. Alex Lino",
      generalAverage: 18.4,
      attendanceRate: "98.5%",
      pendingTasksCount: 2,
      paymentsUpToDate: true,
      pensionStatus: "Al Día",
      isAccessLocked: false,
      pendingDebtAmount: 0.00,
      pendingConcept: "--",
      notebooksUpToDate: "5/6 al día"
    },
    auxiliar: {
      id: "AUX-2026-004",
      username: "auxiliar",
      aliases: ["auxiliar", "auxiliar.puerta", "auxiliar2026", "carlos.medina"],
      password: "auxiliar2026",
      name: "Lic. Carlos Medina",
      email: "auxiliar@eleducador.edu.pe",
      role: "auxiliar",
      roleLabel: "Auxiliar de Educación & Portería",
      assignedZones: ["Portería Principal (Puerta 1)", "Patio Central & Pabellón Secundaria"],
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      scannedToday: 42,
      notebooksReviewedToday: 26,
      incidentsReportedToday: 2,
      shift: "Turno Mañana (07:00 AM - 02:30 PM)"
    },
    padre: {
      id: "FAM-2026-108",
      username: "carmen.mendez",
      password: "padre2026",
      name: "Dra. Carmen Méndez",
      email: "carmen.mendez@gmail.com",
      role: "padre",
      roleLabel: "Padre / Apoderado",
      selectedChildId: "EST-2026-042",
      children: [
        {
          id: "EST-2026-042",
          name: "Sofía Méndez Flores",
          dni: "74891230",
          level: "Secundaria",
          grade: "4to de Secundaria 'A'",
          gradeId: "4sec-a",
          tutor: "Prof. Roberto Silva",
          generalAverage: 18.4,
          attendanceRate: "98.5%",
          notebooksUpToDate: "5/6 Al Día",
          pendingTasksCount: 1,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          notebooks: [
            { course: "Matemática", teacher: "Prof. Roberto Silva", lastDate: "16/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Tareas completas al 100%, márgenes impecables y esquemas en orden." },
            { course: "Comunicación", teacher: "Miss María Daysi Reyes", lastDate: "15/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "17 (A)", remarks: "Análisis de textos y caligrafía óptima. Muy buen desarrollo." },
            { course: "🔬 Ciencia y Tecnología", teacher: "Miss Leyli Reyes", lastDate: "14/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "18 (AD)", remarks: "Prácticas experimentales ilustradas y fichas de laboratorio selladas." },
            { course: "🌎 Ciencias Sociales", teacher: "Prof. Javier Vega", lastDate: "12/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "16 (A)", remarks: "Mapas históricos y resúmenes de época bien estructurados." },
            { course: "🇬🇧 Inglés", teacher: "Miss Andrea Ramos", lastDate: "11/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Vocabulario y ejercicios de gramática avanzados completos." },
            { course: "💻 EPT (Computación)", teacher: "Prof. Alex Lino", lastDate: "10/08/2026", status: "observado", statusLabel: "<span class='status-dot-yellow'></span> OBSERVADO", score: "13 (B)", remarks: "Falta pegar y desarrollar la ficha de proyecto técnico N° 3. Presentar este viernes." }
          ]
        },
        {
          id: "EST-2026-088",
          name: "Mateo Méndez Flores",
          dni: "78912344",
          level: "Primaria",
          grade: "1ro de Primaria 'A'",
          gradeId: "1prim-a",
          tutor: "Miss Julisa Magali Arroyo Araujo",
          generalAverage: 19.2,
          attendanceRate: "100%",
          notebooksUpToDate: "4/4 Al Día",
          pendingTasksCount: 0,
          avatar: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80",
          notebooks: [
            { course: "🔢 Lógico Matemático", teacher: "Miss Julisa Arroyo", lastDate: "16/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "20 (AD)", remarks: "Numeración y sumas perfectas. Excelente coloreado y trazos." },
            { course: "✏️ Comunicación Integral", teacher: "Miss Julisa Arroyo", lastDate: "15/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Lectoescritura fluida y caligrafía prolija." },
            { course: "🌱 Ciencia y Ambiente", teacher: "Miss Maritza", lastDate: "14/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "19 (AD)", remarks: "Fichas de los seres vivos completas y coloreadas." },
            { course: "🎨 Arte y Cultura", teacher: "Miss Julisa Arroyo", lastDate: "12/08/2026", status: "al_dia", statusLabel: "<span class='status-dot-green'></span> REVISADO & AL DÍA", score: "20 (AD)", remarks: "Técnicas de dactilopintura y recortado excelentes." }
          ]
        }
      ],
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      pensionStatus: "Al Día",
      isAccessLocked: false,
      pendingDebtAmount: 0.00,
      pendingConcept: "--"
    }
  },

  // Familias y Estado Financiero en Tiempo Real
  familiesFinancial: [
    {
      familyId: "FAM-2026-108",
      guardian: "Dra. Carmen Méndez",
      studentName: "Sofía Méndez",
      studentCode: "EST-2026-042",
      grade: "4to Sec 'A'",
      pensionStatus: "bloqueado_deuda",
      pendingAmount: 480.00,
      pendingConcept: "Pensión Escolar - Agosto 2026",
      dueDate: "15/08/2026",
      isAccessLocked: true,
      lastPaymentDate: null
    },
    {
      familyId: "FAM-2026-044",
      guardian: "Sr. Roberto Díaz",
      studentName: "Carlos Benítez",
      studentCode: "EST-2026-011",
      grade: "4to Sec 'A'",
      pensionStatus: "al_dia",
      pendingAmount: 0.00,
      pendingConcept: "--",
      dueDate: "--",
      isAccessLocked: false,
      lastPaymentDate: "10/08/2026"
    },
    {
      familyId: "FAM-2026-092",
      guardian: "Sra. Teresa Oropeza",
      studentName: "Brini Yuneyli Pocomo Oropeza",
      studentCode: "EST-2026-003",
      grade: "Inicial 5 años",
      pensionStatus: "al_dia",
      pendingAmount: 0.00,
      pendingConcept: "Matrícula 2026",
      dueDate: "--",
      isAccessLocked: false,
      lastPaymentDate: "14/08/2026"
    }
  ],

  // 2. Directorio Real de Personal Docente y Administrativo (del Informe Oficial)
  systemUsers: [
    {
      id: "USR-001",
      code: "ADM-LINO-001",
      username: "admin",
      password: "admin2026",
      name: "Prof. Alex Lino",
      email: "coordinacion@eleducador.edu.pe",
      role: "Directivo",
      detail: "Coordinador General & Documentación",
      hasAdminPrivilege: true,
      status: "Activo",
      createdDate: "05/01/2026"
    },
    {
      id: "USR-002",
      code: "DIR-2026-001",
      username: "director",
      password: "director2026",
      name: "Lic. Manuel Cornejo",
      email: "direccion@eleducador.edu.pe",
      role: "Directivo",
      detail: "Director General",
      hasAdminPrivilege: true,
      status: "Activo",
      createdDate: "06/01/2026"
    },
    {
      id: "USR-003",
      code: "AUX-2026-004",
      username: "auxiliar",
      password: "auxiliar2026",
      name: "Lic. Carlos Medina",
      email: "auxiliar@eleducador.edu.pe",
      role: "Auxiliar",
      detail: "Auxiliar de Educación & Portería (Control de Cuadernos y Asistencia)",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "08/01/2026"
    },
    {
      id: "USR-004",
      code: "DOC-2026-015",
      username: "roberto.silva",
      password: "docente2026",
      name: "Prof. Roberto Silva",
      email: "roberto.silva@eleducador.edu.pe",
      role: "Docente",
      detail: "Matemática Avanzada (Secundaria)",
      assignedCourses: ["Aritmética", "Álgebra", "Geometría", "Trigonometría", "Razonamiento Matemático", "Matemática Avanzada"],
      assignedGrades: ["3ro Sec", "4to Sec", "5to Sec"],
      weeklyHours: "24 hrs",
      hasAdminPrivilege: true,
      status: "Activo",
      createdDate: "10/01/2026"
    },
    {
      id: "USR-004-COMP",
      code: "DOC-2026-008",
      username: "fernando.rojas",
      password: "docente2026",
      name: "Prof. Fernando Rojas",
      email: "fernando.rojas@eleducador.edu.pe",
      role: "Docente",
      detail: "Computación & Robótica",
      assignedCourses: ["Computación & Robótica", "Gestión Empresarial & Emprendimiento", "Educación para el Trabajo (EPT)"],
      assignedGrades: ["1ro Sec", "2do Sec", "3ro Sec", "4to Sec", "5to Sec"],
      weeklyHours: "22 hrs",
      hasAdminPrivilege: true,
      status: "Activo",
      createdDate: "12/01/2026"
    },
    {
      id: "USR-005",
      code: "DOC-2026-007",
      username: "leyli.reyes",
      password: "docente2026",
      name: "Miss Leyli Graciela Reyes Cerquen",
      email: "leyli.reyes@eleducador.edu.pe",
      role: "Docente",
      detail: "Ciencia y Tecnología (Física & Química)",
      assignedCourses: ["Biología & Anatomía", "Física Elemental", "Química Inorgánica", "Ciencia y Tecnología"],
      assignedGrades: ["3ro Sec", "4to Sec", "5to Sec"],
      weeklyHours: "20 hrs",
      hasAdminPrivilege: true,
      status: "Activo",
      createdDate: "15/01/2026"
    },
    {
      id: "USR-006",
      code: "DOC-2026-006",
      username: "maria.reyes",
      password: "docente2026",
      name: "Miss María Daysi Reyes Milla",
      email: "maria.reyes@eleducador.edu.pe",
      role: "Docente",
      detail: "Comunicación & Literatura",
      assignedCourses: ["Lenguaje y Gramática", "Literatura Universal", "Razonamiento Verbal", "Comunicación Integral"],
      assignedGrades: ["1ro Sec", "2do Sec", "4to Sec"],
      weeklyHours: "18 hrs",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "20/01/2026"
    },
    {
      id: "USR-007",
      code: "DOC-2026-005",
      username: "julisa.arroyo",
      password: "docente2026",
      name: "Miss Julisa Magali Arroyo Araujo",
      email: "julisa.arroyo@eleducador.edu.pe",
      role: "Docente",
      detail: "Nivel Primaria & DPCC",
      assignedCourses: ["Educación Cívica (DPCC)", "Psicología", "Personal Social & Cívica", "Comunicación Integral", "Tutoría & Convivencia Escolar"],
      assignedGrades: ["1ro Prim", "2do Prim", "3ro Prim", "4to Sec"],
      weeklyHours: "28 hrs",
      hasAdminPrivilege: true,
      status: "Activo",
      createdDate: "18/01/2026"
    },
    {
      id: "USR-008",
      code: "DOC-2026-004",
      username: "miss.maritza",
      aliases: ["miss.maritza", "mis.maritza", "maritza", "miss maritza", "mis maritza"],
      password: "docente2026",
      name: "Miss Maritza",
      email: "maritza@eleducador.edu.pe",
      role: "Docente",
      detail: "Nivel Inicial (3, 4 y 5 años)",
      assignedCourses: ["Nivel Inicial (3, 4 y 5 años)"],
      assignedGrades: ["Inicial 3 años", "Inicial 4 años", "Inicial 5 años"],
      weeklyHours: "30 hrs",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "15/01/2026"
    },
    {
      id: "USR-009",
      code: "EST-2026-042",
      username: "sofia.mendez",
      password: "estudiante2026",
      name: "Sofía Méndez Flores",
      email: "sofia.mendez@eleducador.edu.pe",
      role: "Estudiante",
      detail: "4to de Secundaria",
      dni: "74891230",
      guardian: "Dra. Carmen Méndez",
      tutor: "Prof. Roberto Silva",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "05/02/2026"
    },
    {
      id: "USR-010",
      code: "EST-2026-011",
      username: "carlos.benitez",
      password: "estudiante2026",
      name: "Carlos Benítez Díaz",
      email: "carlos.benitez@eleducador.edu.pe",
      role: "Estudiante",
      detail: "4to de Secundaria",
      dni: "75129034",
      guardian: "Sr. Roberto Díaz",
      tutor: "Prof. Roberto Silva",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "06/02/2026"
    },
    {
      id: "USR-011",
      code: "EST-2026-025",
      username: "mateo.ramos",
      password: "estudiante2026",
      name: "Mateo Ramos Quispe",
      email: "mateo.ramos@eleducador.edu.pe",
      role: "Estudiante",
      detail: "3ro de Secundaria",
      dni: "76891209",
      guardian: "Sra. Lucía Quispe",
      tutor: "Miss Leyli Reyes",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "07/02/2026"
    },
    {
      id: "USR-012",
      code: "FAM-2026-108",
      username: "carmen.mendez",
      password: "padre2026",
      name: "Dra. Carmen Méndez",
      email: "carmen.mendez@gmail.com",
      role: "Apoderado",
      detail: "Apoderada de Sofía Méndez Flores (4to Sec)",
      dni: "41982301",
      phone: "987-654-321",
      studentName: "Sofía Méndez Flores",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "05/02/2026"
    },
    {
      id: "USR-013",
      code: "FAM-2026-044",
      username: "roberto.diaz",
      password: "padre2026",
      name: "Sr. Roberto Díaz",
      email: "roberto.diaz@gmail.com",
      role: "Apoderado",
      detail: "Apoderado de Carlos Benítez Díaz (4to Sec)",
      dni: "40891278",
      phone: "984-123-456",
      studentName: "Carlos Benítez Díaz",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "06/02/2026"
    },
    {
      id: "USR-014",
      code: "EST-2026-055",
      username: "salim.caceres",
      aliases: ["salim.caceres", "gael.caceres", "salim", "salim caceres", "gael caceres"],
      password: "estudiante2026",
      name: "Salim Gael Cáceres Quispe",
      email: "salim.caceres@eleducador.edu.pe",
      role: "Estudiante",
      detail: "5° de Primaria",
      gradeLevel: "5° de Primaria",
      grade: "5° de Primaria",
      gradeId: "5prim",
      dni: "76541298",
      guardian: "Sr. Juan Carlos Cáceres",
      tutor: "Miss Julisa Magali Arroyo Araujo",
      hasAdminPrivilege: false,
      status: "Activo",
      createdDate: "08/02/2026"
    }
  ],

  // Configuración de Pestañas y Espacios Visibles por Perfil (Editable por el Administrador)
  navigationTabsConfig: {
    auxiliar: [
      { id: "dashboard", label: "Inicio / Turno Auxiliar", icon: "dashboard", enabled: true },
      { id: "agenda-virtual", label: "📖 Agenda & Convivencia QR", badge: "AGENDA", icon: "agenda", enabled: true },
      { id: "asistencia", label: "Registro de Ingreso & QR", badge: "Portería", icon: "attendance", enabled: true },
      { id: "cuadernos-qr", label: "Lector de Cuadernos QR", badge: "CÁMARA", icon: "qr", enabled: true },
      { id: "comunicados", label: "Informes & Circulares", icon: "announcements", enabled: true }
    ],
    docente: [
      { id: "dashboard", label: "Inicio / Resumen", icon: "dashboard", enabled: true },
      { id: "agenda-virtual", label: "📖 Agenda Virtual & Anotaciones", badge: "AGENDA", icon: "agenda", enabled: true },
      { id: "cuadernos-qr", label: "Lector de Cuadernos QR", badge: "CÁMARA", icon: "qr", enabled: true },
      { id: "calificaciones", label: "Registro de Notas", badge: "Bimestral", icon: "grades", enabled: true },
      { id: "horarios", label: "Horario de Clases", icon: "schedule", enabled: true },
      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },
      { id: "tareas", label: "Aula Virtual / Quizzes", badge: "10P", icon: "virtual", enabled: true },
      { id: "asistencia", label: "Registro de Ingreso & QR", badge: "Puerta", icon: "attendance", enabled: true },
      { id: "comunicados", label: "Informes & Circulares", icon: "announcements", enabled: true },
      { id: "boleta", label: "Boleta Oficial MINEDU", badge: "2026", icon: "boleta", enabled: true }
    ],
    estudiante: [
      { id: "dashboard", label: "Inicio / Resumen", icon: "dashboard", enabled: true },
      { id: "agenda-virtual", label: "📖 Mi Agenda Virtual", badge: "NOTAS", icon: "agenda", enabled: true },
      { id: "horarios", label: "Horario de Clases", icon: "schedule", enabled: true },
      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },
      { id: "cuadernos-qr", label: "Control Cuadernos QR", icon: "qr", enabled: true },
      { id: "tareas", label: "Aula Virtual / Quizzes", badge: "10P", icon: "virtual", enabled: true },
      { id: "asistencia", label: "📅 Mi Asistencia & Fotocheck", icon: "attendance", enabled: true },
      { id: "comunicados", label: "Informes & Circulares", icon: "announcements", enabled: true }
    ],
    padre: [
      { id: "dashboard", label: "Inicio / Resumen", icon: "dashboard", enabled: true },
      { id: "agenda-virtual", label: "📖 Agenda Virtual Escolar", badge: "FIRMAS", icon: "agenda", enabled: true },
      { id: "horarios", label: "Horario de Clases", icon: "schedule", enabled: true },
      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },
      { id: "cuadernos-qr", label: "Informe Revisión Cuadernos", badge: "SELLOS QR", icon: "qr", enabled: true },
      { id: "tareas", label: "Aula Virtual", icon: "virtual", enabled: true },
      { id: "asistencia", label: "📅 Asistencia de mi Hijo(a)", icon: "attendance", enabled: true },
      { id: "comunicados", label: "Informes y Circulares", badge: "N°003", icon: "announcements", enabled: true },
      { id: "pagos", label: "Pensiones & Recaudación", badge: "S/ 480", icon: "payments", enabled: true }
    ],
    director: [
      { id: "dashboard", label: "Inicio / Resumen", icon: "dashboard", enabled: true },
      { id: "agenda-virtual", label: "📖 Agenda Virtual Institucional", badge: "AGENDA", icon: "agenda", enabled: true },
      { id: "database", label: "Base de Datos & DB", badge: "DB Online", icon: "database", enabled: true },
      { id: "usuarios-matriculas", label: "Gestión de Perfiles & Cuentas", badge: "PERFILES", icon: "users", enabled: true },
      { id: "cuadernos-qr", label: "Supervisión Cuadernos QR", badge: "CÁMARA", icon: "qr", enabled: true },
      { id: "calificaciones", label: "Auditoría de Calificaciones", badge: "Bimestral", icon: "grades", enabled: true },
      { id: "horarios", label: "Horarios Institucionales", icon: "schedule", enabled: true },
      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },
      { id: "tareas", label: "Aula Virtual", icon: "virtual", enabled: true },
      { id: "asistencia", label: "Registro de Ingreso & QR", badge: "En Vivo", icon: "attendance", enabled: true },
      { id: "comunicados", label: "Informes & Circulares", badge: "N°003", icon: "announcements", enabled: true },
      { id: "pagos", label: "Reportes Económicos & Caja", badge: "S/ 25,130", icon: "payments", enabled: true },
      { id: "boleta", label: "Boleta Oficial MINEDU", icon: "boleta", enabled: true }
    ]
  },

  // 3. Matrículas y Fichas Únicas de Matrícula (FUM - SIAGIE / UGEL 05)
  enrollments: [
    {
      id: "MATR-2026-001",
      studentCode: "EST-2026-042",
      studentName: "Sofía Méndez Flores",
      dni: "74891230",
      siagieCode: "2026-74891230",
      birthDate: "14/05/2010",
      gender: "Femenino",
      address: "Av. Próceres de la Independencia 1420",
      district: "San Juan de Lurigancho",
      bloodType: "O+",
      insurance: "EsSalud (Activo)",
      allergies: "Ninguna conocida / Sin alergias",
      medicalCondition: "Ninguna (Apta para actividad física y talleres)",
      emergencyContact: "Sr. Carlos Méndez (Padre)",
      emergencyPhone: "984-555-123",
      level: "Secundaria",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      guardian: "Dra. Carmen Méndez",
      guardianDni: "41982301",
      guardianPhone: "987-654-321",
      guardianEmail: "carmen.mendez@gmail.com",
      enrollmentDate: "15/02/2026",
      feeStatus: "Pagado (S/ 520.00)",
      status: "Matriculado (FUM Completa)",
      certificateNo: "CONST-MAT-2026-042",
      documents: {
        dniStudent: true,
        dniParent: true,
        birthCertificate: true,
        siagieFUM: true,
        reportCard: true,
        vaccinationCard: true
      }
    },
    {
      id: "MATR-2026-002",
      studentCode: "EST-2026-011",
      studentName: "Carlos Benítez Díaz",
      dni: "75129034",
      siagieCode: "2026-75129034",
      birthDate: "20/09/2010",
      gender: "Masculino",
      address: "Jr. Las Flores 340, Urb. Zárate",
      district: "San Juan de Lurigancho",
      bloodType: "A+",
      insurance: "SIS Escolar",
      allergies: "Alergia a la Penicilina",
      medicalCondition: "Ninguna (Apto para deportes)",
      emergencyContact: "Sra. Rosa Díaz (Tía)",
      emergencyPhone: "981-234-567",
      level: "Secundaria",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      guardian: "Sr. Roberto Díaz",
      guardianDni: "40891278",
      guardianPhone: "984-123-456",
      guardianEmail: "roberto.diaz@gmail.com",
      enrollmentDate: "06/02/2026",
      feeStatus: "Pagado (S/ 520.00)",
      status: "Matriculado",
      certificateNo: "CONST-MAT-2026-011",
      documents: {
        dniStudent: true,
        dniParent: true,
        birthCertificate: true,
        siagieFUM: true,
        reportCard: true,
        vaccinationCard: true
      }
    },
    {
      id: "MATR-2026-003",
      studentCode: "EST-2026-055",
      studentName: "Gael Alessandro Cáceres Ramos",
      dni: "76541298",
      siagieCode: "2026-76541298",
      birthDate: "11/07/2010",
      gender: "Masculino",
      address: "Av. Las Flores de Primavera 1120",
      district: "San Juan de Lurigancho",
      bloodType: "O+",
      insurance: "EsSalud (Activo)",
      allergies: "Sin alergias",
      medicalCondition: "Ninguna (Apto)",
      emergencyContact: "Sr. Juan Carlos Cáceres (Padre)",
      emergencyPhone: "984-777-888",
      level: "Secundaria",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      guardian: "Sr. Juan Carlos Cáceres",
      guardianDni: "41298374",
      guardianPhone: "984-777-888",
      guardianEmail: "juan.caceres@gmail.com",
      enrollmentDate: "08/02/2026",
      feeStatus: "Pagado (S/ 520.00)",
      status: "Matriculado (FUM Completa)",
      certificateNo: "CONST-MAT-2026-055",
      documents: {
        dniStudent: true,
        dniParent: true,
        birthCertificate: true,
        siagieFUM: true,
        reportCard: true,
        vaccinationCard: true
      }
    },
    {
      id: "MATR-2026-004",
      studentCode: "EST-2026-089",
      studentName: "Marina del Carmen Albújar Zegarra",
      dni: "75849301",
      siagieCode: "2026-75849301",
      birthDate: "12/03/2012",
      gender: "Femenino",
      address: "Av. Canto Grande 890",
      district: "San Juan de Lurigancho",
      bloodType: "O+",
      insurance: "EsSalud",
      allergies: "Sin alergias",
      medicalCondition: "Ninguna",
      emergencyContact: "Sr. Jorge Albújar (Padre)",
      emergencyPhone: "978-901-234",
      level: "Secundaria",
      grade: "2° de Secundaria",
      gradeId: "2sec",
      guardian: "Sra. Carmen Zegarra",
      guardianDni: "42109845",
      guardianPhone: "978-901-234",
      guardianEmail: "carmen.zegarra@gmail.com",
      enrollmentDate: "10/02/2026",
      feeStatus: "Pagado (S/ 520.00)",
      status: "Matriculado",
      certificateNo: "CONST-MAT-2026-089",
      documents: {
        dniStudent: true,
        dniParent: true,
        birthCertificate: true,
        siagieFUM: true,
        reportCard: true,
        vaccinationCard: true
      }
    },
    {
      id: "MATR-2026-004",
      studentCode: "EST-2026-PEND-01",
      studentName: "Brini Yuneyli Pocomo Oropeza",
      dni: "79234102",
      siagieCode: "2026-PEND-003",
      birthDate: "18/11/2020",
      gender: "Femenino",
      address: "Calle Los Cedros Mz. B Lote 4",
      district: "San Juan de Lurigancho",
      bloodType: "O+",
      insurance: "SIS",
      allergies: "Sin alergias",
      medicalCondition: "En observación pediátrica de rutina",
      emergencyContact: "Sra. Teresa Oropeza",
      emergencyPhone: "965-432-109",
      level: "Inicial",
      grade: "Inicial 5 años",
      gradeId: "ini5",
      guardian: "Sra. Teresa Oropeza",
      guardianDni: "45091283",
      guardianPhone: "965-432-109",
      guardianEmail: "teresa.oropeza@gmail.com",
      enrollmentDate: "15/08/2026",
      feeStatus: "Al Día",
      status: "Pendiente Documentación (Partida de Nacimiento)",
      certificateNo: "PEND-DOC-003/ED",
      documents: {
        dniStudent: true,
        dniParent: true,
        birthCertificate: false,
        siagieFUM: true,
        reportCard: false,
        vaccinationCard: true
      }
    },
    {
      id: "MATR-2026-005",
      studentCode: "EX-EST-2025-089",
      studentName: "Evelin Estefanía Díaz Chirre",
      dni: "71290384",
      siagieCode: "2025-71290384",
      birthDate: "05/04/2008",
      gender: "Femenino",
      address: "Av. Gran Chimú 650",
      district: "San Juan de Lurigancho",
      bloodType: "B+",
      insurance: "Particular (Rímac)",
      allergies: "Sin alergias",
      medicalCondition: "Ninguna",
      emergencyContact: "Familia Díaz Chirre",
      emergencyPhone: "991-234-876",
      level: "Secundaria (Egresada)",
      grade: "Certificado de Estudios",
      gradeId: "5sec",
      guardian: "Familia Díaz Chirre",
      guardianDni: "40192834",
      guardianPhone: "991-234-876",
      guardianEmail: "diaz.chirre@gmail.com",
      enrollmentDate: "15/08/2026",
      feeStatus: "Pagado Trámite",
      status: "En Observación UGEL 05 (Consulta en curso)",
      certificateNo: "CERT-UGEL05-RECH-2",
      documents: {
        dniStudent: true,
        dniParent: true,
        birthCertificate: true,
        siagieFUM: true,
        reportCard: true,
        vaccinationCard: true
      }
    }
  ],

  // 4. Asignaturas con Calificaciones Oficiales
  courses: [
    {
      id: "MAT-401",
      code: "MAT-401",
      name: "Matemática Avanzada",
      teacher: "Prof. Roberto Silva",
      credits: 5,
      b1: 18,
      b2: 19,
      b3: 19,
      b4: 0,
      finalGrade: 18.7,
      status: "Aprobado",
      colorTag: "yellow",
      qrCode: "QR-CUAD-4SECA-EST042-MAT"
    },
    {
      id: "COM-402",
      code: "COM-402",
      name: "Comunicación & Literatura",
      teacher: "Miss María Daysi Reyes Milla",
      credits: 4,
      b1: 17,
      b2: 18,
      b3: 18,
      b4: 0,
      finalGrade: 17.7,
      status: "Aprobado",
      colorTag: "navy",
      qrCode: "QR-CUAD-4SECA-EST042-COM"
    },
    {
      id: "CTA-403",
      code: "CTA-403",
      name: "Ciencias & Tecnología",
      teacher: "Miss Leyli Graciela Reyes Cerquen",
      credits: 4,
      b1: 19,
      b2: 18,
      b3: 20,
      b4: 0,
      finalGrade: 19.0,
      status: "Aprobado",
      colorTag: "yellow",
      qrCode: "QR-CUAD-4SECA-EST042-CTA"
    },
    {
      id: "PRI-404",
      code: "PRI-404",
      name: "Personal Social & Formación Ciudadana",
      teacher: "Miss Julisa Magali Arroyo Araujo",
      credits: 3,
      b1: 18,
      b2: 18,
      b3: 19,
      b4: 0,
      finalGrade: 18.3,
      status: "Aprobado",
      colorTag: "navy",
      qrCode: "QR-CUAD-4SECA-EST042-HIS"
    },
    {
      id: "ING-405",
      code: "ING-405",
      name: "Inglés Institucional (Nivel B2/C1)",
      teacher: "Prof. Alex Lino",
      credits: 3,
      b1: 19,
      b2: 20,
      b3: 19,
      b4: 0,
      finalGrade: 19.3,
      status: "Aprobado",
      colorTag: "yellow",
      qrCode: "QR-CUAD-4SECA-EST042-ING"
    }
  ],

  // Registro Oficial Dinámico de Notas para Emisión de Boletas MINEDU
  boletaData: {
    albujar: {
      id: "EST-2026-089",
      name: "ALBUJAR ZEGARRA, MARINA DEL CARMEN",
      dni: "75849301",
      grade: "2°",
      gradeLevel: "2° de Secundaria",
      level: "SECUNDARIA",
      section: "",
      tutor: "Caceres Sutta Juan Carlos",
      grades: {
        lenguaje: { b1: "A", b2: "A", b3: "", b4: "" },
        literatura: { b1: "A", b2: "A", b3: "", b4: "" },
        raz_verbal: { b1: "A", b2: "A", b3: "", b4: "" },
        aritmetica: { b1: "A", b2: "A", b3: "", b4: "" },
        algebra: { b1: "A", b2: "B", b3: "", b4: "" },
        geometria: { b1: "A", b2: "A", b3: "", b4: "" },
        trigonometria: { b1: "A", b2: "A", b3: "", b4: "" },
        raz_matematico: { b1: "A", b2: "A", b3: "", b4: "" },
        biologia: { b1: "A", b2: "A", b3: "", b4: "" },
        fisica: { b1: "A", b2: "A", b3: "", b4: "" },
        quimica: { b1: "A", b2: "B", b3: "", b4: "" },
        geografia: { b1: "A", b2: "A", b3: "", b4: "" },
        filosofia: { b1: "A", b2: "", b3: "", b4: "" },
        historia_peru: { b1: "A", b2: "A", b3: "", b4: "" },
        historia_universal: { b1: "A", b2: "A", b3: "", b4: "" },
        civica: { b1: "A", b2: "A", b3: "", b4: "" },
        psicologia: { b1: "A", b2: "A", b3: "", b4: "" },
        computacion: { b1: "A", b2: "A", b3: "", b4: "" },
        gestion_empresarial: { b1: "A", b2: "A", b3: "", b4: "" },
        arte_cultura: { b1: "", b2: "", b3: "", b4: "" },
        religion: { b1: "A", b2: "A", b3: "", b4: "" },
        educ_fisica: { b1: "A", b2: "A", b3: "", b4: "" },
        ingles: { b1: "A", b2: "A", b3: "", b4: "" },
        conducta: { b1: "A", b2: "A", b3: "", b4: "" }
      },
      attendance: {
        b1: { inasist_just: "-", inasist_injust: "-", tard_just: "-", tard_injust: "-" },
        b2: { inasist_just: "-", inasist_injust: "-", tard_just: "-", tard_injust: "-" },
        b3: { inasist_just: "", inasist_injust: "", tard_just: "", tard_injust: "" },
        b4: { inasist_just: "", inasist_injust: "", tard_just: "", tard_injust: "" }
      },
      appreciations: {
        b1: "Felicitaciones a ALBUJAR ZEGARRA, MARINA DEL CARMEN por su excelente rendimiento. Demuestra responsabilidad, participación activa y compromiso con su aprendizaje. Sus trabajos son de gran calidad y siempre está dispuesta a colaborar. Recomendación: Sigue así y anímate a asumir nuevos retos.",
        b2: "Has realizado un trabajo muy bueno durante este segundo bimestre. Cumples con responsabilidad tus actividades dentro de la clase y gestionas muy bien tu tiempo de trabajo. Te animo a participar un poco más de manera activa para seguir potenciando tus ideas.",
        b3: "",
        b4: ""
      },
      parentCriteria: {
        c1: { b1: "A", b2: "", b3: "", b4: "" },
        c2: { b1: "", b2: "", b3: "", b4: "" },
        c3: { b1: "A", b2: "", b3: "", b4: "" },
        c4: { b1: "A", b2: "", b3: "", b4: "" },
        c5: { b1: "", b2: "", b3: "", b4: "" },
        c6: { b1: "", b2: "", b3: "", b4: "" }
      }
    },
    mendez: {
      id: "EST-2026-042",
      name: "MÉNDEZ FLORES, SOFÍA",
      dni: "74891230",
      grade: "4°",
      gradeLevel: "4to de Secundaria",
      level: "SECUNDARIA",
      section: "",
      tutor: "Prof. Roberto Silva",
      grades: {
        lenguaje: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        literatura: { b1: "A", b2: "AD", b3: "A", b4: "" },
        raz_verbal: { b1: "AD", b2: "A", b3: "AD", b4: "" },
        aritmetica: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        algebra: { b1: "A", b2: "A", b3: "AD", b4: "" },
        geometria: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        trigonometria: { b1: "A", b2: "AD", b3: "AD", b4: "" },
        raz_matematico: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        biologia: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        fisica: { b1: "A", b2: "A", b3: "AD", b4: "" },
        quimica: { b1: "AD", b2: "A", b3: "AD", b4: "" },
        geografia: { b1: "A", b2: "AD", b3: "A", b4: "" },
        filosofia: { b1: "A", b2: "A", b3: "AD", b4: "" },
        historia_peru: { b1: "AD", b2: "A", b3: "AD", b4: "" },
        historia_universal: { b1: "A", b2: "AD", b3: "AD", b4: "" },
        civica: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        psicologia: { b1: "A", b2: "A", b3: "AD", b4: "" },
        computacion: { b1: "A", b2: "B", b3: "A", b4: "" },
        gestion_empresarial: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        arte_cultura: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        religion: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        educ_fisica: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        ingles: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        conducta: { b1: "AD", b2: "AD", b3: "AD", b4: "" }
      },
      attendance: {
        b1: { inasist_just: "0", inasist_injust: "0", tard_just: "0", tard_injust: "0" },
        b2: { inasist_just: "0", inasist_injust: "0", tard_just: "0", tard_injust: "0" },
        b3: { inasist_just: "0", inasist_injust: "0", tard_just: "0", tard_injust: "0" },
        b4: { inasist_just: "", inasist_injust: "", tard_just: "", tard_injust: "" }
      },
      appreciations: {
        b1: "Sofía demuestra un excelente compromiso académico y un liderazgo intachable en el aula de 4to Sec. 'A'. ¡Felicitaciones por tus logros!",
        b2: "Mantiene una alta dedicación y pulcritud en todos los cursos. Sus aportes en el área de matemáticas y ciencias son sobresalientes.",
        b3: "Excelente desempeño en el tercer bimestre. Continúa demostrando autonomía y proactividad.",
        b4: ""
      },
      parentCriteria: {
        c1: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        c2: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        c3: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        c4: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        c5: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        c6: { b1: "AD", b2: "AD", b3: "AD", b4: "" }
      }
    },
    benitez: {
      id: "EST-2026-011",
      name: "BENÍTEZ RUIZ, CARLOS",
      dni: "74891255",
      grade: "4°",
      gradeLevel: "4to de Secundaria",
      level: "SECUNDARIA",
      section: "",
      tutor: "Prof. Roberto Silva",
      grades: {
        lenguaje: { b1: "A", b2: "B", b3: "A", b4: "" },
        literatura: { b1: "B", b2: "A", b3: "A", b4: "" },
        raz_verbal: { b1: "A", b2: "A", b3: "B", b4: "" },
        aritmetica: { b1: "A", b2: "A", b3: "A", b4: "" },
        algebra: { b1: "B", b2: "B", b3: "A", b4: "" },
        geometria: { b1: "A", b2: "A", b3: "A", b4: "" },
        trigonometria: { b1: "B", b2: "A", b3: "A", b4: "" },
        raz_matematico: { b1: "A", b2: "A", b3: "A", b4: "" },
        biologia: { b1: "A", b2: "A", b3: "A", b4: "" },
        fisica: { b1: "B", b2: "A", b3: "B", b4: "" },
        quimica: { b1: "A", b2: "B", b3: "A", b4: "" },
        geografia: { b1: "A", b2: "A", b3: "A", b4: "" },
        filosofia: { b1: "A", b2: "B", b3: "A", b4: "" },
        historia_peru: { b1: "A", b2: "A", b3: "A", b4: "" },
        historia_universal: { b1: "B", b2: "A", b3: "A", b4: "" },
        civica: { b1: "A", b2: "A", b3: "A", b4: "" },
        psicologia: { b1: "A", b2: "A", b3: "A", b4: "" },
        computacion: { b1: "A", b2: "A", b3: "A", b4: "" },
        gestion_empresarial: { b1: "A", b2: "A", b3: "A", b4: "" },
        arte_cultura: { b1: "A", b2: "A", b3: "A", b4: "" },
        religion: { b1: "A", b2: "A", b3: "A", b4: "" },
        educ_fisica: { b1: "AD", b2: "AD", b3: "AD", b4: "" },
        ingles: { b1: "A", b2: "B", b3: "A", b4: "" },
        conducta: { b1: "A", b2: "A", b3: "A", b4: "" }
      },
      attendance: {
        b1: { inasist_just: "1", inasist_injust: "0", tard_just: "2", tard_injust: "0" },
        b2: { inasist_just: "0", inasist_injust: "0", tard_just: "1", tard_injust: "0" },
        b3: { inasist_just: "0", inasist_injust: "0", tard_just: "0", tard_injust: "0" },
        b4: { inasist_just: "", inasist_injust: "", tard_just: "", tard_injust: "" }
      },
      appreciations: {
        b1: "Carlos ha mostrado buena disposición para el trabajo en equipo. Se recomienda reforzar el repaso constante en álgebra y física.",
        b2: "Se aprecia una notable mejoría en su puntualidad y presentación de trabajos. Buen progreso durante este bimestre.",
        b3: "Consolida sus aprendizajes con constancia y participación activa.",
        b4: ""
      },
      parentCriteria: {
        c1: { b1: "A", b2: "A", b3: "A", b4: "" },
        c2: { b1: "A", b2: "A", b3: "A", b4: "" },
        c3: { b1: "A", b2: "A", b3: "A", b4: "" },
        c4: { b1: "A", b2: "A", b3: "A", b4: "" },
        c5: { b1: "A", b2: "A", b3: "A", b4: "" },
        c6: { b1: "A", b2: "A", b3: "A", b4: "" }
      }
    }
  },

  studentListDocente: [
    { "id": "EST-042", "studentKey": "mendez", "name": "Sofía Méndez", "grade": 19, "attendance": "100%", "status": "Destacado", "notebookStatus": "Al Día (20)" },
    { "id": "EST-011", "studentKey": "benitez", "name": "Carlos Benítez", "grade": 15, "attendance": "94%", "status": "Regular", "notebookStatus": "Incompleto (13)" },
    { "id": "EST-089", "studentKey": "albujar", "name": "Marina Albujar", "grade": 18, "attendance": "100%", "status": "Destacado", "notebookStatus": "Al Día (19)" }
  ],

  tasks: [
    {
      id: "TSK-101",
      title: "Ensayo Histórico: Identidad Institucional y Sociedad",
      course: "Personal Social",
      teacher: "Miss Julisa Arroyo",
      dueDate: "Mañana a las 23:59",
      priority: "urgent",
      priorityLabel: "Vence Pronto",
      status: "pending",
      description: "Elaborar un informe sobre los 21 años de trayectoria institucional dejando huellas en la comunidad de S.J.L.",
      submission: null
    },
    {
      id: "TSK-102",
      title: "Taller Práctico: Ecuaciones Cuadráticas Complejas",
      course: "Matemática Avanzada",
      teacher: "Prof. Roberto Silva",
      dueDate: "Viernes 22 de Agosto",
      priority: "medium",
      priorityLabel: "Esta Semana",
      status: "pending",
      description: "Resolver los ejercicios 1 al 15 del libro de trabajo.",
      submission: null
    }
  ],

  // Configuración de Estructura Académica (Editable desde el Perfil Administrador)
  academicConfig: {
    hasSections: false, // El colegio no tiene secciones, solo mantiene grados (editable por Admin)
    defaultSectionLabel: "Única"
  },

  // Catálogo Oficial de Grados del Colegio (Editable por el Administrador)
  gradesCatalog: [
    // INICIAL
    { id: "ini-3", label: "Inicial 3 Años", level: "Inicial", section: "", classroom: "Pabellón Inicial - Aula 01", tutor: "Miss Patricia Díaz" },
    { id: "ini-4", label: "Inicial 4 Años", level: "Inicial", section: "", classroom: "Pabellón Inicial - Aula 02", tutor: "Miss Carmen Flores" },
    { id: "ini-5", label: "Inicial 5 Años", level: "Inicial", section: "", classroom: "Pabellón Inicial - Aula 03", tutor: "Miss Maritza" },
    
    // PRIMARIA
    { id: "1prim", label: "1° de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 101", tutor: "Miss Julisa Arroyo" },
    { id: "2prim", label: "2° de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 102", tutor: "Miss Elena Suárez" },
    { id: "3prim", label: "3° de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 103", tutor: "Miss María Daysi Reyes" },
    { id: "4prim", label: "4° de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 201", tutor: "Prof. César Palacios" },
    { id: "5prim", label: "5° de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 202", tutor: "Prof. Miguel Ramos" },
    { id: "6prim", label: "6° de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 203", tutor: "Miss Leyli Reyes Cerquen" },

    // SECUNDARIA
    { id: "1sec", label: "1° de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 301", tutor: "Prof. Alex Lino" },
    { id: "2sec", label: "2° de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 302", tutor: "Prof. Juan Carlos Cáceres" },
    { id: "3sec", label: "3° de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 303", tutor: "Prof. Javier Vega" },
    { id: "4sec", label: "4° de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 304", tutor: "Prof. Roberto Silva" },
    { id: "5sec", label: "5° de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 305", tutor: "Miss Andrea Ramos" }
  ],

  // Catálogo de Docentes y Horarios por Asignatura (Docentes de Curso sin Tutoría / con Tutoría)
  teachersList: [
    {
      id: "DOC-2026-COMP",
      name: "Prof. Fernando Rojas",
      subject: "Computación e Informática / Robótica",
      department: "Área de Educación para el Trabajo (EPT)",
      isTutor: false,
      tutoringGrade: null,
      weeklyHours: 26,
      assignedGrades: ["1° Sec", "2° Sec", "3° Sec", "4° Sec", "5° Sec"],
      classrooms: ["Laboratorio de Cómputo 01", "Taller de Robótica"],
      courses: ["Computación", "Robótica Educativa", "Diseño Digital"],
      schedule: [
        {
          time: "08:00 - 08:50",
          mon: { course: "Computación", grade: "1° Sec", room: "Lab. Cómputo 1", color: "navy" },
          tue: { course: "Computación", grade: "3° Sec", room: "Lab. Cómputo 1", color: "navy" },
          wed: { course: "Robótica Educativa", grade: "5° Sec", room: "Taller Robótica", color: "yellow" },
          thu: { course: "Computación", grade: "2° Sec", room: "Lab. Cómputo 1", color: "navy" },
          fri: { course: "Diseño Digital", grade: "4° Sec", room: "Lab. Cómputo 1", color: "yellow" }
        },
        {
          time: "08:50 - 09:40",
          mon: { course: "Computación", grade: "1° Sec", room: "Lab. Cómputo 1", color: "navy" },
          tue: { course: "Computación", grade: "3° Sec", room: "Lab. Cómputo 1", color: "navy" },
          wed: { course: "Robótica Educativa", grade: "5° Sec", room: "Taller Robótica", color: "yellow" },
          thu: { course: "Computación", grade: "2° Sec", room: "Lab. Cómputo 1", color: "navy" },
          fri: { course: "Diseño Digital", grade: "4° Sec", room: "Lab. Cómputo 1", color: "yellow" }
        },
        {
          time: "09:40 - 10:30",
          mon: { course: "Computación", grade: "4° Sec", room: "Lab. Cómputo 1", color: "navy" },
          tue: { course: "Diseño Digital", grade: "2° Sec", room: "Lab. Cómputo 1", color: "yellow" },
          wed: { course: "Computación", grade: "1° Sec", room: "Lab. Cómputo 1", color: "navy" },
          thu: { course: "Robótica Educativa", grade: "3° Sec", room: "Taller Robótica", color: "yellow" },
          fri: { course: "Computación", grade: "5° Sec", room: "Lab. Cómputo 1", color: "navy" }
        },
        {
          time: "10:30 - 10:50",
          isBreak: true,
          isLunch: false,
          title: "RECESO PEDAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"
        },
        {
          time: "10:50 - 11:40",
          mon: { course: "Computación", grade: "4° Sec", room: "Lab. Cómputo 1", color: "navy" },
          tue: { course: "Diseño Digital", grade: "2° Sec", room: "Lab. Cómputo 1", color: "yellow" },
          wed: { course: "Computación", grade: "1° Sec", room: "Lab. Cómputo 1", color: "navy" },
          thu: { course: "Robótica Educativa", grade: "3° Sec", room: "Taller Robótica", color: "yellow" },
          fri: { course: "Computación", grade: "5° Sec", room: "Lab. Cómputo 1", color: "navy" }
        },
        {
          time: "11:40 - 12:30",
          mon: { course: "Robótica Educativa", grade: "2° Sec", room: "Taller Robótica", color: "yellow" },
          tue: { course: "Asesoría Pedagógica", grade: "Secundaria", room: "Sala Docentes", color: "green" },
          wed: { course: "Computación", grade: "3° Sec", room: "Lab. Cómputo 1", color: "navy" },
          thu: { course: "Computación", grade: "4° Sec", room: "Lab. Cómputo 1", color: "navy" },
          fri: { course: "Preparación de Material", grade: "Secundaria", room: "Lab. Cómputo 1", color: "green" }
        },
        {
          time: "12:30 - 01:20 PM",
          mon: { course: "Robótica Educativa", grade: "2° Sec", room: "Taller Robótica", color: "yellow" },
          tue: { course: "Diseño Digital", grade: "5° Sec", room: "Lab. Cómputo 1", color: "yellow" },
          wed: { course: "Computación", grade: "3° Sec", room: "Lab. Cómputo 1", color: "navy" },
          thu: { course: "Computación", grade: "4° Sec", room: "Lab. Cómputo 1", color: "navy" },
          fri: { course: "Reunión de Área / EPT", grade: "General", room: "Sala Docentes", color: "green" }
        },
        {
          time: "01:20 - 01:50 PM",
          isBreak: true,
          isLunch: true,
          title: "HORA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"
        },
        {
          time: "01:50 - 02:40 PM",
          mon: { course: "Taller de Robótica Avanzada", grade: "4° Sec", room: "Taller Robótica", color: "yellow" },
          tue: { course: "Soporte y Mantenimiento TI", grade: "Institucional", room: "Lab. Cómputo 1", color: "green" },
          wed: { course: "Taller de Programación", grade: "5° Sec", room: "Lab. Cómputo 1", color: "navy" },
          thu: { course: "Diseño Web Escolar", grade: "3° Sec", room: "Lab. Cómputo 1", color: "yellow" },
          fri: { course: "Taller de Robótica Avanzada", grade: "4° Sec", room: "Taller Robótica", color: "yellow" }
        },
        {
          time: "02:40 - 03:30 PM",
          mon: { course: "Taller de Robótica Avanzada", grade: "4° Sec", room: "Taller Robótica", color: "yellow" },
          tue: { course: "Club de Ciencias y Tecnología", grade: "General", room: "Lab. Cómputo 1", color: "green" },
          wed: { course: "Taller de Programación", grade: "5° Sec", room: "Lab. Cómputo 1", color: "navy" },
          thu: { course: "Diseño Web Escolar", grade: "3° Sec", room: "Lab. Cómputo 1", color: "yellow" },
          fri: { course: "Atención a Familias / Tutoría", grade: "Secundaria", room: "Sala Docentes", color: "green" }
        }
      ]
    },
    {
      id: "DOC-2026-015",
      name: "Prof. Roberto Silva",
      subject: "Matemáticas (Álgebra, Geometría y Raz. Matemático)",
      department: "Área de Matemática",
      isTutor: false,
      tutoringGrade: null,
      weeklyHours: 28,
      assignedGrades: ["2° Sec", "3° Sec", "4° Sec", "5° Sec"],
      classrooms: ["Aula 201", "Aula 301", "Aula 302"],
      courses: ["Álgebra", "Geometría", "Razonamiento Matemático", "Trigonometría"],
      schedule: [
        {
          time: "08:00 - 08:50",
          mon: { course: "Álgebra", grade: "4° Sec", room: "Aula 301", color: "yellow" },
          tue: { course: "Geometría", grade: "3° Sec", room: "Aula 201", color: "navy" },
          wed: { course: "Raz. Matemático", grade: "2° Sec", room: "Aula 102", color: "yellow" },
          thu: { course: "Álgebra", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          fri: { course: "Trigonometría", grade: "4° Sec", room: "Aula 301", color: "navy" }
        },
        {
          time: "08:50 - 09:40",
          mon: { course: "Álgebra", grade: "4° Sec", room: "Aula 301", color: "yellow" },
          tue: { course: "Geometría", grade: "3° Sec", room: "Aula 201", color: "navy" },
          wed: { course: "Raz. Matemático", grade: "2° Sec", room: "Aula 102", color: "yellow" },
          thu: { course: "Álgebra", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          fri: { course: "Trigonometría", grade: "4° Sec", room: "Aula 301", color: "navy" }
        },
        {
          time: "09:40 - 10:30",
          mon: { course: "Geometría", grade: "2° Sec", room: "Aula 102", color: "navy" },
          tue: { course: "Álgebra", grade: "4° Sec", room: "Aula 301", color: "yellow" },
          wed: { course: "Trigonometría", grade: "5° Sec", room: "Aula 302", color: "navy" },
          thu: { course: "Raz. Matemático", grade: "3° Sec", room: "Aula 201", color: "yellow" },
          fri: { course: "Álgebra", grade: "2° Sec", room: "Aula 102", color: "yellow" }
        },
        {
          time: "10:30 - 10:50",
          isBreak: true,
          isLunch: false,
          title: "RECESO PEDAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"
        },
        {
          time: "10:50 - 11:40",
          mon: { course: "Geometría", grade: "2° Sec", room: "Aula 102", color: "navy" },
          tue: { course: "Álgebra", grade: "4° Sec", room: "Aula 301", color: "yellow" },
          wed: { course: "Trigonometría", grade: "5° Sec", room: "Aula 302", color: "navy" },
          thu: { course: "Raz. Matemático", grade: "3° Sec", room: "Aula 201", color: "yellow" },
          fri: { course: "Álgebra", grade: "2° Sec", room: "Aula 102", color: "yellow" }
        },
        {
          time: "11:40 - 12:30",
          mon: { course: "Raz. Matemático", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          tue: { course: "Atención a Padres (Colegiado)", grade: "Secundaria", room: "Sala Docentes", color: "green" },
          wed: { course: "Álgebra", grade: "3° Sec", room: "Aula 201", color: "yellow" },
          thu: { course: "Geometría", grade: "4° Sec", room: "Aula 301", color: "navy" },
          fri: { course: "Reunión de Área Matemática", grade: "Colegiado", room: "Sala Docentes", color: "green" }
        },
        {
          time: "12:30 - 01:20 PM",
          mon: { course: "Raz. Matemático", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          tue: { course: "Álgebra Avanzada", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          wed: { course: "Geometría del Espacio", grade: "4° Sec", room: "Aula 301", color: "navy" },
          thu: { course: "Trigonometría Analítica", grade: "5° Sec", room: "Aula 302", color: "navy" },
          fri: { course: "Preparación de Evaluaciones", grade: "General", room: "Sala Docentes", color: "green" }
        },
        {
          time: "01:20 - 01:50 PM",
          isBreak: true,
          isLunch: true,
          title: "HORA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"
        },
        {
          time: "01:50 - 02:40 PM",
          mon: { course: "Círculo Matemático Olímpico", grade: "4° Sec", room: "Aula 301", color: "yellow" },
          tue: { course: "Refuerzo y Nivelación Académica", grade: "3° Sec", room: "Aula 201", color: "navy" },
          wed: { course: "Círculo Matemático Olímpico", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          thu: { course: "Taller de Geometría Descriptiva", grade: "4° Sec", room: "Aula 301", color: "navy" },
          fri: { course: "Asesoría Preuniversitaria", grade: "5° Sec", room: "Aula 302", color: "yellow" }
        },
        {
          time: "02:40 - 03:30 PM",
          mon: { course: "Círculo Matemático Olímpico", grade: "4° Sec", room: "Aula 301", color: "yellow" },
          tue: { course: "Refuerzo y Nivelación Académica", grade: "3° Sec", room: "Aula 201", color: "navy" },
          wed: { course: "Círculo Matemático Olímpico", grade: "5° Sec", room: "Aula 302", color: "yellow" },
          thu: { course: "Taller de Geometría Descriptiva", grade: "4° Sec", room: "Aula 301", color: "navy" },
          fri: { course: "Asesoría Preuniversitaria", grade: "5° Sec", room: "Aula 302", color: "yellow" }
        }
      ]
    },
    {
      id: "DOC-2026-FIS",
      name: "Miss Leyli Reyes Cerquen",
      subject: "Ciencia y Tecnología (Física, Química y Biología)",
      department: "Área de Ciencias",
      isTutor: false,
      tutoringGrade: null,
      weeklyHours: 26,
      assignedGrades: ["2° Sec", "3° Sec", "4° Sec", "5° Sec"],
      classrooms: ["Laboratorio de Ciencias 01", "Aula 301"],
      courses: ["Física", "Química", "Biología"],
      schedule: [
        {
          time: "08:00 - 08:50",
          mon: { course: "Física Elemental", grade: "3° Sec", room: "Lab. Ciencias", color: "yellow" },
          tue: { course: "Química Orgánica", grade: "5° Sec", room: "Lab. Ciencias", color: "navy" },
          wed: { course: "Física Avanzada", grade: "4° Sec", room: "Lab. Ciencias", color: "yellow" },
          thu: { course: "Biología", grade: "2° Sec", room: "Lab. Ciencias", color: "green" },
          fri: { course: "Prácticas de Laboratorio", grade: "4° Sec", room: "Lab. Ciencias", color: "yellow" }
        },
        {
          time: "08:50 - 09:40",
          mon: { course: "Física Elemental", grade: "3° Sec", room: "Lab. Ciencias", color: "yellow" },
          tue: { course: "Química Orgánica", grade: "5° Sec", room: "Lab. Ciencias", color: "navy" },
          wed: { course: "Física Avanzada", grade: "4° Sec", room: "Lab. Ciencias", color: "yellow" },
          thu: { course: "Biología", grade: "2° Sec", room: "Lab. Ciencias", color: "green" },
          fri: { course: "Prácticas de Laboratorio", grade: "4° Sec", room: "Lab. Ciencias", color: "yellow" }
        },
        {
          time: "09:40 - 10:30",
          mon: { course: "Biología y Ecología", grade: "4° Sec", room: "Aula 301", color: "green" },
          tue: { course: "Física Elemental", grade: "2° Sec", room: "Lab. Ciencias", color: "yellow" },
          wed: { course: "Química General", grade: "3° Sec", room: "Lab. Ciencias", color: "navy" },
          thu: { course: "Física Moderna", grade: "5° Sec", room: "Lab. Ciencias", color: "yellow" },
          fri: { course: "Mantenimiento de Reactivos", grade: "Ciencias", room: "Lab. Ciencias", color: "green" }
        },
        {
          time: "10:30 - 10:50",
          isBreak: true,
          isLunch: false,
          title: "RECESO PEDAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"
        },
        {
          time: "10:50 - 11:40",
          mon: { course: "Biología y Ecología", grade: "4° Sec", room: "Aula 301", color: "green" },
          tue: { course: "Física Elemental", grade: "2° Sec", room: "Lab. Ciencias", color: "yellow" },
          wed: { course: "Química General", grade: "3° Sec", room: "Lab. Ciencias", color: "navy" },
          thu: { course: "Física Moderna", grade: "5° Sec", room: "Lab. Ciencias", color: "yellow" },
          fri: { course: "Mantenimiento de Reactivos", grade: "Ciencias", room: "Lab. Ciencias", color: "green" }
        },
        {
          time: "11:40 - 12:30",
          mon: { course: "Química Experimental", grade: "4° Sec", room: "Lab. Ciencias", color: "navy" },
          tue: { course: "Atención a Familias (Ciencias)", grade: "Secundaria", room: "Sala Docentes", color: "green" },
          wed: { course: "Biología Celular", grade: "3° Sec", room: "Lab. Ciencias", color: "green" },
          thu: { course: "Química General", grade: "2° Sec", room: "Lab. Ciencias", color: "navy" },
          fri: { course: "Reunión de Área de Ciencias", grade: "Colegiado", room: "Sala Docentes", color: "green" }
        },
        {
          time: "12:30 - 01:20 PM",
          mon: { course: "Química Experimental", grade: "4° Sec", room: "Lab. Ciencias", color: "navy" },
          tue: { course: "Prácticas de Microscopía", grade: "4° Sec", room: "Lab. Ciencias", color: "green" },
          wed: { course: "Física Cuántica Básica", grade: "5° Sec", room: "Lab. Ciencias", color: "yellow" },
          thu: { course: "Ciencias Experimentales", grade: "3° Sec", room: "Lab. Ciencias", color: "navy" },
          fri: { course: "Calibración de Sensores", grade: "Ciencias", room: "Lab. Ciencias", color: "green" }
        },
        {
          time: "01:20 - 01:50 PM",
          isBreak: true,
          isLunch: true,
          title: "HORA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"
        },
        {
          time: "01:50 - 02:40 PM",
          mon: { course: "Club de Ciencias & Robótica", grade: "4° Sec", room: "Lab. Ciencias", color: "green" },
          tue: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "4° Sec", room: "Lab. Ciencias", color: "yellow" },
          wed: { course: "Laboratorio Abierto de Química", grade: "5° Sec", room: "Lab. Ciencias", color: "navy" },
          thu: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "3° Sec", room: "Lab. Ciencias", color: "yellow" },
          fri: { course: "Preparación de Informes Científicos", grade: "Secundaria", room: "Sala Docentes", color: "green" }
        },
        {
          time: "02:40 - 03:30 PM",
          mon: { course: "Club de Ciencias & Robótica", grade: "4° Sec", room: "Lab. Ciencias", color: "green" },
          tue: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "4° Sec", room: "Lab. Ciencias", color: "yellow" },
          wed: { course: "Laboratorio Abierto de Química", grade: "5° Sec", room: "Lab. Ciencias", color: "navy" },
          thu: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "3° Sec", room: "Lab. Ciencias", color: "yellow" },
          fri: { course: "Atención y Asesoría a Proyectos", grade: "Secundaria", room: "Lab. Ciencias", color: "green" }
        }
      ]
    }
  ],

  schedules: {
    "4sec": [
      {
        time: "08:00 - 08:50",
        mon: { course: "Matemática (Álgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },
        tue: { course: "Comunicación & Literatura", teacher: "Miss M. Reyes", room: "Aula 304", type: "theory", color: "navy" },
        wed: { course: "Ciencia y Tec. (Física)", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" },
        thu: { course: "Personal Social / CC.SS", teacher: "Miss J. Arroyo", room: "Aula 304", type: "theory", color: "navy" },
        fri: { course: "Inglés Avanzado", teacher: "Prof. A. Lino", room: "Sala Idiomas", type: "lab", color: "yellow" }
      },
      {
        time: "08:50 - 09:40",
        mon: { course: "Matemática (Álgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },
        tue: { course: "Comunicación & Literatura", teacher: "Miss M. Reyes", room: "Aula 304", type: "theory", color: "navy" },
        wed: { course: "Ciencia y Tec. (Física)", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" },
        thu: { course: "Personal Social / CC.SS", teacher: "Miss J. Arroyo", room: "Aula 304", type: "theory", color: "navy" },
        fri: { course: "Inglés Avanzado", teacher: "Prof. A. Lino", room: "Sala Idiomas", type: "lab", color: "yellow" }
      },
      {
        time: "09:40 - 10:30",
        mon: { course: "Computación e Informática", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "navy" },
        tue: { course: "Matemática (Álgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },
        wed: { course: "Ciencia y Tec. (Biología)", teacher: "Miss L. Reyes", room: "Aula 304", type: "theory", color: "green" },
        thu: { course: "Arte y Cultura", teacher: "Miss J. Arroyo", room: "Taller Arte", type: "art", color: "navy" },
        fri: { course: "Diseño Digital & Robótica", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "yellow" }
      },
      {
        time: "10:30 - 10:50",
        isBreak: true,
        isLunch: false,
        title: "RECESO PEDAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"
      },
      {
        time: "10:50 - 11:40",
        mon: { course: "Computación e Informática", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "navy" },
        tue: { course: "Matemática (Álgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },
        wed: { course: "Ciencia y Tec. (Biología)", teacher: "Miss L. Reyes", room: "Aula 304", type: "theory", color: "green" },
        thu: { course: "Arte y Cultura", teacher: "Miss J. Arroyo", room: "Taller Arte", type: "art", color: "navy" },
        fri: { course: "Diseño Digital & Robótica", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "yellow" }
      },
      {
        time: "11:40 - 12:30",
        mon: { course: "Ciencia y Tec. (Química)", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "navy" },
        tue: { course: "Inglés Avanzado", teacher: "Prof. A. Lino", room: "Sala Idiomas", type: "lab", color: "yellow" },
        wed: { course: "Educación Física y Deportes", teacher: "Prof. M. Soto", room: "Coliseo", type: "sport", color: "red" },
        thu: { course: "Matemática (Geometría)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "navy" },
        fri: { course: "Educación Religiosa", teacher: "Prof. J. Cáceres", room: "Aula 304", type: "theory", color: "green" }
      },
      {
        time: "12:30 - 01:20 PM",
        mon: { course: "Ciencia y Tec. (Química)", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "navy" },
        tue: { course: "Prácticas de Microscopía", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "green" },
        wed: { course: "Educación Física y Deportes", teacher: "Prof. M. Soto", room: "Coliseo", type: "sport", color: "red" },
        thu: { course: "Computación e Informática", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "navy" },
        fri: { course: "Tutoría y Orientación Educativa", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "green" }
      },
      {
        time: "01:20 - 01:50 PM",
        isBreak: true,
        isLunch: true,
        title: "HORA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"
      },
      {
        time: "01:50 - 02:40 PM",
        mon: { course: "Taller de Robótica Avanzada", teacher: "Prof. F. Rojas", room: "Taller Robótica", type: "lab", color: "yellow" },
        tue: { course: "Círculo Matemático Olímpico", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },
        wed: { course: "Club de Ciencias & FENCYT", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "green" },
        thu: { course: "Taller de Geometría Descriptiva", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "navy" },
        fri: { course: "Prácticas Experimentales Lab", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" }
      },
      {
        time: "02:40 - 03:30 PM",
        mon: { course: "Taller de Robótica Avanzada", teacher: "Prof. F. Rojas", room: "Taller Robótica", type: "lab", color: "yellow" },
        tue: { course: "Círculo Matemático Olímpico", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },
        wed: { course: "Club de Ciencias & FENCYT", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "green" },
        thu: { course: "Taller de Geometría Descriptiva", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "navy" },
        fri: { course: "Prácticas Experimentales Lab", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" }
      }
    ]
  },

  syllabi: [
    {
      id: "SIL-4SEC-MAT",
      gradeId: "4sec-a",
      gradeName: "4to de Secundaria",
      courseName: "Matemática Avanzada (Álgebra y Trigonometría)",
      courseCode: "MAT-401",
      teacher: "Prof. Roberto Silva",
      hoursWeekly: "5 horas semanales",
      bimester: "III Bimestre 2026",
      competencies: [
        "Resuelve problemas de cantidad y regularidad",
        "Modela objetos con formas geométricas y trigonométricas",
        "Comunica su comprensión sobre las relaciones algebraicas complejas"
      ],
      units: [
        {
          unitNumber: "Unidad I",
          title: "Funciones Cuadráticas y Polinómicas de Grado Superior",
          duration: "4 semanas",
          topics: ["Dominio y rango", "Parábolas en contextos reales", "Teorema del residuo"],
          evaluation: "Práctica Calificada N° 1"
        }
      ],
      bibliography: "Baldor Álgebra Moderna, Guías Oficiales I.E.P. El Educador 2026."
    }
  ],

  notebookReviews: [
    {
      id: "REV-2026-081",
      qrCode: "QR-CUAD-4SECA-EST042-MAT",
      studentId: "EST-042",
      studentName: "Sofía Méndez",
      grade: "4to Secundaria 'A'",
      course: "Matemática Avanzada",
      teacher: "Prof. Roberto Silva",
      date: "15/08/2026",
      score: 20,
      status: "Excelente",
      stampType: "stamp-gold",
      stampText: "LOGRO DESTACADO ★",
      checklist: { margenes: true, fechas: true, teoriaCompleta: true, ejerciciosAlDia: true, pulcritud: true },
      teacherRemarks: "Cuaderno impecable con sellos al día."
    }
  ],

  announcements: [
    {
      id: "ANN-003-ED",
      title: "INFORME N°003 /ED - COORDINACIÓN Y DOCUMENTACIÓN (15/08/2026)",
      category: "Coordinación Institucional",
      priority: "high",
      tagLabel: "Oficial",
      date: "15 de Agosto, 2026",
      author: "Prof. Alex Lino (Coordinador)",
      content: "Recaudación acumulada del mes de agosto: S/ 25,130.00 (Superando la meta de S/ 24,000.00). Regularización de Renta de 4ta Categoría y seguimiento de expedientes ante la UGEL 05."
    }
  ],

  // 5. Control de Asistencia Biométrico Diario & Registro por Aulas
  attendanceRecords: [
    // 19/08/2026 (Hoy) - 4to de Secundaria
    { id: "ATT-055-0819", studentId: "EST-2026-055", studentCode: "EST-2026-055", studentName: "Gael Alessandro Cáceres Ramos", dni: "76541298", gradeId: "4sec", grade: "4° de Secundaria", date: "19/08/2026", day: "Miércoles", status: "Presente", arrivalTime: "07:38 AM", exitTime: "03:30 PM", method: "Fotocheck QR (Portería Principal)", observations: "Ingreso puntual" },
    { id: "ATT-042-0819", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "19/08/2026", day: "Miércoles", status: "Presente", arrivalTime: "07:38 AM", exitTime: "03:30 PM", method: "Huella Digital (Torniquete Principal)", observations: "Ingreso puntual" },
    { id: "ATT-011-0819", studentId: "EST-2026-011", studentCode: "EST-2026-011", studentName: "Carlos Benítez Díaz", dni: "75129034", gradeId: "4sec", grade: "4° de Secundaria", date: "19/08/2026", day: "Miércoles", status: "Tardanza", arrivalTime: "07:52 AM", exitTime: "03:30 PM", method: "Fotocheck QR (Puerta Secundaria)", observations: "Tardanza de 7 min" },
    { id: "ATT-089-0819", studentId: "EST-2026-089", studentCode: "EST-2026-089", studentName: "Marina del Carmen Albújar Zegarra", dni: "75849301", gradeId: "4sec", grade: "4° de Secundaria", date: "19/08/2026", day: "Miércoles", status: "Presente", arrivalTime: "07:40 AM", exitTime: "03:30 PM", method: "Huella Digital (Torniquete Principal)", observations: "Ingreso puntual" },
    { id: "ATT-025-0819", studentId: "EST-2026-025", studentCode: "EST-2026-025", studentName: "Mateo Ramos Quispe", dni: "76891209", gradeId: "4sec", grade: "4° de Secundaria", date: "19/08/2026", day: "Miércoles", status: "Falta", arrivalTime: "--:--", exitTime: "--:--", method: "No Registrado", observations: "Sin justificación aún" },

    // 18/08/2026 (Ayer) - 4to de Secundaria
    { id: "ATT-055-0818", studentId: "EST-2026-055", studentCode: "EST-2026-055", studentName: "Gael Alessandro Cáceres Ramos", dni: "76541298", gradeId: "4sec", grade: "4° de Secundaria", date: "18/08/2026", day: "Martes", status: "Presente", arrivalTime: "07:36 AM", exitTime: "03:30 PM", method: "Fotocheck QR (Portería Principal)", observations: "Ingreso puntual" },
    { id: "ATT-042-0818", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "18/08/2026", day: "Martes", status: "Presente", arrivalTime: "07:35 AM", exitTime: "03:30 PM", method: "Huella Digital (Torniquete Principal)", observations: "Ingreso puntual" },
    { id: "ATT-011-0818", studentId: "EST-2026-011", studentCode: "EST-2026-011", studentName: "Carlos Benítez Díaz", dni: "75129034", gradeId: "4sec", grade: "4° de Secundaria", date: "18/08/2026", day: "Martes", status: "Presente", arrivalTime: "07:44 AM", exitTime: "03:30 PM", method: "Huella Digital (Torniquete Principal)", observations: "Ingreso puntual" },
    { id: "ATT-089-0818", studentId: "EST-2026-089", studentCode: "EST-2026-089", studentName: "Marina del Carmen Albújar Zegarra", dni: "75849301", gradeId: "4sec", grade: "4° de Secundaria", date: "18/08/2026", day: "Martes", status: "Presente", arrivalTime: "07:39 AM", exitTime: "03:30 PM", method: "Huella Digital (Torniquete Principal)", observations: "Ingreso puntual" },
    { id: "ATT-025-0818", studentId: "EST-2026-025", studentCode: "EST-2026-025", studentName: "Mateo Ramos Quispe", dni: "76891209", gradeId: "4sec", grade: "4° de Secundaria", date: "18/08/2026", day: "Martes", status: "Presente", arrivalTime: "07:42 AM", exitTime: "03:30 PM", method: "Huella Digital (Torniquete Principal)", observations: "Ingreso puntual" },

    // Días anteriores para Sofía Méndez (Historial de Apoderado)
    { id: "ATT-042-0815", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "15/08/2026", day: "Viernes", status: "Presente", arrivalTime: "07:36 AM", exitTime: "03:30 PM", method: "Huella Digital", observations: "Puntual" },
    { id: "ATT-042-0814", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "14/08/2026", day: "Jueves", status: "Presente", arrivalTime: "07:39 AM", exitTime: "03:30 PM", method: "Huella Digital", observations: "Puntual" },
    { id: "ATT-042-0813", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "13/08/2026", day: "Miércoles", status: "Presente", arrivalTime: "07:34 AM", exitTime: "03:30 PM", method: "Huella Digital", observations: "Puntual" },
    { id: "ATT-042-0812", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "12/08/2026", day: "Martes", status: "Justificada", arrivalTime: "--:--", exitTime: "--:--", method: "Certificado Médico", observations: "Cita médica oftalmológica (Justificada por Apoderado)" },
    { id: "ATT-042-0811", studentId: "EST-2026-042", studentCode: "EST-2026-042", studentName: "Sofía Méndez Flores", dni: "74891230", gradeId: "4sec", grade: "4° de Secundaria", date: "11/08/2026", day: "Lunes", status: "Presente", arrivalTime: "07:30 AM", exitTime: "03:30 PM", method: "Huella Digital", observations: "Puntual - Formación General" }
  ],

  attendance: [
    { date: "19/08/2026", day: "Miércoles", status: "Presente", arrival: "07:38 AM", subject: "Jornada Académica Regular" },
    { date: "18/08/2026", day: "Martes", status: "Presente", arrival: "07:35 AM", subject: "Jornada Académica Regular" },
    { date: "15/08/2026", day: "Sábado", status: "Presente", arrival: "08:00 AM", subject: "Reunión de Coordinación y Documentación" },
    { date: "14/08/2026", day: "Viernes", status: "Presente", arrival: "07:42 AM", subject: "Jornada Académica Completa" }
  ],

  // 6. Libro Oficial de Registro de Incidencias & Convivencia Escolar (Ley N° 29719 / MINEDU)
  behaviorIncidents: [
    {
      id: "INC-2026-001",
      studentCode: "EST-2026-055",
      studentName: "Gael Alessandro Cáceres Ramos",
      dni: "76541298",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      level: "Secundaria",
      date: "19/08/2026",
      time: "10:15 AM",
      reportedBy: "Prof. Roberto Silva (Docente)",
      severity: "Grave",
      category: "Desobediencia e interrupción de clase",
      location: "Aula 304 - Clase de Matemática",
      description: "Durante el desarrollo de la clase de Álgebra, el estudiante Gael Cáceres interrumpió reiteradamente la explicación haciendo uso indebido del teléfono celular sin autorización y negándose a guardarlo tras la primera advertencia verbal del docente.",
      correctiveMeasure: "Firma de compromiso pedagógico en cuaderno de incidencias, retención temporal del equipo celular hasta el final de la jornada y notificación inmediata al apoderado vía WhatsApp.",
      guardian: "Sr. Juan Carlos Cáceres",
      guardianPhone: "984-777-888",
      parentMeetingRequired: false,
      status: "Registrado",
      qrCodeUsed: "EST-2026-055"
    },
    {
      id: "INC-2026-002",
      studentCode: "EST-2026-011",
      studentName: "Carlos Benítez Díaz",
      dni: "75129034",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      level: "Secundaria",
      date: "18/08/2026",
      time: "11:50 AM",
      reportedBy: "Auxiliar de Disciplina",
      severity: "Leve",
      category: "Uniforme y Presentación Personal",
      location: "Patio Central",
      description: "El estudiante se presentó a la formación general sin la casaca institucional del colegio.",
      correctiveMeasure: "Llamado de atención formativo y recomendación de portar el uniforme completo.",
      guardian: "Sr. Roberto Díaz",
      guardianPhone: "984-123-456",
      parentMeetingRequired: false,
      status: "Concluido",
      qrCodeUsed: "EST-2026-011"
    },
    {
      id: "INC-2026-003",
      studentCode: "EST-2026-042",
      studentName: "Sofía Méndez Flores",
      dni: "74891230",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      level: "Secundaria",
      date: "16/08/2026",
      time: "02:30 PM",
      reportedBy: "Miss Leyli Reyes",
      severity: "Mérito",
      category: "Conducta Destacada y Liderazgo",
      location: "Laboratorio de Ciencias",
      description: "Felicitación por apoyar proactivamente a sus compañeros de grupo en el ensamblaje de la práctica experimental de física y mantener el orden del laboratorio.",
      correctiveMeasure: "Anotación de Mérito y Reconocimiento en el anecdotario institucional.",
      guardian: "Dra. Carmen Méndez",
      guardianPhone: "987-654-321",
      parentMeetingRequired: false,
      status: "Concluido",
      qrCodeUsed: "EST-2026-042"
    }
  ],

  // 7. Agenda Virtual Escolar & Anotaciones Docentes (Vinculada al QR de Asistencia)
  agendaNotes: [
    {
      id: "AGN-2026-001",
      studentCode: "EST-2026-055",
      studentName: "Salim Gael Cáceres Quispe",
      dni: "76541298",
      grade: "5° de Primaria",
      gradeId: "5prim",
      date: "25/08/2026",
      time: "09:30 AM",
      type: "merito",
      typeLabel: "★ Felicitación / Mérito",
      category: "Participación Destacada & Liderazgo",
      course: "Matemática & Razonamiento",
      teacher: "Prof. Roberto Silva",
      title: "Excelente resolución de problemas matemáticos y trabajo en equipo",
      description: "El estudiante Salim demostró gran rapidez y precisión al resolver los desafíos matemáticos de la sesión, ayudando con respeto a sus compañeros de equipo.",
      taskOrMaterial: "Continuar con el avance de la Ficha de Desafíos N° 4 para la siguiente clase.",
      dueDate: "28/08/2026",
      parentSigned: true,
      signedBy: "Carmen Rosa Quispe Achulla (Apoderada)",
      signedDate: "25/08/2026 10:15 AM",
      guardianPhone: "984-777-888"
    },
    {
      id: "AGN-2026-002",
      studentCode: "EST-2026-055",
      studentName: "Salim Gael Cáceres Quispe",
      dni: "76541298",
      grade: "5° de Primaria",
      gradeId: "5prim",
      date: "24/08/2026",
      time: "11:45 AM",
      type: "pedagogica",
      typeLabel: "📝 Tarea / Material Requerido",
      category: "Materiales para Laboratorio",
      course: "Ciencia y Tecnología",
      teacher: "Miss Leyli Reyes",
      title: "Traer materiales reciclables para proyecto experimental de ciencias",
      description: "Para la próxima sesión de experimentos ecológicos, se solicita traer 2 botellas de plástico limpias, tijeras punta roma y 1 cinta masking tape.",
      taskOrMaterial: "2 botellas plásticas de 500ml, tijera punta roma y cinta masking tape.",
      dueDate: "27/08/2026",
      parentSigned: false,
      signedBy: null,
      signedDate: null,
      guardianPhone: "984-777-888"
    },
    {
      id: "AGN-2026-003",
      studentCode: "EST-2026-042",
      studentName: "Sofía Méndez Flores",
      dni: "74891230",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      date: "25/08/2026",
      time: "08:15 AM",
      type: "merito",
      typeLabel: "★ Felicitación / Mérito",
      category: "Rendimiento Académico Sobresaliente",
      course: "Comunicación & Literatura",
      teacher: "Miss María Daysi Reyes Milla",
      title: "Ensayo literario calificado con Logro Destacado (AD)",
      description: "Felicitamos a Sofía por la excelente redacción, estructura argumentativa y análisis crítico demostrado en su ensayo sobre literatura contemporánea.",
      taskOrMaterial: "Presentar la versión final encuadernada para el periódico mural escolar.",
      dueDate: "29/08/2026",
      parentSigned: true,
      signedBy: "Dra. Carmen Méndez (Apoderada)",
      signedDate: "25/08/2026 08:50 AM",
      guardianPhone: "987-654-321"
    },
    {
      id: "AGN-2026-004",
      studentCode: "EST-2026-011",
      studentName: "Carlos Benítez Díaz",
      dni: "75129034",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      date: "24/08/2026",
      time: "10:30 AM",
      type: "conducta",
      typeLabel: "⚠️ Observación de Conducta",
      category: "Uso indebido de celular en clase",
      course: "Ciencias Sociales",
      teacher: "Prof. Javier Vega",
      title: "Llamado de atención por distracción durante la sesión",
      description: "El estudiante fue observado manipulando el teléfono celular durante la explicación del tema de Historia del Perú. Se dialogó sobre las normas de clase.",
      taskOrMaterial: "Compromiso firmado de mantener el equipo apagado en la mochila durante horas pedagógicas.",
      dueDate: "Inmediato",
      parentSigned: false,
      signedBy: null,
      signedDate: null,
      guardianPhone: "984-123-456"
    },
    {
      id: "AGN-2026-005",
      studentCode: "EST-2026-011",
      studentName: "Carlos Benítez Díaz",
      dni: "75129034",
      grade: "4° de Secundaria",
      gradeId: "4sec",
      date: "22/08/2026",
      time: "02:00 PM",
      type: "citacion",
      typeLabel: "📅 Citación a Apoderado",
      category: "Entrevista Formativa de Tutoría",
      course: "Tutoría & Convivencia Escolar",
      teacher: "Prof. Roberto Silva (Tutor)",
      title: "Reunión de coordinación sobre compromisos formativos del III Bimestre",
      description: "Se solicita cordialmente la presencia del apoderado en la Sala de Profesores el día viernes 28 de agosto a las 03:40 PM para dialogar sobre los avances académicos del estudiante.",
      taskOrMaterial: "Asistir puntualmente a la cita formativa.",
      dueDate: "28/08/2026 03:40 PM",
      parentSigned: false,
      signedBy: null,
      signedDate: null,
      guardianPhone: "984-123-456"
    }
  ],

  payments: [
    { id: "PEN-08", concept: "Pensión Escolar - Agosto 2026", amount: 480.00, dueDate: "28/08/2026", status: "pending", receiptNo: null },
    { id: "PEN-07", concept: "Pensión Escolar - Julio 2026", amount: 480.00, dueDate: "28/07/2026", status: "paid", receiptNo: "REC-2026-7890", paidDate: "25/07/2026" }
  ],

  // =========================================================================
  // AULA VIRTUAL: MATERIALES SEMANALES Y EVALUACIONES DINÁMICAS (10 PREGUNTAS)
  // =========================================================================
  weeklyMaterials: [
    {
      id: "MAT-SEM-01",
      courseId: "MAT-401",
      courseName: "Matemática Avanzada (Álgebra y Funciones)",
      gradeId: "4sec",
      gradeName: "4to de Secundaria",
      teacherId: "DOC-2026-015",
      teacherName: "Prof. Roberto Silva",
      weekNumber: 1,
      bimester: "III Bimestre",
      title: "Funciones Cuadráticas y Modelamiento de Parábolas en Contextos Reales",
      sessionDate: "15/08/2026",
      summary: "En esta sesión presencial analizamos la estructura de la función cuadrática f(x) = ax² + bx + c. Determinamos el vértice V(h, k), el eje de simetría x = -b/(2a), y la concavidad según el signo del coeficiente principal. Aplicamos estos conceptos a problemas de tiro parabólico y maximización de ganancias en emprendimientos de San Juan de Lurigancho.",
      keyConcepts: [
        "Forma canónica f(x) = a(x - h)² + k",
        "Vértice y eje de simetría",
        "Discriminante Δ = b² - 4ac y naturaleza de raíces",
        "Optimización de valores máximos y mínimos"
      ],
      attachments: [
        { type: "pdf", name: "Guía_Teorica_Funciones_Cuadraticas_S1.pdf", size: "2.8 MB", icon: "📕" },
        { type: "pptx", name: "Diapositivas_Explicativas_Clase_S1.pptx", size: "4.5 MB", icon: "" },
        { type: "worksheet", name: "Ficha_Problemas_Optimizacion_S1.pdf", size: "1.4 MB", icon: "📝" },
        { type: "video", name: "Video_Demostracion_GeoGebra_Parabolas.mp4", duration: "18 min", icon: "🎬" }
      ],
      evaluation: {
        id: "EVAL-MAT-S1",
        title: "Evaluación Dinámica Semanal N° 01: Funciones Cuadráticas",
        timeLimitMinutes: 25,
        totalQuestions: 10,
        passingScore: 14,
        pointsPerQuestion: 2,
        questions: [
          {
            id: 1,
            question: "¿Cuál es la fórmula para calcular la abscisa del vértice 'h' en la función cuadrática f(x) = ax² + bx + c?",
            options: [
              "h = -b / (2a)",
              "h = -b / a",
              "h = b² - 4ac",
              "h = 2a / (-b)"
            ],
            correctIndex: 0,
            explanation: "La coordenada 'h' del vértice de una parábola se determina mediante la expresión h = -b / (2a), la cual coincide con la recta del eje de simetría."
          },
          {
            id: 2,
            question: "Si el coeficiente principal 'a' de una función cuadrática es negativo (a < 0), ¿cómo se comporta la parábola?",
            options: [
              "Se abre hacia abajo y posee un punto máximo en el vértice",
              "Se abre hacia arriba y posee un punto mínimo en el vértice",
              "Es una línea recta horizontal constante",
              "No corta al eje vertical Y bajo ninguna circunstancia"
            ],
            correctIndex: 0,
            explanation: "Cuando a < 0, la concavidad de la parábola es hacia abajo, por lo que su vértice representa el valor máximo absoluto de la función."
          },
          {
            id: 3,
            question: "En la función f(x) = 2x² - 8x + 6, ¿cuáles son las coordenadas exactas de su vértice V(h, k)?",
            options: [
              "V(2, -2)",
              "V(-2, 6)",
              "V(4, -2)",
              "V(2, 6)"
            ],
            correctIndex: 0,
            explanation: "Calculamos h = -(-8)/(2*2) = 8/4 = 2. Luego evaluamos k = f(2) = 2(2)² - 8(2) + 6 = 8 - 16 + 6 = -2. Por tanto, V(2, -2)."
          },
          {
            id: 4,
            question: "Si el discriminante de una ecuación cuadrática cumple que Δ = b² - 4ac = 0, ¿qué se puede afirmar sobre sus raíces?",
            options: [
              "Posee una única raíz real doble (la parábola es tangente al eje X)",
              "Posee dos raíces reales y distintas que cortan en dos puntos",
              "No posee ninguna solución real (raíces complejas imaginarias)",
              "La función carece de vértice y término independiente"
            ],
            correctIndex: 0,
            explanation: "Cuando el discriminante es exactamente cero (Δ = 0), la ecuación tiene una raíz real única de multiplicidad 2, lo que significa que el vértice toca tangencialmente el eje X."
          },
          {
            id: 5,
            question: "¿Cuál es el punto de intersección de la gráfica de f(x) = 3x² + 5x - 7 con el eje de ordenadas Y?",
            options: [
              "(0, -7)",
              "(0, 3)",
              "(0, 5)",
              "(-7, 0)"
            ],
            correctIndex: 0,
            explanation: "Para hallar la intersección con el eje Y se evalúa x = 0: f(0) = 3(0)² + 5(0) - 7 = -7. Por lo tanto el punto es (0, -7)."
          },
          {
            id: 6,
            question: "Un proyectil describe una trayectoria h(t) = -5t² + 20t en metros. ¿En cuántos segundos alcanza su altura máxima?",
            options: [
              "2 segundos",
              "4 segundos",
              "5 segundos",
              "10 segundos"
            ],
            correctIndex: 0,
            explanation: "El tiempo para la altura máxima corresponde a la abscisa del vértice: t = -b / (2a) = -20 / (2 * -5) = -20 / -10 = 2 segundos."
          },
          {
            id: 7,
            question: "Siguiendo el caso anterior h(t) = -5t² + 20t, ¿cuál es la altura máxima alcanzada por el proyectil?",
            options: [
              "20 metros",
              "15 metros",
              "40 metros",
              "25 metros"
            ],
            correctIndex: 0,
            explanation: "Sustituyendo t = 2 s en la función: h(2) = -5(2)² + 20(2) = -5(4) + 40 = -20 + 40 = 20 metros."
          },
          {
            id: 8,
            question: "La forma canónica de una función cuadrática es f(x) = a(x - h)² + k. Si f(x) = (x - 3)² + 5, ¿cuál es su vértice?",
            options: [
              "V(3, 5)",
              "V(-3, 5)",
              "V(3, -5)",
              "V(-3, -5)"
            ],
            correctIndex: 0,
            explanation: "Por comparación directa con f(x) = a(x - h)² + k, se deduce que h = 3 y k = 5, por lo que el vértice es (3, 5)."
          },
          {
            id: 9,
            question: "¿Cuál es la ecuación del eje de simetría de la función cuadrática f(x) = x² - 6x + 8?",
            options: [
              "x = 3",
              "y = 3",
              "x = -3",
              "x = 6"
            ],
            correctIndex: 0,
            explanation: "El eje de simetría es la recta vertical x = -b/(2a) = -(-6)/(2*1) = 6/2 = 3. Por lo tanto x = 3."
          },
          {
            id: 10,
            question: "Si el discriminante Δ < 0 y el coeficiente a > 0, ¿qué afirmación sobre el rango de la función es verdadera?",
            options: [
              "La función es siempre positiva f(x) > 0 para todo x real y no corta al eje X",
              "La función toma únicamente valores negativos en todo su dominio",
              "El rango de la función es el conjunto de todos los números reales (-∞, +∞)",
              "La parábola corta al eje X exactamente en dos puntos simétricos"
            ],
            correctIndex: 0,
            explanation: "Con a > 0 la parábola abre hacia arriba y al ser Δ < 0 no toca ni cruza el eje X, manteniéndose estrictamente por encima de él (función estrictamente positiva)."
          }
        ]
      },
      studentAttempts: [
        {
          studentId: "EST-2026-042",
          studentName: "Sofía Méndez Flores",
          score: 18,
          total: 20,
          date: "16/08/2026 15:40",
          status: "Aprobado",
          correctCount: 9,
          timeSpent: "14 min",
          feedback: "¡Excelente dominio en el cálculo del vértice y optimización parabólica! Revisar discriminante en ejercicios complejos."
        },
        {
          studentId: "EST-2026-011",
          studentName: "Carlos Benítez Ruiz",
          score: 14,
          total: 20,
          date: "16/08/2026 17:15",
          status: "Aprobado",
          correctCount: 7,
          timeSpent: "19 min",
          feedback: "Buen intento. Se recomienda repasar la sustitución de la forma canónica."
        },
        {
          studentId: "EST-2026-089",
          studentName: "Marina del Carmen Albújar",
          score: 16,
          total: 20,
          date: "16/08/2026 18:22",
          status: "Aprobado",
          correctCount: 8,
          timeSpent: "16 min",
          feedback: "Logro destacado en análisis de concavidad y raíces reales."
        }
      ]
    },
    {
      id: "COMP-SEM-01",
      courseId: "EPT-402",
      courseName: "Computación e Informática / Robótica",
      gradeId: "4sec",
      gradeName: "4to de Secundaria",
      teacherId: "DOC-2026-COMP",
      teacherName: "Prof. Fernando Rojas",
      weekNumber: 1,
      bimester: "III Bimestre",
      title: "Robótica Educativa: Programación de Sensores Ultrasónicos con Arduino",
      sessionDate: "16/08/2026",
      summary: "En esta sesión en el Taller de Robótica se realizó el montaje y calibración del sensor ultrasónico HC-SR04 conectado a la placa Arduino UNO. Los estudiantes programaron la emisión de pulsos TRIGGER y la lectura de tiempo de retorno en ECHO para calcular distancias en centímetros con la velocidad del sonido.",
      keyConcepts: [
        "Estructura del microcontrolador Arduino UNO",
        "Sensor de distancia HC-SR04 (Pines VCC, GND, TRIG, ECHO)",
        "Fórmula física: Distancia = (Tiempo * 0.0343) / 2",
        "Estructuras condicionales if-else para evasión de obstáculos"
      ],
      attachments: [
        { type: "pdf", name: "Manual_Montaje_HC_SR04_Arduino.pdf", size: "3.2 MB", icon: "📕" },
        { type: "code", name: "Codigo_Sensor_Ultrasonico.ino", size: "45 KB", icon: "💻" },
        { type: "pptx", name: "Diapositivas_Robotica_Sensores_S1.pptx", size: "5.8 MB", icon: "" },
        { type: "worksheet", name: "Ficha_Circuito_Tinkercad_S1.pdf", size: "1.1 MB", icon: "📝" }
      ],
      evaluation: {
        id: "EVAL-COMP-S1",
        title: "Evaluación Dinámica Semanal N° 01: Robótica y Sensores",
        timeLimitMinutes: 20,
        totalQuestions: 10,
        passingScore: 14,
        pointsPerQuestion: 2,
        questions: [
          {
            id: 1,
            question: "¿Cuál es la función del pin TRIGGER en el sensor ultrasónico HC-SR04?",
            options: [
              "Emitir el pulso sonoro de alta frecuencia (8 pulsos a 40 kHz)",
              "Recibir el eco reflejado por el objeto detectado",
              "Alimentar de energía positiva de 5V al módulo",
              "Conectar a tierra el circuito electrónico"
            ],
            correctIndex: 0,
            explanation: "El pin TRIGGER es el disparador encargado de generar la ráfaga ultrasónica para iniciar la medición."
          },
          {
            id: 2,
            question: "¿Por qué en la fórmula de distancia se divide el tiempo entre 2?",
            options: [
              "Porque la onda sonora viaja de ida hasta el obstáculo y de vuelta al sensor",
              "Porque Arduino opera a la mitad de su frecuencia de reloj",
              "Para convertir milisegundos a microsegundos",
              "Porque el sensor posee dos receptores paralelos"
            ],
            correctIndex: 0,
            explanation: "La onda realiza un trayecto doble (ida y vuelta), por lo que para conocer la distancia al obstáculo se debe dividir el recorrido total entre dos."
          },
          {
            id: 3,
            question: "¿Qué valor aproximado tiene la velocidad del sonido en el aire a temperatura ambiente empleada en el código?",
            options: [
              "0.0343 cm / microsegundo (343 m/s)",
              "300,000 km / segundo",
              "1.5 cm / milisegundo",
              "9.8 m / s²"
            ],
            correctIndex: 0,
            explanation: "La velocidad del sonido en el aire es de aprox. 343 m/s, lo que equivale a 0.0343 centímetros por microsegundo."
          },
          {
            id: 4,
            question: "¿Qué función nativa de Arduino se utiliza para medir la duración en microsegundos del pulso en el pin ECHO?",
            options: [
              "pulseIn(pinEcho, HIGH)",
              "analogRead(pinEcho)",
              "digitalWrite(pinEcho, HIGH)",
              "delayMicroseconds(pinEcho)"
            ],
            correctIndex: 0,
            explanation: "La función pulseIn(pin, HIGH) espera a que el pin pase a nivel alto, inicia el cronómetro y devuelve el tiempo transcurrido hasta que regrese a bajo."
          },
          {
            id: 5,
            question: "En la función setup() de Arduino, ¿cómo se deben configurar los pines TRIG y ECHO?",
            options: [
              "pinMode(TRIG, OUTPUT) y pinMode(ECHO, INPUT)",
              "pinMode(TRIG, INPUT) y pinMode(ECHO, OUTPUT)",
              "Ambos configurados como OUTPUT",
              "Ambos configurados como INPUT"
            ],
            correctIndex: 0,
            explanation: "TRIG envía señales hacia afuera (OUTPUT) y ECHO lee las señales entrantes (INPUT)."
          },
          {
            id: 6,
            question: "¿Cuál es el rango de detección óptimo y confiable del sensor HC-SR04?",
            options: [
              "Entre 2 cm y 400 cm (4 metros)",
              "Entre 1 mm y 10 cm",
              "Entre 10 metros y 50 metros",
              "Entre 50 cm y 1000 cm"
            ],
            correctIndex: 0,
            explanation: "El sensor HC-SR04 tiene una distancia de medición efectiva estándar comprendida entre 2 cm y 400 cm."
          },
          {
            id: 7,
            question: "Si queremos que un robot móvil frene cuando la distancia sea menor a 15 cm, ¿cuál es la condición adecuada en C++?",
            options: [
              "if (distancia < 15) { detenerMotores(); }",
              "while (distancia > 15) { detenerMotores(); }",
              "for (int i=0; i < 15; i++) { detenerMotores(); }",
              "if (distancia == 0) { detenerMotores(); }"
            ],
            correctIndex: 0,
            explanation: "La estructura condicional 'if (distancia < 15)' evalúa si el objeto está a menos de 15 cm y ejecuta la orden de parada."
          },
          {
            id: 8,
            question: "¿A qué voltaje de alimentación opera normalmente la placa Arduino UNO y el sensor HC-SR04?",
            options: [
              "5 Voltios (VCC)",
              "220 Voltios de corriente alterna",
              "1.5 Voltios de pila común",
              "24 Voltios industriales"
            ],
            correctIndex: 0,
            explanation: "Tanto el microcontrolador ATmega328P de Arduino UNO como el módulo ultrasónico trabajan con 5V DC regulados."
          },
          {
            id: 9,
            question: "¿Qué instrucción se usa para enviar la distancia calculada a la pantalla de la computadora mediante el Monitor Serie?",
            options: [
              "Serial.println(distancia);",
              "System.out.print(distancia);",
              "Console.WriteLine(distancia);",
              "echo distancia;"
            ],
            correctIndex: 0,
            explanation: "En el entorno de Arduino, la clase Serial con su método Serial.println() imprime los datos por comunicación UART hacia la PC."
          },
          {
            id: 10,
            question: "¿Qué velocidad de comunicación en baudios se inicia habitualmente en Serial.begin()?",
            options: [
              "Serial.begin(9600);",
              "Serial.begin(100);",
              "Serial.begin(50);",
              "Serial.begin(10000000);"
            ],
            correctIndex: 0,
            explanation: "9600 baudios es la velocidad estándar más común para la comunicación serie entre Arduino y el monitor del IDE."
          }
        ]
      },
      studentAttempts: [
        {
          studentId: "EST-2026-042",
          studentName: "Sofía Méndez Flores",
          score: 20,
          total: 20,
          date: "16/08/2026 19:10",
          status: "Excelente",
          correctCount: 10,
          timeSpent: "11 min",
          feedback: "¡Puntaje perfecto! Dominio total del pinout, fórmulas y lógica de control con Arduino."
        }
      ]
    },
    {
      id: "CTA-SEM-01",
      courseId: "CTA-403",
      courseName: "Ciencia y Tecnología (Física & Química)",
      gradeId: "4sec",
      gradeName: "4to de Secundaria",
      teacherId: "DOC-2026-FIS",
      teacherName: "Miss Leyli Reyes Cerquen",
      weekNumber: 1,
      bimester: "III Bimestre",
      title: "Dinámica Lineal y Segunda Ley de Newton en Sistemas de Fuerzas",
      sessionDate: "17/08/2026",
      summary: "Durante las prácticas de laboratorio comprobamos experimentalmente que la aceleración que adquiere un cuerpo es directamente proporcional a la fuerza resultante e inversamente proporcional a su masa (F_res = m · a). Analizamos diagramas de cuerpo libre (DCL) y coeficientes de rozamiento estático y cinético.",
      keyConcepts: [
        "Segunda Ley de Newton (F = m · a)",
        "Diagrama de Cuerpo Libre (DCL)",
        "Fuerza de Rozamiento f_k = μ_k · N",
        "Unidades en el Sistema Internacional (Newton, kg, m/s²)"
      ],
      attachments: [
        { type: "pdf", name: "Guia_Laboratorio_Dinamica_S1.pdf", size: "2.1 MB", icon: "📕" },
        { type: "pptx", name: "Diapositivas_Leyes_Newton.pptx", size: "3.9 MB", icon: "" },
        { type: "worksheet", name: "Ficha_Diagramas_Cuerpo_Libre.pdf", size: "1.3 MB", icon: "📝" }
      ],
      evaluation: {
        id: "EVAL-CTA-S1",
        title: "Evaluación Dinámica Semanal N° 01: Dinámica Lineal",
        timeLimitMinutes: 20,
        totalQuestions: 10,
        passingScore: 14,
        pointsPerQuestion: 2,
        questions: [
          {
            id: 1,
            question: "¿Cuál es la expresión fundamental de la Segunda Ley de Newton?",
            options: [
              "Fuerza Resultante = masa × aceleración (F_res = m · a)",
              "Fuerza = masa / aceleración",
              "Energía = masa × gravedad × altura",
              "Velocidad = distancia × tiempo"
            ],
            correctIndex: 0,
            explanation: "La Segunda Ley de Newton establece que la aceleración de un cuerpo es proporcional a la fuerza neta aplicada e inversamente proporcional a su masa: F = m · a."
          },
          {
            id: 2,
            question: "¿En qué unidad del Sistema Internacional (SI) se mide la fuerza?",
            options: [
              "Newton (N), equivalente a kg · m / s²",
              "Joule (J)",
              "Watt (W)",
              "Pascal (Pa)"
            ],
            correctIndex: 0,
            explanation: "1 Newton (N) se define como la fuerza necesaria para acelerar 1 kg de masa a razón de 1 m/s²."
          },
          {
            id: 3,
            question: "Si a un bloque de 5 kg se le aplica una fuerza neta horizontal de 20 N, ¿cuál es su aceleración?",
            options: [
              "4 m/s²",
              "100 m/s²",
              "0.25 m/s²",
              "15 m/s²"
            ],
            correctIndex: 0,
            explanation: "Despejando la aceleración: a = F / m = 20 N / 5 kg = 4 m/s²."
          },
          {
            id: 4,
            question: "¿Qué representa el Diagrama de Cuerpo Libre (DCL)?",
            options: [
              "La representación gráfica de todas las fuerzas externas que actúan sobre un cuerpo",
              "El dibujo estético del objeto en su entorno",
              "La gráfica de velocidad en función del tiempo",
              "La trayectoria geométrica del movimiento"
            ],
            correctIndex: 0,
            explanation: "El DCL aísla el cuerpo y dibuja vectorialmente todas las fuerzas que actúan sobre él (peso, normal, tensión, fricción, etc.)."
          },
          {
            id: 5,
            question: "La fuerza con la que la Tierra atrae a un cuerpo se denomina Peso (P). ¿Cómo se calcula?",
            options: [
              "P = masa × gravedad (P = m · g)",
              "P = masa / gravedad",
              "P = fuerza × distancia",
              "P = aceleración / masa"
            ],
            correctIndex: 0,
            explanation: "El peso es una fuerza gravitatoria vectorial calculada como P = m · g, donde g ≈ 9.8 o 10 m/s²."
          },
          {
            id: 6,
            question: "¿Hacia dónde apunta siempre la fuerza de rozamiento por fricción?",
            options: [
              "En sentido opuesto al deslizamiento o tendencia de movimiento",
              "Siempre en dirección vertical hacia arriba",
              "En la misma dirección de la fuerza aplicada",
              "Hacia el centro de gravedad del planeta"
            ],
            correctIndex: 0,
            explanation: "La fuerza de fricción se opone al movimiento relativo entre las superficies en contacto."
          },
          {
            id: 7,
            question: "La fuerza Normal (N) ejercida por una superficie plana horizontal sobre un bloque en reposo es igual a:",
            options: [
              "La magnitud del Peso del bloque en sentido opuesto",
              "Cero",
              "La aceleración de la gravedad",
              "El doble de la masa del bloque"
            ],
            correctIndex: 0,
            explanation: "En equilibrio vertical sobre superficie horizontal (ΣFy = 0), la fuerza Normal equilibra exactamente al peso: N = P = m · g."
          },
          {
            id: 8,
            question: "Si la masa de un objeto se duplica manteniendo constante la fuerza aplicada, ¿qué ocurre con su aceleración?",
            options: [
              "Se reduce a la mitad",
              "Se duplica",
              "Permanece constante",
              "Se cuadruplica"
            ],
            correctIndex: 0,
            explanation: "Al ser inversamente proporcionales (a = F/m), si la masa se duplica, la aceleración se divide entre 2."
          },
          {
            id: 9,
            question: "¿Qué establece la Primera Ley de Newton o Ley de la Inercia?",
            options: [
              "Un cuerpo permanece en reposo o MRU a menos que una fuerza externa neta actúe sobre él",
              "A toda acción le corresponde una reacción igual y contraria",
              "La energía mecánica siempre se disipa en calor",
              "La masa de un cuerpo varía con su rapidez"
            ],
            correctIndex: 0,
            explanation: "La Primera Ley indica que si la fuerza neta es nula (ΣF = 0), el cuerpo mantiene su estado de reposo o velocidad constante en línea recta."
          },
          {
            id: 10,
            question: "¿Cuál es el valor de la fuerza necesaria para mover un cuerpo de 10 kg con una aceleración de 3 m/s²?",
            options: [
              "30 N",
              "3.33 N",
              "13 N",
              "0.3 N"
            ],
            correctIndex: 0,
            explanation: "F = m · a = 10 kg × 3 m/s² = 30 Newtons (N)."
          }
        ]
      },
      studentAttempts: []
    }
  ]
};

// Aliases y compatibilidad de grados
if (window.initialData && window.initialData.schedules) {
  if (!window.initialData.schedules["4sec-a"] && window.initialData.schedules["4sec"]) {
    window.initialData.schedules["4sec-a"] = window.initialData.schedules["4sec"];
  }
}
