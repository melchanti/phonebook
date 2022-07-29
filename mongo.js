const mongoose = require('mongoose');

const personSchema = {
  name: String,
  number: String,
}
const Person = mongoose.model('Person', personSchema);


if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <passwprd>');
  process.exit(1);
} 

const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0.xp8ybqf.mongodb.net/phonebook?retryWrites=true&w=majority`;

if (process.argv.length === 3) {
  mongoose.connect(url)
  .then((result) => {
    console.log('connected');

    return Person.find({});
  }).then((result) => {
    console.log('retrieved');

    result.forEach(person => {
      console.log(person);
    });
    
    return mongoose.connection.close();
  }).catch(err => {
    console.log(err);
  });
} else {
  const name = process.argv[3];
  const number = process.argv[4];
  mongoose.connect(url)
    .then((result) => {
      console.log('connected');

      const person = new Person({
        name,
        number
      });
      

      return person.save();
    }).then((result) => {
      console.log('created');
      return mongoose.connection.close();
    }).catch(err => {
      console.log(err);
    });
}