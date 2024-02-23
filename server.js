const env = require("dotenv"); // importing the env module
const app = require("./app"); // importing the app.js module which has express set up
env.config({
  path: "./config.env", // providing path to the env file
});

const mongoose = require("mongoose"); // importing the mongoose module
// establishing the connection with mongodb server with the help of connect method

mongoose
  .connect(process.env.CONN_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Db connection established");
  })
  .catch((error) => {
    console.log(error);
  });

const port = process.env.PORT || 3000; // importing the port number present in the environment files
// creating and starting the server
app.listen(port, () => {
  console.log("listening on port " + port);
});
