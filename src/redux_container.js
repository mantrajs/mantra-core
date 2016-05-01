import React from 'react';
import { Provider, connect } from 'react-redux';
import { useDeps } from 'react-simple-di';
import { composeAll } from 'react-komposer';

const withRedux = (mapStateToProps, mapDispatchToProps, mergeProps,
  options) => {
  const provider = Component => {
    return props => {
      const {context, children, ...nextProps} = props;
      const component = React.createElement(Component, nextProps, children);
      return React.createElement(Provider,
        {store: context().ReduxStore}, component);
    };
  };

  return composeAll(
    connect(mapStateToProps, mapDispatchToProps, mergeProps, options),
    provider,
    useDeps()
  );
};

export default withRedux;
