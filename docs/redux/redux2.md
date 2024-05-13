---
title: Redux工程化
order: 5
nav:
  title: Redux
  order: 5
---

## 1.redux 文件拆分

增加一个 store 文件夹

```js
store
    ├─actions
	│    ├─index.js
	│    ├─userAction.js
    │    └─voteAction.js
    ├─reducers
    │    ├─index.js
	│    ├─userReducer.js
    │    └─voteReducer.js
    ├─action-types.js
    └─index.js
```

## 2.各模块详解

1. actions

index.js

```jsx | pure
/*
 * 合并每个模块下的ACTION
 */
import voteAction from './voteAction';
import userAction from './userAction';

const action = {
  vote: voteAction,
  user: userAction,
};
export default action;
```

voteAction.js

```jsx | pure
/*
 * 每个模块的ACTION：把需要DISPATCH派发的对象用各个方法包起来，
 * 返回的结果就是需要派发的对象
 */
import * as TYPES from '../action-types';
const voteAction = {
  support(payload) {
    return {
      type: TYPES.VOTE_SUPPORT,
      payload,
    };
  },
  oppose(payload) {
    return {
      type: TYPES.VOTE_OPPOSE,
      num: payload,
    };
  },
};
export default voteAction;
```

2. reducers

index.js

```jsx | pure
/*
 * 把各版块的小REDUCER合成一个大的REDUCER
 */
import { combineReducers } from 'redux';
import voteReducer from './voteReducer';
import userReducer from './userReducer';

//=>combineReducers合并reducer
// 为了防止各个reducer中的状态合并后会冲突，合并后的reducer按照属性进行模块的划分
/*
 state={
	 //=>模块名是combine的时候指定的属性名
	 vote:{
		 title:'',
		 supNum:0,
		 oppNum:0
	 },
	 user:{
		 title:''
	 }
 };

 => store.getState().vote.supNum 再获取状态就要指定对应的模块了
 */
const reducer = combineReducers({
  vote: voteReducer,
  user: userReducer,
});
export default reducer;
```

voteReducer.js

```jsx | pure
import * as TYPES from '../action-types';
const initialState = {
  title: 'REDUX其实也不难学？',
  supNum: 0,
  oppNum: 0,
};
export default function voteReducer(state = initialState, action) {
  state = JSON.parse(JSON.stringify(state));
  switch (action.type) {
    case TYPES.VOTE_SUPPORT:
      state.supNum += action.payload;
      break;
    case TYPES.VOTE_OPPOSE:
      state.oppNum += action.num;
      break;
  }
  return state;
}
```

3. action-types.js

```js
/*
 * 派发行为标识ACTION.TYPE的宏管理
 */
export const VOTE_SUPPORT = 'VOTE_SUPPORT';
export const VOTE_OPPOSE = 'VOTE_OPPOSE';
```

4. index.js

```js
/*
 * 创建STORE
 */
import { createStore } from 'redux';
import reducer from './reducers';

const store = createStore(reducer);
export default store;
```

## 3.my-combineReducers

```jsx | pure
const combineReducers = function combineReducers(reducers) {
  /* reducers是一个对象，以键值对存储了：模块名 & 每个模块的reducer 
     => reducerskeys:['vote','personal'] 
  */
  const reducerskeys = Reflect.ownKeys(reducers);
  /* 
    返回一个合并的 reducer 
      + 每一次 dispatch 派发，都是把这个 reducer 执行
      + state 就是 redux 容器中的公共状态
      + action 就是派发时候传递进来的行为对象
  */
  return function reducer(state = {}, action) {
    /* 
    把reducers中的每一个小的reducer（每个模块的reducer）执行；
    把对应模块的 state状态 和 action行为对象 传递进来；
    返回的值替换当前模块下的状态 
   */
    const nextState = {};
    reducerskeys.forEach((key) => {
      // key:'vote'/'user'模块名
      // reducer:每个模块的reducer
      const reducer = reducers[key];
      nextState[key] = reducer(state[key], action);
    });
    return nextState;
  };
};
export default combineReducers;

/* 
store.dispatch({
    type: TYPES.VOTE_SUPPORT
}); 
*/
```
