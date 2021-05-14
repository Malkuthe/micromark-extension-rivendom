import codes from 'micromark/dist/character/codes.js';

import markdownLineEnding from 'micromark/dist/character/markdown-line-ending.js';

import getCode from './character/get-code.js';

/**
 * Tokenize the label of the tag
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @returns {State}
 */
function createLabel(effects, ok, nok) {
  return start;

  function start(code) {
    // The label can only start with `(`
    if (code !== getCode('(')) return nok(code);

    effects.enter('rivendomTagLabel');
    effects.enter('rivendomTagLabelMarker');
    effects.consume(code);
    effects.exit('rivendomTagLabelMarker');
    effects.enter('rivendomTagLabelText');

    return inside;
  }

  function inside(code) {
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);

    if (code === getCode(')')) return atClosingParenthesis(code);

    effects.enter('chunkText', { contentType: 'text' });
    return label(code);
  }

  function label(code) {
    if (
      code === codes.eof ||
      markdownLineEnding(code) ||
      code === getCode('[')
    ) {
      effects.exit('chunkText');
      return nok(code);
    }

    if (code === getCode(')')) {
      effects.exit('chunkText');
      return atClosingParenthesis(code);
    }

    effects.consume(code);
    return label;
  }

  function atClosingParenthesis(code) {
    effects.exit('rivendomTagLabelText');
    effects.enter('rivendomTagLabelMarker');
    effects.consume(code);
    effects.exit('rivendomTagLabelMarker');
    effects.exit('rivendomTagLabel');
    return ok;
  }
}

export default createLabel;
