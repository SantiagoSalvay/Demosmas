import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const prisma = new PrismaClient()
  const email = process.env.ADMIN_EMAIL || 'admin@demos.local'
  const plain = process.env.ADMIN_PASS || 'Admin#1234'

  try {
    const hash = await bcrypt.hash(plain, 10)

    let adminType = await prisma.tipoUsuario.findFirst({ where: { tipo_usuario: 'Admin' } })
    if (!adminType) {
      adminType = await prisma.tipoUsuario.create({ data: { tipo_usuario: 'Admin' } })
    }

    const existing = await prisma.usuario.findFirst({ where: { email } })

    if (existing) {
      const updated = await prisma.usuario.update({
        where: { id_usuario: existing.id_usuario },
        data: {
          contrasena: hash,
          id_tipo_usuario: adminType.id_tipo_usuario,
          nombre: existing.nombre || 'Super',
          apellido: existing.apellido || 'Admin',
          ubicacion: existing.ubicacion || 'HQ',
        }
      })

      const existingDetalle = await prisma.detalleUsuario.findFirst({
        where: { id_usuario: updated.id_usuario }
      })

      if (existingDetalle) {
        await prisma.detalleUsuario.update({
          where: { id_detalle_usuario: existingDetalle.id_detalle_usuario },
          data: { email_verified: true }
        })
      } else {
        await prisma.detalleUsuario.create({
          data: {
            id_usuario: updated.id_usuario,
            email_verified: true,
            auth_provider: 'email'
          }
        })
      }

      console.log(`✅ Admin actualizado: ${updated.email}`)
    } else {
      const created = await prisma.usuario.create({
        data: {
          nombre: 'Super',
          apellido: 'Admin',
          email,
          contrasena: hash,
          id_tipo_usuario: adminType.id_tipo_usuario,
          ubicacion: 'HQ',
          DetalleUsuario: { create: { email_verified: true } }
        }
      })
      console.log(`✅ Admin creado: ${created.email}`)
    }

    console.log('🔑 Credenciales actuales:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${plain}`)
  } catch (e) {
    console.error('❌ Error al resetear admin:', e)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
