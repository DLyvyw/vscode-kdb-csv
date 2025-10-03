
import * as vscode from "vscode";

export function listInsertNewItem(
    textEditor: vscode.TextEditor,
    edit: vscode.TextEditorEdit
) {
    if (textEditor) {
        const currentLine = textEditor.document.lineAt(
            textEditor.selection.active.line
        ).text;
        const regEx = /(^\s*(?:(\*|-|\d+|>)\.? )?)(.*)?/;
        const matchLine = regEx.exec(currentLine);
        if (matchLine && matchLine[1]) {
            if (matchLine[3]) {
                let newListLine = matchLine[1];
                const numOrNan = parseInt(matchLine[2]);
                if (!isNaN(numOrNan)) {
                    newListLine = newListLine.replace(matchLine[2], String(numOrNan + 1));
                }
                edit.insert(textEditor.selection.active, "\n" + newListLine);

            } else {
                edit.delete(
                    new vscode.Range(
                        new vscode.Position(textEditor.selection.active.line, 0),
                        textEditor.selection.active
                    )
                );
            }
        } else {
            edit.insert(textEditor.selection.active, "\n");
        }
    }
}
