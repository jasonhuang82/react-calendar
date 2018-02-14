import { createStore, bindActionCreators } from 'redux';

export default class ReduxSwitchAction {
	constructor() {
		
		this.reducer = function (state, action) {
			switch (action.type) {
				case 'changeSwitch':
					return { isSwitch: !state.isSwitch };
				default:
					return state;
			}
		};

		this.store = createStore(this.reducer, {
			isSwitch: false
		});
	}

}
