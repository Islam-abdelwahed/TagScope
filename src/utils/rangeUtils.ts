import * as vscode from 'vscode';

export function expandRange(
  document: vscode.TextDocument,
  range: vscode.Range,
  before: number,
  after: number
): vscode.Range {
  const text = document.getText();
  const startOffset = Math.max(0, document.offsetAt(range.start) - before);
  const endOffset = Math.min(
    text.length,
    document.offsetAt(range.end) + after
  );
  return new vscode.Range(
    document.positionAt(startOffset),
    document.positionAt(endOffset)
  );
}

export function textOfRange(
  document: vscode.TextDocument,
  range: vscode.Range
): string {
  const text = document.getText();
  const start = document.offsetAt(range.start);
  const end = document.offsetAt(range.end);
  return text.slice(start, end);
}

export function charsBefore(
  document: vscode.TextDocument,
  range: vscode.Range,
  n: number
): string {
  const text = document.getText();
  const end = document.offsetAt(range.start);
  const start = Math.max(0, end - n);
  return text.slice(start, end);
}

export function charsAfter(
  document: vscode.TextDocument,
  range: vscode.Range,
  n: number
): string {
  const text = document.getText();
  const start = document.offsetAt(range.end);
  const end = Math.min(text.length, start + n);
  return text.slice(start, end);
}

export function rangesEqual(a: vscode.Range, b: vscode.Range): boolean {
  return a.start.isEqual(b.start) && a.end.isEqual(b.end);
}
