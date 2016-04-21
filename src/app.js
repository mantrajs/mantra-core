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
      module.load(this.context);
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
