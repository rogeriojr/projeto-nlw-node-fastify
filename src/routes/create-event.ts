import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { generateSlug } from '../utils/generate-slug'
import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify'
import { BadRequest } from './_errors/bad-request'

export async function createEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/events', {
    schema: {
      body: z.object({
        title: z.string({ invalid_type_error: 'O título precisa ser uma string' }).min(4),
        details: z.string({ invalid_type_error: 'Os detalhes precisa ser uma string' }),
        maximumAttendees: z.number().int().positive().nullable(),
      }),
      response: {
        201: z.object({
          eventId: z.string().uuid()
        })
      }
    }
  }, async (request, reply) => {
    const { title, details, maximumAttendees } = request.body

    const slug = generateSlug(title)

    const eventhWithSameSlug = await prisma.event.findUnique({
      where: {
        slug,
      }
    })

    if (eventhWithSameSlug !== null) {
      throw new BadRequest('Existe um evento com este nome já registrado!')
    }

    const event = await prisma.event.create({
      data: {
        title: title,
        details: details,
        maximumAttendees: maximumAttendees,
        slug,
      }
    })

    return reply.status(201).send({ eventId: event.id })
  })
}
