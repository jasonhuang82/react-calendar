import React from 'react';
import PropTypes from 'prop-types';

import { createStore, bindActionCreators } from 'redux';
/*
    createStore 建立狀態儲存空間
    派送改變狀態行動
    一旦使用者改變狀態就透過 createStore.dispatch('行動物件:可能是使用這click某個元件') 去派送行動物件給reducer
    let store = createStore(...);
    createStore.dispatch('行動物件:可能是使用這click某個元件')

    回應狀態改變，一旦狀態有變化就會被執行的事件有點類似watch 用狀態儲存空間物件去註冊監聽回應狀態改變
    let store = createStore(...);
    store.subcrible(通知處理function)
    一旦狀態被改變就會反應到畫面或作後續動作

    停止回應狀態改變
    let store = createStore(...);
    let unsubcrible =  store.subcrible(通知處理function)
    unsubcrible();

    取得redux最新狀態
    let store = createStore(...);
    store.getState();
*/
// 狀態處理函式
function reducerFunc (state, action){ // state 目前狀態 action 接收到的行動
    // 無論狀態是否改變，都一定要回傳新的狀態物件，新的會取代舊的狀態物件
    switch (action.type) {
        case 'updateSwitch':
            return { on: !state.on };
        default:
            return state;
    }
}
// 建立狀態儲存空間，必須準備好狀態處理函式(reducer) ，以及初始狀態物件 (state)
let store = createStore(reducerFunc, { on: false });
// 當有狀態改變時 reducer 負責處理，後面是state初始狀態
// let unsubscribe = store.subscribe(this.subscribeFunc);


export default class ReduxTest extends React.Component {

    static defaultProps = {
        // functionNames: [
        // ]
    };

    static propTypes = {
        // startDate: React.PropTypes.string,
        // isSelect: React.PropTypes.bool
    };

    constructor (props) {
        // super是呼叫上層父類別的建構式
        super(props);
        this.state = store.getState();
    }

    myClick = () => {
        // 建立行動物件，並透過dispatch派送 reducer，改變狀態
        // 行動物件 : 唯一要求，一定要提供type屬性，代表行動是甚麼
        // dispatch 派送行動有點類似 發送指令給redux跟他說有狀態要變了，並告訴她目前是甚麼動作請他做對應的事
        // 最後再將處理完的新的狀態return ，但沒有setState
        store.dispatch({ // 執行派送動作
            type: 'updateSwitch'
        });
        console.log('myStore', store.getState());

        this.setState(store.getState());
    }
    // ===== 生命週期 ref = https://ithelp.ithome.com.tw/articles/10185194 =====
    componentWillMount () {
        console.log('componentWillMount');
    }

    render () {
        return (
            <div onClick={this.myClick}>
                Hello!!! Jason
                <div>{this.state.on ? 'Yes':'No'}</div>
            </div>
        );
    }
}

