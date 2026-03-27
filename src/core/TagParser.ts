import * as vscode from 'vscode';
import { TagInfo, BlockInfo } from './types';

export class TagParser {

  findTagAtCursor(
    document: vscode.TextDocument,
    position: vscode.Position
  ): TagInfo | null {
    const text = document.getText();
    const offset = document.offsetAt(position);

    const openStart = this.findOpenBracketBefore(text, offset);
    if (openStart === -1) return null;

    const openEnd = text.indexOf('>', openStart);
    if (openEnd === -1) return null;

    if (offset > openEnd + 1) return null;

    const rawTag = text.slice(openStart, openEnd + 1);

    if (
      rawTag.startsWith('</') ||
      rawTag.startsWith('<!') ||
      rawTag.startsWith('<?') ||
      rawTag.endsWith('/>')
    ) {
      return null;
    }

    const nameMatch = rawTag.match(/^<([A-Za-z][A-Za-z0-9\-_.:]*)/);
    if (!nameMatch) return null;

    const name = nameMatch[1];
    const openRange = new vscode.Range(
      document.positionAt(openStart),
      document.positionAt(openEnd + 1)
    );

    const closeRange = this.findMatchingCloseTag(
      document,
      text,
      name,
      openEnd + 1
    );

    if (!closeRange) return null;

    return { name, openRange, closeRange };
  }

  buildBlockInfo(document: vscode.TextDocument, tag: TagInfo): BlockInfo {
    return {
      ...tag,
      contentRange: new vscode.Range(tag.openRange.end, tag.closeRange.start),
      fullRange: new vscode.Range(tag.openRange.start, tag.closeRange.end),
    };
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private findOpenBracketBefore(text: string, from: number): number {
    for (let i = from; i >= 0; i--) {
      const ch = text[i];
      if (ch === '<') return i;
      if (ch === '>' && i !== from) return -1;
    }
    return -1;
  }

  private findMatchingCloseTag(
    document: vscode.TextDocument,
    text: string,
    name: string,
    fromOffset: number
  ): vscode.Range | null {

    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const openPattern = new RegExp(`<${escaped}[\\s>/]`, 'g');
    const closePattern = new RegExp(`</${escaped}\\s*>`, 'g');

    let depth = 1;
    let cursor = fromOffset;

    while (depth > 0) {
      openPattern.lastIndex = cursor;
      closePattern.lastIndex = cursor;

      const nextOpen = openPattern.exec(text);
      const nextClose = closePattern.exec(text);

      if (!nextClose) return null;

      const openIndex = nextOpen?.index ?? Infinity;
      const closeIndex = nextClose.index;

      if (openIndex < closeIndex) {
        
        const tagEnd = text.indexOf('>', openIndex);
        if (tagEnd !== -1 && text[tagEnd - 1] !== '/') {
          depth++;
        }
        cursor = openIndex + 1;
      } else {
        depth--;
        if (depth === 0) {
          const matchStart = closeIndex;
          const matchEnd = closeIndex + nextClose[0].length;
          return new vscode.Range(
            document.positionAt(matchStart),
            document.positionAt(matchEnd)
          );
        }
        cursor = closeIndex + 1;
      }
    }

    return null;
  }
}
