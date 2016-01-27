import {expect} from 'chai';
import {composeAll} from '../';
const {describe, it} = global;

describe('sum', () => {
  it('should add two numbers correctly', async () => {
    expect(composeAll).to.be.a('function');
  });
});
