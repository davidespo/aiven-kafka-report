import React from 'react';

import Select from 'react-select';

const SelectableList = ({
  items,
  nameFunc = (i) => i,
  activeValue,
  setActiveValue,
}) => {
  if (!items) {
    return '';
  }
  const options = items.map((item) => {
    const value = nameFunc(item);
    return {
      value,
      label: value,
    };
  });

  return (
    <div>
      <Select
        options={options}
        onChange={({ value }) => setActiveValue(value)}
      />
      {/* {items.map((item) => {
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
      })} */}
    </div>
  );
};

export default SelectableList;
