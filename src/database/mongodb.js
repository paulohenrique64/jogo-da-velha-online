require("dotenv").config();

const mongoose = require("mongoose");
const url = process.env.DB_URL;
const aplicationPort = process.env.PORT;

mongoose.set("strictQuery", false)

function mongooseConection() {
  const conection = mongoose.connect(url)
    .then(() => {
      for (let i = 0; i < 5; i++)
        console.log("hello world");
      console.log("connection to database successful");
      console.log(`the game is running on http://localhost:${aplicationPort}`);
    })
    .catch(error => {
      console.log(error);
      console.log("Error connecting to the database");
    })
}

module.exports = mongooseConection;