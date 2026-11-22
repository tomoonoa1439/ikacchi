// French content in English (reading = English-style respelling, CAPS = stressed syllable)
const FR_EN_DAYS=[
['Sound rules','French spelling follows consistent rules. Start with these: final consonants are usually silent, and a few vowel combinations always sound the same.',`Paris|pa-REE|Paris (final s is silent)
vous|voo|you (ou = "oo")
lait|leh|milk (ai = "eh")
eau|oh|water (eau = "oh")
bon|bohn (nasal)|good (on = nasal "ohn")
enfant|ahn-FAHN (nasal)|child (an/en = nasal "ahn")
tu|tü|you, informal (u = say "ee" with rounded lips)
moi|mwah|me (oi = "wa")`],
['Greetings','Always say Bonjour when you walk into a shop. In France it is basic politeness.',`Bonjour|bohn-ZHOOR|Hello / Good morning
Bonsoir|bohn-SWAHR|Good evening
Salut|sa-LÜ|Hi (to friends)
Au revoir|oh ruh-VWAHR|Goodbye
Merci|mehr-SEE|Thank you
Merci beaucoup|mehr-SEE boh-KOO|Thank you very much
S'il vous plaît|seel voo PLEH|Please
Pardon|par-DOHN|Excuse me / Sorry`],
['Numbers 1–10','The base for catching prices and times.',`un|uhn|1
deux|duh|2
trois|twah|3
quatre|KATR|4
cinq|sank|5
six|sees|6
sept|set|7
huit|weet|8
neuf|nuhf|9
dix|dees|10`],
['Quick replies','Short replies you will use all the time.',`Oui|wee|Yes
Non|nohn|No
D'accord|da-KOR|OK / Agreed
Je ne sais pas|zhuh nuh seh PAH|I don't know
Je comprends|zhuh kohm-PRAHN|I understand
Pas de problème|pah duh pro-BLEM|No problem`],
['Same as English','Same spelling as English, French pronunciation. The h is always silent.',`restaurant|res-toh-RAHN|restaurant
hôtel|oh-TEL|hotel
important|an-por-TAHN|important
possible|po-SEEBL|possible
question|kes-TYOHN|question
table|TAHBL|table
chocolat|sho-ko-LAH|chocolate
police|po-LEES|police`],
['Introducing yourself','Women say Enchantée and japonaise. Enchantée sounds the same; japonaise is "zha-po-NEZ".',`Je m'appelle Yuki|zhuh ma-PEL yoo-KEE|My name is Yuki
Je suis japonais|zhuh swee zha-po-NEH|I'm Japanese (women: japonaise, zha-po-NEZ)
Enchanté|ahn-shahn-TAY|Nice to meet you
Comment allez-vous ?|ko-mahn ta-lay VOO|How are you? (formal)
Ça va ?|sa VAH|How's it going?
Ça va bien|sa vah BYAN|I'm fine`],
null,
['être (to be)','The most important verb. Its form changes with the subject, just like am / are / is.',`je suis|zhuh SWEE|I am
tu es|tü EH|you are (informal)
il est|ee LEH|he is
elle est|eh LEH|she is
nous sommes|noo SOM|we are
vous êtes|voo ZET|you are (formal / plural)`],
['avoir (to have)','French uses "have" for hunger and age: "I have hunger", "I have 20 years".',`j'ai|zhay|I have
tu as|tü AH|you have
il a|ee LAH|he has
vous avez|voo za-VAY|you have (formal / plural)
J'ai faim|zhay FAN|I'm hungry
J'ai vingt ans|zhay van TAHN|I'm 20 years old`],
['Masculine & feminine','Every noun has a gender: le / un = masculine, la / une = feminine, les = plural. Learn each noun together with its article.',`le garçon|luh gar-SOHN|the boy (masculine)
la fille|la FEE-y|the girl (feminine)
un livre|uhn LEEVR|a book (masculine)
une maison|ün meh-ZOHN|a house (feminine)
les amis|lay za-MEE|the friends (plural)
le café|luh ka-FAY|coffee / café`],
['Numbers 11–100','With these you can roughly catch prices.',`onze|ohnz|11
douze|dooz|12
quinze|kanz|15
vingt|van|20
trente|trahnt|30
cinquante|san-KAHNT|50
cent|sahn|100`],
['At a shop','Je voudrais = "I would like". The polite way to ask for something.',`Je voudrais un croissant|zhuh voo-DREH uhn krwa-SAHN|I'd like a croissant
C'est combien ?|seh kohm-BYAN|How much is it?
de l'eau|duh LOH|some water
L'addition, s'il vous plaît|la-dee-SYOHN seel voo PLEH|The check, please
Où sont les toilettes ?|oo sohn lay twa-LET|Where is the restroom?`],
['Likes & opinions','C\'est … = "It\'s …". Handy for giving your opinion.',`J'aime|zhem|I like / I love
Je n'aime pas|zhuh nem PAH|I don't like
J'adore|zha-DOR|I love it
C'est bon|seh BOHN|It's good (tasty)
C'est cher|seh SHEHR|It's expensive
C'est joli|seh zho-LEE|It's pretty`],
null,
['-er verbs','Verbs ending in -er follow a regular pattern. In "je parle" the final e is silent (PARL). From today, readings stay hidden until you tap them.',`parler|par-LAY|to speak
manger|mahn-ZHAY|to eat
aimer|eh-MAY|to love / to like
regarder|ruh-gar-DAY|to watch / to look at
travailler|tra-va-YAY|to work
Je parle japonais|zhuh parl zha-po-NEH|I speak Japanese`],
['aller & faire','aller = to go, faire = to do / to make. The two most common verbs in conversation.',`je vais|zhuh VEH|I go / I'm going
tu vas|tü VAH|you go
On y va|oh nee VAH|Let's go
je fais|zhuh FEH|I do / I make
Qu'est-ce que tu fais ?|kes kuh tü FEH|What are you doing?
Je vais à Paris|zhuh veh a pa-REE|I'm going to Paris`],
['Question words','Catch these and you can follow the flow of a conversation.',`Qui|kee|Who
Quoi|kwah|What
Où|oo|Where
Quand|kahn|When
Pourquoi|poor-KWAH|Why
Comment|ko-MAHN|How`],
['Time words','Essential for talking about dates and plans.',`aujourd'hui|oh-zhoor-DWEE|today
demain|duh-MAN|tomorrow
hier|YEHR|yesterday
maintenant|mant-NAHN|now
le matin|luh ma-TAN|the morning
le soir|luh SWAHR|the evening`],
['Past tense','avoir / être + past participle = "did". It works like English "I have eaten".',`J'ai mangé|zhay mahn-ZHAY|I ate
J'ai vu|zhay VÜ|I saw
Je suis allé|zhuh swee za-LAY|I went
J'ai fini|zhay fee-NEE|I finished
C'était bien|say-teh BYAN|It was good`],
['Heard all the time','One-liners native speakers use constantly.',`C'est vrai ?|seh VREH|Really?
Bien sûr|byan SÜR|Of course
Pas mal|pah MAL|Not bad
Attends|a-TAHN|Wait
Désolé|day-zo-LAY|Sorry
Tant pis|tahn PEE|Oh well / Too bad`],
null,
['Short dialogues 1','Now practise with sentences. Listen with 🔊 first, guess the meaning, then check.',`Tu vas où ?|tü vah OO|Where are you going?
Je vais au travail|zhuh veh oh tra-VAI|I'm going to work
On mange ensemble ?|ohn mahnzh ahn-SAHMBL|Shall we eat together?
Avec plaisir|a-vek pleh-ZEER|With pleasure
À plus tard|a plü TAR|See you later`],
['Short dialogues 2','Weather always uses Il fait … ("it makes …").',`Tu as fait quoi ce week-end ?|tü a feh KWAH suh wee-KEND|What did you do this weekend?
J'ai vu un film|zhay vü uhn FEELM|I saw a movie
Il fait beau|eel feh BOH|The weather's nice
Il pleut|eel PLUH|It's raining
Il fait froid|eel feh FRWAH|It's cold`],
['Asking again','Phrases for when you can\'t catch something. They keep a conversation going.',`Vous pouvez parler lentement ?|voo poo-VAY par-LAY lahnt-MAHN|Could you speak slowly?
Vous pouvez répéter ?|voo poo-VAY ray-pay-TAY|Could you repeat that?
Je ne comprends pas|zhuh nuh kohm-prahn PAH|I don't understand
Je parle un peu français|zhuh parl uhn puh frahn-SEH|I speak a little French
Ça veut dire quoi ?|sa vuh deer KWAH|What does that mean?`],
['Around town','The basics for asking the way.',`Quelle heure est-il ?|kel uhr eh-TEEL|What time is it?
Il est trois heures|ee leh trwa ZUHR|It's three o'clock
La gare, c'est où ?|la GAR seh OO|Where's the station?
À droite|a DRWAHT|To the right
À gauche|a GOHSH|To the left
Tout droit|too DRWAH|Straight ahead`],
['Set phrases','Classics for meals, celebrations and goodbyes.',`Joyeux anniversaire|zhwa-yuh za-nee-vehr-SEHR|Happy birthday
Bon appétit|bo-na-pay-TEE|Enjoy your meal
Bonne journée|bon zhoor-NAY|Have a nice day
Bon courage|bohn koo-RAZH|Good luck / Hang in there
Félicitations|fay-lee-see-ta-SYOHN|Congratulations`],
['Movie lines','Emotional lines. Try to spot them in French films.',`Je t'aime|zhuh TEM|I love you
Tu me manques|tü muh MAHNK|I miss you
Ça va aller|sa va a-LAY|It's going to be OK
N'importe quoi|nan-port KWAH|Nonsense!
C'est pas grave|seh pah GRAV|It's no big deal`],
null,null,null];
const FR_EN_REVIEW={rv:['Review test','Questions from this week. Try to catch them without readings.'],all:['Full review','Everything from the four weeks. Replay the ones you miss with 🔊.'],final:['Final test','20 questions from all 30 days. Can you get the meaning by ear alone?']};
const FR_EN_EX=`
#Bonjour
= bon|bohn|good
= jour|zhoor|day
! Literally "good day". After about 6 pm, switch to Bonsoir.
#Bonsoir
= bon|bohn|good
= soir|swahr|evening
#Au revoir
= au|oh|to the
= revoir|ruh-vwahr|seeing again
! Literally "until we see each other again".
#Merci beaucoup
= merci|mehr-see|thank you
= beaucoup|boh-koo|a lot
#S'il vous plaît
= s'il|seel|if it
= vous|voo|(to) you
= plaît|pleh|pleases
! Literally "if it pleases you". With friends, say S'il te plaît.
+ Un café, s'il vous plaît|uhn ka-FAY seel voo PLEH|A coffee, please
+ S'il te plaît|seel tuh PLEH|Please (to a friend)
#Pardon
! Use it when you bump into someone, to get someone's attention, or to ask "sorry, what?".
#Je ne sais pas
= je|zhuh|I
= ne … pas|nuh … pah|not (negation)
= sais|seh|know
! To make a verb negative, sandwich it between ne and pas.
+ Je ne sais pas parler français|zhuh nuh seh pah par-LAY frahn-SEH|I can't speak French
#Je comprends
= je|zhuh|I
= comprends|kohm-prahn|understand
! Negative: Je ne comprends pas (I don't understand).
#Pas de problème
= pas de|pah duh|no
= problème|pro-blem|problem
#Je m'appelle Yuki
= je|zhuh|I
= m'appelle|ma-pel|call myself
= Yuki|yoo-kee|(name)
! Literally "I call myself Yuki".
+ Je m'appelle Kenji|zhuh ma-PEL ken-ZHEE|My name is Kenji
#Je suis japonais
= je|zhuh|I
= suis|swee|am
= japonais|zha-po-neh|Japanese
! Unlike English, no capital letter and no article for nationality or job. Women add an e: japonaise.
+ Je suis japonaise|zhuh swee zha-po-NEZ|I'm Japanese (woman)
+ Je suis coréen|zhuh swee ko-ray-AN|I'm Korean (woman: coréenne, ko-ray-EN)
+ Je suis étudiant|zhuh swee zay-tü-DYAHN|I'm a student
#Comment allez-vous ?
= comment|ko-mahn|how
= allez|a-lay|are going
= vous|voo|you
! The t of comment links to allez: "ko-mahn TA-lay". This linking is called liaison.
#Ça va ?
= ça|sa|it / things
= va|vah|goes
! Ça va ? (rising) = How's it going? Ça va. (falling) = I'm fine. Same words, different intonation.
#Ça va bien
= ça va|sa vah|things are going
= bien|byan|well
+ Ça va mal|sa vah MAL|Things aren't going well
#je suis
+ Je suis fatigué|zhuh swee fa-tee-GAY|I'm tired
#il est
+ Il est gentil|ee leh zhahn-TEE|He's kind
#elle est
+ Elle est française|eh leh frahn-SEZ|She's French
#vous êtes
! The s of vous links to êtes: "voo ZET" (liaison).
+ Vous êtes japonais ?|voo zet zha-po-NEH|Are you Japanese?
#J'ai faim
= j'ai|zhay|I have
= faim|fan|hunger
! French says "I have hunger", not "I am hungry".
+ J'ai soif|zhay SWAHF|I'm thirsty
#J'ai vingt ans
= j'ai|zhay|I have
= vingt|van|twenty
= ans|ahn|years
! Age also uses avoir: "I have 20 years".
+ J'ai trente ans|zhay trahn TAHN|I'm 30 years old
#le garçon
! Masculine nouns take le, feminine nouns take la.
#les amis
! The s of les links to amis: "lay za-MEE" (liaison).
#Je voudrais un croissant
= je voudrais|zhuh voo-dreh|I would like
= un|uhn|a
= croissant|krwa-sahn|croissant
+ Je voudrais un café|zhuh voo-DREH uhn ka-FAY|I'd like a coffee
+ Je voudrais de l'eau|zhuh voo-DREH duh LOH|I'd like some water
#C'est combien ?
= c'est|seh|it is
= combien|kohm-byan|how much
#L'addition, s'il vous plaît
= l'addition|la-dee-syohn|the bill (addition)
= s'il vous plaît|seel voo pleh|please
#Où sont les toilettes ?
= où|oo|where
= sont|sohn|are
= les toilettes|lay twa-let|the toilets
! "Toilettes" is always plural. For one thing, use Où est … ?
+ Où est la gare ?|oo eh la GAR|Where is the station?
#J'aime
+ J'aime le café|zhem luh ka-FAY|I like coffee
#Je n'aime pas
+ Je n'aime pas le froid|zhuh nem pah luh FRWAH|I don't like the cold
#J'adore
+ J'adore Paris|zha-dor pa-REE|I love Paris
#C'est bon
= c'est|seh|it's
= bon|bohn|good / tasty
+ C'est très bon|seh treh BOHN|It's very good
#Je parle japonais
= je|zhuh|I
= parle|parl|speak
= japonais|zha-po-neh|Japanese
! Language names are the same words as nationalities, without a capital letter.
+ Je parle anglais|zhuh parl ahn-GLEH|I speak English
+ Tu parles français ?|tü parl frahn-SEH|Do you speak French?
#On y va
= on|ohn|we
= y|ee|there
= va|vah|go
#Qu'est-ce que tu fais ?
= qu'est-ce que|kes kuh|what
= tu|tü|you
= fais|feh|do
+ Qu'est-ce que c'est ?|kes kuh SEH|What is it?
#Je vais à Paris
= je vais|zhuh veh|I go
= à|a|to
= Paris|pa-ree|Paris
+ Je vais à Tokyo|zhuh veh a to-KYO|I'm going to Tokyo
#J'ai mangé
= j'ai|zhay|I have (past helper)
= mangé|mahn-zhay|eaten
! manger and mangé sound the same, so listen for j'ai: it tells you it's past.
+ J'ai mangé une pizza|zhay mahn-ZHAY ün peet-ZA|I ate a pizza
#Je suis allé
= je suis|zhuh swee|I am (movement verbs use être)
= allé|a-lay|gone
! Women write allée (same sound).
+ Je suis allé à Paris|zhuh swee za-LAY a pa-REE|I went to Paris
#C'était bien
= c'était|say-teh|it was
= bien|byan|good
#Tu vas où ?
= tu|tü|you
= vas|vah|go
= où|oo|where
! In casual speech the question word often goes at the end.
#Je vais au travail
= je vais|zhuh veh|I go
= au|oh|to the (à + le)
= travail|tra-vai|work
+ Je vais au cinéma|zhuh veh oh see-nay-MA|I'm going to the cinema
#On mange ensemble ?
= on|ohn|we
= mange|mahnzh|eat
= ensemble|ahn-sahmbl|together
#Avec plaisir
= avec|a-vek|with
= plaisir|pleh-zeer|pleasure
#À plus tard
= à|a|until
= plus tard|plü tar|later
#Tu as fait quoi ce week-end ?
= tu as fait|tü a feh|you did
= quoi|kwah|what
= ce week-end|suh wee-kend|this weekend
#J'ai vu un film
= j'ai vu|zhay vü|I saw
= un film|uhn feelm|a movie
#Il fait beau
= il fait|eel feh|it makes (weather)
= beau|boh|beautiful
! Weather always uses Il fait …
+ Il fait chaud|eel feh SHOH|It's hot
#Il pleut
+ Il neige|eel NEZH|It's snowing
#Vous pouvez parler lentement ?
= vous pouvez|voo poo-vay|you can
= parler|par-lay|speak
= lentement|lahnt-mahn|slowly
#Vous pouvez répéter ?
= vous pouvez|voo poo-vay|you can
= répéter|ray-pay-tay|repeat
#Je ne comprends pas
= ne … pas|nuh … pah|not
= comprends|kohm-prahn|understand
#Je parle un peu français
= je parle|zhuh parl|I speak
= un peu|uhn puh|a little
= français|frahn-seh|French
#Ça veut dire quoi ?
= ça|sa|that
= veut dire|vuh deer|means (wants to say)
= quoi|kwah|what
#Quelle heure est-il ?
= quelle heure|kel uhr|what hour
= est-il|eh-teel|is it
#Il est trois heures
= il est|ee leh|it is (time)
= trois|trwah|three
= heures|uhr|hours / o'clock
+ Il est midi|ee leh mee-DEE|It's noon
#La gare, c'est où ?
= la gare|la gar|the station
= c'est|seh|it is
= où|oo|where
#Bon appétit
= bon|bohn|good
= appétit|a-pay-tee|appetite
#Bonne journée
= bonne|bon|good (feminine)
= journée|zhoor-nay|day
+ Bonne soirée|bon swa-RAY|Have a nice evening
#Je t'aime
= je|zhuh|I
= t'|t|you
= aime|em|love
#Tu me manques
= tu|tü|you
= me|muh|to me
= manques|mahnk|are missing
! Literally "you are missing to me" — the opposite word order from English "I miss you".
#Ça va aller
= ça|sa|it
= va aller|va a-lay|is going to go (fine)
#C'est pas grave
= c'est pas|seh pah|it's not
= grave|grav|serious
`;
const FR_EN_DECK=`
homme|om|man / human
femme|fam|woman / wife
ami|a-MEE|friend (male)
amie|a-MEE|friend (female)
famille|fa-MEE-y|family
mère|mehr|mother
père|pehr|father
frère|frehr|brother
sœur|suhr|sister
fils|fees|son
mari|ma-REE|husband
monsieur|muh-SYUH|Mr. / sir
madame|ma-DAM|Mrs. / madam
gens|zhahn|people
professeur|pro-feh-SUHR|teacher
médecin|mayd-SAN|doctor
bébé|bay-BAY|baby
il|eel|he
elle|el|she
nous|noo|we
ils|eel|they
ça|sa|that / it
tout|too|everything / all
rien|ryan|nothing
quelqu'un|kel-KUHN|someone
quelque chose|kel-kuh SHOHZ|something
ville|veel|town / city
pays|pay-EE|country
rue|rü|street
gare|gar|train station
école|ay-KOL|school
bureau|bü-ROH|office / desk
magasin|ma-ga-ZAN|shop
boulangerie|boo-lahn-zhuh-REE|bakery
marché|mar-SHAY|market
hôpital|oh-pee-TAL|hospital
banque|bahnk|bank
aéroport|a-ay-ro-POR|airport
chambre|SHAHMBR|bedroom / room
cuisine|kwee-ZEEN|kitchen / cooking
mer|mehr|sea
montagne|mohn-TAN-y|mountain
parc|park|park
France|frahns|France
Japon|zha-POHN|Japan
Corée|ko-RAY|Korea
musée|mü-ZAY|museum
jour|zhoor|day
semaine|suh-MEN|week
mois|mwah|month
année|a-NAY|year
heure|uhr|hour / o'clock
minute|mee-NÜT|minute
midi|mee-DEE|noon
nuit|nwee|night
toujours|too-ZHOOR|always
souvent|soo-VAHN|often
parfois|par-FWAH|sometimes
jamais|zha-MEH|never
déjà|day-ZHA|already
encore|ahn-KOR|still / again
bientôt|byan-TOH|soon
tard|tar|late
tôt|toh|early
avant|a-VAHN|before
après|a-PREH|after
lundi|luhn-DEE|Monday
vendredi|vahn-druh-DEE|Friday
dimanche|dee-MAHNSH|Sunday
pain|pan|bread
vin|van|wine
bière|byehr|beer
thé|tay|tea
viande|vyahnd|meat
poisson|pwa-SOHN|fish
fromage|fro-MAZH|cheese
légumes|lay-GÜM|vegetables
fruit|frwee|fruit
pomme|pom|apple
gâteau|ga-TOH|cake
petit-déjeuner|puh-tee day-zhuh-NAY|breakfast
déjeuner|day-zhuh-NAY|lunch
dîner|dee-NAY|dinner
repas|ruh-PAH|meal
téléphone|tay-lay-FON|phone
portable|por-TAHBL|mobile phone
ordinateur|or-dee-na-TUHR|computer
argent|ar-ZHAHN|money / silver
voiture|vwa-TÜR|car
train|tran|train
métro|may-TROH|subway
bus|büs|bus
avion|a-VYOHN|plane
billet|bee-YEH|ticket
clé|klay|key
sac|sak|bag
vêtements|vet-MAHN|clothes
chaussures|shoh-SÜR|shoes
photo|fo-TOH|photo
chanson|shahn-SOHN|song
film|feelm|movie
cadeau|ka-DOH|gift
travail|tra-VAI|work / job
problème|pro-BLEM|problem
idée|ee-DAY|idea
chose|shohz|thing
temps|tahn|time / weather
vie|vee|life
amour|a-MOOR|love
cœur|kuhr|heart
main|man|hand
tête|tet|head
yeux|zyuh|eyes
corps|kor|body
nom|nohn|name
langue|lahng|language / tongue
mot|moh|word
être|ETR|to be
avoir|a-VWAHR|to have
aller|a-LAY|to go
faire|fehr|to do / to make
venir|vuh-NEER|to come
voir|vwahr|to see
savoir|sa-VWAHR|to know
pouvoir|poo-VWAHR|can / to be able to
vouloir|voo-LWAHR|to want
dire|deer|to say
prendre|PRAHNDR|to take
donner|do-NAY|to give
acheter|ash-TAY|to buy
vendre|VAHNDR|to sell
boire|bwahr|to drink
dormir|dor-MEER|to sleep
partir|par-TEER|to leave
arriver|a-ree-VAY|to arrive
rester|res-TAY|to stay
chercher|shehr-SHAY|to look for
trouver|troo-VAY|to find
penser|pahn-SAY|to think
croire|krwahr|to believe
attendre|a-TAHNDR|to wait
écouter|ay-koo-TAY|to listen
entendre|ahn-TAHNDR|to hear
lire|leer|to read
écrire|ay-KREER|to write
apprendre|a-PRAHNDR|to learn
comprendre|kohm-PRAHNDR|to understand
aider|eh-DAY|to help
jouer|zhoo-AY|to play
marcher|mar-SHAY|to walk
ouvrir|oo-VREER|to open
fermer|fehr-MAY|to close
commencer|ko-mahn-SAY|to start
finir|fee-NEER|to finish
habiter|a-bee-TAY|to live (somewhere)
payer|peh-YAY|to pay
oublier|oo-blee-AY|to forget
demander|duh-mahn-DAY|to ask
répondre|ray-POHNDR|to answer
rentrer|rahn-TRAY|to go home
sortir|sor-TEER|to go out
voyager|vwa-ya-ZHAY|to travel
il faut|eel FOH|you have to / it's necessary
je veux|zhuh VUH|I want
je peux|zhuh PUH|I can
je sais|zhuh SEH|I know
je dois|zhuh DWAH|I must
il y a|ee-lee-YA|there is / ago
c'est|seh|it is / that's
grand|grahn|big / tall
petit|puh-TEE|small
nouveau|noo-VOH|new
vieux|vyuh|old
jeune|zhuhn|young
beau|boh|beautiful / nice (weather)
mauvais|mo-VEH|bad
facile|fa-SEEL|easy
difficile|dee-fee-SEEL|difficult
chaud|shoh|hot / warm
froid|frwah|cold
cher|shehr|expensive / dear
heureux|uh-RUH|happy
triste|treest|sad
fatigué|fa-tee-GAY|tired
content|kohn-TAHN|glad / pleased
gentil|zhahn-TEE|kind / nice
long|lohn|long
court|koor|short
même|mem|same / even
autre|OHTR|other
premier|pruh-MYAY|first
dernier|dehr-NYAY|last
prêt|preh|ready
libre|LEEBR|free / available
malade|ma-LAD|sick
délicieux|day-lee-SYUH|delicious
très|treh|very
trop|troh|too (much)
un peu|uhn PUH|a little
beaucoup|boh-KOO|a lot / very much
bien|byan|well
mal|mal|badly
ici|ee-SEE|here
là|la|there
aussi|oh-SEE|also / too
mais|meh|but
et|ay|and
ou|oo|or
donc|dohnk|so / therefore
parce que|pars kuh|because
si|see|if / so
avec|a-VEK|with
sans|sahn|without
pour|poor|for
dans|dahn|in
sur|sür|on
chez|shay|at (someone's place)
peut-être|puh-TETR|maybe
vraiment|vreh-MAHN|really
alors|a-LOR|so / then
enfin|ahn-FAN|finally / well
seulement|suhl-MAHN|only
presque|presk|almost
Allô ?|a-LOH|Hello? (on the phone)
Excusez-moi|eks-kü-zay MWAH|Excuse me
De rien|duh RYAN|You're welcome
Bienvenue|byan-vuh-NÜ|Welcome
Bonne nuit|bon NWEE|Good night
À demain|a duh-MAN|See you tomorrow
Voilà|vwa-LA|Here you go / There it is
Pas du tout|pah dü TOO|Not at all
Je suis désolé|zhuh swee day-zo-LAY|I'm sorry
Exactement|eg-zak-tuh-MAHN|Exactly
Super|sü-PEHR|Great
Génial|zhay-NYAL|Brilliant / Awesome
Oh là là|oh la LA|Oh dear / Wow
Ça marche|sa MARSH|OK / That works
Tu as raison|tü a reh-ZOHN|You're right
J'ai compris|zhay kohm-PREE|I got it
Volontiers|vo-lohn-TYAY|Gladly
quarante|ka-RAHNT|40
soixante|swa-SAHNT|60
soixante-dix|swa-sahnt DEES|70
quatre-vingts|ka-truh VAN|80
quatre-vingt-dix|ka-truh van DEES|90
mille|meel|1000
euro|uh-ROH|euro
`;
(function(){
  const fr=DATA.fr;
  const parseEx=txt=>{const m={};let cur=null;txt.trim().split('\n').forEach(l=>{l=l.trim();if(!l)return;const c=l[0],r=l.slice(1).trim();
    if(c==='#')cur=m[r]={b:[],ex:[],note:''};else if(c==='=')cur.b.push(r.split('|'));else if(c==='+')cur.ex.push(r.split('|'));else if(c==='!')cur.note+=r;});return m};
  const ex=parseEx(FR_EN_EX);
  fr.days.forEach((d,i)=>{
    const e=FR_EN_DAYS[i];
    if(e&&d.items){d.te=e[0];d.tipe=e[1];
      e[2].trim().split('\n').forEach((l,j)=>{const p=l.split('|');const it=d.items[j];if(it&&it.t===p[0]){it.re=p[1];it.me=p[2];it.xe=ex[it.t.trim()]}});}
    else if(d.review){const r=d.review==='final'?'final':d.review==='all'?'all':'rv';d.te=FR_EN_REVIEW[r][0];d.tipe=FR_EN_REVIEW[r][1]}
  });
  const dk={};FR_EN_DECK.trim().split('\n').forEach(l=>{const p=l.split('|');dk[p[0]]=p});
  fr.deck.forEach(it=>{const p=dk[it.t];if(p){it.re=p[1];it.me=p[2]}});
})();
