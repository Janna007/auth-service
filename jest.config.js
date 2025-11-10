const { createDefaultPreset } = require('ts-jest')

const tsJestTransformCfg = createDefaultPreset().transform

/** @type {import("jest").Config} **/
module.exports = {
    // preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        ...tsJestTransformCfg,
    },
    verbose: true,
    // transformIgnorePatterns: [
    //     'node_modules/(?!(mock-jwks|until-async)/)', // 👈 allow transforming ESM deps
    //   ],
}
