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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  abc: {
    id: "abc",
    email: "Julia@gmail.com",
    password: "1234",
  },
  def: {
    id: "def",
    email: "Sam@gmail.com",
    password: "5678",
  },
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
    user_id: req.cookies["user_id"],
  };
  console.log(templateVars,"Hello");
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");  //second part
  } else {
    const templateVars = {
      user_id: req.cookies.user_id
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {               // fot the first part
    res.redirect("/urls");
  } else {
const templateVars = {
  user_id: ""
}
  res.render("register", templateVars);
}
});

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
  const templateVars = {
    user_id: ""
  }
  res.render("login", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    return res.status(404).send("The URL you are looking for does not exist.");
  }
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
const {email, password } =req.body

if (!email || !password){
  return res.status(400).send("Provide username & password.");

}
for (let userId in users){
  if(users[userId].email === email ){
    return res.status(400).send("Email already exist.");
  }
}

const id =generateRandomString();
users[id] ={
  id: id,
  email,
  password,
};
console.log(users);
res.cookie("user_id", id);
return res.redirect("/urls");
});

//Adding new route (post)
app.post("/urls", (req, res) => {
  if (!req.cookies.user_id) { // fourth part
    return res.status(403).send("<p>Make sure to be loggen in</p>");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.cookies.user_id
  };

  res.redirect("/urls");
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
  const { email, password } = req.body;

  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(403).send("Invalid email or password.");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function getUserByEmail(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

