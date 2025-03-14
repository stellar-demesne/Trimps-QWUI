mazIO = {
	get mapPresets() {
		return game.global.universe == 1 ? game.global.mapPresets : game.global.mapPresets2
	},
	set mapPresets(data) {
		data = this._verifyMapPresets(data)
		if (data) {
			let location = game.global.universe == 1 ? "mapPresets" : "mapPresets2"
			game.global[location] = data;
			toggleSetting("mapAtZone", undefined, false, false, false, true) // display changes
			console.log(`Set presets for u${game.global.universe}`)
		}
	},
	get currentMaZ() {	
		return game.options.menu.mapAtZone[this._currentMaZLocation]
	},
	set currentMaZ(data) {
		data = this._verifyMaZ(data)
		if (data) { 
			let location = this._currentMaZLocation
			game.options.menu.mapAtZone[location] = data 
			toggleSetting("mapAtZone", undefined, false, false, false, true) // display changes
			console.log("Set MaZ", location)
		}
		else {
			console.log("MaZ data is malformed, please check your inputs and try again.")
		}		
	},
	get _currentMaZLocation() {
		let universeSuffix = game.global.universe == 1 ? "" : "U2"
		let presetSuffix = game.options.menu.mapAtZone[`U${game.global.universe}Mode`] == "a" ? "" : "B"
		return `setZone${universeSuffix}${presetSuffix}`
	},
	_verifyMaZ(data) {
		try {
			for (const line of data) {
				let valid = 
				typeof line.check == "boolean" &&
				typeof line.on == "boolean" &&
				typeof line.world == "number" && this.between(line.world, 10, 999) &&
				typeof line.through == "number" && this.between(line.through, 10, 999) &&
				typeof line.cell == "number" && this.between(line.cell, 1, 100) &&
				typeof line.preset == "number" && this.between(line.preset, 0, 10) && // what the hell is with preset numbering, GS?  0 1 2 6 7?  
				typeof line.repeat == "number" && this.between(line.repeat, 0, 2) &&
				typeof line.until == "number" && this.between(line.until, 0, 9) // repeat type/times
				typeof line.exit == "number" && this.between(line.exit, 0, 2) &&
				typeof line.bwWorld == "number" && this.between(line.bwWorld, 125, 999) &&
				typeof line.times == "number" && [-2, -1, 1, 2, 3, 5, 10, 30].includes(line.times) // repeat every X zones
				typeof line.done == "string";
				if (line.until ==  9 && line.rx < 1) valid = false; // repeat X times
				if (line.times == -2 && line.tx < 1) valid = false; // repeat every X zones
				if (!valid) throw new Error("Invalid MaZ line");
				// TODO unlocks check
				// unique maps (all on preset) 
				// Technically BW, but BW unlocks before MaZ. 
			}
			return data
		}
		catch (e) { 
			return null
		}
	},
	_verifyMapPresets(data) {
		try {
			let keys = Object.keys(data);
			let valid =	keys[0] == "p1" && keys[1] == "p2" && keys[2] == "p3" && keys[3] == "p4" && keys[4] == "p5";
			if (!valid) throw new Error("No Presets Included");
			for (const line of Object.values(data)) {
				valid = 
				typeof line.loot == "number" && this.between(line.loot, 0, 9) &&
				typeof line.difficulty == "number" && this.between(line.difficulty, 0, 9) &&
				typeof line.size == "number" && this.between(line.size, 0, 9) &&
				typeof line.biome == "string" && ["Random", "Mountain", "Forest", "Sea", "Depths", "Gardens", "Farmland"].includes(line.biome) &&
				typeof line.specMod == "string" && ["0", "fa", "lc", "ssc", "swc", "smc", "src", "p", "hc", "lsc", "lwc", "lmc", "lrc"].includes(line.specMod) &&
				typeof line.perf == "boolean" &&
				typeof line.extra == "number" && this.between(line.extra, 0, 10) &&
				typeof line.offset == "number" && line.offset <= 0;
				if (!valid) throw new Error("Invalid Preset data")
				// TODO second round check, are certain features unlocked?
				// perfect. gardens, farmland. extra. 
			}
			return data
		}
		catch (e) {
			console.debug(e)
			return null
		}
	},
	import() {
		exportElem = document.getElementById("exportArea")
		try {
			data = exportElem.value
			data = JSON.parse(data)
		}
		catch {
			console.log("Invalid data")
			return
		}
		const { universe, maz, presets } = data 
		if (universe == game.global.universe) {
			// TODO only import presets used by the imported maz
			if (readNiceCheckbox(document.getElementById("mazIOPresetCheckbox"))) this.mapPresets = presets
			this.currentMaZ = maz
		}
		else { console.log("Preset is from the wrong Universe!")}
		
	},
	export(){
		output = { universe: game.global.universe, maz: this.currentMaZ, presets: this.mapPresets }
		output = JSON.stringify(output)
		exportElem = document.getElementById("exportArea")
		exportElem.value = output;
		exportElem.select()
		document.execCommand('copy')
	},
	between(x, min, max) {
		return min <= x && x <= max
	},
	_displayExportMAZ() {
		// TODO swap to using a separate window
		const tooltipDiv = document.getElementById('tooltipDiv2');
		swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);
			
		let output = { universe: game.global.universe, maz: mazIO.currentMaZ, presets: mazIO.mapPresets }
		output = JSON.stringify(output)
		
		const tooltipText = `This is your Map at Zone loadout string. There are many like it but this one is yours. 
		Save this save somewhere safe so you can save time next time.<br/><br/>
		<div id="mazErrors" style="color: red;"></div>
		<textarea id='exportArea' style='width: 100%; resize: none' rows='5'>${output}</textarea>`;
		
		const u2Affix = game.global.totalRadPortals > 0 ? ` ${game.global.totalRadPortals} U${game.global.universe}` : '';
		const saveName = `MAZ Loadout P${game.global.totalPortals}${u2Affix} Z${game.global.world}`;
		const serializedOutput = encodeURIComponent(output);
		
		// TODO import too
		const costText = `
		<div class='maxCenter'>
		<div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>
		<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>
		<a id='downloadLink' target='_blank' download='${saveName} MaZ.txt' href='data:text/plain,${serializedOutput}'>
		<div class='btn btn-danger' id='downloadBtn'>Download as File</div>
		</a>
		</div>
		`;
		
		tooltipDiv.style.left = '33.75%';
		tooltipDiv.style.top = '25%';
		
		const tipText = document.getElementById('tipText2');
		const tipTitle = document.getElementById('tipTitle2');
		const tipCost = document.getElementById('tipCost2');
		const titleText = 'Export MAZ Loadout';
		
		if (tipText.className !== '') tipText.className = '';
		if (tipText.innerHTML !== tooltipText) tipText.innerHTML = tooltipText;
		if (tipTitle.innerHTML !== titleText) tipTitle.innerHTML = titleText;
		if (tipCost.innerHTML !== costText) tipCost.innerHTML = costText;
		tooltipDiv.style.display = 'block';
			tooltipDiv.style.zIndex = 9;
	}
}

// oh yeah, we're wrapping tooltip. I'm not scared of this at all.
var originaltooltip = tooltip;
tooltip = function () {
	let originalReturn = originaltooltip(...arguments)
	try {
		if (arguments[0] =="Set Map At Zone") {
			let html = `<span style="float: right;">
			<button class="btn btn-primary btn-md" id="clipBoardBtn" onclick="mazIO.export()">Export
			</button><button class="btn btn-primary btn-md" id="mazIOImport" onclick="mazIO.import()">Import
			</button>
			<label>${buildNiceCheckbox("mazIOPresetCheckbox", null, false)}Import Presets
			</label><textarea id="exportArea" placeholder="Import/Export" rows="1" style="margin-bottom: -0.6vw; resize: none;"></textarea>
			</span>
			`
			let parentDiv = document.querySelector("#tipCost > .maxCenter")
			parentDiv.insertAdjacentHTML("beforeend", html)
		}
	}
	catch (e) { console.debug ("Couldn't add mazIO")}
	return originalReturn
}

