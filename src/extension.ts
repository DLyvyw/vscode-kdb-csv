// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const itemColors = [
        '#ebd9bbff',
        '#acdbbaff',
        '#a9d8d6ff',
        '#dfb3baff',
        '#ebe5afff',
        '#d2bef8',
        '#c2c2c2',
        '#ebebbaff',
        '#c2eaff',
        '#fbc6e3ff',
        '#b4ebf8ff',
        '#dae7a0ff',
        '#fff1c4ff',
        '#fcb7edff',
        '#c8f8beff',
        '#c2c2c2ff',
        '#fdf5e4ff',
        '#f9ffc2ff',
    ];

    const decorationTypes = itemColors.map(color =>
        vscode.window.createTextEditorDecorationType({ color })
    );

    let timeout: NodeJS.Timeout | undefined = undefined;

    let activeEditor = vscode.window.activeTextEditor;

    function updateDecorations(): void {
        if (!activeEditor) {
            return;
        }
        updateCsvDecorations(activeEditor);
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations(true);
            }
        },
        null,
        context.subscriptions
    );


    function updateCsvDecorations(editor: vscode.TextEditor | undefined) {
        if (!editor)
            return;
        const doc = editor.document;
        if (editor.document.languageId === "csv") {
            const text = doc.getText();

            const decorations: vscode.DecorationOptions[][] =
                itemColors.map(() => []);

            const csvRegex = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^,\r\n]*))/gi;
            const result: string[][] = [[]];
            let match;
            let headers: string[] = [];
            let headerLine = true;
            let lineIndex = 0;
            let entryIndex = 0;

            while ((match = csvRegex.exec(text))) {
                if (match[1].length && match[1] !== ',') {
                    result.push([]);
                    headerLine = false;
                    lineIndex++;
                    entryIndex = 0;
                }
                let entry = "";
                if (match[2]) {
                    entry = match[2].replace(/""/g, '"');
                }
                else {
                    if (match[3]) {
                        entry = match[3]
                    }
                }

                if (headerLine) {
                    headers.push(entry)
                }

                result[result.length - 1].push(entry)

                const startPos = editor.document.positionAt(match.index);
                const endPos = editor.document.positionAt(
                    match.index + match[0].length
                );

                const colorIdx = (entryIndex) % decorationTypes.length;
                let range = new vscode.Range(startPos, endPos)

                decorations[colorIdx].push({ range: range, hoverMessage: headers[entryIndex] });

                entryIndex++;
            }

            decorationTypes.forEach((d, i) => {
                editor.setDecorations(d, decorations[i]);
            });
        }
    };
}

// This method is called when your extension is deactivated
export function deactivate() { }
