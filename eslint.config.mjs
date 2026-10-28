import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextCoreWebVitals,
  { ignores: ['.next/**', 'node_modules/**', 'public/**', '.local/**'] },
]

export default config
