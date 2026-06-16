import React, { useState, useEffect } from 'react'

// Iconos SVG en línea para no depender de dependencias externas
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="18" y2="10" />
  </svg>
)

const PatientsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
)

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

// Helper para obtener fecha local en formato YYYY-MM-DD sin desvíos de huso horario
function getLocalDateString(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function App() {
  const [activeTab, setActiveTab] = useState('agenda')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Datos globales
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [expenses, setExpenses] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  
  // Filtros
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [searchQuery, setSearchQuery] = useState('')
  
  // Agenda: Día de referencia para la vista semanal (por defecto hoy)
  const [calendarReferenceDate, setCalendarReferenceDate] = useState(new Date())

  // Ficha Paciente Activo (Detalle + Historia Clínica)
  const [activePatient, setActivePatient] = useState(null)
  const [activePatientHistory, setActivePatientHistory] = useState([])

  // Modales
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddAppt, setShowAddAppt] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddHistory, setShowAddHistory] = useState(false)
  const [historyFormType, setHistoryFormType] = useState('ingreso') // 'ingreso' o 'sesion'

  // Editando
  const [editingPatient, setEditingPatient] = useState(null)
  const [editingAppt, setEditingAppt] = useState(null)

  // Formularios State
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    email: '',
    birth_date: '',
    dni: '',
    address: '',
    locality: '',
    occupation: '',
    civil_status: ''
  })
  const [apptForm, setApptForm] = useState({ patient_id: '', date: '', time: '', type: 'seguimiento', price: 10000, notes: '' })
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'insumos', date: '' })
  
  const getInitialHistoryFormState = (type, lastHistory = null) => {
    const baseState = {
      // General Header info
      reason: '',
      time: '',
      therapist: '',
      students: '',
      
      // ALICIA pain assessment
      alicia: {
        a_onset: '',
        l_location: '',
        i_intensity: '',
        c_character: '',
        i_radiation: '',
        ag_aggravating: '',
        at_relieving: '',
        ac_associated: ''
      },
      
      // Western diagnosis / current illness
      western_diagnosis: '',
      
      // Systems review
      temperature: '',
      thirst_sweat: '',
      sleep: '',
      shen: '',
      head: '',
      respiratory: '',
      cardiovascular: '',
      digestive: '',
      excretor_orina: '',
      excretor_heces: '',
      urinary: '',
      gynecology: '',
      
      // Controls & Apertures
      control: {
        joints_bones: '',
        blood_vessels: '',
        tendons: '',
        muscles: '',
        skin: ''
      },
      openings: {
        hearing: '',
        vision: '',
        speech: '',
        taste: '',
        smell: ''
      },
      
      // Medical history
      personal_history: '',
      family_history: '',
      
      // Tongue diagnosis
      tongue: {
        dentada: false,
        gruesa: false,
        delgada: false,
        punto_rojo: false,
        peladez: false,
        grieta: false,
        contorno: false,
        body_shape: '',
        body_added: '',
        body_color: '',
        coating_shape: '',
        coating_color: '',
        notes: ''
      },
      
      // Pulses (Right and Left)
      pulses: {
        right: {
          sup: { chi: '', guan: '', cun: '' },
          med: { chi: '', guan: '', cun: '' },
          prof: { chi: '', guan: '', cun: '' },
          desc_general: '',
          frequency: '',
          tension: '',
          diameter: '',
          force: '',
          occlusion: '',
          waveform: ''
        },
        left: {
          sup: { chi: '', guan: '', cun: '' },
          med: { chi: '', guan: '', cun: '' },
          prof: { chi: '', guan: '', cun: '' },
          desc_general: '',
          frequency: '',
          tension: '',
          diameter: '',
          force: '',
          occlusion: '',
          waveform: ''
        }
      },
      
      // TCM Pathogens
      pathogens: {
        internal: { viento: false, frio: false, calor: false, humedad: false, sequedad: false, fuego: false },
        external: { viento: false, frio: false, calor: false, humedad: false, sequedad: false, fuego: false }
      },
      
      // 5 Elements (Qi, Xue, FO vs Def, Est, Inv/Q)
      elements_5: {
        qi: { def: false, est: false, inv: false },
        xue: { def: false, est: false, inv: false },
        fo: { def: false, est: false, inv: false }
      },
      
      // Affected organs & meridians
      affected_organs: {
        yin: { p: false, b: false, c: false, r: false, pc: false, h: false },
        yang: { ig: false, e: false, id: false, v: false, sj: false, vb: false }
      },
      affected_meridians: {
        yin: { p: false, b: false, c: false, r: false, pc: false, h: false },
        yang: { ig: false, e: false, id: false, v: false, sj: false, vb: false }
      },
      
      // Extraordinary vessels
      extraordinary_vessels: {
        yin_wei_mai: false, yin_quiao_mai: false, dai_mai: false, ren_mai: false,
        yang_wei_mai: false, yang_quiao_mai: false, chong_mai: false, du_mai: false
      },
      
      // Ba Gang
      ba_gang: {
        int: false, ext: false, q: false, frio: false, def: false, exc: false, yin: false, yang: false
      },
      
      // Treatment plan
      syndromes: '',
      treatment_principle: '',
      treatment_spirit: { tonif: false, disper: false, elimin: false, purgar: false, enfriar: false, calent: false, armon: false },
      recipe_technique: '',
      therapies: { tuina: false, ventosas: false, moxa: false, electro: false },
      notes: '',
      
      // Follow-up specific fields
      session_number: 1,
      evolution_type: 'igual', // mejor, igual, peor
      evolution_reason: '',
      evolution_general: ''
    }

    if (type === 'sesion' && lastHistory) {
      const prevData = lastHistory.data || {}
      return {
        ...baseState,
        therapist: prevData.therapist || '',
        students: prevData.students || '',
        treatment_principle: prevData.treatment_principle || '',
        recipe_technique: prevData.recipe_technique || '',
        tongue: prevData.tongue ? { ...prevData.tongue } : { ...baseState.tongue },
        pulses: prevData.pulses ? JSON.parse(JSON.stringify(prevData.pulses)) : { ...baseState.pulses },
        treatment_spirit: prevData.treatment_spirit ? { ...prevData.treatment_spirit } : { ...baseState.treatment_spirit },
        therapies: prevData.therapies ? { ...prevData.therapies } : { ...baseState.therapies }
      }
    }
    return baseState
  }

  const [historyForm, setHistoryForm] = useState(() => getInitialHistoryFormState('ingreso'))
  const [historyFormTab, setHistoryFormTab] = useState('reason')

  const handleOpenAddHistory = (type) => {
    setHistoryFormType(type)
    const lastHistory = activePatientHistory.length > 0 ? activePatientHistory[0] : null
    const count = activePatientHistory.filter(h => h.type === 'sesion').length
    const nextSessionNum = count + 1

    const initialFormState = getInitialHistoryFormState(type, lastHistory)
    initialFormState.session_number = nextSessionNum
    
    if (lastHistory && lastHistory.data) {
      initialFormState.therapist = lastHistory.data.therapist || ''
      initialFormState.students = lastHistory.data.students || ''
    }
    
    setHistoryForm(initialFormState)
    setHistoryFormTab('reason')
    setShowAddHistory(true)
  }

  // Cargar datos al iniciar
  useEffect(() => {
    fetchPatients()
    fetchExpenses()
    fetchDashboardStats()
    fetchAppointments()
  }, [selectedMonth])

  // Cambiar tema
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    document.body.classList.toggle('dark-theme')
  }

  // Desaparecer alertas automáticamente
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(''), 6000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMsg])

  // -------------------------------------------------------------
  // FETCH METHODS
  // -------------------------------------------------------------

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients')
      const data = await res.json()
      if (res.ok) setPatients(data)
    } catch (e) {
      console.error("Error cargando pacientes:", e)
    }
  }

  const fetchAppointments = async () => {
    try {
      // Pedir rango de 30 días alrededor de la fecha de referencia para no saturar
      const start = new Date(calendarReferenceDate)
      start.setDate(start.getDate() - 15)
      const end = new Date(calendarReferenceDate)
      end.setDate(end.getDate() + 15)
      
      const startStr = getLocalDateString(start)
      const endStr = getLocalDateString(end)

      const res = await fetch(`/api/appointments?start_date=${startStr}&end_date=${endStr}`)
      const data = await res.json()
      if (res.ok) setAppointments(data)
    } catch (e) {
      console.error("Error cargando turnos:", e)
    }
  }

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses')
      const data = await res.json()
      if (res.ok) setExpenses(data)
    } catch (e) {
      console.error("Error cargando gastos:", e)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(`/api/dashboard/stats?month=${selectedMonth}`)
      const data = await res.json()
      if (res.ok) setDashboardStats(data)
    } catch (e) {
      console.error("Error cargando estadísticas:", e)
    }
  }

  const fetchPatientHistory = async (patientId) => {
    try {
      const res = await fetch(`/api/clinical-histories/patient/${patientId}`)
      const data = await res.json()
      if (res.ok) setActivePatientHistory(data)
    } catch (e) {
      console.error("Error cargando historia clínica:", e)
    }
  }

  // -------------------------------------------------------------
  // PATIENT ACTIONS
  // -------------------------------------------------------------

  const handlePatientSubmit = async (e) => {
    e.preventDefault()
    const method = editingPatient ? 'PUT' : 'POST'
    const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(editingPatient ? 'Paciente actualizado con éxito' : 'Paciente creado con éxito')
        fetchPatients()
        setShowAddPatient(false)
        setEditingPatient(null)
        setPatientForm({
          name: '',
          phone: '',
          email: '',
          birth_date: '',
          dni: '',
          address: '',
          locality: '',
          occupation: '',
          civil_status: ''
        })
      } else {
        setErrorMsg(data.error || 'Ocurrió un error')
      }
    } catch (err) {
      setErrorMsg('Error de red')
    }
  }

  const startEditPatient = (p) => {
    setEditingPatient(p)
    setPatientForm({
      name: p.name,
      phone: p.phone || '',
      email: p.email || '',
      birth_date: p.birth_date || '',
      dni: p.dni || '',
      address: p.address || '',
      locality: p.locality || '',
      occupation: p.occupation || '',
      civil_status: p.civil_status || ''
    })
    setShowAddPatient(true)
  }

  const deletePatient = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este paciente? Se borrará también su agenda e historia clínica.')) return
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg('Paciente eliminado')
        if (activePatient && activePatient.id === id) setActivePatient(null)
        fetchPatients()
        fetchAppointments()
        fetchDashboardStats()
      }
    } catch (e) {
      setErrorMsg('Error al eliminar paciente')
    }
  }

  const selectActivePatient = (p) => {
    setActivePatient(p)
    fetchPatientHistory(p.id)
    setActiveTab('historia')
  }

  // -------------------------------------------------------------
  // APPOINTMENT ACTIONS
  // -------------------------------------------------------------

  const handleApptSubmit = async (e) => {
    e.preventDefault()
    const method = editingAppt ? 'PUT' : 'POST'
    const url = editingAppt ? `/api/appointments/${editingAppt.id}` : '/api/appointments'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptForm)
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg(editingAppt ? 'Turno actualizado con éxito' : 'Turno agendado con éxito')
        fetchAppointments()
        fetchDashboardStats()
        setShowAddAppt(false)
        setEditingAppt(null)
      } else {
        setErrorMsg(data.error || 'Conflicto de horario o error')
      }
    } catch (err) {
      setErrorMsg('Error de conexión con el servidor')
    }
  }

  const startEditAppt = (appt) => {
    setEditingAppt(appt)
    setApptForm({
      patient_id: appt.patient_id,
      date: appt.date,
      time: appt.time,
      type: appt.type,
      price: appt.price,
      status: appt.status,
      notes: appt.notes || ''
    })
    setShowAddAppt(true)
  }

  const completeAppt = async (appt) => {
    try {
      const res = await fetch(`/api/appointments/${appt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completado' })
      })
      if (res.ok) {
        setSuccessMsg('Turno completado. Se ha registrado el ingreso financiero.')
        fetchAppointments()
        fetchDashboardStats()
      }
    } catch (e) {
      setErrorMsg('Error al actualizar turno')
    }
  }

  const cancelAppt = async (appt) => {
    try {
      const res = await fetch(`/api/appointments/${appt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' })
      })
      if (res.ok) {
        setSuccessMsg('Turno cancelado.')
        fetchAppointments()
        fetchDashboardStats()
      }
    } catch (e) {
      setErrorMsg('Error al cancelar turno')
    }
  }

  // -------------------------------------------------------------
  // EXPENSE ACTIONS
  // -------------------------------------------------------------

  const handleExpenseSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          category: expenseForm.category,
          date: expenseForm.date
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg('Gasto registrado con éxito')
        fetchExpenses()
        fetchDashboardStats()
        setShowAddExpense(false)
        setExpenseForm({ description: '', amount: '', category: 'insumos', date: '' })
      } else {
        setErrorMsg(data.error || 'Ocurrió un error')
      }
    } catch (e) {
      setErrorMsg('Error al conectar con la API')
    }
  }

  const deleteExpense = async (id) => {
    if (!window.confirm('¿Deseas eliminar este registro de gasto?')) return
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSuccessMsg('Gasto eliminado')
        fetchExpenses()
        fetchDashboardStats()
      }
    } catch (e) {
      setErrorMsg('Error al eliminar registro')
    }
  }

  // -------------------------------------------------------------
  // CLINICAL HISTORY ACTIONS
  // -------------------------------------------------------------

  const handleHistorySubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/clinical-histories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: activePatient.id,
          type: historyFormType,
          data: historyForm
        })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg('Nueva ficha añadida a la historia clínica')
        fetchPatientHistory(activePatient.id)
        setShowAddHistory(false)
        setHistoryForm(getInitialHistoryFormState('ingreso'))
      } else {
        setErrorMsg(data.error || 'Error al guardar la ficha')
      }
    } catch (e) {
      setErrorMsg('Error de red al guardar la ficha clínica')
    }
  }

  // -------------------------------------------------------------
  // CALENDAR CALCULATION HELPERS
  // -------------------------------------------------------------
  
  // Obtener días de la semana activa a partir de la fecha de referencia (Lunes a Sábado)
  const getWeekDates = (refDate) => {
    const temp = new Date(refDate)
    const day = temp.getDay()
    // Ajustar para que el Lunes sea el primer día de la semana
    const diff = temp.getDate() - day + (day === 0 ? -6 : 1) 
    const monday = new Date(temp.setDate(diff))
    
    const dates = []
    for (let i = 0; i < 6; i++) { // Lunes a Sábado
      const nextDay = new Date(monday)
      nextDay.setDate(monday.getDate() + i)
      dates.push(nextDay)
    }
    return dates
  }

  const weekDays = getWeekDates(calendarReferenceDate)

  const navigateWeek = (weeksOffset) => {
    const newDate = new Date(calendarReferenceDate)
    newDate.setDate(newDate.getDate() + (weeksOffset * 7))
    setCalendarReferenceDate(newDate)
  }

  useEffect(() => {
    fetchAppointments()
  }, [calendarReferenceDate])

  const openQuickAppt = (dateStr, hourStr) => {
    setEditingAppt(null)
    setApptForm({
      patient_id: patients[0]?.id || '',
      date: dateStr,
      time: hourStr,
      type: 'seguimiento',
      price: 10000,
      notes: ''
    })
    setShowAddAppt(true)
  }

  // -------------------------------------------------------------
  // RENDER SECTIONS
  // -------------------------------------------------------------

  // 1. DASHBOARD RENDER
  const renderDashboard = () => {
    if (!dashboardStats) return <div className="glass-card">Cargando estadísticas...</div>
    const { stats, history } = dashboardStats

    return (
      <div>
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-value">{stats.totalPatients}</div>
              <div className="stat-label">Pacientes Registrados</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <div className="stat-value">{stats.newPatients}</div>
              <div className="stat-label">Nuevos Pacientes (Mes)</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <div className="stat-value">{stats.followUps}</div>
              <div className="stat-label">Seguimientos (Mes)</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon">💵</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                ${stats.totalIncome.toLocaleString()}
              </div>
              <div className="stat-label">Ingresos (Mes)</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon">💸</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--status-cancelled)' }}>
                ${stats.totalExpense.toLocaleString()}
              </div>
              <div className="stat-label">Gastos (Mes)</div>
            </div>
          </div>
        </div>

        <div className="dashboard-layout">
          {/* Gráfico histórico */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>Progreso Pacientes Nuevos vs. Seguimiento</h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--primary)' }}>● Nuevo</span>
                <span style={{ color: 'var(--accent)' }}>● Seguimiento</span>
              </div>
            </div>
            
            <div className="bar-chart-container">
              {history && history.map((h, i) => {
                const maxVal = Math.max(...history.map(x => x.newPatients + x.followUps), 10)
                const newHeight = (h.newPatients / maxVal) * 140
                const followHeight = (h.followUps / maxVal) * 140

                return (
                  <div key={i} className="bar-column">
                    <div className="bar-dual">
                      <div 
                        className="bar-fill bar-new" 
                        style={{ height: `${newHeight}px` }} 
                        data-value={`${h.newPatients} Nuevos`}
                      ></div>
                      <div 
                        className="bar-fill bar-follow" 
                        style={{ height: `${followHeight}px` }} 
                        data-value={`${h.followUps} Seg.`}
                      ></div>
                    </div>
                    <span className="bar-label">{h.monthName}</span>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Los gráficos representan la actividad acumulada y facturada por mes.
            </p>
          </div>

          {/* Turnos del día */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>Agenda del Día</h3>
              <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setActiveTab('agenda')}>Ver Agenda</button>
            </div>
            {appointments.filter(a => a.date === getLocalDateString(new Date())).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                No hay turnos agendados para hoy.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {appointments
                  .filter(a => a.date === getLocalDateString(new Date()))
                  .map(a => (
                    <div 
                      key={a.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '0.85rem',
                        borderLeft: `4px solid ${a.type === 'nuevo' ? 'var(--accent)' : 'var(--primary)'}`,
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '0 8px 8px 0'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.95rem' }}>{a.patient_name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          🕒 {a.time} ({a.duration} min) — {a.type === 'nuevo' ? 'Ficha Inicial' : 'Seguimiento'}
                        </span>
                      </div>
                      <div>
                        {a.status === 'pendiente' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => completeAppt(a)}>✓</button>
                            <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => cancelAppt(a)}>✗</button>
                          </div>
                        ) : (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            backgroundColor: a.status === 'completado' ? '#e1f5fe' : '#ffebee',
                            color: a.status === 'completado' ? 'var(--primary-dark)' : 'var(--status-cancelled)',
                            fontWeight: '600'
                          }}>
                            {a.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 2. AGENDA RENDER
  const renderAgenda = () => {
    // Rango de horas en la agenda: de 08:00 a 21:00
    const hours = Array.from({ length: 14 }, (_, i) => {
      const h = 8 + i
      return `${h.toString().padStart(2, '0')}:00`
    })

    return (
      <div className="glass-card">
        <div className="calendar-container">
          <div className="calendar-header">
            <div>
              <span className="calendar-title">Agenda Semanal</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Haz clic en una celda vacía para agendar un turno.
              </p>
            </div>
            
            <div className="calendar-controls">
              <button className="btn btn-secondary" onClick={() => navigateWeek(-1)}>◀ Anterior</button>
              <button className="btn btn-secondary" onClick={() => setCalendarReferenceDate(new Date())}>Hoy</button>
              <button className="btn btn-secondary" onClick={() => navigateWeek(1)}>Siguiente ▶</button>
              <button className="btn btn-primary" onClick={() => {
                setEditingAppt(null)
                setApptForm({
                  patient_id: patients[0]?.id || '',
                  date: getLocalDateString(new Date()),
                  time: '14:00',
                  type: 'seguimiento',
                  price: 10000,
                  notes: ''
                })
                setShowAddAppt(true)
              }}>+ Agendar Turno</button>
            </div>
          </div>

          <div className="calendar-grid-week">
            {/* Columna de Horas */}
            <div className="calendar-time-col">
              <div className="calendar-day-header" style={{ borderRight: 'none' }}>
                <span className="calendar-day-name">Hora</span>
              </div>
              {hours.map((h, idx) => (
                <div key={idx} className="calendar-time-slot">{h}</div>
              ))}
            </div>

            {/* Columnas de los Días (Lunes a Sábado) */}
            {weekDays.map((date, colIdx) => {
              const dateStr = getLocalDateString(date)
              const isToday = getLocalDateString(new Date()) === dateStr
              const dayName = date.toLocaleString('es-ES', { weekday: 'short' })
              const dayNum = date.getDate()

              // Turnos agendados para este día
              const dayAppts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelado')

              return (
                <div key={colIdx} className="calendar-day-col">
                  <div className={`calendar-day-header ${isToday ? 'today' : ''}`}>
                    <span className="calendar-day-name">{dayName}</span>
                    <span className="calendar-day-number">{dayNum}</span>
                  </div>

                  {/* Renderizar celdas de fondo para hacer click */}
                  {hours.map((h, hourIdx) => (
                    <div 
                      key={hourIdx} 
                      className="calendar-day-slot"
                      onClick={() => openQuickAppt(dateStr, h)}
                    ></div>
                  ))}

                  {/* Renderizar bloques absolutos de turnos */}
                  {dayAppts.map(appt => {
                    const [h, m] = appt.time.split(':').map(Number)
                    const minutesSinceMidnight = h * 60 + m
                    const calendarStartMin = 8 * 60 // 08:00
                    const diffMin = minutesSinceMidnight - calendarStartMin
                    
                    // La cabecera toma 50px. Cada hora dura 45px (0.75px por minuto)
                    const topPos = 50 + (diffMin * 0.75)
                    const blockHeight = appt.duration * 0.75

                    return (
                      <div 
                        key={appt.id} 
                        className={`appointment-block ${appt.type} ${appt.status}`}
                        style={{ 
                          top: `${topPos}px`, 
                          height: `${blockHeight}px` 
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditAppt(appt)
                        }}
                      >
                        <div style={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {appt.patient_name}
                        </div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                          {appt.time} - {appt.type === 'nuevo' ? 'Nuevo' : 'Seg.'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // 3. PACIENTES RENDER
  const renderPacientes = () => {
    const filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.phone && p.phone.includes(searchQuery))
    )

    return (
      <div className="glass-card">
        <div className="glass-card-header">
          <h3>Fichero de Pacientes</h3>
          <button className="btn btn-primary" onClick={() => {
            setEditingPatient(null)
            setPatientForm({
              name: '',
              phone: '',
              email: '',
              birth_date: '',
              dni: '',
              address: '',
              locality: '',
              occupation: '',
              civil_status: ''
            })
            setShowAddPatient(true)
          }}>+ Registrar Nuevo Paciente</button>
        </div>

        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Buscar por nombre o teléfono..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            No se encontraron pacientes registrados.
          </div>
        ) : (
          <ul className="patient-list">
            {filteredPatients.map(p => {
              const initials = p.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
              return (
                <li key={p.id} className="patient-card">
                  <div className="patient-basic-info">
                    <div className="patient-avatar">{initials}</div>
                    <div className="patient-details">
                      <h3>{p.name}</h3>
                      <p>📞 {p.phone || 'Sin teléfono'} | 📧 {p.email || 'Sin correo'}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {p.birth_date && <span>🎂 Nac: {p.birth_date}</span>}
                        {p.dni && <span>🪪 DNI: {p.dni}</span>}
                        {p.address && <span>📍 {p.address} {p.locality ? `(${p.locality})` : ''}</span>}
                        {p.occupation && <span>💼 {p.occupation}</span>}
                        {p.civil_status && <span>💍 {p.civil_status}</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => selectActivePatient(p)}>📂 Ver Ficha Médica</button>
                    <button className="btn btn-secondary btn-icon-only" title="Editar datos" onClick={() => startEditPatient(p)}>✏️</button>
                    <button className="btn btn-danger btn-icon-only" title="Eliminar paciente" onClick={() => deletePatient(p.id)}>🗑️</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  // 4. HISTORIA CLINICA RENDER
  const renderPulseGridDisplay = (pulseData) => {
    if (!pulseData) return <span style={{ color: 'var(--text-muted)' }}>Sin datos de pulso</span>
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ border: '1px solid var(--border-color)', padding: '4px', fontSize: '0.7rem' }}>Nivel</th>
              <th style={{ border: '1px solid var(--border-color)', padding: '4px', fontSize: '0.7rem' }}>Cun</th>
              <th style={{ border: '1px solid var(--border-color)', padding: '4px', fontSize: '0.7rem' }}>Guan</th>
              <th style={{ border: '1px solid var(--border-color)', padding: '4px', fontSize: '0.7rem' }}>Chi</th>
            </tr>
          </thead>
          <tbody>
            {['sup', 'med', 'prof'].map(level => (
              <tr key={level}>
                <td style={{ border: '1px solid var(--border-color)', padding: '4px', fontWeight: 'bold', fontSize: '0.7rem', textTransform: 'uppercase', backgroundColor: 'var(--bg-tertiary)' }}>
                  {level === 'sup' ? 'Sup.' : level === 'med' ? 'Med.' : 'Prof.'}
                </td>
                <td style={{ border: '1px solid var(--border-color)', padding: '4px', textAlign: 'center' }}>{pulseData[level]?.cun || '-'}</td>
                <td style={{ border: '1px solid var(--border-color)', padding: '4px', textAlign: 'center' }}>{pulseData[level]?.guan || '-'}</td>
                <td style={{ border: '1px solid var(--border-color)', padding: '4px', textAlign: 'center' }}>{pulseData[level]?.chi || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          {pulseData.desc_general && <span><strong>Gral:</strong> {pulseData.desc_general}</span>}
          {pulseData.frequency && <span><strong>Frec:</strong> {pulseData.frequency}</span>}
          {pulseData.tension && <span><strong>Tensión:</strong> {pulseData.tension}</span>}
          {pulseData.diameter && <span><strong>Diámetro:</strong> {pulseData.diameter}</span>}
          {pulseData.force && <span><strong>Fuerza:</strong> {pulseData.force}</span>}
          {pulseData.occlusion && <span><strong>Ocl:</strong> {pulseData.occlusion}</span>}
          {pulseData.waveform && <span><strong>Onda:</strong> {pulseData.waveform}</span>}
        </div>
      </div>
    )
  }

  const printSheet = (sheetId) => {
    const originalContent = document.body.innerHTML
    const printArea = document.getElementById(`print-area-${sheetId}`)
    if (printArea) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write('<html><head><title>Historia Clínica - Carolina Escudero</title>')
      printWindow.document.write('<style>')
      printWindow.document.write(`
        body { font-family: sans-serif; color: #333; padding: 20px; line-height: 1.5; }
        h1, h2, h3, h4 { margin-top: 0; color: #324b40; }
        .print-header { border-bottom: 2px solid #4a6b5d; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; }
        .print-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .print-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .field { margin-bottom: 8px; }
        .field label { font-size: 0.75rem; font-weight: bold; color: #666; text-transform: uppercase; display: block; }
        .field span { font-size: 0.95rem; display: block; }
        .full-width { grid-column: 1 / -1; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 0.8rem; }
        th, td { border: 1px solid #ccc; padding: 4px; text-align: center; }
        th { background-color: #f0f0f0; }
        .section-title { border-bottom: 1px solid #4a6b5d; padding-bottom: 3px; margin: 15px 0 10px 0; text-transform: uppercase; font-size: 0.85rem; font-weight: bold; color: #4a6b5d; }
        .badge { font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; background-color: #f0f0f0; font-weight: bold; }
        .badge.mejor { background-color: #e2f0d9; color: #385723; }
        .badge.igual { background-color: #fff2cc; color: #7f6000; }
        .badge.peor { background-color: #fce4d6; color: #c65911; }
      `)
      printWindow.document.write('</style></head><body>')
      printWindow.document.write(printArea.innerHTML)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      printWindow.print()
    }
  }

  const renderHistoriaClinica = () => {
    if (!activePatient) {
      return (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>No se ha seleccionado ningún paciente</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
            Por favor, dirígete a la pestaña "Pacientes" y selecciona un paciente para visualizar su historia clínica.
          </p>
          <button className="btn btn-primary" onClick={() => setActiveTab('pacientes')}>Ir a Pacientes</button>
        </div>
      )
    }

    return (
      <div className="glass-card">
        <div className="glass-card-header" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: '700', textTransform: 'uppercase' }}>Ficha Clínica</span>
              <h2 style={{ fontSize: '1.8rem' }}>{activePatient.name}</h2>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => handleOpenAddHistory('ingreso')}>+ Nueva Ficha Inicial</button>
              <button className="btn btn-primary" onClick={() => handleOpenAddHistory('sesion')}>+ Nueva Sesión (Seguimiento)</button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('pacientes')}>Volver a Lista</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', width: '100%', backgroundColor: 'var(--bg-primary)', padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
            {activePatient.dni && <span><strong>🪪 DNI:</strong> {activePatient.dni}</span>}
            {activePatient.phone && <span><strong>📞 Tel:</strong> {activePatient.phone}</span>}
            {activePatient.birth_date && <span><strong>🎂 Nac:</strong> {activePatient.birth_date}</span>}
            {activePatient.address && <span><strong>📍 Dir:</strong> {activePatient.address} {activePatient.locality ? `(${activePatient.locality})` : ''}</span>}
            {activePatient.occupation && <span><strong>💼 Ocupación:</strong> {activePatient.occupation}</span>}
            {activePatient.civil_status && <span><strong>💍 Est. Civil:</strong> {activePatient.civil_status}</span>}
          </div>
        </div>

        {activePatientHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            No hay registros clínicos en la historia digital de este paciente.
            <br />
            Utiliza los botones de arriba para digitalizar una Ficha Inicial o una Sesión de Seguimiento.
          </div>
        ) : (
          <div style={{ marginTop: '2rem' }}>
            {activePatientHistory.map((sheet, index) => {
              const d = sheet.data || {}
              return (
                <div key={sheet.id} className="history-sheet">
                  {/* Invisible print template */}
                  <div id={`print-area-${sheet.id}`} style={{ display: 'none' }}>
                    <div className="print-header">
                      <div>
                        <h2>Carolina Escudero — Acupuntura & Medicina China</h2>
                        <span>Historia Clínica Digitalizada</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Fecha:</strong> {new Date(sheet.created_at).toLocaleDateString('es-ES')}<br/>
                        <strong>Tipo:</strong> {sheet.type === 'ingreso' ? 'Ficha Inicial (Ingreso)' : `Sesión de Seguimiento N° ${d.session_number || ''}`}
                      </div>
                    </div>

                    <div className="print-grid">
                      <div className="field">
                        <label>Paciente</label>
                        <span>{activePatient.name} (DNI: {activePatient.dni || 'N/A'})</span>
                      </div>
                      <div className="field">
                        <label>Terapeuta / Alumnos</label>
                        <span>{d.therapist || 'Carolina Escudero'} {d.students ? `/ Alumnos: ${d.students}` : ''}</span>
                      </div>
                    </div>

                    {sheet.type === 'ingreso' ? (
                      <>
                        <div className="section-title">Anamnesis Principal</div>
                        <div className="print-grid">
                          <div className="field">
                            <label>Motivo de Consulta</label>
                            <span>{d.reason || 'N/A'}</span>
                          </div>
                          <div className="field">
                            <label>Tiempo de Evolución</label>
                            <span>{d.time || 'N/A'}</span>
                          </div>
                        </div>

                        {d.alicia && (
                          <>
                            <div className="section-title">Evaluación del Dolor (ALICIA)</div>
                            <div className="print-grid-3">
                              <div className="field"><label>Aparición</label><span>{d.alicia.a_onset || '-'}</span></div>
                              <div className="field"><label>Localización</label><span>{d.alicia.l_location || '-'}</span></div>
                              <div className="field"><label>Intensidad</label><span>{d.alicia.i_intensity || '-'}</span></div>
                              <div className="field"><label>Carácter</label><span>{d.alicia.c_character || '-'}</span></div>
                              <div className="field"><label>Irradiación</label><span>{d.alicia.i_radiation || '-'}</span></div>
                              <div className="field"><label>Agravación</label><span>{d.alicia.ag_aggravating || '-'}</span></div>
                              <div className="field"><label>Atenuación</label><span>{d.alicia.at_relieving || '-'}</span></div>
                              <div className="field"><label>Asociados</label><span>{d.alicia.ac_associated || '-'}</span></div>
                            </div>
                          </>
                        )}

                        <div className="section-title">Diagnóstico Occidental y Sistemas</div>
                        <div className="print-grid">
                          <div className="field full-width">
                            <label>Dx Occ. / Antec. Enfermedad Actual</label>
                            <span>{d.western_diagnosis || '-'}</span>
                          </div>
                          <div className="field"><label>Temperatura</label><span>{d.temperature || '-'}</span></div>
                          <div className="field"><label>Sed y Sudor</label><span>{d.thirst_sweat || '-'}</span></div>
                          <div className="field"><label>Sueño</label><span>{d.sleep || '-'}</span></div>
                          <div className="field"><label>Shen (Emociones/Memoria)</label><span>{d.shen || '-'}</span></div>
                          <div className="field"><label>Cabeza</label><span>{d.head || '-'}</span></div>
                          <div className="field"><label>Respiratorio</label><span>{d.respiratory || '-'}</span></div>
                          <div className="field"><label>Cardiovascular</label><span>{d.cardiovascular || '-'}</span></div>
                          <div className="field"><label>Digestivo</label><span>{d.digestive || '-'}</span></div>
                          <div className="field"><label>Excretor Orina</label><span>{d.excretor_orina || '-'}</span></div>
                          <div className="field"><label>Excretor Heces</label><span>{d.excretor_heces || '-'}</span></div>
                          <div className="field"><label>Urinario</label><span>{d.urinary || '-'}</span></div>
                          <div className="field"><label>Ginecología</label><span>{d.gynecology || '-'}</span></div>
                        </div>

                        <div className="section-title">Controles (Tejidos Zang Fu) y Aperturas</div>
                        <div className="print-grid">
                          {d.control && (
                            <div className="field">
                              <label>Controles / Tejidos</label>
                              <span>
                                Huesos/Artic: {d.control.joints_bones || '-'}<br/>
                                Vasos: {d.control.blood_vessels || '-'}<br/>
                                Tendones: {d.control.tendons || '-'}<br/>
                                Músculos: {d.control.muscles || '-'}<br/>
                                Piel: {d.control.skin || '-'}
                              </span>
                            </div>
                          )}
                          {d.openings && (
                            <div className="field">
                              <label>Aperturas / Órganos Sentidos</label>
                              <span>
                                Audición: {d.openings.hearing || '-'}<br/>
                                Vista: {d.openings.vision || '-'}<br/>
                                Habla: {d.openings.speech || '-'}<br/>
                                Gusto: {d.openings.taste || '-'}<br/>
                                Olfato: {d.openings.olfato || d.openings.smell || '-'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="section-title">Antecedentes Clínicos</div>
                        <div className="print-grid">
                          <div className="field"><label>Personales</label><span>{d.personal_history || '-'}</span></div>
                          <div className="field"><label>Familiares</label><span>{d.family_history || '-'}</span></div>
                        </div>

                        <div className="section-title">Semiótica: Lengua</div>
                        <div className="print-grid">
                          {d.tongue && (
                            <div className="field full-width">
                              <span>
                                <strong>Características:</strong> {[
                                  d.tongue.dentada && 'Dentada',
                                  d.tongue.gruesa && 'Gruesa',
                                  d.tongue.delgada && 'Delgada',
                                  d.tongue.punto_rojo && 'Puntos Rojos',
                                  d.tongue.peladez && 'Peladez',
                                  d.tongue.grieta && 'Grieta',
                                  d.tongue.contorno && 'Contorno Alterado'
                                ].filter(Boolean).join(', ') || 'Normal'}
                                <br/>
                                <strong>Cuerpo:</strong> Forma: {d.tongue.body_shape || '-'} | Color: {d.tongue.body_color || '-'} | Agregados: {d.tongue.body_added || '-'}<br/>
                                <strong>Saburra:</strong> Distribución: {d.tongue.coating_shape || '-'} | Color: {d.tongue.coating_color || '-'}<br/>
                                <strong>Observaciones:</strong> {d.tongue.notes || '-'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="section-title">Semiótica: Pulsos (Chi, Guan, Cun)</div>
                        <div className="print-grid">
                          <div className="field">
                            <label>Pulso DERECHO</label>
                            {d.pulses?.right && (
                              <table>
                                <thead><tr><th>Pos</th><th>Sup</th><th>Med</th><th>Prof</th></tr></thead>
                                <tbody>
                                  <tr><td>Cun</td><td>{d.pulses.right.sup?.cun || '-'}</td><td>{d.pulses.right.med?.cun || '-'}</td><td>{d.pulses.right.prof?.cun || '-'}</td></tr>
                                  <tr><td>Guan</td><td>{d.pulses.right.sup?.guan || '-'}</td><td>{d.pulses.right.med?.guan || '-'}</td><td>{d.pulses.right.prof?.guan || '-'}</td></tr>
                                  <tr><td>Chi</td><td>{d.pulses.right.sup?.chi || '-'}</td><td>{d.pulses.right.med?.chi || '-'}</td><td>{d.pulses.right.prof?.chi || '-'}</td></tr>
                                </tbody>
                              </table>
                            )}
                            {d.pulses?.right && <div style={{ fontSize: '0.75rem', marginTop: '5px' }}><strong>Sintomatología:</strong> Frec: {d.pulses.right.frequency || '-'} | Onda: {d.pulses.right.waveform || '-'}</div>}
                          </div>
                          <div className="field">
                            <label>Pulso IZQUIERDO</label>
                            {d.pulses?.left && (
                              <table>
                                <thead><tr><th>Pos</th><th>Sup</th><th>Med</th><th>Prof</th></tr></thead>
                                <tbody>
                                  <tr><td>Cun</td><td>{d.pulses.left.sup?.cun || '-'}</td><td>{d.pulses.left.med?.cun || '-'}</td><td>{d.pulses.left.prof?.cun || '-'}</td></tr>
                                  <tr><td>Guan</td><td>{d.pulses.left.sup?.guan || '-'}</td><td>{d.pulses.left.med?.guan || '-'}</td><td>{d.pulses.left.prof?.guan || '-'}</td></tr>
                                  <tr><td>Chi</td><td>{d.pulses.left.sup?.chi || '-'}</td><td>{d.pulses.left.med?.chi || '-'}</td><td>{d.pulses.left.prof?.chi || '-'}</td></tr>
                                </tbody>
                              </table>
                            )}
                            {d.pulses?.left && <div style={{ fontSize: '0.75rem', marginTop: '5px' }}><strong>Sintomatología:</strong> Frec: {d.pulses.left.frequency || '-'} | Onda: {d.pulses.left.waveform || '-'}</div>}
                          </div>
                        </div>

                        <div className="section-title">Diagnóstico Chino (TCM)</div>
                        <div className="print-grid">
                          <div className="field">
                            <label>Factores Patógenos</label>
                            <span>
                              <strong>Internos:</strong> {d.pathogens?.internal ? Object.entries(d.pathogens.internal).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Ninguno' : '-'}<br/>
                              <strong>Externos:</strong> {d.pathogens?.external ? Object.entries(d.pathogens.external).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Ninguno' : '-'}
                            </span>
                          </div>
                          <div className="field">
                            <label>Órganos y Meridianos Afectados</label>
                            <span>
                              <strong>Yin:</strong> {d.affected_organs?.yin ? Object.entries(d.affected_organs.yin).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'Ninguno' : '-'}<br/>
                              <strong>Yang:</strong> {d.affected_organs?.yang ? Object.entries(d.affected_organs.yang).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'Ninguno' : '-'}
                            </span>
                          </div>
                          <div className="field">
                            <label>Vasos Maravillosos & Ba Gang</label>
                            <span>
                              <strong>Vasos:</strong> {d.extraordinary_vessels ? Object.entries(d.extraordinary_vessels).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'Ninguno' : '-'}<br/>
                              <strong>Ba Gang:</strong> {d.ba_gang ? Object.entries(d.ba_gang).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Ninguno' : '-'}
                            </span>
                          </div>
                          <div className="field">
                            <label>Causas Probables</label>
                            <span>{d.causes || '-'}</span>
                          </div>
                        </div>

                        <div className="section-title">Plan de Tratamiento</div>
                        <div className="field"><strong>Síndrome(s):</strong> {d.syndromes || '-'}</div>
                        <div className="field"><strong>Principio de Tratamiento:</strong> {d.treatment_principle || '-'}</div>
                        <div className="field">
                          <strong>Acción (Espíritu de Tto):</strong> {d.treatment_spirit ? Object.entries(d.treatment_spirit).filter(([_, v]) => v).map(([k]) => k).join(', ') : '-'}
                        </div>
                        <div className="field"><strong>Receta (Resonadores) & Técnica:</strong> {d.recipe_technique || '-'}</div>
                        <div className="field">
                          <strong>Técnicas Aplicadas:</strong> {d.therapies ? Object.entries(d.therapies).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') : '-'}
                        </div>
                        <div className="field"><strong>Observaciones:</strong> {d.notes || '-'}</div>
                      </>
                    ) : (
                      <>
                        <div className="section-title">Evolución de la Sesión</div>
                        <div className="print-grid">
                          <div className="field">
                            <label>Estado Comparativo</label>
                            <span className={`badge ${d.evolution_type || 'igual'}`}>{(d.evolution_type || 'igual').toUpperCase()}</span>
                          </div>
                          <div className="field">
                            <label>Motivo de Consulta (Evolución)</label>
                            <span>{d.evolution_reason || '-'}</span>
                          </div>
                          <div className="field full-width">
                            <label>Evolución General</label>
                            <span>{d.evolution_general || '-'}</span>
                          </div>
                        </div>

                        <div className="section-title">Semiótica: Lengua</div>
                        {d.tongue && (
                          <div className="field">
                            <span>
                              <strong>Características:</strong> {[
                                d.tongue.dentada && 'Dentada',
                                d.tongue.gruesa && 'Gruesa',
                                d.tongue.delgada && 'Delgada',
                                d.tongue.punto_rojo && 'Puntos Rojos',
                                d.tongue.peladez && 'Peladez',
                                d.tongue.grieta && 'Grieta',
                                d.tongue.contorno && 'Contorno Alterado'
                              ].filter(Boolean).join(', ') || 'Normal'}
                              <br/>
                              <strong>Cuerpo:</strong> Forma: {d.tongue.body_shape || '-'} | Color: {d.tongue.body_color || '-'} | Agregados: {d.tongue.body_added || '-'}<br/>
                              <strong>Saburra:</strong> Distribución: {d.tongue.coating_shape || '-'} | Color: {d.tongue.coating_color || '-'}<br/>
                            </span>
                          </div>
                        )}

                        <div className="section-title">Semiótica: Pulsos (Chi, Guan, Cun)</div>
                        <div className="print-grid">
                          <div className="field">
                            <label>Pulso DERECHO</label>
                            {d.pulses?.right && (
                              <table>
                                <thead><tr><th>Pos</th><th>Sup</th><th>Med</th><th>Prof</th></tr></thead>
                                <tbody>
                                  <tr><td>Cun</td><td>{d.pulses.right.sup?.cun || '-'}</td><td>{d.pulses.right.med?.cun || '-'}</td><td>{d.pulses.right.prof?.cun || '-'}</td></tr>
                                  <tr><td>Guan</td><td>{d.pulses.right.sup?.guan || '-'}</td><td>{d.pulses.right.med?.guan || '-'}</td><td>{d.pulses.right.prof?.guan || '-'}</td></tr>
                                  <tr><td>Chi</td><td>{d.pulses.right.sup?.chi || '-'}</td><td>{d.pulses.right.med?.chi || '-'}</td><td>{d.pulses.right.prof?.chi || '-'}</td></tr>
                                </tbody>
                              </table>
                            )}
                          </div>
                          <div className="field">
                            <label>Pulso IZQUIERDO</label>
                            {d.pulses?.left && (
                              <table>
                                <thead><tr><th>Pos</th><th>Sup</th><th>Med</th><th>Prof</th></tr></thead>
                                <tbody>
                                  <tr><td>Cun</td><td>{d.pulses.left.sup?.cun || '-'}</td><td>{d.pulses.left.med?.cun || '-'}</td><td>{d.pulses.left.prof?.cun || '-'}</td></tr>
                                  <tr><td>Guan</td><td>{d.pulses.left.sup?.guan || '-'}</td><td>{d.pulses.left.med?.guan || '-'}</td><td>{d.pulses.left.prof?.guan || '-'}</td></tr>
                                  <tr><td>Chi</td><td>{d.pulses.left.sup?.chi || '-'}</td><td>{d.pulses.left.med?.chi || '-'}</td><td>{d.pulses.left.prof?.chi || '-'}</td></tr>
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>

                        <div className="section-title">Tratamiento Aplicado en Sesión</div>
                        <div className="field"><strong>Principio de Tratamiento:</strong> {d.treatment_principle || '-'}</div>
                        <div className="field">
                          <strong>Acción (Espíritu de Tto):</strong> {d.treatment_spirit ? Object.entries(d.treatment_spirit).filter(([_, v]) => v).map(([k]) => k).join(', ') : '-'}
                        </div>
                        <div className="field"><strong>Receta (Resonadores) & Técnica:</strong> {d.recipe_technique || '-'}</div>
                        <div className="field">
                          <strong>Técnicas Aplicadas:</strong> {d.therapies ? Object.entries(d.therapies).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') : '-'}
                        </div>
                        <div className="field"><strong>Observaciones:</strong> {d.notes || '-'}</div>
                      </>
                    )}
                  </div>

                  {/* Visual UI Display */}
                  <div className="history-sheet-header">
                    <span className="history-sheet-date">📅 Registro: {new Date(sheet.created_at).toLocaleString('es-ES')}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="history-sheet-type">{sheet.type === 'ingreso' ? 'Ficha de Ingreso (Inicial)' : `Seguimiento de Sesión N° ${d.session_number || ''}`}</span>
                      <button className="btn btn-secondary no-print" style={{ padding: '2px 8px', fontSize: '0.75rem' }} onClick={() => printSheet(sheet.id)}>🖨️ Imprimir</button>
                    </div>
                  </div>

                  <div className="history-sheet-grid">
                    {sheet.type === 'ingreso' ? (
                      <>
                        <div className="history-field full-width" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Terapeutas: {d.therapist || 'Carolina Escudero'} {d.students ? `| Alumnos: ${d.students}` : ''}</span>
                        </div>
                        <div className="history-field">
                          <label>Motivo de Consulta</label>
                          <span>{d.reason || 'No especificado'}</span>
                        </div>
                        <div className="history-field">
                          <label>Tiempo de Evolución</label>
                          <span>{d.time || 'No especificado'}</span>
                        </div>

                        {d.alicia && (
                          <div className="history-field full-width" style={{ backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                            <label style={{ marginBottom: '0.5rem' }}>Evaluación del Dolor (ALICIA)</label>
                            <div className="history-sheet-grid-3" style={{ gap: '0.5rem' }}>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Aparición:</strong> {d.alicia.a_onset || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Localización:</strong> {d.alicia.l_location || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Intensidad:</strong> {d.alicia.i_intensity || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Carácter:</strong> {d.alicia.c_character || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Irradiación:</strong> {d.alicia.i_radiation || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Agravación:</strong> {d.alicia.ag_aggravating || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Atenuación:</strong> {d.alicia.at_relieving || '-'}</span></div>
                              <div><span style={{ fontSize: '0.8rem' }}><strong>Asociados:</strong> {d.alicia.ac_associated || '-'}</span></div>
                            </div>
                          </div>
                        )}

                        <div className="history-field full-width">
                          <label>Dx Occ. / Antec. Enfermedad Actual</label>
                          <span>{d.western_diagnosis || '-'}</span>
                        </div>

                        <div className="history-field full-width" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Temp:</strong> {d.temperature || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Sed y Sudor:</strong> {d.thirst_sweat || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Sueño:</strong> {d.sleep || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Shen:</strong> {d.shen || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Cabeza:</strong> {d.head || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Resp:</strong> {d.respiratory || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Cardio:</strong> {d.cardiovascular || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Digestivo:</strong> {d.digestive || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Orina:</strong> {d.excretor_orina || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Heces:</strong> {d.excretor_heces || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Urinario:</strong> {d.urinary || '-'}</span></div>
                          <div><span style={{ fontSize: '0.85rem' }}><strong>Ginecología:</strong> {d.gynecology || '-'}</span></div>
                        </div>

                        {d.control && d.openings && (
                          <div className="history-field full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                              <label>Zang Fu Controles (Tejidos)</label>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                🦴 Huesos/Artic: {d.control.joints_bones || '-'}<br/>
                                🩸 Vasos Sanguíneos: {d.control.blood_vessels || '-'}<br/>
                                🧬 Tendones: {d.control.tendons || '-'}<br/>
                                💪 Músculos: {d.control.muscles || '-'}<br/>
                                🪵 Piel: {d.control.skin || '-'}
                              </div>
                            </div>
                            <div>
                              <label>Aperturas (Órganos Sentidos)</label>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                👂 Audición: {d.openings.hearing || '-'}<br/>
                                👁️ Vista: {d.openings.vision || '-'}<br/>
                                🗣️ Habla: {d.openings.speech || '-'}<br/>
                                👅 Gusto: {d.openings.taste || '-'}<br/>
                                👃 Olfato: {d.openings.olfato || d.openings.smell || '-'}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="history-field"><label>Antec. Personales</label><span>{d.personal_history || '-'}</span></div>
                        <div className="history-field"><label>Antec. Familiares</label><span>{d.family_history || '-'}</span></div>

                        {d.tongue && (
                          <div className="history-field full-width" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                            <label>Examen de Lengua</label>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                              <div style={{ flex: '1', minWidth: '200px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                                  {[
                                    d.tongue.dentada && 'Dentada',
                                    d.tongue.gruesa && 'Gruesa',
                                    d.tongue.delgada && 'Delgada',
                                    d.tongue.punto_rojo && 'Puntos Rojos',
                                    d.tongue.peladez && 'Geográfica/Pelada',
                                    d.tongue.grieta && 'Grietada',
                                    d.tongue.contorno && 'Borde Irregular'
                                  ].filter(Boolean).map((t, idx) => (
                                    <span key={idx} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary-dark)', fontWeight: 'bold' }}>{t}</span>
                                  ))}
                                  {![d.tongue.dentada, d.tongue.gruesa, d.tongue.delgada, d.tongue.punto_rojo, d.tongue.peladez, d.tongue.grieta, d.tongue.contorno].some(Boolean) && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sin marcas particulares</span>}
                                </div>
                                <span style={{ fontSize: '0.85rem' }}>
                                  <strong>Cuerpo:</strong> Forma: {d.tongue.body_shape || '-'} | Color: {d.tongue.body_color || '-'} | Agregados: {d.tongue.body_added || '-'}<br/>
                                  <strong>Saburra:</strong> Dist: {d.tongue.coating_shape || '-'} | Color: {d.tongue.coating_color || '-'}<br/>
                                  {d.tongue.notes && <span><strong>Notas:</strong> {d.tongue.notes}</span>}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="history-field full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                          <div><label>Pulsos DERECHO (Chi, Guan, Cun)</label>{renderPulseGridDisplay(d.pulses?.right)}</div>
                          <div><label>Pulsos IZQUIERDO (Chi, Guan, Cun)</label>{renderPulseGridDisplay(d.pulses?.left)}</div>
                        </div>

                        <div className="history-field full-width" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div>
                            <label>Factores Patógenos</label>
                            <span style={{ fontSize: '0.8rem' }}>
                              <strong>Int:</strong> {d.pathogens?.internal ? Object.entries(d.pathogens.internal).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Ninguno' : '-'}<br/>
                              <strong>Ext:</strong> {d.pathogens?.external ? Object.entries(d.pathogens.external).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Ninguno' : '-'}
                            </span>
                          </div>
                          <div>
                            <label>Órganos Afectados</label>
                            <span style={{ fontSize: '0.8rem' }}>
                              <strong>Yin:</strong> {d.affected_organs?.yin ? Object.entries(d.affected_organs.yin).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'Ninguno' : '-'}<br/>
                              <strong>Yang:</strong> {d.affected_organs?.yang ? Object.entries(d.affected_organs.yang).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') || 'Ninguno' : '-'}
                            </span>
                          </div>
                          <div>
                            <label>Vasos Maravillosos & Ba Gang</label>
                            <span style={{ fontSize: '0.8rem' }}>
                              <strong>Vasos:</strong> {d.extraordinary_vessels ? Object.entries(d.extraordinary_vessels).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, ' ')).join(', ') || 'Ninguno' : '-'}<br/>
                              <strong>Ba Gang:</strong> {d.ba_gang ? Object.entries(d.ba_gang).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'Ninguno' : '-'}
                            </span>
                          </div>
                          <div>
                            <label>Causas Probables</label>
                            <span style={{ fontSize: '0.8rem' }}>{d.causes || '-'}</span>
                          </div>
                        </div>

                        <div className="history-field full-width" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <label>Plan & Principios de Tratamiento</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                            <div>
                              <span style={{ fontSize: '0.85rem' }}><strong>Síndromes:</strong> {d.syndromes || '-'}</span>
                              <span style={{ fontSize: '0.85rem' }}><strong>Principio de Tto:</strong> {d.treatment_principle || '-'}</span>
                              <span style={{ fontSize: '0.85rem' }}><strong>Acción (Espíritu):</strong> {d.treatment_spirit ? Object.entries(d.treatment_spirit).filter(([_, v]) => v).map(([k]) => k).join(', ') : '-'}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--primary-dark)' }}><strong>Receta (Resonadores):</strong> {d.recipe_technique || '-'}</span>
                              <span style={{ fontSize: '0.85rem' }}><strong>Técnicas:</strong> {d.therapies ? Object.entries(d.therapies).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="history-field full-width" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Terapeutas: {d.therapist || 'Carolina Escudero'} {d.students ? `| Alumnos: ${d.students}` : ''}</span>
                        </div>
                        <div className="history-field">
                          <label>Evolución de Síntomas</label>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className={`evolution-badge ${d.evolution_type || 'igual'}`}>{(d.evolution_type || 'igual')}</span>
                            <span>{d.evolution_reason || '-'}</span>
                          </span>
                        </div>
                        <div className="history-field">
                          <label>Evolución General</label>
                          <span>{d.evolution_general || '-'}</span>
                        </div>

                        {d.tongue && (
                          <div className="history-field full-width" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                            <label>Semiología de Lengua (Sesión)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                              {[
                                d.tongue.dentada && 'Dentada',
                                d.tongue.gruesa && 'Gruesa',
                                d.tongue.delgada && 'Delgada',
                                d.tongue.punto_rojo && 'Puntos Rojos',
                                d.tongue.peladez && 'Geográfica/Pelada',
                                d.tongue.grieta && 'Grietada',
                                d.tongue.contorno && 'Borde Irregular'
                              ].filter(Boolean).map((t, idx) => (
                                <span key={idx} style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary-dark)', fontWeight: 'bold' }}>{t}</span>
                              ))}
                            </div>
                            <span style={{ fontSize: '0.85rem' }}>
                              <strong>Cuerpo:</strong> {d.tongue.body_shape || '-'} ({d.tongue.body_color || '-'}) {d.tongue.body_added || ''} | <strong>Saburra:</strong> {d.tongue.coating_shape || '-'} ({d.tongue.coating_color || '-'})
                            </span>
                          </div>
                        )}

                        <div className="history-field full-width" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                          <div><label>Pulso DERECHO</label>{renderPulseGridDisplay(d.pulses?.right)}</div>
                          <div><label>Pulso IZQUIERDO</label>{renderPulseGridDisplay(d.pulses?.left)}</div>
                        </div>

                        <div className="history-field full-width" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                          <label>Tratamiento Realizado hoy</label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                            <div>
                              <span style={{ fontSize: '0.85rem' }}><strong>Principio de Tto:</strong> {d.treatment_principle || '-'}</span>
                              <span style={{ fontSize: '0.85rem' }}><strong>Acción:</strong> {d.treatment_spirit ? Object.entries(d.treatment_spirit).filter(([_, v]) => v).map(([k]) => k).join(', ') : '-'}</span>
                            </div>
                            <div>
                              <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--primary-dark)' }}><strong>Receta/Resonadores:</strong> {d.recipe_technique || '-'}</span>
                              <span style={{ fontSize: '0.85rem' }}><strong>Técnicas:</strong> {d.therapies ? Object.entries(d.therapies).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(', ') : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="history-field full-width" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                      <label>Observaciones y Recomendaciones Generales</label>
                      <span style={{ fontStyle: 'italic' }}>{d.notes || 'Ninguna'}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // 5. FLUJO DE CAJA RENDER
  const renderFlujoDeCaja = () => {
    if (!dashboardStats) return <div className="glass-card">Cargando datos...</div>
    const { stats } = dashboardStats

    // Unir ingresos de turnos y gastos en un solo flujo cronológico
    const incomeTx = appointments
      .filter(a => a.status === 'completado')
      .map(a => ({
        id: a.id,
        type: 'income',
        description: `Consulta: ${a.patient_name} (${a.type === 'nuevo' ? 'Nuevo' : 'Seguimiento'})`,
        amount: a.price,
        date: a.date,
        category: 'Consultorio'
      }))

    const expenseTx = expenses.map(e => ({
      id: e.id,
      type: 'expense',
      description: e.description,
      amount: e.amount,
      date: e.date,
      category: e.category
    }))

    const ledger = [...incomeTx, ...expenseTx].sort((a, b) => b.date.localeCompare(a.date))

    return (
      <div>
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: 'var(--primary)' }}>📈</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--primary)' }}>${stats.totalIncome.toLocaleString()}</div>
              <div className="stat-label">Ingresos Totales (Mes)</div>
            </div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-icon" style={{ color: 'var(--status-cancelled)' }}>📉</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--status-cancelled)' }}>${stats.totalExpense.toLocaleString()}</div>
              <div className="stat-label">Gastos Registrados (Mes)</div>
            </div>
          </div>
          <div className="glass-card stat-card" style={{ border: '1px solid var(--primary)' }}>
            <div className="stat-icon" style={{ color: 'var(--accent)' }}>⚖️</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--primary-dark)' }}>
                ${stats.netCashFlow.toLocaleString()}
              </div>
              <div className="stat-label">Saldo de Caja Neto</div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="glass-card-header">
            <h3>Registro de Movimientos (Flujo de Caja)</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="month" 
                className="form-control" 
                style={{ width: '180px', padding: '0.4rem' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <button className="btn btn-accent" onClick={() => {
                setExpenseForm({
                  description: '',
                  amount: '',
                  category: 'insumos',
                  date: getLocalDateString(new Date())
                })
                setShowAddExpense(true)
              }}>+ Registrar Gasto (Salida)</button>
            </div>
          </div>

          {ledger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              No se han registrado movimientos de ingresos ni gastos para el mes seleccionado.
            </div>
          ) : (
            <table className="transaction-list">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Monto</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.date}</td>
                    <td>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: tx.type === 'income' ? '#e2f0d9' : '#fce4d6',
                        color: tx.type === 'income' ? '#385723' : '#c65911',
                        fontWeight: '700'
                      }}>
                        {tx.type === 'income' ? 'INGRESO' : 'EGRESO'}
                      </span>
                    </td>
                    <td>{tx.description}</td>
                    <td>{tx.category}</td>
                    <td className={`transaction-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td>
                      {tx.type === 'expense' ? (
                        <button 
                          className="btn btn-secondary btn-icon-only" 
                          title="Eliminar registro de gasto" 
                          onClick={() => deleteExpense(tx.id)}
                          style={{ padding: '0', fontSize: '0.8rem', width: '28px', height: '28px' }}
                        >
                          🗑️
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto (Turno)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // MAIN RENDER TEMPLATE
  // -------------------------------------------------------------

  return (
    <div className="app-container">
      {/* Barra Lateral / Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">☯</div>
          <div className="brand-name">
            Carolina E.
            <span>Medicina China</span>
          </div>
        </div>

        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <DashboardIcon />
              <span>Dashboard</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'agenda' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('agenda')}>
              <CalendarIcon />
              <span>Agenda / Turnos</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'pacientes' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('pacientes')}>
              <PatientsIcon />
              <span>Pacientes</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'historia' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('historia')}>
              <HistoryIcon />
              <span>Historia Clínica</span>
            </button>
          </li>
          <li className={`nav-item ${activeTab === 'caja' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('caja')}>
              <CashIcon />
              <span>Flujo de Caja</span>
            </button>
          </li>
        </ul>

        <div className="nav-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
            <span>{isDarkMode ? 'Tema Claro' : 'Tema Oscuro'}</span>
          </button>
        </div>
      </aside>

      {/* Área Central de Contenido */}
      <main className="main-content">
        <header className="page-header">
          <div className="page-title">
            <h1>
              {activeTab === 'dashboard' && 'Panel de Control'}
              {activeTab === 'agenda' && 'Agenda de Turnos'}
              {activeTab === 'pacientes' && 'Fichero Médico'}
              {activeTab === 'historia' && 'Historial Clínico'}
              {activeTab === 'caja' && 'Caja y Finanzas'}
            </h1>
            <p>
              {activeTab === 'dashboard' && 'Estadísticas y visión general de consultas.'}
              {activeTab === 'agenda' && 'Gestión de horarios de consulta y turnos de acupuntura.'}
              {activeTab === 'pacientes' && 'Fichero de pacientes registrados e información básica.'}
              {activeTab === 'historia' && 'Hojas de evolución digitalizadas e historias de ingreso.'}
              {activeTab === 'caja' && 'Control de ingresos clínicos y registro de insumos comprados.'}
            </p>
          </div>
        </header>

        {/* Banners de Alerta */}
        {errorMsg && <div className="alert-banner">⚠️ {errorMsg}</div>}
        {successMsg && <div className="alert-banner alert-banner-success">✓ {successMsg}</div>}

        {/* Carga de Vistas */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'agenda' && renderAgenda()}
        {activeTab === 'pacientes' && renderPacientes()}
        {activeTab === 'historia' && renderHistoriaClinica()}
        {activeTab === 'caja' && renderFlujoDeCaja()}
      </main>

      {/* ==========================================================
          MODALES
         ========================================================== */}

      {/* 1. REGISTRAR PACIENTE MODAL */}
      {showAddPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingPatient ? 'Editar Paciente' : 'Registrar Paciente'}</h3>
              <button className="modal-close" onClick={() => setShowAddPatient(false)}>×</button>
            </div>
            <form onSubmit={handlePatientSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={patientForm.name} 
                    onChange={e => setPatientForm({...patientForm, name: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono Celular</label>
                    <input 
                      type="tel" 
                      className="form-control" 
                      value={patientForm.phone} 
                      onChange={e => setPatientForm({...patientForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={patientForm.email} 
                      onChange={e => setPatientForm({...patientForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>DNI</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={patientForm.dni} 
                      onChange={e => setPatientForm({...patientForm, dni: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha de Nacimiento</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={patientForm.birth_date} 
                      onChange={e => setPatientForm({...patientForm, birth_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Dirección</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={patientForm.address} 
                      onChange={e => setPatientForm({...patientForm, address: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Localidad</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={patientForm.locality} 
                      onChange={e => setPatientForm({...patientForm, locality: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ocupación</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={patientForm.occupation} 
                      onChange={e => setPatientForm({...patientForm, occupation: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado Civil</label>
                    <select 
                      className="form-control" 
                      value={patientForm.civil_status} 
                      onChange={e => setPatientForm({...patientForm, civil_status: e.target.value})}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => setShowAddPatient(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingPatient ? 'Actualizar' : 'Guardar Paciente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. AGENDAR TURNO MODAL */}
      {showAddAppt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingAppt ? 'Re-programar / Editar Turno' : 'Agendar Turno de Acupuntura'}</h3>
              <button className="modal-close" onClick={() => setShowAddAppt(false)}>×</button>
            </div>
            <form onSubmit={handleApptSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Paciente</label>
                  {editingAppt ? (
                    <input type="text" className="form-control" disabled value={editingAppt.patient_name} />
                  ) : (
                    <select 
                      className="form-control" 
                      required
                      value={apptForm.patient_id}
                      onChange={e => setApptForm({...apptForm, patient_id: e.target.value})}
                    >
                      <option value="">Selecciona un paciente...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  )}
                  {!editingAppt && patients.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-cancelled)' }}>
                      Primero debes registrar pacientes en el fichero médico.
                    </span>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      required
                      value={apptForm.date} 
                      onChange={e => setApptForm({...apptForm, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora de Inicio</label>
                    <input 
                      type="time" 
                      className="form-control" 
                      required
                      value={apptForm.time} 
                      onChange={e => setApptForm({...apptForm, time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Turno</label>
                    <select 
                      className="form-control"
                      value={apptForm.type}
                      onChange={e => {
                        const newType = e.target.value
                        const defaultPrice = newType === 'nuevo' ? 15000 : 10000
                        setApptForm({...apptForm, type: newType, price: defaultPrice})
                      }}
                    >
                      <option value="nuevo">Paciente Nuevo (60 min)</option>
                      <option value="seguimiento">Seguimiento (30 min)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Monto Cobrado ($)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={apptForm.price} 
                      onChange={e => setApptForm({...apptForm, price: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                {editingAppt && (
                  <div className="form-group">
                    <label>Estado del Turno</label>
                    <select 
                      className="form-control"
                      value={apptForm.status}
                      onChange={e => setApptForm({...apptForm, status: e.target.value})}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="completado">Completado (Facturado)</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Notas / Observaciones</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={apptForm.notes} 
                    onChange={e => setApptForm({...apptForm, notes: e.target.value})}
                    placeholder="Sintomatología, requerimientos especiales..."
                  ></textarea>
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  {editingAppt && (
                    <button 
                      type="button" 
                      className="btn btn-danger" 
                      onClick={async () => {
                        if (window.confirm('¿Deseas eliminar definitivamente este turno?')) {
                          const res = await fetch(`/api/appointments/${editingAppt.id}`, { method: 'DELETE' })
                          if (res.ok) {
                            setSuccessMsg('Turno eliminado')
                            fetchAppointments()
                            fetchDashboardStats()
                            setShowAddAppt(false)
                          }
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <div>
                  <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => setShowAddAppt(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editingAppt ? 'Guardar Cambios' : 'Agendar'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. REGISTRAR GASTO MODAL */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Registrar Gasto (Egreso)</h3>
              <button className="modal-close" onClick={() => setShowAddExpense(false)}>×</button>
            </div>
            <form onSubmit={handleExpenseSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Concepto / Insumo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    placeholder="Ej. Agujas de acupuntura, Alcohol, Ventosas..."
                    value={expenseForm.description} 
                    onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Monto Gastado ($)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      value={expenseForm.amount} 
                      onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select 
                      className="form-control"
                      value={expenseForm.category}
                      onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                    >
                      <option value="insumos">Insumos Clínicos</option>
                      <option value="alquiler">Alquiler de Consultorio</option>
                      <option value="servicios">Servicios (Luz, Internet)</option>
                      <option value="otros">Otros Gastos</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Fecha de Compra / Pago</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    required 
                    value={expenseForm.date} 
                    onChange={e => setExpenseForm({...expenseForm, date: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'right' }}>
                <button type="button" className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => setShowAddExpense(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Registrar Salida</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. HISTORIA CLINICA MODAL (DIGITALIZAR FICHA) */}
      {showAddHistory && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '820px', maxWidth: '95%' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {historyFormType === 'ingreso' ? 'Ficha Inicial (HC-Escuela)' : 'Ficha de Sesión (HC Seguimiento)'}
                </span>
                <h3 style={{ margin: '0' }}>Digitalizar Historia Clínica</h3>
              </div>
              <button className="modal-close" onClick={() => setShowAddHistory(false)}>×</button>
            </div>
            <form onSubmit={handleHistorySubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <span>Paciente: <strong>{activePatient?.name}</strong></span>
                  {historyFormType === 'sesion' && <span>Sesión N°: <strong>{historyForm.session_number}</strong></span>}
                </div>

                {/* Tabs for Intake Form */}
                {historyFormType === 'ingreso' && (
                  <div className="modal-tabs">
                    <button type="button" className={`modal-tab-btn ${historyFormTab === 'reason' ? 'active' : ''}`} onClick={() => setHistoryFormTab('reason')}>1. Motivo & ALICIA</button>
                    <button type="button" className={`modal-tab-btn ${historyFormTab === 'systems' ? 'active' : ''}`} onClick={() => setHistoryFormTab('systems')}>2. Revisión de Sistemas</button>
                    <button type="button" className={`modal-tab-btn ${historyFormTab === 'semiology' ? 'active' : ''}`} onClick={() => setHistoryFormTab('semiology')}>3. Lengua & Pulsos</button>
                    <button type="button" className={`modal-tab-btn ${historyFormTab === 'tcm' ? 'active' : ''}`} onClick={() => setHistoryFormTab('tcm')}>4. Diagnóstico MTC</button>
                    <button type="button" className={`modal-tab-btn ${historyFormTab === 'treatment' ? 'active' : ''}`} onClick={() => setHistoryFormTab('treatment')}>5. Tratamiento</button>
                  </div>
                )}

                {/* TAB 1: MOTIVO Y ALICIA (INGRESO) OR MAIN FLOW (SESION) */}
                {historyFormType === 'ingreso' && historyFormTab === 'reason' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Terapeuta Responsable</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Ej. Carolina Escudero" 
                          value={historyForm.therapist} 
                          onChange={e => setHistoryForm({...historyForm, therapist: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Alumnos / Asistentes</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Nombres separados por coma..." 
                          value={historyForm.students} 
                          onChange={e => setHistoryForm({...historyForm, students: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Motivo principal de consulta</label>
                        <textarea 
                          className="form-control" 
                          required 
                          rows="2"
                          placeholder="Dolor de espalda, migrañas, desórdenes digestivos..."
                          value={historyForm.reason}
                          onChange={e => setHistoryForm({...historyForm, reason: e.target.value})}
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label>Tiempo de Evolución (Duración)</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Ej. 3 meses, 2 años..."
                          value={historyForm.time}
                          onChange={e => setHistoryForm({...historyForm, time: e.target.value})}
                        />
                      </div>
                    </div>

                    <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--primary)' }}>Evaluación del Dolor (Escala ALICIA)</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Aparición (Onset)</label>
                        <input type="text" className="form-control" placeholder="¿Cuándo empezó?" value={historyForm.alicia.a_onset} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, a_onset: e.target.value}})} />
                      </div>
                      <div className="form-group">
                        <label>Localización</label>
                        <input type="text" className="form-control" placeholder="¿Dónde duele?" value={historyForm.alicia.l_location} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, l_location: e.target.value}})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Intensidad</label>
                        <input type="text" className="form-control" placeholder="1 al 10, tipo de molestia..." value={historyForm.alicia.i_intensity} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, i_intensity: e.target.value}})} />
                      </div>
                      <div className="form-group">
                        <label>Carácter (Tipo de dolor)</label>
                        <input type="text" className="form-control" placeholder="Punzante, sordo, opresivo..." value={historyForm.alicia.c_character} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, c_character: e.target.value}})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Irradiación</label>
                        <input type="text" className="form-control" placeholder="¿Se extiende hacia algún lado?" value={historyForm.alicia.i_radiation} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, i_radiation: e.target.value}})} />
                      </div>
                      <div className="form-group">
                        <label>Agravación (Factores)</label>
                        <input type="text" className="form-control" placeholder="¿Qué lo empeora? (frío, calor, esfuerzo...)" value={historyForm.alicia.ag_aggravating} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, ag_aggravating: e.target.value}})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Atenuación (Factores)</label>
                        <input type="text" className="form-control" placeholder="¿Qué lo alivia? (calor, reposo, presión...)" value={historyForm.alicia.at_relieving} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, at_relieving: e.target.value}})} />
                      </div>
                      <div className="form-group">
                        <label>Síntomas Asociados (Acompañamiento)</label>
                        <input type="text" className="form-control" placeholder="Mareos, náuseas, sudoración..." value={historyForm.alicia.ac_associated} onChange={e => setHistoryForm({...historyForm, alicia: {...historyForm.alicia, ac_associated: e.target.value}})} />
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 2: REVISION DE SISTEMAS (INGRESO) */}
                {historyFormType === 'ingreso' && historyFormTab === 'systems' && (
                  <>
                    <div className="form-group">
                      <label>Diagnóstico Occidental / Antecedentes Enfermedad Actual</label>
                      <textarea 
                        className="form-control" 
                        rows="2"
                        placeholder="Ej. Hernia de disco L4-L5 diagnosticada, toma ibuprofeno..."
                        value={historyForm.western_diagnosis}
                        onChange={e => setHistoryForm({...historyForm, western_diagnosis: e.target.value})}
                      ></textarea>
                    </div>

                    <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--primary)' }}>Semiología de Sistemas y Fisiología</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Temperatura Corporal</label>
                        <input type="text" className="form-control" placeholder="Aversión al frío/calor, febrícula..." value={historyForm.temperature} onChange={e => setHistoryForm({...historyForm, temperature: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Sed y Sudoración</label>
                        <input type="text" className="form-control" placeholder="Mucha sed, boca seca, sudor nocturno..." value={historyForm.thirst_sweat} onChange={e => setHistoryForm({...historyForm, thirst_sweat: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sueño</label>
                        <input type="text" className="form-control" placeholder="Dificultad para conciliar, se despierta..." value={historyForm.sleep} onChange={e => setHistoryForm({...historyForm, sleep: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Shen (Emociones / Memoria)</label>
                        <input type="text" className="form-control" placeholder="Ansiedad, tristeza, olvidos, ira..." value={historyForm.shen} onChange={e => setHistoryForm({...historyForm, shen: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cabeza y Sentidos</label>
                        <input type="text" className="form-control" placeholder="Cefalea, mareo, tinnitus, Aliciaaa..." value={historyForm.head} onChange={e => setHistoryForm({...historyForm, head: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Sistema Respiratorio</label>
                        <input type="text" className="form-control" placeholder="Disnea, tos, expectoración, congestión..." value={historyForm.respiratory} onChange={e => setHistoryForm({...historyForm, respiratory: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sistema Cardiovascular</label>
                        <input type="text" className="form-control" placeholder="Palpitaciones, hipertensión, várices..." value={historyForm.cardiovascular} onChange={e => setHistoryForm({...historyForm, cardiovascular: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Sistema Digestivo</label>
                        <input type="text" className="form-control" placeholder="Apetito, distensión, acidez, reflujo, dolor..." value={historyForm.digestive} onChange={e => setHistoryForm({...historyForm, digestive: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Excretor - Orina</label>
                        <input type="text" className="form-control" placeholder="Frecuencia, color, volumen..." value={historyForm.excretor_orina} onChange={e => setHistoryForm({...historyForm, excretor_orina: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Excretor - Heces</label>
                        <input type="text" className="form-control" placeholder="Consistencia, frecuencia, dolor..." value={historyForm.excretor_heces} onChange={e => setHistoryForm({...historyForm, excretor_heces: e.target.value})} />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sistema Urinario / Renal</label>
                        <input type="text" className="form-control" placeholder="Cálculos, cistitis, dolor lumbar/rodilla..." value={historyForm.urinary} onChange={e => setHistoryForm({...historyForm, urinary: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Ginecología (si corresponde)</label>
                        <input type="text" className="form-control" placeholder="Ciclo, dolores, partos, menopausia..." value={historyForm.gynecology} onChange={e => setHistoryForm({...historyForm, gynecology: e.target.value})} />
                      </div>
                    </div>

                    <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--primary)' }}>Zang Fu Controles (Tejidos) & Aperturas (Órganos Sentidos)</h4>
                    <div className="form-row" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tejidos de Control</span>
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Huesos/Articulaciones (Riñón)" value={historyForm.control.joints_bones} onChange={e => setHistoryForm({...historyForm, control: {...historyForm.control, joints_bones: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Vasos Sanguíneos (Corazón)" value={historyForm.control.blood_vessels} onChange={e => setHistoryForm({...historyForm, control: {...historyForm.control, blood_vessels: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Tendones (Hígado)" value={historyForm.control.tendons} onChange={e => setHistoryForm({...historyForm, control: {...historyForm.control, tendons: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Músculos (Bazo)" value={historyForm.control.muscles} onChange={e => setHistoryForm({...historyForm, control: {...historyForm.control, muscles: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Piel (Pulmón)" value={historyForm.control.skin} onChange={e => setHistoryForm({...historyForm, control: {...historyForm.control, skin: e.target.value}})} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.4rem', backgroundColor: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Órganos de los Sentidos</span>
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Audición (Riñón)" value={historyForm.openings.hearing} onChange={e => setHistoryForm({...historyForm, openings: {...historyForm.openings, hearing: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Vista (Hígado)" value={historyForm.openings.vision} onChange={e => setHistoryForm({...historyForm, openings: {...historyForm.openings, vision: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Habla (Corazón)" value={historyForm.openings.speech} onChange={e => setHistoryForm({...historyForm, openings: {...historyForm.openings, speech: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Gusto (Bazo)" value={historyForm.openings.taste} onChange={e => setHistoryForm({...historyForm, openings: {...historyForm.openings, taste: e.target.value}})} />
                        <input type="text" className="form-control" style={{ padding: '0.4rem' }} placeholder="Olfato (Pulmón)" value={historyForm.openings.smell} onChange={e => setHistoryForm({...historyForm, openings: {...historyForm.openings, smell: e.target.value}})} />
                      </div>
                    </div>

                    <h4 style={{ margin: '1rem 0 0.5rem', color: 'var(--primary)' }}>Antecedentes Personales y Familiares</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Antecedentes Personales</label>
                        <input type="text" className="form-control" placeholder="Cirugías, infecciones (Hepatitis, Herpes, HIV, Varicela...)" value={historyForm.personal_history} onChange={e => setHistoryForm({...historyForm, personal_history: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Antecedentes Familiares</label>
                        <input type="text" className="form-control" placeholder="Diabetes, cáncer, hipertensión, autoinmunes..." value={historyForm.family_history} onChange={e => setHistoryForm({...historyForm, family_history: e.target.value})} />
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 3: LENGUA Y PULSOS (INGRESO Y SESION) */}
                {((historyFormType === 'ingreso' && historyFormTab === 'semiology') || (historyFormType === 'sesion')) && (
                  <>
                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--primary)' }}>Examen de Lengua (Semiología)</h4>
                    <div className="tongue-visual-container">
                      <div className="tongue-graphic">
                        <span className="tongue-zone tz-root">Raíz</span>
                        <span className="tongue-zone tz-center">Centro</span>
                        <span className="tongue-zone tz-tip">Punta</span>
                        <span className="tongue-zone tz-left">Izq</span>
                        <span className="tongue-zone tz-right">Der</span>
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div className="checklist-grid" style={{ marginBottom: '0.75rem' }}>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_dentada" checked={historyForm.tongue.dentada} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, dentada: e.target.checked}})} />
                            <label htmlFor="t_dentada">Dentada 〰</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_gruesa" checked={historyForm.tongue.gruesa} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, gruesa: e.target.checked}})} />
                            <label htmlFor="t_gruesa">Gruesa 🅖</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_delgada" checked={historyForm.tongue.delgada} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, delgada: e.target.checked}})} />
                            <label htmlFor="t_delgada">Delgada 🅓</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_punto" checked={historyForm.tongue.punto_rojo} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, punto_rojo: e.target.checked}})} />
                            <label htmlFor="t_punto">Puntos rojos •</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_peladez" checked={historyForm.tongue.peladez} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, peladez: e.target.checked}})} />
                            <label htmlFor="t_peladez">Peladez 🅟</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_grieta" checked={historyForm.tongue.grieta} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, grieta: e.target.checked}})} />
                            <label htmlFor="t_grieta">Grieta ──</label>
                          </div>
                          <div className="checklist-item">
                            <input type="checkbox" id="t_contorno" checked={historyForm.tongue.contorno} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, contorno: e.target.checked}})} />
                            <label htmlFor="t_contorno">Contorno ----</label>
                          </div>
                        </div>

                        <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Cuerpo: Forma" value={historyForm.tongue.body_shape} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, body_shape: e.target.value}})} />
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Cuerpo: Color" value={historyForm.tongue.body_color} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, body_color: e.target.value}})} />
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Cuerpo: Agregados" value={historyForm.tongue.body_added} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, body_added: e.target.value}})} />
                        </div>
                        <div className="form-row" style={{ gridTemplateColumns: '1.5fr 1fr', marginTop: '0.4rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Saburra: Distribución/Espesor" value={historyForm.tongue.coating_shape} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, coating_shape: e.target.value}})} />
                          <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Saburra: Color" value={historyForm.tongue.coating_color} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, coating_color: e.target.value}})} />
                        </div>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
                      <input type="text" className="form-control" style={{ padding: '0.4rem', fontSize: '0.8rem' }} placeholder="Observaciones adicionales de la lengua..." value={historyForm.tongue.notes} onChange={e => setHistoryForm({...historyForm, tongue: {...historyForm.tongue, notes: e.target.value}})} />
                    </div>

                    <h4 style={{ margin: '0 0 0.5rem', color: 'var(--primary)' }}>Examen de Pulsos (Derecho e Izquierdo)</h4>
                    <div className="pulses-table-container">
                      {/* PULSO DERECHO */}
                      <div>
                        <div className="pulse-side-title">Pulso Derecho (Mano Derecha)</div>
                        <div className="pulse-grid">
                          <div className="pulse-header-cell">Prof.</div>
                          <div className="pulse-header-cell">Cun (Pulmón)</div>
                          <div className="pulse-header-cell">Guan (Bazo)</div>
                          <div className="pulse-header-cell">Chi (R. Yang)</div>

                          <div className="pulse-row-label">Superf.</div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.sup.cun} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, sup: {...historyForm.pulses.right.sup, cun: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.sup.guan} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, sup: {...historyForm.pulses.right.sup, guan: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.sup.chi} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, sup: {...historyForm.pulses.right.sup, chi: e.target.value}}}})} /></div>

                          <div className="pulse-row-label">Medio</div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.med.cun} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, med: {...historyForm.pulses.right.med, cun: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.med.guan} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, med: {...historyForm.pulses.right.med, guan: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.med.chi} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, med: {...historyForm.pulses.right.med, chi: e.target.value}}}})} /></div>

                          <div className="pulse-row-label">Prof.</div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.prof.cun} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, prof: {...historyForm.pulses.right.prof, cun: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.prof.guan} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, prof: {...historyForm.pulses.right.prof, guan: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.right.prof.chi} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, prof: {...historyForm.pulses.right.prof, chi: e.target.value}}}})} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.4rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Frecuencia (ritmo/regularidad)" value={historyForm.pulses.right.frequency} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, frequency: e.target.value}}})} />
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Forma de onda (wirly/slippery...)" value={historyForm.pulses.right.waveform} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, waveform: e.target.value}}})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Tensión pared" value={historyForm.pulses.right.tension} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, tension: e.target.value}}})} />
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Diámetro" value={historyForm.pulses.right.diameter} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, diameter: e.target.value}}})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Fuerza (amplitud)" value={historyForm.pulses.right.force} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, force: e.target.value}}})} />
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Desc. General / Niveles" value={historyForm.pulses.right.desc_general} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, right: {...historyForm.pulses.right, desc_general: e.target.value}}})} />
                        </div>
                      </div>

                      {/* PULSO IZQUIERDO */}
                      <div>
                        <div className="pulse-side-title">Pulso Izquierdo (Mano Izquierda)</div>
                        <div className="pulse-grid">
                          <div className="pulse-header-cell">Prof.</div>
                          <div className="pulse-header-cell">Cun (Corazón)</div>
                          <div className="pulse-header-cell">Guan (Hígado)</div>
                          <div className="pulse-header-cell">Chi (R. Yin)</div>

                          <div className="pulse-row-label">Superf.</div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.sup.cun} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, sup: {...historyForm.pulses.left.sup, cun: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.sup.guan} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, sup: {...historyForm.pulses.left.sup, guan: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.sup.chi} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, sup: {...historyForm.pulses.left.sup, chi: e.target.value}}}})} /></div>

                          <div className="pulse-row-label">Medio</div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.med.cun} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, med: {...historyForm.pulses.left.med, cun: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.med.guan} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, med: {...historyForm.pulses.left.med, guan: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.med.chi} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, med: {...historyForm.pulses.left.med, chi: e.target.value}}}})} /></div>

                          <div className="pulse-row-label">Prof.</div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.prof.cun} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, prof: {...historyForm.pulses.left.prof, cun: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.prof.guan} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, prof: {...historyForm.pulses.left.prof, guan: e.target.value}}}})} /></div>
                          <div className="pulse-input-cell"><input type="text" className="pulse-input" value={historyForm.pulses.left.prof.chi} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, prof: {...historyForm.pulses.left.prof, chi: e.target.value}}}})} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.4rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Frecuencia (ritmo/regularidad)" value={historyForm.pulses.left.frequency} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, frequency: e.target.value}}})} />
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Forma de onda (wirly/slippery...)" value={historyForm.pulses.left.waveform} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, waveform: e.target.value}}})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Tensión pared" value={historyForm.pulses.left.tension} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, tension: e.target.value}}})} />
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Diámetro" value={historyForm.pulses.left.diameter} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, diameter: e.target.value}}})} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Fuerza (amplitud)" value={historyForm.pulses.left.force} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, force: e.target.value}}})} />
                          <input type="text" className="form-control" style={{ padding: '0.3rem', fontSize: '0.75rem' }} placeholder="Desc. General / Niveles" value={historyForm.pulses.left.desc_general} onChange={e => setHistoryForm({...historyForm, pulses: {...historyForm.pulses, left: {...historyForm.pulses.left, desc_general: e.target.value}}})} />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 4: DIAGNOSTICO CHINO MTC (INGRESO) */}
                {historyFormType === 'ingreso' && historyFormTab === 'tcm' && (
                  <>
                    <div className="form-group">
                      <label>Causas Probables</label>
                      <input type="text" className="form-control" placeholder="Congénitas, hábitos alimentarios, descanso, emocionales..." value={historyForm.causes} onChange={e => setHistoryForm({...historyForm, causes: e.target.value})} />
                    </div>

                    <div className="form-row">
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Factores Patógenos Internos</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                          {['viento', 'frio', 'calor', 'humedad', 'sequedad', 'fuego'].map(fp => (
                            <div className="checklist-item" key={fp}>
                              <input type="checkbox" id={`fpi_${fp}`} checked={historyForm.pathogens.internal[fp]} onChange={e => setHistoryForm({...historyForm, pathogens: {...historyForm.pathogens, internal: {...historyForm.pathogens.internal, [fp]: e.target.checked}}})} />
                              <label htmlFor={`fpi_${fp}`} style={{ textTransform: 'capitalize' }}>{fp}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Factores Patógenos Externos</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                          {['viento', 'frio', 'calor', 'humedad', 'sequedad', 'fuego'].map(fp => (
                            <div className="checklist-item" key={fp}>
                              <input type="checkbox" id={`fpe_${fp}`} checked={historyForm.pathogens.external[fp]} onChange={e => setHistoryForm({...historyForm, pathogens: {...historyForm.pathogens, external: {...historyForm.pathogens.external, [fp]: e.target.checked}}})} />
                              <label htmlFor={`fpe_${fp}`} style={{ textTransform: 'capitalize' }}>{fp}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-row" style={{ marginTop: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Órganos Yin Afectados</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          {[['p', 'Pulmón'], ['b', 'Bazo'], ['c', 'Corazón'], ['r', 'Riñón'], ['pc', 'P.Cardio'], ['h', 'Hígado']].map(([k, label]) => (
                            <div className="checklist-item" key={k}>
                              <input type="checkbox" id={`oyin_${k}`} checked={historyForm.affected_organs.yin[k]} onChange={e => setHistoryForm({...historyForm, affected_organs: {...historyForm.affected_organs, yin: {...historyForm.affected_organs.yin, [k]: e.target.checked}}})} />
                              <label htmlFor={`oyin_${k}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Órganos Yang Afectados</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          {[['ig', 'I.Grueso'], ['e', 'Estómago'], ['id', 'I.Delgado'], ['v', 'Vejiga'], ['sj', 'S.Jiao'], ['vb', 'V.Biliar']].map(([k, label]) => (
                            <div className="checklist-item" key={k}>
                              <input type="checkbox" id={`oyang_${k}`} checked={historyForm.affected_organs.yang[k]} onChange={e => setHistoryForm({...historyForm, affected_organs: {...historyForm.affected_organs, yang: {...historyForm.affected_organs.yang, [k]: e.target.checked}}})} />
                              <label htmlFor={`oyang_${k}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-row" style={{ marginTop: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Meridianos Yin Afectados</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          {[['p', 'Pulmón'], ['b', 'Bazo'], ['c', 'Corazón'], ['r', 'Riñón'], ['pc', 'P.Cardio'], ['h', 'Hígado']].map(([k, label]) => (
                            <div className="checklist-item" key={k}>
                              <input type="checkbox" id={`myin_${k}`} checked={historyForm.affected_meridians.yin[k]} onChange={e => setHistoryForm({...historyForm, affected_meridians: {...historyForm.affected_meridians, yin: {...historyForm.affected_meridians.yin, [k]: e.target.checked}}})} />
                              <label htmlFor={`myin_${k}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Meridianos Yang Afectados</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                          {[['ig', 'I.Grueso'], ['e', 'Estómago'], ['id', 'I.Delgado'], ['v', 'Vejiga'], ['sj', 'S.Jiao'], ['vb', 'V.Biliar']].map(([k, label]) => (
                            <div className="checklist-item" key={k}>
                              <input type="checkbox" id={`myang_${k}`} checked={historyForm.affected_meridians.yang[k]} onChange={e => setHistoryForm({...historyForm, affected_meridians: {...historyForm.affected_meridians, yang: {...historyForm.affected_meridians.yang, [k]: e.target.checked}}})} />
                              <label htmlFor={`myang_${k}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="form-row" style={{ marginTop: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Vasos Maravillosos</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                          {[['yin_wei_mai', 'Yin Wei Mai'], ['yin_quiao_mai', 'Yin Qiao Mai'], ['dai_mai', 'Dai Mai'], ['ren_mai', 'Ren Mai'], ['yang_wei_mai', 'Yang Wei Mai'], ['yang_quiao_mai', 'Yang Qiao Mai'], ['chong_mai', 'Chong Mai'], ['du_mai', 'Du Mai']].map(([k, label]) => (
                            <div className="checklist-item" key={k}>
                              <input type="checkbox" id={`vm_${k}`} checked={historyForm.extraordinary_vessels[k]} onChange={e => setHistoryForm({...historyForm, extraordinary_vessels: {...historyForm.extraordinary_vessels, [k]: e.target.checked}})} />
                              <label htmlFor={`vm_${k}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>Diagnóstico Ba Gang (8 Principios)</label>
                        <div className="checklist-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                          {[['int', 'Interior'], ['ext', 'Exterior'], ['q', 'Calor (Q)'], ['frio', 'Frío'], ['def', 'Deficiencia'], ['exc', 'Exceso'], ['yin', 'Yin'], ['yang', 'Yang']].map(([k, label]) => (
                            <div className="checklist-item" key={k}>
                              <input type="checkbox" id={`bg_${k}`} checked={historyForm.ba_gang[k]} onChange={e => setHistoryForm({...historyForm, ba_gang: {...historyForm.ba_gang, [k]: e.target.checked}})} />
                              <label htmlFor={`bg_${k}`}>{label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* TAB 5 (INGRESO) OR TAB 2 (SESION): TRATAMIENTO */}
                {((historyFormType === 'ingreso' && historyFormTab === 'treatment') || (historyFormType === 'sesion')) && (
                  <>
                    {/* Evolution fields (only session) */}
                    {historyFormType === 'sesion' && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Terapeuta</label>
                            <input type="text" className="form-control" value={historyForm.therapist} onChange={e => setHistoryForm({...historyForm, therapist: e.target.value})} />
                          </div>
                          <div className="form-group">
                            <label>Alumnos</label>
                            <input type="text" className="form-control" value={historyForm.students} onChange={e => setHistoryForm({...historyForm, students: e.target.value})} />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Evolución Comparativa General</label>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            {['mejor', 'igual', 'peor'].map(ev => (
                              <label key={ev} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: '500', textTransform: 'capitalize' }}>
                                <input type="radio" name="evolution_type" checked={historyForm.evolution_type === ev} onChange={() => setHistoryForm({...historyForm, evolution_type: ev})} />
                                <span className={`evolution-badge ${ev}`} style={{ display: 'inline-block' }}>{ev}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Evolución del síntoma principal</label>
                            <textarea 
                              className="form-control" 
                              rows="2"
                              placeholder="Reducción de dolor lumbar, disminución de espasmos..." 
                              value={historyForm.evolution_reason} 
                              onChange={e => setHistoryForm({...historyForm, evolution_reason: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Evolución General / Comentarios</label>
                            <textarea 
                              className="form-control" 
                              rows="2"
                              placeholder="Mejor ánimo, digestiones estables, sueño reparador..." 
                              value={historyForm.evolution_general} 
                              onChange={e => setHistoryForm({...historyForm, evolution_general: e.target.value})}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {historyFormType === 'ingreso' && (
                      <div className="form-group">
                        <label>Símndromes Diagnosticados (MTC)</label>
                        <textarea 
                          className="form-control" 
                          rows="2"
                          placeholder="Estasis de Xue de Hígado, Deficiencia de Qi de Bazo..."
                          value={historyForm.syndromes}
                          onChange={e => setHistoryForm({...historyForm, syndromes: e.target.value})}
                        ></textarea>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Principio de tratamiento</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Mover Xue, tonificar Qi, dispersar viento..."
                        value={historyForm.treatment_principle}
                        onChange={e => setHistoryForm({...historyForm, treatment_principle: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Espíritu del tratamiento (Acciones)</label>
                      <div className="checklist-grid">
                        {[['tonif', 'Tonificar'], ['disper', 'Dispersar'], ['elimin', 'Eliminar'], ['purgar', 'Purgar'], ['enfriar', 'Enfriar'], ['calent', 'Calentar'], ['armon', 'Armonizar']].map(([k, label]) => (
                          <div className="checklist-item" key={k}>
                            <input type="checkbox" id={`spirit_${k}`} checked={historyForm.treatment_spirit[k]} onChange={e => setHistoryForm({...historyForm, treatment_spirit: {...historyForm.treatment_spirit, [k]: e.target.checked}})} />
                            <label htmlFor={`spirit_${k}`}>{label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Receta de Puntos (Resonadores) y Técnica Aplicada</label>
                      <textarea 
                        className="form-control" 
                        rows="3"
                        placeholder="IG4, E36 (tonificación con aguja), H3 (dispersión)..."
                        value={historyForm.recipe_technique}
                        onChange={e => setHistoryForm({...historyForm, recipe_technique: e.target.value})}
                      ></textarea>
                    </div>

                    <div className="form-group">
                      <label>Técnicas Complementarias Utilizadas</label>
                      <div className="checklist-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {[['tuina', 'Tuina'], ['ventosas', 'Ventosas'], ['moxa', 'Moxa'], ['electro', 'Electroacupuntura']].map(([k, label]) => (
                          <div className="checklist-item" key={k}>
                            <input type="checkbox" id={`ther_${k}`} checked={historyForm.therapies[k]} onChange={e => setHistoryForm({...historyForm, therapies: {...historyForm.therapies, [k]: e.target.checked}})} />
                            <label htmlFor={`ther_${k}`}>{label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Observaciones y Recomendaciones Generales</label>
                      <textarea 
                        className="form-control" 
                        rows="2"
                        placeholder="Evitar alimentos fríos, mantener abrigada la zona lumbar..."
                        value={historyForm.notes}
                        onChange={e => setHistoryForm({...historyForm, notes: e.target.value})}
                      ></textarea>
                    </div>
                  </>
                )}
              </div>
              
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {historyFormType === 'ingreso' && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Paso: {historyFormTab === 'reason' && '1 de 5 (Datos & ALICIA)'}
                      {historyFormTab === 'systems' && '2 de 5 (Sistemas)'}
                      {historyFormTab === 'semiology' && '3 de 5 (Examen de Lengua & Pulsos)'}
                      {historyFormTab === 'tcm' && '4 de 5 (Diagnóstico Chino)'}
                      {historyFormTab === 'treatment' && '5 de 5 (Plan de Tratamiento)'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddHistory(false)}>Cancelar</button>
                  {historyFormType === 'ingreso' && historyFormTab !== 'treatment' ? (
                    <button type="button" className="btn btn-accent" onClick={() => {
                      if (historyFormTab === 'reason') setHistoryFormTab('systems')
                      else if (historyFormTab === 'systems') setHistoryFormTab('semiology')
                      else if (historyFormTab === 'semiology') setHistoryFormTab('tcm')
                      else if (historyFormTab === 'tcm') setHistoryFormTab('treatment')
                    }}>Siguiente ▶</button>
                  ) : (
                    <button type="submit" className="btn btn-primary">Registrar Ficha</button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
