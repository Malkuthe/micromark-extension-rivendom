import test from 'tape';
import micromark from 'micromark/lib/index.js';
import syntax from './index.js';
import html from './html.js';

test('micromark-extension-rivendom (syntax)', (t) => {
  t.test('tag types', (t) => {
    t.equal(micromark('[:a]{b}(c)', options({
      '*': h,
    })),
    '<p><a><attr>b</attr><label>c</label></a></p>',
    'support valid syntax');

    t.equal(micromark('[:   a   ]{b}(c)', options({
      '*': h,
    })),
    '<p><a><attr>b</attr><label>c</label></a></p>',
    'should strip spaces');

    t.equal(micromark('[:a d]{b}(c)', options({
      '*': h,
    })),
    '<p>[:a d]{b}(c)</p>',
    'should not support names containing spaces');

    t.equal(micromark('[:a&d]{b}(c)', options({
      '*': h,
    })),
    '<p>[:a&amp;d]{b}(c)</p>',
    'should not support names containing symbols');

    t.equal(micromark('[:a-]{b}(c)', options({
      '*': h,
    })),
    '<p>[:a-]{b}(c)</p>',
    'should not support names ending in `-`');

    t.equal(micromark('[:a_]{b}(c)', options({
      '*': h,
    })),
    '<p>[:a_]{b}(c)</p>',
    'should not support names ending in `_`');

    t.equal(micromark('[:a_b-c]{d}(e)', options({
      '*': h,
    })),
    '<p><a_b-c><attr>d</attr><label>e</label></a_b-c></p>',
    'should support names containing `-` and `_`');

    t.end();
  });

  t.test('unquoted named attributes', (t) => {
    t.equal(micromark('[:a]{b=c d}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b=c d}(e)</p>',
    'should not support values with spaces');

    t.equal(micromark('[:a]{b=c&d}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b=c&amp;d}(e)</p>',
    'should not support values with unsafe html characters');

    t.equal(micromark('[:a]{b-=1}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b-=1}(e)</p>',
    'should not support attribute names that end in `-`');

    t.equal(micromark('[:a]{\nb=1}(e)', options({
      '*': h,
    })),
    '<p>[:a]{\nb=1}(e)</p>',
    'should not support attribute names with newlines');

    t.equal(micromark('[:a]{b=\n1}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b=\n1}(e)</p>',
    'should not support attribute values with newlines');

    t.equal(micromark('[:a]{b_=1}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b_=1}(e)</p>',
    'should not support attribute names that end in `_`');

    t.equal(micromark('[:a]{b&c=1}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b&amp;c=1}(e)</p>',
    'should not support attribute names that contain a symbol');

    t.equal(micromark('[:a]{b-c_d=1}(e)', options({
      '*': h,
    })),
    '<p><a><attr><name>b-c_d</name><value>1</value></attr><label>e</label></a></p>',
    'should support attribute names that contain `-` and `_`');

    t.equal(micromark('[:a]{b c=1}(e)', options({
      '*': h,
    })),
    '<p>[:a]{b c=1}(e)</p>',
    'should not support attribute names that have a space');

    t.equal(micromark('[:a]{   b   =1}(c)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><label>c</label></a></p>',
    'should strip whitespaces from attribute name');

    t.equal(micromark('[:a]{b=    1    }(c)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><label>c</label></a></p>',
    'should strip whitespaces from attribute value');

    t.equal(micromark('[:a]{    b    =    1    }(c)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><label>c</label></a></p>',
    'should strip whitespaces from attribute name & value');

    t.equal(micromark('[:a]{b=1}(c)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><label>c</label></a></p>',
    'should support label');

    t.equal(micromark('[:a]{b=1}', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr></a></p>',
    'should support no label');

    t.equal(micromark('[:a]{b=1|c=2}(d)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><attr><name>c</name><value>2</value></attr><label>d</label></a></p>',
    'should support multiple with label');

    t.equal(micromark('[:a]{b=1|c=2}', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><attr><name>c</name><value>2</value></attr></a></p>',
    'should support multiple without label');

    t.end();
  });

  t.test('quoted named attributes', (t) => {
    t.equal(micromark('[:a]{b="c"}(d)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>c</value></attr><label>d</label></a></p>',
    'Should support quoted value with label');

    t.equal(micromark('[:a]{b="c"}', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>c</value></attr></a></p>',
    'Should support quoted value without label');

    t.equal(micromark('[:a]{b="1"|c="2"}(d)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><attr><name>c</name><value>2</value></attr><label>d</label></a></p>',
    'Should support multiple quoted values with label');

    t.equal(micromark('[:a]{b="1"|c="2"}', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><attr><name>c</name><value>2</value></attr></a></p>',
    'Should support multiple quoted values without label');

    t.equal(micromark('[:a]{b=   "c"   }(d)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>c</value></attr><label>d</label></a></p>',
    'Should strip spaces around quoted value');

    t.equal(micromark('[:a]{b="c d"}(e)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>c d</value></attr><label>e</label></a></p>',
    'Should support spaces inside quoted value');

    t.equal(micromark('[:a]{b="c&d"}(e)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>c&#x26;d</value></attr><label>e</label></a></p>',
    'Should support symbols inside quoted value');

    t.end();
  });

  t.test('mixed named attributes', (t) => {
    t.equal(micromark('[:a]{b="1"|c=2}(d)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><attr><name>c</name><value>2</value></attr><label>d</label></a></p>',
    'Should support mixed with label');

    t.equal(micromark('[:a]{b="1"|c=2}', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1</value></attr><attr><name>c</name><value>2</value></attr></a></p>',
    'Should support mixed without label');

    t.end();
  });

  t.test('unquoted unnamed attributes', (t) => {
    t.equal(micromark('[:a]{b c}(d)', options({
      '*': h,
    })),
    '<p>[:a]{b c}(d)</p>',
    'should not support unquoted unnamed attribute with spaces');

    t.equal(micromark('[:a]{b&c}(d)', options({
      '*': h,
    })),
    '<p>[:a]{b&amp;c}(d)</p>',
    'should not support unquoted unnamed attributes with unsafe html characters');

    t.equal(micromark('[:a]{b}(c)', options({
      '*': h,
    })), '<p><a><attr>b</attr><label>c</label></a></p>', 'should support unnamed unquoted attribute with label');

    t.equal(micromark('[:a]{b}', options({
      '*': h,
    })), '<p><a><attr>b</attr></a></p>', 'should support unnamed unquoted attribute without label');

    t.equal(micromark('[:a]{b|c}(d)', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr><label>d</label></a></p>', 'should support multiple unnamed unquoted attributes with label');

    t.equal(micromark('[:a]{b|c}', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr></a></p>', 'should support multiple unnamed unquoted attributes without label');

    t.end();
  });

  t.test('quoted unnamed attributes', (t) => {
    t.equal(micromark('[:a]{"b c"}(d)', options({
      '*': h,
    })),
    '<p><a><attr>b c</attr><label>d</label></a></p>',
    'should support value with spaces');

    t.equal(micromark('[:a]{"b&c"}(d)', options({
      '*': h,
    })),
    '<p><a><attr>b&#x26;c</attr><label>d</label></a></p>',
    'should support value with symbols');

    t.equal(micromark('[:a]{"b"}(c)', options({
      '*': h,
    })), '<p><a><attr>b</attr><label>c</label></a></p>', 'should value with label');

    t.equal(micromark('[:a]{"b"}', options({
      '*': h,
    })), '<p><a><attr>b</attr></a></p>', 'should support value without label');

    t.equal(micromark('[:a]{"b"|"c"}(d)', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr><label>d</label></a></p>', 'should support multiple with label');

    t.equal(micromark('[:a]{"b"|"c"}', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr></a></p>', 'should support multiple without label');

    t.end();
  });

  t.test('mixed unnamed attributes', (t) => {
    t.equal(micromark('[:a]{"b"|c}(d)', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr><label>d</label></a></p>', 'should support mixed with label');

    t.equal(micromark('[:a]{"b"|c}', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr></a></p>', 'should support mixed without label');

    t.end();
  });

  t.test('mixed attributes', (t) => {
    t.equal(micromark('[:a]{"b"|c|d=1|e="2"}(f)', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr><attr><name>d</name><value>1</value></attr><attr><name>e</name><value>2</value></attr><label>f</label></a></p>', 'should support mixed with label');

    t.equal(micromark('[:a]{"b"|c|d=1|e="2"}', options({
      '*': h,
    })), '<p><a><attr>b</attr><attr>c</attr><attr><name>d</name><value>1</value></attr><attr><name>e</name><value>2</value></attr></a></p>', 'should support mixed without label');

    t.end();
  });

  t.test('labels', (t) => {
    t.equal(micromark('[:a]{b}(c **d** e)', options({ '*': h })),
      '<p><a><attr>b</attr><label>c <strong>d</strong> e</label></a></p>',
      'should support markdown in the label');
    t.end();
  });

  t.test('syntax', (t) => {
    t.equal(micromark('\\[', options()),
      '<p>[</p>',
      'should support escaped left brackets');

    t.equal(micromark('\\[\\:', options()),
      '<p>[:</p>',
      'should support an escaped bracket and colon');

    t.equal(micromark('[:]{}()', options()),
      '<p>[:]{}()</p>',
      'should not support empty tag');

    t.end();
  });
});

function h(d) {
  const t = d.type;
  const l = d.label;
  const attrs = d.attributes;
  const na = d.namedAttributes || {};

  this.tag(`<${t}>`);

  attrs.forEach((v) => {
    if (v) {
      this.tag('<attr>');
      this.raw(v);
      this.tag('</attr>');
    }
  });

  Object.entries(na).forEach((o) => {
    const [n, v] = o;
    this.tag('<attr>');
    this.tag('<name>');
    this.raw(n);
    this.tag('</name><value>');
    this.raw(v);
    this.tag('</value></attr>');
  });

  if (l) {
    this.tag('<label>');
    this.raw(l);
    this.tag('</label>');
  }

  this.tag(`</${t}>`);
}

function options(opts) {
  return {
    extensions: [syntax()],
    htmlExtensions: [html(opts)],
  };
}
