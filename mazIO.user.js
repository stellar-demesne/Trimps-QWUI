// ==UserScript==
// @name         Map at Zone Import/Export
// @namespace    https://github.com/stellar-demesne/Trimps-QWUI
// @version      1.0
// @updateURL    https://github.com/stellar-demesne/Trimps-QWUI/mazIO.user.js
// @description  import/export function for MaZ
// @author       Quiaaaa
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'mazIO';
script.src = 'https://stellar-demesne.github.io/Trimps-QWUI/mazIO.js';
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);
