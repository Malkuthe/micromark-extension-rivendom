import test from 'tape';
import {micromark} from 'micromark';
import {rivendom as syntax, rivendomHTML as html} from '../dev/index.js';

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

    t.equal(micromark('[:a](b)', options({
      '*': h,
    })),
    '<p><a><label>b</label></a></p>',
    'should support missing attributes');

    t.equal(micromark('[:a]{b}', options({
      '*': h,
    })),
    '<p><a><attr>b</attr></a></p>',
    'should support missing label');

    t.end();
  });

  t.test('affixes', (t) => {
    t.equal(micromark('[:a]{b}(c)', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a></p>',
    'should support null prefix');

    t.equal(micromark('\n[:a]{b}(c)', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a></p>',
    'should support newline prefix');

    t.equal(micromark('*[:a]{b}(c)', options({ '*': h,})),
    '<p>*<a><attr>b</attr><label>c</label></a></p>',
    'should support asterisk prefix');

    t.equal(micromark('_[:a]{b}(c)', options({ '*': h,})),
    '<p>_<a><attr>b</attr><label>c</label></a></p>',
    'should support underscore prefix');

    t.equal(micromark('~[:a]{b}(c)', options({ '*': h,})),
    '<p>~<a><attr>b</attr><label>c</label></a></p>',
    'should support tilde prefix');

    t.equal(micromark('a[:a]{b}(c)', options({ '*': h,})),
    '<p>a[:a]{b}(c)</p>',
    'should not support alphanumeric prefix');

    t.equal(micromark('1[:a]{b}(c)', options({ '*': h,})),
    '<p>1[:a]{b}(c)</p>',
    'should not support alphanumeric prefix');

    t.equal(micromark('[:a]{b}(c)', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a></p>',
    'should support null affix');

    t.equal(micromark('[:a]{b}(c)\n', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a></p>\n',
    'should support newline affix');

    t.equal(micromark('[:a]{b}(c)*', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a>*</p>',
    'should support asterisk affix');

    t.equal(micromark('[:a]{b}(c)_', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a>_</p>',
    'should support underscore affix');

    t.equal(micromark('[:a]{b}(c)~', options({ '*': h,})),
    '<p><a><attr>b</attr><label>c</label></a>~</p>',
    'should support tilde affix');

    t.equal(micromark('[:a]{b}(c)a', options({ '*': h,})),
    '<p>[:a]{b}(c)a</p>',
    'should not support alphanumeric affix');

    t.equal(micromark('[:a]{b}(c)1', options({ '*': h,})),
    '<p>[:a]{b}(c)1</p>',
    'should not support alphanumeric affix');

    t.end();
  });

  t.test('formatting', (t) => {
    t.equal(micromark('_[:a]{b}(c)_', options({ '*': h,})),
    '<p><em><a><attr>b</attr><label>c</label></a></em></p>',
    'should support italics');

    t.equal(micromark('*[:a]{b}(c)*', options({ '*': h,})),
    '<p><em><a><attr>b</attr><label>c</label></a></em></p>',
    'should support italics');

    t.equal(micromark('**[:a]{b}(c)**', options({ '*': h,})),
    '<p><strong><a><attr>b</attr><label>c</label></a></strong></p>',
    'should support bold');
    
    t.equal(micromark('__[:a]{b}(c)__', options({ '*': h,})),
    '<p><strong><a><attr>b</attr><label>c</label></a></strong></p>',
    'should support bold');

    t.equal(micromark('***[:a]{b}(c)***', options({ '*': h,})),
    '<p><em><strong><a><attr>b</attr><label>c</label></a></strong></em></p>',
    'should support bolded italics');

    t.equal(micromark('*__[:a]{b}(c)__*', options({ '*': h,})),
    '<p><em><strong><a><attr>b</attr><label>c</label></a></strong></em></p>',
    'should support bolded italics');

    t.equal(micromark('_**[:a]{b}(c)**_', options({ '*': h,})),
    '<p><em><strong><a><attr>b</attr><label>c</label></a></strong></em></p>',
    'should support bolded italics');

    t.equal(micromark('__*[:a]{b}(c)*__', options({ '*': h,})),
    '<p><strong><em><a><attr>b</attr><label>c</label></a></em></strong></p>',
    'should support bolded italics');

    t.equal(micromark('**_[:a]{b}(c)_**', options({ '*': h,})),
    '<p><strong><em><a><attr>b</attr><label>c</label></a></em></strong></p>',
    'should support bolded italics');

    t.end()
  })

  t.test('unquoted named attributes', (t) => {
    t.equal(micromark('[:a]{b=c d}(e)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>c d</value></attr><label>e</label></a></p>',
    'should support values with spaces');

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
    '<p><a><attr><name>b</name><value>1    </value></attr><label>c</label></a></p>',
    'should strip whitespaces from before attribute value');

    t.equal(micromark('[:a]{    b    =    1    }(c)', options({
      '*': h,
    })),
    '<p><a><attr><name>b</name><value>1    </value></attr><label>c</label></a></p>',
    'should strip whitespaces from attribute name & before value');

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
    '<p><a><attr>b c</attr><label>d</label></a></p>',
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
      '<p><a><attr>b</attr><label>c **d** e</label></a></p>',
      'should not support markdown in the label');
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

    t.equal(micromark('x[:]{}()', options()),
    '<p>x[:]{}()</p>',
    'should not support character before tag');

    t.equal(micromark('[:]{}()x', options()),
    '<p>[:]{}()x</p>',
    'should not support character after tag');

    t.equal(micromark('[:]{}x()', options()),
    '<p>[:]{}x()</p>',
    'should not support character after attributes but before label');

    t.equal(micromark('[:]{}x', options()),
    '<p>[:]{}x</p>',
    'should not support character after attributes without label');

    t.equal(micromark('[:]x{}()', options()),
    '<p>[:]x{}()</p>',
    'should not support character between type and attributes');

    t.equal(micromark('[:a]{b}(c\nd)', options()),
    '<p>[:a]{b}(c\nd)</p>',
    'should not support newlines in label');
    
    t.equal(micromark('[:a]{b}(c [:d]{e}(f) )', options({'*': h})),
    '<p><a><attr>b</attr><label>c [:d]{e}(f) </label></a></p>',
    'should not support tags in label');

    t.end();
  });
});

function h(d) {
  const t = d.type;
  const l = d.label;
  const attrs = d.attributes;
  const na = d.namedAttributes || {};

  this.tag(`<${t}>`);

  if (attrs) {
    attrs.forEach((v) => {
      if (v) {
        this.tag('<attr>');
        this.raw(v);
        this.tag('</attr>');
      }
    });
  }

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
