import * as vscode from 'vscode';
import { TagInfo, BlockInfo } from './types';
import { charsBefore, charsAfter, expandRange } from '../utils/rangeUtils';

const OPEN  = '<!-- ';
const CLOSE = ' -->';
const OPEN_LEN  = OPEN.length;  
const CLOSE_LEN = CLOSE.length;  


export class CommentWriter {

  toggleTagComment(
    edit: vscode.WorkspaceEdit,
    document: vscode.TextDocument,
    tag: TagInfo
  ): void {
    if (this.isCommented(document, tag.openRange)) {
      this.uncomment(edit, document, tag.openRange);
      this.uncomment(edit, document, tag.closeRange);
    } else {
      this.comment(edit, document.uri, tag.openRange);
      this.comment(edit, document.uri, tag.closeRange);
    }
  }

  toggleBlockComment(
    edit: vscode.WorkspaceEdit,
    document: vscode.TextDocument,
    block: BlockInfo
  ): void {
    if (this.isCommented(document, block.fullRange)) {
      this.uncomment(edit, document, block.fullRange);
    } else {
      this.comment(edit, document.uri, block.fullRange);
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private comment(
    edit: vscode.WorkspaceEdit,
    uri: vscode.Uri,
    range: vscode.Range
  ): void {
    edit.insert(uri, range.start, OPEN);
    edit.insert(uri, range.end,   CLOSE);
  }

  private uncomment(
    edit: vscode.WorkspaceEdit,
    document: vscode.TextDocument,
    range: vscode.Range
  ): void {
    const expanded = expandRange(document, range, OPEN_LEN, CLOSE_LEN);
    const inner    = document.getText(range);
    edit.replace(document.uri, expanded, inner);
  }

  private isCommented(
    document: vscode.TextDocument,
    range: vscode.Range
  ): boolean {
    return (
      charsBefore(document, range, OPEN_LEN)  === OPEN &&
      charsAfter(document,  range, CLOSE_LEN) === CLOSE
    );
  }
}
