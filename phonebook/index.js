require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person') 

app.use(express.static('build'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())


morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

app.get('/api/persons', (request, response) => {
    Person.find({})
      .then(people => {
        response.json(people)
      })
})

app.get('/info', (request, response) => {
    Person.find({})
      .then(people => {
        response.send(
          `<div>
              <p>Phonebook has info for ${people.length} people</p>
              <p>${new Date()}</p>
          </div>`
          )
      })
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    Person.findById(id)
      .then(idPerson => {
        response.json(idPerson)
      })
      .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, errorHandler) => {
    Person.findByIdAndRemove(request.params.id)
      .then(() => {
        response.status(204).end()
      })
      .catch(error => errorHandler(error))
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.post('/api/persons', (req, res, next) => {
    const body = req.body

    if (!body.name || !body.number) {
      return res.status(400).json({ 
        error: 'content missing' 
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })
    
    person.save().then(result => {
      console.log(`added ${result.name} number ${result.number} to phonebook`)
      res.json(person)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({ 
      error: 'content missing' 
    })
  }

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(
    req.params.id, 
    person, 
    {new: true, runValidators: true, context: 'query'}
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    console.log("validation error")
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})