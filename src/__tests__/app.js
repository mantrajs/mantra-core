// import {expect} from 'chai';
// import {composeAll} from '../app';
const {describe, it} = global;

describe('App', () => {
  describe('loadModule', () => {
    it('should fail if initialized');
    it('should fail if there is no module');
    it('should fail if module is already loaded');
    describe('has routes field', () => {
      it('should fail if routes is not a function');
      it('should save routes if it is a function');
    });

    it('should merge actions with app wide global actions');
    it('should merge actions even actions is an empty field');

    it('should call module.load with the context');
    it('should mark the module as loaded');
  });

  describe('init', () => {
    it('should fail if initialized');
    it('should call all routes functions as the load order');
    it('should mark as initialized');
  });
});
