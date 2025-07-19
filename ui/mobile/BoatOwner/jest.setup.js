// Jest setup file to mock @expo/vector-icons for test environment
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (target, prop) => {
      // Return a dummy component for any icon
      return (props) => React.createElement('Icon', props);
    },
  });
});
