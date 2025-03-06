document.addEventListener('DOMContentLoaded', () => {
    const codeBlocks = document.querySelectorAll('.highlight.show-indent code');

    codeBlocks.forEach(codeBlock => {
        const lines = codeBlock.innerHTML.split('\n');

        // Map through each line and wrap leading whitespace in a span
        const highlightedCode = lines.map(line => {
            // Match leading spaces
            const leadingSpaces = line.match(/^\s+/);
            if (leadingSpaces) {
                const spaces = leadingSpaces[0];
                const remainder = line.slice(spaces.length)
                return `<span class="whitespace">${spaces}</span>${remainder}`;
            }
            else {
                return line;
            }
        }).join('\n');

        // Update the code block with the highlighted whitespace
        codeBlock.innerHTML = highlightedCode;
    });
});

