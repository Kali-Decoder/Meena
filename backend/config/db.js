const mongoose = require('mongoose');
console.log(process.env.MONGO_DB_CONN_STRING);
function connDB() {
  mongoose.set('strictQuery', true);

  mongoose
    .connect(process.env.MONGO_DB_CONN_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('connected to db');
    })
    .catch((err) => {
      console.error('Database connection error:', err);
    });
}

module.exports = connDB;

