import React from 'react';

const SelectableList = ({
  items,
  nameFunc = (i) => i,
  activeValue,
  setActiveValue,
}) => {
  if (!items) {
    return '';
  }
  return (
    <div>
      {items.map((item) => {
        const name = nameFunc(item);
        return (
          <div key={name}>
            <button
              style={{ width: '100%' }}
              className={`btn btn${
                name !== activeValue ? '-outline' : ''
              }-primary`}
              onClick={() => setActiveValue(name)}
            >
              {name}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default SelectableList;
