import {
  injectDeps
} from 'react-simple-di';

export default class App {
  constructor(context) {
    if (!context) {
      const message = `Context is required when creating a new app.`;
      throw new Error(message);
    }

    this.context = context;
    this.actions = {};
    this._routeFns = [];
  }

  _bindContext(_actions) {
    const actions = {};

    for (let namespace in _actions) {
      if (_actions.hasOwnProperty(namespace)) {
        actions[namespace] = {};
        const namespaceActions = _actions[namespace];
        for (var namespaceAction in namespaceActions) {
          if (namespaceActions.hasOwnProperty(namespaceAction)) {
            actions[namespace][namespaceAction] = {};
            var actionFuncs = namespaceActions[namespaceAction];
            var actionFuncsExist = false;
            for (var actionFunc in actionFuncs) {
              if (actionFuncs.hasOwnProperty(actionFunc)
                && typeof actionFuncs[ actionFunc ] === 'function'
              ) {
                actions[namespace][namespaceAction][actionFunc]
                  = actionFuncs[actionFunc].bind(null, this.context);
                actionFuncsExist = true;
              }
            }
            if (! actionFuncsExist
              && actions.hasOwnProperty(namespace)
              && typeof actionFuncs === 'function'
            ) {
              actions[namespace][namespaceAction] = actionFuncs.bind(null, this.context);
            }
          }
        }
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

    this._routeFns = [];
    this.__initialized = true;
  }

  _checkForInit() {
    if (this.__initialized) {
      const message = `App is already initialized`;
      throw new Error(message);
    }
  }
}
