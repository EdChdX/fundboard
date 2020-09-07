/*
To-do:
1. When parsing CSV, cell number of each line must obey the cell number of first lines
2. When parsing TSV, cell number will first be defined by "tsvmod.cells", then by the max number of title cells, and at last by the cell number of the line which has the most cells
3. Quick Markdown form parsing
*/

"use strict";

var tableElement, tableBody = false, sheetHandler, displayed = false;

// Pre-announce
var loadBlob = function (blobs) {
	let actionBlob = blobs[blobs.length - 1];
	console.info(actionBlob);
	// Should be disabled once finished dev cycle
	self.blobExpose = actionBlob;
	if (!displayed) {
		tableElement = document.createElement("table");
		if (tableBody) {
			tableBody.remove();
			tableBody = false;
		};
		tableBody = tableElement.createTBody();
		actionBlob.get("text").then((t) => {
			sheetHandler = new SheetParser(t);
			let nameParts = actionBlob.name.split(".");
			try {
				sheetHandler.import[nameParts[nameParts.length - 1].toLowerCase()]();
				sheetHandler.sheet.forEach((e1) => {
					let tableLine = document.createElement("tr");
					e1.forEach((e2) => {
						let tableCell = document.createElement("td");
						tableCell.innerText = e2;
						tableLine.appendChild(tableCell);
					});
					tableBody.appendChild(tableLine);
				});
				if (!displayed) {
					document.body.appendChild(tableElement);
					displayed = true;
				};
			} catch (err) {
				let y1 = err.stack;
				while (y1.indexOf("\n") != -1) {
					y1 = y1.replace("\n", "<br/>");
				};
				document.body.innerHTML = y1;
			};
		});
	};
};

// Interactive
document.addEventListener("readystatechange", function () {
	// Response to dragging
	document.body.addEventListener("dragenter", function (e) {
		e.preventDefault();
		e.stopPropagation();
	}, true);
	document.body.addEventListener("dragover", function (e) {
		e.preventDefault();
		e.stopPropagation();
	}, true);
	document.body.addEventListener("dragleave", function (e) {
		e.preventDefault();
		e.stopPropagation();
	}, true);
	document.body.addEventListener("drop", function (e) {
		e.preventDefault();
		e.stopPropagation();
		let df = e.dataTransfer;
		loadBlob(df.files);
	}, true);
});
