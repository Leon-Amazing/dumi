---
title: React路由
order: 3
nav:
  title: React路由
  order: 3
---

[reactrouter 官网](https://reactrouter.com/en/main)

## 路由设计模式

1. 哈希（hash）路由

原理：每一次路由跳转，都是改变页面的 hash 值；并且监听 hashchange 事件，渲染不同的内容。

```html
<nav class="nav-box">
  <a href="#/">首页</a>
  <a href="#/product">产品中心</a>
  <a href="#/personal">个人中心</a>
</nav>
<div class="view-box"></div>

<script>
  // 路由容器
  const viewBox = document.querySelector('.view-box');
  // 路由表
  const routes = [
    {
      path: '/',
      component: '首页内容',
    },
    {
      path: '/product',
      component: '产品中心内容',
    },
    {
      path: '/personal',
      component: '个人中心内容',
    },
  ];

  // 页面一加载，我们设置默认的hash值
  location.hash = '/';

  // 路由匹配的方法
  const routerMatch = function routerMatch() {
    let hash = location.hash.substring(1),
      text = '';
    routes.forEach((route) => {
      if (route.path === hash) {
        text = route.component;
      }
    });
    viewBox.innerHTML = text;
  };
  routerMatch();
  window.addEventListener('hashchange', routerMatch);
</script>
```

2. 浏览器（history）路由

原理：利用 H5 的 [HistoryAPI](https://developer.mozilla.org/zh-CN/docs/Web/API/History_API) 完成路由的切换和组件的渲染！

```html
<nav class="nav-box">
  <a href="/">首页</a>
  <a href="/product">产品中心</a>
  <a href="/personal">个人中心</a>
</nav>
<div class="view-box"></div>

<script>
  const viewBox = document.querySelector('.view-box'),
    navBox = document.querySelector('.nav-box');
  const routes = [
    {
      path: '/',
      component: '首页内容',
    },
    {
      path: '/product',
      component: '产品中心内容',
    },
    {
      path: '/personal',
      component: '个人中心内容',
    },
  ];

  // 路由匹配
  const routerMatch = function routerMatch() {
    let path = location.pathname,
      text = '';
    routes.forEach((route) => {
      if (route.path === path) {
        text = route.component;
      }
    });
    viewBox.innerHTML = text;
  };

  history.pushState({}, '', '/');
  routerMatch();

  // 控制路由切换
  navBox.addEventListener('click', function (ev) {
    let target = ev.target;
    if (target.tagName === 'A') {
      // 阻止默认行为
      ev.preventDefault();
      // 实现路由的跳转
      history.pushState({}, '', target.href);
      routerMatch();
    }
  });

  /* 
     popstate事件触发时机：
     1）点击浏览器的前进、后退按钮
     2）调用history.go/forward/back等方法
     注意：history.pushState/replaceState不会触发此事件
     */
  window.addEventListener('popstate', routerMatch);
</script>
```

## [react-router-dom V5 版本](https://v5.reactrouter.com/web/guides/quick-start)

```bash
yarn add react-router-dom@5.3.4
```

### 基础运用

1. `Link`等组件，需要放在 Router(BrowserRouter/HashRouter)的内部！

2. 每当页面加载或者路由切换的时候，都会去和每一个`Route`进行匹配

   - 和其中一个匹配成功后，还会继续向下匹配，所以需要基于`Switch`处理
   - 默认是“非精准”匹配的，所以我们需要基于 exact 处理

```jsx | pure
/* App.jsx */
import React from 'react';
import { HashRouter, Route, Switch, Redirect, Link } from 'react-router-dom';
import A from './views/A';
import B from './views/B';
import C from './views/C';

const App = function App() {
  return (
    <HashRouter>
      {/* 导航区域 */}
      <nav className="nav-box">
        <Link to="/">A</Link>
        <Link to="/b">B</Link>
        <Link to="/c">C</Link>
      </nav>

      {/* 内容区域 */}
      <div className="content">
        <Switch>
          <Route exact path="/" component={A} />
          <Route path="/b" component={B} />
          <Route path="/c" component={C} />
          {/* <Route component={404组件} /> */}
          <Redirect to="/" />
        </Switch>
      </div>
    </HashRouter>
  );
};

export default App;
```

在路由匹配成功后，可以基于 component 指定需要渲染的组件，也可以基于 render 指定一个函数，基于函数的返回值，动态控制渲染的内容。

```jsx | pure
<Route
  path="/c"
  render={() => {
    if (1 === 1) {
      return <C />;
    }
    return <Redirect to="/" />;
  }}
/>
```

### 二级路由

```jsx | pure
/* App.jsx */
const App = function App() {
  return <HashRouter>
      {/* 导航区域 */}
      <nav className="nav-box">
          <Link to="/a">A</Link>
          ...
      </nav>

      {/* 内容区域 */}
      <div className="content">
          <Switch>
              <Redirect exact from="/" to="/a" />
              <Route path="/a" component={A} />
              ...
          </Switch>
      </div>
  </HashRouter>;
}x

```

```jsx | pure
/* A.jsx */
import React from 'react';
import { Link, Route, Redirect, Switch } from 'react-router-dom';
import A1 from './a/A1';
import A2 from './a/A2';
import A3 from './a/A3';

// 处理样式
import styled from 'styled-components';
const DemoBox = styled.div`
  display: flex;
  .menu {
    a {
      display: block;
    }
  }
`;

const A = function A() {
  // '/a/xxx' 中的 '/a' 不能省略！！
  return (
    <DemoBox>
      <div className="menu">
        <Link to="/a/a1">A1</Link>
        <Link to="/a/a2">A2</Link>
        <Link to="/a/a3">A3</Link>
      </div>
      <div className="content">
        <Switch>
          <Redirect exact from="/a" to="/a/a1" />
          <Route path="/a/a1" component={A1} />
          <Route path="/a/a2" component={A2} />
          <Route path="/a/a3" component={A3} />
        </Switch>
      </div>
    </DemoBox>
  );
};
export default A;
```

构建路由表 router/index.jsx

```jsx | pure
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

const RouterView = function RouterView(props) {
  let { routes } = props;
  return (
    <Switch>
      {routes.map((route, index) => {
        let {
            redirect,
            from,
            to,
            exact,
            path,
            name,
            component: Component,
            meta,
          } = route,
          props = {};
        if (redirect) {
          props = { to };
          if (from) props.from = from;
          if (exact) props.exact = true;
          return <Redirect key={index} {...props} />;
        }
        props = { path };
        if (exact) props.exact = true;
        return (
          <Route
            key={index}
            {...props}
            render={() => {
              // 做一些特殊的处理，例如：登录态检验、导航守卫等
              return <Component />;
            }}
          />
        );
      })}
    </Switch>
  );
};
export default RouterView;
```

router/routes.js

```jsx | pure
import A from '../views/A';
import B from '../views/B';
import C from '../views/C';

/* 
一级路由 
  重定向选项
    + redirect:true
    + from:从哪来
    + to:定向的地址
    + exact:精准匹配
  正常选项
    + path:匹配路径
    + name:路由名称
    + component:需要渲染的组件
    + meta:路由元信息
    + exact:精准匹配
*/
const routes = [
  {
    redirect: true,
    from: '/',
    to: '/a',
    exact: true,
  },
  {
    path: '/a',
    name: 'a',
    component: A,
    meta: {},
  },
  {
    path: '/b',
    name: 'b',
    component: B,
    meta: {},
  },
  {
    path: '/c',
    name: 'c',
    component: C,
    meta: {},
  },
  {
    redirect: true,
    to: '/a',
  },
];
export default routes;
```

router/aRoutes.js

```jsx | pure
/* A组件的二级路由 */
import A1 from '../views/a/A1';
import A2 from '../views/a/A2';
import A3 from '../views/a/A3';

const aRoutes = [
  {
    redirect: true,
    from: '/a',
    to: '/a/a1',
    exact: true,
  },
  {
    path: '/a/a1',
    name: 'a-a1',
    component: A1,
    meta: {},
  },
  {
    path: '/a/a2',
    name: 'a-a2',
    component: A2,
    meta: {},
  },
  {
    path: '/a/a3',
    name: 'a-a3',
    component: A3,
    meta: {},
  },
];
export default aRoutes;
```

App.jsx

```jsx | pure
import { HashRouter, Link } from 'react-router-dom';
import RouterView from './router';
import routes from './router/routes';
const App = function App() {
  return (
    <HashRouter>
      ...
      <div className="content">
        <RouterView routes={routes} />
      </div>
    </HashRouter>
  );
};
export default App;
```

views/A.jsx

```jsx | pure
import { Link } from 'react-router-dom';
import RouterView from "../router";
import aRoutes from "../router/aRoutes";
...
const A = function A() {
    return <DemoBox>
        ...
        <div className="content">
            <RouterView routes={aRoutes} />
        </div>
    </DemoBox>;
};
export default A;
```

路由懒加载 RouterView.jsx

```jsx | pure
const RouterView = function RouterView(props) {
    ...
    return <Switch>
        {routes.map((route, index) => {
            ...
            return <Route key={index} {...props} render={() => {
                return <Suspense fallback={<>加载中...</>}>
                    <Component />
                </Suspense>;
            }} />;
        })}
    </Switch>;
};
export default RouterView;
```

路由表中

```jsx | pure
import { lazy } from 'react';
import A from '../views/A';

const routes = [
...
{
    ...
    component: A
}, {
    ...
    component: lazy(() => import('../views/B'))
}, {
    ...
    component: lazy(() => import('../views/C'))
}
...
];
export default routes;
```

### 受控组件和 withRouter

受控组件和 withRouter

- history -> useHistory
- location -> useLocation
- match -> useRouteMatch

withRouter 高阶函数的作用：让非受控组件具备受控组件的特征

components/HomeHead.jsx

```jsx | pure
import React from 'react';
import { Link, withRouter } from 'react-router-dom';

// 样式
import styled from 'styled-components';
const HomeHeadBox = styled.nav`
  a {
    margin-right: 10px;
  }
`;

const HomeHead = function HomeHead(props) {
  console.log(props);
  return (
    <HomeHeadBox>
      <Link to="/a">A</Link>
      <Link to="/b">B</Link>
      <Link to="/c">C</Link>
    </HomeHeadBox>
  );
};
export default withRouter(HomeHead);
```

### 路由跳转方案

方案一：Link 跳转

```jsx | pure
<Link to="/xxx">导航</Link>
<Link to={{
    pathname:'/xxx',
    search:'',
    state:{}
}}>导航</Link>
<Link to="/xxx" replace>导航</Link>
```

方案二：编程式导航

```jsx | pure
history.push('/c');
history.push({
  pathname: '/c',
  search: '',
  state: {},
});
history.replace('/c');
```

### 路由传参方案

方案一：问号传参

特点：最常用的方案之一；传递信息暴露到 URL 地址中，不安全而且有点丑，也有长度限制。

```jsx | pure
// 传递
history.push({
  pathname: '/c',
  search: 'lx=0&name=leon',
});

// 接收
import { useLocation } from 'react-router-dom';
let { search } = useLocation();
```

方案二：路径参数

特点：目前主流方案之一

```jsx | pure
// 路由表
{
    // :xxx 动态匹配规则
    // ? 可有可无
    path: '/c/:lx?/:name?',
    ....
}

// 传递
history.push(`/c/0/leon`);

//接收
import { useRouteMatch } from 'react-router-dom';
let { params } = useRouteMatch();
```

方案三：隐式传参

特点：传递信息是隐式传递，不暴露在外面；页面刷新，传递的信息就消失了。

```jsx | pure
// 传递
history.push({
  pathname: '/c',
  state: {
    lx: 0,
    name: 'leon',
  },
});

// 接收
import { useLocation } from 'react-router-dom';
let { state } = useLocation();
```

### Link 和 NavLink

NavLink 和 Link 都可以实现路由跳转，只不过 NavLink 有自动匹配，并且设置选中样式「active」的特点。

- 每一次路由切换完毕后「或者页面加载完」，都会拿当前路由地址，和 NavLink 中的 to「或者 to 中的 pathname 进行比较」,给匹配的这一项 A，设置 active 样式类。
- NavLink 可与设置 exact 精准匹配属性
- 可以基于 activeClassName 属性设置选中的样式类名

```jsx | pure
// 结构
<NavLink to="/a">A</NavLink>
<NavLink to="/b">B</NavLink>
<NavLink to="/c">C</NavLink>

// 样式
const NavBox = styled.nav`
   a{
    margin-right: 10px;
    color: #000;
    &.active{
        color:red;
    }
   }
`;
```

## [react-router-dom V6 版本](https://reactrouter.com/en/main)

```bash
yarn add react-router-dom
```

### 基础应用

App.jsx

```jsx | pure
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomeHead from './components/HomeHead';

/* 导入需要的组件 */
import A from './views/A';
import B from './views/B';
import C from './views/C';
import A1 from './views/a/A1.jsx';
import A2 from './views/a/A2.jsx';
import A3 from './views/a/A3.jsx';

const App = function App() {
  return (
    <HashRouter>
      <HomeHead />
      <div className="content">
        <Routes>
          {/* 一级路由 「特殊属性 index」*/}
          <Route path="/" element={<Navigate to="/a" />} />
          <Route path="/a" element={<A />}>
            {/* 二级路由 */}
            <Route path="/a" element={<Navigate to="/a/a1" />} />
            <Route path="/a/a1" element={<A1 />} />
            <Route path="/a/a2" element={<A2 />} />
            <Route path="/a/a3" element={<A3 />} />
          </Route>
          <Route path="/b" element={<B />} />
          <Route path="/c" element={<C />} />
          <Route path="*" element={<Navigate to="/a" />} />
        </Routes>
      </div>
    </HashRouter>
  );
};
export default App;
```

A.jsx

```jsx | pure
import { Link, Outlet } from 'react-router-dom';
...
const A = function A() {
    return <DemoBox>
        ...
        <div className="view">
            <Outlet />
        </div>
    </DemoBox>;
};
export default A;
```

### 跳转及传参

```jsx | pure
// C组件的路由地址
<Route path="/c/:id?/:name?" element={<C />} />

/* 跳转及传参 */
import { useNavigate } from 'react-router-dom';
const B = function B() {
    const navigate = useNavigate();
    return <div className="box">
        B组件的内容
        <button onClick={() => {
            navigate('/c');
            navigate('/c', { replace: true });
            navigate(-1);
            navigate({
                pathname: '/c/100/zxt',
                search: 'id=10&name=zhufeng'
            });
            navigate('/c', { state: { x: 10, y: 20 } });
        }}>按钮</button>
    </div>;
};
export default B;

/* 接收信息 */
import { useParams, useSearchParams, useLocation, useMatch } from 'react-router-dom';
const C = function C() {
    //获取路径参数信息
    let params = useParams();
    console.log('useParams:', params);

    //获取问号传参信息
    let [search] = useSearchParams();
    search = search.toString();
    console.log('useSearchParams:', search);

    //获取location信息「pathname/serach/state...」
    let location = useLocation();
    console.log('useLocation:', location);

    //获取match信息
    console.log('useMatch:', useMatch(location.pathname));

    return <div className="box">
        C组件的内容
    </div>;
};
export default C;
```

### 路由表及懒加载

router/index.js

```jsx | pure
import React, { Suspense } from 'react';
import {
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation,
  useMatch,
} from 'react-router-dom';
import routes from './routes';

// 渲染内容的特殊处理
const Element = function Element(props) {
  let { component: Component, path } = props,
    options = {
      navigate: useNavigate(),
      params: useParams(),
      query: useSearchParams()[0],
      location: useLocation(),
      match: useMatch(path),
    };
  return <Component {...options} />;
};

// 递归创建路由规则
const createRoute = function createRoute(routes) {
  return (
    <>
      {routes.map((item, index) => {
        return (
          <Route key={index} path={item.path} element={<Element {...item} />}>
            {item.children ? createRoute(item.children) : null}
          </Route>
        );
      })}
    </>
  );
};

// 路由表管控
const RouterView = function RouterView() {
  return (
    <Suspense fallback={<>正在加载中...</>}>
      <Routes>{createRoute(routes)}</Routes>
    </Suspense>
  );
};
export default RouterView;
```

router/routes.js

```jsx | pure
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import A from '../views/A';
import aRoutes from './aRoutes';

const routes = [
  {
    path: '/',
    component: () => <Navigate to="/a" />,
  },
  {
    path: '/a',
    name: 'a',
    component: A,
    meta: {},
    children: aRoutes,
  },
  {
    path: '/b',
    name: 'b',
    component: lazy(() => import('../views/B')),
    meta: {},
  },
  {
    path: '/c',
    name: 'c',
    component: lazy(() => import('../views/C')),
    meta: {},
  },
  {
    path: '*',
    component: () => <Navigate to="/a" />,
  },
];
export default routes;
```

router/aRoutes.js

```jsx | pure
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
const aRoutes = [
  {
    path: '/a',
    component: () => <Navigate to="/a/a1" />,
  },
  {
    path: '/a/a1',
    name: 'a-a1',
    component: lazy(() => import('../views/a/A1')),
    meta: {},
  },
  {
    path: '/a/a2',
    name: 'a-a2',
    component: lazy(() => import('../views/a/A2')),
    meta: {},
  },
  {
    path: '/a/a3',
    name: 'a-a3',
    component: lazy(() => import('../views/a/A3')),
    meta: {},
  },
];
export default aRoutes;
```

App.jsx

```jsx | pure
import React from 'react';
import { HashRouter } from 'react-router-dom';
import HomeHead from './components/HomeHead';
import RouterView from './router';

const App = function App() {
  return (
    <HashRouter>
      <HomeHead />
      <div className="content">
        <RouterView />
      </div>
    </HashRouter>
  );
};

export default App;
```
