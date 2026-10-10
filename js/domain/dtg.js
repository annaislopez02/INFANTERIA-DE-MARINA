// Military Date-Time Group (DTG) Formatter
// FORMAT: DDHHMMZMONYY (e.g. 072320ZOCT26)
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function getMilitaryDTG(date = new Date()) {
    const pad = (num, size = 2) => ('000' + num).slice(-size);
    const dd = pad(date.getUTCDate());
    const hh = pad(date.getUTCHours());
    const mm = pad(date.getUTCMinutes());
    const Z = "Z"; // Zulu time (UTC)
    const mon = months[date.getUTCMonth()];
    const yy = date.getUTCFullYear().toString().slice(-2);

    return `${dd}${hh}${mm}${Z}${mon}${yy}`;
}

window.getMilitaryDTG = getMilitaryDTG;
