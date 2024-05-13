---
title: MiddleWare
order: 7
nav:
  title: MiddleWare
  order: 7
---

## 1.store/index.js

```js
import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers';
//在控制台输出每一次派发任务的情况
import reduxLogger from 'redux-logger';
//管控action creators中异步处理的
import reduxThunk from 'redux-thunk';
import reduxPromise from 'redux-promise';

//applyMiddleware：应用中间件
const store = createStore(
  reducer,
  applyMiddleware(reduxLogger, reduxThunk, reduxPromise),
);
export default store;
```

## 2.reduxThunk/reduxPromise

actions/voteAction.js

```js
/*
 * 每个模块的ACTION：把需要DISPATCH派发的对象用* 各个方法包起来，
 * 返回的结果就是需要派发的对象
 */
import * as TYPES from '../action-types';
const voteAction = {
  support(payload) {
    /* 
    setTimeout(_ => {
			return {
				type: TYPES.VOTE_SUPPORT,
				payload
			};
		}, 1000); 
    默认不支持异步处理 
    */

    /* reduxThunk */
    /* return dispatch => {
			setTimeout(_ => {
				dispatch({
					type: TYPES.VOTE_SUPPORT,
					payload
				});
			}, 1000);
		}; */

    /* reduxPromise：传递给reducer的action对象中的参数必须叫做payload，
     * 叫别的值都无法传递过去 */
    return {
      type: TYPES.VOTE_SUPPORT,
      payload: new Promise((resolve) => {
        setTimeout((_) => {
          resolve(10);
        }, 1000);
      }),
    };
  },
};
export default voteAction;
```

## 3.实现 logger 中间件

```js
let logger = (store) => (dispatch) => (action) => {
  console.log(store.getState().number);
  dispatch(action);
  console.log(store.getState().number);
};
let applyMiddleWare = (middleware) => (createStore) => (reducer) => {
  let store = createStore(reducer);
  let middle = middleware(store);
  let dispatch = middle(store.dispatch);
  return {
    //将中间返回的dispatch方法覆盖掉原有store中的dispatch
    ...store,
    dispatch,
  };
};
export default applyMiddleWare(logger)(createStore)(reducer);
```

## 4.实现 redux-thunk 中间件

实现派发异步动作,actionCreator 可以返回函数，可以把 dispatch 的权限交给此函数

```js
// action
export default {
  add(amount) {
    return function (dispatch, getState) {
      dispatch({ type: Types.ADD, amount });
      dispatch({ type: Types.ADD, amount });
      console.log(getState().number);
    };
  },
  minus(amount) {
    return { type: Types.MINUS, amount };
  },
};
// store/index.js
let reduxThunk = (store) => (dispatch) => (action) => {
  if (typeof action === 'function') {
    //如果是函数将派发的权限传递给函数
    return action(dispatch, store.getState);
  }
  dispatch(action);
};
```

## 5.实现 redux-promise 中间件

```js
// action
minus(amount){
    return {
      type:Types.MINUS,
      payload:new Promise(function (resolve,reject) {
        reject({amount:2});
      })
    }
}
//store/index.js
let reduxPromise = store => dispatch => action=>{
  if(action.then){
    return action.then(dispatch); //只支持成功
  }else if(action.payload&&action.payload.then){
    // 如果payload是一个promise 会对成功和失败都进行捕获
    // 并且将成功或失败的数据放到payload中进行派发
    return action.payload.then(function (data) {
      dispatch({...action,payload:data});
    },function (data) {
      dispatch({...action,payload:data});
    })
  }
  dispatch(action);
};
```

## 6.compose 应用

```js
function toResult(who, decorator) {
  return who + decorator;
}
function len(str) {
  return str.length;
}
// 我们的目的是将第一个函数的返回结果传递给第二个函数
console.log(len(toResult('leon', '很帅')));
```

## 7.实现 compose

这个 compose 也是 redux 中的一个方法

```js
let compose =
  (...fns) =>
  (...args) => {
    let last = fns.pop();
    return fns.reduceRight(function (prev, next) {
      return next(prev);
    }, last(...args));
  };
console.log(compose(len, toResult)('leon', '很帅'));
```

## 8.applyMiddleware 实现

```js
let applyMiddleWare =
  (...middlewares) =>
  (createStore) =>
  (reducer) => {
    let store = createStore(reducer);
    let middles = middlewares.map((middleware) => middleware(store));
    let dispatch = compose(...middles)(store.dispatch);
    return {
      ...store,
      dispatch,
    };
  };
```

## 9.简化 applyMiddleWare 应用

最终实现效果

```js
export default createStore(reducer, applyMiddleware(reduxThunk, reduxPromise));
```

最终版 redux 库

```js
let createStore = (reducer, fn) => {
  let state;
  let listeners = [];
  let getState = () => state;
  let dispatch = (action) => {
    state = reducer(state, action);
    listeners.forEach((item) => item());
  };
  dispatch({});
  let subscribe = (l) => {
    listeners.push(l);
    return () => {
      listeners = listeners.filter((item) => item !== l);
    };
  };
  if (typeof fn === 'function') {
    return fn(createStore, reducer);
  }
  return {
    createStore,
    dispatch,
    getState,
    subscribe,
  };
};
let combineReducers =
  (reducers) =>
  (newState = {}, action) => {
    for (let key in reducers) {
      newState[key] = reducers[key](newState[key], action);
    }
    return newState;
  };
let bindActionCreators = (actions, dispatch) => {
  let obj = {};
  for (let key in actions) {
    obj[key] = (...args) => dispatch(actions[key](...args));
  }
  return obj;
};
let applyMiddleware =
  (...middlewares) =>
  (createStore, reducer) => {
    let store = createStore(reducer);
    let middles = middlewares.map((middleware) => middleware(store));
    let dispatch = compose(...middles)(store.dispatch);
    return {
      ...store,
      dispatch,
    };
  };
let compose = (...fns) => {
  return (...args) => {
    let fn = fns.pop();
    return fns.reduceRight((prev, next) => {
      return next(prev);
    }, fn(...args));
  };
};
export {
  createStore,
  combineReducers,
  bindActionCreators,
  applyMiddleware,
  compose,
};
```
