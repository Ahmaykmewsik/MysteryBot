const fs = require('fs');

module.exports = {
    getHeartImage(num) {
        num = num.toFixed(2).toString();
        const h = "./hearts/hearts_" + num + ".png";
        try {
            if (fs.existsSync(h)) {
                return h;
            }
        } catch {
            //Oh well
        }
        return "./hearts/hearts_error.png";
    }
}