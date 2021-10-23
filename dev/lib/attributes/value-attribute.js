import { codes } from 'micromark-util-symbol/codes.js';

import { markdownLineEnding, markdownSpace } from 'micromark-util-character';

import {factorySpace as createSpace} from 'micromark-factory-space';

import getCode from '../character/get-code.js';
import htmlUnsafe from '../character/html-unsafe.js';

/**
 * Tokenize an attribute that is not given a name.
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @returns {State}
 */
function createValueAttribute(effects, ok, nok) {
  let marker;
  return start;

  /**
   * Begin tokenizing the anonymous attribute
   * @param {Code} code
   * @returns {State}
   */
  function start(code) {
    if (code === codes.eof || markdownLineEnding(code)) {
      return nok(code);
    }

    // Trim any spaces preceding the value
    if (markdownSpace(code)) {
      return createSpace(effects, start, 'whitespace')(code);
    }

    // Branch off when the values are quoted
    if (code === getCode('"') || code === getCode("'")) {
      marker = code;
      effects.enter('rivendomTagValueAttributeMarker');
      effects.consume(code);
      effects.exit('rivendomTagValueAttributeMarker');
      effects.enter('rivendomTagValueAttribute');
      return quotedValue;
    }

    // If the value is unquoted, tokenize it as unquoted
    effects.enter('rivendomTagValueAttribute');
    marker = undefined;
    return unquotedValue(code);
  }

  /**
   * Tokenize an unquoted value that cannot contain
   * unsafe characters
   * @param {Code} code
   * @returns {State}
   */
  function unquotedValue(code) {
    if (
      code === codes.eof ||
      markdownLineEnding(code) ||
      htmlUnsafe(code) ||
      code === getCode('=')
    ) {
      return nok(code);
    }

    // If we hit a space or the attribute delineator `|`
    // or the end-of-attributes marker `}` assume the
    // value is fully tokenized and move on
    if (code === getCode('|') || code === getCode('}')) {
      effects.exit('rivendomTagValueAttribute');
      return end(code);
    }

    effects.consume(code);
    return unquotedValue;
  }

  /**
   * Tokenize a quoted value that _can_ contain unsafe
   * characters.
   * @param {Code} code
   * @returns {State}
   */
  function quotedValue(code) {
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);

    // Since the quoted value can contain `|` and `}`
    // we don't exit the token when we hit them. Instead
    // we assume we're finished tokenizing the quoted
    // value when we hit a quote of the same type
    if (code === marker) {
      effects.exit('rivendomTagValueAttribute');
      effects.enter('rivendomTagValueAttributeMarker');
      effects.consume(code);
      effects.exit('rivendomTagValueAttributeMarker');
      return end;
    }

    effects.consume(code);
    return quotedValue;
  }

  /**
   * Wrap up tokenizing the unnamed attribute
   * @param {Code} code
   * @returns {State}
   */
  function end(code) {
    if (markdownSpace(code)) {
      return createSpace(effects, end, 'whitespace')(code);
    }

    // A valid attribute can only end in `|` and `}`
    // after trimming the spaces.
    if (code === getCode('|') || code === getCode('}')) return ok(code);

    return nok(code);
  }
}

export default createValueAttribute;
