/**
 * Check if the given code is unsafe for html
 * @param {Code} code
 * @returns {boolean}
 */
function htmlUnsafe(code) {
  return /[<&`'">]/.test(String.fromCharCode(code));
}

export default htmlUnsafe;
