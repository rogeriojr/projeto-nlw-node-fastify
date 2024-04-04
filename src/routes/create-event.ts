import { z } from 'zod'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { generateSlug } from '../utils/generate-slug'
import { prisma } from '../lib/prisma'
import { FastifyInstance } from 'fastify'

export async function CreateEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/events',{
    schema: {
      body:  z.object({
        title: z.string().min(4),
        details: z.string(),
        maximumAttendees: z.number().int().positive().nullable(),
      }),
      response: {
        201: z.object({
          eventId: z.string().uuid()
        })
      }
    }
  }, async (request, reply) =>{
    const {title, details, maximumAttendees} = request.body
  
    const slug = generateSlug(title)
  
    const eventhWithSameSlug = await prisma.event.findUnique({
      where: {
        slug,
      }
    })
  
    if (eventhWithSameSlug !== null) {
      throw new Error('Existe um evento com este nome já registrado!')
    }
  
   const event = await prisma.event.create({
      data: {
        title: title,
        details: details,
        maximumAttendees: maximumAttendees,
        slug,
      }
    })
  
    return reply.status(201).send({eventId: event.id})
  })
}
