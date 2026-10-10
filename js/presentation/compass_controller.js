// compass_controller.js connects the domain sensor with the UI presentation
document.addEventListener('DOMContentLoaded', () => {
    const btnCompass = document.getElementById('btn-compass');
    const overlayCompass = document.getElementById('compass-overlay');
    const btnCloseCompass = document.getElementById('btn-close-compass');

    const compassSvg = document.getElementById('compass-svg');
    const hdgText = document.getElementById('compass-heading-text');
    const pitchText = document.getElementById('compass-pitch');
    const rollText = document.getElementById('compass-roll');

    let isCompassActive = false;

    btnCompass.addEventListener('click', () => {
        overlayCompass.classList.remove('hidden');
        if (!window.NavalCompass.isActive) {
            window.NavalCompass.start();
        }
        isCompassActive = true;
    });

    btnCloseCompass.addEventListener('click', () => {
        overlayCompass.classList.add('hidden');
        isCompassActive = false;
    });

    window.NavalCompass.addListener((data) => {
        if (!isCompassActive) return;

        // Rotate the compass rose (negative to counter device rotation)
        compassSvg.style.transform = `rotate(${-data.heading}deg)`;

        // Format to 3 digits (e.g. 045°)
        const formattedHeading = ('000' + data.heading.toFixed(0)).slice(-3);
        hdgText.innerText = `${formattedHeading}°`;

        pitchText.innerText = `PCH: ${data.pitch.toFixed(1)}°`;
        rollText.innerText = `RLL: ${data.roll.toFixed(1)}°`;
    });
});
