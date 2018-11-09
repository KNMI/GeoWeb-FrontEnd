import React, { PureComponent } from 'react';
import produce from 'immer';
import PropTypes from 'prop-types';

const INITIAL_STATE = {
  element: null,
  selection: {
    startIndex: null,
    endIndex: null
  }
};

export default class NumberInput extends PureComponent {
  constructor (props) {
    super(props);
    this.registerElement = this.registerElement.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onWheel = this.onWheel.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.setCursorPosition = this.setCursorPosition.bind(this);
    this.state = produce(INITIAL_STATE, draftState => { });
  }

  // TODO: Following is experimental technology implementation and should be tested thoroughly!
  /**
   * Set state in an asynchronous, controlled and immutable way
   * @param {Object} state The new state properties
   * @returns {Promise} The promise to set the state
   */
  setStatePromise (state) {
    const context = this;
    return new Promise((resolve, reject) => {
      context.setState(produce(context.state, draftState => {
        if (state && typeof state === 'object' && state.constructor === Object) {
          Object.entries(state).forEach((entry) => {
            if (draftState.hasOwnProperty(entry[0])) {
              switch (typeof entry[1]) {
                case 'string':
                case 'number':
                case 'boolean':
                  draftState[entry[0]] = entry[1];
                  break;
                case 'object':
                  if (entry[1] === null) {
                    draftState[entry[0]] = null;
                  } else if (Array.isArray(entry[1])) {
                    if (Array.isArray(draftState[entry[0]])) {
                      draftState[entry[0]].length = 0;
                      draftState[entry[0]].push(...entry[1]);
                    } else {
                      reject(new Error(`Value is an array, but the state property is not.`));
                    }
                  } else if (entry[1].constructor === Object) {
                    Object.entries(entry[1]).forEach((subEntry) => {
                      if (draftState[entry[0]].hasOwnProperty(subEntry[0])) {
                        switch (typeof subEntry[1]) {
                          case 'string':
                          case 'number':
                          case 'boolean':
                            draftState[entry[0]][subEntry[0]] = subEntry[1];
                            break;
                          case 'object':
                            if (subEntry[1] === null) {
                              draftState[entry[0]][subEntry[0]] = subEntry[1];
                              break;
                            }
                            reject(new Error(`Value is a (deep) nested property for [${entry[0]}.${subEntry[0]}]. setState is not configured to handle these.`));
                            break;
                          default:
                            reject(new Error(`Value is a (deep) nested property for [${entry[0]}.${subEntry[0]}]. setState is not configured to handle these.`));
                        }
                      } else {
                        reject(new Error(`Property [${entry[0]}.${subEntry[0]}] is not available in the state.`));
                      }
                    });
                  } else if (entry[1] instanceof HTMLElement) {
                    draftState[entry[0]] = entry[1];
                  } else {
                    reject(new Error(`Value is of type Object, but not a recognized Object.`));
                  }
                  break;
                default:
                  reject(new Error(`Value is of type [${typeof entry[1]}] and setState is not configured to handle this type of data.`));
              }
            } else {
              reject(new Error(`Property [${entry[0]}] is not available in the state.`));
            }
          });
        }
      }),
      () => { resolve(); });
    });
  }

  /**
   * Registers DOM element to enable setting focus and selection
   * @param {Element} element The DOM element to register
   */
  registerElement (element) {
    this.setStatePromise({ element: element });
  }

  /**
   * Hook to store the start and end of the selection
   * @param {number} offset The offset to apply, i.e. shift the selectionIndices
   * @param {number|null} overrideStart The value to override the startIndex with
   * @param {number|null} overrideEnd The value to override the endIndex with
   * @returns {Promise} A promise which is resolved when the state is updated with the selection data
   */
  selectionHook (offset = 0, overrideStart, overrideEnd) {
    return this.setStatePromise({
      selection: {
        startIndex: typeof overrideStart === 'undefined'
          ? this.state.element.selectionStart - this.state.element.value.length + offset
          : overrideStart,
        endIndex: typeof overrideEnd === 'undefined'
          ? this.state.element.selectionEnd - this.state.element.value.length + offset
          : overrideEnd
      }
    });
  }

  /**
   * Hook to set the start and end of the selection
   * @returns {Promise} A promise which is resolved when the state is updated with the selection data
   */
  setCursorPosition () {
    const { element, selection } = this.state;
    const { value } = element;
    if (typeof value === 'string' && typeof selection.endIndex === 'number' && value.length > (selection.endIndex * -1)) {
      const selectionIndex = value.length + selection.endIndex;
      element.setSelectionRange(selectionIndex, selectionIndex);
      this.selectionHook(undefined, null, null);
    }
  }

  /**
   * Effectively performs the changes, after the hook has been resolved
   * @param {Event} evt The event that was triggered by the change
   * @param {string} value The (sanitized) value to perform the change with
   */
  onChangeHooked (evt, value) {
    const { onChange } = this.props;
    this.selectionHook().then(() => onChange(evt, value));
  }

  /**
   * Handles changing of the value (other than wheel), checks for types and bounds
   * @param {Event} evt The event that was triggered by the change
   */
  onChange (evt) {
    // const { min, max, maxLength } = this.props;
    const { max, maxLength, onChange } = this.props;
    const { value } = evt.target;
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.type === 'change') {
      let resultValue = Number.NaN;
      if (typeof value === 'string') {
        if (value === '') {
          onChange(evt, null);
          return;
        } else {
          const valueAsString = parseInt(value).toString();
          if (valueAsString.length > maxLength) {
            this.selectionHook(valueAsString.length - maxLength);
          }
          resultValue = parseInt(valueAsString.substr(0, maxLength));
        }
      } else if (typeof value === 'number') {
        resultValue = value;
      }
      if (isNaN(resultValue)) {
        this.selectionHook().then(this.setCursorPosition);
        console.warn('NumberInput:', 'provided value is not parseable as number');
        return;
      }
      if (resultValue > max) {
        this.selectionHook().then(this.setCursorPosition);
        console.warn('NumberInput:', 'provided value exceeds the maximum value');
        return;
      } /* TODO: when the entire value is replaced, the user could start typing one character,
                and hence not fulfilling this minimum requirement
        else if (resultValue < min) {
        console.warn('NumberInput:', 'provided value is below the minimum value');
        return;
      } */
      onChange(evt, resultValue.toString());
    }
  }

  /**
   * Handles changing of the value by using the mouse wheel, checks for types and bounds
   * @param {Event} evt The event that was triggered by the change
   */
  onWheel (evt) {
    const { value, step, min, max, onChange } = this.props;
    if (evt.type === 'wheel') {
      evt.preventDefault();
      evt.stopPropagation();
      if (evt.deltaY === 0) {
        return;
      }
      let resultValue = Number.NaN;
      if (typeof value === 'string') {
        if (value === '') {
          resultValue = 0;
        } else {
          resultValue = parseInt(value);
        }
      } else if (typeof value === 'number') {
        resultValue = value;
      }
      if (!isNaN(resultValue)) {
        if (evt.deltaY < 0) {
          if (resultValue <= max - step) {
            resultValue += step - resultValue % step;
          } else {
            resultValue = min;
          }
        } else if (evt.deltaY > 0) {
          if (resultValue >= min + step) {
            resultValue -= step + resultValue % step;
          } else {
            resultValue = max;
          }
        } else {
          return;
        }
        onChange(evt, resultValue.toString());
      } else {
        console.warn('NumberInput:', 'provided value is not parseable as number');
      }
    } else {
      onChange(evt, null);
    }
  }

  onKeyDown (evt) {
    this.selectionHook();
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setCursorPosition();
    }
  }

  render () {
    const { value, disabled, className, minLength, maxLength, placeholder : providedPlaceholder } = this.props;
    const dataField = this.props['data-field'];
    const placeholder = typeof providedPlaceholder === 'string'
      ? providedPlaceholder
      : minLength
        ? ''.padStart(minLength, '0')
        : '0';
    const displayValue = typeof value === 'number' || (typeof value === 'string' && value !== '')
      ? minLength
        ? value.toString().padStart(minLength, '0')
        : value.toString()
      : '';
    return <input data-field={dataField} type='text'
      ref={this.registerElement}
      placeholder={placeholder} disabled={disabled}
      pattern='[0-9]*'
      minLength={minLength || null}
      maxLength={maxLength ? maxLength + 1 : null}
      className={`NumberInput form-control${className ? ` ${className}` : ''}`}
      value={displayValue}
      onChange={this.onChange}
      onWheel={this.onWheel}
      onKeyDown={this.onKeyDown}
    />;
  }
}

NumberInput.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
  'data-field': PropTypes.string,
  placeholder: PropTypes.string
};
