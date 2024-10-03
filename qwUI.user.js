// ==UserScript==
// @name         quia+wombats UI
// @namespace    https://github.com/stellar-demesne/Trimps-QWUI
// @version      1.0
// @updateURL    https://github.com/stellar-demesne/Trimps-QWUI/qwUI.user.js
// @description  button envisibleifier
// @author       StellarDemesne, Quiaaaa
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'qwUI';
script.src = 'https://stellar-demesne.github.io/Trimps-QWUI/qwUI.js';
script.setAttribute('crossorigin', "anonymous");
document.head.appendChild(script);
