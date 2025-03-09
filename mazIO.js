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
				typeof line.bwWorld == "number" &&
				typeof line.cell == "number" &&
				typeof line.check == "boolean" &&
				typeof line.done == "string" &&
				typeof line.exit == "number" &&
				typeof line.on == "boolean" &&
				typeof line.preset == "number" &&
				typeof line.repeat == "number" &&
				typeof line.through == "number" &&
				typeof line.times == "number" &&
				typeof line.until == "number" &&
				typeof line.world == "number";
				if (!valid) throw new Error("Invalid MaZ line");
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
				typeof line.biome == "string" &&
				typeof line.difficulty == "number" &&
				typeof line.extra == "number" &&
				typeof line.loot == "number" &&
				typeof line.offset == "number" &&
				typeof line.perf == "boolean" &&
				typeof line.size == "number" &&
				typeof line.specMod == "string";
				if (!valid) throw new Error("Invalid Preset data")
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
		const { maz, presets } = data 
		if (readNiceCheckbox(document.getElementById("mazIOPresetCheckbox"))) this.mapPresets = presets
		this.currentMaZ = maz
		
	},
	export(){
		output = { maz: this.currentMaZ, presets: this.mapPresets }
		output = JSON.stringify(output)
		exportElem = document.getElementById("exportArea")
		exportElem.value = output;
		exportElem.select()
		document.execCommand('copy')
	}
}

// oh yeah, we're wrapping tooltip. I'm not scared of this at all.
var originaltooltip = tooltip;
tooltip = function () {
	let originalReturn = originaltooltip(...arguments)
	try {
		if (arguments[0] =="Set Map At Zone") {
			let html = `<span style="float: right;">
			<button class="btn btn-primary btn-md" id="mazIOImport" onclick="mazIO.import()">Import
			</button><button class="btn btn-primary btn-md" id="clipBoardBtn" onclick="mazIO.export()">Export
			</button>
			<label>${buildNiceCheckbox("mazIOPresetCheckbox", null, false)}Import Presets
			</label><textarea id="exportArea" placeholder="Import/Export" rows="1"></textarea>
			</span>
			`
			let parentDiv = document.querySelector("#tipCost > .maxCenter")
			parentDiv.insertAdjacentHTML("beforeend", html)
		}
	}
	catch (e) { console.debug ("Couldn't add mazIO")}
	return originalReturn
}

