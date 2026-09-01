/**

 * Díatos Iniciales del Sistema - Institución Educativa Privadía "EL EDUCADOR" (S.J.L.)

 * "21 años dejando huellas" • UGEL 05

 */



const initialDíata = {

  institution: {

    name: "INSTITUCIÓN EDUCTIVA PRIVDÍA \"EL EDUCADOR\"",

    levels: "INICIL - PRIMRIA - SECUNDÍARIA",

    slogan: "21 años dejando huellas",

    district: "San Juan de Lurigancho (S.J.L.)",

    ugel: "UGEL 05",

    coordiónator: "Prof. Alex Lino",

    economicReport: {

      month: "Agosto 2026",

      collectedmount: 25130.00,

      targetmount: 24000.00,

      reportCode: "INFORME- N003 /ED - COORDINCIÓN Y DOCUMENTÍACIÓN",

      reportDate: "15/08/2026"

    }

  },



  academicYear: "2026 - Año Lectivo",

  currentPeriod: "3er Bimestre",



  // 1. Usuarios conCredenciales de Acceso Oficiales

  users: {

    admin: {

      id: "ADM-LINO-001",

      username: "admin",

      password: "admin2026",

      name: "Prof. Alex Lino",

      email: "coordiónacion@eleducador.edu.pe",

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

      avgttendance: "96.4%",

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

      adminPrivilegeLabel: "Coordiónador Pedagógico (Permisos de Edición)",

      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",

      totalStudents: 92,

      pendióngGradióng: 4,

      scannedNotebooksToday: 18

    },

    estudiante: {

      id: "EST-DEMO",

      username: "estudiante",

      password: "estudiante2026",

      name: "Estudiante",

      email: "estudiante@eleducador.edu.pe",

      role: "estudiante",

      roleLabel: "Estudiante",

      gradeLevel: "Nivel Escolar",

      gradeId: "4sec",

      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",

      tutor: "Docente Tutor",

      generalverage: 0,

      attendanceRate: "100%",

      pendióngTasksCount: 0,

      paymentsUpToDate: true,

      pensionStatus: "Al Día",

      isccessLocked: false,

      pendióngDebtmount: 0.00,

      pendióngConcept: "--",

      notebooksUpToDate: "Al da"

    },

    auxiliar: {

      id: "AUX-2026-004",

      username: "auxiliar",

      aliases: ["auxiliar", "auxiliar.puerta", "auxiliar2026", "carlos.medióna"],

      password: "auxiliar2026",

      name: "Lic. Carlos Medióna",

      email: "auxiliar@eleducador.edu.pe",

      role: "auxiliar",

      roleLabel: "Auxiliar de Educación & Portería",

      assignedZones: ["Portería Principal (Puerta 1)", "Patio Central & Pabellón Secundaria"],

      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",

      scannedToday: 0,

      notebooksReviewedToday: 0,

      incidentsReportedToday: 0,

      shift: "Turno Mañana (07:00 AM - 02:30 PM)"

    },

    padre: {

      id: "PDRE-DEMO",

      username: "padre",

      password: "padre2026",

      name: "Padre de Familia",

      email: "padre@eleducador.edu.pe",

      role: "padre",

      roleLabel: "Padre / Apoderado",

      selectedChildId: null,

      children: [],

      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",

      pensionStatus: "Al Día",

      isccessLocked: false,

      pendióngDebtmount: 0.00,

      pendióngConcept: "--"

    }

  },



  // Familias y Estado Financiero enTiempo Real

  familiesFinancial: [],



  // 2. Directorio Real de Personal Docente y Administrativo (del Informe Oficial)

  systemUsers: [

    {

      id: "USR-001",

      code: "ADM-LINO-001",

      username: "admin",

      password: "admin2026",

      name: "Prof. Alex Lino",

      email: "coordiónacion@eleducador.edu.pe",

      role: "Directivo",

      detail: "Coordiónador General & Documentación",

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

      name: "Lic. Carlos Medióna",

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

      detail: "Matemática Avanzadía (Secundaria)",

      assignedCourses: ["Aritmética", "ÁÁÁÁálgebra", "Geometría", "Trigonometra", "Raízonamiento Matemtico", "Matemática Avanzada"],

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

      assignedCourses: ["Biología & Anatoma", "Física Elemental", "Química Inorgnica", "Ciencia y Tecnología"],

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

      name: "Miss Mara Díaysi Reyes Milla",

      email: "maria.reyes@eleducador.edu.pe",

      role: "Docente",

      detail: "Comunicación & Literatura",

      assignedCourses: ["Lenguíaje y Gramática", "Literatura Universal", "Raízonamiento Verbal", "Comunicación Integral"],

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

      assignedCourses: ["Educación Cívica (DPCC)", "Psicologa", "Personal Social & Cívica", "Comunicación Integral", "Tutoría & Convivencia Escolar"],

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

    }

  ],



  // Configuración de Pestañas y Espacios Visibles por Perfil (Editable por el Administrador)

  navigationTabsConfig: {

    auxiliar: [

      { id: "díashboard", label: "Inicio / Turno Auxiliar", icon: "díashboard", enabled: true },

      { id: "agenda-virtual", label: "📖 Agendía & Convivencia QR", badge: "AGENDÍA", icon: "agenda", enabled: true },

      { id: "asistencia", label: "Registro de Ingreso & QR", badge: "Portería", icon: "attendance", enabled: true },

      { id: "cuadernos-qr", label: "Lector de Cuadernos QR", badge: "CÁMARA", icon: "qr", enabled: true },

      { id: "comunicados", label: "Informes & Circulares", icon: "announcements", enabled: true }

    ],

    docente: [

      { id: "díashboard", label: "Inicio / Resumen", icon: "díashboard", enabled: true },

      { id: "registro-estudiantes", label: "Registro de Estudiantes", badge: "Excel", icon: "users", enabled: true },

      { id: "agenda-virtual", label: "📖 Agendía Virtual & Anotaciones", badge: "AGENDÍA", icon: "agenda", enabled: true },

      { id: "cuadernos-qr", label: "Lector de Cuadernos QR", badge: "CÁMARA", icon: "qr", enabled: true },

      { id: "calificaciones", label: "Registro de Notas", badge: "Bimestral", icon: "grades", enabled: true },

      { id: "horarios", label: "Horario de Clases", icon: "schedule", enabled: true },

      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },

      { id: "taÁÁreas", label: "Aula Virtual / Quizzes", badge: "10P", icon: "virtual", enabled: true },

      { id: "asistencia", label: "Registro de Ingreso & QR", badge: "Puerta", icon: "attendance", enabled: true },

      { id: "comunicados", label: "Informes & Circulares", icon: "announcements", enabled: true },

      { id: "boleta", label: "Boleta Oficial MINEDU", badge: "2026", icon: "boleta", enabled: true }

    ],

    estudiante: [

      { id: "díashboard", label: "Inicio / Resumen", icon: "díashboard", enabled: true },

      { id: "agenda-virtual", label: "📖 Mi Agendía Virtual", badge: "NOTAS", icon: "agenda", enabled: true },

      { id: "horarios", label: "Horario de Clases", icon: "schedule", enabled: true },

      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },

      { id: "cuadernos-qr", label: "Control Cuadernos QR", icon: "qr", enabled: true },

      { id: "taÁÁreas", label: "Aula Virtual / Quizzes", badge: "10P", icon: "virtual", enabled: true },

      { id: "asistencia", label: "📅 Mi Asistencia & Fotocheck", icon: "attendance", enabled: true },

      { id: "boleta", label: "📊 Mi Boleta Oficial de Notas", badge: "OFICIAL", icon: "boleta", enabled: true },

      { id: "comunicados", label: "Informes & Circulares", icon: "announcements", enabled: true }

    ],

    padre: [

      { id: "díashboard", label: "Inicio / Resumen", icon: "díashboard", enabled: true },

      { id: "boleta", label: "📊 Boleta Oficial de Notas", badge: "OFICIAL", icon: "boleta", enabled: true },

      { id: "agenda-virtual", label: "📖 Agendía Virtual Escolar", badge: "FIRMAS", icon: "agenda", enabled: true },

      { id: "horarios", label: "Horario de Clases", icon: "schedule", enabled: true },

      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },

      { id: "cuadernos-qr", label: "Informe Revisin  Cuadernos", badge: "SELLOS QR", icon: "qr", enabled: true },

      { id: "taÁÁreas", label: "Aula Virtual", icon: "virtual", enabled: true },

      { id: "asistencia", label: "📅 Asistencia de mi Hijo(a)", icon: "attendance", enabled: true },

      { id: "comunicados", label: "Informes y Circulares", badge: "N003", icon: "announcements", enabled: true },

      { id: "pagos", label: "Pensiones & Recaudación", badge: "S/ 480", icon: "payments", enabled: true }

    ],

    director: [

      { id: "díashboard", label: "Inicio / Resumen", icon: "díashboard", enabled: true },

      { id: "registro-estudiantes", label: "Registro de Estudiantes", badge: "Excel", icon: "users", enabled: true },

      { id: "agenda-virtual", label: "📖 Agendía Virtual Institucional", badge: "AGENDÍA", icon: "agenda", enabled: true },

      { id: "database", label: "Base de Díatos & DB", badge: "DB Online", icon: "database", enabled: true },

      { id: "usuarios-matriculas", label: "Gestión de Perfiles & Cuentas", badge: "PERFILES", icon: "users", enabled: true },

      { id: "cuadernos-qr", label: "Supervisin  Cuadernos QR", badge: "CÁMARA", icon: "qr", enabled: true },

      { id: "calificaciones", label: "Auditora de Calificaciones", badge: "Bimestral", icon: "grades", enabled: true },

      { id: "horarios", label: "Horarios Institucionales", icon: "schedule", enabled: true },

      { id: "silabus", label: "Sílabus Curriculares", icon: "syllabus", enabled: true },

      { id: "taÁÁreas", label: "Aula Virtual", icon: "virtual", enabled: true },

      { id: "asistencia", label: "Registro de Ingreso & QR", badge: "EnVivo", icon: "attendance", enabled: true },

      { id: "comunicados", label: "Informes & Circulares", badge: "N003", icon: "announcements", enabled: true },

      { id: "pagos", label: "Reportes Económicos & Caja", badge: "S/ 25,130", icon: "payments", enabled: true },

      { id: "boleta", label: "Boleta Oficial MINEDU", icon: "boleta", enabled: true }

    ]

  },



  // 3. Matrículas y Fichas Únicas de Matrícula (FUM - SIGIE / UGEL 05)

  enrollments: [],



  // 4. Asignaturas conCalificaciones Oficiales

  courses: [

    {

      id: "MT-401",

      code: "MT-401",

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

      qrCode: "QR-CUD-4SECA-EST042-MT"

    },

    {

      id: "COM-402",

      code: "COM-402",

      name: "Comunicación & Literatura",

      teacher: "Miss Mara Díaysi Reyes Milla",

      credits: 4,

      b1: 17,

      b2: 18,

      b3: 18,

      b4: 0,

      finalGrade: 17.7,

      status: "Aprobado",

      colorTag: "navy",

      qrCode: "QR-CUD-4SECA-EST042-COM"

    },

    {

      id: "CTÍA-403",

      code: "CTÍA-403",

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

      qrCode: "QR-CUD-4SECA-EST042-CTÍA"

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

      qrCode: "QR-CUD-4SECA-EST042-HIS"

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

      qrCode: "QR-CUD-4SECA-EST042-ING"

    }

  ],



  // Registro Oficial Dinmico de Notas para Emisin  de Boletas MINEDU

  boletaDíata: {

    albujar: {

      id: "EST-2026-089",

      name: "ALBUJR ZEGÍARRÍA, MRINA DEL CRMEN",

      dni: "75849301",

      grade: "2",

      gradeLevel: "2 de Secundaria",

      level: "SECUNDÍARIA",

      section: "",

      tutor: "Caceres Sutta JuanCarlos",

      grades: {

        lenguíaje: { b1: "A", b2: "A", b3: "", b4: "" },

        literatura: { b1: "A", b2: "A", b3: "", b4: "" },

        raíz_verbal: { b1: "A", b2: "A", b3: "", b4: "" },

        aritmetica: { b1: "A", b2: "A", b3: "", b4: "" },

        algebra: { b1: "A", b2: "B", b3: "", b4: "" },

        geometria: { b1: "A", b2: "A", b3: "", b4: "" },

        trigonometria: { b1: "A", b2: "A", b3: "", b4: "" },

        raíz_matematico: { b1: "A", b2: "A", b3: "", b4: "" },

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

        b1: "Felicitaciones a ALBUJR ZEGÍARRÍA, MRINA DEL CRMENpor su excelente rendimiento. Demuestra responsabilidad, participación activa y compromiso con su aprendizaje. Sus trabajosé sonde grancalidad y siempre está dispuesta a colaborar. Recomendación: Sigue así y anímate a asumir nuevos retos.",

        b2: "Has Árealizado untrabajo muy bueno durante este segundo bimestre. Cumples conresponsabilidad tus actividades dentro de la clase y gestionas muy bientu tiempo de trabajo. Te animo a participar unpoco ms de manera activa para seguir potenciando tus ideas.",

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

      name: "MÉN DEZ FLORES, SOFÍA",

      dni: "74891230",

      grade: "4",

      gradeLevel: "4to de Secundaria",

      level: "SECUNDÍARIA",

      section: "",

      tutor: "Prof. Roberto Silva",

      grades: {

        lenguíaje: { b1: "AD", b2: "AD", b3: "AD", b4: "" },

        literatura: { b1: "A", b2: "AD", b3: "A", b4: "" },

        raíz_verbal: { b1: "AD", b2: "A", b3: "AD", b4: "" },

        aritmetica: { b1: "AD", b2: "AD", b3: "AD", b4: "" },

        algebra: { b1: "A", b2: "A", b3: "AD", b4: "" },

        geometria: { b1: "AD", b2: "AD", b3: "AD", b4: "" },

        trigonometria: { b1: "A", b2: "AD", b3: "AD", b4: "" },

        raíz_matematico: { b1: "AD", b2: "AD", b3: "AD", b4: "" },

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

        b1: "Sofía demuestra unexcelente compromiso académico y unlideraízgo intachable en el aula de 4to Sec. 'A'. ¡Felicitaciones por tus logros!",

        b2: "Mantiene una alta dedicación y pulcritud entodos los cursos. Sus aportes en el Área de matemticas y ciencias sonsobresalientes.",

        b3: "Excelente desempeño en el tercer bimestre. Contiónúa demostrando autonoma y proactividad.",

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

      name: "BENÍTEZ RUIZ, CRLOS",

      dni: "74891255",

      grade: "4",

      gradeLevel: "4to de Secundaria",

      level: "SECUNDÍARIA",

      section: "",

      tutor: "Prof. Roberto Silva",

      grades: {

        lenguíaje: { b1: "A", b2: "B", b3: "A", b4: "" },

        literatura: { b1: "B", b2: "A", b3: "A", b4: "" },

        raíz_verbal: { b1: "A", b2: "A", b3: "B", b4: "" },

        aritmetica: { b1: "A", b2: "A", b3: "A", b4: "" },

        algebra: { b1: "B", b2: "B", b3: "A", b4: "" },

        geometria: { b1: "A", b2: "A", b3: "A", b4: "" },

        trigonometria: { b1: "B", b2: "A", b3: "A", b4: "" },

        raíz_matematico: { b1: "A", b2: "A", b3: "A", b4: "" },

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

        b1: "Carlos ha mostrado buena disposición para el trabajo enequipo. Se recomiendía reforzar el repaso constante en áÁÁÁÁálgebra y física.",

        b2: "Se aprecia una notable mejora ensu puntualidad y presentación de trabajosé. Buenprogreso durante este bimestre.",

        b3: "Consolidía sus aprendizajes conconstancia y participación activa.",

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

      status: "pendióng",

      description: "Elaborar uniónforme sobre los 21 años de trayectoria institucional dejando huellas en la comunidad de S.J.L.",

      submission: null

    },

    {

      id: "TSK-102",

      title: "Taller Prctico: Ecuaciones Cuadrticas Complejas",

      course: "Matemática Avanzada",

      teacher: "Prof. Roberto Silva",

      dueDate: "Viernes 22 de Agosto",

      priority: "medium",

      priorityLabel: "Esta Semana",

      status: "pendióng",

      description: "Resolver los ejercicios 1 al 15 del libro de trabajo.",

      submission: null

    }

  ],



  // Configuración de Estructura Académica (Editable desde el Perfil Administrador)

  academicConfig: {

    hasSections: false, // El colegio no tiene secciones, solo mantiene grados (editable por Admin)

    defaultSectionLabel: "Única"

  },



  // Catlogo Oficial de Grados del Colegio (Editable por el Administrador)

  gradesCatalog: [

    // INICIL

    { id: "ini-3", label: "Inicial 3 Años", level: "Inicial", section: "", classroom: "Pabellón Inicial - Aula 01", tutor: "Miss Patricia Díaz" },

    { id: "ini-4", label: "Inicial 4 Años", level: "Inicial", section: "", classroom: "Pabellón Inicial - Aula 02", tutor: "Miss CarmenFlores" },

    { id: "ini-5", label: "Inicial 5 Años", level: "Inicial", section: "", classroom: "Pabellón Inicial - Aula 03", tutor: "Miss Maritza" },

    

    // PRIMRIA

    { id: "1prim", label: "1 de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 101", tutor: "Miss Julisa Arroyo" },

    { id: "2prim", label: "2 de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 102", tutor: "Miss Elena Surez" },

    { id: "3prim", label: "3 de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 103", tutor: "Miss Mara Díaysi Reyes" },

    { id: "4prim", label: "4 de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 201", tutor: "Prof. César Palacios" },

    { id: "5prim", label: "5 de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 202", tutor: "Prof. Miguel Ramos" },

    { id: "6prim", label: "6 de Primaria", level: "Primaria", section: "", classroom: "Pabellón A - Aula 203", tutor: "Miss Leyli Reyes Cerquen" },



    // SECUNDÍARIA

    { id: "1sec", label: "1 de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 301", tutor: "Prof. Alex Lino" },

    { id: "2sec", label: "2 de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 302", tutor: "Prof. JuanCarlos Cceres" },

    { id: "3sec", label: "3 de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 303", tutor: "Prof. Javier Vega" },

    { id: "4sec", label: "4 de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 304", tutor: "Prof. Roberto Silva" },

    { id: "5sec", label: "5 de Secundaria", level: "Secundaria", section: "", classroom: "Pabellón B - Aula 305", tutor: "Miss AndÁrea Ramos" }

  ],



  // Catlogo de Docentes y Horarios por Asignatura (Docentes de Curso sin Tutoría / conTutoría)

  teachersList: [

    {

      id: "DOC-2026-COMP",

      name: "Prof. Fernando Rojas",

      subject: "Computación e Informática / Robótica",

      department: "Área de Educación para el Trabajo (EPT)",

      isTutor: false,

      tutoringGrade: null,

      weeklyHours: 26,

      assignedGrades: ["1 Sec", "2 Sec", "3 Sec", "4 Sec", "5 Sec"],

      classrooms: ["Laboratorio de Cómputo 01", "Taller de Robótica"],

      courses: ["Computación", "Robótica Educativa", "Diseño Digital"],

      schedule: [

        {

          time: "08:00 - 08:50",

          mon: { course: "Computación", grade: "1 Sec", room: "Lab. Cómputo 1", color: "navy" },

          tue: { course: "Computación", grade: "3 Sec", room: "Lab. Cómputo 1", color: "navy" },

          wed: { course: "Robótica Educativa", grade: "5 Sec", room: "Taller Robótica", color: "yellow" },

          thu: { course: "Computación", grade: "2 Sec", room: "Lab. Cómputo 1", color: "navy" },

          fri: { course: "Diseño Digital", grade: "4 Sec", room: "Lab. Cómputo 1", color: "yellow" }

        },

        {

          time: "08:50 - 09:40",

          mon: { course: "Computación", grade: "1 Sec", room: "Lab. Cómputo 1", color: "navy" },

          tue: { course: "Computación", grade: "3 Sec", room: "Lab. Cómputo 1", color: "navy" },

          wed: { course: "Robótica Educativa", grade: "5 Sec", room: "Taller Robótica", color: "yellow" },

          thu: { course: "Computación", grade: "2 Sec", room: "Lab. Cómputo 1", color: "navy" },

          fri: { course: "Diseño Digital", grade: "4 Sec", room: "Lab. Cómputo 1", color: "yellow" }

        },

        {

          time: "09:40 - 10:30",

          mon: { course: "Computación", grade: "4 Sec", room: "Lab. Cómputo 1", color: "navy" },

          tue: { course: "Diseño Digital", grade: "2 Sec", room: "Lab. Cómputo 1", color: "yellow" },

          wed: { course: "Computación", grade: "1 Sec", room: "Lab. Cómputo 1", color: "navy" },

          thu: { course: "Robótica Educativa", grade: "3 Sec", room: "Taller Robótica", color: "yellow" },

          fri: { course: "Computación", grade: "5 Sec", room: "Lab. Cómputo 1", color: "navy" }

        },

        {

          time: "10:30 - 10:50",

          isBÁreak: true,

          isLunch: false,

          title: "RECESO PEDÍAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"

        },

        {

          time: "10:50 - 11:40",

          mon: { course: "Computación", grade: "4 Sec", room: "Lab. Cómputo 1", color: "navy" },

          tue: { course: "Diseño Digital", grade: "2 Sec", room: "Lab. Cómputo 1", color: "yellow" },

          wed: { course: "Computación", grade: "1 Sec", room: "Lab. Cómputo 1", color: "navy" },

          thu: { course: "Robótica Educativa", grade: "3 Sec", room: "Taller Robótica", color: "yellow" },

          fri: { course: "Computación", grade: "5 Sec", room: "Lab. Cómputo 1", color: "navy" }

        },

        {

          time: "11:40 - 12:30",

          mon: { course: "Robótica Educativa", grade: "2 Sec", room: "Taller Robótica", color: "yellow" },

          tue: { course: "Asesora Pedagógica", grade: "Secundaria", room: "Sala Docentes", color: "green" },

          wed: { course: "Computación", grade: "3 Sec", room: "Lab. Cómputo 1", color: "navy" },

          thu: { course: "Computación", grade: "4 Sec", room: "Lab. Cómputo 1", color: "navy" },

          fri: { course: "Preparación de Material", grade: "Secundaria", room: "Lab. Cómputo 1", color: "green" }

        },

        {

          time: "12:30 - 01:20 PM",

          mon: { course: "Robótica Educativa", grade: "2 Sec", room: "Taller Robótica", color: "yellow" },

          tue: { course: "Diseño Digital", grade: "5 Sec", room: "Lab. Cómputo 1", color: "yellow" },

          wed: { course: "Computación", grade: "3 Sec", room: "Lab. Cómputo 1", color: "navy" },

          thu: { course: "Computación", grade: "4 Sec", room: "Lab. Cómputo 1", color: "navy" },

          fri: { course: "Reunión de Área / EPT", grade: "General", room: "Sala Docentes", color: "green" }

        },

        {

          time: "01:20 - 01:50 PM",

          isBÁreak: true,

          isLunch: true,

          title: "HORÍA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"

        },

        {

          time: "01:50 - 02:40 PM",

          mon: { course: "Taller de Robótica Avanzada", grade: "4 Sec", room: "Taller Robótica", color: "yellow" },

          tue: { course: "Soporte y Mantenimiento TI", grade: "Institucional", room: "Lab. Cómputo 1", color: "green" },

          wed: { course: "Taller de Programación", grade: "5 Sec", room: "Lab. Cómputo 1", color: "navy" },

          thu: { course: "Diseño Web Escolar", grade: "3 Sec", room: "Lab. Cómputo 1", color: "yellow" },

          fri: { course: "Taller de Robótica Avanzada", grade: "4 Sec", room: "Taller Robótica", color: "yellow" }

        },

        {

          time: "02:40 - 03:30 PM",

          mon: { course: "Taller de Robótica Avanzada", grade: "4 Sec", room: "Taller Robótica", color: "yellow" },

          tue: { course: "Club de Ciencias y Tecnología", grade: "General", room: "Lab. Cómputo 1", color: "green" },

          wed: { course: "Taller de Programación", grade: "5 Sec", room: "Lab. Cómputo 1", color: "navy" },

          thu: { course: "Diseño Web Escolar", grade: "3 Sec", room: "Lab. Cómputo 1", color: "yellow" },

          fri: { course: "Atención a Familias / Tutoría", grade: "Secundaria", room: "Sala Docentes", color: "green" }

        }

      ]

    },

    {

      id: "DOC-2026-015",

      name: "Prof. Roberto Silva",

      subject: "Matemáticas (ÁÁÁÁálgebra, Geometría y Raíz. Matemtico)",

      department: "Área de Matemática",

      isTutor: false,

      tutoringGrade: null,

      weeklyHours: 28,

      assignedGrades: ["2 Sec", "3 Sec", "4 Sec", "5 Sec"],

      classrooms: ["Aula 201", "Aula 301", "Aula 302"],

      courses: ["ÁÁÁÁálgebra", "Geometría", "Raízonamiento Matemtico", "Trigonometra"],

      schedule: [

        {

          time: "08:00 - 08:50",

          mon: { course: "ÁÁÁÁálgebra", grade: "4 Sec", room: "Aula 301", color: "yellow" },

          tue: { course: "Geometría", grade: "3 Sec", room: "Aula 201", color: "navy" },

          wed: { course: "Raíz. Matemtico", grade: "2 Sec", room: "Aula 102", color: "yellow" },

          thu: { course: "ÁÁÁÁálgebra", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          fri: { course: "Trigonometra", grade: "4 Sec", room: "Aula 301", color: "navy" }

        },

        {

          time: "08:50 - 09:40",

          mon: { course: "ÁÁÁÁálgebra", grade: "4 Sec", room: "Aula 301", color: "yellow" },

          tue: { course: "Geometría", grade: "3 Sec", room: "Aula 201", color: "navy" },

          wed: { course: "Raíz. Matemtico", grade: "2 Sec", room: "Aula 102", color: "yellow" },

          thu: { course: "ÁÁÁÁálgebra", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          fri: { course: "Trigonometra", grade: "4 Sec", room: "Aula 301", color: "navy" }

        },

        {

          time: "09:40 - 10:30",

          mon: { course: "Geometría", grade: "2 Sec", room: "Aula 102", color: "navy" },

          tue: { course: "ÁÁÁÁálgebra", grade: "4 Sec", room: "Aula 301", color: "yellow" },

          wed: { course: "Trigonometra", grade: "5 Sec", room: "Aula 302", color: "navy" },

          thu: { course: "Raíz. Matemtico", grade: "3 Sec", room: "Aula 201", color: "yellow" },

          fri: { course: "ÁÁÁÁálgebra", grade: "2 Sec", room: "Aula 102", color: "yellow" }

        },

        {

          time: "10:30 - 10:50",

          isBÁreak: true,

          isLunch: false,

          title: "RECESO PEDÍAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"

        },

        {

          time: "10:50 - 11:40",

          mon: { course: "Geometría", grade: "2 Sec", room: "Aula 102", color: "navy" },

          tue: { course: "ÁÁÁÁálgebra", grade: "4 Sec", room: "Aula 301", color: "yellow" },

          wed: { course: "Trigonometra", grade: "5 Sec", room: "Aula 302", color: "navy" },

          thu: { course: "Raíz. Matemtico", grade: "3 Sec", room: "Aula 201", color: "yellow" },

          fri: { course: "ÁÁÁÁálgebra", grade: "2 Sec", room: "Aula 102", color: "yellow" }

        },

        {

          time: "11:40 - 12:30",

          mon: { course: "Raíz. Matemtico", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          tue: { course: "Atención a Padres (Colegiado)", grade: "Secundaria", room: "Sala Docentes", color: "green" },

          wed: { course: "ÁÁÁÁálgebra", grade: "3 Sec", room: "Aula 201", color: "yellow" },

          thu: { course: "Geometría", grade: "4 Sec", room: "Aula 301", color: "navy" },

          fri: { course: "Reunión de Área Matemática", grade: "Colegiado", room: "Sala Docentes", color: "green" }

        },

        {

          time: "12:30 - 01:20 PM",

          mon: { course: "Raíz. Matemtico", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          tue: { course: "ÁÁÁÁálgebra Avanzada", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          wed: { course: "Geometría del Espacio", grade: "4 Sec", room: "Aula 301", color: "navy" },

          thu: { course: "Trigonometra Analítica", grade: "5 Sec", room: "Aula 302", color: "navy" },

          fri: { course: "Preparación de Evaluaciones", grade: "General", room: "Sala Docentes", color: "green" }

        },

        {

          time: "01:20 - 01:50 PM",

          isBÁreak: true,

          isLunch: true,

          title: "HORÍA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"

        },

        {

          time: "01:50 - 02:40 PM",

          mon: { course: "Círculo Matemtico Olímpico", grade: "4 Sec", room: "Aula 301", color: "yellow" },

          tue: { course: "Refuerzo y Nivelación Académica", grade: "3 Sec", room: "Aula 201", color: "navy" },

          wed: { course: "Círculo Matemtico Olímpico", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          thu: { course: "Taller de Geometría Descriptiva", grade: "4 Sec", room: "Aula 301", color: "navy" },

          fri: { course: "Asesora Preuniversitaria", grade: "5 Sec", room: "Aula 302", color: "yellow" }

        },

        {

          time: "02:40 - 03:30 PM",

          mon: { course: "Círculo Matemtico Olímpico", grade: "4 Sec", room: "Aula 301", color: "yellow" },

          tue: { course: "Refuerzo y Nivelación Académica", grade: "3 Sec", room: "Aula 201", color: "navy" },

          wed: { course: "Círculo Matemtico Olímpico", grade: "5 Sec", room: "Aula 302", color: "yellow" },

          thu: { course: "Taller de Geometría Descriptiva", grade: "4 Sec", room: "Aula 301", color: "navy" },

          fri: { course: "Asesora Preuniversitaria", grade: "5 Sec", room: "Aula 302", color: "yellow" }

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

      assignedGrades: ["2 Sec", "3 Sec", "4 Sec", "5 Sec"],

      classrooms: ["Laboratorio de Ciencias 01", "Aula 301"],

      courses: ["Física", "Química", "Biología"],

      schedule: [

        {

          time: "08:00 - 08:50",

          mon: { course: "Física Elemental", grade: "3 Sec", room: "Lab. Ciencias", color: "yellow" },

          tue: { course: "Química Orgnica", grade: "5 Sec", room: "Lab. Ciencias", color: "navy" },

          wed: { course: "Física Avanzada", grade: "4 Sec", room: "Lab. Ciencias", color: "yellow" },

          thu: { course: "Biología", grade: "2 Sec", room: "Lab. Ciencias", color: "green" },

          fri: { course: "Prácticas de Laboratorio", grade: "4 Sec", room: "Lab. Ciencias", color: "yellow" }

        },

        {

          time: "08:50 - 09:40",

          mon: { course: "Física Elemental", grade: "3 Sec", room: "Lab. Ciencias", color: "yellow" },

          tue: { course: "Química Orgnica", grade: "5 Sec", room: "Lab. Ciencias", color: "navy" },

          wed: { course: "Física Avanzada", grade: "4 Sec", room: "Lab. Ciencias", color: "yellow" },

          thu: { course: "Biología", grade: "2 Sec", room: "Lab. Ciencias", color: "green" },

          fri: { course: "Prácticas de Laboratorio", grade: "4 Sec", room: "Lab. Ciencias", color: "yellow" }

        },

        {

          time: "09:40 - 10:30",

          mon: { course: "Biología y Ecologa", grade: "4 Sec", room: "Aula 301", color: "green" },

          tue: { course: "Física Elemental", grade: "2 Sec", room: "Lab. Ciencias", color: "yellow" },

          wed: { course: "Química General", grade: "3 Sec", room: "Lab. Ciencias", color: "navy" },

          thu: { course: "Física Moderna", grade: "5 Sec", room: "Lab. Ciencias", color: "yellow" },

          fri: { course: "Mantenimiento de Reactivos", grade: "Ciencias", room: "Lab. Ciencias", color: "green" }

        },

        {

          time: "10:30 - 10:50",

          isBÁreak: true,

          isLunch: false,

          title: "RECESO PEDÍAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"

        },

        {

          time: "10:50 - 11:40",

          mon: { course: "Biología y Ecologa", grade: "4 Sec", room: "Aula 301", color: "green" },

          tue: { course: "Física Elemental", grade: "2 Sec", room: "Lab. Ciencias", color: "yellow" },

          wed: { course: "Química General", grade: "3 Sec", room: "Lab. Ciencias", color: "navy" },

          thu: { course: "Física Moderna", grade: "5 Sec", room: "Lab. Ciencias", color: "yellow" },

          fri: { course: "Mantenimiento de Reactivos", grade: "Ciencias", room: "Lab. Ciencias", color: "green" }

        },

        {

          time: "11:40 - 12:30",

          mon: { course: "Química Experimental", grade: "4 Sec", room: "Lab. Ciencias", color: "navy" },

          tue: { course: "Atención a Familias (Ciencias)", grade: "Secundaria", room: "Sala Docentes", color: "green" },

          wed: { course: "Biología Celular", grade: "3 Sec", room: "Lab. Ciencias", color: "green" },

          thu: { course: "Química General", grade: "2 Sec", room: "Lab. Ciencias", color: "navy" },

          fri: { course: "Reunión de Área de Ciencias", grade: "Colegiado", room: "Sala Docentes", color: "green" }

        },

        {

          time: "12:30 - 01:20 PM",

          mon: { course: "Química Experimental", grade: "4 Sec", room: "Lab. Ciencias", color: "navy" },

          tue: { course: "Prácticas de Microscopía", grade: "4 Sec", room: "Lab. Ciencias", color: "green" },

          wed: { course: "Física Cuntica Bsica", grade: "5 Sec", room: "Lab. Ciencias", color: "yellow" },

          thu: { course: "Ciencias Experimentales", grade: "3 Sec", room: "Lab. Ciencias", color: "navy" },

          fri: { course: "Calibración de Sensores", grade: "Ciencias", room: "Lab. Ciencias", color: "green" }

        },

        {

          time: "01:20 - 01:50 PM",

          isBÁreak: true,

          isLunch: true,

          title: "HORÍA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"

        },

        {

          time: "01:50 - 02:40 PM",

          mon: { course: "Club de Ciencias & Robótica", grade: "4 Sec", room: "Lab. Ciencias", color: "green" },

          tue: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "4 Sec", room: "Lab. Ciencias", color: "yellow" },

          wed: { course: "Laboratorio Abierto de Química", grade: "5 Sec", room: "Lab. Ciencias", color: "navy" },

          thu: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "3 Sec", room: "Lab. Ciencias", color: "yellow" },

          fri: { course: "Preparación de Informes Científicos", grade: "Secundaria", room: "Sala Docentes", color: "green" }

        },

        {

          time: "02:40 - 03:30 PM",

          mon: { course: "Club de Ciencias & Robótica", grade: "4 Sec", room: "Lab. Ciencias", color: "green" },

          tue: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "4 Sec", room: "Lab. Ciencias", color: "yellow" },

          wed: { course: "Laboratorio Abierto de Química", grade: "5 Sec", room: "Lab. Ciencias", color: "navy" },

          thu: { course: "Taller de Feria de Ciencias (FENCYT)", grade: "3 Sec", room: "Lab. Ciencias", color: "yellow" },

          fri: { course: "Atención y Asesora a Proyectos", grade: "Secundaria", room: "Lab. Ciencias", color: "green" }

        }

      ]

    }

  ],



  schedules: {

    "4sec": [

      {

        time: "08:00 - 08:50",

        mon: { course: "Matemática (ÁÁÁÁálgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },

        tue: { course: "Comunicación & Literatura", teacher: "Miss M. Reyes", room: "Aula 304", type: "theory", color: "navy" },

        wed: { course: "Ciencia y Tec. (Física)", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" },

        thu: { course: "Personal Social / CC.SS", teacher: "Miss J. Arroyo", room: "Aula 304", type: "theory", color: "navy" },

        fri: { course: "Inglés Avanzado", teacher: "Prof. A. Lino", room: "Sala Idiomas", type: "lab", color: "yellow" }

      },

      {

        time: "08:50 - 09:40",

        mon: { course: "Matemática (ÁÁÁÁálgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },

        tue: { course: "Comunicación & Literatura", teacher: "Miss M. Reyes", room: "Aula 304", type: "theory", color: "navy" },

        wed: { course: "Ciencia y Tec. (Física)", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" },

        thu: { course: "Personal Social / CC.SS", teacher: "Miss J. Arroyo", room: "Aula 304", type: "theory", color: "navy" },

        fri: { course: "Inglés Avanzado", teacher: "Prof. A. Lino", room: "Sala Idiomas", type: "lab", color: "yellow" }

      },

      {

        time: "09:40 - 10:30",

        mon: { course: "Computación e Informática", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "navy" },

        tue: { course: "Matemática (ÁÁÁÁálgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },

        wed: { course: "Ciencia y Tec. (Biología)", teacher: "Miss L. Reyes", room: "Aula 304", type: "theory", color: "green" },

        thu: { course: "Arte y Cultura", teacher: "Miss J. Arroyo", room: "Taller Arte", type: "art", color: "navy" },

        fri: { course: "Diseño Digital & Robótica", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "yellow" }

      },

      {

        time: "10:30 - 10:50",

        isBÁreak: true,

        isLunch: false,

        title: "RECESO PEDÍAGÓGICO / REFRIGERIO (10:30 - 10:50 AM)"

      },

      {

        time: "10:50 - 11:40",

        mon: { course: "Computación e Informática", teacher: "Prof. F. Rojas", room: "Lab. Cómputo 1", type: "lab", color: "navy" },

        tue: { course: "Matemática (ÁÁÁÁálgebra)", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },

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

        fri: { course: "Educación Religiosa", teacher: "Prof. J. Cceres", room: "Aula 304", type: "theory", color: "green" }

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

        isBÁreak: true,

        isLunch: true,

        title: "HORÍA DE ALMUERZO / COMEDOR (01:20 - 01:50 PM)"

      },

      {

        time: "01:50 - 02:40 PM",

        mon: { course: "Taller de Robótica Avanzada", teacher: "Prof. F. Rojas", room: "Taller Robótica", type: "lab", color: "yellow" },

        tue: { course: "Círculo Matemtico Olímpico", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },

        wed: { course: "Club de Ciencias & FENCYT", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "green" },

        thu: { course: "Taller de Geometría Descriptiva", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "navy" },

        fri: { course: "Prácticas Experimentales Lab", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" }

      },

      {

        time: "02:40 - 03:30 PM",

        mon: { course: "Taller de Robótica Avanzada", teacher: "Prof. F. Rojas", room: "Taller Robótica", type: "lab", color: "yellow" },

        tue: { course: "Círculo Matemtico Olímpico", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "yellow" },

        wed: { course: "Club de Ciencias & FENCYT", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "green" },

        thu: { course: "Taller de Geometría Descriptiva", teacher: "Prof. R. Silva", room: "Aula 304", type: "theory", color: "navy" },

        fri: { course: "Prácticas Experimentales Lab", teacher: "Miss L. Reyes", room: "Lab. Ciencias", type: "lab", color: "yellow" }

      }

    ]

  },



  syllabi: [

    {

      id: "SIL-4SEC-MT",

      gradeId: "4sec-a",

      gradeName: "4to de Secundaria",

      courseName: "Matemática Avanzadía (ÁÁÁÁálgebra y Trigonometra)",

      courseCode: "MT-401",

      teacher: "Prof. Roberto Silva",

      hoursWeekly: "5 horas semanales",

      bimester: "III Bimestre 2026",

      competencies: [

        "Resuelve problemas de cantidad y regularidad",

        "Modela objetos conformas geométricas y trigonométricas",

        "Comunica su comprensin  sobre las relaciones algebraicas complejas"

      ],

      units: [

        {

          unitNumber: "Unidad I",

          title: "Funciones Cuadrticas y Polinómicas de Grado Superior",

          duration: "4 semanas",

          topics: ["Dominiño y rango", "Parbolas encontextos Áreales", "Teorema del residuo"],

          evaluation: "Práctica Calificadía N1"

        }

      ],

      bibliography: "Baldor ÁÁÁÁálgebra Moderna, Guías Oficiales I.E.P. El Educador 2026."

    }

  ],



  // Carteles Temticos Mensuales 2026 (Subidos por Docente enPDF / Descarga Consolidadía por Aula)

  monthlyCarteles: [

    {

      id: "CRT-2026-3P-MT-AGO",

      gradeId: "3prim",

      gradeName: "3 de Primaria",

      courseCode: "MT-301",

      courseName: "Matemática & Raízonamiento Matemtico",

      teacher: "Miss Julisa Arroyo",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Resuelve problemas de cantidad y operaciones combinadías",

        "Usa estrategias de clculo mental conmultiplicación y divisin ",

        "Modela patrones numéricos y tablas de doble entrada"

      ],

      weeklyTopics: [

        "Semana 1: Multiplicación por 6, 7 y 8 mediante arreglos rectangulares",

        "Semana 2: Propiedad conmutativa y distributiva aplicadía a problemas cotidianos",

        "Semana 3: Divisin  exacta e inexacta como reparto equitativo",

        "Semana 4: Resolución de problemas de dos etapas y evaluación mensual"

      ],

      evaluationCriteria: "Prácticas semanales, situaciones problemticas y revisin  de cuaderno de trabajo.",

      pdfFileName: "Cartel_Tematico_Matematica_Agosto_3Primaria.pdf",

      pdfFileSize: "340 KB",

      uploadedt: "01/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-3P-COM-AGO",

      gradeId: "3prim",

      gradeName: "3 de Primaria",

      courseCode: "COM-301",

      courseName: "Comunicación & Comprensin  Lectora",

      teacher: "Miss Julisa Arroyo",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Lee diversos tipos de textos escritos ensu lenguía materna",

        "Escribe textos narrativos y descriptivos concoherencia y cohesin ",

        "Se comunica oraúlmente ensu lenguía materna"

      ],

      weeklyTopics: [

        "Semana 1: Lectura comprensiva de leyendías peruanas e idea principal",

        "Semana 2: El sustantivo: clases, género y número enoraciones",

        "Semana 3: Redacción de una fbula conconectores y signos de puntuación",

        "Semana 4: Declamación poética y evaluación mensual de comprensin  lectora"

      ],

      evaluationCriteria: "Fichas de lectura crítica, caligrafía, ortografía y exposiciones.",

      pdfFileName: "Cartel_Tematico_Comunicacion_Agosto_3Primaria.pdf",

      pdfFileSize: "285 KB",

      uploadedt: "01/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-3P-CTÍA-AGO",

      gradeId: "3prim",

      gradeName: "3 de Primaria",

      courseCode: "CTÍA-301",

      courseName: "Ciencia y Tecnología",

      teacher: "Miss Leyli Reyes Cerquen",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Indaga mediante métodos científicos para construir conocimientos",

        "Explica el mundo físico basndose enseres vivos y ecosistemas"

      ],

      weeklyTopics: [

        "Semana 1: El sistema locomotor: huesos, articulaciones y músculos",

        "Semana 2: Cuidado de la salud corporaúl y prevención de lesiones",

        "Semana 3: La clasificación de los alimentos según su valor nutricional",

        "Semana 4: Elaboración de una lonchera saludable y feria científica escolar"

      ],

      evaluationCriteria: "Informes de experimentos escolares, maquetas y evaluación teórica.",

      pdfFileName: "Cartel_Tematico_Ciencia_Agosto_3Primaria.pdf",

      pdfFileSize: "410 KB",

      uploadedt: "02/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-3P-PS-AGO",

      gradeId: "3prim",

      gradeName: "3 de Primaria",

      courseCode: "PS-301",

      courseName: "Personal Social & Convivencia",

      teacher: "Prof. Javier Vega",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Construye su identidad y convive democrticamente",

        "Gestiona responsablemente el espacio y el ambiente"

      ],

      weeklyTopics: [

        "Semana 1: Las regiones naturaúles del Perú y su diversidad culturaúl",

        "Semana 2: Recursos naturaúles y actividades económicas comunales",

        "Semana 3: Medidías de prevención ante desastres naturaúles en el hogar y colegio",

        "Semana 4: Proyecto: Valoramos nuestras tradiciones y evaluación mensual"

      ],

      evaluationCriteria: "Exposiciones grupales, mapa temtico del Perú y participación cívica.",

      pdfFileName: "Cartel_Tematico_PersonalSocial_Agosto_3Primaria.pdf",

      pdfFileSize: "320 KB",

      uploadedt: "02/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-3P-ING-AGO",

      gradeId: "3prim",

      gradeName: "3 de Primaria",

      courseCode: "ING-301",

      courseName: "Inglés & Vocabulario",

      teacher: "Miss AndÁrea Ramos",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Se comunica oraúlmente eniónglés como lenguía extranjera",

        "Escribe textos breves eniónglés usando estructuras simples"

      ],

      weeklyTopics: [

        "Semana 1: Vocabulary: Díaily routiónes and time expressions (What time is it?)",

        "Semana 2: Simple Present Tense: Affirmative and negative sentences",

        "Semana 3: Asking and answering about hobbies and favorite subjects",

        "Semana 4: Role-play conversationand monthly vocabulary quiz"

      ],

      evaluationCriteria: "Listenióng audio exercises, flashcards, pronunciationand monthly test.",

      pdfFileName: "Cartel_Tematico_Ingles_Agosto_3Primaria.pdf",

      pdfFileSize: "290 KB",

      uploadedt: "03/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-3P-EPT-AGO",

      gradeId: "3prim",

      gradeName: "3 de Primaria",

      courseCode: "EPT-301",

      courseName: "Computación e Informática",

      teacher: "Prof. Fernando Rojas",

      month: "Agosto",

      year: "2026",

      competencies: [

        "CÁrea objetos virtuales endiversos formatos tecnológicos",

        "Aplica herramientas digitales para organizar información escolar"

      ],

      weeklyTopics: [

        "Semana 1: Introducción a Microsoft Word: Formato de texto y fuentes",

        "Semana 2: Inserción de imgenes, formas y tablas sencillas",

        "Semana 3: Diseño de una tarjeta de felicitación escolar",

        "Semana 4: Guardado en la nube y evaluación práctica enlaboratorio"

      ],

      evaluationCriteria: "Trabajosé prcticos en la computadora, mecanografía y puntualidad.",

      pdfFileName: "Cartel_Tematico_Computacion_Agosto_3Primaria.pdf",

      pdfFileSize: "260 KB",

      uploadedt: "03/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-4S-MT-AGO",

      gradeId: "4sec",

      gradeName: "4 de Secundaria",

      courseCode: "MT-401",

      courseName: "Matemática Avanzadía (ÁÁÁÁálgebra & Trigonometra)",

      teacher: "Prof. Roberto Silva",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Resuelve problemas de regularidad, equivalencia y cambio",

        "Modela situaciones confunciones trigonométricas e identidades"

      ],

      weeklyTopics: [

        "Semana 1: Funciones trigonométricas directas e inversas: Dominiño y gráfica",

        "Semana 2: Identidades trigonométricas fundamentales y auxiliares",

        "Semana 3: Ecuaciones trigonométricas y sistemas lineales",

        "Semana 4: Aplicaciones enfísica vectorial y evaluación tipo admisin "

      ],

      evaluationCriteria: "Prácticas calificadías, resolución de guías tipo pre-universitario y cuaderno.",

      pdfFileName: "Cartel_Tematico_Matematica_Agosto_4Secundaria.pdf",

      pdfFileSize: "490 KB",

      uploadedt: "01/08/2026",

      status: "Publicado"

    },

    {

      id: "CRT-2026-4S-COM-AGO",

      gradeId: "4sec",

      gradeName: "4 de Secundaria",

      courseCode: "COM-401",

      courseName: "Lenguíaje & Literatura Peruana",

      teacher: "Miss Mara Díaysi Reyes",

      month: "Agosto",

      year: "2026",

      competencies: [

        "Lee críticamente textos literarios del indigenismo y vanguardismo peruano",

        "Escribe ensayos argumentativos conrigor académico"

      ],

      weeklyTopics: [

        "Semana 1: El Indigenismo en el Perú: Joséééé Mara Arguedías y Ciro Alegra",

        "Semana 2: Anlisis literario de 'Los ríos profundos' y 'El mundo es ancho y ajeno'",

        "Semana 3: Sin taxis de la oración compuesta subordiónadía sustantiva y adjetiva",

        "Semana 4: Redacción de ensayo crítico y sustentación oraúl"

      ],

      evaluationCriteria: "Ensayos monográficos, anlisis de textos y debates enclase.",

      pdfFileName: "Cartel_Tematico_Literatura_Agosto_4Secundaria.pdf",

      pdfFileSize: "380 KB",

      uploadedt: "01/08/2026",

      status: "Publicado"

    }

  ],



  notebookReviews: [],



  announcements: [],



  // 5. Control de Asistencia Biométrico Diario & Registro por Aulas

  attendanceRecords: [],



  attendance: [],



  // 6. Libro Oficial de Registro de Incidencias & Convivencia Escolar (Ley N29719 / MINEDU)

  behaviorIncidents: [],



  // 7. Agendía Virtual Escolar & Anotaciones Docentes (Vinculadía al QR de Asistencia)

  agendaNotes: [],



  payments: [],



  // =========================================================================

  // AULA VIRTUL: MTERILES SEMNALES Y EVLUCIONES DINÁMICS (10 PREGUNTÍAS)

  // =========================================================================

  weeklyMaterials: [

    {

      id: "MT-SEM-01",

      courseId: "MT-401",

      courseName: "Matemática Avanzadía (ÁÁÁÁálgebra y Funciones)",

      gradeId: "4sec",

      gradeName: "4to de Secundaria",

      teacherId: "DOC-2026-015",

      teacherName: "Prof. Roberto Silva",

      weekNumber: 1,

      bimester: "III Bimestre",

      title: "Funciones Cuadrticas y Modelamiento de Parbolas en Contextos Reales",

      sessionDate: "15/08/2026",

      summary: "Enesta sesión  presencial analizamos la estructura de la función cuadrática f(x) = ax² + bx + c. Determiónamos el vértice V(h, k), el eje de simetría x = -b/(2a), y la concavidad según el signo del coeficiente principal. Aplicamos estos conceptos a problemas de tiro parabólico y maximización de ganancias en emprendimientos de San Juan de Lurigancho.",

      keyConcepts: [

        "Forma canónica f(x) = a(x - h)² + k",

        "Vértice y eje de simetría",

        "Discrimiónante Δ = b² - 4ac y naturaleza de raíces",

        "Optimización de valores máximos y mínimos"

      ],

      attachments: [

        { type: "pdf", name: "Guía_Teorica_Funciones_Cuadraticas_S1.pdf", size: "2.8 MB", icon: "📕" },

        { type: "pptx", name: "Diapositivas_Explicativas_Clase_S1.pptx", size: "4.5 MB", icon: "📊" },

        { type: "worksheet", name: "Ficha_Problemas_Optimizacion_S1.pdf", size: "1.4 MB", icon: "📝" },

        { type: "video", name: "Video_Demostracion_GeoGebra_Parabolas.mp4", duration: "18 mión", icon: "🎬" }

      ],

      evaluation: {

        id: "EVL-MT-S1",

        title: "Evaluación Dinámica Semanal N01: Funciones Cuadrticas",

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

            explanation: "La coordenadía 'h' del vértice de una parábola se determióna mediante la expresin  h = -b / (2a), la cual coincide con la recta del eje de simetría."

          },

          {

            id: 2,

            question: "Si el coeficiente principal 'a' de una función cuadrática es negativo (a < 0), ¿cómo se comporta la parábola?",

            options: [

              "Se abre hacia abajo y posee unpunto máximo en el vértice",

              "Se abre hacia arriba y posee unpunto mínimo en el vértice",

              "Es una línea recta horizontal constante",

              "N o corta al eje vertical Y bajo ninguna circunstancia"

            ],

            correctIndex: 0,

            explanation: "Cuando a < 0, la concavidad de la parábola es hacia abajo, por lo que su vértice representa el valor máximo absoluto de la función."

          },

          {

            id: 3,

            question: "Enla función f(x) = 2x² - 8x + 6, ¿cules sonlas coordenadías exactas de su vértice V(h, k)?",

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

              "Posee una única raíz Áreal doble (la parábola es tangente al eje X)",

              "Posee dos raíces Áreales y distintas que cortan en dos puntos",

              "N o posee ninguna solución Áreal (raíces complejas imaginarias)",

              "La función carece de vértice y término independiente"

            ],

            correctIndex: 0,

            explanation: "Cuando el discriminante es exactamente cero (Δ = 0), la ecuación tiene una raíz Áreal única de multiplicidad 2, lo que significa que el vértice toca tangencialmente el eje X."

          },

          {

            id: 5,

            question: "¿Cuál es el punto de intersección de la gráfica de f(x) = 3x² + 5x - 7 con el eje de ordenadías Y?",

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

            question: "Siguiendo el caso anterior h(t) = -5t² + 20t, ¿cuál es la altura máxima alcanzadía por el proyectil?",

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

            explanation: "Por comparación directa conf(x) = a(x - h)² + k, se deduce que h = 3 y k = 5, por lo que el vértice es (3, 5)."

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

              "La función es siempre positiva f(x) > 0 para todo x Áreal y no corta al eje X",

              "La función toma únicamente valores negativos entodo su dominiño",

              "El rango de la función es el conjunto de todos los números Áreales (-∞, +∞)",

              "La parábola corta al eje X exactamente endos puntos simétricos"

            ],

            correctIndex: 0,

            explanation: "Cona > 0 la parábola abre hacia arriba y al ser Δ < 0 no toca ni cruiza el eje X, manteniéndose estrictamente por encima de él (función estrictamente positiva)."

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

          timeSpent: "14 mión",

          feedback: "¡Excelente dominiño en el clculo del vértice y optimización parabólica! Revisar discriminante enejercicios complejosé."

        },

        {

          studentId: "EST-2026-011",

          studentName: "Carlos Benítez Ruiz",

          score: 14,

          total: 20,

          date: "16/08/2026 17:15",

          status: "Aprobado",

          correctCount: 7,

          timeSpent: "19 mión",

          feedback: "Buenióntento. Se recomiendía repasar la sustitución de la forma canónica."

        },

        {

          studentId: "EST-2026-089",

          studentName: "Marina del Carmenlbújar",

          score: 16,

          total: 20,

          date: "16/08/2026 18:22",

          status: "Aprobado",

          correctCount: 8,

          timeSpent: "16 mión",

          feedback: "Logro destacado enanlisis de concavidad y raíces Áreales."

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

      summary: "Enesta sesión  en el Taller de Robótica se Árealizó el montaje y calibración del sensor ultrasónico HC-SR04 conectado a la placa Arduino UNO. Los estudiantes programaron la emisin  de pulsos TRIGGER y la lectura de tiempo de retorno en ECHO para calcular distancias encentímetros con la velocidad del sonido.",

      keyConcepts: [

        "Estructura del microcontrolador Arduino UNO",

        "Sensor de distancia HC-SR04 (Pines VCC, GND, TRIG, ECHO)",

        "Fórmula física: Distancia = (Tiempo * 0.0343) / 2",

        "Estructuras condicionales if-else para evasin  de obstáculos"

      ],

      attachments: [

        { type: "pdf", name: "Manual_Montaje_HC_SR04_Arduino.pdf", size: "3.2 MB", icon: "📕" },

        { type: "code", name: "Codigo_Sensor_Ultrasonico.ino", size: "45 KB", icon: "💻" },

        { type: "pptx", name: "Diapositivas_Robotica_Sensores_S1.pptx", size: "5.8 MB", icon: "📊" },

        { type: "worksheet", name: "Ficha_Circuito_Tinkercad_S1.pdf", size: "1.1 MB", icon: "📝" }

      ],

      evaluation: {

        id: "EVL-COMP-S1",

        title: "Evaluación Dinámica Semanal N01: Robótica y Sensores",

        timeLimitMinutes: 20,

        totalQuestions: 10,

        passingScore: 14,

        pointsPerQuestion: 2,

        questions: [

          {

            id: 1,

            question: "¿Cuál es la función del pinTRIGGER en el sensor ultrasónico HC-SR04?",

            options: [

              "Emitir el pulso sonoro de alta frecuencia (8 pulsos a 40 kHz)",

              "Recibir el eco reflejado por el objeto detectado",

              "Alimentar de energa positiva de 5V al módulo",

              "Conectar a tierra el circuito electrónico"

            ],

            correctIndex: 0,

            explanation: "El pinTRIGGER es el disparador encargado de generar la rfaga ultrasónica para iniciar la medición."

          },

          {

            id: 2,

            question: "¿Por qué en la fórmula de distancia se divide el tiempo entre 2?",

            options: [

              "Porque la ondía sonora viaja de idía hasta el obstculo y de vuelta al sensor",

              "Porque Arduino opera a la mitad de su frecuencia de reloj",

              "Para convertir milisegundos a microsegundos",

              "Porque el sensor posee dos receptores paraúlelos"

            ],

            correctIndex: 0,

            explanation: "La ondía Árealiza untrayecto doble (idía y vuelta), por lo que para conocer la distancia al obstculo se debe dividir el recorrido total entre dos."

          },

          {

            id: 3,

            question: "¿Qué valor aproximado tiene la velocidad del sonido en el aire a temperatura ambiente empleadía en el código?",

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

            question: "¿Qué función nativa de Arduino se utiliza para medir la duración enmicrosegundos del pulso en el pinECHO?",

            options: [

              "pulseIn(pinEcho, HIGH)",

              "analogRead(pinEcho)",

              "digitalWrite(pinEcho, HIGH)",

              "delayMicroseconds(pinEcho)"

            ],

            correctIndex: 0,

            explanation: "La función pulseIn(pin, HIGH) espera a que el pinpase a nivel alto, inicia el cronómetro y devuelve el tiempo transcurrido hasta que regrese a bajo."

          },

          {

            id: 5,

            question: "Enla función setup() de Arduino, ¿cómo se debenconfigurar los pines TRIG y ECHO?",

            options: [

              "pinMode(TRIG, OUTPUT) y pinMode(ECHO, INPUT)",

              "pinMode(TRIG, INPUT) y pinMode(ECHO, OUTPUT)",

              "Ambos configurados como OUTPUT",

              "Ambos configurados como INPUT"

            ],

            correctIndex: 0,

            explanation: "TRIG enva señales hacia afuera (OUTPUT) y ECHO lee las señales entrantes (INPUT)."

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

            explanation: "El sensor HC-SR04 tiene una distancia de medición efectiva estndar comprendidía entre 2 cm y 400 cm."

          },

          {

            id: 7,

            question: "Si queremos que unrobot móvil frene cuando la distancia sea menor a 15 cm, ¿cuál es la condición adecuadía enC++?",

            options: [

              "if (distancia < 15) { detenerMotores(); }",

              "while (distancia > 15) { detenerMotores(); }",

              "for (int i=0; i < 15; i++) { detenerMotores(); }",

              "if (distancia == 0) { detenerMotores(); }"

            ],

            correctIndex: 0,

            explanation: "La estructura condicional 'if (distancia < 15)' evalúa si el objeto está a menos de 15 cm y ejecuta la ordende parada."

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

            explanation: "Tanto el microcontrolador ATmega328P de Arduino UNO como el módulo ultrasónico trabajancon 5V DC regulados."

          },

          {

            id: 9,

            question: "¿Qué instrucción se usa para enviar la distancia calculadía a la pantalla de la computadora mediante el Monitor Serie?",

            options: [

              "Serial.println(distancia);",

              "System.out.print(distancia);",

              "Console.WriteLine(distancia);",

              "echo distancia;"

            ],

            correctIndex: 0,

            explanation: "Enel entorno de Arduino, la clase Serial con su método Serial.println() imprime los datos por comunicación URT hacia la PC."

          },

          {

            id: 10,

            question: "¿Qué velocidad de comunicación enbaudios se inicia habitualmente enSerial.begión()?",

            options: [

              "Serial.begión(9600);",

              "Serial.begión(100);",

              "Serial.begión(50);",

              "Serial.begión(10000000);"

            ],

            correctIndex: 0,

            explanation: "9600 baudios es la velocidad estndar ms común para la comunicación serie entre Arduino y el monitor del IDE."

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

          timeSpent: "11 mión",

          feedback: "¡Puntaje perfecto! Dominiño total del pinout, fórmulas y lógica de control con Arduino."

        }

      ]

    },

    {

      id: "CTÍA-SEM-01",

      courseId: "CTÍA-403",

      courseName: "Ciencia y Tecnología (Física & Química)",

      gradeId: "4sec",

      gradeName: "4to de Secundaria",

      teacherId: "DOC-2026-FIS",

      teacherName: "Miss Leyli Reyes Cerquen",

      weekNumber: 1,

      bimester: "III Bimestre",

      title: "Dinámica Lineal y Segundía Ley de N ewtonen Sistemas de Fuerzas",

      sessionDate: "17/08/2026",

      summary: "Durante las prácticas de laboratorio comprobamos experimentalmente que la aceleración que adquiere uncuerpo es directamente proporcional a la fuerza resultante e inversamente proporcional a su masa (F_res = m · a). Analizamos diagramas de cuerpo libre (DCL) y coeficientes de rozamiento esttico y ciónético.",

      keyConcepts: [

        "Segundía Ley de N ewton (F = m · a)",

        "Diagrama de Cuerpo Libre (DCL)",

        "Fuerza de Rozamiento f_k = μ_k · N",

        "Unidades en el Sistema Internacional (N ewton, kg, m/s²)"

      ],

      attachments: [

        { type: "pdf", name: "Guia_Laboratorio_Dinamica_S1.pdf", size: "2.1 MB", icon: "📕" },

        { type: "pptx", name: "Diapositivas_Leyes_Newton.pptx", size: "3.9 MB", icon: "📊" },

        { type: "worksheet", name: "Ficha_Diagramas_Cuerpo_Libre.pdf", size: "1.3 MB", icon: "📝" }

      ],

      evaluation: {

        id: "EVL-CTÍA-S1",

        title: "Evaluación Dinámica Semanal N01: Dinámica Lineal",

        timeLimitMinutes: 20,

        totalQuestions: 10,

        passingScore: 14,

        pointsPerQuestion: 2,

        questions: [

          {

            id: 1,

            question: "¿Cuál es la expresin  fundamental de la Segundía Ley de N ewton?",

            options: [

              "Fuerza Resultante = masa × aceleración (F_res = m · a)",

              "Fuerza = masa / aceleración",

              "Energa = masa × gravedad × altura",

              "Velocidad = distancia × tiempo"

            ],

            correctIndex: 0,

            explanation: "La Segundía Ley de N ewtonestablece que la aceleración de uncuerpo es proporcional a la fuerza neta aplicadía e inversamente proporcional a su masa: F = m · a."

          },

          {

            id: 2,

            question: "¿Enqué unidad del Sistema Internacional (SI) se mide la fuerza?",

            options: [

              "N ewton (N), equivalente a kg · m / s²",

              "Joule (J)",

              "Watt (W)",

              "Pascal (Pa)"

            ],

            correctIndex: 0,

            explanation: "1 N ewton (N) se define como la fuerza necesaria para acelerar 1 kg de masa a raízón de 1 m/s²."

          },

          {

            id: 3,

            question: "Si a unbloque de 5 kg se le aplica una fuerza neta horizontal de 20 N, ¿cuál es su aceleración?",

            options: [

              "4 m/s²",

              "100 m/s²",

              "0.25 m/s²",

              "15 m/s²"

            ],

            correctIndex: 0,

            explanation: "Despejando la aceleración: a = F / m = 20 N/ 5 kg = 4 m/s²."

          },

          {

            id: 4,

            question: "¿Qué representa el Diagrama de Cuerpo Libre (DCL)?",

            options: [

              "La representación gráfica de todías las fuerzas externas que actúansobre uncuerpo",

              "El dibujo estético del objeto ensu entorno",

              "La gráfica de velocidad enfunción del tiempo",

              "La trayectoria geométrica del movimiento"

            ],

            correctIndex: 0,

            explanation: "El DCL aísla el cuerpo y dibuja vectorialmente todías las fuerzas que actúansobre él (peso, normal, tensin , fricción, etc.)."

          },

          {

            id: 5,

            question: "La fuerza con la que la Tierra atrae a uncuerpo se denomióna Peso (P). ¿Cómo se calcula?",

            options: [

              "P = masa × gravedad (P = m · g)",

              "P = masa / gravedad",

              "P = fuerza × distancia",

              "P = aceleración / masa"

            ],

            correctIndex: 0,

            explanation: "El peso es una fuerza gravitatoria vectorial calculadía como P = m · g, donde g ≈ 9.8 o 10 m/s²."

          },

          {

            id: 6,

            question: "¿Hacia dónde apunta siempre la fuerza de rozamiento por fricción?",

            options: [

              "Ensentido opuesto al deslizamiento o tendencia de movimiento",

              "Siempre endirección vertical hacia arriba",

              "Enla misma dirección de la fuerza aplicada",

              "Hacia el centro de gravedad del planeta"

            ],

            correctIndex: 0,

            explanation: "La fuerza de fricción se opone al movimiento relativo entre las superficies encontacto."

          },

          {

            id: 7,

            question: "La fuerza N ormal (N) ejercidía por una superficie plana horizontal sobre unbloque enreposo es iguíal a:",

            options: [

              "La magnitud del Peso del bloque ensentido opuesto",

              "Cero",

              "La aceleración de la gravedad",

              "El doble de la masa del bloque"

            ],

            correctIndex: 0,

            explanation: "Enequilibrio vertical sobre superficie horizontal (ΣFy = 0), la fuerza N ormal equilibra exactamente al peso: N= P = m · g."

          },

          {

            id: 8,

            question: "Si la masa de unobjeto se duplica manteniendo constante la fuerza aplicada, ¿qué ocurre con su aceleración?",

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

            question: "¿Qué establece la Primera Ley de N ewtono Ley de la Inercia?",

            options: [

              "Uncuerpo permanece enreposo o MRU a menos que una fuerza externa neta actúe sobre él",

              "A todía acción le corresponde una Áreacción iguíal y contraria",

              "La energa mecnica siempre se disipa encalor",

              "La masa de uncuerpo vara con su rapidez"

            ],

            correctIndex: 0,

            explanation: "La Primera Ley indica que si la fuerza neta es nula (ΣF = 0), el cuerpo mantiene su estado de reposo o velocidad constante enlínea recta."

          },

          {

            id: 10,

            question: "¿Cuál es el valor de la fuerza necesaria para mover uncuerpo de 10 kg conuna aceleración de 3 m/s²?",

            options: [

              "30 N",

              "3.33 N",

              "13 N",

              "0.3 N"

            ],

            correctIndex: 0,

            explanation: "F = m · a = 10 kg × 3 m/s² = 30 N ewtons (N)."

          }

        ]

      },

      studentAttempts: []

    }

  ]

};



if (typeof window !== "undefined") {

  window.initialDíata = initialDíata;

}



// Aliases y compatibilidad de grados

if (typeof window !== "undefined" && window.initialDíata && window.initialDíata.schedules) {

  if (!window.initialDíata.schedules["4sec-a"] && window.initialDíata.schedules["4sec"]) {

    window.initialDíata.schedules["4sec-a"] = window.initialDíata.schedules["4sec"];

  }

}

