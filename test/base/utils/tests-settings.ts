export const skipSettings = {
  run_all_tests: false,

  appTests: false,

  for(testName: TestsNames): boolean {
    if (this.run_all_tests) {
      return false;
    }

    if (typeof this[testName] === 'boolean') {
      return this[testName];
    }

    return false;
  },
};

export type TestsNames = 'appTests';
