// ===================== 英語コース（レベル1〜10）データ =====================
// 文章・問題はすべてこのアプリ用の書き下ろしです（教科書・TOEIC公式問題の転載ではありません）
const EL=[null,
 {name:'中学1年',guide:'英検5級',rate:.8,ai:'CEFR pre-A1/A1. Japanese junior-high 1st year: be-verbs, present simple, can. About 600 basic headwords. Sentences of 4-8 words.',len:45},
 {name:'中学2年',guide:'英検4級',rate:.8,ai:'CEFR A1. Japanese junior-high 2nd year: past tense, future, comparatives, to-infinitives, must/have to. Sentences of 6-10 words.',len:65},
 {name:'中学3年',guide:'英検3級・TOEIC 〜300',rate:.85,ai:'CEFR A2. Japanese junior-high 3rd year: present perfect, passive, relative clauses. About 1,800 headwords.',len:85},
 {name:'高校1年',guide:'英検準2級・TOEIC 400',rate:.9,ai:'CEFR A2+/B1. Japanese high-school 1st year plus easy TOEIC notices and emails. About 2,500 headwords.',len:105},
 {name:'高校2年',guide:'TOEIC 500',rate:.9,ai:'CEFR B1. High-school 2nd year; TOEIC 500: everyday business emails, announcements. About 3,500 headwords.',len:125},
 {name:'高校3年・大学入試',guide:'英検2級・TOEIC 600',rate:.95,ai:'CEFR B1+/B2. University entrance exam level; TOEIC 600: memos, articles with some abstract vocabulary. About 4,500 headwords.',len:145},
 {name:'TOEIC 700',guide:'英検準1級手前',rate:1,ai:'CEFR B2. TOEIC 700: business articles, formal letters, policy notices; natural idiomatic phrasing.',len:165},
 {name:'TOEIC 800',guide:'英検準1級',rate:1,ai:'CEFR B2+/C1. TOEIC 800+: press releases, reports with dense information, inference required.',len:185},
 {name:'TOEIC 900',guide:'英検1級手前',rate:1.05,ai:'CEFR C1. TOEIC 900+: sophisticated business and economic commentary, nuanced argument, low-frequency vocabulary.',len:205},
 {name:'最上級',guide:'TOEIC 990超・英検1級・英字誌の論説',rate:1.1,ai:'CEFR C2. Far beyond TOEIC 990: the register of The Economist or academic essays; rare vocabulary, irony, complex syntax, abstract reasoning.',len:240}
];
// 長文：@レベル|題|種類 ／ 英文 || 和訳 ／ #語句|意味 ／ ?質問|A|B|C|D|正解番号
const EN_READ=`
@1|My Friend Ken|教科書スタイル
This is my friend Ken. || こちらは私の友達のケンです。
He is thirteen years old. || 彼は13歳です。
He likes soccer very much. || 彼はサッカーが大好きです。
He plays soccer after school every day. || 彼は毎日、放課後にサッカーをします。
On Sundays, he helps his mother in the kitchen. || 日曜日には、台所でお母さんを手伝います。
I like Ken because he is kind to everyone. || ケンはみんなに親切なので、私は彼が好きです。
#friend|友達
#after school|放課後
#every day|毎日
#help|手伝う
#kitchen|台所
#because|〜なので
#kind|親切な
#everyone|みんな
?What does Ken do after school?|He plays soccer.|He helps his mother.|He studies English.|He cooks dinner.|0
?When does Ken help his mother?|Every day|After school|On Sundays|On Mondays|2
@1|My Morning|教科書スタイル
I get up at six thirty every morning. || 私は毎朝6時半に起きます。
I wash my face and eat breakfast. || 顔を洗って、朝ごはんを食べます。
I usually have rice and miso soup. || たいていご飯とみそ汁を食べます。
I leave home at seven forty. || 7時40分に家を出ます。
I walk to school with my sister. || 姉（妹）と一緒に歩いて学校へ行きます。
Our school is near the station. || 私たちの学校は駅の近くにあります。
We have six classes today. || 今日は授業が6時間あります。
#get up|起きる
#wash|洗う
#breakfast|朝食
#usually|たいてい
#leave|出発する・去る
#walk|歩く
#near|〜の近くに
#station|駅
?What time does the writer leave home?|At 6:30|At 7:00|At 7:40|At 8:00|2
?How does the writer go to school?|By bus|By bike|By train|On foot|3
@2|A Trip to Kyoto|教科書スタイル
Last summer, I went to Kyoto with my family. || 去年の夏、私は家族と京都へ行きました。
We stayed there for three days. || 私たちはそこに3日間滞在しました。
On the first day, we visited an old temple. || 1日目に、古いお寺を訪れました。
The garden was more beautiful than I expected. || 庭は私が思っていたよりも美しかったです。
My brother took a lot of pictures. || 兄（弟）は写真をたくさん撮りました。
In the evening, we ate tofu at a small restaurant. || 夕方には、小さなレストランで豆腐を食べました。
It was the best dinner of the trip. || それは旅行でいちばんおいしい夕食でした。
I want to visit Kyoto again in autumn. || 秋にもう一度京都を訪れたいです。
#stay|滞在する
#visit|訪れる
#temple|寺
#garden|庭
#expect|予想する・期待する
#take a picture|写真を撮る
#evening|夕方
#again|もう一度
#autumn|秋
?How long did the family stay in Kyoto?|One day|Two days|Three days|A week|2
?What did the writer think of the garden?|It was too small.|It was more beautiful than expected.|It was crowded.|It was closed.|1
@2|My Dream|教科書スタイル
I want to be a chef in the future. || 私は将来、料理人になりたいです。
My grandfather had a small restaurant when I was a child. || 私が子どものころ、祖父は小さなレストランを持っていました。
I often watched him in the kitchen. || 私はよく台所で祖父を見ていました。
He always said, "Good food makes people happy." || 祖父はいつも「おいしい料理は人を幸せにする」と言っていました。
Now I cook dinner for my family every Saturday. || 今、私は毎週土曜日に家族のために夕食を作っています。
Cooking is harder than studying, but it is more fun. || 料理は勉強より大変ですが、もっと楽しいです。
I have to practice a lot to become a good chef. || よい料理人になるために、たくさん練習しなければなりません。
I will study cooking in France someday. || いつかフランスで料理を学ぶつもりです。
#chef|料理人・シェフ
#future|将来
#grandfather|祖父
#often|よく・しばしば
#always|いつも
#cook|料理する
#practice|練習する
#become|〜になる
#someday|いつか
?Why does the writer want to be a chef?|Because of the grandfather|Because of a TV show|Because of a teacher|Because of a trip to France|0
?What does the writer do every Saturday?|Works at a restaurant|Studies French|Cooks dinner for the family|Visits the grandfather|2
@3|Furoshiki|教科書スタイル
Have you ever used a furoshiki? || あなたは風呂敷を使ったことがありますか。
It is a square cloth that has been used in Japan for hundreds of years. || それは、日本で何百年も使われてきた四角い布です。
In the past, people carried their clothes in it when they went to public baths. || 昔、人々は銭湯へ行くとき、それに衣類を包んで運びました。
Today, plastic bags are used all over the world, and they are often thrown away after one use. || 今日、ビニール袋は世界中で使われており、1回使っただけで捨てられることがよくあります。
This has caused serious problems for sea animals. || このことは、海の動物たちに深刻な問題を引き起こしてきました。
A furoshiki can be used again and again, so it is good for the environment. || 風呂敷は何度もくり返し使えるので、環境によいのです。
It can wrap things of any shape, such as bottles, books, and lunch boxes. || びん、本、弁当箱など、どんな形のものでも包めます。
I think this traditional cloth is a wonderful idea that we should share with the world. || この伝統的な布は、世界と分かち合うべきすばらしいアイデアだと思います。
#cloth|布
#carry|運ぶ
#public bath|銭湯
#throw away|捨てる
#cause|引き起こす
#serious|深刻な
#environment|環境
#wrap|包む
#shape|形
#traditional|伝統的な
#share|分かち合う
?What is a furoshiki?|A kind of plastic bag|A square cloth|A public bath|A lunch box|1
?Why is a furoshiki good for the environment?|It is cheap.|It is made in Japan.|It can be used many times.|It is very large.|2
@3|Smartphones at School|教科書スタイル（意見文）
Should students be allowed to use smartphones at school? || 生徒は学校でスマートフォンを使うことを許されるべきでしょうか。
I have thought about this question for a long time. || 私はこの問題について長い間考えてきました。
Some people say smartphones are useful because we can look up words we don't know. || 知らない単語を調べられるので、スマートフォンは役に立つと言う人もいます。
However, many students who bring them to class cannot stop checking messages. || しかし、授業に持ってくる生徒の多くは、メッセージの確認をやめられません。
In my class, a rule was made last year. || 私のクラスでは、去年ルールが作られました。
We put our phones in a box before the first lesson and get them back after school. || 1時間目の前に電話を箱に入れ、放課後に返してもらいます。
Since then, we have talked with each other more during lunch time. || それ以来、昼休みにお互いにもっと話すようになりました。
In my opinion, it is important to decide when to use technology and when to put it away. || 私の意見では、いつ技術を使い、いつしまっておくかを決めることが大切です。
#allow|許す
#useful|役に立つ
#look up|（言葉などを）調べる
#however|しかし
#bring|持ってくる
#rule|規則
#since then|それ以来
#each other|お互い
#opinion|意見
#decide|決める
#technology|科学技術
?What rule was made in the writer's class?|Phones must stay at home.|Phones are put in a box during school.|Phones can be used only at lunch.|Phones are used in every lesson.|1
?What changed after the rule was made?|Test scores went up.|Students talked with each other more.|Lunch time became shorter.|Students stopped coming to school.|1
@4|Why Do We Sleep?|教科書スタイル
Most people spend about one third of their lives sleeping, yet scientists are still trying to understand exactly why we need it. || ほとんどの人は人生の約3分の1を眠って過ごしますが、科学者たちは私たちがなぜ睡眠を必要とするのかを、今も正確に理解しようとしています。
One thing is clear: sleep is not simply a time when the body is switched off. || 1つはっきりしていることがあります。睡眠は、単に体のスイッチが切れている時間ではないということです。
While we sleep, the brain sorts the information we received during the day and stores what is important. || 眠っている間、脳は日中に受け取った情報を整理し、大切なものを保存します。
This is why students who stay up all night before an exam often perform worse than those who go to bed early. || 試験の前に徹夜する生徒が、早く寝る生徒より成績が悪いことが多いのは、このためです。
Sleep also helps the body repair itself and fight illness. || 睡眠はまた、体が自らを修復し、病気と闘うのを助けます。
People who regularly sleep less than six hours are more likely to catch a cold. || いつも6時間未満しか眠らない人は、風邪をひきやすくなります。
If you want to improve your memory and health, going to bed an hour earlier may be the easiest solution. || 記憶力と健康を高めたいなら、1時間早く寝ることがいちばん簡単な解決策かもしれません。
#spend|（時間を）過ごす
#exactly|正確に
#brain|脳
#sort|整理する・分類する
#store|保存する
#stay up|夜ふかしする
#perform|（成績を）出す・行う
#repair|修復する
#illness|病気
#regularly|定期的に・いつも
#be likely to|〜しそうである
#improve|改善する
#solution|解決策
?What does the brain do while we sleep?|It switches off completely.|It sorts and stores information.|It forgets the day's events.|It fights illness directly.|1
?What does the writer suggest?|Studying all night before exams|Sleeping less than six hours|Going to bed an hour earlier|Taking medicine for colds|2
@4|Library Closing for Renovation|TOEICスタイル（お知らせ）
NOTICE TO ALL LIBRARY USERS || 図書館をご利用のみなさまへのお知らせ
The Riverside Public Library will be closed from March 3 to March 21 for renovation work. || リバーサイド公立図書館は、改装工事のため3月3日から3月21日まで休館します。
During this period, the reading room will be painted and new computers will be installed. || この期間中、閲覧室の塗装と新しいコンピューターの設置が行われます。
Books that are due during the closure may be returned to the box next to the main entrance. || 休館中に返却期限がくる本は、正面入口の横にある返却箱にお返しください。
No late fees will be charged for these items. || これらの資料に延滞料金はかかりません。
Online services, including e-books, will be available as usual. || 電子書籍を含むオンラインサービスは、通常どおりご利用いただけます。
We apologize for any inconvenience and look forward to welcoming you back on March 22. || ご不便をおかけすることをおわびするとともに、3月22日にまたお迎えできることを楽しみにしております。
#notice|お知らせ・掲示
#renovation|改装
#period|期間
#install|設置する
#due|期限がきた
#return|返却する
#entrance|入口
#fee|料金
#charge|請求する
#available|利用できる
#as usual|いつもどおり
#apologize|おわびする
#inconvenience|不便
#look forward to|〜を楽しみにする
?Why will the library be closed?|For a national holiday|For renovation work|Because of bad weather|Because of a staff shortage|1
?What can users still do during the closure?|Use the reading room|Borrow new books at the desk|Read e-books online|Use the new computers|2
@5|Too Good to Waste|教科書スタイル
Every year, roughly one third of the food produced in the world is never eaten. || 毎年、世界で生産される食料のおよそ3分の1は、食べられることがありません。
In wealthy countries, most of this waste occurs in shops and homes rather than on farms. || 豊かな国では、この廃棄の大部分は農場ではなく、店や家庭で起こります。
Supermarkets reject vegetables that are the wrong shape, and consumers throw away food that has passed its "best before" date even when it is perfectly safe. || スーパーは形の悪い野菜を受け入れず、消費者は「賞味期限」を過ぎた食品を、まったく安全であっても捨ててしまいます。
Meanwhile, hundreds of millions of people do not have enough to eat. || その一方で、何億人もの人々が十分な食べ物を得られていません。
Some companies have begun to address the problem. || この問題に取り組み始めた企業もあります。
One app allows restaurants to sell unsold meals at a discount just before closing time. || あるアプリでは、レストランが売れ残った食事を閉店直前に割引価格で販売できます。
Users save money, restaurants reduce their losses, and less food ends up in the garbage. || 利用者は節約でき、レストランは損失を減らせ、ごみになる食品も減ります。
Individual choices matter too: planning meals in advance and understanding date labels can cut household waste significantly. || 個人の選択も重要です。前もって食事の計画を立て、日付表示を理解することで、家庭の廃棄を大幅に減らせます。
#roughly|およそ
#produce|生産する
#wealthy|豊かな
#occur|起こる
#rather than|〜ではなく
#reject|拒否する
#consumer|消費者
#meanwhile|その一方で
#address|（問題に）取り組む
#discount|割引
#reduce|減らす
#loss|損失
#end up|最後には〜になる
#in advance|前もって
#household|家庭
#significantly|大幅に
?Where does most food waste occur in wealthy countries?|On farms|In shops and homes|During transport|In factories|1
?What does the app mentioned in the passage do?|It delivers vegetables from farms.|It teaches people how to cook.|It lets restaurants sell unsold meals cheaply.|It checks "best before" dates.|2
@5|Your Order Has Been Delayed|TOEICスタイル（Eメール）
Subject: Delay in shipping your order (No. 48213) || 件名：ご注文（番号48213）の発送の遅れについて
Dear Ms. Tanaka, || 田中様
Thank you for your recent purchase from Northfield Office Supplies. || このたびはノースフィールド事務用品店でお買い上げいただき、ありがとうございます。
We regret to inform you that the desk lamp you ordered is temporarily out of stock. || 申し訳ございませんが、ご注文のデスクライトは一時的に在庫切れとなっております。
We expect to receive a new shipment from the manufacturer on June 12, and your order will be sent out the following day. || 6月12日にメーカーから新たに入荷する予定で、お客様のご注文はその翌日に発送いたします。
If you would prefer not to wait, you may cancel the order and receive a full refund. || お待ちいただくことをご希望されない場合は、注文をキャンセルして全額返金を受けることもできます。
To do so, simply reply to this e-mail by June 8. || その場合は、6月8日までにこのメールにご返信ください。
As an apology, we have added a coupon for 10 percent off your next purchase to your account. || おわびとして、次回のお買い物が10パーセント引きになるクーポンをお客様のアカウントに追加いたしました。
Sincerely, Daniel Reyes, Customer Service || 敬具　カスタマーサービス　ダニエル・レイエス
#delay|遅れ
#shipping|発送
#purchase|購入
#regret to inform|残念ながらお知らせする
#temporarily|一時的に
#out of stock|在庫切れ
#shipment|出荷・入荷品
#manufacturer|製造業者
#the following day|その翌日
#prefer|〜のほうを好む
#refund|返金
#reply|返信する
#apology|おわび
#account|アカウント・口座
?When will the order be sent out?|June 8|June 12|June 13|June 20|2
?What should Ms. Tanaka do if she wants a refund?|Call the manufacturer|Reply to the e-mail by June 8|Visit the store|Use the coupon|1
@6|The Office Is Not Dead|入試スタイル
When millions of employees began working from home, many commentators predicted the end of the traditional office. || 何百万人もの従業員が在宅勤務を始めたとき、多くの評論家は従来型のオフィスの終わりを予測しました。
Several years later, the picture is more complicated. || 数年たった今、状況はもっと複雑です。
Surveys consistently show that workers value the flexibility of remote work: they save commuting time and find it easier to balance their jobs with family responsibilities. || 調査は一貫して、労働者がリモートワークの柔軟性を高く評価していることを示しています。通勤時間を節約でき、仕事と家庭の責任のバランスを取りやすくなるからです。
Productivity on individual tasks has not declined, and in some cases it has risen. || 個人で行う作業の生産性は下がっておらず、上がった場合もあります。
Yet managers report a hidden cost. || しかし、管理職は隠れた代償を報告しています。
New ideas often emerge from unplanned conversations, and junior staff learn a great deal simply by observing experienced colleagues. || 新しいアイデアは予定外の会話から生まれることが多く、若手は経験豊富な同僚を観察するだけで多くを学びます。
Neither of these happens naturally on a video call. || これらはどちらも、ビデオ通話では自然には起こりません。
As a result, a growing number of firms have adopted a hybrid model in which employees come in two or three days a week. || その結果、従業員が週に2〜3日出社するハイブリッド型を採用する企業が増えています。
The office, it seems, is not disappearing; its purpose is being redefined. || どうやら、オフィスは消えつつあるのではなく、その目的が定義し直されているのです。
#employee|従業員
#commentator|評論家
#predict|予測する
#complicated|複雑な
#consistently|一貫して
#flexibility|柔軟性
#commute|通勤する
#responsibility|責任
#productivity|生産性
#decline|低下する
#emerge|現れる
#observe|観察する
#colleague|同僚
#adopt|採用する
#redefine|定義し直す
?According to the passage, what is a "hidden cost" of remote work?|Higher commuting expenses|Lower productivity on individual tasks|Fewer unplanned conversations and learning opportunities|More family responsibilities|2
?What is the main idea of the passage?|Remote work has failed.|The office will soon disappear.|The role of the office is changing.|Managers dislike video calls.|2
@6|New Expense Reporting System|TOEICスタイル（社内メモ）
MEMO — To: All staff / From: Finance Department || 社内メモ　宛先：全従業員／差出人：経理部
Beginning April 1, all travel and entertainment expenses must be submitted through the new online system, ExpensePro. || 4月1日より、すべての出張費と接待費は、新しいオンラインシステム「ExpensePro」を通じて提出しなければなりません。
Paper forms will no longer be accepted after that date. || その日以降、紙の用紙は受け付けられません。
The new system allows you to photograph receipts with your phone and upload them immediately, which should shorten the reimbursement process from three weeks to about five business days. || 新システムでは、領収書をスマートフォンで撮影してすぐにアップロードできるため、払い戻しの手続きが3週間から約5営業日に短縮される見込みです。
Please note that any claim exceeding $500 still requires approval from your department head before it is submitted. || なお、500ドルを超える請求は、これまでどおり提出前に部門長の承認が必要です。
Training sessions will be held in Conference Room B on March 18 and 20. || 研修会は3月18日と20日に会議室Bで行われます。
Attendance is mandatory for anyone who travels on company business more than twice a year. || 年に3回以上出張する人は、出席が必須です。
Questions may be directed to Priya Nair at extension 204. || ご質問は内線204のプリヤ・ナイルまでお願いします。
#expense|経費
#submit|提出する
#no longer|もはや〜ない
#accept|受け付ける
#receipt|領収書
#immediately|すぐに
#reimbursement|払い戻し
#business day|営業日
#claim|請求
#exceed|超える
#approval|承認
#attendance|出席
#mandatory|必須の
#extension|内線
?What is one benefit of the new system?|Claims over $500 need no approval.|Reimbursement will be faster.|Paper forms can still be used.|Training is not required.|1
?Who must attend a training session?|All staff members|Only department heads|Staff who travel on business more than twice a year|Staff in the Finance Department|2
@7|Local Bakery Finds Success Online|TOEICスタイル（記事）
For three decades, Hartwell's Bakery relied almost entirely on customers who walked past its shop on Mill Street. || 30年間、ハートウェルズ・ベーカリーは、ミル通りの店の前を通りかかる客にほぼ全面的に頼ってきました。
That changed two years ago, when owner Grace Hartwell reluctantly agreed to let her nephew set up an online store. || それが変わったのは2年前、店主のグレース・ハートウェル氏が、おいにオンラインストアを立ち上げさせることにしぶしぶ同意したときでした。
"I assumed nobody would order bread they couldn't smell first," she admits. || 「まず香りをかげないパンを注文する人なんていないと思い込んでいました」と彼女は認めます。
She was mistaken. || 彼女は間違っていました。
Online orders now account for 40 percent of revenue, and the bakery ships its signature sourdough to customers as far as 500 kilometers away. || 現在、オンライン注文は売上の40パーセントを占め、同店は看板商品のサワードウを500キロも離れた顧客に発送しています。
The transition was not without difficulties. || この移行に困難がなかったわけではありません。
Early deliveries sometimes arrived stale, prompting the company to invest in insulated packaging and to switch to an overnight courier. || 初期の配達ではパンが固くなって届くこともあり、同社は断熱包装に投資し、翌日配達の宅配業者に切り替えることになりました。
To keep up with demand, Hartwell's has hired six additional staff and plans to lease a second kitchen by the end of the year. || 需要に対応するため、ハートウェルズは追加で6人を雇い、年末までに2つ目の厨房を借りる計画です。
Ms. Hartwell insists, however, that the original shop will remain the heart of the business. || とはいえ、ハートウェル氏は、元の店がこれからも事業の中心であり続けると強調しています。
#decade|10年間
#rely on|〜に頼る
#reluctantly|しぶしぶ
#assume|思い込む・仮定する
#admit|認める
#account for|〜を占める
#revenue|収益・売上
#signature|看板の・特徴的な
#transition|移行
#stale|（パンなどが）古くなった
#prompt|〜を促す
#invest|投資する
#courier|宅配業者
#demand|需要
#lease|賃借する
#insist|強く主張する
?What did Ms. Hartwell initially think about selling bread online?|It would be very profitable.|People would not order bread they couldn't smell.|It would replace the shop.|It would require a second kitchen.|1
?Why did the bakery change its packaging?|To reduce costs|To attract new customers|Because some bread arrived in poor condition|Because the courier requested it|2
@7|Response to Your Complaint|TOEICスタイル（手紙）
Dear Mr. Okafor, || オカフォー様
I am writing in response to your letter of May 2 concerning your stay at the Grand Marina Hotel. || 5月2日付のお手紙にて、グランド・マリーナ・ホテルでのご滞在についていただいた件に関し、ご返信申し上げます。
I was sorry to learn that the air conditioning in your room was not functioning and that our front desk staff failed to resolve the issue promptly. || お部屋の空調が作動せず、フロントの従業員が速やかに問題を解決できなかったと伺い、申し訳なく存じます。
This falls well short of the standard we aim to provide. || これは、私どもが目指す水準を大きく下回るものです。
Having looked into the matter, I can confirm that a maintenance request was recorded but, owing to an oversight, was never passed on to the engineering team. || 調査いたしましたところ、修理の依頼は記録されていたものの、手違いにより技術部門に伝えられていなかったことを確認いたしました。
We have since revised our procedures so that all such requests are followed up within one hour. || その後、手順を見直し、このような依頼にはすべて1時間以内に対応するようにいたしました。
In recognition of the inconvenience you experienced, we have refunded the cost of one night to your credit card. || お客様にご不便をおかけしたことを踏まえ、1泊分の料金をクレジットカードに返金いたしました。
I would also like to offer you a complimentary upgrade on your next visit. || また、次回のご滞在の際には、無料でお部屋をアップグレードさせていただきたく存じます。
Yours sincerely, Helena Voss, General Manager || 敬具　総支配人　ヘレナ・フォス
#in response to|〜に応えて
#concerning|〜に関して
#function|機能する
#resolve|解決する
#promptly|速やかに
#fall short of|〜に達しない
#look into|調査する
#confirm|確認する
#maintenance|保守・修理
#owing to|〜のために
#oversight|見落とし・手違い
#revise|見直す・改訂する
#procedure|手順
#in recognition of|〜を踏まえて・認めて
#complimentary|無料の
?Why was the air conditioning not repaired?|No request was recorded.|The request was not passed on to the engineering team.|The engineer was on vacation.|The guest did not report it.|1
?What has the hotel done for Mr. Okafor?|Refunded his entire stay|Refunded one night and offered a free upgrade|Sent him a new air conditioner|Dismissed the front desk staff|1
@8|Shorter Week, Same Output?|TOEICスタイル（記事）
A six-month trial in which sixty companies moved their staff to a four-day week without cutting pay has produced results that even its organizers describe as surprisingly positive. || 60社が給与を減らさずに従業員を週4日勤務に移行した6か月間の試行は、主催者自身が驚くほど前向きだと評する結果を生みました。
Of the participating firms, more than ninety percent have opted to continue the arrangement, and nearly a third have made it permanent. || 参加企業のうち90パーセント以上がこの制度の継続を選び、ほぼ3分の1が恒久化しました。
Revenue, on average, remained broadly unchanged over the period, while resignations fell by more than half. || 収益は期間中、平均しておおむね変わらず、一方で退職は半分以下に減りました。
Employees reported lower levels of burnout and fewer sick days. || 従業員は、燃え尽きの度合いが下がり、病欠が減ったと報告しました。
Skeptics caution against drawing sweeping conclusions. || 懐疑的な人々は、大ざっぱな結論を引き出すことを戒めています。
The companies volunteered for the scheme and were therefore predisposed to make it work; most were small, office-based organizations rather than factories or hospitals, where output is tied more directly to hours. || 企業はこの計画に自ら志願したため、もともと成功させようとする傾向がありました。また大半は小規模なオフィス中心の組織で、生産量が労働時間により直接結びつく工場や病院ではありませんでした。
Nor is it clear whether the initial gains in morale will persist once the novelty wears off. || 目新しさが薄れたあとも、当初の士気の向上が続くかどうかも明らかではありません。
Still, the findings challenge the long-held assumption that time spent at work is a reliable proxy for value created. || それでも、この調査結果は、職場で過ごす時間が生み出された価値の信頼できる指標だという長年の前提に疑問を投げかけています。
#trial|試行
#opt to|〜することを選ぶ
#arrangement|取り決め・制度
#permanent|恒久的な
#broadly|おおむね
#resignation|辞職
#burnout|燃え尽き
#skeptic|懐疑的な人
#caution against|〜を戒める
#sweeping|大ざっぱな・全面的な
#predisposed|〜する傾向がある
#morale|士気
#persist|持続する
#novelty|目新しさ
#wear off|薄れる
#assumption|前提・思い込み
#proxy|代わりの指標
?What happened to revenue during the trial?|It rose sharply.|It stayed roughly the same.|It fell by half.|It was not measured.|1
?Why do skeptics doubt the results apply widely?|The trial was too long.|Employees were paid less.|The companies chose to take part and were mostly small offices.|Resignations increased.|2
@8|Press Release: Aldane to Acquire Brightway Logistics|TOEICスタイル（プレスリリース）
Aldane Freight Group today announced that it has entered into a definitive agreement to acquire Brightway Logistics, a regional operator of refrigerated warehouses, for approximately $310 million. || アルデイン・フレイト・グループは本日、冷蔵倉庫の地域事業者であるブライトウェイ・ロジスティクスを約3億1,000万ドルで買収する最終契約を締結したと発表しました。
The transaction, which has been unanimously approved by both boards, is expected to close in the fourth quarter, subject to regulatory clearance. || 両社の取締役会が全会一致で承認したこの取引は、規制当局の認可を条件に、第4四半期に完了する見込みです。
The acquisition will extend Aldane's cold-chain network into eleven additional states and strengthen its position in the rapidly expanding market for grocery home delivery. || この買収により、アルデインの低温物流網はさらに11州に広がり、急拡大する食料品宅配市場での地位が強化されます。
Brightway's 1,400 employees will be retained, and its headquarters will continue to operate under the existing management team for a minimum of two years. || ブライトウェイの従業員1,400人は引き続き雇用され、本社は最低2年間、現経営陣のもとで運営が続けられます。
"Rather than building capacity from scratch, we are gaining a well-run business with long-standing customer relationships," said Aldane chief executive Marcus Leung. || 「ゼロから設備を築くのではなく、長年の顧客関係を持つ、よく運営された事業を手に入れるのです」と、アルデインのマーカス・リョン最高経営責任者は述べました。
The company anticipates annual cost savings of $25 million within three years, chiefly from consolidated purchasing and shared transport routes. || 同社は、主に仕入れの一本化と輸送ルートの共有により、3年以内に年間2,500万ドルのコスト削減を見込んでいます。
#acquire|買収する
#definitive|最終的な
#transaction|取引
#unanimously|全会一致で
#quarter|四半期
#subject to|〜を条件として
#regulatory|規制の
#clearance|認可
#retain|維持する・雇用し続ける
#headquarters|本社
#from scratch|ゼロから
#long-standing|長年の
#anticipate|見込む
#chiefly|主に
#consolidate|統合する
?What must happen before the deal is completed?|Brightway must hire more staff.|Regulators must approve it.|Aldane must build new warehouses.|The boards must vote again.|1
?What is indicated about Brightway's employees?|They will be relocated to eleven states.|Their number will be reduced.|They will keep their jobs.|They will receive $25 million.|2
@9|Too Much of a Good Thing|TOEIC 900＋（論説）
Conventional economic theory holds that more choice is invariably better: a consumer confronted with a wider range of options is more likely to find one that matches her preferences precisely. || 従来の経済理論は、選択肢は多いほど必ずよいと考えます。より幅広い選択肢を前にした消費者は、自分の好みにぴったり合うものを見つける可能性が高くなる、というわけです。
A substantial body of behavioral research suggests the reality is less straightforward. || しかし、相当な量の行動研究は、現実がそれほど単純ではないことを示唆しています。
In a much-cited experiment, shoppers offered a selection of twenty-four jams were markedly less likely to buy any than those offered only six. || よく引用される実験では、24種類のジャムを提示された買い物客は、6種類だけを提示された客よりも、購入に至る割合が著しく低くなりました。
Abundance, it appears, can paralyze rather than liberate. || どうやら、豊富さは人を自由にするどころか、動けなくさせることがあるようです。
Subsequent studies have qualified this finding—the effect is far from universal and tends to vanish when people already know what they want—but the underlying insight has proved commercially valuable. || その後の研究はこの知見に条件を付けました。効果は普遍的とはほど遠く、人々が欲しいものをすでに分かっている場合には消えがちです。それでも、根底にある洞察は商業的に価値があると分かりました。
Retailers that have pruned their product lines frequently report higher sales, not lower. || 商品ラインを絞り込んだ小売業者は、売上が下がるどころか上がったと報告することがよくあります。
Streaming services, mindful that subscribers who spend twenty minutes scrolling often give up altogether, invest heavily in recommendation engines whose real function is to conceal the catalogue rather than display it. || 動画配信サービスは、20分もスクロールし続けた加入者がしばしば完全にあきらめてしまうことを意識し、推薦エンジンに多額の投資をしています。その本当の役割は、作品一覧を見せることではなく、むしろ隠すことなのです。
The lesson for managers is not that choice should be eliminated but that curation is itself a service for which customers will pay. || 経営者にとっての教訓は、選択肢をなくすべきだということではなく、選び抜いて見せること自体が、顧客が対価を払うサービスだということです。
#conventional|従来の
#invariably|必ず・常に
#confront|直面させる
#substantial|相当な
#straightforward|単純な
#markedly|著しく
#abundance|豊富さ
#paralyze|まひさせる
#liberate|解放する
#subsequent|その後の
#qualify|（主張に）条件を付ける
#underlying|根底にある
#prune|刈り込む・絞り込む
#mindful|意識している
#conceal|隠す
#eliminate|なくす
#curation|選び抜いて提示すること
?What did the jam experiment show?|More options led to more purchases.|Shoppers preferred expensive jams.|Shoppers with more options were less likely to buy.|Six options were too many.|2
?According to the writer, what is the real function of recommendation engines?|To display the whole catalogue|To hide most of the catalogue|To raise subscription prices|To shorten films|1
@9|Rates on Hold as Outlook Clouds|TOEIC 900＋（経済記事）
The central bank left its benchmark interest rate unchanged on Thursday, defying expectations in some quarters that it would begin easing policy before the end of the year. || 中央銀行は木曜日、政策金利を据え置き、年末までに緩和を始めるだろうという一部の予想に反する決定を下しました。
In a statement notable for its cautious tone, the governor acknowledged that inflation had receded from its peak but warned that underlying price pressures, particularly in services, remained stubbornly elevated. || 慎重な論調が目立つ声明の中で、総裁はインフレがピークから後退したことを認めつつも、特にサービス分野で、基調的な物価上昇圧力が依然として根強く高止まりしていると警告しました。
Wage growth, though moderating, continues to outpace productivity. || 賃金の伸びは鈍化しているものの、生産性の伸びを上回り続けています。
Markets reacted swiftly: government bond yields climbed, and the currency strengthened against those of its major trading partners. || 市場は素早く反応しました。国債の利回りは上昇し、通貨は主要貿易相手国の通貨に対して上昇しました。
Exporters, already squeezed by sluggish overseas demand, are unlikely to welcome the appreciation. || 海外需要の低迷ですでに圧迫されている輸出企業が、この通貨高を歓迎することはなさそうです。
Analysts are divided over what comes next. || 次に何が起こるかについて、アナリストの見方は分かれています。
Some contend that the bank risks tipping a fragile economy into recession by keeping borrowing costs high for too long; others argue that a premature cut would squander hard-won credibility. || 借入コストを高く保ちすぎることで、もろい経済を景気後退に陥らせる危険があると主張する人もいれば、時期尚早の利下げは苦労して得た信認を無駄にすると論じる人もいます。
The governor declined to offer guidance, insisting that future decisions would be dictated by incoming data rather than by the calendar. || 総裁は見通しを示すことを避け、今後の決定は日程ではなく、これから出てくるデータによって決まると強調しました。
#benchmark|基準となる
#defy|〜に反する・逆らう
#ease|緩和する
#acknowledge|認める
#recede|後退する
#stubbornly|根強く
#elevated|高い水準の
#outpace|〜を上回る
#yield|利回り
#sluggish|低迷した
#appreciation|（通貨の）上昇
#contend|主張する
#fragile|もろい
#recession|景気後退
#premature|時期尚早の
#squander|無駄にする
#credibility|信認・信頼性
#dictate|決定づける
?Why did the central bank keep rates unchanged?|Inflation has fallen below target.|Underlying price pressures remain high.|Exporters requested it.|The currency was too weak.|1
?What do some analysts fear about a premature rate cut?|It would cause a recession.|It would weaken exporters.|It would damage the bank's credibility.|It would raise bond yields.|2
@10|The Tyranny of the Measurable|最上級（論説）
There is an adage, variously attributed and endlessly misquoted, to the effect that when a measure becomes a target it ceases to be a good measure. || 出どころが諸説あり、際限なく誤って引用される格言があります。その趣旨は、指標が目標になったとたん、それはよい指標ではなくなる、というものです。
One need not look far for corroboration. || その裏づけを探すのに、遠くまで目を向ける必要はありません。
Hospitals judged on waiting times have been known to reclassify corridors as wards; schools ranked by examination results quietly discourage their weakest pupils from sitting the examinations at all. || 待ち時間で評価される病院は、廊下を病棟と分類し直すことで知られていますし、試験結果で順位づけされる学校は、成績の最も低い生徒がそもそも受験しないよう、そっと仕向けます。
In neither case has anyone, strictly speaking, lied. || どちらの場合も、厳密に言えば、誰もうそをついてはいません。
The numbers are accurate; it is merely that they have been severed from the reality they were devised to illuminate. || 数字は正確です。ただ、それが照らし出すために考案されたはずの現実から、切り離されてしまっただけなのです。
The deeper pathology is not gaming but displacement. || より深い病理は、数字の操作ではなく、すり替えにあります。
Whatever resists quantification—judgment, trust, the tacit knowledge of a seasoned practitioner—comes to be regarded as soft, then as suspect, and finally as nonexistent. || 数値化に抵抗するもの、すなわち判断力、信頼、熟練した実務家の暗黙知は、あいまいなものと見なされ、次に疑わしいものと見なされ、ついには存在しないものと見なされるようになります。
An organization that manages exclusively by indicators gradually forgets that the indicators were only ever proxies, and begins to mistake the map for the territory. || 指標だけで運営される組織は、指標があくまで代用品にすぎなかったことを次第に忘れ、地図を現地そのものと取り違え始めます。
None of this amounts to a counsel of despair, still less an argument for abandoning measurement. || だからといって、これは絶望の勧めではなく、ましてや測定を放棄せよという主張でもありません。
It is, rather, a plea for humility: metrics ought to inform deliberation, not supplant it, and those who wield them would do well to ask not merely whether the figures are improving but what, precisely, is being improved. || むしろ、謙虚さを求める訴えです。指標は熟慮の材料となるべきであって、それに取って代わるべきではありません。指標を用いる者は、数字が良くなっているかどうかだけでなく、正確には何が良くなっているのかを問うのが賢明でしょう。
#adage|格言
#attribute|（〜の言葉だと）帰する
#to the effect that|〜という趣旨の
#cease|やめる・終わる
#corroboration|裏づけ
#reclassify|分類し直す
#sever|切り離す
#devise|考案する
#illuminate|照らし出す・明らかにする
#pathology|病理
#displacement|置き換え・すり替え
#quantification|数値化
#tacit|暗黙の
#seasoned|熟練した
#practitioner|実務家
#counsel of despair|絶望の勧め
#still less|ましてや〜ない
#plea|訴え・嘆願
#humility|謙虚さ
#deliberation|熟慮
#supplant|取って代わる
#wield|（力・道具を）用いる
?What does the writer identify as the "deeper pathology"?|People lying about numbers|Unmeasurable things coming to be treated as nonexistent|Hospitals having long waiting times|Too little measurement|1
?What is the writer's ultimate recommendation?|Abandon measurement altogether|Rely solely on experienced practitioners|Use metrics to inform judgment, not replace it|Set more ambitious targets|2
@10|The Meritocratic Conceit|最上級（論説）
Few ideals command such reflexive assent as meritocracy. || 能力主義ほど、反射的な賛同を集める理想はほとんどありません。
That positions should go to the able rather than the well-born seems so self-evidently just that to query it is to invite the suspicion that one hankers after aristocracy. || 地位は生まれのよい者ではなく有能な者に与えられるべきだという考えは、あまりに自明に正しく思えるため、それに疑問を呈すれば、貴族制を恋しがっているのではないかと疑われかねません。
Yet the term was coined as satire, and the satirist's misgivings have aged rather better than the enthusiasm of those who appropriated his word. || しかし、この言葉は風刺として作られたものであり、風刺家の懸念のほうが、その言葉を借用した人々の熱狂よりも、時の試練によく耐えています。
The difficulty is twofold. || 難点は2つあります。
First, the competition is seldom as open as its champions suppose: advantages purchased in childhood—tutoring, connections, the unhurried confidence of the comfortable—are laundered through examinations and emerge as apparently personal achievement. || 第一に、競争は擁護者が想定するほど開かれていることはめったにありません。子ども時代に金で買われた有利さ、つまり家庭教師、人脈、恵まれた者のゆったりとした自信は、試験を通じて洗い清められ、見かけ上は個人の業績として現れます。
Inherited privilege, in other words, has not been abolished so much as disguised. || 言い換えれば、受け継がれた特権は廃止されたというより、偽装されたのです。
The second objection is subtler and would hold even were the race impeccably fair. || 第二の反論はもっと微妙で、たとえ競争が申し分なく公正であったとしても成り立ちます。
A society that insists its hierarchy tracks desert teaches the successful that they owe nothing to fortune and the unsuccessful that they have no one to blame but themselves. || 序列が「値するかどうか」に対応していると言い張る社会は、成功者には運のおかげなど何もないと教え、成功しなかった者には責めるべきは自分だけだと教えます。
Hubris on one side is answered by humiliation on the other, and the resentment thus engendered is not easily assuaged by the reminder that the rules were followed. || 一方の傲慢に、他方の屈辱が応じます。こうして生じた恨みは、ルールは守られたのだと念を押されても、容易には和らぎません。
What is wanted is not the repudiation of merit but a certain modesty about its provenance. || 求められているのは、能力の否定ではなく、その由来についてのある種の慎みなのです。
#reflexive|反射的な
#assent|賛同
#self-evidently|自明に
#hanker after|〜を恋しがる
#coin|（言葉を）作り出す
#satire|風刺
#misgivings|懸念
#appropriate|（自分のものとして）借用する
#launder|洗浄する
#abolish|廃止する
#disguise|偽装する
#impeccably|申し分なく
#desert|（賞罰に）値すること
#hubris|傲慢
#humiliation|屈辱
#resentment|恨み
#engender|生じさせる
#assuage|和らげる
#repudiation|否定・拒絶
#provenance|由来・出どころ
?What does the writer mean by saying privilege has been "disguised"?|It has been completely removed.|Childhood advantages appear as personal achievement through exams.|Aristocrats now hide their titles.|Examinations have become unfair.|1
?Why would the second objection hold even if competition were fair?|Because the unsuccessful would still cheat|Because fairness is impossible|Because winners would feel entitled and losers humiliated|Because exams would be abolished|2
`;
// リスニング（TOEIC形式・書き下ろし）
// @レベル|2 … 質問 || 質問の訳 | A | B | C | 正解 | 正解の訳
// @レベル|3|場面 / @レベル|4|場面 … 話者: 英文 || 訳 ／ #語句|意味 ／ ?質問|A|B|C|D|正解
const EN_LIS=`
@1|2
What's your name? || あなたの名前は？ | I'm Yuki. | I'm fine. | It's Monday. | 0 | ユキです。
Where is your bag? || あなたのかばんはどこ？ | It's blue. | It's on the desk. | Yes, it is. | 1 | 机の上です。
Do you like music? || 音楽は好き？ | At seven. | No, he isn't. | Yes, I do. | 2 | はい、好きです。
@1|3|学校での会話
W: Hi, Tom. Do you play tennis? || こんにちは、トム。テニスはする？
M: Yes, I do. I play every Saturday. || うん、するよ。毎週土曜日にするんだ。
W: Where do you play? || どこでするの？
M: In the park near my house. || 家の近くの公園だよ。
?When does Tom play tennis?|Every Sunday|Every Saturday|Every day|After school|1
?Where does Tom play?|At school|At the station|In the park|In the gym|2
@2|2
What did you do last weekend? || 先週末は何をしましたか？ | I'll go shopping. | I visited my grandmother. | It was Saturday. | 1 | 祖母を訪ねました。
How long does it take to the station? || 駅までどのくらいかかりますか？ | About ten minutes. | By bus. | It's two kilometers. | 0 | 10分くらいです。
Which do you like better, summer or winter? || 夏と冬、どちらが好きですか？ | Yes, I do. | I like winter better. | It's very hot. | 1 | 冬のほうが好きです。
@2|3|友達同士の会話
M: What are you going to do this Sunday? || 今度の日曜日は何をする予定？
W: I'm going to see a movie with my sister. || 姉と映画を見に行く予定だよ。
M: That sounds fun. What time does it start? || 楽しそうだね。何時に始まるの？
W: At two. We have to buy the tickets before lunch. || 2時。お昼の前にチケットを買わないといけないの。
?What will the woman do on Sunday?|Go shopping|See a movie|Study at home|Visit her sister|1
?What time does the movie start?|At noon|At one|At two|At three|2
@3|2
Have you finished your homework yet? || もう宿題は終わりましたか？ | Yes, I've just finished it. | It was difficult. | I'll do it at school. | 0 | はい、ちょうど終わったところです。
Could you tell me how to get to the museum? || 博物館への行き方を教えていただけますか？ | It opens at nine. | Sure, turn left at the next corner. | I went there yesterday. | 1 | いいですよ、次の角を左に曲がってください。
Why don't we take a break? || 休憩しませんか？ | Because I was tired. | It's broken. | That's a good idea. | 2 | いい考えですね。
@3|3|店での会話
W: Excuse me, I'm looking for a present for my father. || すみません、父へのプレゼントを探しているのですが。
M: How about this tie? It's made in Italy. || このネクタイはいかがですか。イタリア製です。
W: It's nice, but it's too expensive. Do you have a cheaper one? || すてきですが、高すぎます。もっと安いものはありますか？
M: Yes. These ones are on sale this week. || はい。こちらは今週セール中です。
#look for|探す
#expensive|値段が高い
#on sale|セール中で
?Who is the present for?|Her brother|Her father|Her teacher|Her friend|1
?Why doesn't the woman buy the first tie?|It is the wrong color.|It is too expensive.|It is made in Italy.|It is too short.|1
@4|2
When will the new printer be delivered? || 新しいプリンターはいつ届きますか？ | From the supplier. | By Friday at the latest. | It prints in color. | 1 | 遅くとも金曜日までには。
Who's in charge of the sales meeting? || 営業会議の担当は誰ですか？ | Ms. Lopez is. | In the conference room. | It's at three. | 0 | ロペスさんです。
Would you like me to call a taxi? || タクシーをお呼びしましょうか？ | I called him yesterday. | No thanks, I'll walk. | It's twenty dollars. | 1 | いいえ、結構です。歩きます。
@4|3|オフィスでの会話
M: Hi, Karen. Is the meeting room free at two o'clock? || やあ、カレン。2時に会議室は空いている？
W: Let me check. No, the marketing team has booked it until three. || 確認するね。いいえ、マーケティング部が3時まで予約しているわ。
M: I see. Then could you reserve it from three to four for me? || そうか。じゃあ3時から4時まで予約してもらえる？
W: Sure. How many people are coming? I'll arrange the chairs. || いいわよ。何人来るの？いすを用意しておくわ。
M: Eight, including me. Thanks a lot. || 僕を入れて8人。どうもありがとう。
#book|予約する
#reserve|予約する
#arrange|手配する・並べる
#including|〜を含めて
?Why can't the man use the room at two?|It is being cleaned.|Another team has booked it.|The chairs are missing.|It is too small.|1
?How many people will attend the man's meeting?|Three|Four|Eight|Nine|2
@4|4|店内放送
N: Attention, shoppers. || お客様にお知らせいたします。
N: Our store will be closing in fifteen minutes. || 当店はあと15分で閉店いたします。
N: Please bring your items to the checkout counters on the first floor. || お買い上げの商品を1階のレジまでお持ちください。
N: Tomorrow we will open at nine a.m. for our summer sale. || 明日はサマーセールのため、午前9時に開店いたします。
N: All swimwear will be thirty percent off. || 水着はすべて30パーセント引きです。
N: Thank you for shopping with us. || ご来店ありがとうございました。
#attention|お知らせします
#item|商品・品物
#checkout counter|レジ
?When will the store close?|In five minutes|In fifteen minutes|In thirty minutes|At nine|1
?What will be discounted tomorrow?|Shoes|Summer hats|Swimwear|All items|2
@5|2
Has the shipment from Osaka arrived yet? || 大阪からの荷物はもう届きましたか？ | Yes, it came this morning. | I've never been to Osaka. | By express mail. | 0 | はい、今朝届きました。
Why was the flight delayed? || なぜフライトは遅れたのですか？ | For two hours. | At gate twelve. | Due to heavy fog. | 2 | 濃い霧のためです。
Should I send the invoice by e-mail or by post? || 請求書はメールで送りましょうか、それとも郵便で？ | Yes, please send it. | E-mail would be faster. | I received it yesterday. | 1 | メールのほうが早いですね。
@5|3|電話での会話
W: Good morning, Dr. Patel's office. How can I help you? || おはようございます、パテル医院です。ご用件をどうぞ。
M: Hello, I have an appointment at four today, but I need to reschedule. Something urgent came up at work. || もしもし、今日の4時に予約があるのですが、変更が必要なんです。仕事で急用ができまして。
W: I see. We have an opening on Thursday at ten, or Friday at two thirty. || かしこまりました。木曜の10時か、金曜の2時半が空いております。
M: Friday afternoon works better for me. || 金曜の午後のほうが都合がいいです。
W: All right, I've changed it. Please arrive ten minutes early to fill out a form. || 承知しました、変更しました。用紙の記入がありますので、10分早くお越しください。
#appointment|予約
#reschedule|予定を変更する
#urgent|緊急の
#come up|（用事などが）生じる
#opening|空き
#fill out|記入する
?Why is the man calling?|To make a new appointment|To change his appointment|To ask for directions|To cancel a payment|1
?When will the man visit the office?|Today at four|Thursday at ten|Friday at two thirty|Friday at ten|2
@5|4|留守番電話のメッセージ
N: Hello, this message is for Mr. Sato. || もしもし、佐藤様へのメッセージです。
N: This is Linda from City Auto Repair. || シティ自動車修理のリンダです。
N: Your car is ready to be picked up. || お車の引き取りの準備ができました。
N: We replaced the front brakes and changed the oil, as you requested. || ご依頼どおり、前のブレーキを交換し、オイルを替えました。
N: The total comes to two hundred and forty dollars. || 合計は240ドルです。
N: We're open until six this evening, and from eight tomorrow morning. || 本日は夕方6時まで、明日は朝8時から営業しております。
N: If you have any questions, please call us at 555-0142. || ご質問がありましたら、555-0142までお電話ください。
#pick up|引き取る
#replace|交換する
#request|依頼する
#come to|（合計が）〜になる
?Where does the speaker work?|At a car repair shop|At a car rental agency|At a bank|At a gas station|0
?What was done to the car?|It was washed.|The tires were changed.|The brakes were replaced.|It was painted.|2
@6|2
Didn't you attend the workshop last week? || 先週のワークショップに出席しなかったのですか？ | It was held in Room 5. | No, I was away on business. | I'll attend next year. | 1 | ええ、出張で不在でした。
Do you mind if I open the window? || 窓を開けてもかまいませんか？ | Not at all, go ahead. | Yes, it's open. | I don't mind the noise. | 0 | 全然かまいません、どうぞ。
The copier on the third floor is out of order again. || 3階のコピー機がまた故障しています。 | I ordered it yesterday. | Three copies, please. | I'll let maintenance know. | 2 | 保守担当に伝えておきます。
@6|3|同僚同士の会話
M: Julia, have you had a chance to review the budget proposal I sent you? || ジュリア、送った予算案に目を通す時間はあった？
W: I have. Overall it looks reasonable, but the advertising costs seem a bit high. || ええ。全体としては妥当に見えるけれど、広告費が少し高いように思うわ。
M: That's because we're planning to run television commercials this year, not just online ads. || 今年はオンライン広告だけでなく、テレビCMも流す予定だからね。
W: I understand, but the director wants us to cut total spending by ten percent. Could we reduce the number of commercials? || 分かるけれど、部長は総支出を10パーセント削るよう求めているの。CMの本数を減らせないかしら。
M: I'll talk to the agency this afternoon and see what they can offer. || 今日の午後、代理店と話して、どんな提案ができるか確認してみるよ。
#review|目を通す・見直す
#proposal|提案
#overall|全体として
#reasonable|妥当な
#advertising|広告
#spending|支出
#agency|代理店
?What does the woman say about the proposal?|It is too short.|The advertising costs seem high.|It was sent too late.|The director rejected it.|1
?What will the man do this afternoon?|Meet the director|Rewrite the entire budget|Speak with the agency|Film a commercial|2
@6|4|空港のアナウンス
N: Attention passengers on Flight 372 to Singapore. || シンガポール行き372便にご搭乗のお客様にお知らせいたします。
N: Due to a mechanical inspection, departure has been postponed by approximately ninety minutes. || 機材の点検のため、出発がおよそ90分遅れております。
N: The new boarding time is three forty-five, and the gate has been changed from fourteen to twenty-two. || 新しい搭乗時刻は3時45分で、搭乗口は14番から22番に変更となりました。
N: Passengers with connecting flights should speak to a member of our staff at the service desk. || 乗り継ぎ便のあるお客様は、サービスデスクの係員にお声がけください。
N: Meal vouchers are available for all passengers at the gate. || 搭乗口にて、すべてのお客様にお食事券をお配りしております。
N: We apologize for the inconvenience and thank you for your patience. || ご不便をおかけしますことをおわび申し上げますとともに、ご辛抱に感謝いたします。
#passenger|乗客
#mechanical|機械の
#inspection|点検
#departure|出発
#postpone|延期する
#boarding|搭乗
#connecting flight|乗り継ぎ便
#voucher|引換券
#patience|辛抱
?What caused the delay?|Bad weather|A mechanical inspection|A late crew|Heavy air traffic|1
?What are passengers with connecting flights told to do?|Go to gate fourteen|Collect a meal voucher|Speak to staff at the service desk|Board immediately|2
@7|2
Wasn't the quarterly report supposed to be finished by now? || 四半期報告書は、もう完成しているはずではなかったのですか？ | It's a quarter past nine. | We're still waiting on the sales figures. | Yes, I'll report to him. | 1 | まだ売上の数字を待っているところなんです。
How did the negotiations with the supplier go? || 仕入れ先との交渉はどうでしたか？ | They agreed to most of our terms. | By train, I think. | It's going to rain. | 0 | こちらの条件のほとんどに同意してくれました。
Shall I forward the client's e-mail to the legal department? || 顧客からのメールを法務部に転送しましょうか？ | The client is in the lobby. | It was forwarded from Tokyo. | Actually, I've already taken care of it. | 2 | 実は、もう対応済みです。
@7|3|上司と部下の会話
W: Mark, I'd like to discuss the timeline for the website redesign. The client has asked whether we can launch two weeks ahead of schedule. || マーク、ウェブサイト改修のスケジュールについて相談したいの。クライアントから、予定より2週間早く公開できないかと聞かれていて。
M: That would be tight. The design phase is nearly complete, but we haven't started testing the payment system yet. || それは厳しいですね。デザインの段階はほぼ終わっていますが、決済システムのテストはまだ始めていません。
W: What if we brought in a couple of contractors to help with the testing? || テストの手伝いに、外部の業者を2人ほど入れたらどう？
M: That could work, provided they're familiar with our platform. Otherwise we'd lose time training them. || うちのプラットフォームに慣れている人なら、うまくいくかもしれません。そうでないと、教える時間が無駄になります。
W: Fair point. I'll ask the agency for candidates with relevant experience and get back to you by tomorrow. || もっともね。代理店に関連する経験のある候補者を頼んで、明日までに連絡するわ。
#timeline|スケジュール
#launch|公開する・開始する
#ahead of schedule|予定より早く
#phase|段階
#contractor|請負業者
#provided|〜という条件で
#be familiar with|〜に慣れている
#candidate|候補者
#relevant|関連のある
#get back to|〜に折り返し連絡する
?What has the client requested?|A lower price|An earlier launch|A new design|More testing|1
?What concern does the man raise about contractors?|They may be too expensive.|They may not know the platform.|They may be unavailable.|They may delay the design phase.|1
@7|4|会議での発言
N: Before we wrap up, I have a brief update on the office relocation. || 終わる前に、オフィス移転について手短にご報告があります。
N: As most of you know, our lease here expires at the end of September. || ほとんどの方がご存じのとおり、ここの賃貸契約は9月末で切れます。
N: We've signed an agreement for the fourth and fifth floors of the Harbor Building, which is a ten-minute walk from Central Station. || 中央駅から徒歩10分のハーバービルの4階と5階について、契約を結びました。
N: The move itself will take place over the weekend of September twentieth, so there should be minimal disruption to our work. || 移転そのものは9月20日の週末に行いますので、業務への支障は最小限のはずです。
N: Each of you will receive packing boxes and labels next week. || 来週、みなさん一人ひとりに梱包用の箱とラベルをお配りします。
N: Please make sure everything on your desk is boxed up by Friday the nineteenth. || 19日の金曜日までに、机の上のものをすべて箱に詰めておいてください。
N: Personal items of value should be taken home rather than left for the movers. || 貴重な私物は、引っ越し業者に任せず、持ち帰るようにしてください。
#wrap up|終える
#relocation|移転
#lease|賃貸契約
#expire|期限が切れる
#take place|行われる
#minimal|最小限の
#disruption|混乱・支障
#mover|引っ越し業者
?Why is the company relocating?|The office is too small.|The lease is expiring.|The building is being sold.|Rent has increased.|1
?What are employees asked to do by September 19?|Sign an agreement|Visit the new building|Pack up their desks|Return their labels|2
@8|2
You've reviewed the revised contract, haven't you? || 修正版の契約書には目を通しましたよね？ | I'll have a look at the view. | Only the first few clauses so far. | Yes, he signed it. | 1 | 今のところ最初の数条項だけです。
Why don't we hold off on the announcement until the figures are confirmed? || 数字が確定するまで、発表を見合わせませんか？ | That's probably the wiser course. | It was announced on Monday. | I can hold it for you. | 0 | おそらくそのほうが賢明ですね。
Who's going to fill in for Angela while she's on leave? || アンジェラの休暇中、誰が代わりを務めるのですか？ | She's leaving at five. | Please fill in this form. | That hasn't been settled yet. | 2 | それはまだ決まっていません。
@8|3|取引先との会話
M: Thanks for making time, Dr. Hale. I understand you have some reservations about our proposal. || お時間をいただきありがとうございます、ヘイル博士。私どもの提案にいくつか懸念をお持ちだと伺いました。
W: I do. Your equipment is clearly superior, but the maintenance contract is considerably more expensive than what we're paying our current vendor. || ええ。御社の機器が優れているのは明らかですが、保守契約が、今の業者に払っている額よりかなり高いのです。
M: I appreciate that. What the headline figure doesn't reflect, though, is that our contract covers replacement parts, which yours currently doesn't. || ごもっともです。ただ、表面上の金額には表れていませんが、当社の契約には交換部品が含まれており、現在のご契約には含まれておりません。
W: That's a fair distinction. Even so, I'd need to justify the upfront cost to our board. || それはもっともな違いですね。それでも、初期費用について取締役会を納得させる必要があります。
M: Would it help if I prepared a five-year cost comparison? In most cases, the total works out lower with us. || 5年間のコスト比較をご用意すれば、お役に立ちますか？ほとんどの場合、合計では当社のほうが低くなります。
W: It would. If the numbers hold up, I'd be willing to recommend a trial at one of our sites. || ええ。その数字が確かなら、当方の拠点の1つでの試験導入を推薦してもかまいません。
#reservation|懸念
#superior|優れた
#considerably|かなり
#vendor|業者
#reflect|反映する
#distinction|区別・違い
#justify|正当化する
#upfront cost|初期費用
#work out|（結果が）〜になる
#hold up|（主張などが）成り立つ
?What is the woman's main concern?|The quality of the equipment|The cost of the maintenance contract|The delivery schedule|The location of the trial|1
?What does the man offer to do?|Lower the price immediately|Replace her current vendor's parts|Prepare a five-year cost comparison|Speak to her board directly|2
@8|4|ラジオのビジネスニュース
N: In business news, shares in the retailer Coleridge and Finch fell nearly eight percent this morning after the company issued its second profit warning in six months. || ビジネスニュースです。小売業のコールリッジ・アンド・フィンチの株価は、同社がこの半年で2度目の業績下方修正を発表したことを受け、今朝8パーセント近く下落しました。
N: The chain, which operates more than two hundred department stores nationwide, blamed unseasonably warm weather for weak sales of winter clothing. || 全国で200を超える百貨店を展開する同チェーンは、冬物衣料の販売不振について、季節外れの暖かさが原因だとしています。
N: Analysts, however, point to deeper problems, noting that the company has been slow to develop its online business while rivals have invested heavily. || しかしアナリストは、競合他社が多額の投資をする中で同社のオンライン事業の展開が遅れてきたことを挙げ、より深い問題を指摘しています。
N: Chief executive Diane Mercer said the board is reviewing all options, including the closure of underperforming locations. || ダイアン・マーサー最高経営責任者は、取締役会が業績不振の店舗の閉鎖を含め、あらゆる選択肢を検討していると述べました。
N: A detailed restructuring plan is expected to be unveiled alongside the full-year results in March. || 詳細な再建計画は、3月の通期決算と合わせて公表される見通しです。
#share|株
#issue|発表する
#profit warning|業績下方修正
#blame|〜のせいにする
#unseasonably|季節外れに
#underperforming|業績不振の
#restructuring|再編・再建
#unveil|公表する
?What did the company blame for weak sales?|High prices|Warm weather|Online competition|Store closures|1
?What do analysts suggest is the deeper problem?|Too many stores|Slow development of its online business|A change of chief executive|Poor winter clothing designs|1
@9|2
I gather the board wasn't entirely convinced by the forecast. || 取締役会は、その予測に完全には納得しなかったそうですね。 | They gathered at noon. | No, they've asked us to revisit the assumptions. | The forecast calls for rain. | 1 | ええ、前提を見直すよう求められました。
Wouldn't it make more sense to outsource the payroll function? || 給与計算業務は外部委託したほうが理にかなっていませんか？ | In theory, yes, but confidentiality is a concern. | The payroll is on the second floor. | It makes about fifty units. | 0 | 理屈の上ではそうですが、機密保持が懸念です。
How come the audit took so much longer than anticipated? || 監査はなぜ予想よりずっと長くかかったのですか？ | He came by taxi. | About three weeks longer. | Several records turned out to be incomplete. | 2 | いくつかの記録が不完全だと分かったのです。
@9|3|経営会議での会話
W: I'll be candid, Rob. I'm not persuaded that entering the Southeast Asian market next year is prudent. || 率直に言うわ、ロブ。来年、東南アジア市場に参入するのが賢明だとは納得できていないの。
M: I take your point about timing, but if we hesitate, our competitors will have locked up the best distribution partners. || タイミングについてのご指摘は分かります。ただ、ためらっていると、競合が最良の販売パートナーを押さえてしまいます。
W: Possibly. But we've barely recovered from the supply problems of last year, and our cash reserves are thinner than I'd like. || かもしれない。でも去年の供給問題からやっと立ち直ったばかりで、手元資金は私が望むより薄いのよ。
M: Suppose we scaled the plan back—a single country, a joint venture rather than a wholly owned subsidiary. Our exposure would be a fraction of the original estimate. || 計画を縮小したらどうでしょう。1か国だけ、完全子会社ではなく合弁事業にする。当社が負うリスクは、当初の見積もりのごく一部になります。
W: That's considerably more palatable. Draw up the revised figures and I'll put it on the agenda for the board. || それならずっと受け入れやすいわ。修正した数字を作ってちょうだい。取締役会の議題に載せるから。
#candid|率直な
#prudent|賢明な・慎重な
#hesitate|ためらう
#lock up|押さえる・確保する
#distribution|流通・販売
#reserves|準備金
#scale back|縮小する
#joint venture|合弁事業
#subsidiary|子会社
#exposure|（リスクに）さらされる度合い
#palatable|受け入れやすい
#draw up|作成する
?Why is the woman reluctant to enter the new market?|Competitors are too strong.|The company's finances are still stretched.|There are no distribution partners.|The board has rejected the idea.|1
?What compromise does the man propose?|Delaying entry by two years|Entering one country through a joint venture|Borrowing additional funds|Acquiring a competitor|1
@9|4|業界会議での講演
N: I want to challenge a piece of received wisdom this afternoon—namely, that customer loyalty is something you earn through satisfaction. || 今日の午後は、ある通説に異議を唱えたいと思います。つまり、顧客ロイヤルティは満足を通じて獲得するものだ、という考えです。
N: Our research, spanning some forty thousand customers across nine industries, points to a rather different conclusion. || 9つの業界、約4万人の顧客に及ぶ私たちの調査は、かなり違う結論を示しています。
N: Satisfied customers defect all the time; what they rarely abandon is a company that has made their lives easier. || 満足している顧客も、しょっちゅう離れていきます。彼らがめったに見捨てないのは、生活を楽にしてくれた企業です。
N: The single strongest predictor of repeat business was not delight but the absence of effort—how little the customer had to do to get a problem resolved. || リピート購入を最も強く予測するものは、感動ではなく、手間のなさでした。問題を解決するために、顧客がどれだけ少ない労力で済んだか、です。
N: Firms pour resources into exceeding expectations, when the returns on simply meeting them reliably are far greater. || 企業は期待を上回ることに資源を注ぎ込みますが、期待に確実に応えるだけのほうが、見返りははるかに大きいのです。
N: So my advice is unglamorous: stop trying to dazzle people, and start removing the obstacles you've put in their way. || ですから、私の助言は地味なものです。人々を驚かせようとするのをやめ、自分たちが顧客の行く手に置いた障害を取り除き始めてください。
#received wisdom|通説
#namely|すなわち
#span|〜に及ぶ
#defect|離反する
#abandon|見捨てる
#predictor|予測因子
#delight|大きな喜び
#pour into|〜に注ぎ込む
#unglamorous|地味な
#dazzle|目をくらませる・驚嘆させる
#obstacle|障害
?What idea does the speaker challenge?|That research is unreliable|That loyalty comes from satisfaction|That customers dislike effort|That firms spend too little|1
?According to the speaker, what best predicts repeat business?|Exceeding expectations|Low prices|How little effort customers must make|Attractive advertising|2
@10|2
I can't help feeling the restructuring was rather a missed opportunity. || 今回の再編は、どうも好機を逃したように思えてなりません。 | I'll help you restructure it. | You're not alone; it merely rearranged the furniture. | The opportunity arrives tomorrow. | 1 | あなただけではありませんよ。あれは家具を並べ替えただけです。
Would it be presumptuous of me to suggest we revisit the premise altogether? || 前提そのものを見直そうと提案するのは、出すぎたことでしょうか？ | Not in the least—I've had my own doubts. | The premises are on Fifth Avenue. | I presume he suggested it. | 0 | いいえ、少しも。私自身も疑問に思っていました。
So the committee has, in effect, kicked the issue into the long grass? || つまり委員会は、事実上、問題を先送りしたということですか？ | The grass needs cutting. | They kicked off at three. | That's a less charitable reading than mine, but not an inaccurate one. | 2 | 私より手厳しい解釈ですが、不正確ではありませんね。
@10|3|討論番組での会話
M: You've argued that our fixation on innovation is, in your phrase, "a kind of collective amnesia." That's a provocative claim. || あなたは、私たちのイノベーションへの執着は、あなたの言葉を借りれば「一種の集団的健忘症」だと論じておられます。挑発的な主張ですね。
W: It's meant to be. We lavish attention on whatever is new and almost none on the unglamorous business of keeping existing things working. Yet most of what sustains daily life—water mains, power grids, bridges—is old, and it's maintained, not invented. || そのつもりです。私たちは新しいものには惜しみなく注目し、既存のものを動かし続けるという地味な仕事にはほとんど目を向けません。けれども、日常生活を支えているもののほとんど、つまり水道本管、送電網、橋は古いもので、発明されるのではなく、維持されているのです。
M: Surely, though, without innovation we'd have had none of those things in the first place? || とはいえ、イノベーションがなければ、そもそもそれらは存在しなかったのでは？
W: Granted. I'm not disparaging invention; I'm objecting to the lopsidedness. We celebrate the entrepreneur who launches a product and overlook the engineer who has kept a system from failing for thirty years. One of those is rewarded handsomely. The other becomes visible only when something collapses. || そのとおりです。私は発明をけなしているのではなく、偏りに異議を唱えているのです。私たちは製品を世に出す起業家をたたえ、30年間システムを故障させずにきた技術者を見過ごします。一方は手厚く報われます。もう一方は、何かが崩壊したときに初めて目に見えるようになるのです。
M: So what would redress the balance? || では、何がその均衡を正すのでしょうか？
W: Budgets, frankly. Deferred maintenance is the easiest line to cut precisely because its consequences fall on someone else's watch. || 率直に言って、予算です。先送りされた保守がいちばん削りやすい項目であるのは、まさにその結果が誰か別の人の任期中に降りかかるからです。
#fixation|執着
#amnesia|健忘症
#provocative|挑発的な
#lavish|惜しみなく与える
#sustain|支える
#granted|確かにそうだが
#disparage|けなす
#lopsidedness|偏り
#handsomely|手厚く・気前よく
#redress|正す・是正する
#deferred|先送りされた
#on someone's watch|〜の任期中・監督下で
?What is the woman's central criticism?|Innovation is harmful.|Maintenance is neglected relative to innovation.|Engineers are overpaid.|Infrastructure is too old to repair.|1
?Why, according to the woman, is maintenance spending easy to cut?|It is rarely needed.|Entrepreneurs oppose it.|Its consequences appear later, under someone else.|It produces no benefit.|2
@10|4|大学での講義
N: Let me close with a caution about the word "natural," which does a suspicious amount of work in arguments of this kind. || 最後に、「自然な」という言葉について注意を述べて締めくくります。この種の議論で、この言葉は怪しいほど多くの役割を担っています。
N: To describe an arrangement as natural is seldom merely to describe it; it is, more often than not, to place it beyond the reach of criticism. || ある仕組みを自然だと述べることは、単なる描写であることはめったにありません。たいていの場合、それを批判の届かないところに置くことなのです。
N: What is natural, the implication runs, could not have been otherwise, and what could not have been otherwise it is idle to deplore. || 自然なものは、それ以外ではありえなかった、そして、それ以外ではありえなかったものを嘆いても無駄だ、という含みがあるのです。
N: But the historical record is unkind to such claims. || しかし、歴史の記録は、そうした主張に好意的ではありません。
N: Institutions that one generation took to be woven into the fabric of things have repeatedly been dismantled by the next, and without the heavens falling. || ある世代が物事の本質に織り込まれていると考えた制度は、次の世代によってくり返し解体されてきました。それで天が落ちてくることもなく。
N: I am not suggesting that nothing is fixed, only that the burden of proof lies with whoever asserts that it is. || 何も固定されていないと言っているのではありません。固定されていると主張する側に立証責任がある、と言っているだけです。
N: When you next encounter the word in an argument, ask yourself what it is being asked to conceal. || 次に議論の中でこの言葉に出会ったら、それが何を隠すよう求められているのか、自分に問いかけてみてください。
#caution|注意・警告
#more often than not|たいていの場合
#implication|含み・含意
#idle|無駄な
#deplore|嘆く・強く非難する
#be woven into the fabric of|〜の本質に織り込まれている
#dismantle|解体する
#burden of proof|立証責任
#assert|主張する
#encounter|出会う
?What is the lecturer's main point about the word "natural"?|It is always used accurately.|It often shields things from criticism.|It should be banned from debate.|It has no meaning.|1
?Who, according to the lecturer, bears the burden of proof?|Those who criticize institutions|Historians|Those who claim something is fixed|The next generation|2
`;
// レベル診断（各レベル2問）
const EN_PLACE=[
 [1,'I ___ a student.',['am','is','are','be'],0],[1,'She ___ tennis every day.',['play','plays','playing','to play'],1],
 [2,'I ___ TV when my mother came home.',['watch','am watching','was watching','will watch'],2],[2,'This book is ___ than that one.',['interesting','more interesting','most interesting','the interesting'],1],
 [3,'The language ___ in Brazil is Portuguese.',['speaking','spoke','speaks','spoken'],3],[3,'I have lived here ___ 2015.',['for','since','from','during'],1],
 [4,'If I ___ you, I would accept the offer.',['am','were','will be','have been'],1],[4,'The meeting has been ___ until next Friday.',['postponed','prevented','pretended','preserved'],0],
 [5,'___ the heavy rain, the game was not canceled.',['Although','Despite','Because','However'],1],[5,'The store decided to ___ its prices to attract more customers.',['reduce','refuse','regret','resemble'],0],
 [6,'Had I known about the delay, I ___ earlier.',['would leave','will leave','would have left','had left'],2],[6,'The new policy will ___ all employees, regardless of position.',['effect','affect','infect','reflect'],1],
 [7,'All employees are required to ___ with the new safety regulations.',['obey','follow','comply','observe'],2],[7,'The contract will be renewed ___ both parties agree to the terms.',['in spite of','owing to','so as to','provided that'],3],
 [8,'The merger is ___ on approval from the regulators.',['consistent','contingent','content','contiguous'],1],[8,'Seldom ___ such a rapid shift in consumer behavior.',['we have seen','we saw','have we seen','we did see'],2],
 [9,'The auditor found several ___ between the reported figures and the receipts.',['discretions','dispositions','disruptions','discrepancies'],3],[9,'The proposal was rejected, its obvious merits ___.',['nevertheless','notwithstanding','whereas','albeit'],1],
 [10,'His ___ remarks, though intended as humor, alienated half the audience.',['facetious','fastidious','fortuitous','felicitous'],0],[10,'The statement was a masterpiece of ___, committing the government to nothing.',['exoneration','emulation','equivocation','exacerbation'],2]
];
function enParse(txt,kind){
  const out=[];let cur=null,qn=1;
  txt.trim().split('\n').forEach(l=>{l=l.trim();if(!l)return;
    if(l[0]==='@'){const p=l.slice(1).split('|');cur={lv:+p[0],sents:[],vocab:[],qs:[],items:[]};
      if(kind==='read'){cur.title=p[1];cur.type=p[2];cur.id='r'+cur.lv+'_'+out.filter(x=>x.lv===cur.lv).length}
      else{cur.part=+p[1];cur.title=p[2]||'';cur.id='l'+cur.lv+'_'+cur.part}
      out.push(cur);return}
    if(l[0]==='#'){const p=l.slice(1).split('|');cur.vocab.push({t:p[0],m:p[1]});return}
    if(l[0]==='?'){const p=l.slice(1).split('|');const k=(p[0].length*3+p[1].length+(qn++))%4,o4=p.slice(1,5),a=+p[5];cur.qs.push({q:p[0],o:o4.map((_,i)=>o4[(i+k)%4]),a:(a-k+4)%4});return}
    if(kind==='lis'&&cur.part===2){const [q,rest]=l.split(' || ');const p=rest.split(' | ');cur.items.push({q,jq:p[0],o:p.slice(1,4),a:+p[4],ja:p[5]});return}
    let [e,j]=l.split(' || ');let s='';
    if(kind==='lis'){const m=e.match(/^([MWN]): (.*)$/);if(m){s=m[1];e=m[2]}}
    cur.sents.push({e,j:j||'',s});
  });
  return out;
}
const EN_R=enParse(EN_READ,'read'),EN_L=enParse(EN_LIS,'lis');
// 共通の仕組みに英語を登録する
(function(){
  const all=[],byT={};
  [...EN_R,...EN_L].forEach(p=>p.vocab.forEach(v=>{if(byT[v.t])return;const it={t:v.t,r:'',m:v.m,n:p.lv,kind:/ /.test(v.t)?'sent':'word'};all.push(it);byT[v.t]=it}));
  DATA.en={name:'英語',lang:'en-US',days:[],deck:[],all,byT,gate:{},stages:[]};
  PLAN.en={banner:'',listen:15,min:{}};
  RES.en=[['VOA Learning English（やさしい英語のニュース）','https://learningenglish.voanews.com/'],['BBC Learning English','https://www.bbc.co.uk/learningenglish'],['YouTube：TOEIC リスニング 練習','https://www.youtube.com/results?search_query=TOEIC+listening+practice']];
  SCEN.en=[
   {id:'intro',icon:'🤝',title:'自己紹介と雑談（Lv1〜）',role:'a friendly person you just met at an international event',desc:'Small talk and self-introduction.',goals:['名前と出身を言う','仕事か学校について言う','趣味を言う','相手に質問する'],drill:[]},
   {id:'order',icon:'☕',title:'カフェで注文（Lv1〜）',role:'a barista at a café',desc:'Ordering food and drink at a café.',goals:['注文する','サイズや好みを伝える','値段を聞く','お礼を言う'],drill:[]},
   {id:'way',icon:'🗺️',title:'道案内をする（Lv3〜）',role:'a tourist visiting Japan who is lost',desc:'A tourist asks the learner for directions to the station and a recommendation for lunch.',goals:['道順を説明する','所要時間を伝える','おすすめの店を紹介する'],drill:[]},
   {id:'phone',icon:'📞',title:'電話で予定を調整（Lv5〜）',role:'a client on the phone',desc:'Business phone call to reschedule a meeting.',goals:['用件を伝える','代わりの日時を提案する','内容を確認して締めくくる'],drill:[]},
   {id:'interview',icon:'💼',title:'就職面接（Lv6〜）',role:'an interviewer at an international company',desc:'Job interview in English.',goals:['経歴を説明する','強みを具体例つきで話す','志望理由を話す','質問をする'],drill:[]},
   {id:'complaint',icon:'🛎️',title:'クレーム対応（Lv7〜）',role:'an unhappy hotel guest',desc:'The learner is hotel staff handling a complaint about a noisy room.',goals:['共感して謝罪する','状況を確認する','解決策を提案する','フォローを約束する'],drill:[]},
   {id:'negotiate',icon:'🤝',title:'価格交渉（Lv8〜）',role:'a purchasing manager at a supplier meeting',desc:'Negotiating price and delivery terms for a bulk order.',goals:['希望条件を提示する','相手の条件に反論する','妥協案を出す','合意内容をまとめる'],drill:[]},
   {id:'debate',icon:'🎙️',title:'社会問題を議論（Lv9〜）',role:'a sharp but fair debate partner who takes the opposite side',desc:'Debate: should companies adopt a four-day workweek? Push back on weak arguments.',goals:['立場を明確に述べる','根拠を2つ挙げる','反論に応じる','結論をまとめる'],drill:[]}
  ];
  TOPICS.en=['自己紹介','私の一日','最近読んだ本・見た映画','自分の仕事（学校）の説明','最近のニュースについての意見','リモートワークの是非','10年後の自分'];
  STORY_TOPICS.en=['A day off','At the office','A small mistake','A trip','A new neighbor'];
  EAR.en=[
   {id:'rl',name:'r / l',note:'r は舌をどこにもつけない。l は舌先を上の歯ぐきにつける。',items:[['right','ライト','右・正しい（r）'],['light','ライト','光・軽い（l）'],['rice','ライス','米（r）'],['lice','ライス','シラミ（l）']]},
   {id:'bv',name:'b / v',note:'v は上の歯を下唇に軽く当てて出す。',items:[['berry','ベリー','ベリー（b）'],['very','ベリー','とても（v）'],['best','ベスト','最高の（b）'],['vest','ベスト','ベスト（v）']]},
   {id:'sth',name:'s / th',note:'th は舌先を歯の間に軽くはさむ。',items:[['sink','シンク','沈む（s）'],['think','シンク','考える（th）'],['mouse','マウス','ネズミ（s）'],['mouth','マウス','口（th）']]},
   {id:'ae',name:'a / u（hat / hut）',note:'hat は口を横に開く「ア」、hut は短く口をあまり開けない「ア」。',items:[['hat','ハット','帽子'],['hut','ハット','小屋'],['cap','キャップ','帽子'],['cup','カップ','カップ']]},
   {id:'ii',name:'i / ee（ship / sheep）',note:'ship は短く力を抜いた「イ」、sheep は長く口を横に引いた「イー」。',items:[['ship','シップ','船'],['sheep','シープ','羊'],['live','リブ','住む'],['leave','リーブ','去る']]},
   {id:'wk',name:'work / walk',note:'work は口をあまり開けずこもった音、walk は口を縦に開けた「オー」。',items:[['work','ワーク','働く'],['walk','ウォーク','歩く'],['bird','バード','鳥'],['bored','ボード','退屈した']]}
  ];
})();
