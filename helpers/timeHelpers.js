const now = new Date();

const getCurrentDateTime = () => {

    let year = now.getFullYear();
    let month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    let day = String(now.getDate()).padStart(2, '0');
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    let seconds = String(now.getSeconds()).padStart(2, '0');
    
    let formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    console.log(formatted); // Example: 2025-04-21 15:23:45
    return formatted
}

module.exports = {
    getCurrentDateTime : getCurrentDateTime
}
