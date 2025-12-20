// https://umijs.org/config/

import { join } from 'path';
import { defineConfig } from '@umijs/max';
import defaultSettings from './defaultSettings';

import routes from './routes';

const { REACT_APP_ENV = 'dev' } = process.env;

/**
 * @name Public path configuration
 * @description Path for deployment, configure this if deploying to a non-root directory
 * @doc https://umijs.org/docs/api/config#publicpath
 */
const PUBLIC_PATH: string = '/';

export default defineConfig({
  /**
   * @name Enable hash mode
   * @description Add hash suffix to build output. Usually used for incremental releases and avoiding browser cache.
   * @doc https://umijs.org/docs/api/config#hash
   */
  hash: true,

  publicPath: PUBLIC_PATH,

  /**
   * @name Compatibility settings
   * @description Setting ie11 may not be perfectly compatible, need to check all dependencies
   * @doc https://umijs.org/docs/api/config#targets
   */
  // targets: {
  //   ie: 11,
  // },
  /**
   * @name Route configuration
   * @description Only supports path, component, routes, redirect, wrappers, title configuration
   * @doc https://umijs.org/docs/guides/routes
   */
  // umi routes: https://umijs.org/docs/routing
  routes,
  /**
   * @name Theme configuration
   * @description Less variable settings
   * @doc antd theme settings https://ant.design/docs/react/customize-theme-cn
   * @doc umi theme config https://umijs.org/docs/api/config#theme
   */
  // theme: { '@primary-color': '#1DA57A' }
  /**
   * @name Moment internationalization configuration
   * @description If internationalization is not required, enabling this can reduce js bundle size
   * @doc https://umijs.org/docs/api/config#ignoremomentlocale
   */
  ignoreMomentLocale: true,
  /**
   * @name Fast refresh configuration
   * @description A good hot update component that can preserve state during updates
   */
  fastRefresh: true,
  // ============== Max plugin configurations below ===============
  /**
   * @name Data flow plugin
   * @doc https://umijs.org/docs/max/data-flow
   */
  model: {},
  /**
   * @name Global initial state
   * @description Can be used to store global data, such as user information or global state
   * @doc https://umijs.org/docs/max/data-flow#%E5%85%A8%E5%B1%80%E5%88%9D%E5%A7%8B%E7%8A%B6%E6%80%81
   */
  initialState: {},
  /**
   * @name Layout plugin
   * @doc https://umijs.org/docs/max/layout-menu
   */
  title: 'Plantheon',
  layout: {
    locale: false, // Disable i18n
    ...defaultSettings,
  },
  /**
   * @name moment2dayjs plugin
   * @description Replace moment with dayjs in the project
   * @doc https://umijs.org/docs/max/moment2dayjs
   */
  moment2dayjs: {
    preset: 'antd',
    plugins: ['duration'],
  },
  /**
   * @name Internationalization plugin - English only
   * @description Using English only, but keeping i18n enabled for useIntl/FormattedMessage
   */
  locale: {
    default: 'en-US',
    antd: true,
    baseNavigator: false,
  },
  /**
   * @name antd plugin
   * @description Built-in babel import plugin
   * @doc https://umijs.org/docs/max/antd#antd
   */
  antd: {
    appConfig: {},
    configProvider: {
      theme: {
        cssVar: true,
        token: {
          fontFamily: 'AlibabaSans, sans-serif',
        },
      },
    },
  },
  /**
   * @name Network request configuration
   * @description Based on axios and ahooks useRequest, provides unified network request and error handling
   * @doc https://umijs.org/docs/max/request
   */
  request: {},
  /**
   * @name Access plugin
   * @description Permission plugin based on initialState, must enable initialState first
   * @doc https://umijs.org/docs/max/access
   */
  access: {},
  /**
   * @name Extra scripts in <head>
   * @description Configure extra scripts in <head>
   */
  headScripts: [
    // Solve white screen issue on first load
    { src: join(PUBLIC_PATH, 'scripts/loading.js'), async: true },
  ],

  // ================ Pro plugin configurations =================
  presets: ['umi-presets-pro'],

  mock: {
    include: ['src/pages/**/_mock.ts'],
  },
  /**
   * @name Enable mako
   * @description Use mako for rapid development
   * @doc https://umijs.org/docs/api/config#mako
   */
  mako: {},
  esbuildMinifyIIFE: true,
  requestRecord: {},
  exportStatic: {},
  define: {
    'process.env.CI': process.env.CI,
  },
});
