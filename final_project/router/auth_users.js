const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  const user = users.find(
      (user) => user.username === username
  );
  return !!user;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const hasUser = users.find(
      (user) => user.username === username && user.password === password
  );
  return !!hasUser;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Invalid username and/or password!" });
  }

  if (authenticatedUser(username, password)) {
    const token = jwt.sign(
      {
        data: password,
      },
      "access",
      {
        expiresIn: 60 * 60,
      }
    );
    req.session.authorization = { token, username };
    return res.status(200).send("User logged in successfully! token: " + token);
  } else {
    return res.status(208).send("Login failed, check username and/or password!");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  books[isbn].reviews[req.session.authorization["username"]] = review;
  return res
    .status(200)
    .json({ message: "Review updated", reviews: books[isbn].reviews });
});

// Remove a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  delete books[isbn].reviews[req.session.authorization["username"]];
  return res
    .status(200)
    .json({ message: "review deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
