const axios = require('axios');

async function fetchData() {{
    try {{
        const response = await axios.get('http://localhost:5000/title/Things Fall Apart');
        console.log(JSON.stringify(response.data, null, 2));
    }} catch (error) {{
        console.error("Errore nella richiesta:", error.message);
    }}
}}

fetchData();
