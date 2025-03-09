document.addEventListener('DOMContentLoaded', () => {

    const highlightAll = () => {
        const selector = 'code.language-pseudo, .language-pseudo code';
        const elements = Array.prototype.slice.apply(document.querySelectorAll(selector));

        elements.forEach(element => {
            highlightElement(element);
        });
    };


    const highlightElement = (element) => {
        const code = element.textContent;
        if (!code) return;

        const lines = code.trim().split('\n');

        let highlightedCode = '';
        lines.forEach(line => {
            highlightedCode += highlightLine(line) + '\n';
        });

        element.innerHTML = highlightedCode;
    };


    const highlightLine = (line) => {
        const commandType = parseLine(line);
        // console.log(commandType);
        let code = expandCommand(commandType, line);
        // console.log(code);
        return code;
    };


    const parseLine = (line) => {
        line = line.trim();
        const words = line.split(' ');

        switch (words[0]) {
            case '//':
            case '#':
                return 'comment';

            case 'start':
            case 'begin':
            case 'function':
            case 'procedure':
            case 'end':
                return 'block';

            case 'say':
            case 'show':
                return 'output';

            case 'get':
            case 'ask':
                return 'input';

            case 'is':
            case 'if':
            case 'else':
            case 'elseif':
            case 'elif':
            case 'otherwise':
            case 'endif':
                return 'decision';

            case 'forever':
            case 'repeat':
            case 'until':
            case 'do':
            case 'while':
            case 'endrepeat':
            case 'endwhile':
                return 'loop';
        }

        return 'action';
    };


    const expandCommand = (cmdType, line) => {
        if (line.length == 0) return '';
        return line.replace(/^(\s*)(\S.*)$/, `$1<span class="${cmdType}">$2</span>`);
    };


    const pseudoCodeBlocks = document.querySelectorAll('.language-pseudo code');
    const pseudoCodeInline = document.querySelectorAll('code.language-pseudo');

    pseudoCodeBlocks.forEach(codeBlock => highlightElement(codeBlock));
    pseudoCodeInline.forEach(codeBlock => highlightElement(codeBlock));

});
