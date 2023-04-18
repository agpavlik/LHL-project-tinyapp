const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

//POST route to handle the form submission.
// This needs to come before all of our routes.
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

// This is the data we'll want to show on the URLs page. Collect in folder 'views'.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// A GET route to render the urls_new.ejs template.
app.get('/urls/new',(req, res) => {
  res.render("urls_new");
});


// Add another page to display a single URL and its shortened form. The end point for 
// a page will be in the format /urls/:id. The : in front of id indicates that id is 
// a route parameter. This means that the value in this part of the url will be available 
//in the req.params object.

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL:'http://www.lighthouselabs.ca'};
  res.render("urls_show", templateVars);
});

// Additional endpoints - a JSON string representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// The response can contain HTML code, which would be rendered in the client browser.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});