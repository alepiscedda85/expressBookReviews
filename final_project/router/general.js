const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // 1. Controllo se mancano dati obbligatori
    if (!username || !password) {
        return res.status(400).json({ message: "Username e password sono obbligatori." });
    }

    // 2. Controllo se l'utente esiste già
    if (isValid(username)) {
        return res.status(409).json({ message: `L'utente '${username}' è già registrato.` });
    }

    // 3. Registrazione dell'utente
    users.push({ username, password });

    // 4. Risposta di successo
    return res.status(200).json({ message: "Registrazione completata con successo." });
});

// Get the book list available in the shop (ASYNC/AWAIT con Promise)
function getBooksAsync() {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("Errore: nessun libro disponibile.");
        }
    });
}

public_users.get('/', async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(500).json({ error });
    }
});

// Get book details based on ISBN
function getBookByISBNAsync(isbn) {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(`Nessun libro trovato con ISBN: ${isbn}`);
        }
    });
}

public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBNAsync(isbn);
        return res.status(200).json(book);
    } catch (err) {
        return res.status(404).json({ error: err });
    }
});

// Get book details based on author
function getBooksByAuthorAsync(author) {
    return new Promise((resolve, reject) => {
        const booksByAuthor = Object.values(books).filter(
            (book) => book.author.toLowerCase() === author.toLowerCase()
        );

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject(`Nessun libro trovato per l'autore "${author}".`);
        }
    });
}

public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const books = await getBooksByAuthorAsync(author);
        return res.status(200).json(books);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Get all books based on title
function getBooksByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        const booksByTitle = Object.values(books).filter(
            (book) => book.title.toLowerCase() === title.toLowerCase()
        );

        if (booksByTitle.length > 0) {
            resolve(booksByTitle);
        } else {
            reject(`Nessun libro trovato con titolo "${title}"`);
        }
    });
}

public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const books = await getBooksByTitleAsync(title);
        return res.status(200).json(books);
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // Controlla se esiste il libro
    if (books[isbn]) {
        const reviews = books[isbn].reviews || {};
        return res.status(200).json(reviews);
    } else {
        return res.status(404).json({ message: `Nessun libro trovato con ISBN: ${isbn}` });
    }
});




module.exports.general = public_users;
