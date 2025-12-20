/**
 * @name Umi route configuration
 * @description Only supports path, component, routes, redirect, wrappers, name, icon configuration
 * @param path Supports two types of placeholders: dynamic parameter :id format, and * wildcard (must appear at the end)
 * @param component React component path for rendering when location matches path. Can be absolute or relative path (relative to src/pages)
 * @param routes Configure sub-routes, usually used when adding layout components for multiple paths
 * @param redirect Configure route redirect
 * @param wrappers Configure wrapper components for route components, can add more functionality through wrappers (e.g., route-level permission validation)
 * @param name Configure route title, defaults to reading menu.xxxx value from internationalization file menu.ts
 * @param icon Configure route icon, refer to https://ant.design/components/icon-cn (remove style suffix and case, e.g., <StepBackwardOutlined /> -> stepBackward or StepBackward)
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: "/user",
    layout: false,
    routes: [
      {
        path: "/user/login",
        layout: false,
        name: "login",
        component: "./user/login",
      },
      {
        path: "/user",
        redirect: "/user/login",
      },
      {
        name: "register-result",
        icon: "smile",
        path: "/user/register-result",
        component: "./user/register-result",
      },
      {
        name: "register",
        icon: "smile",
        path: "/user/register",
        component: "./user/register",
      },
      {
        component: "404",
        path: "/user/*",
      },
    ],
  },
    {
    name: "Báo cáo kết quả quét",
    icon: "scan",
    path: "/scan-reports",
    component: "./scan-reports",
  },
  {
    name: "Quản lý cây trồng",
    icon: "experiment",
    path: "/plant",
    component: "./plant",
  },
  {
    name: "Quản lý bệnh cây",
    icon: "bug",
    path: "/disease",
    component: "./disease",
  },
  {
    name: "Từ khóa hoạt động",
    icon: "tags",
    path: "/activity-keyword",
    component: "./activity-keyword",
  },
  {
    name: "Quản lý báo cáo",
    icon: "flag",
    path: "/complaint",
    component: "./complaint",
  },
  {
    name: "Quản lý người dùng",
    icon: "user",
    path: "/users",
    component: "./users",
  },
  {
    name: "Quản lý tin tức",
    icon: "read",
    path: "/news",
    component: "./news",
  },
    {
    name: "Mẹo canh tác",
    icon: "setting",
    path: "/farming-guide",
    component: "./farming-guide",
  },
  {
    path: "/",
    redirect: "/scan-reports",
  },
  {
    component: "404",
    path: "./*",
  },
];
