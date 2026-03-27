import * as vscode from 'vscode';

export interface TagInfo {
  name: string;
  openRange: vscode.Range;
  closeRange: vscode.Range;
}

export interface BlockInfo extends TagInfo {
  contentRange: vscode.Range;
  fullRange: vscode.Range;
}

export type CommentMode = 'tag-only' | 'full-block';

export interface ParseResult {
  tag: TagInfo;
  isAlreadyCommented: boolean;
}
