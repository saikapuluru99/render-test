const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(morgan('tiny'))
app.use(cors())

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const generateId = () => {
    return Math.floor(Math.random() * 1000);
  }

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(
    `<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    </div>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.post('/api/persons', (req, res) => {
    const body = req.body

    if (!body.name || !body.number) {
      return res.status(400).json({ 
        error: 'content missing' 
      })
    }

    names = persons.map(person => person.name)
    console.log(names)
    if(names.includes(body.name)) {
        return res.status(400).json({
            error: 'Name already exists'
        })
    }

    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    }

    persons = persons.concat(person)

    res.json(persons)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})