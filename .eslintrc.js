module.exports =  {
    parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends:  [
      'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      'prettier/@typescript-eslint',  // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
      'plugin:prettier/recommended',  // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
   parserOptions:  {
      ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
      sourceType:  'module',  // Allows for the use of imports
    },
    rules:  {
    "@typescript-eslint/no-non-null-assertion": "off", // allow non-null assertion
    "@typescript-eslint/interface-name-prefix": "off", // skip interface names which does not start with "I" prefix
    "@typescript-eslint/no-explicit-any": "off", // allow datatype any
    "@typescript-eslint/explicit-function-return-type": "off", // ignore missing return types for the time being
    "@typescript-eslint/no-empty-interface": "off", // allow empty interfaces
    "@typescript-eslint/ban-ts-ignore": "off", // allow @ts-ignore comment for the time being
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-use-before-define": "off",
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    },
  };
