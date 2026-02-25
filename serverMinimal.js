const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gameRoutes = require('./routes/gameMinimal');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/phishbusters');

app.use('/api/game', gameRoutes);

app.listen(5000, () => console.log('Server on port 5000'));
