"use strict";

var SheetParser = function (text, solid = false) {
	let rawText = "";
	let objectSolid = solid;
	let upThis = this;
	this.sheet = [[]];
	this.config = new Map();
	// Make the sheet be unified
	// Basic IO interface
	this.getRaw = function () {
		return rawText;
	};
	this.setRaw = function (txt = "") {
		if (objectSolid) {
			throw(new Error("Cannot change raw text of solidified object"));
		} else {
			while (txt.indexOf("\u000d\u000a") != -1) {
				txt = txt.replace("\u000d\u000a", "\n");
			};
			rawText = txt;
			this.config = new Map();
		};
		return this;
	};
	// Set initial rawText
	this.setRaw(text);
	// Clears all things
	this.reset = function () {
		if (objectSolid) {
			throw(new Error("Cannot reset solidified object"));
		} else {
			this.setRaw("");
			this.sheet = [[]];
		};
		return this;
	};
	// Gets the title line index
	this.getTitle = function () {
		let candidates = [0];
		switch (this.config.get("format")) {
			case "tsv": {
				let arr = (this.config.get("tsvmod.titles") || "0").split(",");
				arr.forEach((e, i, a) => {
					a[i] = parseInt(e);
				});
				candidates = arr;
				break;
			};
		};
		return candidates;
	};
	// Import interface
	this.import = {};
	this.import.csv = function (customSeperator) {
		upThis.config.set("format", "csv");
		let rawlines = rawText.split("\n");
		let ignored = ["#", "//"];
		let sep = customSeperator || ",";
		let lines = [];
		rawlines.forEach((e) => {
			let factor = false;
			ignored.forEach((e1) => {
				if (!factor) {
					factor = (e.indexOf(e1) == 0);
				};
			});
			if (!factor) {
				lines.push(e.split(sep));
			};
		});
		rawlines = undefined;
		upThis.sheet = lines;
		return upThis;
	};
	this.import.md = function () {
		console.warn("Wait to be implemented.");
	};
	this.import.tsv = function () {
		upThis.config.set("format", "tsv");
		let rawlines = rawText.split("\n");
		let ignored = ["#", "//"];
		let lines = [];
		let ignoredlines = [];
		rawlines.forEach((e) => {
			let factor = false;
			let exact = "";
			ignored.forEach((e1) => {
				if (!factor) {
					factor = (e.indexOf(e1) == 0);
					exact = e1;
				};
			});
			if (factor) {
				ignoredlines.push(e.replace(exact, ""));
			} else {
				lines.push(e);
			};
		});
		rawlines = undefined;
		if (self.debugMode) {
			console.info(ignoredlines);
		};
		// Parse configs
		let igmode = 0;
		ignoredlines.forEach((e) => {
			switch (igmode) {
				case 0: {
					// Initial state
					if (e == "[start conf]") {
						igmode = 1;
					};
					break;
				};
				case 1: {
					// Parsing configs
					if (e == "[end conf]") {
						igmode = 0;
					} else {
						let confline = e.split("=");
						upThis.config.set(confline[0], confline[1]);
					};
					break;
				};
				default: {
					throw(new Error("Unknown igmode"));
				};
			}
		});
		// Final parse
		lines.forEach((e, i, a) => {
			if (upThis.config.get("tsvmod.flextabs") == "1") {
				while (e.indexOf("\t\t") != -1) {
					e = e.replace("\t\t", "\t");
				};
			};
			a[i] = e.split("\t");
		});
		upThis.sheet = lines;
		return upThis;
	};
};
