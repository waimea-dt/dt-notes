// Setup the mermaid graph rendering API
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.0.2/dist/mermaid.esm.min.mjs';

mermaid.initialize( {
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
        fontFamily: 'system-ui, sans-serif',
        fontSize:   '0.8em'
    }
} );

await mermaid.run({
    querySelector: '.language-mermaid code'
});

