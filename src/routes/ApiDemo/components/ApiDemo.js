import React from 'react';
import DuckImage from '../assets/Duck.jpg';
import './ApiDemo.scss';

export const ApiDemo = () => (
  <div>
    <h4>Welcome to apidemo!</h4>
    <img
      alt='This is a duck, because Redux!'
      className='duck'
      src={DuckImage} />
  </div>
);
export default ApiDemo;
