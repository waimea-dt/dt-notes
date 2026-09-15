<computer class="macintosh-chat" type="mac">

&nbsp;

</computer>


<script>
    const BOOT_DELAY  = 500
    const SMILE_DELAY = 1000
    const START_DELAY = 1500
    const LINE_PAUSE  = 0
    const SHORT_PAUSE = 750
    const LONG_PAUSE  = 1500
    const CHAR_PAUSE  = 3

    const HANGMAN_STATUS = Object.freeze({
        IDLE: 'idle',
        PLAYING: 'playing',
        WON: 'won',
        LOST: 'lost',
    })

    const starters = [`So`, `Ok`, `Yo`, `Right`, `Now`, `Well`, `Hey`,]

    const prompts = [
        `how can I help you?`,
        `would you like to:`,
        `your options:`,
        `what do you want?`,
        `you can:`,
        `pick an option:`,
    ]

    const filler = `<br>—<br>`

    const jokes = [
        `There are only two hard things in computer science...${filler}Cache invalidation,– naming things,– and off-by-one errors!`,
        `To understand recursion...${filler}You must first understand recursion!`,
        `I would tell you a UDP joke...${filler}But you might not get it!`,
        `There are 10 types of people in the world...${filler}Those who understand binary,– and those who don't!`,
        `An SQL query walks into a bar, walks up to two tables, and asks:– 'Can I join you?'`,
        `My code doesn't have bugs...${filler}It just develops random features!`,
        `My code works perfectly...${filler}Until someone uses it!`,
        `Programming is 10% writing code– and 90% figuring out why it doesn't work!`,
        `Remember... <br><br>There's no place like $HOME`,
        `How do robots eat pizza?${filler}One byte at a time!`,
        `What type of cryptography do pigs use?${filler}Invisible oink!`,
        `How do dolphins compute?${filler}They use a Central Porpoising Unit!`,
        `What type of cryptography did Vikings use?${filler}Norse code!`,
        `<code>['hip', 'hip']</code>${filler}Hip hip array!`,
        `Two bits walked into an expensive cafe,– but were thrown out...${filler}They didn't have enough for a byte!`,
        `Counting in binary...${filler}It's as easy as– 01– 10– 11`,
        `ASCII codes...${filler}As easy as– 65– 66– 67`,
        `Why don't elephants use desktop computers?${filler}They are scared of the mouse!`,
        `How does a computer scientist organise her bath toys?${filler}Bubble sort!`,
        `Computers make mistakes...${filler}But they're very fast, very accurate mistakes!`,
        `How many programmers does it take to change a light bulb?${filler}None, it's a hardware problem!`,
        `The programmer got stuck in the shower...${filler}The shampoo bottle said:– Lather,– Rinse,– Repeat!`,
        `What do you call a group of eight hobbits?${filler}A hobbyte!`,
        `Why do web developers wear glasses?${filler}To improve their site!`,
        `My team had a debate on what the best looping variable name is...${filler}i won!`,
        `Never ask a SQL dev to help you move furniture...${filler}They drop tables!`,
        `I got really angry and smashed my keyboard...${filler}I completely lost CTRL!`,
        `I have a joke about computers...${filler}But it's not PC!`,
        `I teased a Linux user...${filler}They retreated back into their shell!`,
        `Artificial intelligence...${filler}No match for my natural stupidity!`,
        `Teachers:– in the real world, you can't just Google everything${filler}Programmers:– lol`,
        `What goes from 0 to 100 really fast?${filler}Binary!`,
        `Why do number jokes not work in Octal?${filler}Because– 7– 10– 11`,
        `There are 10 types of people in the world...${filler}Those who understand ternary,– those who don't,– and those who thought this was a binary joke!`,
        `Why do programmers prefer dark mode?${filler}Because light attracts bugs!`,
        `I'd tell you a joke about NULL...${filler}But you'd get nothing out of it!`,
        `Why did the developer go broke?${filler}Because they used up all their cache!`,
        `Old programmers never die...${filler}They just go out of scope!`,
        `What did the router say to the doctor?${filler}"It hurts when IP!"`,
        `Why do Python programmers wear glasses?${filler}Because they can't C#!`,
        `How do you comfort a JavaScript bug?${filler}You console it!`,
        `What's a computer's favourite snack?${filler}Microchips!`,
        `How do you know if a programmer is an extrovert?${filler}They look at YOUR shoes when they talk to you!`,
        `What do you call a snake that codes?${filler}A Python developer!`,
        `What's an astronaut's favourite key on a keyboard?${filler}The space bar!`,
        `What do you call it when a programmer finishes a project?${filler}A miracle!`,
        `Weeks of coding can save you– hours of planning!`,
        `A code tester walks into a bar and orders a beer,– then 0 beers,– then 999999999 beers,– then -1 beers,– then a lizard`,
        `Debugging...${filler}Being the detective in a crime movie,– where you are also the murderer!`,
        `Why did the computer cross the road?${filler}To get a byte to eat!`,
        `Computers are like air conditioners...${filler}They stop working if you open Windows!`,
        `My wi-fi went down,– so I had to talk to my family...${filler}They seem nice!`,
        `What's a computer's favourite beat?${filler}Algo-rhythm!`,
        `My love life is binary...${filler}Either 0 success– or 1 heartbreak!`,
        `Debugging:– "Who wrote this terrible code?!"${filler}Oh...– it was me!`,
        `99 little bugs in the code,– take one down,– patch it around...${filler}Oh...– 127 bugs in the code...`,
        `Machine learning...${filler}Teaching computers to guess confidently!`,
        `"My computer is slow"... ${filler}User with 124 tabs open!`,
        `Coding...${filler}10% writing,– 90% Googling!`,
        `My code is like a diary...${filler}Really embarrassing to read!`,
        `CAPS LOCK...${filler}Preventing logins since 1980!`,
        `MS Edge...${filler}The best browser for– downloading another browser!`,
        `If brute-force doesn't work...${filler}You're not using enough!`,
        `My password is...${filler}The last 16 digits of Pi!`,
        `Algorithm...${filler}A word used by programmers when they don't want to explain what they did!`,
        `Coding...${filler}10% typing– and 90% debugging!`,
        `Binary humour...${filler}It's either funny– or it's not funny!`,
        `Programmers...${filler}Tools for converting caffeine into code!`,
        `There are three kinds of people...${filler}Those who can count– and those who can't!`,
    ]

    const laughs = [
        `Ha! Ha ha! Ha ha ha!`,
        `I'm so funny!`,
        `What a crack up!`,
        `Oh, I'm going to blow a diode!`,
        `Get it?! Do you get it?!`,
        `Thank you! I'll be here all night!`,
        `Now, that was hilarious!`,
        `Ouch! My circuits ache!`,
        `Beep boop beep beep!`,
        `Be still, my beating system clock!`,
        `I'm floppy with laughter!`,
        `Warning: laughter overflow error!`,
        `I'm 128 kilobytes of pure comedy!`,
        `System error: Too much hilarity!`,
    ]

    const facts = [
        `The first computer bug was an actual bug - a moth found trapped in a relay of Harvard's Mark II in 1947.`,
        `The word "bug" was used for technical faults long before computers - Thomas Edison used it in an 1878 letter about problems with his inventions.`,
        `ENIAC, one of the first electronic computers, weighed around 30 tonnes, used over 17,000 vacuum tubes and took up a whole room.`,
        `The word "computer" originally meant a person who did calculations by hand, not a machine.`,
        `The first computer mouse, invented by Douglas Engelbart in 1964, was carved out of wood.`,
        `The Apollo Guidance Computer that helped land astronauts on the Moon ran with just 64KB of memory.`,
        `The first computer virus, called "Creeper", appeared in 1971 and simply displayed the message "I'M THE CREEPER, CATCH ME IF YOU CAN!"`,
        `The first 1GB hard drive, released by IBM in 1980, weighed over 250kg and cost around $40,000.`,
        `The "@" symbol was chosen in 1971 for email addresses simply because it was a rarely-used key on the keyboard. They almost chose "!"`,
        `The first streaming webcam was set up at Cambridge University purely to monitor how full the coffee pot was in the kitchen.`,
        `Spacewar!, created in 1962, is considered one of the first video games and ran on a computer the size of a fridge.`,
        `Early floppy disks, 8 inches across, were genuinely floppy enough to bend by hand.`,
        `USB flash drives weren't invented until 2000, so most of the 1990s relied on floppy disks and CDs.`,
        `The first computer virus for MS-DOS, called "Brain", was created by two brothers in Pakistan in 1986.`,
        `The first ever domain name registered on the internet was symbolics.com, in 1985.`,
        `The nickname "spam", used for junk email, comes from a Monty Python sketch about the canned meat of the same name.`,
        `Space Invaders was so popular in Japan in 1978 that it reportedly caused a temporary shortage of 100-yen coins.`,
        `The first SMS text message ever sent, in 1992, simply said "Merry Christmas."`,
        `Wi-Fi doesn't actually stand for anything - it is a made-up marketing term meant to sound like "Hi-Fi."`,
        `The programming language COBOL, created in 1959, is still quietly running behind the scenes in many banks today.`,
        `Grace Hopper, a pioneering computer scientist, helped invent one of the first compilers in the 1950s.`,
        `The Xerox Alto, built in 1973, had a graphical interface (GUI) and mouse a full decade before mainstream PCs.`,
        `Steve Jobs and Steve Wozniak built the first Apple computers in Jobs's parents' garage.`,
        `The name "Google" comes from a misspelling of "Googol", which is a number: 1 followed by 100 zeros.`,
        `Amazon originally sold nothing but books when it launched in 1994.`,
        `CAPTCHA stands for "Completely Automated Public Turing test to tell Computers and Humans Apart."`,
        `The first video ever uploaded to YouTube, in 2005, was just 19 seconds long and showed a man at a zoo.`,
        `Doom (1993) spread so fast on office computers that some companies had to explicitly ban it from their networks.`,
        `Ada Lovelace wrote what's considered the first computer algorithm in the 1840s, for a machine that was never built in her lifetime.`,
        `IBM's Deep Blue became the first computer to beat a reigning world chess champion, defeating Garry Kasparov in 1997.`,
        `Bitcoin's creator, known only by the pseudonym Satoshi Nakamoto, has never been publicly identified.`,
        `The first laptop, the Osborne 1 (1981), weighed about 11kg - heavier than most modern microwaves.`,
        `The video game Pong (1972) was so simple its instructions were just one line: "Avoid missing ball for high score."`,
        `The best-selling video game console of all time is the PlayStation 2, with over 155 million units sold.`,
        `The first version of Minecraft was created by one person, Markus "Notch" Persson, in about six days.`,
        `Pac-Man's original Japanese name, Puck-Man, was changed for the US release to stop people scratching out the P.`,
        `The ghosts in Pac-Man each have their own distinct chase behaviour programmed individually.`,
        `Super Mario Bros. was originally going to star a character called "Mr. Video" before Mario was created.`,
        `The first computer game ever sold commercially was Computer Space in 1971, created by the future founders of Atari.`,
        `World of Warcraft has had more player-created characters than there are people in most countries.`,
        `Nintendo started out in 1889 as a company that made handmade playing cards.`,
        `Sonic the Hedgehog was designed to be blue specifically to match Sega's company logo.`,
        `The first esports tournament was held in 1972 at Stanford University, with Spacewar! as the game.`,
        `The original Halo was almost released as a Mac-exclusive game before Microsoft bought the studio.`,
        `The word "glitch" is thought to come from the Yiddish word for "slip", adopted by early engineers.`,
        `The first computer worm to spread across the early internet, the Morris Worm (1988), was created as an experiment and accidentally crashed thousands of machines.`,
        `Early hackers in the 1960s used the term "phreaking" to describe hacking into telephone networks using whistles and tones.`,
        `The first computer password system was introduced at MIT in 1961 to stop students hogging shared computer time.`,
        `Cracking modern encryption using brute force would take even powerful computers longer than the age of the universe.`,
        `The Enigma machine, used by Germany in World War II, had more possible settings than there are atoms in the observable universe.`,
        `Alan Turing helped crack the Enigma code at Bletchley Park, work that remained classified for decades after the war.`,
        `The first recorded use of the term "software" appeared in a 1958 academic paper.`,
        `Early computers used punched cards to store and read data. A single stack of them could hold just a few kilobytes of data.`,
        `The Commodore 64, released in 1982, remains one of the best-selling computer models of all time.`,
        `The floppy disk "save" icon still used in modern apps is unrecognisable to teenagers who've never touched a real one.`,
        `The first 3D-printed object was created in 1983 using a UV-curable resin.`,
        `Early modems made a distinctive screeching sound because they transmitted data over telephone lines as audible audio tones.`,
        `Some 1980s home computers, like the ZX Spectrum, loaded games from ordinary audio cassette tapes. A game might take 20 mins or more to load!`,
        `A single modern smartphone has more processing power than the computers used to run entire space missions in the 1960s and 70s.`,
        `The first item ever sold on eBay was a broken laser pointer, bought for $14.83 in 1995.`,
        `Early internet users had to dial in through a phone line, meaning nobody in the house could make a call while someone was online.`,
        `Tim Berners-Lee, who invented the World Wide Web, never patented it, deliberately keeping it free for everyone to use.`,
        `The first message ever sent over the internet's precursor, ARPANET, in 1969 was meant to be "LOGIN" - but the system crashed after just two letters.`,
        `Early supercomputers in the 1970s were sometimes cooled using massive tanks of liquid rather than fans.`,
        `The Roomba robot vacuum shares some of its original navigation technology with military robots developed by the same company.`,
        `Early digital cameras in the 1970s could take photos with a resolution of just 0.01 megapixels.`,
        `The first 1TB hard drive wasn't released to consumers until 2007.`,
        `The inventor of the World Wide Web originally wanted to call it "The Information Mine", but dropped it because "TIM" was also his name.`,
        `Some early video games required you to write down a pass code to save your place in the game as they had no data storage system.`,
        `The very first emoticon, a sideways smiley :-), was proposed by a computer scientist in 1982 to mark jokes in online messages.`,
        `The 'blue screen of death' (BSOD) got its nickname from the crash screen of early versions of Windows - Microsoft never officially called it that.`,
        `A hidden text adventure game was programmed inside the source code of some early word processors as an Easter egg.`,
        `The Atari 2600, released in 1977, only had 128 bytes of RAM - not even enough to store one modern text message.`,
        `The classic game Snake became famous worldwide largely because it came pre-installed on Nokia phones in the late 1990s.`,
        `Some early computer scientists used to physically rewire circuit boards by hand to change what a program did.`,
        `The term "bit", short for binary digit, was first suggested in a 1948 academic paper.`,
        `A working computer with screen and CPU, has been built entirely inside Minecraft, using only redstone and pistons.`,
        `The card game Solitaire was included with early versions of Windows specifically to teach people how to use a mouse.`,
        `The first item scanned using a barcode at a shop checkout, in 1974, was a packet of chewing gum.`,
        `The world's first computer conference in the 1950s reportedly had attendees line up just to see a machine that could add numbers.`,
        `The original iPod released in 2001 held 1,000 songs - a huge amount when most MP3 players held around 20.`,
        `The first version of Windows, released in 1985, was pretty terrible and, ironically, did not even have overlapping windows!`,
        `The UK's Sinclair ZX81 home computer (1981) had only 1KB of RAM - less memory than a short plain-text email.`,
        `The famous Konami Code (↑ ↑ ↓ ↓ ← → ← → 🅱 🅰) began as a cheat code for the 1986 game Gradius, because its developer found the game too difficult while testing it!`,
        `The original Doom (1993) was so widely copied between computers that office networks sometimes slowed down from people sharing it.`,
        `The original Minecraft world was not infinite - its terrain generator began producing bizarre broken landscapes around 30 million blocks from the centre.`,
        `In the early days of Google, its computers were built from cheap parts and mounted in colourful LEGO cases.`,
        `The first hard disk drive, IBM's RAMAC 305 (1956), stored about 5MB of data and was roughly the size of two large refrigerators.`,
        `A 3.5-inch floppy disk is called 'floppy' even though its hard plastic shell does not bend - but the magnetic disk inside it does.`,
        `The original Space Invaders arcade machine (1978) became harder as you played because fewer aliens meant the CPU had less work to do.`,
        `The first commercial computer mouse (1981) had three buttons and cost almost $300 back then.`,
        `The game SimCity was initially rejected by several publishers because they thought a game with no winner could not be fun.`,
        `The original Macintosh (me!) had 128kB of RAM - a single modern phone photo would fill its entire memory many times over.`,
        `A 3.5" 400kB floppy disk (like mine) cannot even hold one modern phone photo at full quality, let alone a video.`,
        `The Apollo Guidance Computer had 4KB of RAM - a basic digital watch now has far more memory.`,
        `The original PlayStation had 2MB of RAM - many modern game updates are larger than its entire library of games.`,
        `A 56k dial-up modem from the late 1990s could download around 7kB per second - at that speed, a 1GB game download would take roughly six weeks.`,
        `The first iPhone (2007) had a 2-megapixel camera - many modern phones have cameras with over 20 times as many pixels.`,
        `The Game Boy (1989) screen displayed 160 by 144 pixels - a modern 4K screen contains more than 350 times as many pixels.`,
        `The Commodore 64 (1982) had 64KB of memory. A single colourful emoji can take more storage than some of its programs.`,
        `A CD-ROM, commonly used in the late 1990s, could hold about 650MB. A modern 4K film would need more than 100 CD-ROMs to store it.`,
        `In 1984, a dial-up home internet connection ran at 1200 baud. At that speed, a small 1MB JPEG image would take 2.5 hours to download.`,
        `The first USB flash drives (2000) held 8MB and cost $100 - today, even cheap USB drives can hold thousands of times more.`,
        `The original World Wide Web was mostly text because sending images over early internet connections took a painfully long time.`,
        `The original IBM PC (1981) could have as little as 16KB of RAM - a modern browser tab can use thousands of times more memory.`,
        `The first commercial mobile phones (1984) cost over $7000 and had batteries that only lasted for 30 minutes of talk time and took 10 hours to recharge.`,
    ]

    const comments = [
        `Wow!`,
        `Pretty cool, eh?!`,
        `Pretty neat, eh?!`,
        `Now, that's interesting!`,
        `Who knew?!`,
        `Blimey!`,
        `That's super interesting!`,
        `How about that?!`,
        `Well, that's interesting!`,
        `Heck!`,
        `Awesome knowledge!`,
        `Crazy, eh?!`,
    ]

    const asciiArt = [
        [
            `\\|/          (__)     `,
            `     '\\------(oo)     `,
            `       ||    (__)     `,
            `       ||w--||     \\|/`,
            `   \\|/                `,
            `          MOO!        `,
        ],
        [
            `(\\___/)    /\\_/\\ `,
            `(='x'=)   (=^.^=)`,
            `(")_(")   (")_(")`,
            `                 `,
            `  BUN      KITTY `,
        ],
        [
            `  (\\w/)    NEIGH! `,
            `  (..  \\          `,
            ` _/  )  \\______   `,
            `(oo /'\\        )',`,
            ` '--' (v  __( / ||`,
            `       |||  ||| ||`,
            `      //_| //_|   `,
        ],
        [
            `      ____()()   `,
            `     /      @@   `,
            `~~~~~\\_;m__m._>o `,
            `                 `,
            ` GOT ANY CHEESE? `,
        ],
        [
            ` .-""-.          `,
            `/)    (\\   ,;;;, `,
            `( ' \\' )  // \\\\\\\\`,
            ` \\  = /   ( ' ' )`,
            `  )--(     \\_=_/ `,
            `                 `,
            `  FATHER & SON!  `,
        ],
        [
            `/\\_/\\  `,
            `>^,^<  `,
            ` / \\   `,
            `(___)_/`,
            `       `,
            ` MEOW! `,
        ],
        [
            `  (> " " <)  `,
            `  ( ='.'= )  `,
            `-(,,)---(,,)-`,
            `             `,
            ` PEEK-A-BOO! `,
        ],
        [
            `    __//  CHEEP!`,
            `   /.__.\\       `,
            `   \\ \\/ /       `,
            `'__/    \\        `,
            ` \\-      )      `,
            `  \\_____/       `,
            `____|_|______   `,
            `    " "         `,
        ],
        [
            `  TOOT!   __     __  `,
            `         /  \\~~~/  \\ `,
            `   ,----(     ..    )`,
            `  /      \\__     __/ `,
            ` /|         (\\  |(   `,
            `^ \\   /___\\  /\\ |    `,
            `   |__|   |__|-"     `,
        ],
        [
            `(  ,___, `,
            `   [O.o] `,
            `   /)__) `,
            `----"--"-`,
            `         `,
            `MOORPORK!`,
        ],
        [
            `  ><((((º>    `,
            `     ><((((º> `,
            ` ><((((º>     `,
            `    ><((((º>  `,
            `              `,
            `     FUSH!    `,
        ],
        [
            `    _____  `,
            `^..^     \\9`,
            `(oo)_____/ `,
            `   WW  WW  `,
            `           `,
            `   OINK!   `,
        ],
        [
            `    .----.   @   @`,
            `   / .-"-.\`.  \\v/ `,
            `   | | '\\ \\ \\_/ ) `,
            ` ,-\\ \`-.' /.'  /  `,
            `'---\`----'----'   `,
            `                  `,
            `   JUST CHILLIN   `,
        ],
        [
            `BUG  \\ /  OUT!`,
            `     oVo      `,
            ` \\___XXX___/  `,
            `  __XXXXX__   `,
            ` /__XXXXX__\\  `,
            ` /   XXX   \\  `,
            `      V       `,
        ],
        [
            `\\_/-.--.--.--.--.--. `,
            `(")__)__)__)__)__)__)`,
            ` ^ "" "" "" "" "" "" `,
            `                     `,
            `     VERY HUNGRY!    `,
        ],
        [
            `    _  _      `,
            `   | )/ )     `,
            `\\\\ |//,' __   `,
            `(")(_)-"()))=-`,
            `   (\\\\        `,
            `              `,
            ` BZZ BZZ BZZ! `,
        ],
        [
            `        O  o       `,
            `   _\\_   o     ,   `,
            `\\\\/  o\\ .    <o))< `,
            `//\\___w        \`   `,
            `   ''       UH OH! `,
        ],
        [
            `       .   HELLO THERE!  `,
            `      ":"                `,
            `    ___:____     |"\\/"|  `,
            `  ,'        \`.    \\  /   `,
            `  |  o        \\___/  |   `,
            `~^~^~^~^~^~^~^~^~^~^~^~^~`,
        ],
        [
            `             .---.        `,
            `     |______/     \\______ `,
            `()===|_____( () () )_____>`,
            `     |      \\  M  /       `,
            `             |HHH|        `,
            `  WHOOPS!    \`---'        `,
        ],
        [
            `    _____         `,
            `---'   __\\______  `,
            `          ______) `,
            `          __)     `,
            `         __)      `,
            `---.______)   THIS`,
            `              WAY!`,
        ],
        [
            ` ______________________   `,
            `/_____________________()  `,
            `\\   ____________________  `,
            ` \\  \\ \\________________() `,
            `  \\  \\/__________________ `,
            `   \\____________________()`,
            `                          `,
            `            HUH?!         `,
        ],
        [
            `     =()=   `,
            ` ,/'\\_||_   `,
            ` ( (___  \`. `,
            ` \`\\./  \`==' `,
            `        ||| `,
            `SPLISH  ||| `,
            `SPLOSH  ||| `,
        ],
        [
            `  .-----.        `,
            ` /())))))\\       `,
            `(((@)-(@)))  I   `,
            `())  L  (()  SEE `,
            ` )(\\ - /)(   YOU!`,
            ` ())\`-\`(()       `,
        ],
        [
            `FOR YOU   ,       `,
            `         ()    /) `,
            ` ----.---'----(  )`,
            `      \\        \\) `,
            `      ()          `,
            `       \`          `,
        ],
        [
            `ZOOM! --- __@     __~@  `,
            `    --- _\`\\<,_   _\`\\<,_ `,
            `  ---  (*)/ (*) (*)/ (*)`,
            `~~~~~~~~~~~~~~~~~~~~~~`,
        ],
    ]


    const words = [
        'ALGORITHM', 'PSEUDOCODE', 'FLOWCHART', 'SYNTAX', 'COMMENT', 'VARIABLE', 'CONSTANT', 'BIT',
        'BYTE', 'BOOLEAN', 'CHAR', 'STRING', 'CONCATENATE', 'NULL', 'LITERAL', 'MUTABLE',
        'IMMUTABLE', 'SEQUENCE', 'CONDITION', 'BRANCH', 'SELECTION', 'ITERATION', 'LOOP', 'RECURSION',
        'BOOLEAN', 'LOGIC', 'FUNCTION', 'PARAMETER', 'ARGUMENT', 'RETURN', 'ARRAY', 'LIST',
        'RECORD', 'FIELD', 'STACK', 'QUEUE', 'HASH', 'LINEAR', 'BUBBLESORT', 'COMPLEXITY',
        'TRACTABILITY', 'INTRACTABILITY', 'HEURISTIC', 'DECOMPOSITION', 'ABSTRACTION', 'OOP', 'PROGRAMMING', 'CLASS',
        'OBJECT', 'PROPERTY', 'METHOD', 'CONSTRUCTOR', 'ENCAPSULATION', 'INHERITANCE', 'POLYMORPHISM', 'INTERFACE',
        'BUG', 'DEBUGGING', 'BREAKPOINT', 'TESTING', 'TRACE', 'DOCUMENTATION', 'REFACTORING', 'VALIDATION',
        'ACCESSIBILITY', 'USABILITY', 'REQUIREMENTS', 'SPECIFICATION', 'STAKEHOLDER', 'SPRINT', 'PROTOTYPE', 'REPOSITORY',
        'GITHUB', 'TRANSLATE', 'COMPILER', 'INTERPRETER', 'PALETTE', 'WIREFRAME', 'GUI', 'BIT',
        'BINARY', 'DENARY', 'DECIMAL', 'HEXADECIMAL', 'ASCII', 'UNICODE', 'PIXEL', 'RESOLUTION',
        'BITMAP', 'VECTOR', 'GRAPHIC', 'COMPRESSION', 'LOSSLESS', 'LOSSY', 'METADATA', 'ASSEMBLY',
        'CACHE', 'BUFFER', 'AUTHENTICATION', 'PASSWORD', 'ENCRYPTION', 'DECRYPTION', 'SYMMETRIC', 'ASYMMETRIC',
        'PUBLIC', 'PRIVATE', 'CERTIFICATE', 'DIGITAL', 'SIGNATURE', 'CIPHER', 'CRYPTOGRAPHY', 'MALWARE',
        'VIRUS', 'BRUTEFORCE', 'PHISHING', 'HTML', 'CSS', 'JAVASCRIPT', 'TAG', 'SELECTOR',
        'DOM', 'JSON', 'HYPERLINK', 'FRONTEND', 'BACKEND', 'CLIENT', 'SERVER', 'BROWSER',
        'ROUTE', 'ROUTING', 'TEMPLATE', 'COOKIE', 'DATABASE', 'RELATIONAL', 'TABLE', 'ROW',
        'COLUMN', 'PRIMARY', 'FOREIGN', 'INDEX', 'NORMALISATION', 'QUERY', 'SQL', 'CRUD',
        'INTERNET', 'ARPANET', 'ETHERNET', 'WIFI', 'HTTP', 'HTTPS', 'SSL', 'TLS',
        'URL', 'PACKET', 'PORT', 'ROUTER', 'MODEM', 'FIREWALL', 'BANDWIDTH', 'SSD',
        'HDD', 'USB', 'MOTHERBOARD', 'INPUT', 'OUTPUT', 'PERIPHERAL', 'ANDROID', 'MACOS',
        'LINUX', 'APPLICATION', 'SOFTWARE', 'LIBRARY', 'MODULE', 'PACKAGE', 'FILE', 'FOLDER',
        'DIRECTORY', 'ROOT', 'PYTHON', 'CHEESE', 'PICKLE', 'BANANA', 'COPLEY'
    ]

    const hangmanStages = [
        [
            `______ `,
            `|/     `,
            `|      `,
            `|      `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|      `,
            `|      `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|      `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|    | `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /| `,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /|\\`,
            `|      `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /|\\`,
            `|   /  `,
            `|______`
        ],
        [
            `______ `,
            `|/   | `,
            `|    O `,
            `|   /|\\`,
            `|   / \\`,
            `|______`
        ],
    ]

    const hangmanWin = [
        `______ `,
        `|/   | `,
        `|      `,
        `|   \\O/`,
        `|    | `,
        `|___/_\\`,
    ]

    let name = 'Human'

    const createHangman = () => ({
        status: HANGMAN_STATUS.IDLE,
        word: [],
        revealed: [],
        guesses: [],
        feedback: '',
        mistakes: 0,
    })

    let hangman = createHangman()

    setTimeout(showBoot, BOOT_DELAY)

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

    const randomItem = arr => arr[Math.floor(Math.random() * arr.length)]

    const escapeHtml = text => text.replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[character])

    function bindBackButton(onBack = showOptions) {
        const backButton = document.getElementById('back')
        if (!backButton) return

        backButton.focus()
        backButton.addEventListener('click', onBack)
    }

    async function typeHtml(display, html, characterDelay = CHAR_PAUSE) {
        const template = document.createElement('template')
        template.innerHTML = html

        lucide.createIcons({
            root: template.content,
            attrs: {
                class: ['icon', 'no-zoom'],
                'stroke-width': 2,
                stroke: 'currentColor',
            },
        })

        async function typeNode(node, parent) {
            if (node.nodeType === Node.TEXT_NODE) {
                for (const character of node.textContent) {
                    if (character === '—') {
                        await wait(LONG_PAUSE)
                        continue
                    }
                    if (character === '–') {
                        await wait(SHORT_PAUSE)
                        continue
                    }

                    parent.append(character)
                    await wait(characterDelay)
                }
                return
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return

            const element = node.cloneNode(false)
            parent.appendChild(element)

            for (const child of node.childNodes) {
                await typeNode(child, element)
            }
        }

        for (const node of template.content.childNodes) {
            await typeNode(node, display)
        }
    }

    async function showTextPage(htmlLines) {
        const display = document.querySelector('.computer-screen-content')
        if (!display) return

        display.innerHTML = ''

        await wait(LINE_PAUSE)

        for (const html of htmlLines) {
            await typeHtml(display, html)
            await wait(LINE_PAUSE)
        }
    }

    async function showBoot() {
        await showTextPage([
            `<div class="mac-chat-centred-screen">
                <img
                    class="no-zoom mac-chat-boot-icon"
                    src="./_assets/macs/happy-mac-icon.png"
                >
            </div>`,
        ])

        setTimeout(showSmile, SMILE_DELAY)
    }

    async function showSmile() {
        await showTextPage([
            `<div class="mac-chat-centred-screen">
                <img
                    class="no-zoom mac-chat-smile-image"
                    src="./_assets/macs/face.svg"
                >
            </div>`,
        ])

        setTimeout(showGreeting, START_DELAY)
    }

    async function showGreeting() {
        name = 'Human'

        await showTextPage([
            `<h1>Hello, ${escapeHtml(name)}!</h1>`,
            `<p>I'm a <strong>Macintosh</strong> computer from <strong>1984</strong>.
                Back in the day I was considered pretty ripped: <i data-lucide="biceps-flexed"></i>`,
            `<ul class="mac-chat-specifications">
                <li><i data-lucide="cpu"></i> <strong>8 MHz</strong> CPU (single core)
                <li><i data-lucide="memory-stick"></i> <strong>128 kB</strong> RAM
                <li><i data-lucide="save"></i> <strong>400 kB</strong> 3.5inch floppy (OS / storage)
                <li><i data-lucide="square-square"></i> <strong>9" greyscale</strong> display (512×342 pixels)
                <li><i data-lucide="app-window"></i> <strong>Advanced GUI</strong> (graphical user interface)
                <li><i data-lucide="mouse-pointer"></i> <strong>Mouse</strong> to work with the GUI (one button)
            </ul>`,
            `<p>Nothing else like me in '84... Impressed?`,
            ``,
            `<p>
                So, what's your name?
                <input type="text" id="username">
            </p>`,
        ])

        const nameInput = document.getElementById('username')
        nameInput.focus()
        nameInput.addEventListener('change', () => {
            if (nameInput.value && nameInput.value.trim().length > 0) {
                name = nameInput.value.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                showOptions()
            }
        })
    }

    async function showOptions() {
        const starter = randomItem(starters)
        const prompt = randomItem(prompts)

        await showTextPage([
            `<h1>${starter}, ${escapeHtml(name)}, ${prompt}</h1>`,
            `<ol class="mac-chat-option-list">
                <li><i data-lucide="app-window"></i> See what my <strong>1984 GUI</strong> looked like
                <li><i data-lucide="square-play"></i> Watch a <strong>video about me</strong>
                <li><i data-lucide="computer"></i> See my 80s competition, the <strong>IBM PC</strong>
                <li><i data-lucide="info"></i> Read a cool <strong>computer fact</strong>
                <li><i data-lucide="face-grinning"></i> Hear a <strong>nerdy joke</strong>
                <li><i data-lucide="image"></i> See some fabulous <strong>ASCII art</strong>
                <li><i data-lucide="book-a"></i> Play a game of <strong>nerdy Hangman</strong>
                <li><i data-lucide="circle-power"></i> <strong>Reboot</strong> me
            </ol>`,
            `<p>Pick A-H <input type="text" size="1" id="choice">`
        ])

        const choiceInput = document.getElementById('choice')
        choiceInput.focus()
        choiceInput.addEventListener('change', () => {
            const choice = choiceInput.value.trim().toUpperCase()
            if (choice.length === 1 && choice >= 'A' && choice <= 'H') {
                if (choice === 'A') showGUI()
                if (choice === 'B') showVideo()
                if (choice === 'C') showPC()
                if (choice === 'D') showFact()
                if (choice === 'E') showJoke()
                if (choice === 'F') showArt()
                if (choice === 'G') playHangman()
                if (choice === 'H') showBoot()
            }
        })
    }

    async function showJoke() {
        const joke = randomItem(jokes)
        const laugh = randomItem(laughs)

        await showTextPage([
            `<h3>Ok, ${escapeHtml(name)}, here is a joke...</h3>`,
            `<h1 class="mac-chat-message">${joke}</h1>`,
            `<p class="mac-chat-comment"><i data-lucide="face-grinning"></i> ${laugh}`,
            `<button id="back">Back</button>`,
        ])

        bindBackButton()
    }

    async function showArt() {
        const art = randomItem(asciiArt).join('\n')

        await showTextPage([
            `<h1>Check out this art, ${escapeHtml(name)}...</h1>`,
            `<h1><pre class="mac-chat-ascii-art">${art}</pre></h1>`,
            `<button id="back">Back</button>`,
        ])

        bindBackButton()
    }

    async function showFact() {
        const fact = randomItem(facts)
        const comment = randomItem(comments)

        await showTextPage([
            `<h3>Ok, ${escapeHtml(name)}, here is a neat fact...</h3>`,
            `<h1 class="mac-chat-message">${fact}</h1>`,
            `<p class="mac-chat-comment"><i data-lucide="thumbs-up"></i> ${comment}`,
            `<button id="back">Back</button>`,
        ])

        bindBackButton()
    }

    async function showVideo() {
        await showTextPage([
            `<iframe
                class="mac-chat-video"
                src="https://www.youtube.com/embed/-5zeJyQ31rM?si=Nu5kt3cATnkyfKBp"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
            ></iframe>`,
            `<div class="mac-chat-controls">
                <button id="back">Back</button>
                <span><i data-lucide="triangle-alert"></i> Warning: The 80s vibe is strong!</span>
            </div>`,
        ])

        bindBackButton()
    }

    async function showGUI() {
        await showTextPage([
            `<img
                class="no-zoom mac-chat-gui-image"
                src="./_assets/macs/macintosh-screen.png"
            >`,
            `<button id="back" class="mac-chat-gui-back">Back</button>`,
        ])

        bindBackButton()
    }

    async function showPC() {
        await showTextPage([
            `
            <div class="mac-chat-pc-header">
                <h1>IBM PC XT, 1983</h1>
                <button id="back">Back</button>
            </div>
            <div class="mac-chat-pc-content">
                <img src="./_assets/macs/ibm-pc.png">
                <ul>
                    <li><i data-lucide="cpu"></i> 4.77 MHz CPU
                    <li><i data-lucide="memory-stick"></i> 128kB RAM
                    <li><i data-lucide="square-square"></i> Monochrome CRT
                    <li><i data-lucide="save"></i> 5.25" floppy
                    <li><i data-lucide="square-terminal"></i> MS-DOS CLI
                    <li><i data-lucide="weight"></i> Chunky!
                </ul>
            </div>
            <h3>What a brute! Not classy like me! <i data-lucide="face-grinning"></i></h3>
            `,
        ])

        bindBackButton()
    }

    async function playHangman() {
        if (hangman.status === HANGMAN_STATUS.IDLE) {
            hangman = createHangman()
            hangman.word = randomItem(words).split('')
            hangman.revealed = Array(hangman.word.length).fill('_')
            hangman.status = HANGMAN_STATUS.PLAYING
        }

        let hangmanText = hangman.revealed.join(' ')
        const guessesText = hangman.guesses.length > 0 ? [...hangman.guesses].sort().join(' ') : 'none'
        let hangmanStage = hangmanStages[hangman.mistakes].join('\n')
        const mistakesText = `${hangman.mistakes} / ${hangmanStages.length - 1}`

        let promptText = ''

        if (hangman.feedback.length > 0) {
            promptText = hangman.feedback
            hangman.feedback = ''
        }

        if (hangman.status === HANGMAN_STATUS.WON) {
            promptText += '<p><i data-lucide="trophy"></i> <strong>You guessed the word!</strong>'
            hangmanStage = hangmanWin.join('\n')
        }

        if (hangman.status === HANGMAN_STATUS.LOST) {
            promptText += '<p><i data-lucide="face-slightly-frowning"></i> Oh no, <strong>you were hanged!</strong>'
            hangmanText = hangman.word.join(' ')
        }

        await showTextPage([
            `<h1>Hangman with ${escapeHtml(name)} the Human</h1>`,
            ``,
            `<div class="mac-chat-hangman-status">
                <div>
                    <p>${promptText}
                    <p>Mistakes: ${mistakesText}
                    <p>Used: ${guessesText}
                </div>
                <pre>${hangmanStage}</pre>
            </div>`,
            `<h1 class="mac-chat-hangman-word">${hangmanText}</h1>`,
            `<div class="mac-chat-controls">
                <span>Guess <input type="text" size="1" id="guess"></span>
                <button id="back">Back</button>
            </div>`,
        ])

        bindBackButton(() => {
            hangman = createHangman()
            showOptions()
        })

        const guessInput = document.getElementById('guess')
        if (guessInput) {
            guessInput.focus()
            guessInput.addEventListener('change', () => {
                const guess = guessInput.value.trim().toUpperCase()

                if (guess.length === 0) return

                if (guess.length === 1 && guess >= 'A' && guess <= 'Z') {
                    if (hangman.guesses.includes(guess)) {
                        hangman.feedback = `<i data-lucide="circle-slash"></i> Whoops! You already tried '${guess}'...`
                        playHangman()
                        return
                    }

                    hangman.guesses.push(guess)

                    if (hangman.word.includes(guess)) {
                        hangman.feedback = `<i data-lucide="circle-check"></i> Yes! '${guess}' <strong>is</strong> in the word`

                        const updatedRevealedWord = hangman.word.map((char, index) => {
                            return char === guess ? char : hangman.revealed[index]
                        })
                        hangman.revealed = updatedRevealedWord

                        if (!hangman.revealed.includes('_')) {
                            hangman.status = HANGMAN_STATUS.WON
                        }
                    }
                    else {
                        hangman.feedback = `<i data-lucide="circle-x"></i> No! '${guess}' is <strong>not</strong> in the word`
                        hangman.mistakes++

                        if (hangman.mistakes === hangmanStages.length - 1) {
                            hangman.status = HANGMAN_STATUS.LOST
                        }
                    }

                    playHangman()
                }
            })
        }
    }
</script>

