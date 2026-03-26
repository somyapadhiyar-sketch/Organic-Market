import React from 'react';

/**
 * AnimatedButton – a lightweight wrapper around the native <button> element.
 * It applies the global `.animated-button` styles (hover lift, smooth transition)
 * and forwards all received props (onClick, className, type, etc.) to the
 * underlying button. Children are rendered inside the button.
 */
const AnimatedButton = ({ children, className = '', ...props }) => {
  return (
    <button className={`animated-button ${className}`} {...props}>
      {children}
    </button>
  );
};

export default AnimatedButton;
