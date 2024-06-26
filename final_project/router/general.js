const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const SIMULATE_DELAY=500

function doesExist(username) {
  const user = users.find((user) => user.username === username);
  return !!user;
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username, password });
      return res
        .status(200)
        .json({ message: "User successfully registered, now you can login!" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }

  return res.status(404).json({ message: "Invalid username and/or password!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(books), SIMULATE_DELAY);
  });
  promise.then((result) => {
    return res.status(200).json({ books: result });
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(books[isbn]), SIMULATE_DELAY);
  });

  const book = await promise;

  if (book) {
    return res.status(200).json({ book });
  } else {
    return res.status(404).json({ message: "Book not found for ISBN " + isbn});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filtered = Object.values(books).filter(
        (book) => book.author === author
      );
      resolve(filtered);
    }, SIMULATE_DELAY);
  });

  const filtered = await promise;

  if (filtered.length > 0) {
    return res.status(200).json({ books: filtered });
  } else {
    return res.status(404).json({ message: "No book found for author " + author });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      const filtered = Object.values(books).filter(
        (book) => book.title === title
      );
      return resolve(filtered);
    }, SIMULATE_DELAY);
  });
  
  const filtered = await promise;

  if (filtered.length > 0) {
    return res.status(200).json({ books: filtered });
  } else {
    return res.status(404).json({ message: "No book found for title " + title });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
