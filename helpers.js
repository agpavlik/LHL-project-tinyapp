
// Function generates a random short URL id by return a string of 6 random alphanumeric characters:
const generateRandomString = function() {
  const alphanum = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += alphanum.charAt(Math.floor(Math.random() * alphanum.length));
  }
  return output;
};

// Function checks if user email exist in database
const getUserByEmail = (email, users) => {
  for (let i in users) {
    if (users[i].email === email) {
      return users[i];
    }
  } return null;
}

// Function checks if user password exist in database
const getUserByPassword = (email, users) => {
  for (let i in users) {
    if (users[i].email === email) {
      return users[i].password;
    }
  } return null;
}

// Function finds and returns urls owned by the exact user  
const getUrlByUserId = (userId, urlDatabase) => {
  let urlsByUser = {};
  for (let i in urlDatabase) {
    if (urlDatabase[i].userId === userId ) {
      urlsByUser[i] = urlDatabase[i];
    }
  } return urlsByUser;
}

module.exports = { generateRandomString, getUserByEmail, getUserByPassword, getUrlByUserId };
