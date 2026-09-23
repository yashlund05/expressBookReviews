const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const accessToken = jwt.sign(
    { username: username },
    "access",
    { expiresIn: "1h" }
  );

  req.session.authorization = {
    accessToken: accessToken,
    username: username
  };

  return res.status(200).json({
    message: "User successfully logged in",
    accessToken: accessToken
  });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  const username = req.session.authorization.username;

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review successfully added",
    review: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  const username = req.session.authorization.username;

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({
      message: "Review not found"
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review successfully deleted"
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;