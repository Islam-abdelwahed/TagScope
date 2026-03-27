import * as assert from 'assert';
import * as vscode from 'vscode';
import { CommentWriter } from '../src/core/CommentWriter';
import { TagParser } from '../src/core/TagParser';
import { mockDocument, positionOf } from './helpers/mockDocument';

suite('CommentWriter', () => {
  const parser = new TagParser();
  const writer = new CommentWriter();

  /**
   * Apply a WorkspaceEdit to a document string and return the mutated string.
   * Sorts edits in reverse document order so applying from the end is safe
   * (earlier offsets aren't shifted by later inserts).
   */
  function applyEdit(
    originalText: string,
    edit: vscode.WorkspaceEdit
  ): string {
    const doc = mockDocument(originalText);
    const entries = edit.entries();
    if (entries.length === 0) return originalText;

    const textEdits: vscode.TextEdit[] = entries
      .flatMap(([, edits]) => edits)
      .sort((a, b) => {
        const aStart = doc.offsetAt(a.range.start);
        const bStart = doc.offsetAt(b.range.start);
        // Reverse order — process end of document first
        if (bStart !== aStart) return bStart - aStart;
        // Tie-break: inserts (empty range) after replaces at same offset
        const aLen = doc.offsetAt(a.range.end) - aStart;
        const bLen = doc.offsetAt(b.range.end) - bStart;
        return aLen - bLen;
      });

    let result = originalText;
    for (const te of textEdits) {
      const start = doc.offsetAt(te.range.start);
      const end   = doc.offsetAt(te.range.end);
      result = result.slice(0, start) + te.newText + result.slice(end);
    }
    return result;
  }

  // ─── toggleTagComment ─────────────────────────────────────────────────────

  suite('toggleTagComment', () => {

    test('adds comments to open and close tags', () => {
      const src = '<root><item>value</item></root>';
      const doc = mockDocument(src);
      const tag = parser.findTagAtCursor(doc, positionOf(doc, '<item>'))!;

      const edit = new vscode.WorkspaceEdit();
      writer.toggleTagComment(edit, doc, tag);
      const result = applyEdit(src, edit);

      assert.strictEqual(result, '<root><!-- <item> -->value<!-- </item> --></root>');
    });

    test('removes comments from already-commented open and close tags', () => {
      const src = '<root><!-- <item> -->value<!-- </item> --></root>';
      const doc = mockDocument(src);
      const tag = parser.findTagAtCursor(doc, positionOf(doc, '<item>'))!;

      const edit = new vscode.WorkspaceEdit();
      writer.toggleTagComment(edit, doc, tag);
      const result = applyEdit(src, edit);

      assert.strictEqual(result, '<root><item>value</item></root>');
    });

    test('is idempotent: comment then uncomment returns original', () => {
      const src = '<wrapper><child>hello</child></wrapper>';

      // First toggle: add comments
      const doc1 = mockDocument(src);
      const tag1 = parser.findTagAtCursor(doc1, positionOf(doc1, '<child>'))!;
      const edit1 = new vscode.WorkspaceEdit();
      writer.toggleTagComment(edit1, doc1, tag1);
      const commented = applyEdit(src, edit1);

      // Second toggle: remove comments
      const doc2 = mockDocument(commented);
      const tag2 = parser.findTagAtCursor(doc2, positionOf(doc2, '<child>'))!;
      const edit2 = new vscode.WorkspaceEdit();
      writer.toggleTagComment(edit2, doc2, tag2);
      const result = applyEdit(commented, edit2);

      assert.strictEqual(result, src);
    });
  });

  // ─── toggleBlockComment ───────────────────────────────────────────────────

  suite('toggleBlockComment', () => {

    test('wraps entire block in a single comment', () => {
      const src = '<root><section>content</section></root>';
      const doc = mockDocument(src);
      const tag = parser.findTagAtCursor(doc, positionOf(doc, '<section>'))!;
      const block = parser.buildBlockInfo(doc, tag);

      const edit = new vscode.WorkspaceEdit();
      writer.toggleBlockComment(edit, doc, block);
      const result = applyEdit(src, edit);

      assert.strictEqual(
        result,
        '<root><!-- <section>content</section> --></root>'
      );
    });

    test('removes block comment when already commented', () => {
      const src = '<root><!-- <section>content</section> --></root>';
      const doc = mockDocument(src);
      const tag = parser.findTagAtCursor(doc, positionOf(doc, '<section>'))!;
      const block = parser.buildBlockInfo(doc, tag);

      const edit = new vscode.WorkspaceEdit();
      writer.toggleBlockComment(edit, doc, block);
      const result = applyEdit(src, edit);

      assert.strictEqual(result, '<root><section>content</section></root>');
    });

    test('handles multiline block content', () => {
      const src = '<div>\n  <p>line one</p>\n  <p>line two</p>\n</div>';
      const doc = mockDocument(src);
      const tag = parser.findTagAtCursor(doc, positionOf(doc, '<div>'))!;
      const block = parser.buildBlockInfo(doc, tag);

      const edit = new vscode.WorkspaceEdit();
      writer.toggleBlockComment(edit, doc, block);
      const result = applyEdit(src, edit);

      assert.ok(result.startsWith('<!-- <div>'));
      assert.ok(result.endsWith('</div> -->'));
    });

    test('is idempotent: comment then uncomment returns original', () => {
      const src = '<config><timeout>30</timeout></config>';

      const doc1 = mockDocument(src);
      const tag1 = parser.findTagAtCursor(doc1, positionOf(doc1, '<timeout>'))!;
      const block1 = parser.buildBlockInfo(doc1, tag1);
      const edit1 = new vscode.WorkspaceEdit();
      writer.toggleBlockComment(edit1, doc1, block1);
      const commented = applyEdit(src, edit1);

      const doc2 = mockDocument(commented);
      const tag2 = parser.findTagAtCursor(doc2, positionOf(doc2, '<timeout>'))!;
      const block2 = parser.buildBlockInfo(doc2, tag2);
      const edit2 = new vscode.WorkspaceEdit();
      writer.toggleBlockComment(edit2, doc2, block2);
      const result = applyEdit(commented, edit2);

      assert.strictEqual(result, src);
    });
  });
});
