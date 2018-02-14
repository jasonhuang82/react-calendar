import React from 'react';
import PropTypes from 'prop-types';
import ReduxSwitchAction from '../Action/ReduxSwitchAction';

export default class ReduxSwitch extends React.Component {

	constructor(props) {
		// super是呼叫上層父類別的建構式
		super(props);
		this.store = (new ReduxSwitchAction()).store;
		this.state = this.store.getState();
	}

	// ===== 生命週期 ref = https://ithelp.ithome.com.tw/articles/10185194 =====
	componentWillMount() {
		console.log('componentWillMount');
	}
	componentWillUnmount() {

	}

	// 更換 button Class
	switchButtonClass = () => {
		let classStr = 'reduxSwitch';
		if(this.state.isSwitch){
			classStr += ' active';
		}
		return classStr;
	}

	// button click 時利用redux更新狀態
	onSwitchClick = () => {
		// 命令 redux 更新狀態，但setState 還是要自己做
		this.store.dispatch({
			type: 'changeSwitch'
		});
		// 用react 更新setState( (currentState, currentProps) => ( 你要回傳的物件 ) )
		// this.setState((currentState) => ({ isSwitch: !currentState.isSwitch} ));
		// 用redux 更新 state
		this.props.reduxSwitchState(this.store.getState().isSwitch);		
		this.setState(this.store.getState())
	}
	// 外部取得內部選擇狀態
	getSwitchResult = () => {
		return this.state.isSwitch;
	}
	render() {
		return (
			<div className={this.switchButtonClass()}
				onClick={this.onSwitchClick}
			>
				<div className="reduxSwitchOption"></div>
			</div>
		);
	}
}

