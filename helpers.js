const getUserByEmail = (email , database) => {
  for (let userId in database) {
    let user = database[userId];
    if (user.email === email) {
      return user.id;
    }
  }
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

module.exports = { getUserByEmail, urlsForUser , generateRandomString }