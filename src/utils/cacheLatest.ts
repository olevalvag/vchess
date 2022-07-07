// import _ from '@types/underscore';
// import _ from 'underscore'

export function cacheLatest<T, U>(f: (arg: T) => U): ((arg: T) => U) {
  let firstCall: boolean = true;
  let lastArg: T;
  let lastResult: U;

  /*return (arg: T) => {
    if (firstCall || !_.isEqual(arg, lastArg)) {
      firstCall = false;
      lastArg = arg;
      return (lastResult = f(arg));
    }
    return lastResult;
  };*/

  return (arg: T) => {
    if (firstCall || arg !== lastArg) {
      firstCall = false;
      lastArg = arg;
      return (lastResult = f(arg));
    }
    return lastResult;
  };
}
