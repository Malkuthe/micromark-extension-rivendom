/**
 * Check if the given code is a valid unicode character
 * @param {Code} code
 * @returns {boolean}
 */
function unicodeAlpha(code) {
  return (
    /\p{L}/u.test(String.fromCharCode(code)) ||
    /\p{M}/u.test(String.fromCharCode(code))
  );
}

export default unicodeAlpha;
