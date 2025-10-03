// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { updateCsvDecorations } from './TextDecorations';
import { listInsertNewItem } from './TextEditorActions';
import { CsvDocumentSymbolProvider } from './SymbolProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

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

    context.subscriptions.push(
        vscode.commands.registerTextEditorCommand(
            "kdbCsv.onKeyPressEnter",
            (textEditor, edit): void => {
                listInsertNewItem(textEditor, edit);
            }
        )
    );

    vscode.languages.registerDocumentSymbolProvider(
        { scheme: "file", language: "csv" },
        new CsvDocumentSymbolProvider()
    );


}

// This method is called when your extension is deactivated
export function deactivate() { }
