import { codes } from 'micromark-util-symbol/codes.js';

import { markdownLineEnding, markdownSpace } from 'micromark-util-character';

import { factorySpace as createSpace } from 'micromark-factory-space';

import getCode from '../character/get-code.js';
import createValueAttribute from './value-attribute.js';
import createNamedAttribute from './named-attribute.js';

/**
 * Tokenizes the attributes of a rivendom tag,
 * both anonymous attributes (e.g. `{attr1|attr2}`)
 * and named attributes (e.g. `{attr1=value1}`)
 * @param {Effects} effects
 * @param {State} ok
 * @param {State} nok
 * @param {Tokenizer} self
 * @returns {State}
 */
function createAttributes(effects, ok, nok, self) {
  return start;

  /**
   * Start tokenizing the attributes, making sure
   * that the attributes start with `{`
   * @param {Code} code
   * @returns {State}
   */
  function start(code) {
    if (code !== getCode('{')) return nok(code);

    effects.enter('rivendomTagAttributes');
    effects.enter('rivendomTagAttributesMarker');
    effects.consume(code);
    effects.exit('rivendomTagAttributesMarker');
    effects.enter('rivendomTagAttribute');

    // Try to parse the first attribute as anonymous
    return effects.attempt(
      {
        tokenize: createValueAttribute,
        partial: true,
      },
      afterAttribute,
      tryNamedAttribute
    );
  }

  /**
   * Attempt to parse an attribute as a named attribute
   * @param {Code} code
   * @returns {State}
   */
  function tryNamedAttribute(code) {
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);
    return createNamedAttribute.call(self, effects, afterAttribute, (c) =>
      nok(c)
    )(code);
  }

  /**
   * After successfully parsing an attribute, move
   * on to the next one.
   * @param {Code} code
   * @returns
   */
  function afterAttribute(code) {
    // If `|` is the next character, try to
    // parse the next attribute
    if (code === getCode('|')) {
      effects.exit('rivendomTagAttribute');
      effects.enter('rivendomTagAttributeDelineator');
      effects.consume(code);
      effects.exit('rivendomTagAttributeDelineator');
      effects.enter('rivendomTagAttribute');
      return nextAttribute;
    }

    // If `}` is the next character, we've reached the
    // end of the attributes.
    if (code === getCode('}')) {
      effects.exit('rivendomTagAttribute');
      effects.enter('rivendomTagAttributesMarker');
      effects.consume(code);
      effects.exit('rivendomTagAttributesMarker');
      return end;
    }

    // Strip spaces from the end of the previous
    // attribute
    if (markdownSpace(code)) {
      return createSpace(effects, afterAttribute, 'whitespace')(code);
    }

    return nok(code);
  }

  /**
   * Parse the next attribute
   * @param {Code} code
   * @returns
   */
  function nextAttribute(code) {
    if (code === codes.eof || markdownLineEnding(code)) return nok(code);

    // If we hit `|`, that means the previous attribute
    // was empty and we need to move on to the next
    // attribute.
    if (code === getCode('|')) {
      return afterAttribute(code);
    }

    // If we hit `}`, that means the previous attribute
    // was empty and we've reached the end of the
    // attributes.
    if (code === getCode('}')) {
      effects.exit('rivendomTagAttribute');
      effects.enter('rivendomTagAttributesMarker');
      effects.consume(code);
      effects.exit('rivendomTagAttributesMarker');
      return end;
    }

    // Attempt to parse the next attribute
    return effects.attempt(
      {
        tokenize: createValueAttribute,
        partial: true,
      },
      afterAttribute,
      tryNamedAttribute
    )(code);
  }

  /**
   * Wrap up tokenizing attributes.
   * @param {Code} code
   * @returns
   */
  function end(code) {
    effects.exit('rivendomTagAttributes');
    return ok(code);
  }
}

export default createAttributes;
