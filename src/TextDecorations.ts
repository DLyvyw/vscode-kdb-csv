

import * as vscode from "vscode";

const itemColors = [
    '#ebd9bbff',
    '#acdbbaff',
    '#a9d8d6ff',
    '#ddc8ccff',
    '#ebe5afff',
    '#d2bef8',
    '#e6c2c2ff',
    '#ebebbaff',
    '#c2eaff',
    '#fbc6e3ff',
    '#b4ebf8ff',
    '#dae7a0ff',
    '#fff1c4ff',
    '#fcb7edff',
    '#c8f8beff',
    '#ddb6b6ff',
    '#fdf5e4ff',
    '#f9ffc2ff',
];



const formatTextDecorationsTypes = [
    vscode.window.createTextEditorDecorationType({ fontWeight: "bold" }),
    vscode.window.createTextEditorDecorationType({ fontStyle: "italic" }),
    vscode.window.createTextEditorDecorationType({ textDecoration: "line-through" }),
    vscode.window.createTextEditorDecorationType({ textDecoration: "underline" }),
];

const boderColorDecorationsTypes = [
    vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
        borderColor: 'blue',
    }),
    vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
        borderColor: 'lightGreen',
	}),
    vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
        borderColor: 'yellow',
	}),
        vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
        borderColor: 'red',
	})
]


const csvDecorationTypes = itemColors.map(color =>
    vscode.window.createTextEditorDecorationType({ color })
);


export function updateCsvDecorations(editor: vscode.TextEditor | undefined) {
    if (!editor)
        return;
    const doc = editor.document;
    if (editor.document.languageId === "csv") {
        const text = doc.getText();

        const csvDecorations: vscode.DecorationOptions[][] = itemColors.map(() => []);
        const formatDecorations: vscode.DecorationOptions[][] = formatTextDecorationsTypes.map(() => []);

        const boderColorDecorations: vscode.DecorationOptions[][] = boderColorDecorationsTypes.map(() => []);

        const csvRegex = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
        const result: string[][] = [[]];
        let csvMatch;
        let headers: string[] = [];
        let headerLine = true;

        //let lineIndex = 0;
        let entryIndex = 0;

        while ((csvMatch = csvRegex.exec(text))) {
            let quotedString = false;
            if (csvMatch[1].length && csvMatch[1] !== ',') {
                result.push([]);
                headerLine = false;
                //lineIndex++;
                entryIndex = 0;
            }
            let entry = "";
            if (csvMatch[2]) {
                entry = csvMatch[2].replace(/""/g, '"');
                quotedString = true;
            }
            else {
                if (csvMatch[3]) {
                    entry = csvMatch[3]
                }
            }

            if (headerLine) {
                headers.push(entry)
            }

            result[result.length - 1].push(entry)

            const csvEntryStartPos = editor.document.positionAt(csvMatch.index + 1);
            const csvEntryEndPos = editor.document.positionAt(
                csvMatch.index + csvMatch[0].length
            );

            const colorIdx = (entryIndex) % csvDecorationTypes.length;
            let range = new vscode.Range(csvEntryStartPos, csvEntryEndPos)

            // csv decorations
            csvDecorations[colorIdx].push({ range: range, hoverMessage: headers[entryIndex] });
            entryIndex++;
            if (quotedString) {
                let formatTextRegex = /((\*|_|-|\+)\2?)(?!(\s|\*))((?:[\s*]*(?:\\[\\*]|[^\\\s*]))+?)\1/gm;
                let formatTextMatch;
                while ((formatTextMatch = formatTextRegex.exec(csvMatch[0]))) {
                    const formatTextStartPos = editor.document.positionAt(
                        csvMatch.index + formatTextMatch.index
                    );
                    const formatTextEndPos = editor.document.positionAt(
                        csvMatch.index + formatTextMatch.index + formatTextMatch[0].length
                    );

                    if (formatTextMatch[1] === "**" || formatTextMatch[1] === "__") {
                        formatDecorations[0].push({
                            range: new vscode.Range(formatTextStartPos, formatTextEndPos)
                        });
                    }
                    else if (formatTextMatch[1] === "*" || formatTextMatch[1] === "_") {
                        formatDecorations[1].push({
                            range: new vscode.Range(formatTextStartPos, formatTextEndPos)
                        });
                    }
                    else if (formatTextMatch[1] === "-") {
                        formatDecorations[2].push({
                            range: new vscode.Range(formatTextStartPos, formatTextEndPos)
                        });
                    }
                    else if (formatTextMatch[1] === "+") {
                        formatDecorations[3].push({
                            range: new vscode.Range(formatTextStartPos, formatTextEndPos)
                        });
                    }
                }

                let symbolRegex = /\([+-?i/x!]\)/gm;
                let symbolMatch;
                while ((symbolMatch = symbolRegex.exec(csvMatch[0]))) {
                    const symbolTextStartPos = editor.document.positionAt(
                        csvMatch.index + symbolMatch.index
                    );
                    const symbolTextEndPos = editor.document.positionAt(
                        csvMatch.index + symbolMatch.index + symbolMatch[0].length
                    );

                    if (symbolMatch[0] === "(i)" || symbolMatch[0] === "(?)") {
                        boderColorDecorations[0].push({
                            range: new vscode.Range(symbolTextStartPos, symbolTextEndPos)
                        });
                    }
                    else if (symbolMatch[0] === "(+)" || symbolMatch[0] === "(/)") {
                        boderColorDecorations[1].push({
                            range: new vscode.Range(symbolTextStartPos, symbolTextEndPos)
                        });
                    }
                    else if (symbolMatch[0] === "(!)") {
                        boderColorDecorations[2].push({
                            range: new vscode.Range(symbolTextStartPos, symbolTextEndPos)
                        });
                    }
                    else if (symbolMatch[0] === "(x)" || symbolMatch[0] === "(-)"){
                        boderColorDecorations[3].push({
                            range: new vscode.Range(symbolTextStartPos, symbolTextEndPos)
                        });
                    }
                }
            }
        }

        csvDecorationTypes.forEach((d, i) => {
            editor.setDecorations(d, csvDecorations[i]);
        });
        formatTextDecorationsTypes.forEach((d, i) => {
            editor.setDecorations(d, formatDecorations[i]);
        });
        boderColorDecorationsTypes.forEach((d, i) => {
            editor.setDecorations(d, boderColorDecorations[i]);
        });



    }
};