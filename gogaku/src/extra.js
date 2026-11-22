// ===== 耳トレ（HVPT）セット =====
// ko: [語, 読み, 意味]   fr: [語, 読み(日), 読み(英), 意味(日), 意味(英)]
const EAR={
ko:[
 {id:'p',name:'ㅂ / ㅍ / ㅃ',note:'平音はやわらかく、激音は息を強く、濃音はのどを詰めて息を出さない。',items:[['불','プル','火（平音）'],['풀','プル','草（激音：息が強い）'],['뿔','ップル','角（濃音：詰まった音）']]},
 {id:'t',name:'ㄷ / ㅌ / ㄸ',note:'日本語の「タ」は平音と激音の中間。息の強さに注目。',items:[['달','タル','月（平音）'],['탈','タル','仮面（激音）'],['딸','ッタル','娘（濃音）']]},
 {id:'k',name:'ㄱ / ㅋ / ㄲ',note:'語頭の平音は少し息が出る。激音はさらに強く、濃音は息なし。',items:[['기','キ','気・旗（平音）'],['키','キ','背（激音）'],['끼','ッキ','才能（濃音）']]},
 {id:'j',name:'ㅈ / ㅊ / ㅉ',note:'자다＝寝る、차다＝蹴る、짜다＝しょっぱい。意味が全く変わる。',items:[['자다','チャダ','寝る（平音）'],['차다','チャダ','蹴る・冷たい（激音）'],['짜다','ッチャダ','しょっぱい（濃音）']]},
 {id:'s',name:'ㅅ / ㅆ',note:'ㅆは強く鋭い「ッサ」。',items:[['살','サル','肉・〜歳（ㅅ）'],['쌀','ッサル','米（ㅆ）'],['사요','サヨ','買います（ㅅ）'],['싸요','ッサヨ','安いです（ㅆ）']]},
 {id:'eo',name:'ㅓ / ㅗ',note:'ㅓは口を大きく開けた「オ」、ㅗは唇を丸めた「オ」。',items:[['거리','コリ','通り（ㅓ）'],['고리','コリ','輪（ㅗ）'],['저','チョ','私（ㅓ）'],['조','チョ','組・兆（ㅗ）']]},
 {id:'u',name:'ㅜ / ㅡ',note:'ㅜは唇を突き出す、ㅡは口を横に引く。',items:[['우','ウ','ㅜ（唇を突き出す）'],['으','ウ','ㅡ（横に引く）'],['구','ク','9（ㅜ）'],['그','ク','その（ㅡ）']]},
 {id:'n',name:'パッチム ㄴ / ㅇ / ㅁ',note:'ㄴは舌先を上の歯茎に、ㅇは舌を奥に（鼻に抜ける）、ㅁは口を閉じる。',items:[['반','パン','半分（ㄴ）'],['방','パン','部屋（ㅇ）'],['밤','パム','夜・栗（ㅁ）']]},
 {id:'b',name:'パッチム ㄱ / ㄷ / ㅂ',note:'どれも音を出し切らずに止める。止める場所（のど奥・舌先・唇）が違う。',items:[['박','パク','ひょうたん（ㄱ）'],['밭','パッ','畑（ㄷの音）'],['밥','パプ','ご飯（ㅂ）']]}
],
fr:[
 {id:'u',name:'u / ou',note:'u = 「イ」の舌で唇を丸める。ou = 唇を突き出す「ウ」。',noteEn:'u = say "ee" with rounded lips. ou = "oo".',items:[['tu','テュ','tü','君（u）','you (u)'],['tout','トゥ','too','全部（ou）','all (ou)'],['rue','リュ','rü','通り（u）','street (u)'],['roue','ルー','roo','車輪（ou）','wheel (ou)']]},
 {id:'u2',name:'dessus / dessous',note:'「上」と「下」が u / ou だけで逆の意味に。',noteEn:'"on top" vs "underneath": only u / ou differs.',items:[['dessus','ドゥスュ','duh-SÜ','上に（u）','on top (u)'],['dessous','ドゥスー','duh-SOO','下に（ou）','underneath (ou)'],['vu','ヴュ','vü','見た（u）','seen (u)'],['vous','ヴ','voo','あなた（ou）','you (ou)']]},
 {id:'nas',name:'鼻母音 an / on / in',note:'an＝口を大きく「アン」、on＝唇を丸めて「オン」、in＝口を横に「アン」。',noteEn:'an = open "ahn", on = rounded "ohn", in = spread "an".',items:[['vent','ヴァン（大きく）','vahn','風（an）','wind (an)'],['vont','ヴォン','vohn','（彼らが）行く（on）','(they) go (on)'],['vin','ヴァン（横に）','van','ワイン（in）','wine (in)']]},
 {id:'or',name:'口母音 / 鼻母音',note:'鼻から息が抜けるかどうか。beau と bon で意味が変わる。',noteEn:'Does air go through the nose? beau vs bon.',items:[['beau','ボ','boh','美しい（口）','beautiful (oral)'],['bon','ボン','bohn','良い（鼻）','good (nasal)'],['sa','サ','sa','彼の・彼女の（口）','his / her (oral)'],['sans','サン','sahn','〜なしで（鼻）','without (nasal)']]},
 {id:'le',name:'le / la / les',note:'単数か複数かは、冠詞の音でしか分からないことが多い。',noteEn:'Often the article is the only clue to singular vs plural.',items:[['le','ル','luh','その（男性単数）','the (masc. sing.)'],['la','ラ','la','その（女性単数）','the (fem. sing.)'],['les','レ','lay','その（複数）','the (plural)']]},
 {id:'un',name:'un / une',note:'un は鼻母音、une は「ユヌ」。名詞の性が分かる。',noteEn:'un is nasal, une ends in "n". Tells you the gender.',items:[['un','アン','uhn','1つの（男性）','a (masc.)'],['une','ユヌ','ün','1つの（女性）','a (fem.)']]},
 {id:'r',name:'r / l',note:'フランス語の r はのどの奥でこする音。日本人が最も混同しやすい。',noteEn:'French r is made at the back of the throat.',items:[['riz','リ（のど）','ree (throat r)','米（r）','rice (r)'],['lit','リ（舌）','lee','ベッド（l）','bed (l)'],['rire','リール','reer','笑う（r）','to laugh (r)'],['lire','リール（舌）','leer','読む（l）','to read (l)']]}
]};

// ===== 会話ミッション（タスクベース） =====
const SCEN={
ko:[
 {id:'cafe',icon:'☕',title:'カフェで注文する',role:'ソウルのカフェの店員',desc:'The learner orders a drink at a cafe in Seoul.',goals:['あいさつする','飲み物を注文する','値段を聞く','お礼を言う'],drill:['안녕하세요','이거 주세요','얼마예요?','카드 돼요?','감사합니다']},
 {id:'intro',icon:'🤝',title:'はじめての自己紹介',role:'語学交換で初めて会った韓国人の友達',desc:'First meeting with a Korean friend at a language exchange.',goals:['名前を言う','どこの国の人か言う','学生か仕事か言う','好きなものを1つ言う'],drill:['저는 민수예요','일본 사람이에요','학생이에요','만나서 반가워요','이름이 뭐예요?']},
 {id:'way',icon:'🗺️',title:'道をたずねる',role:'ソウルの通行人',desc:'The learner is lost and asks a passer-by for the subway station.',goals:['呼びかける','駅の場所を聞く','聞き返す・ゆっくり話してと頼む','お礼を言う'],drill:['저기요','지하철역이 어디예요?','천천히 말해 주세요','다시 한 번 말해 주세요','감사합니다']},
 {id:'weekend',icon:'📅',title:'週末の話をする',role:'韓国人の同僚',desc:'Small talk with a colleague on Monday about the weekend.',goals:['週末にしたことを言う','感想を言う','相手に質問を返す'],drill:['주말에 뭐 했어요?','친구를 만났어요','영화를 봤어요','재미있었어요']},
 {id:'food',icon:'🍜',title:'食堂で食事する',role:'韓国の食堂の店員',desc:'The learner eats at a Korean restaurant.',goals:['人数を言う','料理を注文する','好み（辛さなど）を伝える','会計する'],drill:['물 주세요','맛있어요','너무 매워요','배고파요','잘 먹었습니다']},
 {id:'drama',icon:'📺',title:'好きなドラマの話',role:'韓国ドラマ好きの韓国人の友達',desc:'Chatting with a Korean friend about K-dramas.',goals:['好きなドラマか俳優を言う','理由を言う','相手に質問する'],drill:['드라마를 봐요','좋아해요','재미있어요','진짜?','대박']}
],
fr:[
 {id:'cafe',icon:'☕',title:'カフェで注文する',titleEn:'Ordering at a café',role:'a waiter in a Paris café',desc:'The learner orders at a café in Paris.',goals:['あいさつする','飲み物を注文する','値段を聞く','お礼を言う'],goalsEn:['Greet','Order a drink','Ask the price','Say thank you'],drill:['Bonjour','Je voudrais un croissant','C\'est combien ?','L\'addition, s\'il vous plaît','Merci beaucoup']},
 {id:'intro',icon:'🤝',title:'はじめての自己紹介',titleEn:'Introducing yourself',role:'a French person you just met at a language exchange',desc:'First meeting at a language exchange.',goals:['名前を言う','どこの国の人か言う','好きなものを1つ言う','相手に質問する'],goalsEn:['Say your name','Say where you are from','Say one thing you like','Ask a question back'],drill:['Je m\'appelle Yuki','Je suis japonais','Enchanté','J\'aime','Ça va ?']},
 {id:'way',icon:'🗺️',title:'道をたずねる',titleEn:'Asking the way',role:'a passer-by in Paris',desc:'The learner asks a passer-by where the train station is.',goals:['呼びかける','駅の場所を聞く','聞き返す・ゆっくり話してと頼む','お礼を言う'],goalsEn:['Get attention politely','Ask where the station is','Ask to repeat / speak slowly','Say thank you'],drill:['Pardon','La gare, c\'est où ?','Vous pouvez répéter ?','À droite','Merci']},
 {id:'weekend',icon:'📅',title:'週末の話をする',titleEn:'Talking about the weekend',role:'a French colleague',desc:'Monday small talk about the weekend.',goals:['週末にしたことを言う','感想を言う','相手に質問を返す'],goalsEn:['Say what you did','Say how it was','Ask a question back'],drill:['Tu as fait quoi ce week-end ?','J\'ai vu un film','C\'était bien','Il fait beau']},
 {id:'food',icon:'🥐',title:'レストランで食事する',titleEn:'Eating at a restaurant',role:'a waiter in a French bistro',desc:'The learner eats at a bistro.',goals:['あいさつして人数を言う','料理を注文する','感想を言う','会計する'],goalsEn:['Greet and say how many people','Order a dish','Say how it tastes','Ask for the bill'],drill:['Bonsoir','Je voudrais un café','C\'est bon','L\'addition, s\'il vous plaît']},
 {id:'like',icon:'🎬',title:'好きなものの話',titleEn:'Talking about likes',role:'a French friend',desc:'Chatting with a French friend about films, food and hobbies.',goals:['好きなものを言う','嫌いなものを言う','理由を言う'],goalsEn:['Say what you like','Say what you don\'t like','Give a reason'],drill:['J\'aime','Je n\'aime pas','J\'adore','C\'est joli']}
]};

// ===== 1分スピーチのテーマ =====
const TOPICS={
 ko:['自己紹介','好きな食べ物','昨日したこと','週末の予定','好きなドラマ・映画','家族','今日の天気と気分'],
 fr:['自己紹介 / Introduce yourself','好きな食べ物 / Food you like','昨日したこと / What you did yesterday','週末の予定 / Weekend plans','好きな映画 / A film you like','家族 / Your family','今日の天気と気分 / Today\'s weather and mood']
};
const STORY_TOPICS={
 ko:['カフェで','週末','友達と会う','雨の日','ソウル旅行','家族','好きな食べ物'],
 fr:['Au café','Le week-end','Une amie','Un jour de pluie','À Paris','La famille','Au marché']
};

// ===== 研究の根拠 =====
const SCIENCE=[
 ['📖','長文を読みながら、和訳つきで語彙を覚える','読みながら語句の意味をすぐ確認できる（注釈つきの）読解は、注釈なしより多くの単語を覚えられます。メタ分析では直後テストで45.3%対26.6%でした（Yanagisawa, Webb & Uchihara 2020）。注釈は母語（日本語）のほうが効果が大きいという分析もあります（Kim, Lee & Lee 2024、g=.33）。','英語コースでは、長文の語句をタップすると日本語の意味が出て、そのまま復習に追加できます。追加した語句は「読む・聞く → 書く → 言う」の順で復習に出ます。'],
 ['🌱','ゼロからの人には「手引きつき」→ 少しずつ外す','知識がまだない段階では、手順を細かく示した練習のほうがよく学べます。逆に、慣れてきた人には同じ手引きが邪魔になります（熟達化反転効果：Kalyuga 2007 ほか）。手引きは上達に合わせて減らしていくのが効果的です。','最初は部品を選ぶだけの「文字タイル」で書き、覚えてきたらキーボードに変わります。読み仮名も練習メニューも、進み具合に合わせて段階的に変わります。'],
 ['✍️','文字は「手で書く」と早く身につく','大人42人が新しい文字（アラビア文字）を学んだ実験では、手で書いて練習した人は、タイピングや見るだけの人より早く覚え、習っていない「単語を読む・つづる」にも強くなりました（Wiley & Rapp 2021）。','ハングルの各ステップに、指でなぞる練習と、何も見ずに書く練習を入れています。紙に書くのもおすすめです。'],
 ['📚','読む・聞く・書く・話すをバランスよく','よく設計された語学コースは、「意味を理解する入力」「伝えるための出力」「ことばそのものの学習」「流暢さの練習」の4つにほぼ同じ時間を配ります（Nation 2007「4つの柱」）。聞くだけに偏ると、書けない・読めないが残ります。','1つの言葉に「読む・聞く・書く・言う」の4枚のカードを作り、日をずらして出します。'],
 ['🔤','カタカナ読みは早めに卒業','文字と音の関係の研究では、母語の文字の読み方と外国語の音が食い違うとき、文字が発音や単語の習得を妨げることがあります（Hayes-Harb & Barrios 2021 のレビュー）。カタカナでは ㅓ と ㅗ がどちらも「オ」になり、区別が消えてしまいます。','読み仮名はハングルのステージの間だけ表示し、その後はタップしたときだけ出ます。音は🔊で確かめます。'],
 ['🀄','日本語と似た言葉から始める','母語と形が似た言葉（同根語）は、形を思い出しやすいことが日本人学習者でも確かめられています（Rogers, Webb & Nakata 2015）。韓国語には「約束＝약속」のような漢字語がたくさんあります。','ハングルのステップの単語と「新しい言葉」の最初は、日本語と音が似た漢字語・外来語です。'],
 ['📖','ルールははっきり説明する','文法などを明示的に教える指導は、気づくのを待つ指導より効果が大きいというメタ分析があります（Norris & Ortega 2000：明示的 d=1.13、暗示的 d=0.54）。','文字の仕組み（線を足すと激音、2つ並べると濃音）や文の分解を、日本語と比べて説明します。'],
 ['💡','連想で文字を覚える（効果は人による）','形と音を結びつける連想は外国語の文字の学習によく使われ、ハングルの授業でも研究されています。ただし、ひらがなでの実験では効果がはっきりしない結果もあります（Matsunaga 2003 ほか）。','各文字に覚え方のヒントを付けていますが、合わなければ無視して大丈夫です。'],

 ['🔁','思い出す練習 × 間隔をあける','読み返すより「思い出そうとする」ほうが記憶に残ります（Adesope ほか 2017 のメタ分析）。さらに、思い出す練習を間隔をあけて行うと、続けて行うより大きな効果があります（Latimier ほか 2021、g=0.74）。','復習は FSRS（Ye 2022）で組みます。FSRS は Anki にも採用された記憶モデルで、公開ベンチマークでは従来の SM-2 より想起の予測が正確です。「次に忘れそうなタイミング」で出題します。'],
 ['🗣','「言える」と「わかる」は別の記憶','聞いて意味がわかる練習だけでは、自分から言えるようにはなりにくいことが分かっています。意味から外国語を思い出す「産出方向」の練習が必要です（Nakata, Webb ほか）。','1つのフレーズに「聞く」カードと「言う」カードの2枚を作ります。言うカードは、意味を見て声に出してから答えを確かめます。'],
 ['🤔','先に当てると覚えやすい','答えを見る前に推測すると、外れても、その後で正解を見たときの記憶が強くなります（Kornell, Hays & Bjork 2009 / Richland ほか 2009）。ただし、手がかりのない言葉では効果が出にくいことも報告されています。','日本語と音が似た言葉など、手がかりのある新しい言葉だけ、まず意味を当ててから学びます。'],
 ['👂','聞き分け訓練（HVPT）','いろいろな話者の声で、紛らわしい音を聞き分け、1問ごとに正誤を確かめる訓練は、第二言語の音声知覚の訓練で最も実証の多い方法です（Uchihara, Karas & Thomson 2025 のメタ分析は79研究）。聞き取りの改善は発音にも一部つながります。','「耳トレ」で、韓国語の平音・激音・濃音や、フランス語の u/ou・鼻母音を、声・速さ・高さを変えながら聞き分けます（使える声の数は端末によります）。'],
 ['🤖','AIとの会話練習','対話システムを使った練習は、話す力に中程度の効果があります（Hou & Min 2025 のメタ分析、g=0.61）。AIは不安を下げ、話そうとする気持ちを高めることも報告されています。','最初の文のステップを終えると「会話ミッション」が開きます。始めたばかりの間は、AIは短い一言だけで話し、言い方の候補を3つ出します。'],
 ['✍️','直し方：まずヒント、それから正解','言い間違いへのフィードバックは効果があり、答えを言い直して見せる（リキャスト）より、自分で直すよう促すヒント（プロンプト）のほうが効果が大きいことが分かっています（Lyster & Saito 2010）。','AI会話で間違えると、まずヒントだけが出ます。自分で言い直してみて、それでも難しければ正解を見ます。'],
 ['⏱','くり返して時間を縮める（4/3/2）','同じ話を、時間を短くしながら3回くり返すと流暢さが上がります（Nation 1989、Tran & Saito 2021）。回の合間にフィードバックをもらうと、正確さも上がりました。','「1分スピーチ」で 60秒→45秒→30秒 の3回話します。回の合間にAIの見本と直しを見られます。'],
 ['🧩','フレーズのまま覚える','決まった言い回し（チャンク）を多く持っている学習者は、流暢に聞こえると評価されます（Boers ほか 2006）。学習者はチャンクをかたまりで処理し、速く正確に扱えることも示されています。','単語だけでなく、よく使う文をまるごと覚えて、まるごと言う練習をします。'],
 ['🎧','シャドーイング','聞いてすぐ真似する練習は、伝わりやすさ・流暢さ・抑揚の改善に役立つという報告があります。ただし、個々の音の正確さへの効果ははっきりしていません（Whitworth 2024 のシステマティックレビュー）。','抑揚やリズムはシャドーイングで、個々の音は耳トレで、と役割を分けています。'],
 ['📌','「いつやるか」を決める','「もし〇〇したら、△△する」と具体的に決めておくと、目標を達成しやすくなります（Gollwitzer & Sheeran 2006 のメタ分析、94件の検証で d=0.65）。','ホームで「もし〜したら、〜する」というプランを決められます。'],
 ['⚠️','アプリだけでは話せるようにならない','アプリ学習の研究では、文法や単語は伸びても、話す力の伸びは限られていました（Loewen ほか 2019, 2020）。','このアプリは「話す」時間を必ずメニューに入れています。週に1回でも、オンライン家庭教師や語学交換で人と話すことを強くおすすめします。']
];
