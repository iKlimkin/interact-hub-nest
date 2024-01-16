export const wait = (sec: number): Promise<boolean> => {
  return new Promise((res) => {
    setTimeout(() => res(true), sec * 1000);
  });
};
