/*
    kiri.js
    Copyright (C) 2024 Hirosuke Miyajima 

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const CANVAS_W = 340;
const CANVAS_H = 210;

var canvas = null;
var ctx = null;
var prevDt = 0;
var waves = [];
var screenDist = 90;

/*
    I refered following to get these formulae 
    http://www.extentofthejam.com/pseudo/
*/
function getScreenX(x, z) {
    return (screenDist * x) / z + CANVAS_W / 2;
}

function getScreenY(x, y, z) {
    return (y * screenDist / z) + CANVAS_H / 2;
}

function generateWaves() {
    for (var z = 200; z > 0; z -= 10) {
        for (var x = -150; x < 150; x += 5) {
            var wav = new Object();

            wav.x = x;
            wav.y = 20;
            wav.z = z;
            waves.push(wav);
        }
    }    
}

function alterWaves(t) {
        for (var i = 0; i < waves.length; i++) {
            waves[i].y = 30 + 10 * Math.sin(1.28 * i + 0.07 * t);
        }
}

function redraw() {
    const now = new Date().getTime();
    const getWaveColor = function(z) {
        const c = 255 - Math.floor(z * 0.8);

        if (c < 0)   return 'rgb(0, 0, 0)';
        if (c > 255) return 'rgb(255, 255, 255)';
        return 'rgb(' + c + ',' + c + ',255)';
    };

    if (now - prevDt > 200) {
            const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);

            grad.addColorStop(0, 'rgb(105, 194, 199)');
            grad.addColorStop(1, 'rgb(187, 200, 230)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

            screenDist = 110 + 80 * Math.cos(now * 0.002);

            /* draw the river */
            ctx.fillStyle = 'rgb(234, 237, 247)';
            ctx.fillRect(0, 127, CANVAS_W, CANVAS_H - 127);
            ctx.globalAlpha = 0.5;
            for (var i = 0; i < waves.length; i++) {
                const wav = waves[i];
                const x = getScreenX(wav.x, wav.z);
                const y = getScreenY(wav.x, wav.y, wav.z);
                ctx.fillStyle = getWaveColor(wav.z);
                ctx.fillRect(x, y, 3, 3);
            }
            ctx.globalAlpha = 1.0;

            /* and draw the boat on it */
            const bx = 0;
            const by = 20;
            const bz = 30;
            ctx.textAlign = 'center';
            ctx.font = '30px serif';
            ctx.fillText('\ud83e\udd56', 
                         getScreenX(bx, bz), 
                         getScreenY(bx, by, bz));

            alterWaves(now);
            prevDt = now;
    }
    window.requestAnimationFrame(redraw);
}

function init() {
    canvas = document.getElementById('canvas');
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx = canvas.getContext('2d');
    generateWaves();
    redraw();
}
