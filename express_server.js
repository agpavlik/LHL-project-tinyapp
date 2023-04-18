const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//This tells the Express app to use EJS as its templating engine.
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// This is the data we'll want to show on the URLs page. Collect in folder 'views'.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Additional endpoints - a JSON string representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// The response can contain HTML code, which would be rendered in the client browser.
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//
// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });
 
// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`);
// });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});