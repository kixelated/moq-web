# moq-web
Examples of bundler setups running [@kixelated/moq](https://www.npmjs.com/package/@kixelated/moq).
All of the listed frameworks are setup using the Quick Start build with:

- NPM
- React
- Typescript

If a framework is listed as supported, you can test it via:
```bash
npm i
npm run dev
```


## Frameworks

| Framework                                          | Supported |
|----------------------------------------------------|-----------|
| [Vite 5](./vite-5)                                 | ✅[^1]     |
| [Vite 6](./vite-6)                                 | ❔[^2]     |
| [Next.JS 15](./next-15)                            | ❌[^3]     |
| [Astro 4](https://github.com/kixelated/quic.video) | ✅[^4]     |
| [Rspack 1](https://github.com/kixelated/moq-rs)    | ✅         |

[^1]: Requires [skipping optimizations](https://github.com/vitejs/vite/issues/8427) to work.
[^2]: The [vite-plugin-wasm is out of date](https://github.com/Menci/vite-plugin-wasm/issues/62) and doesn't support Vite 6 (yet).
[^3]: Next.JS is fundamentally incompatible due to the reliance on SSR. `moq-web` MUST run in the browser but I couldn't get dynamic imports to work.
[^4]: Uses Vite 5 under the hood.