import React from 'react';
import PropTypes from 'prop-types';

import { createStore, bindActionCreators } from 'redux';
import ReduxItem from './ReduxItem';
// 2.狀態處理函式
function reducer(state, action) {
	switch (action.type) {
		case 'changeValue':
			let itemNum = action.itemCount + state.itemCount;
			let tipText = '';
			// 如果 更改state為數字就加一但如果超過就給字串提醒
			if (itemNum > 20) {
				itemNum = state.itemCount;
				tipText = `超過數量了哦 !! 多了${(action.itemCount + state.itemCount) - 20}個`;
			}
			return { itemCount: itemNum, tipText: tipText}
		default:
			return state;
	}
}
// 1.建立狀態儲存空間，必須準備好狀態處理函式(reducer) ，以及初始狀態物件 (state)
let store = createStore(reducer, { itemCount: 3, tipText: ''});
// 當有狀態改變時 reducer 負責處理，後面是state初始狀態
// let unsubscribe = store.subscribe(this.subscribeFunc);


export default class ReduxList extends React.Component {

	static defaultProps = {
		// functionNames: [
		// ]
	};

	static propTypes = {
		// startDate: React.PropTypes.string,
		// isSelect: React.PropTypes.bool
	};

	constructor(props) {
		// super是呼叫上層父類別的建構式
		super(props);
		this.state = store.getState();
		this.unsubscribe;
	}

	myClick = (addCount) => {
		console.log('hi'+addCount);
		store.dispatch({
			type: 'changeValue',
			itemCount: addCount
		});
		this.setState(store.getState());
	}

	refresh = () => {
		// 5.在 subscribe 監看只要redux狀態一更動就將 redux 狀態更新到 react state 中病 setState
		// redux 本質上只是把 react 中的state抽出來外包給他所有state
		// 都由他去做處理與管理 只要呼叫 dispatch 就會連接到上方 store 已註冊好的 reducer 行為處理函式去做預處理
		// 最後回傳狀態回來，然後看畫面需不需要在 setState 給他 store.getState()更新redux中的狀態
		// 反正經過redux 處理完 react 就只是驗收拿到狀態去 setState 更新畫面
		this.setState(store.getState());
	}
	// ===== 生命週期 ref = https://ithelp.ithome.com.tw/articles/10185194 =====
	componentWillMount() {
		console.log('componentWillMount');
		// 4.去註冊隨時watch redux 中狀態改變時觸發這個方法
		this.unsubscribe = store.subscribe(this.refresh);
	}
	componentWillUnmount(){
		// 6.將剛剛 subscribe 註冊的事件取消掉
		this.unsubscribe();
	}

	produceList = () => {
		let arr = [];
		for (let index = 0; index < this.state.itemCount; index++) {
			arr.push(
				<ReduxItem  num={index+1}
							key={Math.random()}
							itemClick={this.myClick}
							totalLength={this.state.itemCount}
				/>
			);
		}
		return arr;
	}

	render() {
		return (
			<div className="reduxList">
				<h3>{this.state.tipText}</h3>
				<ul>{ this.produceList() }</ul>
			</div>
		);
	}
}

