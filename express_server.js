const express = require("express"); // Express library
const app = express();
const PORT = 8080; // The port which server will listen on. Default port 8080

app.set("view engine", "ejs") // This tells the Express app to use EJS as its templating engine.

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*The body-parser library will convert the request body from a Buffer
 into string that we can read. This needs to come before all of routes. */
app.use(express.urlencoded({ extended: true }));

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
  let shortURL = generateRandomString(); //add Short URL ID to the urlDatabase
  urlDatabase[shortURL] = req.body['longURL']; // add longURl to the urlDatabase
  res.redirect(`/u/${shortURL}`);
});

// POST route to edit URL.
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});


// POST route to delete URL from urlDatabase.
app.post("/urls/:shortURL/delete", (req, res) => {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
});


// MAIN PAGE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

/* GET route to render the urls_new.ejs template. 
The GET /urls/new route needs to be defined before the 
GET /urls/:id route. Routes defined earlier will take precedence */
app.get('/urls/new',(req, res) => {
  res.render("urls_new");
});


/* GET route to display a single URL and its shortened form.
The : in front of id indicates that id is a route parameter. 
This means that the value in this part of the url will be available in the req.params object.*/
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:'http://www.lighthouselabs.ca'};
  res.render("urls_show", templateVars);
});

// GET route - Redirection to longURL when given shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


// // Additional endpoints - a JSON string representing the entire urlDatabase object.
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// // The response can contain HTML code, which would be rendered in the client browser.
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});