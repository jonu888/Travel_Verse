import React from 'react';
import PropTypes from 'prop-types';
import './Toggle.css';

const Toggle = ({ id, name, checked, onChange, label }) => {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <div className="switch shrink-0">
        <input
          className="toggle"
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
        />
        <span className="slider"></span>
        <span className="card-side"></span>
      </div>
      {label && <span className="text-white/80 select-none text-sm leading-tight">{label}</span>}
    </label>
  );
};

Toggle.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string
};

export default Toggle;
