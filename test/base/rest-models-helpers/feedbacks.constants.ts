export const feedbacksConstants = {
  createdContent: [
    'content include discussion about nature',
    'content include discussion about freedom',
    'content include discussion about environment',
    'content include discussion about neuroscience',
    'content include discussion about neurobiology',
  ],

  sortBy: [
    {
      id: expect.any(String),
      name: 'Marcus Aurelius',
      description: 'Stoic philosopher',
      websiteUrl: 'https://en.wikipedia.org/wiki/Stoicism',
      createdAt: expect.any(String),
      isMembership: false,
    },
    {
      id: expect.any(String),
      name: 'Zeno',
      description: 'Stoic philosopher',
      websiteUrl: 'https://en.wikipedia.org/wiki/Stoicism',
      createdAt: expect.any(String),
      isMembership: false,
    },
  ],

  invalidBlog: {},
};

export const authConstants = {
  invalidToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWIxMDg5MGQzODQ5NjVkZTAwNzA0N2EiLCJkZXZpY2VJZCI6ImEzOTBkMDcwLTJmYmItNDA2OC04NzkxLTMzZDllMTM4MmIzNSIsImlhdCI6MTcwNjEwMDk2NywiZXhwIjoxNzA2MTA4MTY3fQ.kogQ9UmVq8o4_y86jgypss0Et1pLY5oMIKEDEY7kGlE'
}
