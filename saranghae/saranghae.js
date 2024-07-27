/*
    saranghae.js
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

const ROWS = 5;
const CANVAS_SCALE = 2;
const VCANVAS_W = 120;
const VCANVAS_H = 40;
const STYLES = [
    'rgb(255, 236,  71)',
    'rgb( 90, 121, 186)',
    'rgb(255, 241, 207)',
    'rgb(172,  36,  36)',
    'rgb( 46,  39,  19)'
];
/* ws: white, dot: black */
const SARANGHAE_XPM = [
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                               .....        .................    .....              .....        .....  ....            ",
"                               .....        .................    .....              .....        .....  ....            ",
"                .....          .....                     ....    .....              .....        .....  ....            ",
"                .....          .....                     ....    .....        .................  .....  ....            ",
"                .....          .....                     ....    .....        .................  .....  ....            ",
"                .....          .....                     ....    .....                           .....  ....            ",
"                .....          .....                     ....    .....                           .....  ....            ",
"                .....          .....        .................    ...........      .........      .....  ....            ",
"                .....          .....        .................    ...........      .........      .....  ....            ",
"                .....          .....        ....                 .....          .....    ....    .....  ....            ",
"                .....          .....        ....                 .....          .....    ....    .....  ....            ",
"                .....          .....        ....                 .....        ....         ....  .....  ....            ",
"                .....          .....        ....                 .....        ....         ....  .....  ....            ",
"                .....          ...........    ...............    .....        ....         ....  ...........            ",
"                .....          ...........    ...............    .....        ....         ....  ...........            ",
"                .....          .....                                          ....         ....  .....  ....            ",
"                .....          .....                                          ....         ....  .....  ....            ",
"                .....          .....              ...............             ....         ....  .....  ....            ",
"                .....          .....              ...............             ....         ....  .....  ....            ",
"                .....          .....              ...          ..             ....         ....  .....  ....            ",
"              .........        .....          .......          .......        ....         ....  .....  ....            ",
"              .........        .....          .......          .......        ....         ....  .....  ....            ",
"            .....    ....      .....          .....              .....          .....    ....    .....  ....            ",
"            .....    ....      .....          .....              .....          .....    ....    .....  ....            ",
"          ....         ....    .....          .......          .......            .........      .....  ....            ",
"          ....         ....    .....          .......          .......            .........      .....  ....            ",
"                               .....              ...............                                .....  ....            ",
"                               .....              ...............                                .....  ....            ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        ",
"                                                                                                                        "
];

var particles = [];
var canvas = null;
var ctx = null;
var prevDt = 0;
var generations = [];

/* convert xpm data into an array of particle objects. */
function createParticles() {
    for (var y = 0; y < VCANVAS_H; y++) {
        for (var x = 0; x < VCANVAS_W; x++) {
            const row = SARANGHAE_XPM[y];

            if (row[x] == '.') {
                var particle = new Object();

                particle.x = x;
                particle.y = y;
                particle.fillStyle = STYLES[Math.floor(STYLES.length * Math.random())];
                particles.push(particle);
            }
        }
    }
}

function redraw() {
    const clearRow = function(r) {
        /* fill the specified row with style specific to it. */
        ctx.fillStyle = STYLES[r % STYLES.length];
        ctx.fillRect(0, 
                     r * CANVAS_SCALE * VCANVAS_H, 
                     CANVAS_SCALE * VCANVAS_W, 
                     CANVAS_SCALE * VCANVAS_H);
    };
    const now = new Date().getTime();

    if (now - prevDt > 200) {
        for (var currentRow = 0; currentRow < ROWS; currentRow++) {
            clearRow(currentRow);
            for (var i = 0; i < particles.length; i++) {
                const particle = particles[i];
                const centerX = VCANVAS_W / 2;
                const distX = Math.abs(particle.x - centerX);
                const diff = -2 * distX * Math.cos(8.4 + generations[currentRow] * 0.2);
                var x = 0;
                var y = 0;

                if (diff < 0) {
                    x = particle.x
                } else {
                    if (particle.x < centerX) {
                        x = particle.x + diff;
                    } else {
                        x = particle.x - diff;
                    }
                }
                y = particle.y + (currentRow * VCANVAS_H);

                ctx.fillStyle = particle.fillStyle;
                ctx.fillRect(CANVAS_SCALE * x, 
                             CANVAS_SCALE * y, 
                             CANVAS_SCALE, 
                             CANVAS_SCALE);
            }
            prevDt = now;
            generations[currentRow]++;
        }
    }
    window.requestAnimationFrame(redraw);
}

function init() {
    createParticles();
    canvas = document.getElementById('canvas');
    canvas.width  = CANVAS_SCALE * VCANVAS_W;
    canvas.height = CANVAS_SCALE * VCANVAS_H * ROWS;
    ctx = canvas.getContext('2d');
    for (var r = 0; r < ROWS; r++) {
        generations.push(r * 30);
    }
    redraw();
}
