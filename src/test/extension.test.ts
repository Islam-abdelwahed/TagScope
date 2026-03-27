// import * as assert from 'assert';
// import { TagParser } from '../src/core/TagParser';
// import { mockDocument, positionOf } from './helpers/mockDocument';

// suite('TagParser', () => {
//   const parser = new TagParser();

//   // ─── findTagAtCursor ──────────────────────────────────────────────────────

//   suite('findTagAtCursor', () => {

//     test('finds a simple tag when cursor is on the open tag', () => {
//       const doc = mockDocument('<root><child>text</child></root>');
//       const pos = positionOf(doc, '<child>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag, 'Expected a tag to be found');
//       assert.strictEqual(tag.name, 'child');
//     });

//     test('finds the outer tag when cursor is on it', () => {
//       const doc = mockDocument('<root><child>text</child></root>');
//       const pos = positionOf(doc, '<root>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag);
//       assert.strictEqual(tag.name, 'root');
//     });

//     test('returns null when cursor is in text content', () => {
//       const doc = mockDocument('<root>hello world</root>');
//       // Position cursor in the middle of "hello world"
//       const pos = doc.positionAt(doc.getText().indexOf('hello') + 3);
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.strictEqual(tag, null);
//     });

//     test('returns null for self-closing tags', () => {
//       const doc = mockDocument('<root><br /></root>');
//       const pos = positionOf(doc, '<br />');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.strictEqual(tag, null);
//     });

//     test('returns null for closing tags', () => {
//       const doc = mockDocument('<root></root>');
//       const pos = positionOf(doc, '</root>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.strictEqual(tag, null);
//     });

//     test('handles tags with attributes', () => {
//       const doc = mockDocument('<div class="foo" id="bar">content</div>');
//       const pos = positionOf(doc, '<div');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag);
//       assert.strictEqual(tag.name, 'div');
//     });

//     test('handles hyphenated tag names', () => {
//       const doc = mockDocument('<my-component>content</my-component>');
//       const pos = positionOf(doc, '<my-component>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag);
//       assert.strictEqual(tag.name, 'my-component');
//     });

//     test('correctly handles nested tags of the same name', () => {
//       const doc = mockDocument('<ul><ul><li>inner</li></ul></ul>');
//       const pos = positionOf(doc, '<ul>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag);
//       assert.strictEqual(tag.name, 'ul');

//       const fullText = doc.getText();
//       const closeOffset = doc.offsetAt(tag.closeRange.start);
//       // Should match the OUTER closing </ul>, not the inner one
//       assert.strictEqual(fullText.slice(closeOffset), '</ul>');
//     });

//     test('open and close ranges are correct', () => {
//       const doc = mockDocument('<item>value</item>');
//       const pos = positionOf(doc, '<item>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag);
//       const text = doc.getText();
//       const openText = text.slice(
//         doc.offsetAt(tag.openRange.start),
//         doc.offsetAt(tag.openRange.end)
//       );
//       const closeText = text.slice(
//         doc.offsetAt(tag.closeRange.start),
//         doc.offsetAt(tag.closeRange.end)
//       );

//       assert.strictEqual(openText, '<item>');
//       assert.strictEqual(closeText, '</item>');
//     });

//     test('works with multiline content', () => {
//       const doc = mockDocument(
//         '<section>\n  <p>paragraph</p>\n</section>'
//       );
//       const pos = positionOf(doc, '<section>');
//       const tag = parser.findTagAtCursor(doc, pos);

//       assert.ok(tag);
//       assert.strictEqual(tag.name, 'section');
//     });
//   });

//   // ─── buildBlockInfo ───────────────────────────────────────────────────────

//   suite('buildBlockInfo', () => {

//     test('fullRange spans from open start to close end', () => {
//       const doc = mockDocument('<root>content</root>');
//       const pos = positionOf(doc, '<root>');
//       const tag = parser.findTagAtCursor(doc, pos)!;
//       const block = parser.buildBlockInfo(doc, tag);

//       const fullText = doc.getText().slice(
//         doc.offsetAt(block.fullRange.start),
//         doc.offsetAt(block.fullRange.end)
//       );
//       assert.strictEqual(fullText, '<root>content</root>');
//     });

//     test('contentRange contains only the inner text', () => {
//       const doc = mockDocument('<root>hello</root>');
//       const pos = positionOf(doc, '<root>');
//       const tag = parser.findTagAtCursor(doc, pos)!;
//       const block = parser.buildBlockInfo(doc, tag);

//       const content = doc.getText().slice(
//         doc.offsetAt(block.contentRange.start),
//         doc.offsetAt(block.contentRange.end)
//       );
//       assert.strictEqual(content, 'hello');
//     });
//   });
// });