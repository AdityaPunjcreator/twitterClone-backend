const express = require("express"); // importing the express module
const cors = require("cors"); // importing the cors module
const authrouter = require("./Routers/auth_router");
const postrouter = require("./Routers/post_router");
const filerouter = require("./Routers/file_router");
const app = express();

app.use(cors()); // this middleware will enable the server side to allow the client request which is coming

app.use(express.json()); // applying the express.json() middleware to parse the body which comes with request object

app.use("/api/v1/twitter/user", authrouter); // mounting the authrouter middleware
app.use("/api/v1/twitter", postrouter); // appending the postrouter middleware
app.use("/api/v1/twitter", filerouter); // appending the filerouter middleware
module.exports = app;
