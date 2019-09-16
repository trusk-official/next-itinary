import { Component } from 'react';
import PropTypes from 'prop-types';

export default class DropDown extends Component {
  static propTypes = {
    listItineraries: PropTypes.array,
    onChange: PropTypes.func,
    pickItinaryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  };

  // Defaults for props
  static defaultProps = {
    listItineraries: [],
    pickItinaryId: 'default'
  };

  render() {
    const { listItineraries, onChange, pickItinaryId } = this.props;

    return (
      <select
        id="itinarySelect"
        onChange={e => {
          const selectedItemIndex = listItineraries.findIndex(
            it => it.id === parseInt(e.target.value)
          );
          onChange &&
            onChange(selectedItemIndex, listItineraries[selectedItemIndex]);
        }}
        value={pickItinaryId}
      >
        {[
          <option key="default_option" value="default">
            Choisissez un itinéraire
          </option>
        ].concat(
          listItineraries.map((item, itemIndex) => {
            return (
              <option key={`itemItinary_${itemIndex}`} value={item.id}>
                {item.label}
              </option>
            );
          })
        )}
      </select>
    );
  }
}
