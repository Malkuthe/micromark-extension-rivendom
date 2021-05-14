/**
 * Check if the given code is a valid unicode digit
 * @param {Code} code
 * @returns {boolean}
 */
function unicodeDigit(code) {
  return /\p{N}/u.test(String.fromCharCode(code));
}

export default unicodeDigit;
