// task10.js
const axios = require('axios');

async function fetchData() {
    try {
        const response = await axios.get('http://localhost:5000/');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Errore nella richiesta:", error.message);
    }
}

fetchData();