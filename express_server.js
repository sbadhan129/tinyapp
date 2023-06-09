// Import required packages
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');

// Set up Express app
const app = express();
// Set up view engine
app.set("view engine", "ejs");

// Define constants Port
const PORT = 8080;

// Using a middleware for parse requst body
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session cookie',
  keys: ['lookaround', 'behindyou'] 
}));

// Database for urls and users
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
// Helper functions
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

// Define routes
app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Adding url 
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
const userURLs = urlsForUser(user_id);
  if (!user_id) {
    res.redirect("login");
  } else {
    // User is logged in
   console.log(userURLs);
   const user = users[user_id]
    const templateVars = {
      urls: userURLs,
      user
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id
  if (!user_id) {
    res.redirect("/login");  
  } else {
    const user = users[user_id]
    const templateVars = {
      user 
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!user_id) {
    // User is not logged in
    const user = users[user_id]
    const templateVars = {
      error: "Please log in or register to view the URL.",
      user: null
    };
    res.render("login", templateVars);
  }
  // URL does not exist 
    else if(!url || url.userID !== user_id){
     
      res.send("Url does not exist");
    } else{
        // User is logged in and have full access
const user = users[user_id]
  const templateVars = {
    id: shortURL,
    longURL: url.longURL, 
    user      
  };
  res.render("urls_show", templateVars);
}
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {              
    res.redirect("/urls");
  } else {
const templateVars = {
  user: null
}
  res.render("register", templateVars);
}
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return
  } 
  const templateVars = { 
    user: null
  }
  res.render("login", templateVars);
  });

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const urlObject = urlDatabase[req.params.id];
  if (!urlObject) {
    return res.status(404).send("<p>The URL you are looking for does not exist.</p>");
  } 
  const longURL = urlObject.longURL
  if (!longURL.includes("http")){
    return res.send("Invalid URL must include http").status(404)
  }
  res.redirect(longURL) 
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
const hashedPassword = bcrypt.hashSync(password, 10);
users[id] ={
  id: id,
  email,
  password: hashedPassword,
};
console.log(users);
req.session.user_id = id;
return res.redirect("/urls");
});

//Adding new route (post)
app.post("/urls", (req, res) => {
  if (!req.session.user_id) { 
    return res.status(403).send("<p>Make sure to be loggen in</p>");
  }
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls");
});

//To delete a URL
app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.session.user_id;
  const url_id = req.params.id;
  const url = urlDatabase[url_id];
  if (!user_id) {
    // User is not logged in
    return res.status(403).send("To delete this URL you have to login or register.");
  } else if (!url || url.userID !== user_id) {
    // URL does not exist or does not belong to the user
    return res.status(403).send("Not authorized to  this URL.");
  }
  // Delete the URL
  delete urlDatabase[url_id];
  res.redirect("/urls");
});

//To update a URL
app.post("/urls/:id/edit", (req, res) => {
  const user_id = req.session.user_id;
  const url_id = req.params.id;
  const url = urlDatabase[url_id];
  if (!user_id) {
    // User is not logged in
    return res.status(403).send("To edit this URL you have to login or register.");
  } else if (!url || url.userID !== user_id) {
    // URL does not exist or does not belong to the user
    return res.status(403).send("Not authorized to edit this URL.");
  }
  // Update the URL
  urlDatabase[url_id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//To Login 
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid email or password.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//To logout 
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});