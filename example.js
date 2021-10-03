import micromark from 'micromark';
import directive from 'micromark-extension-directive';
import directiveHTML from 'micromark-extension-directive/html.js';
import syntax from './index.js';
import html from './html.js';

let r = micromark('[:a]{b}(c ( [:e]{f}(g) )d) [:h]{i}(j)', {
  extensions: [syntax()],
  htmlExtensions: [html({"*": h})],
})

function h(d) { 
  console.log(d);
  this.tag(`<${d.type}>`);
  this.tag(`</${d.type}>`)
};

console.log(r);
