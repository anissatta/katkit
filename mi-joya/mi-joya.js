/*
    mi-joya.js
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

const CANVAS_W = 310;
const CANVAS_H = 210;
const SCREEN_DIST = 90;
/* zoom modes */
const ZOOMMODE_NONE = 0;
const ZOOMMODE_BACK = 1;
const ZOOMMODE_FORE = 2;

const BG_COLORS = [
    'rgb( 22,  94, 131)', 
    'rgb(230, 180,  34)',
    'rgb( 89, 185, 198)',
    'rgb(140,  98, 120)',
    'rgb(224, 235, 175)',
    'rgb(222, 131, 151)',
    'rgb( 48,  79,  84)',
    'rgb(242, 214, 118)'
];

var canvas = null;
var ctx = null;
var animId = null;
var prevDt = 0;
var dots = [];
var tick = 0;
var zoomMode = ZOOMMODE_NONE;
var cameraY = 0;
var offsetZ = 0;

/*
    I tried to extend one of the formulae so that they can handle situations 
    where camera goes higher than objects etc. 
    http://www.extentofthejam.com/pseudo/
*/
function getScreenX(x, z) {
    return (SCREEN_DIST * x) / z + CANVAS_W / 2;
}

function getScreenY(x, y, z) {
    const oz = z + offsetZ;

    return cameraY - ((cameraY - y) * SCREEN_DIST / oz) + CANVAS_H / 2;
}

/* load XPM data of Korean Peninsula and build array of dots */
function generateWorld() {
    const iw = KOREA_XPM[0].length;
    const ih = KOREA_XPM.length;

    for (var iz = 0; iz < ih; iz++) {
        for (var ix = 0; ix < iw; ix++) {
            var dot = new Object();

            if (KOREA_XPM[iz][ix] != '.') {
                dot.x = ix - (iw / 2);
                dot.y = 38;
                dot.z = ih - iz;
                dots.push(dot);
            }
        }
    }
}

/* 
  do some to parameters so that this frame look 
  different to the prev one 
*/
function moveCamera() {
    const default_cy = -100;
    const default_oz = -73;

    switch (zoomMode) {
        case ZOOMMODE_NONE:
            cameraY = default_cy;
            offsetZ = default_oz;
            zoomMode = ZOOMMODE_BACK; 
            break;
        case ZOOMMODE_BACK:
            if (cameraY < 0) {
                cameraY++;
                offsetZ++;
            } else {
                zoomMode = ZOOMMODE_FORE;
            }
            break;
        case ZOOMMODE_FORE:
            if (cameraY > default_cy) {
                cameraY--;
                offsetZ--;
            } else {
                zoomMode = ZOOMMODE_BACK;
            }
            break;
        default: 
            alert('arrived default');
            break;
    }
}

/* main animation loop */
function animate() {
    const now = new Date().getTime();
    const getBgColors = function(t) {
        const pickColor = function(n) {
            const i = n % BG_COLORS.length;

            return BG_COLORS[i];
        };
        const ns = Math.floor(t / 20);
        var pair = [];

        pair.push(pickColor(ns));
        pair.push(pickColor(ns + 2));
        return pair;
    };
    const getDotColor = function(z) {
        const c = 255 - Math.floor(z * 0.8);

        if (c < 0)   return 'rgb(0, 0, 0)';
        if (c > 255) return 'rgb(255, 255, 255)';
        return 'rgb(' + c + ',255,' + c + ')';
    };
    const getVerse = function(t) {
        const i = Math.floor(t / 22);

        return (i < VERSES.length) ? VERSES[i] : null;
    };

    if (now - prevDt > 200) {
            const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
            const colors = getBgColors(tick);

            /* draw the background */
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(1, colors[1]);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
            moveCamera();

            /* draw the Korean Peninsula */
            for (var i = 0; i < dots.length; i++) {
                const dot = dots[i];
                const x = getScreenX(dot.x, dot.z);
                const y = getScreenY(dot.x, dot.y, dot.z);

                ctx.globalAlpha = 1.0 / (0.05 * dot.z);
                ctx.fillStyle = getDotColor(dot.z);
                ctx.fillRect(x, y, 3, 3);
            }
            ctx.globalAlpha = 1.0;

            /* draw a verse on it. */
            var verse = getVerse(tick);
            ctx.textAlign = 'center';
            if (!verse) {
                /* after drawing final verse, stop the animation */
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 20px Courier';
                ctx.fillText('Mi Joya', CANVAS_W / 2, CANVAS_H / 2);
                window.cancelAnimationFrame(animId);
                return;
            }
            ctx.textBaseline = 'top';
            ctx.font = 'bold 15px Courier';
            ctx.fillText(verse, CANVAS_W / 2, 5);

            tick++;
            prevDt = now;
    }
    animId = window.requestAnimationFrame(animate);
}

function init() {
    canvas = document.getElementById('canvas');
    canvas.width  = CANVAS_W;
    canvas.height = CANVAS_H;
    ctx = canvas.getContext('2d');
    generateWorld();
    animate();
}
