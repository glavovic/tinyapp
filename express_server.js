const express = require("express");
const { urlsForUser , generateRandomString , verifyPassword, verifyUserEmail } = require('./helpers')
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
const bcrypt = require('bcryptjs');
let cookieSession = require('cookie-session');
const salt = bcrypt.genSaltSync(10);
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));





// urlDatabase
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
// user database
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





/*if user is logged in:
redirect to /urls
if user is not logged in:
 redirect to /login
*/
app.get("/", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  if (!user) {
   return res.redirect("/login");
  } else {
    return res.redirect("/urls");
  }

});


/* if user is logged in:
returns HTML with:
the site header (see Display Requirements above)
a list (or table) of URLs the user has created, each list item containing:
a short URL
the short URL's matching long URL
an edit button which makes a GET request to /urls/:id
a delete button which makes a POST request to /urls/:id/delete
if user is not logged in:
returns HTML with a relevant error message
*/
app.get("/urls", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  if (!user) {
    return res.status(403).send('Please Log in! visit <a href="/login">here</a>')
  }
  // looping through each id in the object looking for unique urls
  const templateVars = { user, urls: urlsForUser(user, urlDatabase) };
  res.render("urls_index", templateVars);
});


/*
if user is logged in:
returns HTML with:
the site header (see Display Requirements above)
a form which contains:
a text input field for the original (long) URL
a submit button which makes a POST request to /urls
if user is not logged in:
redirects to the /login page */
app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { user, };
  return res.render("urls_new", templateVars);
});


/**
 * if user is logged in and owns the URL for the given ID:
returns HTML with:
the site header (see Display Requirements above)
the short URL (for the given ID)
a form which contains:
the corresponding long URL
an update button which makes a POST request to /urls/:id
if a URL for the given ID does not exist:
(Minor) returns HTML with a relevant error message
if user is not logged in:
returns HTML with a relevant error message
if user is logged it but does not own the URL with the given ID:
returns HTML with a relevant error message
 */
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  const userUrls = urlsForUser(user, urlDatabase)
  const templateVars = {user , urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL }
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("the short url entered is not valid")
  }
  if(!user || !userUrls[req.params.shortURL]) {
    return res.status(403).send("You're not authorised to do that man")
  }
  res.render('urls_show', templateVars)
});


/**
 * if user is logged in:
 redirects to /urls
if user is not logged in:
returns HTML with:
a form which contains:
input fields for email and password
submit button that makes a POST request to /login
 */
app.get("/login", (req, res) => {
  const user = req.session['user_id'];
  if (!user) {
    const templateVars = {user : null};
    return res.render("urls_login", templateVars);
  }
  return res.redirect("/urls");
});

/*if URL for the given ID exists:
redirects to the corresponding long URL
if URL for the given ID does not exist:
returns HTML with a relevant error message */
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('not a valid Tiny Link');
  }
  return res.redirect(longURL);
});


/**
 * if user is logged in and owns the URL for the given ID:
updates the URL
redirects to /urls
if user is not logged in:
 returns HTML with a relevant error message
if user is logged it but does not own the URL for the given ID:
returns HTML with a relevant error message
 */
app.post("/u/:shortURL", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  if (user) {
    const shortURL = req.params.shortURL;
    urlDatabase[shortURL] = {
      longURL: req.body.newURL,
      userID: user
    };
    return res.redirect("/urls");
  }
  return res.status(403).send("have to be loged in to preform that activity");
});


/**
 * deletes cookie
redirects to /urls
 */
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

/**
 * if user is logged in and owns the URL for the given ID:
deletes the URL
redirects to /urls
if user is not logged in:
(Minor) returns HTML with a relevant error message
if user is logged it but does not own the URL for the given ID:
(Minor) returns HTML with a relevant error message
 */
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session['user_id'];
  const user = users[user_id];
  if (user) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  return res.status(403).send("have to be logged in for that");
});


/*
*
sends post request to login
*/
app.post("/login", (req, res) => {
  
  const password = req.body.password;
  const email = req.body.email;
  if (!password || !email) {
    return res.status(403).send('email and password cannot be blank');
  }
// confirms user and email exist
  const user = verifyUserEmail(req.body.email, users);
// uses users hashed password to compare against
//the posted password if they are the the same and returns true or false
  if (verifyPassword(req.body.password, user)) {
    req.session["user_id"] = user.id;
    return res.redirect("urls");
  }
  return res.status(403).send('Email or password is incorrect');
});


/*
*if user is logged in:
generates a short URL, saves it, and associates it with the user
redirects to /urls/:id, where :id matches the ID of the newly saved URL
if user is not logged in:
 returns HTML with a relevant error message
 */

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  const user_id = req.session['user_id'];
  const user = users[user_id];
  if (!user) {
    return res.status(403).send("please Log in my man");
  }
  
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: user
  };
  res.redirect('/urls/' + id);
});


/*
if user is logged in:
redirects to /urls
if user is not logged in:
returns HTML with:
a form which contains:
input fields for email and password
a register button that makes a POST request to /register 
*/
app.get("/register", (req, res) => {
  
  const templateVars = { user: null};
  res.render("urls_register", templateVars);
});
/**
 * if email or password are empty:
returns HTML with a relevant error message
if email already exists:
returns HTML with a relevant error message
otherwise:
creates a new user
encrypts the new user's password with bcrypt
sets a cookie
redirects to /urls
 */
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if ((!password) || (!email)) {
    return res.status(403).send('email and password cannot be blank');
  }
//verifies post email against emails in data base returns user truthy
  if (verifyUserEmail(email, users)) {
    return res.status(403).send('email is in use');
  }
//generates random string for ID
  const id = generateRandomString();
  users[id] = {
    id: id,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, salt)
  };
  req.session["user_id"] = id;
  return res.redirect("/urls");
});

// kekW if user tries random stuff 
app.get("/*", (req, res) => {
  return res.status(404).send('page is not here man')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});