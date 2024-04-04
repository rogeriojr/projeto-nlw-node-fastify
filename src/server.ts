import fastify from "fastify"
import { z } from 'zod'
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { PrismaClient } from "@prisma/client"
import { generateSlug } from "./utils/generate-slug"

const app = fastify()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
const prisma = new PrismaClient({
  log: ['query'],
})

app.get('/', () =>{
  return "olá"
})

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

app.listen({port: 3333}).then(() =>{
  console.log('HTTP server running!')
})