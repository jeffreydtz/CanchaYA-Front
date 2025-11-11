/**
 * Script para probar todos los endpoints del dashboard administrativo
 *
 * Uso:
 * 1. Primero hacer login como admin: admin@canchaya.app / Admin.1234
 * 2. Ejecutar: npx ts-node scripts/test-admin-endpoints.ts
 */

import apiClient from '../lib/api-client'

const TIMEZONE = 'America/Argentina/Cordoba'
const DATE_FROM = '2025-06-01'
const DATE_TO = '2025-11-01'

async function testAdminEndpoints() {
  console.log('🧪 Probando endpoints del dashboard administrativo...\n')

  try {
    // 1️⃣ Resumen General
    console.log('1️⃣ Testing GET /admin/resumen')
    const resumen = await apiClient.getAdminResumen()
    if (resumen.error) {
      console.error('❌ Error:', resumen.error)
    } else {
      console.log('✅ Success:', resumen.data)
      console.log(`   - Total Usuarios: ${resumen.data?.totalUsuarios}`)
      console.log(`   - Total Reservas: ${resumen.data?.totalReservas}`)
      console.log(`   - Total Canchas: ${resumen.data?.totalCanchas}`)
      console.log(`   - Deuda Total: $${resumen.data?.deudaTotalPendiente}\n`)
    }

    // 2️⃣ Top Jugadores
    console.log('2️⃣ Testing GET /admin/top-jugadores')
    const topJugadores = await apiClient.getAdminTopJugadores(DATE_FROM, DATE_TO)
    if (topJugadores.error) {
      console.error('❌ Error:', topJugadores.error)
    } else {
      console.log('✅ Success: Top', topJugadores.data?.length, 'jugadores')
      topJugadores.data?.slice(0, 3).forEach((j, i) => {
        console.log(`   ${i + 1}. ${j.nombre} - Ranking: ${j.ranking}`)
      })
      console.log()
    }

    // 3️⃣ Canchas Más Usadas
    console.log('3️⃣ Testing GET /admin/canchas-mas-usadas')
    const canchasMasUsadas = await apiClient.getAdminCanchasMasUsadas(DATE_FROM, DATE_TO, TIMEZONE)
    if (canchasMasUsadas.error) {
      console.error('❌ Error:', canchasMasUsadas.error)
    } else {
      console.log('✅ Success:', canchasMasUsadas.data?.length, 'canchas')
      canchasMasUsadas.data?.slice(0, 3).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nombre} - ${c.totalReservas} reservas`)
      })
      console.log()
    }

    // 4️⃣ Personas con Deuda
    console.log('4️⃣ Testing GET /admin/personas-con-deuda')
    const personasConDeuda = await apiClient.getAdminPersonasConDeuda()
    if (personasConDeuda.error) {
      console.error('❌ Error:', personasConDeuda.error)
    } else {
      console.log('✅ Success:', personasConDeuda.data?.length, 'personas con deuda')
      personasConDeuda.data?.slice(0, 3).forEach((p) => {
        console.log(`   - ${p.nombre}: $${p.totalDeuda}`)
      })
      console.log()
    }

    // 5️⃣ Reservas Aggregate
    console.log('5️⃣ Testing GET /admin/reservas/aggregate')
    const aggregate = await apiClient.getAdminReservasAggregate('week', DATE_FROM, DATE_TO, TIMEZONE)
    if (aggregate.error) {
      console.error('❌ Error:', aggregate.error)
    } else {
      console.log('✅ Success:', aggregate.data?.length, 'períodos')
      aggregate.data?.slice(0, 3).forEach((a) => {
        console.log(`   - ${a.bucket}: ${a.total} reservas (${a.confirmadas} confirmadas, ${a.canceladas} canceladas)`)
      })
      console.log()
    }

    // 6️⃣ Reservas Drilldown - Club
    console.log('6️⃣ Testing GET /admin/reservas/drilldown?level=club')
    const drilldownClub = await apiClient.getAdminReservasDrilldownClub(DATE_FROM, DATE_TO)
    if (drilldownClub.error) {
      console.error('❌ Error:', drilldownClub.error)
    } else {
      console.log('✅ Success:', drilldownClub.data?.length, 'clubes')
      drilldownClub.data?.slice(0, 3).forEach((c) => {
        console.log(`   - ${c.nombre}: ${c.reservas} reservas`)
      })
      console.log()
    }

    // Test drilldown nivel cancha si hay clubes
    if (drilldownClub.data && drilldownClub.data.length > 0) {
      const clubId = drilldownClub.data[0].id
      console.log('6️⃣b Testing GET /admin/reservas/drilldown?level=cancha')
      const drilldownCancha = await apiClient.getAdminReservasDrilldownCancha(clubId, DATE_FROM, DATE_TO)
      if (drilldownCancha.error) {
        console.error('❌ Error:', drilldownCancha.error)
      } else {
        console.log('✅ Success:', drilldownCancha.data?.length, 'canchas')
        drilldownCancha.data?.slice(0, 3).forEach((c) => {
          console.log(`   - ${c.nombre}: ${c.reservas} reservas`)
        })
        console.log()
      }

      // Test drilldown nivel detalle si hay canchas
      if (drilldownCancha.data && drilldownCancha.data.length > 0) {
        const canchaId = drilldownCancha.data[0].id
        console.log('6️⃣c Testing GET /admin/reservas/drilldown?level=detalle')
        const drilldownDetalle = await apiClient.getAdminReservasDrilldownDetalle(canchaId, DATE_FROM, DATE_TO)
        if (drilldownDetalle.error) {
          console.error('❌ Error:', drilldownDetalle.error)
        } else {
          console.log('✅ Success:', drilldownDetalle.data?.length, 'fechas')
          drilldownDetalle.data?.slice(0, 3).forEach((d) => {
            console.log(`   - ${d.fecha}: ${d.reservas} reservas`)
          })
          console.log()
        }
      }
    }

    // 7️⃣ Ocupación
    console.log('7️⃣ Testing GET /admin/ocupacion')
    const ocupacion = await apiClient.getAdminOcupacion('cancha', DATE_FROM, DATE_TO, TIMEZONE)
    if (ocupacion.error) {
      console.error('❌ Error:', ocupacion.error)
    } else {
      console.log('✅ Success:', ocupacion.data?.length, 'canchas')
      ocupacion.data?.slice(0, 3).forEach((o) => {
        const ocupacionPct = (o.ocupacion * 100).toFixed(1)
        console.log(`   - ${o.nombre}: ${ocupacionPct}% [${o.semaforo.toUpperCase()}] (${o.reservas}/${o.slots} slots)`)
      })
      console.log()
    }

    // 8️⃣ Heatmap
    console.log('8️⃣ Testing GET /admin/reservas/heatmap')
    const heatmap = await apiClient.getAdminReservasHeatmap(undefined, DATE_FROM, DATE_TO, TIMEZONE)
    if (heatmap.error) {
      console.error('❌ Error:', heatmap.error)
    } else {
      console.log('✅ Success:', heatmap.data?.length, 'data points')
      // Mostrar top 5 horas más ocupadas
      const sortedByReservas = [...(heatmap.data || [])].sort((a, b) => b.reservas - a.reservas)
      console.log('   Top 5 horas más ocupadas:')
      sortedByReservas.slice(0, 5).forEach((h) => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
        console.log(`   - ${days[h.dow]} ${h.hora}: ${h.reservas} reservas`)
      })
      console.log()
    }

    console.log('✅ Todos los endpoints probados!')
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testAdminEndpoints()
}

export { testAdminEndpoints }
