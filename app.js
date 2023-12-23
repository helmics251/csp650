const express = require("express");
const flash = require("express-flash");
const session = require("express-session");
const ejs = require("ejs");
const { ObjectId } = require("mongodb");

const app = express();

// Middleware for parsing JSON
app.use(express.json());

// Middleware for parsing URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static("public"));

require("./middleware/setupdb");

// Set up session local
app.use(
  session({
    secret: "keyboard",
    resave: false,
    saveUninitialized: true,
  })
);

// Set up flash messages middleware
app.use(flash());

//global session
const sessionMiddleware = (req, res, next) => {
  res.locals.session = req.session;
  next();
};

app.use(sessionMiddleware);

module.exports = app;
