const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

// generate unique string length of 6 characters
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  console.log(result)
  return result
};

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls : urlDatabase }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World<b></body>\n")
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL};
  res.render("urls_show", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});