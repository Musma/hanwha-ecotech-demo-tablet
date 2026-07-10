import musmaVueConfig from '@musma/eslint-config-vue'

const eslintConfig = musmaVueConfig.map((config) => {
  const prettierRule = config.rules?.['prettier/prettier']

  if (!Array.isArray(prettierRule)) {
    return config
  }

  const [severity, options, ...rest] = prettierRule

  if (!options || typeof options !== 'object') {
    return config
  }

  const { plugins: _plugins, ...prettierOptions } = options

  return {
    ...config,
    rules: {
      ...config.rules,
      'prettier/prettier': [severity, prettierOptions, ...rest],
    },
  }
})

export default eslintConfig
