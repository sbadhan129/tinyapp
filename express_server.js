// Import required packages
const express = require("express");

// Set up Express app
const app = express();

// Define constants
const PORT = 8080;

// Using a middleware for parse requst body
app.use(express.urlencoded({ extended: true }));

// Set up view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

// Define routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Adding url 
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] }
  res.render("urls_show", templateVars);
});

//Adding new route (post)
app.post("/urls", (req, res) => {
  console.log(req.body); 
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
