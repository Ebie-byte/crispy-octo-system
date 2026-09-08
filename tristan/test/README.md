# Booking-flow test

Drives the real component source in Chromium and asserts the whole chain:
Book opens the sheet, every filled field reaches the `wa.me` URL for Tristan's
number, validation blocks an empty submit, the form clears after a completed
booking, and the sheet fits a 390px viewport without horizontal overflow.

This exists because the Framer canvas never runs click handlers, so the flow
cannot be checked in the editor — only in Preview or on a published site.
Running it here catches breakage without a publish cycle. It found two real
bugs: the form resurrecting the previous person's details, and a `useRef` read
inside a `setState` updater that ran after the ref had already been reset.

## Running it

The harness rewrites the two `https://framer.com/m/...` imports to local files,
stubs the `framer` package, transpiles with `tsc`, and serves the result.

```
mkdir harness && cd harness
cp ../code/{tristanConfig,TristanIcon,ActionButton,ConsultationSheet}.tsx .
npm init -y && npm i react@18 react-dom@18
# point the module URLs at local files and stub "framer", then:
npx tsc -p .            # emits ./build
npx http-server -p 8899 -s .
node booking-flow.mjs   # imports playwright from the global install
```

Note the transpile reports a few type errors that Framer itself does not: its
runtime resolves the module URL to `any`, so nothing there is checked. They are
type-level only and do not affect behaviour — the notable one is `TristanIcon`
requiring `strokeWidth`, which `defaultProps` supplies at runtime.
