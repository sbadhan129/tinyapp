// Import required packages
const express = require("express");
const cookieParser = require("cookie-parser");

// Set up Express app
const app = express();

// Define constants
const PORT = 8080;

// Using a middleware for parse requst body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set up view engine
app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "abc123": "http://www.facebook.com"
};

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL you are looking for does not exist");
  }

});


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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  console.log(templateVars,"Hello");
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//Adding new route (post)
app.post("/urls", (req, res) => {
  console.log(req.body); 
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

//To delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
delete urlDatabase[id];
res.redirect("/urls");
});

//To update a URL
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});



// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



