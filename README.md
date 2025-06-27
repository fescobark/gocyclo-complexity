# GoCyclo Complexity 🔥

[![VSCode](https://img.shields.io/visual-studio-marketplace/v/gocyclo-complexity.svg?label=VSCode)](https://marketplace.visualstudio.com/)
[![Go](https://img.shields.io/badge/go-%5E1.18-blue)](https://golang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Detecta la deuda técnica de tus funciones Go al instante.**

Visualiza la complejidad ciclomática de tus funciones Go en tiempo real usando [gocyclo](https://github.com/fzipp/gocyclo) directamente en VS Code.

* 🚩 **Decoración en línea**: Muestra la complejidad al lado de cada función. Tooltip explicativo.
* 🔥 **Panel de hotspots**: Lista todas las funciones del proyecto que superan el umbral configurado.
* 📊 **Contador en barra de estado y actividad**: Ve el número de funciones problemáticas de un vistazo.
* 🛠️ **Umbral configurable**: Ajusta fácilmente el máximo de complejidad permitido.

---

## Características

* Decoración en línea de complejidad para cada función Go.
* Tooltips que alertan si la función supera el umbral definido.
* Panel lateral “GoCyclo Hotspots” para ver todos los hotspots del proyecto.
* Quick Pick para ver solo las funciones más complejas del archivo actual.
* Contador de hotspots en la barra de estado y la activity bar.
* Haz clic en el panel para saltar directo al código.

---

## Uso rápido

1. **Instala [gocyclo](https://github.com/fzipp/gocyclo)**

   ```sh
   go install github.com/fzipp/gocyclo/cmd/gocyclo@latest
   ```

   Asegúrate de tenerlo en tu PATH.

2. **Abre tu proyecto Go en VS Code**
   Los hotspots y la complejidad aparecen tras guardar archivos.

3. **Configura**
   Ve a Settings → `gocyclo-complexity.maxComplexity` para ajustar el umbral.

---

## FAQ

* **¿Funciona en Windows/Mac/Linux?**
  Sí, sólo necesitas que `gocyclo` esté en tu PATH.
* **¿Consume recursos?**
  Solo analiza tras guardar. Ligero para cualquier equipo.
* **¿Soporta proyectos grandes?**
  Analiza recursivamente todos los `.go` del workspace.

---

## Contribuir

¿Ideas? ¿Encontraste un bug? ¡Colabora en [GitHub](https://github.com/fescobark/gocyclo-complexity)!

---

Licencia MIT