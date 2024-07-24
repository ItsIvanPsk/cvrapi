const express = require('express');
const cors = require('cors');
const experiencesRouter = require('./src/routes/experiences');
const hospitalRouter = require('./src/routes/hospital');
const usersRouter = require('./src/routes/users');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/experiences', experiencesRouter);
app.use('/api/hospital', hospitalRouter);
app.use('/api/users', usersRouter);

app.listen(port, () => {
  console.log(`Listening for HTTPS queries on: https://vrapi.ieti.cat/ on port ${port}`);
  console.log(`Listening for HTTPS queries on: localhost on port ${port}`);
});
