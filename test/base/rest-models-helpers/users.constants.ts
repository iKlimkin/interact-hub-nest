import { AuthUserType } from '../../../src/features/auth/api/models/auth.output.models/auth.user.types';

export const userConstants = {
  invalidData: {
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWIxMDg5MGQzODQ5NjVkZTAwNzA0N2EiLCJkZXZpY2VJZCI6ImEzOTBkMDcwLTJmYmItNDA2OC04NzkxLTMzZDllMTM4MmIzNSIsImlhdCI6MTcwNjEwMDk2NywiZXhwIjoxNzA2MTA4MTY3fQ.kogQ9UmVq8o4_y86jgypss0Et1pLY5oMIKEDEY7kGlE',

    anyData: '019230102',
  },

  registrationData: {
    length101:
      'length_101-DnZlTI1khUHpqOqCzftIYiSHCV8fKjYFQOoCIwmUczzW9V5K8cqY3aPKo3XKwbfrmeWOJyQgGnlX5sP3aW3RlaRSQx',
    length02: '02',
    length05: 'len05',
    length21: '123456789123456789101',
    EMAIL: 'kr4mboy@gmail.com',
    EMAIL2: 'kr4mboy@gmail.ru',
    PASSWORD: 'password',
  },
};

export const defaultSA = {
  pagesCount: 1,
  page: 1,
  pageSize: 10,
  totalCount: 9,
  items: [
    {
      id: expect.any(String),
      login: 'ykt91Ue6F9',
      password: 'qwerty9',
      email: 'qwert9wq@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91eU6F8',
      password: 'qwerty8',
      email: 'qwert8QW@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91Ue6F7',
      password: 'qwerty7',
      email: 'qwert7wq@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91eU6F6',
      password: 'qwerty6',
      email: 'qwert6QW@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91Ue6F5',
      password: 'qwerty5',
      email: 'qwert5wq@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91eU6F4',
      password: 'qwerty4',
      email: 'qwert4QW@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91Ue6F3',
      password: 'qwerty3',
      email: 'qwert3wq@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91eU6F2',
      password: 'qwerty2',
      email: 'qwert2QW@yaol.com',
      createdAt: expect.any(String),
    },
    {
      id: expect.any(String),
      login: 'ykt91Ue6F1',
      password: 'qwerty1',
      email: 'qwert1wq@yaol.com',
      createdAt: expect.any(String),
    },
  ],
};

function createSADataForTest() {
  let data: any[] = [];
  let i = 1;

  while (i < 10) {
    data.push({
      login: `ykt91${i % 2 === 0 ? 'eU' : 'Ue'}6F${i}`,
      password: `qwerty${i}`,
      email: `qwert${i % 2 === 0 ? i + 'QW' : i + 'wq'}@yaol.com`,
      createdAt: new Date(new Date().getTime() + i * 1000).toISOString(),
    });

    i++;
  }

  return data;
}


