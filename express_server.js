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

/*app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL you are looking for does not exist");
  }

});*/

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
  const user_id = req.cookies.user_id;
const userURLs = urlsForUser(user_id);
  if (!user_id) {
    // User is not logged in
   // const templateVars = {
     // error: "<p>Please Login or Register first.</p>", 
      //user_id: ""
    //};
    res.redirect("login");
  } else {
    // User is logged in
   // const userURLs = urlsForUser(user_id);
   console.log(userURLs);
    const templateVars = {
      urls: userURLs,
      user_id: user_id
    };
    res.render("urls_index", templateVars);
  }
});


app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect("/login");  
  } else {
    const templateVars = {
      user_id: req.cookies.user_id  //two
    };
    res.render("urls_new", templateVars);
  }
});

function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies.user_id;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  
  if (!user_id) {
    // User is not logged in
    const templateVars = {
      error: "Please log in or register to view the URL.",
      user_id: null
    };
    res.render("login", templateVars);
  }
  // URL does not exist 
    else if(!url || url.userID !== user_id){
      const templateVars = {
        error: "URL not found or access denied.",
        user_id: user
      };
      res.render("register", templateVars);
    } else{
        // User is logged in and have full access
  const templateVars = {
    id: shortURL,
    longURL: url.longURL, //four
    user_id: user_id      //three
  };
  res.render("urls_show", templateVars);
}
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
    return
  } 
  const templateVars = { 
    user_id: ""
  }
  res.render("login", templateVars);
  });

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[req.params.id];

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
  const user_id = req.cookies.user_id;
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
  const user_id = req.cookies.user_id;
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

