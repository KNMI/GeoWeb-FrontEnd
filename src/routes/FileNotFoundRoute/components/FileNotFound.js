import React from 'react';
import DuckImage from '../assets/Duck.jpg';
// import './HomeView.scss';

export const FileNotFound = () => (
  <div>
    <h4>This is not the duck you are looking for!</h4>
    <img
      alt='This is a duck, because Redux!'
      className='duck'
      src={DuckImage} />
  </div>
);

export default FileNotFound;
