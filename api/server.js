require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes');
const corsOptions = require('./corsOptions');

app.use(cors(corsOptions)); 
app.use(express.json());
app.use('/api', routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});