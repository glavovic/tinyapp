const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

const verifyEmail = email => {
  for (let key in users) {
    let user = users[key];
    if (user.email === email) {
      return user;
    }
  }
};
const verifyPassword = (password, key) => {
  if (!key) {
    return false;
  }
  return password === key.password;
};

const urlsForUser = (id, database) => {

  const userURLs = {};

  for (const shortURL in database) {
    if(database[shortURL].userID === id) {
    userURLs[shortURL] = database[shortURL];
    }
  }
  return userURLs
}
// generate unique string length of 6 characters
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};





app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  if(!user) {
    res.redirect("/login")
  }
  const templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  if(user) {
    const templateVars = { user, urls: urlsForUser(user, urlDatabase) };
    res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const user = req.cookies.user_id
  if (user) return res.redirect("/urls")
  const templateVars = {user : null};
  res.render("urls_login", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post("/u/:shortURL", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
    if(user) {
      const shortURL = req.params.shortURL;
        urlDatabase[shortURL] = {
        longURL: req.body.newURL,
        userID: user
      };
      res.redirect("/urls")
    };
    res.statusCode(403).send("have to be loged in to preform that activity")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  if(user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.statusCode(403).send("have to be logged in for that")
});

app.post("/login", (req, res) => {
  
  const password = req.body.password;
  const email = req.body.email
  if (!password || !email) {
    return res.status(403).send('email and password cannot be blank');
  }

  const user = verifyEmail(req.body.email);

  if (verifyPassword(req.body.password, user)) {
    res.cookie("user_id", user.id);
    res.redirect("urls");
  }
  return res.status(403).send('Email or password is incorrect')
});


app.post("/urls", (req, res) => {
  let id = generateRandomString();
    const user_id = req.cookies.user_id;
  const user = users[user_id];
  if (!user) {
    res.redirect("/login")
    return res.statusCode(403).redirect("/login")
  }
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: user
  }
  res.redirect('/urls/' + id);
});

app.get("/register", (req, res) => {
  
  const templateVars = { user: null};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if ((!password) || (!email)) {
    return res.status(403).send('email and password cannot be blank');
  }

  if (verifyEmail(email)) {
    return res.status(403).send('email is in use');
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});