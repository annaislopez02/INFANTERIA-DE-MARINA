// Compass and Sensor abstractor
class NavalCompass {
    constructor() {
        this.heading = 0;
        this.pitch = 0;
        this.roll = 0;
        this.isActive = false;

        // Listeners array
        this.onOrientationChange = [];
    }

    start() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        this._bindListener();
                    }
                })
                .catch(console.error);
        } else {
            this._bindListener();
        }
    }

    _bindListener() {
        this.isActive = true;
        // Desktop mock initialization if absolute is missing
        this._mockOrientation();

        window.addEventListener('deviceorientationabsolute', this._handleOrientation.bind(this), true);
        window.addEventListener('deviceorientation', this._handleOrientation.bind(this), true);
    }

    _mockOrientation() {
        // If testing on desktop without sensors, just mock it slowly rotating
        setInterval(() => {
            this.heading = (this.heading + 1) % 360;
            this.pitch = Math.sin(Date.now() / 1000) * 10;
            this.roll = Math.cos(Date.now() / 1000) * 5;
            this.onOrientationChange.forEach(cb => cb({ heading: this.heading, pitch: this.pitch, roll: this.roll }));
        }, 1000);
    }

    _handleOrientation(event) {
        let alpha = event.alpha; // Z axis (heading)
        let beta = event.beta;   // X axis (pitch)
        let gamma = event.gamma; // Y axis (roll)

        if (event.webkitCompassHeading) {
            alpha = event.webkitCompassHeading;
        }

        if (alpha !== null) {
            this.heading = 360 - alpha;
            this.pitch = beta;
            this.roll = gamma;

            this.onOrientationChange.forEach(cb => cb({ heading: this.heading, pitch: this.pitch, roll: this.roll }));
        }
    }

    addListener(callback) {
        this.onOrientationChange.push(callback);
    }
}

window.NavalCompass = new NavalCompass();
