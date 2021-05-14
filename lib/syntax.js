import codes from 'micromark/dist/character/codes.js';

import markdownLineEndingOrSpace from 'micromark/dist/character/markdown-line-ending-or-space.js';

import markdownLineEnding from 'micromark/dist/character/markdown-line-ending.js';
import markdownSpace from 'micromark/dist/character/markdown-space.js';

import asciiAlpha from 'micromark/dist/character/ascii-alpha.js';
import asciiAlphanumeric from 'micromark/dist/character/ascii-alphanumeric.js';

import createSpace from 'micromark/dist/tokenize/factory-space.js';

import getCode from './character/get-code.js';

import createAttributes from './attributes/index.js';
import createLabel from './label.js';

function previous(code) {
  return markdownLineEndingOrSpace(code) || code === null;
}

function tokenizeRivendomTag(effects, ok, nok) {
  const self = this;
  return start;

  function start(code) {
    if (code !== codes.leftSquareBracket) return nok(code);

    if (!previous.call(self, self.previous)) return nok(code);

    effects.enter('rivendomTag');
    effects.enter('rivendomTagTypeMarker');
    effects.consume(code);
    return afterOpeningBracket;
  }

  function afterOpeningBracket(code) {
    if (code !== codes.colon) return nok(code);
    effects.consume(code);
    effects.exit('rivendomTagTypeMarker');
    return afterMarker;
  }

  function afterMarker(code) {
    if (
      code === codes.eof ||
      markdownLineEnding(code) ||
      (!asciiAlpha(code) && !markdownSpace(code))
    )
      return nok(code);

    if (markdownSpace(code)) {
      return createSpace(effects, afterMarker, 'whitespace')(code);
    }

    effects.enter('rivendomTagType');
    return insideType(code);
  }

  function insideType(code) {
    if (markdownLineEnding(code) || code === codes.eof) return nok(code);

    if (code === getCode(']') || markdownSpace(code)) {
      effects.exit('rivendomTagType');
      return afterType(code);
    }

    if (
      asciiAlphanumeric(code) ||
      code === getCode('-') ||
      code === getCode('_')
    ) {
      effects.consume(code);
      return insideType;
    }

    return nok(code);
  }

  function afterType(code) {
    if (!markdownSpace(self.previous) && !asciiAlphanumeric(self.previous))
      return nok(code);

    if (markdownSpace(code)) {
      return createSpace(effects, afterType, 'whitespace')(code);
    }

    if (code === getCode(']')) {
      effects.enter('rivendomTagTypeMarker');
      effects.consume(code);
      effects.exit('rivendomTagTypeMarker');
      return createAttributes(effects, afterAttributes, (c) => nok(c), self);
    }

    return nok(code);
  }

  function afterAttributes(code) {
    if (self.previous !== getCode('}')) return nok(code);
    return createLabel(effects, afterLabel, afterLabel, self)(code);
  }

  function afterLabel(code) {
    if (code === getCode('(')) return nok(code);
    if (self.previous !== getCode('}') && self.previous !== getCode(')')) {
      return nok(code);
    }
    effects.exit('rivendomTag');
    return ok(code);
  }
}

function tokenize() {
  return {
    text: {
      [getCode('[')]: {
        tokenize: tokenizeRivendomTag,
        previous,
      },
    },
  };
}

export default tokenize;
