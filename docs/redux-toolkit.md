---
title: Redux-Toolkit
order: 8
nav:
  title: Redux-Toolkit
  order: 8
---

React-Toolkit 旨在成为编写 Redux 逻辑的标准方式

## 1.文件拆分

增加一个 store 文件夹

```js
store
    ├─features
	  │   │
    │   └─taskSlice.js
    └─index.js
```

## 2.React-Toolkit 用法

index.js

```jsx | pure
import { configureStore } from '@reduxjs/toolkit';
import reduxLogger from 'redux-logger';
import reduxThunk from 'redux-thunk';
import taskSliceReducer from './features/taskSlice';

const store = configureStore({
  // 指定reducer
  reducer: {
    // 按模块管理各个切片导出的reducer
    task: taskSliceReducer,
  },
  // 使用中间件「如果不指定任何中间件，则默认集成了reduxThunk；
  // 但是一但设置，会整体替换默认值，需要手动指定thunk中间件！」
  middleware: [reduxLogger, reduxThunk],
});
export default store;
```

taskSlice.js

```jsx | pure
/* TASK版块的切片，包含：REDUCER & ACTION-CREATOR */
import { createSlice } from '@reduxjs/toolkit';
import { getTaskList } from '../../api';

const taskSlice = createSlice({
  // 设置切片的名字
  name: 'task',
  // 设置此切片对应reducer中的初始状态
  initialState: {
    taskList: null,
  },
  // 编写不同业务逻辑下，对公共状态的更改
  reducers: {
    getAllTaskList(state, action) {
      // state:redux中的公共状态信息「基于immer库管理，无需自己再克隆了」
      // action:派发的行为对象，我们无需考虑行为标识的问题了；
      // 传递的其他信息，都是以action.payload传递进来的值！！
      state.taskList = action.payload;
    },
    removeTask(state, { payload }) {
      let taskList = state.taskList;
      if (!Array.isArray(taskList)) return;
      state.taskList = taskList.filter((item) => {
        // payload:接收传递进来的，要删除那一项的ID
        return +item.id !== +payload;
      });
    },
    updateTask(state, { payload }) {
      let taskList = state.taskList;
      if (!Array.isArray(taskList)) return;
      state.taskList = taskList.map((item) => {
        if (+item.id === +payload) {
          item.state = 2;
          item.complete = new Date().toLocaleString('zh-CN');
        }
        return item;
      });
    },
  },
});

// 从切换中获取actionCreator：此处解构的方法和上面reducers中的方法，仅仅是函数名相同；
// 方法执行，返回需要派发的行为对象；后期我们可以基于dispatch进行任务派发即可！！
export let { getAllTaskList, removeTask, updateTask } = taskSlice.actions;
// console.log(getAllTaskList([])); //=>{type: 'task/getAllTaskList', payload: []}
export const removeTaskAction = removeTask;
export const updateTaskAction = updateTask;

// 实现异步派发「redux-thunk」
export const getAllTaskListAsync = () => {
  return async (dispatch) => {
    let list = [];
    try {
      let result = await getTaskList(0);
      if (+result.code === 0) {
        list = result.list;
      }
    } catch (_) {}
    dispatch(getAllTaskList(list));
  };
};

// 从切片中获取reducer
export default taskSlice.reducer;
```

index.jsx

```jsx | pure {9,10,15}
import React from 'react';
import ReactDOM from 'react-dom/client';
import Task from './views/Task';
/* 使用ANTD组件库 */
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './index.less';
/* REDUX */
import store from './store';
import { Provider } from 'react-redux';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider locale={zhCN}>
    <Provider store={store}>
      <Task />
    </Provider>
  </ConfigProvider>,
);
```

Task.jsx

```jsx | pure {15-20,35-36,108,140,156,168}
import React, { useState, useEffect } from 'react';
import './Task.less';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Table,
  Tag,
  message,
} from 'antd';
import { getTaskList, addTask, removeTask, completeTask } from '@/api';
import { useSelector, useDispatch } from 'react-redux';
import {
  getAllTaskListAsync,
  removeTaskAction,
  updateTaskAction,
} from '../store/features/taskSlice';

/* 对日期处理的方法 */
const zero = function zero(text) {
  text = String(text);
  return text.length < 2 ? '0' + text : text;
};
const formatTime = function formatTime(time) {
  let arr = time.match(/\d+/g),
    [, month, day, hours = '00', minutes = '00'] = arr;
  return `${zero(month)}-${zero(day)} ${zero(hours)}:${zero(minutes)}`;
};

const Task = function Task() {
  /* 获取公共状态和派发的方法 */
  let { taskList } = useSelector((state) => state.task),
    dispatch = useDispatch();

  /* 表格列的数据 */
  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      align: 'center',
      width: '8%',
    },
    {
      title: '任务描述',
      dataIndex: 'task',
      ellipsis: true,
      width: '50%',
    },
    {
      title: '状态',
      dataIndex: 'state',
      align: 'center',
      width: '10%',
      render: (text) => (+text === 1 ? '未完成' : '已完成'),
    },
    {
      title: '完成时间',
      dataIndex: 'time',
      align: 'center',
      width: '15%',
      render: (_, record) => {
        let { state, time, complete } = record;
        if (+state === 2) time = complete;
        return formatTime(time);
      },
    },
    {
      title: '操作',
      render: (_, record) => {
        let { id, state } = record;
        return (
          <>
            <Popconfirm
              title="您确定要删除此任务吗？"
              onConfirm={removeHandle.bind(null, id)}
            >
              <Button type="link">删除</Button>
            </Popconfirm>

            {+state !== 2 ? (
              <Popconfirm
                title="您确把此任务设置为完成吗？"
                onConfirm={updateHandle.bind(null, id)}
              >
                <Button type="link">完成</Button>
              </Popconfirm>
            ) : null}
          </>
        );
      },
    },
  ];

  /* 定义需要的状态 */
  let [selectedIndex, setSelectedIndex] = useState(0),
    [tableData, setTableData] = useState([]),
    [tableLoading, setTableLoading] = useState(false),
    [modalVisible, setModalVisible] = useState(false),
    [confirmLoading, setConfirmLoading] = useState(false);
  let [formIns] = Form.useForm();

  /* 关于TABLE和数据的处理 */
  useEffect(() => {
    (async () => {
      if (!taskList) {
        setTableLoading(true);
        await dispatch(getAllTaskListAsync());
        setTableLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    if (!taskList) taskList = [];
    if (selectedIndex !== 0) {
      taskList = taskList.filter((item) => {
        return +item.state === selectedIndex;
      });
    }
    setTableData(taskList);
  }, [selectedIndex, taskList]);

  /* 关于Modal和表单的处理 */
  const closeModal = () => {
    setModalVisible(false);
    setConfirmLoading(false);
    formIns.resetFields();
  };
  const submit = async () => {
    try {
      await formIns.validateFields();
      let { task, time } = formIns.getFieldsValue();
      time = time.format('YYYY-MM-DD HH:mm:ss');
      setConfirmLoading(true);
      let { code } = await addTask(task, time);
      if (+code === 0) {
        closeModal();
        // 重新派发异步任务，获取全局任务信息同步到redux中
        setTableLoading(true);
        await dispatch(getAllTaskListAsync());
        setTableLoading(false);
        message.success('恭喜您，操作成功了！');
      } else {
        message.error('很遗憾，操作失败了，请稍后再试！');
      }
    } catch (_) {}
    setConfirmLoading(false);
  };

  /* 关于删除和完成的操作 */
  const removeHandle = async (id) => {
    try {
      let { code } = await removeTask(id);
      if (+code === 0) {
        // 实现派发
        dispatch(removeTaskAction(id));
        message.success('恭喜您，操作成功了！');
      } else {
        message.error('很遗憾，操作失败了，请稍后再试！');
      }
    } catch (_) {}
  };
  const updateHandle = async (id) => {
    try {
      let { code } = await completeTask(id);
      if (+code === 0) {
        // 实现派发
        dispatch(updateTaskAction(id));
        message.success('恭喜您，操作成功了！');
      } else {
        message.error('很遗憾，操作失败了，请稍后再试！');
      }
    } catch (_) {}
  };

  return (
    <div className="task-box">
      {/* 头部 */}
      <div className="header">
        <h2 className="title">TASK OA 任务管理系统</h2>
        <Button
          type="primary"
          onClick={() => {
            setModalVisible(true);
          }}
        >
          新增任务
        </Button>
      </div>

      {/* 标签 */}
      <div className="tag-box">
        {['全部', '未完成', '已完成'].map((item, index) => {
          return (
            <Tag
              key={index}
              color={index === selectedIndex ? '#1677ff' : ''}
              onClick={() => {
                setSelectedIndex(index);
              }}
            >
              {item}
            </Tag>
          );
        })}
      </div>

      {/* 表格 */}
      <Table
        columns={columns}
        dataSource={tableData}
        loading={tableLoading}
        pagination={false}
        rowKey="id"
      />

      {/* 对话框 & 表单 */}
      <Modal
        title="新增任务窗口"
        open={modalVisible}
        confirmLoading={confirmLoading}
        keyboard={false}
        maskClosable={false}
        okText="确认提交"
        onCancel={closeModal}
        onOk={submit}
      >
        <Form
          layout="vertical"
          initialValues={{ task: '', time: '' }}
          validateTrigger="onBlur"
          form={formIns}
        >
          <Form.Item
            label="任务描述"
            name="task"
            rules={[
              { required: true, message: '任务描述是必填项' },
              { min: 6, message: '输入的内容至少6位及以上' },
            ]}
          >
            <Input.TextArea rows={4}></Input.TextArea>
          </Form.Item>
          <Form.Item
            label="预期完成时间"
            name="time"
            rules={[{ required: true, message: '预期完成时间是必填项' }]}
          >
            <DatePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Task;
```
