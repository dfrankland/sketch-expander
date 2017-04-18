# sketch-expander

Expand Sketch files to make them easy to version control.

## How to install

```bash
npm i -g sketch-expander
```

## How to use

```
sketch-expander [options]

Options:
  --input, -i   Sketch files to be expanded; can be
                globs.
                                                           [array] [default: []]
  --output, -o  Output directory for Sketch files
                to be expanded to.
                                                        [string] [default: "./"]
  --watch, -w   Directories to watch for changes in
                Sketch files; can be globs.
                                                           [array] [default: []]
  --root, -r    Directory to use as a root. Copies
                directory structure beneath root to
                output.
                                                        [string] [default: null]
  --help        Show help.
                                                                       [boolean]
```
