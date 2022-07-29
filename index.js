require('dotenv').config();
const { json } = require("express");
const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const Person = require("./models/person")

const app = express();

/*Not needed with the database
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
];*/

morgan.token("body", (req, res) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body);
  } else {
    return null;
  }
});

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.get("/api/persons", (request, response) => {
  Person.find({}).then(result => {
    response.json(result);
  });
});

app.get("/info", async (request, response) => {
  let length;

  await Person.find({}).then(result => {
    length = result.length;
  });
  response.send(`Phonebook has info for ${length} people<br><br>${new Date().toString()}`);
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end(`Person with id ${request.params.id} has been deleted`);
    })
    .catch(error => next(error));
});


app.post("/api/persons", async (request, response, next) => {
  const person = request.body;
  /*if (!person.name || !person.number) {
    next(new Error("missing"));
    return;
  } 
  let currentPeople = [];

  await Person.find({}).then(people => {
    currentPeople = people;
  });

  if (currentPeople.some(existingPerson => person.name === existingPerson.name)) {
    next(new Error("exists"));
    return;
  }*/
  const newPerson = new Person({
    name: person.name,
    number: person.number,
  });

  newPerson.save().then(savedPerson => {
    response.json(savedPerson);
  })
  .catch(error => {
    next(error);
  });

});

app.put("/api/persons/:id", async(request, response, next) => {

  const newPerson = {
    name: request.body.name,
    number: request.body.number,
  }
  Person.findByIdAndUpdate(request.params.id, newPerson, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => {
      next(error);
    });
});

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send( { error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    console.log(error.message);
    return response.status(400).send( {error: error.message });
  } else if (error.message.includes('E11000')) {
    console.log(error.message);
    return response.status(400).send( {error: error.message });
  }

  next(error);
}

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});

