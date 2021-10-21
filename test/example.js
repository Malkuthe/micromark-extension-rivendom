import { micromark } from 'micromark';
import { rivendom as syntax, rivendomHTML as html } from '../dev/index.js';

let r = micromark('**[:a]{b}(c&amp;d)**', {
  extensions: [syntax()],
  htmlExtensions: [html({"*": h})],
})

function h(d) { 
  console.log(d);
  this.tag(`<${d.type}>`);
  this.tag(`</${d.type}>`)
};

console.log(r);
