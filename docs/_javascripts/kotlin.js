document.addEventListener('DOMContentLoaded', () => {
    const kotlinCode = '.language-kotlin pre code'

    const kotlinCodeBlocks = document.querySelectorAll(kotlinCode);

    kotlinCodeBlocks.forEach(codeBlock => {
        codeBlock.setAttribute('theme', 'material-darker')
        codeBlock.setAttribute('auto-indenbt', 'true')
        codeBlock.setAttribute('data-autocomplete', 'true')
        codeBlock.setAttribute('highlight-on-fly', 'true')
        codeBlock.setAttribute('lines', 'true')
        codeBlock.setAttribute('match-brackets', 'true')
        codeBlock.setAttribute('theme', 'darcula')
    });

    KotlinPlayground(
        kotlinCode
    );
});

