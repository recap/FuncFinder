# FuncFinder

Crawl Nodejs project an list functions and methods found in sources with filename and line number.
Function Definitions and Methods:

## Usage

```bash
npm install
node funcFinder.mjs <path>
```

You will get a list of functions and methods found in the project with filename and line number.

```bash
┌─────────┬───────────────────────────────┬──────────────────┬──────┬─────────────────┐
│ (index) │ name                          │ file             │ line │ type            │
├─────────┼───────────────────────────────┼──────────────────┼──────┼─────────────────┤
│ 0       │ 'extractFunctionsFromFile'    │ 'funcFinder.mjs' │ 10   │ 'ArrowFunction' │
│ 1       │ 'traverse'                    │ 'funcFinder.mjs' │ 26   │ 'ArrowFunction' │
│ 2       │ 'getJavaScriptFiles'          │ 'funcFinder.mjs' │ 71   │ 'ArrowFunction' │
│ 3       │ 'extractFunctionsFromProject' │ 'funcFinder.mjs' │ 104  │ 'ArrowFunction' │
│ 4       │ 'main'                        │ 'funcFinder.mjs' │ 115  │ 'ArrowFunction' │
└─────────┴───────────────────────────────┴──────────────────┴──────┴─────────────────┘
```
