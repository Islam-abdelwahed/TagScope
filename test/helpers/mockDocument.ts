import * as vscode from 'vscode';

/**
 * Lightweight mock of vscode.TextDocument for unit testing.
 * No VS Code host required.
 */
export function mockDocument(content: string): vscode.TextDocument {
  const lines = content.split('\n');

  const offsetAt = (position: vscode.Position): number => {
    let offset = 0;
    for (let i = 0; i < position.line; i++) {
      offset += lines[i].length + 1; // +1 for \n
    }
    return offset + position.character;
  };

  const positionAt = (offset: number): vscode.Position => {
    let remaining = offset;
    for (let line = 0; line < lines.length; line++) {
      const len = lines[line].length + 1;
      if (remaining < len) {
        return new vscode.Position(line, remaining);
      }
      remaining -= len;
    }
    return new vscode.Position(lines.length - 1, lines[lines.length - 1].length);
  };

  return {
    getText: () => content,
    offsetAt,
    positionAt,
    lineCount: lines.length,
    uri: vscode.Uri.file('/mock/test.xml'),
    fileName: '/mock/test.xml',
    languageId: 'xml',
    version: 1,
    isDirty: false,
    isClosed: false,
    isUntitled: false,
    eol: vscode.EndOfLine.LF,
    encoding: 'utf8',
    lineAt: (lineOrPos: number | vscode.Position) => {
      const lineNum =
        typeof lineOrPos === 'number' ? lineOrPos : lineOrPos.line;
      const text = lines[lineNum] ?? '';
      return {
        lineNumber: lineNum,
        text,
        range: new vscode.Range(lineNum, 0, lineNum, text.length),
        rangeIncludingLineBreak: new vscode.Range(
          lineNum, 0, lineNum, text.length + 1
        ),
        firstNonWhitespaceCharacterIndex: text.search(/\S/),
        isEmptyOrWhitespace: text.trim().length === 0,
      } as vscode.TextLine;
    },
    getWordRangeAtPosition: () => undefined,
    validateRange: (r: vscode.Range) => r,
    validatePosition: (p: vscode.Position) => p,
    save: () => Promise.resolve(true),
  } as unknown as vscode.TextDocument;
}

/**
 * Find the offset of `searchStr` in `content` and return a Position.
 */
export function positionOf(
  document: vscode.TextDocument,
  searchStr: string,
  occurrence = 0
): vscode.Position {
  const text = document.getText();
  let idx = -1;
  for (let i = 0; i <= occurrence; i++) {
    idx = text.indexOf(searchStr, idx + 1);
    if (idx === -1) throw new Error(`"${searchStr}" not found in document`);
  }
  return document.positionAt(idx + Math.floor(searchStr.length / 2));
}
