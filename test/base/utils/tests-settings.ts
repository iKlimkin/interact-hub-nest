export const skipSettings = {
  run_all_tests: false,

  userAuth: false,
  userAuthSql: true,
  posts: true,
  appTests: true,
  blogs: true,

  for(testName: TestsName): boolean {
    if (this.run_all_tests) {
      return false;
    }

    if (typeof this[testName] === 'boolean') {
      return this[testName];
    }

    return false;
  },
};

enum TestsNames {
  appTests = 'appTests',
  userAuth = 'userAuth',
  userAuthSql = 'userAuthSql',
  posts = 'posts',
  blogs = 'blogs',
}

type TestsName = keyof typeof TestsNames;
