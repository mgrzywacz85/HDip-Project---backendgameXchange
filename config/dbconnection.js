const mongoose = require("mongoose");
const config = require("config");

const database = config.get("DB_CONNECT");

const connectDatabase = async () => {
  try {
    await mongoose.connect(database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    console.log("MongoDB Successfully Connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1); //Exit with failure
  }
};

module.exports = connectDatabase;
