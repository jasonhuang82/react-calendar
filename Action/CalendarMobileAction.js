import { createStore, bindActionCreators } from 'redux';

export default class CalendarMobileAction {
  constructor() {

    this.reducer = function (state, action) {
      switch (action.type) {
        case 'changeSwitch':
          break;
        default:
          return state;
      }
    };

    this.store = createStore(this.reducer, {
      calendarData: [],
      selectState: 'go',
      calendarState: {
        'selectState': 'go',
        'startDate': null, // label 上的文字
        'backDate': null // label 上的文字
      }
    });
  }

}
