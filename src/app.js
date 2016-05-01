import {
  injectDeps
} from 'react-simple-di';
import { combineReducers, createStore } from 'redux';

export default class App {
  constructor(context) {
    if (!context) {
      const message = `Context is required when creating a new app.`;
      throw new Error(message);
    }

    this.context = context;
    this.actions = {};
    this._routeFns = [];
    this._reducers = {};
  }

  _bindContext(_actions) {
    const actions = {};
    for (let key in _actions) {
      if (_actions.hasOwnProperty(key)) {
        const actionMap = _actions[key];
        const newActionMap = {};
        for (let actionName in actionMap) {
          if (actionMap.hasOwnProperty(actionName)) {
            newActionMap[actionName] =
              actionMap[actionName].bind(null, this.context);
          }
        }
        actions[key] = newActionMap;
      }
    }

    return actions;
  }

  loadModule(module) {
    this._checkForInit();

    if (!module) {
      const message = `Should provide a module to load.`;
      throw new Error(message);
    }

    if (module.__loaded) {
      const message = `This module is already loaded.`;
      throw new Error(message);
    }

    if (module.routes) {
      if (typeof module.routes !== 'function') {
        const message = `Module's routes field should be a function.`;
        throw new Error(message);
      }

      this._routeFns.push(module.routes);
    }

    // Load Redux reducers
    if (module.reducers) {
      const reducers = module.reducers;

      if (typeof reducers !== 'object') {
        const message = `Module's reducers field should be a map of reducers.`;
        throw new Error(message);
      }

      for (const key of Object.keys(reducers)) {
        this._reducers[key] = reducers[key];
      }
    }

    const actions = module.actions || {};
    this.actions = {
      ...this.actions,
      ...actions
    };

    if (module.load) {
      if (typeof module.load !== 'function') {
        const message = `module.load should be a function`;
        throw new Error(message);
      }

      // This module has no access to the actions loaded after this module.
      const boundedActions = this._bindContext(this.actions);
      module.load(this.context, boundedActions);
    }

    module.__loaded = true;
  }

  init() {
    this._checkForInit();

    for (const routeFn of this._routeFns) {
      const inject = comp => {
        return injectDeps(this.context, this.actions)(comp);
      };

      routeFn(inject, this.context, this.actions);
    }

    // Create Redux store in the context
    const reducers = this._reducers;
    if (Object.keys(reducers).length > 0) {
      const combined = combineReducers(reducers);
      this.context.ReduxStore = createStore(combined);
    }

    this._routeFns = [];
    this._reducers = {};
    this.__initialized = true;
  }

  _checkForInit() {
    if (this.__initialized) {
      const message = `App is already initialized`;
      throw new Error(message);
    }
  }
}
