const express = require("express"); // Express library
const app = express();
const PORT = 8080; // The port which server will listen on. Default port 8080

app.set("view engine", "ejs") // This tells the Express app to use EJS as its templating engine.

/*The body-parser library will convert the request body from a Buffer
 into string that we can read. This needs to come before all of routes. */
app.use(express.urlencoded({ extended: true }));

// Cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());


// URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// USERS database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


// Function generates a random short URL id by return a string of 6 random alphanumeric characters:
const generateRandomString = function() {
  const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return output;
};


// POST route to handle the form submission.This needs to come before all of other routes.
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString(); //add Short URL ID to the urlDatabase
  urlDatabase[shortURL] = req.body['longURL']; // add longURl to the urlDatabase
  console.log(urlDatabase) // Log the updated Database to the console
  res.redirect(`/u/${shortURL}`);
});

// POST route to EDIT URL.
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


// POST route to DELETE URL from urlDatabase.
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});


// POST route to LOG IN user
app.post('/login', (req, res) => {
  let cookie = req.body.username;
  res.cookie ('username', cookie);
  res.redirect('/urls');
});


// POST route to LOG OUT user
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});


// POST route to REGISTRATION for a new user. 
app.post('/register', (req, res) => {
  const newUserId = generateRandomString(); // generate a random user id
  const email = req.body.email;
  const password = req.body.password;
  const userObj = {
    id: newUserId,
    email: email,
    password: password
  }
  const findUserByEmail = (email, users) => { // check if user exist.
    for (let i in users) {
      if (users[i].email === email) {
        res.status(403).send("User with this email already exist.");
        return;
      } else {
        users[newUserId] = userObj; // add new user to global database
        res.cookie('user_id', newUserId);
        res.redirect('/urls');
      }
    }
    console.log(users);
  }
});


// MAIN PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});


/* GET route to render the urls_new.ejs template. 
The GET /urls/new route needs to be defined before the 
GET /urls/:id route. Routes defined earlier will take precedence */
app.get('/urls/new',(req, res) => {
  const templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});


// GET route to display a single URL and its shortened form.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { id: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});


// GET route to REDIRECTION to longURL when given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  console.log("longURL : ", longURL);
  res.redirect(longURL);
});

// GET route to REGISTRATION form
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_registration", templateVars);
});


// Additional endpoints - a JSON string representing the entire urlDatabase object.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


// // The response can contain HTML code, which would be rendered in the client browser.
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});