# svg2json

A minimalist utility to convert SVG mazes into Game Level JSON.

## Usage

```bash
bun run scripts/svg2json.js input.svg > output.json
```

## Workflow: Generating Mazes

You can use external tools like [mazegenerator](https://github.com/razimantv/mazegenerator) to create complex layouts.

### 1. Generate SVG
```bash
git clone https://github.com/razimantv/mazegenerator
cd mazegenerator/src && make
./mazegen -o maze
```

### 2. Convert to JSON
```bash
bun run scripts/svg2json.js maze.svg > level.json
```

## Specification

| Entity | SVG Element | Identifier |
| :--- | :--- | :--- |
| **Canvas** | `<svg>` | `width`, `height` |
| **Wall** | `<rect>`, `<line>` | Default |
| **Start** | `<circle>` | `id="start"` or `fill="#00ff00"` |
| **Goal** | `<rect>` | `id="end"` or `fill="#ff0000"` |