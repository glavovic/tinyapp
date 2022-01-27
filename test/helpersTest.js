const { assert } = require('chai');

const { getUserByEmail, generateRandomString, urlsForUser } = require('../helpers.js');

const testUsers = {
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

const testDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID1" },
  "9sm5xK": { longURL: "http://www.google.ca", userID: "userID2" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedUserID);
  });
  
  it('should return a different string everytime when the function is called', function() {
    const user1 = generateRandomString();
    const user2 = generateRandomString();
    assert.notEqual(user1, user2);
  });

  it('should return the correct object position (URL) when passed a specific User ID from the database', function() {

    const user = urlsForUser("userID1", testDatabase);

    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userID1" },
    };

    assert.deepEqual(user, expectedOutput);
  });

  it('should return an empty object when not passed a specific User ID from the database', function() {
    const user = urlsForUser("userID3", testDatabase);

    const expectedOutput = {};

    assert.deepEqual(user, expectedOutput);
  });

});


