module.exports.getDate = () => {
    let date_ob = new Date();
    let date = IntTwoChars(date_ob.getDate());
    let month = IntTwoChars(date_ob.getMonth() + 1);
    let year = date_ob.getFullYear();
    let hours = IntTwoChars(date_ob.getHours());
    let minutes = IntTwoChars(date_ob.getMinutes());
    let seconds = IntTwoChars(date_ob.getSeconds());
    let dateDisplay = `${year}/${month}/${date} ${hours}:${minutes}:${seconds}`;

    return dateDisplay;
}

module.exports.getIp = (req) => {
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
    return ip;
}

function IntTwoChars(i) {
    return (`0${i}`).slice(-2);
}

module.exports.deleteProps = (obj, prop) => {
    for (const p of prop) {
        (p in obj) && (delete obj[p]);
    }
}