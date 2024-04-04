import { prisma } from '../src/lib/prisma'

async function seed() {
  await prisma.event.create({
    data: {
      id: '9e9bd979-9d10-4915-b339-3786b1634f33',
      title: 'Projeto Rogério',
      slug: 'evento-rogerio',
      details: 'Evento para desenvolver minhas habilidades em Node.js',
      maximumAttendees: 120,
    }
  })
}

seed().then(() => {
  console.log('Database seeded!')
  prisma.$disconnect()
})