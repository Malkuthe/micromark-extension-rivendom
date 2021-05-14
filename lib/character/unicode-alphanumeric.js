import unicodeAlpha from './unicode-alpha.js';
import unicodeNumber from './unicode-digit.js';

/**
 * Check if the given code is a valid unicode letter
 * or number
 * @param {Code} code
 * @returns {boolean}
 */
function unicodeAlphanumeric(code) {
  return unicodeAlpha(code) || unicodeNumber(code);
}

export default unicodeAlphanumeric;
