const { json } = require("express");
const express = require("express");
const morgan = require("morgan");
const app = express();

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
];

morgan.token("body", (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  } else {
    return null;
  }
});

app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));


app.get("/", (request,response) => {
  response.redirect("/api/persons");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(`Phonebook has info for ${persons.length} people<br><br>${new Date().toString()}`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);
  if (!person) {
    response.status(404).end();
  }
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end(`Person with id ${id} has been deleted`);
});

const generateId = () => {
  let id = Math.floor(Math.random() * 10000);
  while (persons.some(person => person.id === id)) {
    id = Math.floor(Math.random() * 10000);
  }
  return id;
};

app.post("/api/persons", (request, response) => {
  const id = generateId();

  const person = request.body;
  if (!person.name || !person.number) {
    return response.status(400).json({
      error: 'Missing name or number'
    });
  } else if (persons.some(existingPerson => person.name === existingPerson.name)) {
    return response.status(400).json({
      error: `${person.name} already exists`
    });
  }

  person.id = id;
  persons = persons.concat(person);
  response.json(person);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});

