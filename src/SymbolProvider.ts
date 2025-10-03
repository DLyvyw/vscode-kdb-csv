import * as vscode from "vscode";
export class CsvDocumentSymbolProvider
    implements vscode.DocumentSymbolProvider {
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): Promise<vscode.DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            let symbols: vscode.DocumentSymbol[] = [];
            let secondLine = document.lineAt(1);
            let lastLine = document.lineAt(document.lineCount - 1);
            
            let firstLine = document.lineAt(0);
            let range = new vscode.Range(firstLine.range.start, lastLine.range.end);
            let header = new vscode.DocumentSymbol(
                "header",
                "",
                vscode.SymbolKind.File,
                range,
                range
            );
            symbols.push(header);
            

             range = new vscode.Range(firstLine.range.start, lastLine.range.end);
            let content = new vscode.DocumentSymbol(
                "content",
                "",
                vscode.SymbolKind.Array,
                range,
                range
            );
            symbols.push(content);

            resolve(symbols);
        });
    }
}
