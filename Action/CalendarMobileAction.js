import { createStore, bindActionCreators } from 'redux';

export default class CalendarMobileAction {
	constructor() {

		this.reducer = function (state, action) {
			switch (action.type) {
				case 'updateCalendarData':
					return { calendarData: action.calendarData};
				case 'updateCalendarState':
					return {
						calendarState: action.calendarState,
						calendarData: action.calendarData
					};
				case 'setSelectLabelState':
					return {
						calendarState: {
							selectState: action.calendarState.selectState,
							startDate: state.calendarState.startDate, // label 上的文字
							backDate: state.calendarState.backDate // label 上的文字
						},
						calendarData: action.calendarData
					};
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
