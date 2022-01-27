const express = require("express");
const { getUserByEmail, urlsForUser , generateRandomString } = require('./helpers')
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session')
app.set("view engine", "ejs");

//use cookiesession()

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


const urlDatabase = {};

const users = {};

const verifyPassword = (password, userId) => {
  if (!userId) {
    return false;
  }
   if (bcrypt.compareSync(password, userId.password)) {
     return userId
   }
};

// all get requests

app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'] ;
  const user = users[user_id];
  if(!user) {
    res.redirect("/login")
  }
  const templateVars = { user : user };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  
  const templateVars = { user: null};
  res.render("urls_register", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session['user_id'] ;
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user_id = req.session['user_id'] ;
  const user = users[user_id];
  if(user) {
    const templateVars = { user, urls: urlsForUser(user, urlDatabase) };
    res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  const user = req.session['user_id'] 
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
  const user_id = req.session['user_id'] ;
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


// all POST REQUESTS

app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session['user_id'] ;
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

  const user = verifyPassword(req.body.password, getUserByEmail(req.body.email, users));

  if (user) {
    req.session['user_id'] = user.id ;
    res.redirect("urls");
  }
  return res.status(403).send('Email or password is incorrect')
});


app.post("/urls", (req, res) => {
  let id = generateRandomString();
    const user_id = req.session['user_id'] ;
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

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if ((!password) || (!email)) {
    return res.status(403).send('email and password cannot be blank');
  }

  if (getUserByEmail(email, users)) {
    return res.status(403).send('email is in use');
  }

  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt)
  };
  req.session['user_id'] = userId
  console.log(req.session['user_id'] = userId)
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});