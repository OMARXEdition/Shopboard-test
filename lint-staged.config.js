export default {
  '*.{js,ts}': ['eslint --fix --max-warnings 0', 'prettier --write'],
  '*.{html,css,json,md}': 'prettier --write',
}
