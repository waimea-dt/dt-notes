const iframes = document.getElementsByTagName('iframe');

if (iframes.length) {
    console.log('iFrames found... Blocking scrolling');

    noscroll = () => {
        window.scrollTo(0, 0);
    };

    // Disable scrolling
    window.addEventListener('scroll', noscroll);

    // Remove after a few seconds
    setTimeout(() => {
        console.log('Unblocking scrolling');
        window.removeEventListener('scroll', noscroll);
    }, 3000);
}

