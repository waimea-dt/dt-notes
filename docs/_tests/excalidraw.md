# Excalidraw

Render `.excalidraw` JSON scenes as SVG images using:

```html
<excalidraw src="_tests/_assets/test.excalidraw"></excalidraw>
```

## Basic Example

<excalidraw src="_tests/_assets/test.excalidraw" alt="Excalidraw test scene"></excalidraw>

## Notes

- The plugin loads the `.excalidraw` file, renders it to SVG, then inserts an `<img>`.
- Click the rendered image to test zoom behaviour.

## Single Tag (no closing tag)

<excalidraw src="_tests/_assets/smoke.excalidraw">

Text after the tag should still appear below the widget.
