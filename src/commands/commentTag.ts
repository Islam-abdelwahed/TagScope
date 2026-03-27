import * as vscode from 'vscode';
import { TagParser } from '../core/TagParser';
import { CommentWriter } from '../core/CommentWriter';

const parser = new TagParser();
const writer = new CommentWriter();


export async function commentTagCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const { document, selection } = editor;
  const tag = parser.findTagAtCursor(document, selection.active);

  if (!tag) {
    vscode.window.showInformationMessage(
      'XML Commenter: No tag found at cursor position.'
    );
    return;
  }

  const edit = new vscode.WorkspaceEdit();
  writer.toggleTagComment(edit, document, tag);
  await vscode.workspace.applyEdit(edit);
}
