const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);


const getUserByEmail = (email , database) => {
  for (let userId in database) {
    let user = database[userId];
    if (user.email === email) {
      return user.id;
    }
  }
};

// looping through each id in the object looking for unique urls
const urlsForUser = (id, database) => {

  const userURLs = {};

  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      userURLs[shortURL] = database[shortURL];
    }
  }
  return userURLs;
};
// generate unique string length of 6 characters
const generateRandomString = () => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
// verify if the email exists and then returns a user for my veripassword 
const verifyUserEmail = (email, database) => {
  for (let key in database) {
    let user = database[key];
    if (user.email === email) {
      return user;
    }
  }
};
//takes the request body password and the user hashed password  
//and compares them to confirm login if it's true or false
const verifyPassword = (password, user) => {
  if (!user) {
    return false;
  }
  return bcrypt.compareSync(password, user.password);
};



module.exports = { getUserByEmail, urlsForUser , generateRandomString , verifyPassword, verifyUserEmail};