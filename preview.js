import '../core/core.scss';
// import js
import React from 'react';
import ReactDOM from 'react-dom';
// 載入es7 環境
import 'babel-polyfill';

import ReactCalendar from './index.js';


ReactDOM.render(<ReactCalendar />, document.getElementById('root'));
