const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const v1Routes = require('./routes/v1');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Ocorreu um erro interno no servidor'
  });
});

module.exports = app;