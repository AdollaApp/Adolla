import svelte from 'eslint-plugin-svelte';
import eslint from '@eslint/js';
import globals from 'globals';
import eslintCommentPlugin from '@eslint-community/eslint-plugin-eslint-comments/configs';
import stylisticPlugin from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

const stylisticConfig = stylisticPlugin.configs.customize({
  indent: 2,
  quotes: 'single',
  semi: true,
});

export default tseslint.config(
  {
    // https://eslint.org/docs/rules/
    name: 'adolla/eslint-js',
    extends: [eslint.configs.recommended],
    rules: {
      'require-atomic-updates': 'off',
      'no-console': 'off',
      'prefer-const': ['error', {
        destructuring: 'all',
      }],
      'no-var': 'error',
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' },
      ],
      'one-var': ['error', 'never'],
    },
  },
  {
    // https://typescript-eslint.io/rules/
    name: 'adolla/typescript-eslint',
    extends: [tseslint.configs.recommended],
    files: ['**/*.ts', '**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^ignore' },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        fixStyle: 'separate-type-imports',
      }],
    },
  },
	...svelte.configs['flat/recommended'],
  {
    // https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/
    name: 'adolla/eslint-comments',
    extends: [eslintCommentPlugin.recommended],
    rules: {
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
      '@eslint-community/eslint-comments/require-description': 'error',
    },
  },
	{
		// https://eslint.style/rules
		name: 'adolla/stylistic',
		extends: [stylisticConfig],
		rules: {
			'@stylistic/no-extra-semi': 'error',
			'@stylistic/yield-star-spacing': ['error', 'after'],
			'@stylistic/operator-linebreak': ['error', 'after', { overrides: { '?': 'before', ':': 'before' } }],
			'@stylistic/curly-newline': ['error', {
				multiline: true,
				consistent: true
			}],
			'@stylistic/object-curly-newline': ['error', {
				multiline: true,
				consistent: true
			}],
			'@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }]
		}
	},
  {
    name: 'adolla/globals',
    languageOptions: {
      globals: {
				...globals.browser,
				...globals.node
      },
    },
  },
	{
		files: ['**/*.svelte'],

    languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
  {
    // https://eslint.org/docs/latest/use/configure/ignore
    name: 'adolla/global-ignores',
    ignores: [
      '**/dist/',
      '**/.svelte-kit/',
    ],
  },
);
