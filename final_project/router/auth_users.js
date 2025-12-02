const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(
        (user) => user.username === username && user.password === password
    );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // 1. Verifica che siano presenti username e password
    if (!username || !password) {
        return res.status(400).json({ message: "Username e password sono obbligatori." });
    }

    // 2. Verifica credenziali
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Credenziali non valide." });
    }

    // 3. Genera token JWT
    const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // 4. Salva nella sessione
    req.session.user = {
        username,
        accessToken
    };

    return res.status(200).json({
        message: `Login effettuato con successo.`,
        token: accessToken
    });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Verifica se l'utente è autenticato
    if (!req.session || !req.session.user || !req.session.user.username) {
        return res.status(401).json({ message: "Accesso non autorizzato." });
    }

    const username = req.session.user.username;

    // Verifica che esista il libro
    if (!books[isbn]) {
        return res.status(404).json({ message: `Nessun libro trovato con ISBN: ${isbn}` });
    }

    if (!review) {
        return res.status(400).json({ message: "La recensione è richiesta come parametro 'review'." });
    }

    // Sezione reviews
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Aggiungi o modifica recensione
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Recensione salvata per il libro con ISBN ${isbn}.`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // 1. Verifica autenticazione
    if (!req.session || !req.session.user || !req.session.user.username) {
        return res.status(401).json({ message: "Accesso non autorizzato." });
    }

    const username = req.session.user.username;

    // 2. Verifica che il libro esista
    if (!books[isbn]) {
        return res.status(404).json({ message: `Nessun libro trovato con ISBN: ${isbn}` });
    }

    // 3. Verifica che esistano recensioni
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: `Nessuna recensione trovata per l'utente ${username} su ISBN ${isbn}` });
    }

    // 4. Elimina la recensione dell’utente
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: `Recensione eliminata con successo per ISBN ${isbn}`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
