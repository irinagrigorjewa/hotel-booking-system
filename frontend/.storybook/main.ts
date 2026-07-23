import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { StorybookConfig } from '@storybook/react-vite'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@shared': path.resolve(rootDir, '../src/shared'),
      '@entities': path.resolve(rootDir, '../src/entities'),
      '@features': path.resolve(rootDir, '../src/features'),
      '@widgets': path.resolve(rootDir, '../src/widgets'),
      '@pages': path.resolve(rootDir, '../src/pages'),
      '@app': path.resolve(rootDir, '../src/app'),
    }
    return config
  },
}

export default config
