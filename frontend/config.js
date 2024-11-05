const host = window.location.hostname;
const protocol = window.location.protocol; 

window.config = {
    API_URL: `${protocol}//${host}`, 
    API_URI: `${host}`,
};