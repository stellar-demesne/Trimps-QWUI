const qUI = {
	goldConfig: function () {
		if (game.global.canGuString) archoGolden.popup();
	},

	generatorConfig: function () {
		if (game.permanentGeneratorUpgrades.Supervision.owned) {
			tooltip("Configure Generator State", null, "update");
		}
	},

	mazConfig: function () {
		tooltip('Set Map At Zone', null, 'update');
	},

	GAConfig: function () {
		tooltip('Geneticistassist Settings', null, 'update');
	},

	makeCfgBtn: function (targetElem, configID, styleOverride) {
		if (!targetElem) return;
		const btn = document.createElement("div");
		const icon = document.createElement("span");
		icon.classList.add("glyphicon", "glyphicon-cog");
		btn.appendChild(icon);
		btn.setAttribute("id", configID);
		btn.onclick = qUI[configID];
		btn.setAttribute("aria-label", "Configure");

		targetElem.appendChild(btn);
		targetElem.classList.add("toggleConfigBtn");
		if (styleOverride) targetElem.style = styleOverride;
		return [targetElem, btn]; // TODO styles should probably be set based on what type of button the target is, alas. So, return so it's possible to modify after creation
	},

	addAriaLabel: function (targetElem, label) {
		if (targetElem) {
			if (targetElem.title && !label) label = targetElem.title;
			targetElem.setAttribute("aria-label", label);
		}
	},

	createStyles: function () {
		let styleElem = document.createElement("style");
		styleElem.textContent = `
		.settingsBtnCogwheel {
    		font-size: 1.17vw;
    		border-right: 1px solid black !important;
    		border-top: 1px solid black !important;
    		border-bottom: 1px solid black !important;
    		cursor: pointer;
		},
		`;
		document.head.appendChild(styleElem);
	},

	screenReaderBtns: function () {
		// Screenreader fixes
		this.addAriaLabel(document.querySelector("#autoJobsBtn > div:nth-child(2)"), "Configure Auto Jobs");
		this.addAriaLabel(document.querySelector("#autoStructureBtn > div:nth-child(2)"), "Configure Auto Structure");
		this.addAriaLabel(document.querySelector("#autoEquipBtn > div:nth-child(2)"), "Configure Auto Equip");

		// Screenreader DG fix, cursed span vs div
		try {
			document.querySelector("#generatorStateConfigBtn").remove();
			document.querySelector("#dgChangeBtnContainer").insertAdjacentHTML("beforeend", `<div role="button" aria-label="Configure Generator" style="display: none;" onclick="tooltip(&quot;Configure Generator State&quot;, null, &quot;update&quot;)" id="generatorStateConfigBtn" class="pointer noselect hoverColor dgChangeBtn colorDefault"><span class="glyphicon glyphicon-cog"></span></div>`);
			updateGeneratorInfo() // display btn if supervsion unlocked
		}
		catch { }
	},
}

//qUI.createStyles()
//qUI.screenReaderBtns()

// AutoGold
if (game.global.canGuString) {
	//qUI.makeCfgBtn(document.getElementById("autoGoldenBtn"), "goldConfig");
}

// Settings Buttons need to be modified on creation 
/*
originalsearchSettings = searchSettings;
searchSettings = function () {
	const result = originalsearchSettings(...arguments);
	let target, btn;
	// Supervision
	try {
		if (game.permanentGeneratorUpgrades.Supervision.owned) {
			[target, btn] = qUI.makeCfgBtn(document.getElementById("togglegeneratorStart").parentElement, "generatorConfig", "height: auto;");
			btn.classList.add("settingsBtnCogwheel")
		}
	}
	catch { }
	// MaZ
	try {
		if (game.global.canMapAtZone) {
			[target, btn] = qUI.makeCfgBtn(document.getElementById("togglemapAtZone").parentElement, "mazConfig", "height: auto;");
			btn.classList.add("settingsBtnCogwheel")
		}
	}
	catch { }
	return result;
}
*/
