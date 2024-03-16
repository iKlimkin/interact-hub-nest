export const constants = {
  invalidConstants: {
    anyData: '019230102',
  },

  inputData: {
    length02: '02',
    length05: 'len05',
    length16: '1234567891234567',
    length21: '123456789123456789101',
    length31: 'length_31-SADDJKCJKSDWKLKASDLKQ',
    length101:
      'length_101-DnZlTI1khUHpqOqCzftIYiSHCV8fKjYFQOoCIwmUczzW9V5K8cqY3aPKo3XKwbfrmeWOJyQgGnlX5sP3aW3RlaRSQx',
    length501: `length_101-ZkLfwqj2Xv7IgPm6HsT8Bb0Ay3Wu1UeR4FdVcYn5NhCpOxQr9DzGtJkMlXaEqSv4HbUiLrQzNjGo5Xl7Mp1Uf5Ct1Nw2Jd5Jg7Lr5Hb7Jx4Sd6Tp2Lo3Wk9Xf6Dc8Yn1Hc9On1Zx4Gp0Yz3Hl6Ht2Br3Cp1Uw4Jn8Zc2Yq7Lk0Qy3Mv6Uc7Hx8Sj2Fl4Xn7Yp8Lw9Jn2Ae3Cm4Oi5Nl8Zp1Lk3Nt9Zq6Fj8Br4Ud5Xy2Wv9Ml3Cg0Ol4Kj7Gx3Sl9Br2Tg5Jp6Uq1Eg9Vz0Oi2Qp4Bk6Fg7Qz1Xv4Bx3Og1Kv8Tz4Vl2Jc5Oq9Uz3Sx6Ow1Zk2Wl8Tq3Sm5Lx0Mv1Zc3Bq6Zy4En9Wc2Lq3Jf5Zy2Gv8Om1Ry7Xc2Nl6Wr8Hl3Km1Sj9Mp7Gt8Dj6Pz5In9Qx1Aq2Kn5Hl4Ir9Nc1Rw2Ki3Zx8Uy5Nk7Bj1Gv3Bc5Fp6Il9Kj0Ll2Gv9Hq3Mi6Pj2Yo5Ks9Yc3Dz0Mi8Rj`,
    length1001: 'length_1001-' + 'x'.repeat(989),
    EMAIL: 'kr4mboy@gmail.com',
    EMAIL2: 'kr4mboy@gmail.ru',
    PASSWORD: 'password',
  },
};

export const blogsData = {
  philosophers: [
    'Socrat',
    'Aristotel',
    'Plato',
    'Descartes',
    'Kant',
    'Nietzsche',
    'Confucius',
    'Hume',
    'Russell',
  ],
  
  description: {
    1: 'Ancient Greek philosopher known for his contributions to ethics and the Socratic method.',
    2: 'Greek philosopher and student of Plato, he founded the Peripatetic school and made significant contributions to various fields.',
    3: 'Greek philosopher who founded the Academy in Athens and wrote philosophical dialogues.',
    4: 'French philosopher, mathematician, and scientist, known for his famous phrase "Cogito, ergo sum" (I think, therefore I am).',
    5: 'German philosopher who developed the concept of transcendental idealism and contributed to ethical philosophy.',
    6: 'German philosopher and cultural critic, known for his critiques of traditional European morality.',
    7: 'Chinese philosopher and teacher, his teachings emphasize morality, family loyalty, and social harmony.',
    8: 'Scottish philosopher known for his empiricism and skepticism, influencing the development of Western philosophy.',
    9: 'British philosopher and logician, a key figure in the development of analytic philosophy in the 20th century.',
  },

  websiteUrl: {
    1: 'https://socrat-yaol.com',
    2: 'https://aristotel-yaol.com',
    3: 'https://plato-yaol.com',
    4: 'https://descartes-yaol.com',
    5: 'https://kant-yaol.com',
    6: 'https://nietzsche-yaol.com',
    7: 'https://confucius-yaol.com',
    8: 'https://hume-yaol.com',
    9: 'https://russell-yaol.com',
  }
}


export const createSABlogsDataForTests = () => {
  let data: any[] = [];
  let i = 1;

  while (i !== blogsData.philosophers.length + 1) {
    const currentPhilosopher = blogsData.philosophers[i - 1];

    data.push({
      id: expect.any(String),
      name: currentPhilosopher,
      description: blogsData.description[i],
      websiteUrl: blogsData.websiteUrl[i],
      // userId: expect.any(String),
      isMembership: true,
      createdAt: new Date(new Date().getTime() + i * 1000).toISOString(),
    });

    i++;
  }

  return data;
}
