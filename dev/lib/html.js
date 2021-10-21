import encode from 'stringify-entities/light.js';

const own = {}.hasOwnProperty;

/**
 * Micromark html extension for rivendom tags
 * @param {object} options
 * @returns {object}
 */
export function rivendomHTML(options) {
  const extensions = options || {};

  return {
    enter: {
      rivendomTag: enter,
      rivendomTagAttributes: enterAttributes,
      rivendomTagAttribute: enterAttribute,
      rivendomTagLabelText: enterLabelText,
    },
    exit: {
      rivendomTag: exit,
      rivendomTagType: exitType,
      rivendomTagAttributes: exitAttributes,
      rivendomTagValueAttribute: exitValueAttribute,
      rivendomTagNamedAttributeName: exitNamedAttributeName,
      rivendomTagNamedAttributeValue: exitNamedAttributeValue,
      rivendomTagLabelText: exitLabelText,
    },
  };

  /**
   * Set up the stack
   */
  function enter() {
    let stack = this.getData('rivendomTagStack');
    if (!stack) this.setData('rivendomTagStack', (stack = []));
    stack.push({});
  }

  /**
   * Start capturing the contents of the label
   */
  function enterLabelText() {
    this.buffer();
  }

  /**
   * Set up the attributes for the current tag
   */
  function enterAttributes() {
    const stack = this.getData('rivendomTagStack');
    const rivendomTag = stack[stack.length - 1];
    rivendomTag.attributes = [];
  }

  /**
   * Set up a temporary array for the current attribute
   */
  function enterAttribute() {
    const stack = this.getData('rivendomTagStack');
    const { attributes } = stack[stack.length - 1];
    attributes.push([]);
  }

  /**
   * Set the tag's type
   * @param {Token} token
   */
  function exitType(token) {
    const stack = this.getData('rivendomTagStack');
    stack[stack.length - 1].type = this.sliceSerialize(token);
  }

  /**
   * Push an unnamed attribute into the current tag's
   * attributes
   * @param {Token} token
   */
  function exitValueAttribute(token) {
    const stack = this.getData('rivendomTagStack');
    const { attributes } = stack[stack.length - 1];
    const data = encode(this.sliceSerialize(token));
    attributes[attributes.length - 1].push(data);
  }

  /**
   * Push the name into the current attribute
   * @param {Token} token
   */
  function exitNamedAttributeName(token) {
    const stack = this.getData('rivendomTagStack');
    const { attributes } = stack[stack.length - 1];
    const data = this.sliceSerialize(token);
    attributes[attributes.length - 1].push(data);
  }

  /**
   * Push the value into the current attribute
   * @param {Token} token
   */
  function exitNamedAttributeValue(token) {
    const stack = this.getData('rivendomTagStack');
    const { attributes } = stack[stack.length - 1];
    const data = encode(this.sliceSerialize(token));
    attributes[attributes.length - 1].push(data);
  }

  /**
   * Process the temporary attribute array, unwrapping
   * the unnamed attributes and placing the named
   * attributes into an object.
   */
  function exitAttributes() {
    const stack = this.getData('rivendomTagStack');
    const rivendomTag = stack[stack.length - 1];
    const { attributes } = rivendomTag;
    let { namedAttributes } = rivendomTag;

    attributes.forEach((v, i) => {
      if (v.length === 1) {
        [attributes[i]] = v;
      } else if (v.length === 2) {
        if (!namedAttributes) namedAttributes = {};
        [, namedAttributes[v[0]]] = v;
        attributes[i] = null;
      } else if (i.length === 0) {
        attributes[i] = null;
      }
    });

    rivendomTag.attributes = [...attributes];
    rivendomTag.namedAttributes = { ...namedAttributes };
  }

  /**
   * Stop capturing the content of the label and set
   * the tag's label property to it
   */
  function exitLabelText() {
    const data = this.resume();
    const stack = this.getData('rivendomTagStack');
    stack[stack.length - 1].label = data;
  }

  /**
   * Wrap up processing the data from markdown and
   * process the tags based on their type.
   */
  function exit() {
    const rivendomTag = this.getData('rivendomTagStack').pop();
    let result;
    let found;

    // If an extension is provided for the given tag
    // type, use that extension to process its data
    if (own.call(extensions, rivendomTag.type)) {
      result = extensions[rivendomTag.type].call(this, rivendomTag);
      found = result !== false;
    }

    // If no extension is provided for the given tag
    // type, try to fall back on a catchall extension
    // and do nothing, otherwise.
    if (!found && own.call(extensions, '*')) {
      result = extensions['*'].call(this, rivendomTag);
      found = result !== false;
    }
  }
}
