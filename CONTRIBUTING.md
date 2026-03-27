# Contributing to @morsecodeapp/morse

Thank you for your interest in contributing! This library is maintained by the team behind [morsecodeapp.com](https://morsecodeapp.com).

## Getting Started

```bash
git clone https://github.com/AppsYogi-com/morsecodeapp.git
cd morsecodeapp
npm install
npm run build
npm test
```

## Development Workflow

1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feat/my-feature`
3. **Write tests** before or alongside your code
4. **Run tests**: `npm test`
5. **Build**: `npm run build`
6. **Check bundle size**: `npm run size`
7. **Submit a PR** with a clear description

## Code Style

- TypeScript strict mode — no `any`, handle all edge cases
- Every public function must have JSDoc comments
- Prefer named exports over default exports
- Keep functions pure where possible

## Testing

- All tests in `test/` directory, mirroring `src/` structure
- Use Vitest: `npm test` or `npx vitest --watch`
- Target 90%+ coverage on statements, branches, functions, and lines

## Adding a Character Set

1. Create `src/core/charsets/<id>.ts` (use existing ones as template)
2. Add the charset to the registry in `src/core/charsets/index.ts`
3. Add the `CharsetId` union member in `src/core/types.ts`
4. Add tests in `test/core/charsets.test.ts`
5. Update `README.md` charset table

## Bundle Size

We use `size-limit` to guard bundle size. Check with:

```bash
npm run size
```

Target: core ≤ 5KB gzipped, full ≤ 6KB gzipped.

## Reporting Issues

Please open an issue on [GitHub](https://github.com/AppsYogi-com/morsecodeapp/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node version, browser, bundler)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Built with ❤️ by [MorseCodeApp](https://morsecodeapp.com)
