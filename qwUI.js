const qUI = {
    goldConfig: function () {
        if (game.global.canGuString) archoGolden.popup();
    },

    generatorConfig: function () {
        if (game.permanentGeneratorUpgrades.Supervision.owned) {
            tooltip("Configure Generator State", null, "update")
        }
    },

    mazConfig: function () {
        tooltip('Set Map At Zone', null, 'update');
    },

    makeCfgBtn: function (targetElem, configID, styleOverride) {
        const btn = document.createElement("div")
        const icon = document.createElement("span")
        icon.classList.add("glyphicon", "glyphicon-cog")
        btn.appendChild(icon)
        btn.setAttribute("id", configID)
        btn.onclick = qUI[configID]
        btn.setAttribute("aria-label", "Configure")

        targetElem.appendChild(btn)
        targetElem.classList.add("toggleConfigBtn")
        if (styleOverride) targetElem.style = styleOverride
    },
}

// AutoGold
if (game.global.canGuString) {
    qUI.makeCfgBtn(document.getElementById("autoGoldenBtn"), "goldConfig")
}

// Settings Buttons need to be modified on creation 
originalsearchSettings = searchSettings
searchSettings = function () {
const result = originalsearchSettings(...arguments);

// Supervision
try {
    qUI.makeCfgBtn(document.getElementById("togglegeneratorStart").parentElement, "generatorConfig", "height: auto;")
}
catch { }
// MaZ
try {
    if (game.global.canMapAtZone) {
        qUI.makeCfgBtn(document.getElementById("togglemapAtZone").parentElement, "mazConfig", "height: auto;")
    }
}
catch { }
    return result
}
