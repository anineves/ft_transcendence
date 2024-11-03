const host = window.location.hostname;
const protocol = window.location.protocol; 

window.config = {
    API_URL: `${protocol}//${host}:8080`, 
    API_URI: `${host}:8080`,
};

let clients = new Set();