import * as vscode from 'vscode';
import { TagParser } from '../core/TagParser';
import { CommentWriter } from '../core/CommentWriter';

const parser = new TagParser();
const writer = new CommentWriter();

export async function commentBlockCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { document, selection } = editor;
  const tag = parser.findTagAtCursor(document, selection.active);

  if (!tag) {
    vscode.window.showInformationMessage(
      'XML Commenter: No tag found at cursor position.'
    );
    return;
  }

  const block = parser.buildBlockInfo(document, tag);
  const edit = new vscode.WorkspaceEdit();
  writer.toggleBlockComment(edit, document, block);
  await vscode.workspace.applyEdit(edit);
}
