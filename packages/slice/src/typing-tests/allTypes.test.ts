import { checkDirectory } from 'typings-tester';

test('Types Test', () => {
  checkDirectory(`${__dirname}/files`);
});
