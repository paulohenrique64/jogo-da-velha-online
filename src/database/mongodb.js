require("dotenv").config();

const mongoose = require("mongoose");
const url = process.env.DB_URL;

mongoose.set("strictQuery", false)

function mongooseConection() {
  const conection = mongoose.connect(url)
    .then(() => {
      console.log("Connection to database successful");
    })
    .catch(error => {
      console.log(error);
      console.log("Error connecting to the database");
    })
}

module.exports = mongooseConection;