import * as vscode from 'vscode';
import { commentTagCommand } from './commands/commentTag';
import { commentBlockCommand } from './commands/commentBlock';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'xmlCommenter.commentTag',
      commentTagCommand
    ),
    vscode.commands.registerCommand(
      'xmlCommenter.commentBlock',
      commentBlockCommand
    )
  );
}

export function deactivate(): void {}
