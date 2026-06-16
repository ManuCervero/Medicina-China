import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Habilitar CORS para desarrollo local
app.use('*', cors())

// Helper para convertir hora HH:MM a minutos desde la medianoche
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper para parsear JSON seguro
function safeJsonParse(jsonStr: string) {
  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    return {}
  }
}

// -------------------------------------------------------------
// PATIENTS ENDPOINTS
// -------------------------------------------------------------

// Listar todos los pacientes
app.get('/api/patients', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM patients ORDER BY name ASC'
    ).all()
    return c.json(results)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Obtener un paciente por ID
app.get('/api/patients/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const patient = await c.env.DB.prepare(
      'SELECT * FROM patients WHERE id = ?'
    ).bind(id).first()

    if (!patient) {
      return c.json({ error: 'Paciente no encontrado' }, 404)
    }
    return c.json(patient)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Crear un paciente nuevo
app.post('/api/patients', async (c) => {
  try {
    const body = await c.req.json()
    const { name, phone, email, birth_date, dni, address, locality, occupation, civil_status } = body

    if (!name) {
      return c.json({ error: 'El nombre es obligatorio' }, 400)
    }

    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO patients (id, name, phone, email, birth_date, dni, address, locality, occupation, civil_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      id,
      name,
      phone || null,
      email || null,
      birth_date || null,
      dni || null,
      address || null,
      locality || null,
      occupation || null,
      civil_status || null
    ).run()

    const newPatient = await c.env.DB.prepare('SELECT * FROM patients WHERE id = ?').bind(id).first()
    return c.json(newPatient, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Actualizar un paciente
app.put('/api/patients/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const { name, phone, email, birth_date, dni, address, locality, occupation, civil_status } = body

    if (!name) {
      return c.json({ error: 'El nombre es obligatorio' }, 400)
    }

    const result = await c.env.DB.prepare(
      'UPDATE patients SET name = ?, phone = ?, email = ?, birth_date = ?, dni = ?, address = ?, locality = ?, occupation = ?, civil_status = ? WHERE id = ?'
    ).bind(
      name,
      phone || null,
      email || null,
      birth_date || null,
      dni || null,
      address || null,
      locality || null,
      occupation || null,
      civil_status || null,
      id
    ).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Paciente no encontrado' }, 404)
    }

    const updatedPatient = await c.env.DB.prepare('SELECT * FROM patients WHERE id = ?').bind(id).first()
    return c.json(updatedPatient)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Eliminar un paciente
app.delete('/api/patients/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await c.env.DB.prepare('DELETE FROM patients WHERE id = ?').bind(id).run()
    if (result.meta.changes === 0) {
      return c.json({ error: 'Paciente no encontrado' }, 404)
    }
    return c.json({ success: true, message: 'Paciente eliminado' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})


// -------------------------------------------------------------
// APPOINTMENTS ENDPOINTS
// -------------------------------------------------------------

// Listar turnos (filtro por fechas o paciente)
app.get('/api/appointments', async (c) => {
  const startDate = c.req.query('start_date') // YYYY-MM-DD
  const endDate = c.req.query('end_date') // YYYY-MM-DD
  const patientId = c.req.query('patient_id')

  try {
    let query = `
      SELECT a.*, p.name as patient_name, p.phone as patient_phone 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id
    `
    const conditions: string[] = []
    const params: any[] = []

    if (startDate) {
      conditions.push('a.date >= ?')
      params.push(startDate)
    }
    if (endDate) {
      conditions.push('a.date <= ?')
      params.push(endDate)
    }
    if (patientId) {
      conditions.push('a.patient_id = ?')
      params.push(patientId)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY a.date ASC, a.time ASC'

    const { results } = await c.env.DB.prepare(query).bind(...params).all()
    return c.json(results)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Crear un turno con control de superposiciones y duración automatizada
app.post('/api/appointments', async (c) => {
  try {
    const body = await c.req.json()
    const { patient_id, date, time, type, price, notes } = body

    if (!patient_id || !date || !time || !type) {
      return c.json({ error: 'Faltan campos obligatorios (paciente, fecha, hora, tipo)' }, 400)
    }

    // Definir duración: nuevo = 60 min, seguimiento = 30 min
    const duration = type === 'nuevo' ? 60 : 30
    const startMin = timeToMinutes(time)
    const endMin = startMin + duration

    // Control de superposición en el mismo día (excluyendo cancelados)
    const { results: existingAppointments } = await c.env.DB.prepare(
      "SELECT * FROM appointments WHERE date = ? AND status != 'cancelado'"
    ).bind(date).all()

    for (const appt of existingAppointments as any[]) {
      const apptStart = timeToMinutes(appt.time)
      const apptEnd = apptStart + appt.duration

      // Solapamiento: el nuevo turno comienza antes del fin del existente Y termina después del inicio del existente
      if (startMin < apptEnd && endMin > apptStart) {
        return c.json({ 
          error: `Conflicto de horario: Ya existe un turno programado de ${appt.time} a ${
            Math.floor(apptEnd / 60).toString().padStart(2, '0')
          }:${(apptEnd % 60).toString().padStart(2, '0')} para este día.` 
        }, 409)
      }
    }

    const id = crypto.randomUUID()
    const apptPrice = price !== undefined ? price : (type === 'nuevo' ? 15000 : 10000) // precios por defecto si no se envían

    await c.env.DB.prepare(
      'INSERT INTO appointments (id, patient_id, date, time, duration, type, price, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, patient_id, date, time, duration, type, apptPrice, 'pendiente', notes || null).run()

    const newAppt = await c.env.DB.prepare(
      'SELECT a.*, p.name as patient_name FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?'
    ).bind(id).first()

    return c.json(newAppt, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Actualizar un turno (incluye reprogramación y validación de superposición)
app.put('/api/appointments/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const { date, time, type, price, status, notes, patient_id } = body

    // Obtener turno actual
    const currentAppt = await c.env.DB.prepare('SELECT * FROM appointments WHERE id = ?').bind(id).first() as any
    if (!currentAppt) {
      return c.json({ error: 'Turno no encontrado' }, 404)
    }

    const updatedDate = date || currentAppt.date
    const updatedTime = time || currentAppt.time
    const updatedType = type || currentAppt.type
    const updatedStatus = status || currentAppt.status
    const updatedPatientId = patient_id || currentAppt.patient_id
    const updatedDuration = updatedType === 'nuevo' ? 60 : 30
    const updatedPrice = price !== undefined ? price : currentAppt.price
    const updatedNotes = notes !== undefined ? notes : currentAppt.notes

    // Si se reprograma y no está cancelado, chequear superposición
    if (updatedStatus !== 'cancelado' && (date || time || type)) {
      const startMin = timeToMinutes(updatedTime)
      const endMin = startMin + updatedDuration

      const { results: existingAppointments } = await c.env.DB.prepare(
        "SELECT * FROM appointments WHERE date = ? AND id != ? AND status != 'cancelado'"
      ).bind(updatedDate, id).all()

      for (const appt of existingAppointments as any[]) {
        const apptStart = timeToMinutes(appt.time)
        const apptEnd = apptStart + appt.duration

        if (startMin < apptEnd && endMin > apptStart) {
          return c.json({ 
            error: `Conflicto de horario: Ya existe un turno programado de ${appt.time} a ${
              Math.floor(apptEnd / 60).toString().padStart(2, '0')
            }:${(apptEnd % 60).toString().padStart(2, '0')} para este día.` 
          }, 409)
        }
      }
    }

    await c.env.DB.prepare(`
      UPDATE appointments 
      SET patient_id = ?, date = ?, time = ?, duration = ?, type = ?, price = ?, status = ?, notes = ?
      WHERE id = ?
    `).bind(updatedPatientId, updatedDate, updatedTime, updatedDuration, updatedType, updatedPrice, updatedStatus, updatedNotes, id).run()

    const updatedAppt = await c.env.DB.prepare(
      'SELECT a.*, p.name as patient_name FROM appointments a JOIN patients p ON a.patient_id = p.id WHERE a.id = ?'
    ).bind(id).first()

    return c.json(updatedAppt)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Eliminar un turno
app.delete('/api/appointments/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await c.env.DB.prepare('DELETE FROM appointments WHERE id = ?').bind(id).run()
    if (result.meta.changes === 0) {
      return c.json({ error: 'Turno no encontrado' }, 404)
    }
    return c.json({ success: true, message: 'Turno eliminado' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})


// -------------------------------------------------------------
// CLINICAL HISTORIES ENDPOINTS
// -------------------------------------------------------------

// Listar todas las fichas de historia clínica de un paciente
app.get('/api/clinical-histories/patient/:patient_id', async (c) => {
  const patientId = c.req.param('patient_id')
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM clinical_histories WHERE patient_id = ? ORDER BY created_at DESC'
    ).bind(patientId).all()

    // Parsear el campo 'data' que está almacenado como JSON String
    const formattedResults = results.map(r => ({
      ...r,
      data: safeJsonParse(r.data as string)
    }))

    return c.json(formattedResults)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Crear una ficha clínica
app.post('/api/clinical-histories', async (c) => {
  try {
    const body = await c.req.json()
    const { patient_id, appointment_id, type, data } = body

    if (!patient_id || !type || !data) {
      return c.json({ error: 'Faltan campos obligatorios (paciente, tipo, datos)' }, 400)
    }

    const id = crypto.randomUUID()
    const dataString = typeof data === 'string' ? data : JSON.stringify(data)

    await c.env.DB.prepare(
      'INSERT INTO clinical_histories (id, patient_id, appointment_id, type, data) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, patient_id, appointment_id || null, type, dataString).run()

    const newHistory = await c.env.DB.prepare('SELECT * FROM clinical_histories WHERE id = ?').bind(id).first() as any
    return c.json({
      ...newHistory,
      data: safeJsonParse(newHistory.data)
    }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Actualizar una ficha clínica
app.put('/api/clinical-histories/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const body = await c.req.json()
    const { data } = body

    if (!data) {
      return c.json({ error: 'Datos no proporcionados' }, 400)
    }

    const dataString = typeof data === 'string' ? data : JSON.stringify(data)
    const result = await c.env.DB.prepare(
      'UPDATE clinical_histories SET data = ? WHERE id = ?'
    ).bind(dataString, id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Ficha clínica no encontrada' }, 404)
    }

    const updatedHistory = await c.env.DB.prepare('SELECT * FROM clinical_histories WHERE id = ?').bind(id).first() as any
    return c.json({
      ...updatedHistory,
      data: safeJsonParse(updatedHistory.data)
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})


// -------------------------------------------------------------
// EXPENSES ENDPOINTS
// -------------------------------------------------------------

// Listar todos los gastos
app.get('/api/expenses', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM expenses ORDER BY date DESC, created_at DESC'
    ).all()
    return c.json(results)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Crear un gasto
app.post('/api/expenses', async (c) => {
  try {
    const body = await c.req.json()
    const { description, amount, category, date } = body

    if (!description || amount === undefined || !date) {
      return c.json({ error: 'Faltan campos obligatorios (descripción, monto, fecha)' }, 400)
    }

    const id = crypto.randomUUID()
    await c.env.DB.prepare(
      'INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, description, amount, category || 'insumos', date).run()

    const newExpense = await c.env.DB.prepare('SELECT * FROM expenses WHERE id = ?').bind(id).first()
    return c.json(newExpense, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 400)
  }
})

// Eliminar un gasto
app.delete('/api/expenses/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const result = await c.env.DB.prepare('DELETE FROM expenses WHERE id = ?').bind(id).run()
    if (result.meta.changes === 0) {
      return c.json({ error: 'Gasto no encontrado' }, 404)
    }
    return c.json({ success: true, message: 'Gasto eliminado' })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})


// -------------------------------------------------------------
// DASHBOARD & STATISTICS ENDPOINTS
// -------------------------------------------------------------

app.get('/api/dashboard/stats', async (c) => {
  const month = c.req.query('month') // Formato YYYY-MM. Por defecto: mes actual.
  
  let targetMonth = month
  if (!targetMonth) {
    const now = new Date()
    targetMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  }

  try {
    // 1. Contar pacientes nuevos y de seguimiento del mes
    const appts = await c.env.DB.prepare(`
      SELECT type, COUNT(*) as count 
      FROM appointments 
      WHERE date LIKE ? AND status = 'completado'
      GROUP BY type
    `).bind(`${targetMonth}%`).all()

    let newPatientsCount = 0
    let followUpCount = 0

    for (const row of appts.results as any[]) {
      if (row.type === 'nuevo') {
        newPatientsCount = row.count
      } else if (row.type === 'seguimiento') {
        followUpCount = row.count
      }
    }

    // 2. Ingresos Totales del mes (Turnos completados)
    const incomeResult = await c.env.DB.prepare(`
      SELECT SUM(price) as total 
      FROM appointments 
      WHERE date LIKE ? AND status = 'completado'
    `).bind(`${targetMonth}%`).first() as any
    const totalIncome = incomeResult?.total || 0

    // 3. Gastos Totales del mes
    const expenseResult = await c.env.DB.prepare(`
      SELECT SUM(amount) as total 
      FROM expenses 
      WHERE date LIKE ?
    `).bind(`${targetMonth}%`).first() as any
    const totalExpense = expenseResult?.total || 0

    // 4. Cantidad total de pacientes en la base de datos (acumulado)
    const totalPatientsResult = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM patients
    `).first() as any
    const totalPatients = totalPatientsResult?.count || 0

    // 5. Histórico de los últimos 6 meses para los gráficos
    const historyData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      
      // Contar pacientes por tipo para ese mes
      const mAppts = await c.env.DB.prepare(`
        SELECT type, COUNT(*) as count 
        FROM appointments 
        WHERE date LIKE ? AND status = 'completado'
        GROUP BY type
      `).bind(`${mStr}%`).all()

      let mNew = 0
      let mFollow = 0
      for (const row of mAppts.results as any[]) {
        if (row.type === 'nuevo') mNew = row.count
        if (row.type === 'seguimiento') mFollow = row.count
      }

      // Ingresos de ese mes
      const mInc = await c.env.DB.prepare(`
        SELECT SUM(price) as total FROM appointments WHERE date LIKE ? AND status = 'completado'
      `).bind(`${mStr}%`).first() as any
      const mIncomeVal = mInc?.total || 0

      // Gastos de ese mes
      const mExp = await c.env.DB.prepare(`
        SELECT SUM(amount) as total FROM expenses WHERE date LIKE ?
      `).bind(`${mStr}%`).first() as any
      const mExpenseVal = mExp?.total || 0

      const monthName = d.toLocaleString('es-ES', { month: 'short' })

      historyData.push({
        month: mStr,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        newPatients: mNew,
        followUps: mFollow,
        income: mIncomeVal,
        expense: mExpenseVal,
        net: mIncomeVal - mExpenseVal
      })
    }

    return c.json({
      selectedMonth: targetMonth,
      stats: {
        newPatients: newPatientsCount,
        followUps: followUpCount,
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense,
        totalPatients
      },
      history: historyData
    })

  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Endpoint básico de prueba
app.get('/', (c) => {
  return c.text('Carolina Escudero Medicina China API v1')
})

export default app
