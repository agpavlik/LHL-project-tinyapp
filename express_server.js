const express = require("express"); // Express library
const app = express();
const PORT = 8080; // The port which server will listen on. Default port 8080
app.set("view engine", "ejs") // This tells the Express app to use EJS as its templating engine.
const bcrypt = require("bcryptjs");

/*The body-parser library will convert the request body from a Buffer
 into string that we can read. This needs to come before all of routes. */
app.use(express.urlencoded({ extended: true }))

// Helpers - functions
const { generateRandomString, getUserByEmail, getUserByPassword, getUrlByUserId } = require("./helpers");

// Databases
const { urlDatabase, users } = require('./databases/db.js');

// Cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['orange', 'moon', 'asset'],
  maxAge: 24 * 60 * 60 * 1000,
}))

// ------------------------------------------------------------------------------------

// POST route to handle the form submission.This needs to come before all of other routes.
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId){
    const shortURL = generateRandomString(); //add Short URL ID to the urlDatabase
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: userId
    } // add longURl to the urlDatabase
    console.log(urlDatabase) // Log the updated Database to the console
    res.redirect(`/urls/${shortURL}`);
  } else {
    return res.status(400).send("You must be logged in for shortening URLs.");
  }
})

// HOMEPAGE
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// MAIN PAGE
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const urlsUser = getUrlByUserId(userId, urlDatabase);
  const templateVars = { urls: urlsUser, user: user};
  res.render("urls_index", templateVars);
})

/* GET route to render the urls_new.ejs template. 
The GET /urls/new route needs to be defined before the 
GET /urls/:id route. Routes defined earlier will take precedence */
app.get('/urls/new',(req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {user: user};
  if (!userId) {
    return res.redirect("/login");
  }
  return res.render("urls_new", templateVars);
})

// GET route to display a single URL and its shortened form.
app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!userId) {
    return res.status(400).send("You have to log in in order to use this option");
  }
  if (!urlDatabase[req.params.shortURL]) {
   return res.status(400).send("You try to access the URLs that does not exist.");
  }
  if (urlDatabase[req.params.shortURL].userID !== userId) {
   return res.status(400).send("This URL does not belong to you.");
  }
  const templateVars = { 
    id: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: urlDatabase[req.params.shortURL].userID, 
    user: user};
  res.render("urls_show", templateVars);
})

// GET route to REDIRECTION to longURL when given shortURL
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log("longURL : ", longURL);
  res.redirect(longURL);
  } else {
    res.status(400).send("You try to access the shorten URLs that does not exist in database.");
  }
})

// ------------------------------------------------------------------------------------

// POST route to EDIT URL.
app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(400).send("You have to log in in order to use this option");
  }
  if (!urlDatabase[req.params.shortURL]) {
   return res.status(400).send("You try to access the URLs that does not exist.");
  }
  if (urlDatabase[req.params.shortURL].userID !== userId) {
   return res.status(400).send("This URL does not belong to you.");
  }
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
})

// POST route to DELETE URL from urlDatabase.
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(400).send("You have to log in in order to use this option");
  }
  if (!urlDatabase[req.params.shortURL]) {
   return res.status(400).send("You try to access the URLs that does not exist.");
  }
  if (urlDatabase[req.params.shortURL].userID !== userId) {
   return res.status(400).send("This URL does not belong to you.");
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

// -----------------------------------------------------------------------------------

// GET route to LOG IN form
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  console.log(user);
  const templateVars = { user: user};
  if (userId) { 
    return res.redirect('/urls');
  }
  return res.render("urls_login", templateVars);
})

// POST route to LOG IN user
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const userPassword = getUserByPassword(email, users);
  if (user === null) {
    return res.status(400).send("Error code 403: Wrong email or password!");
  }
  if (email === user.email) {
    if (bcrypt.compareSync(password, userPassword)) {
    const newUserId = user.id;
    req.session.user_id = newUserId;
    return res.redirect('/urls');
    } else {
      return res.status(400).send("Error code 403: Wrong email or password!");
    }
  }
})

// ------------------------------------------------------------------------------------

// POST route to LOG OUT user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
})

// ------------------------------------------------------------------------------------

// GET route to REGISTRATION form
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user: user};
  if (userId) {
   return res.redirect('/urls')
  }
  return res.render("urls_registration", templateVars);
})

// POST route to REGISTRATION for a new user. 
app.post('/register', (req, res) => {
  const newUserId = generateRandomString(); // generate a random user id
  const email = req.body.email;
  const password = req.body.password;
  const userObj = {
    id: newUserId,
    email: email,
    password: bcrypt.hashSync(password, 10),
  }
  if (userObj.email === "" || userObj.password === "") {
    return res.status(400).send("Error code 400! Please write your email and password");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Error code 400! Please write your email and password");
  }
  req.session.user_id = newUserId;
  users[newUserId] = userObj;  
  res.redirect('/urls');
  console.log(users);
})

// ------------------------------------------------------------------------------------

// Additional endpoints - a JSON string representing the entire urlDatabase object.
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

// // The response can contain HTML code, which would be rendered in the client browser.
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
})