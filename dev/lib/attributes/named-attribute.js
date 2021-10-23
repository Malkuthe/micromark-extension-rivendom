'use-strict';

import { codes } from 'micromark-util-symbol/codes.js';

import { 
  markdownLineEnding, 
  markdownSpace, 
  asciiAlpha, 
  asciiAlphanumeric } from 'micromark-util-character';

import { factorySpace as createSpace } from 'micromark-factory-space';

import getCode from '../character/get-code.js';
import unicodeAlphanumeric from '../character/unicode-alphanumeric.js';
import htmlUnsafe from '../character/html-unsafe.js';

/**
 * Tokenize a given attribute as one with a name and
 * a value that may or may not be quoted.
 * (e.g. `attr1=1` or `attr2="a b"`)
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @returns {State}
 */
function createNamedAttribute(effects, ok, nok) {
  const self = this;
  let marker;
  return start;

  /**
   * Start tokenizing the attribute.
   * @param {Code} code
   * @returns {State}
   */
  function start(code) {
    // Strip spaces from the beginning of the attribute
    if (markdownSpace(code)) {
      return createSpace(effects, start, 'whitespace')(code);
    }

    // Attribute names must start with an ascii letter
    if (!asciiAlpha(code)) return nok(code);

    // Add the first character to the name token and
    // move on
    effects.enter('rivendomTagNamedAttribute');
    effects.enter('rivendomTagNamedAttributeName');
    effects.consume(code);
    return name;
  }

  /**
   * Start tokenizing the name
   * @param {Code} code
   * @returns {State}
   */
  function name(code) {
    // Attribute can't be valid if truncated by the end
    // of the file or by a newline.
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);

    // Only alphanumeric characters plus `-` and `_`
    // make up a valid attribute name
    if (
      asciiAlphanumeric(code) ||
      code === getCode('-') ||
      code === getCode('_')
    ) {
      effects.consume(code);
      return name;
    }

    // Wrap up tokenizing the name and move on
    effects.exit('rivendomTagNamedAttributeName');
    return afterName(code);
  }

  /**
   * After the name has been tokenized, make sure
   * there's an `=` to indicate the start of the value
   * @param {Code} code
   * @returns {State}
   */
  function afterName(code) {
    // The attribute name can't end in `-` or `_` so
    // the `=` can only be preceded by an alphanumeric
    // or a space
    if (!asciiAlphanumeric(self.previous) && !markdownSpace(self.previous))
      return nok(code);

    // Strip spaces from the end of the name
    if (markdownSpace(code)) {
      return createSpace(effects, afterName, 'whitespace')(code);
    }

    if (code === getCode('=')) {
      effects.enter('rivendomTagNamedAttributeInitializer');
      effects.consume(code);
      effects.exit('rivendomTagNamedAttributeInitializer');
      return beforeValue;
    }

    return nok(code);
  }

  /**
   * Preamble to tokenizing the value.
   * @param {Code} code
   * @returns {State}
   */
  function beforeValue(code) {
    // Make sure the attribute isn't prematurely
    // truncated by an EOF, a newline, the marker
    // for the next attribute or the marker for the
    // end of the attributes
    if (
      code === codes.eof ||
      markdownLineEnding(code) ||
      code === getCode('|') ||
      code === getCode('}')
    )
      return nok(code);

    // Branch off to tokenize a quoted value
    if (code === getCode('"') || code === getCode("'")) {
      effects.enter('rivendomTagNamedAttributeValueMarker');
      effects.consume(code);
      effects.exit('rivendomTagNamedAttributeValueMarker');
      effects.enter('rivendomTagNamedAttributeValue');
      marker = code;
      return quotedValue;
    }

    // Strip whitespaces before the value
    if (markdownSpace(code)) {
      return createSpace(effects, beforeValue, 'whitespace')(code);
    }

    effects.enter('rivendomTagNamedAttributeValue');
    marker = undefined;
    return unQuotedValue(code);
  }

  /**
   * Tokenizes a quoted value. Keep in mind that this
   * can contain unsafe characters for html and will
   * need to be sanitized.
   * @param {Code} code
   * @returns {State}
   */
  function quotedValue(code) {
    // We're not allowed to truncate the value with
    // an EOF or a newline
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);

    // If we hit a quote of the same type used to start
    // the value, we treat it as the end of the value.
    /* TODO: support for escaped quotes */
    if (code === marker) {
      effects.exit('rivendomTagNamedAttributeValue');
      effects.enter('rivendomTagNamedAttributeValueMarker');
      effects.consume(code);
      effects.exit('rivendomTagNamedAttributeValueMarker');
      return afterValue;
    }

    effects.consume(code);
    return quotedValue;
  }

  /**
   * Tokenize an unquoted value, which can't contain
   * unsafe characters, spaces, or the `=` character.
   * @param {Code} code
   * @returns {State}
   */
  function unQuotedValue(code) {
    if (
      htmlUnsafe(code) ||
      code === codes.eof ||
      markdownLineEnding(code) ||
      code === getCode('=')
    )
      return nok(code);

    if (code === getCode('|') || code === getCode('}')) {
      effects.exit('rivendomTagNamedAttributeValue');
      return afterValue(code);
    }

    effects.consume(code);
    return unQuotedValue;
  }

  /**
   * After tokenizing the value of this attribute,
   * a few final checks to ensure it's still valid
   * syntax
   * @param {Code} code
   * @returns {State}
   */
  function afterValue(code) {
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);

    // Strip spaces from the end of the value.
    if (markdownSpace(code)) {
      return createSpace(effects, afterValue, 'whitespace')(code);
    }

    // Only a valid attribute if no character other than
    // `|` or `}` follows the value.
    if (code === getCode('|') || code === getCode('}')) {
      effects.exit('rivendomTagNamedAttribute');
      return ok(code);
    }

    return nok(code);
  }
}

export default createNamedAttribute;
