# GoCyclo Complexity 🔥

[![Install from VS Code Marketplace](https://img.shields.io/badge/vscode-install-blue.svg?logo=visualstudiocode)](https://marketplace.visualstudio.com/items?itemName=francisco-javier-escobar-klagges.gocyclo-complexity)
[![Go](https://img.shields.io/badge/go-%5E1.18-blue)](https://golang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Spot your Go code complexity hotspots—instantly.**

Visualize the cyclomatic complexity of your Go functions in real-time using [gocyclo](https://github.com/fzipp/gocyclo), directly in Visual Studio Code.

* 🚩 **Inline highlights**: See complexity scores next to each function. Hover for quick explanations.
* 🔥 **Hotspot Panel**: Lists all functions in your workspace over your chosen threshold.
* 📊 **Statusbar & Activity Counter**: Track the number of problematic functions at a glance.
* 🛠️ **Customizable threshold**: Easily set the maximum allowed complexity.

---

## Features

* Inline decorations for every Go function, showing their cyclomatic complexity.
* Tooltips explain when a function is over the configured threshold.
* Dedicated "GoCyclo Hotspots" panel for global project view.
* Quick pick to list and jump to the worst offenders in the current file.
* Statusbar item and badge in the Activity Bar.
* Click any item in the panel to jump straight to code.

---

## Getting Started

1. **Install [gocyclo](https://github.com/fzipp/gocyclo)**

   ```sh
   go install github.com/fzipp/gocyclo/cmd/gocyclo@latest
   ```

   Make sure it’s available in your PATH.

2. **Open a Go project in VS Code**
   Hotspots and inline complexity will appear automatically after saving files.

3. **Configure**
   Use Settings → `gocyclo-complexity.maxComplexity` to adjust your threshold.

---

## FAQ

* **Does it work on Windows/Mac/Linux?**
  Yes. Just ensure `gocyclo` is in your PATH.
* **Is it fast?**
  Runs analysis after saves—fast and lightweight.
* **Big projects?**
  Recursively scans all `.go` files in your workspace.

---

## Contributing

Issues and PRs welcome! Help us improve at [GitHub](https://github.com/fescobark/gocyclo-complexity).

---

MIT License