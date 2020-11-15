const express = require('express');
const connectDatabase = require('./config/dbconnection');

const app = express();

connectDatabase();

//Middlewares:

app.use(express.json({extended: false})); //BodyParser included in Express which allows sending POST requests

app.get('/', (req,res) => res.send('API working'));

//Routes:

app.use('/api/user/general', require('./routes/api/user/general'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

