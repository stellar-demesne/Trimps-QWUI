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
		if (!targetElem) return;
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

	addAriaLabel: function (targetElem, label) {
		if (targetElem) {
			if (targetElem.title && !label) label = targetElem.title;
			targetElem.setAttribute("aria-label", label);
		}
	},

	setAllAriaLabels: function () {
		const targetElems = document.querySelectorAll(`[title]:not([title=""])`);
		for (const targetElem of targetElems) {
			this.addAriaLabel(targetElem);
		}
	},

}


// Screenreader fixes
qUI.addAriaLabel(document.querySelector("#autoJobsBtn"), "Configure Auto Jobs");
qUI.addAriaLabel(document.querySelector("#autoStructureBtn > div:nth-child(2)"), "Configure Auto Structure");
qUI.addAriaLabel(document.querySelector("#autoEquipBtn > div:nth-child(2)"), "Configure Auto Equip");
qUI.addAriaLabel(document.querySelector("#generatorStateConfigBtn"), "Configure DG Supervision");
qUI.setAllAriaLabels() // not sure if this is a good idea


// AutoGold
if (game.global.canGuString) {
	qUI.makeCfgBtn(document.getElementById("autoGoldenBtn"), "goldConfig")
}

// Settings Buttons need to be modified on creation 
originalsearchSettings = searchSettings;
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