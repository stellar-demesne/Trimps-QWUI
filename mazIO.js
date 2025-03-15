const mazIO = {
	get hze() {
		return game.global.universe == 1 ? game.global.highestLevelCleared : game.global.highestRadonLevelCleared
	},
	get mapPresets() {
		return game.global.universe == 1 ? game.global.mapPresets : game.global.mapPresets2
	},
	set mapPresets(data) {
		data = this._verifyMapPresets(data)
		if (data) {
			let location = game.global.universe == 1 ? 'mapPresets' : 'mapPresets2'
			game.global[location] = data;
			toggleSetting('mapAtZone', undefined, false, false, false, true) // display changes
			message(`Imported map presets for u${game.global.universe}`, 'Loot')
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
			toggleSetting('mapAtZone', undefined, false, false, false, true) // display changes
			message(`Imported MaZ for u${game.global.universe}, preset ${game.options.menu.mapAtZone[`U${game.global.universe}Mode`]}`, 'Loot')
		}		
	},
	get _currentMaZLocation() {
		let universeSuffix = game.global.universe == 1 ? '' : 'U2'
		let presetSuffix = game.options.menu.mapAtZone[`U${game.global.universe}Mode`] == 'a' ? '' : 'B'
		return `setZone${universeSuffix}${presetSuffix}`
	},
	_verifyMaZ(data) {
		try {
			let errorMessage = new Set()
			for (const line of data) {
				// TODO do this line by line for better error messages for malformed data.  Or not. 
				let valid = 
				typeof line.check == 'boolean' &&
				typeof line.on == 'boolean' &&
				typeof line.world == 'number' && this.between(line.world, 10, 999) &&
				typeof line.through == 'number' && this.between(line.through, 10, 999) &&
				typeof line.cell == 'number' && this.between(line.cell, 1, 100) &&
				typeof line.preset == 'number' && this.between(line.preset, 0, 10) && // what the hell is with preset numbering, GS?  0 1 2 6 7?  
				typeof line.repeat == 'number' && this.between(line.repeat, 0, 2) &&
				typeof line.until == 'number' && this.between(line.until, 0, 9) // repeat type/times
				typeof line.exit == 'number' && this.between(line.exit, 0, 2) &&
				typeof line.bwWorld == 'number' && this.between(line.bwWorld, 125, 999) &&
				typeof line.times == 'number' && [-2, -1, 1, 2, 3, 5, 10, 30].includes(line.times) // repeat every X zones
				typeof line.done == 'string';
				if (line.until ==  9 && line.rx < 1) valid = false; // repeat X times
				if (line.times == -2 && line.tx < 1) valid = false; // repeat every X zones
				if (!valid) throw new Error('Invalid MaZ line, MaZ not imported.');
				
				// U2 unique maps (U1 has none on MaZ) 
				if (game.global.universe == 2 && mazIO.hze < 32 && line.preset == 10) { line.preset = 1; line. on = false; errorMessage.add('Atlantrimp') }
				if (game.global.universe == 2 && mazIO.hze < 49 && line.preset == 8) { line.preset = 1; line. on = false; errorMessage.add('Melting Point') }
				if (game.global.universe == 2 && mazIO.hze < 69 && line.preset == 5) { line.preset = 1; line. on = false; errorMessage.add('Black Bog') }
				if (game.global.universe == 2 && mazIO.hze < 174 && line.preset == 9) { line.preset = 1; line. on = false; errorMessage.add('Frozen Castle') }
				
			}
			if (errorMessage.size > 0) mazIO.error = `Disabling Unique Maps: ${[...errorMessage].join(", ")}.` 
			return data
		}
		catch (e) { 
			this.error = e;
			console.debug(e)
			return null
		}
	},
	_verifyMapPresets(data) {
		try {
			var errorMessage = ''
			let keys = Object.keys(data);
			let valid =	keys[0] == 'p1' && keys[1] == 'p2' && keys[2] == 'p3' && keys[3] == 'p4' && keys[4] == 'p5';
			if (!valid) { errorMessage = 'Preset data malformed.'; throw new Error(errorMessage); }
			let errors = new Set()
			let specErrors = new Set()
			for (const line of Object.values(data)) {
				// Check general validity for all saves, error out to avoid invalid data in the save file
				if (!(typeof line.loot == 'number' && this.between(line.loot, 0, 9))) { valid = false; errorMessage += `loot invalid: ${line.loot}<br>`}
				if (!(typeof line.difficulty == 'number' && this.between(line.difficulty, 0, 9))) { valid = false; errorMessage += `difficulty invalid: ${line.difficulty}<br>`; }
				if (!(typeof line.size == 'number' && this.between(line.size, 0, 9))) { valid = false; errorMessage += `size invalid: ${line.size}<br>`; }
				if (!(typeof line.biome == 'string' && ['Random', 'Mountain', 'Forest', 'Sea', 'Depths', 'Plentiful', 'Farmlands'].includes(line.biome))) { valid = false; errorMessage += `biome invalid: ${line.biome}<br>`; }
				if (!(typeof line.specMod == 'string' && ['0', 'fa', 'lc', 'ssc', 'swc', 'smc', 'src', 'p', 'hc', 'lsc', 'lwc', 'lmc', 'lrc'].includes(line.specMod))) { valid = false; errorMessage += `special mod invalid: ${line.specMod}<br>`; }
				if (!(typeof line.perf == 'boolean')) { valid = false; errorMessage += `perfect maps invalid: ${line.perf}<br>`; }
				if (!(typeof line.extra == 'number' && this.between(line.extra, 0, 10))) { valid = false; errorMessage += `extra levels invalid: ${line.extra}<br>`; }
				if (!(typeof line.offset == 'number' && line.offset <= 0)) { valid = false; errorMessage += `lower level invalid: ${line.offset}<br>`; }
				if (!valid) {
					errorMessage = `Invalid preset data, presets not imported:<br>` + errorMessage
					throw new Error(errorMessage)
				}
				// Check validity for unlocks on the current save, set to valid values, report when changes are made
				if (line.perf && getUnlockZone('perfect') > mazIO.hze + 1) { line.perf = false; errors.add('Perfect Maps') }
				if (line.extra > 0 && getUnlockZone('extra') > mazIO.hze + 1) { line.extra = 0; errors.add('Extra Zones') }
				if (line.specMod != '0' && getUnlockZone('special') > mazIO.hze + 1) { line.specMod = '0'; errors.add('Special Modifiers')}
				if (line.biome == 'Plentiful' && !game.global.decayDone) { line.biome = 'Random'; errors.add('Gardens') }
				if (line.biome == 'Farmlands' && !game.global.farmlandsUnlocked) { line.biome = 'Random'; errors.add('Farmlands') }
				let unlocksAt = game.global.universe == 1 ? 'unlocksAt' : 'unlocksAt2';
				if (line.specMod != '0' && mapSpecialModifierConfig[line.specMod][unlocksAt] > mazIO.hze + 1) { specErrors.add(line.specMod); line.specMod = '0';}
			}
			this.error = (errors.size > 0 ? `Disabling Preset Options: ${[...errors].join(". ")}.<br>` : "" )  + (specErrors.size > 0 ? `Disabling Special Mods: ${[...specErrors].join(", ")}<br>` : "");
			return data
		}
		catch (e) {
			this.error = errorMessage;
			console.debug(e)
			return null
		}
	},
	set error(msg) {
		let elem = document.getElementById('mazIOError')
		if (elem) { 
			if (msg === null) elem.innerHTML = "";
			else elem.innerHTML += msg;
		}
	},
	import() {
		exportElem = document.getElementById('exportArea')
		this.error = null;
		try {
			data = exportElem.value
			data = JSON.parse(data)
		}
		catch {
			this.error = 'Invalid JSON';
			return
		}
		const { universe, maz, presets } = data 
		if (universe == game.global.universe) {
			// TODO only import presets used by the imported maz
			if (readNiceCheckbox(document.getElementById('mazIOPresetCheckbox'))) this.mapPresets = presets
			this.currentMaZ = maz
		}
		else { this.error = 'Preset is from the wrong Universe!' }
		
	},
	between(x, min, max) {
		return min <= x && x <= max
	},
	_smallTooltip2(titleText, tooltipText, costText) {
		const tooltipDiv = document.getElementById('tooltipDiv2');
		swapClass('tooltipExtra', 'tooltipExtraNone', tooltipDiv);

		tooltipDiv.style.left = '33.75%';
		tooltipDiv.style.top = '1%'; // normally 25%, displaced to allow access to the MaZ window underneath
		
		const tipText = document.getElementById('tipText2');
		const tipTitle = document.getElementById('tipTitle2');
		const tipCost = document.getElementById('tipCost2');

		if (tipText.className !== '') tipText.className = '';
		if (tipText.innerHTML !== tooltipText) tipText.innerHTML = tooltipText;
		if (tipTitle.innerHTML !== titleText) tipTitle.innerHTML = titleText;
		if (tipCost.innerHTML !== costText) tipCost.innerHTML = costText;
		tooltipDiv.style.display = 'block';
		tooltipDiv.style.zIndex = 9;
	},
	cancelTooltip2() {
		document.getElementById('tooltipDiv2').style.display = 'none'
		document.getElementById('tipText2').innerHTML = ''
		document.getElementById('tipTitle2').innerHTML = ''
		document.getElementById('tipCost2').innerHTML = ''
	},
	displayExport() {
		let output = { universe: game.global.universe, maz: mazIO.currentMaZ, presets: mazIO.mapPresets }
		output = JSON.stringify(output)
		
		const tooltipText = `This is your Map at Zone loadout string, it's been copied to your clipboard. There are many like it but this one is yours. 
		Save this save somewhere safe so you can save time next time.<br/><br/>
		<textarea id='exportArea' style='width: 100%; resize: none' rows='5'>${output}</textarea>`;
		
		const u2Affix = game.global.totalRadPortals > 0 ? ` ${game.global.totalRadPortals} U${game.global.universe}` : '';
		const saveName = `MAZ Loadout P${game.global.totalPortals}${u2Affix} Z${game.global.world}`;
		const serializedOutput = encodeURIComponent(output);
		
		const costText = `<div class='maxCenter'>
		<button id='confirmTooltipBtn' class='btn btn-info' onclick='mazIO.cancelTooltip2()'>Got it</button>
		<a id='downloadLink' target='_blank' download='${saveName}.txt' href='data:text/plain,${serializedOutput}'>
		<button class='btn btn-danger' id='downloadBtn'>Download as File</button>
		</a>
		</div>
		`;
		this._smallTooltip2('Export MAZ Loadout', tooltipText, costText)

		exportElem = document.getElementById('exportArea')
		exportElem.select()
		document.execCommand('copy')
	},
	displayImport() {
		const tooltipText = `Paste a previously exported MaZ Loadout here. 
		Every effort has been made to ensure that the imported data is correctly formatted, but you may want to make a backup of your save(not MaZ!) anyways, just in case.<br/>
		<div id='mazIOError' style='color: red;'></div>
		<textarea id='exportArea' style='width: 100%; resize: none' rows='5'></textarea>`

		const costText = `<div class='maxCenter'>
		<button id='confirmTooltipBtn' class='btn btn-info' onclick='mazIO.cancelTooltip2()'>Got it</button>
		<button onclick='mazIO.import()' class='btn btn-success'>Import</button>
		<label>${buildNiceCheckbox('mazIOPresetCheckbox', null, false)}Import Presets</label>
		</div>
		`;

		this._smallTooltip2("Import MAZ Loadout", tooltipText, costText)
	}
}

// oh yeah, we're wrapping tooltip. I'm not scared of this at all.
var originaltooltip = tooltip;
tooltip = function () {
	let originalReturn = originaltooltip(...arguments)
	try {
		if (arguments[0] =='Set Map At Zone') {
			let html = `<span style='float: right;'>
			<button class='btn btn-primary btn-md' id='clipBoardBtn' onclick='mazIO.displayExport()'>Export
			</button><button class='btn btn-primary btn-md' id='mazIOImport' onclick='mazIO.displayImport()'>Import
			</button>
			</span>
			`
			let parentDiv = document.querySelector('#tipCost > .maxCenter')
			parentDiv.insertAdjacentHTML('beforeend', html)
		}
	}
	catch (e) { message('Failed to add MaZ Import/Export', 'Loot')}
	return originalReturn
}

