// 高頻度単語デッキ（語|読み|意味）
const DECKTXT={ko:`
사람|サラム|人
친구|チング|友達
가족|カジョク|家族
엄마|オンマ|ママ・お母さん
아빠|アッパ|パパ・お父さん
어머니|オモニ|母
아버지|アボジ|父
형|ヒョン|兄（男性から見て）
오빠|オッパ|兄（女性から見て）
누나|ヌナ|姉（男性から見て）
언니|オンニ|姉（女性から見て）
동생|トンセン|弟・妹
남자|ナムジャ|男
여자|ヨジャ|女
아이|アイ|子ども
선생님|ソンセンニム|先生
남편|ナムピョン|夫
아내|アネ|妻
손님|ソンニム|お客さん
회사원|フェサウォン|会社員
나|ナ|僕・私（くだけた言い方）
너|ノ|君・お前
우리|ウリ|私たち
그|ク|その・彼
이것|イゴッ|これ
그것|クゴッ|それ
저것|チョゴッ|あれ
여기|ヨギ|ここ
거기|コギ|そこ
저기|チョギ|あそこ
다|タ|全部
모두|モドゥ|みんな
집|チプ|家
학교|ハッキョ|学校
회사|フェサ|会社
가게|カゲ|店
식당|シクタン|食堂
카페|カペ|カフェ
병원|ピョンウォン|病院
은행|ウネン|銀行
역|ヨク|駅
공항|コンハン|空港
호텔|ホテル|ホテル
방|パン|部屋
길|キル|道
나라|ナラ|国
시장|シジャン|市場
편의점|ピョニジョム|コンビニ
공원|コンウォン|公園
바다|パダ|海
산|サン|山
일본|イルボン|日本
미국|ミグク|アメリカ
중국|チュングク|中国
한국어|ハングゴ|韓国語
일본어|イルボノ|日本語
영어|ヨンオ|英語
시간|シガン|時間
날|ナル|日
주|チュ|週
달|タル|月（ひと月）
년|ニョン|年
주말|チュマル|週末
점심|チョムシム|昼・昼ごはん
밤|パム|夜
매일|メイル|毎日
항상|ハンサン|いつも
자주|チャジュ|よく・しょっちゅう
가끔|カックム|ときどき
아직|アジク|まだ
벌써|ポルソ|もう（早くも）
나중에|ナジュンエ|後で
먼저|モンジョ|先に
곧|コッ|すぐに
요즘|ヨジュム|最近
올해|オレ|今年
작년|チャンニョン|去年
내년|ネニョン|来年
오전|オジョン|午前
오후|オフ|午後
분|プン|〜分
월요일|ウォリョイル|月曜日
금요일|クミョイル|金曜日
일요일|イリョイル|日曜日
밥|パプ|ご飯
술|スル|お酒
맥주|メクチュ|ビール
소주|ソジュ|焼酎
고기|コギ|肉
생선|センソン|魚（食べ物）
야채|ヤチェ|野菜
과일|クァイル|果物
사과|サグァ|りんご・謝罪
빵|ッパン|パン
차|チャ|お茶・車
음식|ウムシク|食べ物・料理
국|クク|スープ
떡볶이|トッポッキ|トッポッキ
치킨|チキン|フライドチキン
책|チェク|本
전화|チョナ|電話
핸드폰|ヘンドゥポン|携帯電話
컴퓨터|コムピュト|パソコン
돈|トン|お金
옷|オッ|服
신발|シンバル|靴
가방|カバン|かばん
문|ムン|ドア
버스|ポス|バス
지하철|チハチョル|地下鉄
택시|テクシ|タクシー
비행기|ピヘンギ|飛行機
표|ピョ|切符・チケット
사진|サジン|写真
노래|ノレ|歌
영화|ヨンファ|映画
드라마|トゥラマ|ドラマ
선물|ソンムル|プレゼント
문제|ムンジェ|問題
이야기|イヤギ|話
말|マル|言葉・話
생각|センガク|考え
마음|マウム|心・気持ち
기분|キブン|気分
꿈|ックム|夢
날씨|ナルシ|天気
비|ピ|雨
눈|ヌン|目・雪
손|ソン|手
발|パル|足
머리|モリ|頭・髪
얼굴|オルグル|顔
몸|モム|体
이름|イルム|名前
만나요|マンナヨ|会います
살아요|サラヨ|住んでいます・生きています
사요|サヨ|買います
팔아요|パラヨ|売ります
줘요|チュォヨ|あげます・くれます
받아요|パダヨ|もらいます
읽어요|イルゴヨ|読みます
써요|ッソヨ|書きます・使います
들어요|トゥロヨ|聞きます
말해요|マレヨ|話します・言います
배워요|ペウォヨ|学びます
가르쳐요|カルチョヨ|教えます
기다려요|キダリョヨ|待ちます
앉아요|アンジャヨ|座ります
일어나요|イロナヨ|起きます
입어요|イボヨ|着ます
열어요|ヨロヨ|開けます
닫아요|タダヨ|閉めます
시작해요|シジャケヨ|始めます
끝나요|ックンナヨ|終わります
놀아요|ノラヨ|遊びます
웃어요|ウソヨ|笑います
울어요|ウロヨ|泣きます
걸어요|コロヨ|歩きます
타요|タヨ|乗ります
내려요|ネリョヨ|降ります
찾아요|チャジャヨ|探します
만들어요|マンドゥロヨ|作ります
청소해요|チョンソヘヨ|掃除します
운동해요|ウンドンヘヨ|運動します
전화해요|チョナヘヨ|電話します
생각해요|センガケヨ|思います・考えます
필요해요|ピリョヘヨ|必要です
도와줘요|トワジュォヨ|手伝います
믿어요|ミドヨ|信じます
기억해요|キオケヨ|覚えています
결혼해요|キョロネヨ|結婚します
여행해요|ヨヘンヘヨ|旅行します
쉬어요|シュィオヨ|休みます
바빠요|パッパヨ|忙しいです
아파요|アパヨ|痛いです・具合が悪いです
커요|コヨ|大きいです
작아요|チャガヨ|小さいです
많아요|マナヨ|多いです
적어요|チョゴヨ|少ないです
싸요|ッサヨ|安いです
비싸요|ピッサヨ|高いです（値段）
나빠요|ナッパヨ|悪いです
예뻐요|イェッポヨ|きれいです
멋있어요|モシッソヨ|かっこいいです
귀여워요|クィヨウォヨ|かわいいです
재미있어요|チェミイッソヨ|おもしろいです
재미없어요|チェミオプソヨ|つまらないです
어려워요|オリョウォヨ|難しいです
쉬워요|シュィウォヨ|簡単です
더워요|トウォヨ|暑いです
추워요|チュウォヨ|寒いです
따뜻해요|ッタットゥテヨ|暖かいです
시원해요|シウォネヨ|涼しいです・すっきりします
빨라요|ッパルラヨ|速いです
느려요|ヌリョヨ|遅いです
멀어요|モロヨ|遠いです
가까워요|カッカウォヨ|近いです
길어요|キロヨ|長いです
짧아요|ッチャルバヨ|短いです
행복해요|ヘンボケヨ|幸せです
슬퍼요|スルポヨ|悲しいです
기뻐요|キッポヨ|うれしいです
무서워요|ムソウォヨ|怖いです
졸려요|チョルリョヨ|眠いです
배불러요|ペブルロヨ|お腹いっぱいです
매워요|メウォヨ|辛いです
달아요|タラヨ|甘いです
짜요|ッチャヨ|しょっぱいです
조용해요|チョヨンヘヨ|静かです
같아요|カタヨ|同じです・〜みたいです
달라요|タルラヨ|違います（異なる）
중요해요|チュンヨヘヨ|大切です
유명해요|ユミョンヘヨ|有名です
친절해요|チンジョレヨ|親切です
정말|チョンマル|本当に
아주|アジュ|とても
너무|ノム|〜すぎる・とても
많이|マニ|たくさん
조금|チョグム|少し
더|ト|もっと
제일|チェイル|一番
같이|カチ|一緒に
혼자|ホンジャ|一人で
다시|タシ|もう一度・再び
또|ット|また
빨리|ッパルリ|早く
천천히|チョンチョニ|ゆっくり
잘|チャル|よく・上手に
못|モッ|〜できない
안|アン|〜しない
그리고|クリゴ|そして
그런데|クロンデ|ところで・でも
그래서|クレソ|だから
하지만|ハジマン|しかし
그럼|クロム|じゃあ
아마|アマ|たぶん
꼭|ッコク|必ず
혹시|ホクシ|もしかして
아까|アッカ|さっき
이제|イジェ|もう・これから
그냥|クニャン|ただ・なんとなく
별로|ピョルロ|あまり（〜ない）
전혀|チョニョ|全然（〜ない）
얼마나|オルマナ|どのくらい
어느|オヌ|どの
어떤|オットン|どんな
여보세요|ヨボセヨ|もしもし
잠시만요|チャムシマンニョ|少々お待ちください
어서 오세요|オソ オセヨ|いらっしゃいませ
맞아요|マジャヨ|そうです・合っています
아니에요|アニエヨ|違います・どういたしまして
그래요?|クレヨ|そうなんですか？
알겠습니다|アルゲッスムニダ|かしこまりました
알았어|アラッソ|わかった
저기요|チョギヨ|すみません（呼びかけ）
조심하세요|チョシマセヨ|気をつけてください
잘 자요|チャル ジャヨ|おやすみなさい
또 봐요|ット ブァヨ|また会いましょう
대단해요|テダネヨ|すごいです
그렇구나|クロックナ|なるほど・そうなんだ
아이고|アイゴ|あらまあ・やれやれ
설마|ソルマ|まさか
제발|チェバル|お願いだから
물론이죠|ムルロニジョ|もちろんです
모르겠어요|モルゲッソヨ|わかりません
개|ケ|〜個
명|ミョン|〜人（人数）
번|ポン|〜回・〜番
살|サル|〜歳
원|ウォン|ウォン（お金の単位）
백|ペク|百
천|チョン|千
만|マン|万
`,fr:`
homme|オム|男性・人間
femme|ファム|女性・妻
ami|アミ|友達（男性）
amie|アミ|友達（女性）
famille|ファミーユ|家族
mère|メール|母
père|ペール|父
frère|フレール|兄弟
sœur|スール|姉妹
fils|フィス|息子
mari|マリ|夫
monsieur|ムッスィユ|〜さん（男性）
madame|マダム|〜さん（女性）
gens|ジャン|人々
professeur|プロフェスール|先生
médecin|メドゥサン|医者
bébé|ベベ|赤ちゃん
il|イル|彼は
elle|エル|彼女は
nous|ヌ|私たちは
ils|イル|彼らは
ça|サ|それ
tout|トゥ|すべて
rien|リヤン|何も（〜ない）
quelqu'un|ケルカン|誰か
quelque chose|ケルク ショーズ|何か
ville|ヴィル|町
pays|ペイ|国
rue|リュ|通り
gare|ガール|駅
école|エコール|学校
bureau|ビュロー|事務所・机
magasin|マガザン|店
boulangerie|ブランジュリ|パン屋
marché|マルシェ|市場
hôpital|オピタル|病院
banque|バンク|銀行
aéroport|アエロポール|空港
chambre|シャンブル|寝室・部屋
cuisine|キュイズィーヌ|台所・料理
mer|メール|海
montagne|モンターニュ|山
parc|パルク|公園
France|フランス|フランス
Japon|ジャポン|日本
Corée|コレ|韓国
musée|ミュゼ|美術館・博物館
jour|ジュール|日
semaine|スメーヌ|週
mois|モワ|月（ひと月）
année|アネ|年・1年間
heure|ウール|時間・〜時
minute|ミニュット|分
midi|ミディ|正午
nuit|ニュイ|夜
toujours|トゥジュール|いつも
souvent|スヴァン|よく・しばしば
parfois|パルフォワ|ときどき
jamais|ジャメ|決して（〜ない）
déjà|デジャ|もう・すでに
encore|アンコール|まだ・また
bientôt|ビヤント|もうすぐ
tard|タール|遅く
tôt|ト|早く
avant|アヴァン|前に
après|アプレ|後で
lundi|ランディ|月曜日
vendredi|ヴァンドルディ|金曜日
dimanche|ディマンシュ|日曜日
pain|パン|パン
vin|ヴァン|ワイン
bière|ビエール|ビール
thé|テ|紅茶・お茶
viande|ヴィアンド|肉
poisson|ポワソン|魚
fromage|フロマージュ|チーズ
légumes|レギューム|野菜
fruit|フリュイ|果物
pomme|ポム|りんご
gâteau|ガトー|ケーキ
petit-déjeuner|プティ デジュネ|朝食
déjeuner|デジュネ|昼食
dîner|ディネ|夕食
repas|ルパ|食事
téléphone|テレフォヌ|電話
portable|ポルターブル|携帯電話
ordinateur|オルディナトゥール|パソコン
argent|アルジャン|お金
voiture|ヴォワテュール|車
train|トラン|電車
métro|メトロ|地下鉄
bus|ビュス|バス
avion|アヴィオン|飛行機
billet|ビエ|切符・チケット
clé|クレ|鍵
sac|サック|かばん
vêtements|ヴェトマン|服
chaussures|ショスュール|靴
photo|フォト|写真
chanson|シャンソン|歌
film|フィルム|映画
cadeau|カド|プレゼント
travail|トラヴァイユ|仕事
problème|プロブレム|問題
idée|イデ|アイデア
chose|ショーズ|もの・こと
temps|タン|時間・天気
vie|ヴィ|人生・生活
amour|アムール|愛
cœur|クール|心臓・心
main|マン|手
tête|テット|頭
yeux|ズィユ|目（両目）
corps|コール|体
nom|ノン|名前
langue|ラング|言語・舌
mot|モ|単語
être|エートル|〜である
avoir|アヴォワール|持つ
aller|アレ|行く
faire|フェール|する・作る
venir|ヴニール|来る
voir|ヴォワール|見る・会う
savoir|サヴォワール|知っている
pouvoir|プヴォワール|〜できる
vouloir|ヴロワール|〜したい・欲しい
dire|ディール|言う
prendre|プランドル|取る・乗る・食べる
donner|ドネ|与える
acheter|アシュテ|買う
vendre|ヴァンドル|売る
boire|ボワール|飲む
dormir|ドルミール|眠る
partir|パルティール|出発する
arriver|アリヴェ|到着する
rester|レステ|とどまる
chercher|シェルシェ|探す
trouver|トルヴェ|見つける
penser|パンセ|考える・思う
croire|クロワール|信じる・思う
attendre|アタンドル|待つ
écouter|エクテ|聞く
entendre|アンタンドル|聞こえる
lire|リール|読む
écrire|エクリール|書く
apprendre|アプランドル|学ぶ
comprendre|コンプランドル|理解する
aider|エデ|手伝う
jouer|ジュエ|遊ぶ・演奏する
marcher|マルシェ|歩く
ouvrir|ウヴリール|開ける
fermer|フェルメ|閉める
commencer|コマンセ|始める
finir|フィニール|終える
habiter|アビテ|住む
payer|ペイエ|払う
oublier|ウブリエ|忘れる
demander|ドゥマンデ|頼む・尋ねる
répondre|レポンドル|答える
rentrer|ラントレ|帰る
sortir|ソルティール|出かける
voyager|ヴォワイヤジェ|旅行する
il faut|イル フォ|〜しなければならない
je veux|ジュ ヴ|私は〜したい
je peux|ジュ プ|私は〜できる
je sais|ジュ セ|私は知っている
je dois|ジュ ドワ|私は〜しなければ
il y a|イリヤ|〜がある・〜前に
c'est|セ|それは〜だ
grand|グラン|大きい
petit|プティ|小さい
nouveau|ヌーヴォー|新しい
vieux|ヴィユ|古い・年老いた
jeune|ジュヌ|若い
beau|ボ|美しい・（天気が）良い
mauvais|モヴェ|悪い・まずい
facile|ファスィル|簡単な
difficile|ディフィスィル|難しい
chaud|ショー|暑い・熱い
froid|フロワ|寒い・冷たい
cher|シェール|（値段が）高い・親愛なる
heureux|ウルー|幸せな
triste|トリスト|悲しい
fatigué|ファティゲ|疲れた
content|コンタン|満足した・うれしい
gentil|ジャンティ|優しい
long|ロン|長い
court|クール|短い
même|メム|同じ
autre|オートル|ほかの
premier|プルミエ|最初の
dernier|デルニエ|最後の
prêt|プレ|準備ができた
libre|リーブル|自由な・空いている
malade|マラード|病気の
délicieux|デリスィユ|とてもおいしい
très|トレ|とても
trop|トロ|〜すぎる
un peu|アン プ|少し
beaucoup|ボク|たくさん・とても
bien|ビヤン|よく・上手に
mal|マル|悪く・下手に
ici|イスィ|ここ
là|ラ|そこ
aussi|オスィ|〜も
mais|メ|しかし
et|エ|そして
ou|ウ|または
donc|ドンク|だから
parce que|パルス ク|なぜなら
si|スィ|もし・とても
avec|アヴェック|〜と一緒に
sans|サン|〜なしで
pour|プール|〜のために
dans|ダン|〜の中に
sur|スュール|〜の上に
chez|シェ|〜の家で
peut-être|プテートル|たぶん
vraiment|ヴレマン|本当に
alors|アロール|それで・じゃあ
enfin|アンファン|ついに・まあ
seulement|スルマン|〜だけ
presque|プレスク|ほとんど
Allô ?|アロー|もしもし
Excusez-moi|エクスキュゼ ムワ|すみません
De rien|ドゥ リヤン|どういたしまして
Bienvenue|ビヤンヴニュ|ようこそ
Bonne nuit|ボヌ ニュイ|おやすみ
À demain|ア ドゥマン|また明日
Voilà|ヴォワラ|はい、どうぞ・ほら
Pas du tout|パ デュ トゥ|全然
Je suis désolé|ジュ スュイ デゾレ|申し訳ありません
Exactement|エグザクトマン|その通り
Super|スュペール|すごい・最高
Génial|ジェニアル|すばらしい
Oh là là|オ ラ ラ|あらら・なんてこと
Ça marche|サ マルシュ|了解・OK
Tu as raison|テュ ア レゾン|君の言う通り
J'ai compris|ジェ コンプリ|わかった
Volontiers|ヴォロンティエ|喜んで
quarante|カラント|40
soixante|ソワサント|60
soixante-dix|ソワサント ディス|70
quatre-vingts|キャトル ヴァン|80
quatre-vingt-dix|キャトル ヴァン ディス|90
mille|ミル|1000
euro|ウーロ|ユーロ
`};
const PLAN={
 ko:{banner:'<b>今日から始める人のためのコース</b><br>最初の1週間はハングル（文字）だけ。1日20〜30分、1〜2ステップずつで大丈夫です。読む・書く・聞く・話すを少しずつ全部やります。',
   listen:10,min:{rev:5,new:8,lesson:15,listen:10,shadow:5,talk:10,story:10}},
 fr:{banner:'<b>フランス語は2ヶ月目からがおすすめ</b><br>今やるなら1日15〜20分にとどめ、韓国語に時間を回しましょう。フランス語は英語と単語が近いので、説明は英語がおすすめです（下で切り替え可）。',
   listen:10,min:{rev:5,new:5,lesson:10,listen:10,shadow:5,talk:10,story:5}}
};
const RES={
 ko:[['Talk To Me In Korean（初心者向けの定番教材・音声）','https://talktomeinkorean.com/'],
     ['YouTube：韓国語 初心者 リスニング','https://www.youtube.com/results?search_query=%E9%9F%93%E5%9B%BD%E8%AA%9E+%E5%88%9D%E5%BF%83%E8%80%85+%E3%83%AA%E3%82%B9%E3%83%8B%E3%83%B3%E3%82%B0'],
     ['YouTube：Easy Korean（街頭インタビュー・字幕付き）','https://www.youtube.com/results?search_query=Easy+Korean+street+interview'],
     ['YouTube：Korean comprehensible input beginner','https://www.youtube.com/results?search_query=korean+comprehensible+input+beginner']],
 fr:[['YouTube：Easy French（街頭インタビュー・字幕付き）','https://www.youtube.com/results?search_query=Easy+French+street+interview'],
     ['YouTube：Coffee Break French（初心者向けポッドキャスト）','https://www.youtube.com/results?search_query=Coffee+Break+French+lesson+1'],
     ['YouTube：フランス語 初心者 リスニング','https://www.youtube.com/results?search_query=%E3%83%95%E3%83%A9%E3%83%B3%E3%82%B9%E8%AA%9E+%E5%88%9D%E5%BF%83%E8%80%85+%E3%83%AA%E3%82%B9%E3%83%8B%E3%83%B3%E3%82%B0'],
     ['YouTube：French comprehensible input beginner','https://www.youtube.com/results?search_query=french+comprehensible+input+beginner']]
};
const DATA={};
for(const k in RAW){
  const L=RAW[k];
  const kindOf=(t,m)=>/^[0-9]+$/.test(m)?'num':/[ ?]/.test(t.trim())?'sent':'word';
  const parse=(txt,n)=>txt.trim().split('\n').filter(Boolean).map(l=>{const p=l.split('|');return {t:p[0],r:p[1],m:p[2],n,kind:kindOf(p[0],p[2]),x:EX[k][p[0].trim()]}});
  const len=L.days.length;let prevRv=0;
  const days=L.days.map((d,i)=>{
    const n=i+1;
    if(d&&d.letters){
      const chars=d.letters.filter(l=>l[1]).map(l=>({t:l[1],r:l[2],m:l[3],n,kind:'char',j:l[0]}));
      return {n,title:d.title,tip:d.tip,hunit:true,letters:d.letters,syl:d.syl?d.syl.split(' '):[],chars,words:parse(d.words,n),items:[...chars,...parse(d.words,n)]};
    }
    if(d) return {n,title:d[0],tip:d[1],items:parse(d[2],n)};
    if(n===len) return {n,title:'最終テスト',review:'final',tip:'全体から20問。聞く・読む・書くをまとめて確かめよう。'};
    if(n===len-1) return {n,title:'総復習',review:'all',tip:'ここまでの全部をまとめて復習。'};
    const from=prevRv+1;prevRv=n;
    return {n,title:'復習テスト',review:'rv',from,tip:'このステージの内容から出題。聞く・読む・書くをまぜて確かめます。'};
  });
  days.forEach(d=>{if(d.hunit){d.items=[...d.chars,...d.words]}});
  const seenL=new Set();const lessonItems=[];
  days.filter(x=>x.items).forEach(x=>x.items.forEach(it=>{if(!seenL.has(it.t)){seenL.add(it.t);lessonItems.push(it)}}));
  const seen=new Set(lessonItems.map(x=>x.t));
  const deck=[];
  ((k==='ko'?KO_COG+'\n':'')+DECKTXT[k].trim()).split('\n').forEach(l=>{const p=l.split('|');if(p.length<3||seen.has(p[0]))return;seen.add(p[0]);
    deck.push({t:p[0],r:p[1],m:p[2],n:100+Math.floor(deck.length/10),kind:kindOf(p[0],p[2]),deck:1})});
  const all=[...lessonItems,...deck];
  const byT={};all.forEach(x=>{if(!byT[x.t])byT[x.t]=x});
  // レッスン内の重複は最初の項目に統一する
  days.forEach(d=>{if(d.items)d.items=d.items.map(it=>byT[it.t]);if(d.words)d.words=d.words.map(it=>byT[it.t]);if(d.chars)d.chars=d.chars.map(it=>byT[it.t])});
  DATA[k]={...L,days,deck,all,byT};
}
