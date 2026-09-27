# -*- coding: utf-8 -*-
"""教程页 124 个整块的译文，按 _blocks.json 的索引。生成 _d_tutorial.js"""

T = {}
def add(i, en, ja, ko):
    T[i] = (en, ja, ko)

# ---- 导航 / 标题 ----
add(1, 'Weiqi Tutorial', '囲碁入門ガイド', '바둑 입문 가이드')
add(2, 'Life &amp; Death · Records', '詰碁・棋譜並べ', '사활문제 · 기보')
add(3, 'Play', '対局へ', '대국하기')
add(4, 'Contents', '目次', '목차')
add(5, '1. Three-minute intro', '1. 3分でわかる基本', '1. 3분 입문')
add(6, '2. Liberties: a stone\'s life', '2. 呼吸点：石の命', '2. 활로: 돌의 목숨')
add(7, '3. Capturing', '3. 石を取る', '3. 따내기')
add(8, '4. Connecting and cutting', '4. つなぎと切り', '4. 연결과 절단')
add(9, 'Connect', 'つなぐ', '연결')
add(10, 'Cut', '切る', '절단')
add(11, '5. Eyes and life', '5. 眼と生き', '5. 두 눈과 삶')
add(12, '6. Four capturing techniques', '6. 取りの四大テクニック', '6. 따내기 네 가지 기술')
add(13, '7. Ko', '7. コウ', '7. 패')
add(14, '8. Opening basics', '8. 布石の基本', '8. 포석 기초')
add(15, '9. Ending and counting', '9. 終局と計算', '9. 종국과 집 계산')
add(16, '10. Tips for teaching kids', '10. 子どもと学ぶコツ', '10. 아이와 바둑 두는 법')
add(17, 'Learn Go with your child', '子どもと一緒に囲碁を', '아이와 함께 바둑을')
add(18, 'For parents starting from zero. Read these 10 sections in order and you can finish a whole game with your child.',
    'まったくの初心者の親御さん向け。この10章を順に読めば、お子さんと一局打ち切れます。',
    '바둑을 전혀 모르는 부모님을 위한 안내. 이 10개 장을 순서대로 읽으면 아이와 한 판을 끝까지 둘 수 있습니다.')

# ---- 1. 三分钟入门 ----
add(19, '<span class="num">1</span>Three-minute intro',
    '<span class="num">1</span>3分でわかる基本',
    '<span class="num">1</span>3분 입문')
add(20, 'Go has astonishingly few rules but endless variation. Learn these four and you can start playing:',
    '囲碁のルールは驚くほど少ないのに、変化は無限です。まずこの4つを覚えれば打てます：',
    '바둑은 규칙이 놀랄 만큼 적지만 변화는 무궁무진합니다. 이 네 가지만 알면 바로 둘 수 있습니다:')
add(21, 'Play on the <b>intersections</b>, not inside the squares.',
    '<b>線の交差点</b>に打ちます。マスの中ではありません。',
    '<b>교차점</b>에 둡니다. 칸 안이 아닙니다.')
add(22, '<b>Black plays first, then White</b> — one move each, taking turns.',
    '<b>黒が先、次に白</b>。一手ずつ交互に打ちます。',
    '<b>흑이 먼저, 백이 다음</b> — 한 수씩 번갈아 둡니다.')
add(23, 'Once placed, <b>a stone never moves</b> (unless it is captured and removed).',
    '置いた石は<b>動かせません</b>（相手に取られて取り除かれる場合を除く）。',
    '한번 놓은 돌은 <b>움직일 수 없습니다</b> (상대에게 잡혀 들어내는 경우 제외).')
add(24, '<b>Whoever surrounds more territory wins.</b>',
    '<b>より広い地を囲んだ方が勝ちです。</b>',
    '<b>더 많은 집을 둘러싼 쪽이 이깁니다.</b>')
add(25, 'Black first, then White, taking turns on the intersections. Numbers show the order of play.',
    '黒から白へ、交差点に交互に打ちます。数字は着手順です。',
    '흑부터 백까지 교차점에 번갈아 둡니다. 숫자는 착수 순서입니다.')
add(26, '<b>Tell your child this:</b> "The board is an empty field. We take turns building fences to claim land. Whoever fences in more land wins."',
    '<b>お子さんにはこう伝えましょう：</b>「盤は空き地。交代で塀を立てて土地を囲むんだよ。広く囲めた方が勝ち。」',
    '<b>아이에게 이렇게 말해 주세요:</b> "바둑판은 빈 땅이야. 번갈아 울타리를 세워 땅을 차지하는 거야. 더 많이 둘러싼 사람이 이겨."')

# ---- 2. 气 ----
add(27, '<span class="num">2</span>Liberties: a stone\'s life',
    '<span class="num">2</span>呼吸点：石の命', '<span class="num">2</span>활로: 돌의 목숨')
add(28, 'The empty points directly <b>above, below, left and right</b> of a stone are its "<b>liberties</b>". Diagonals do not count.',
    '石に<b>上下左右</b>で接する空点を、その石の「<b>呼吸点（ダメ）</b>」といいます。斜めは数えません。',
    '돌의 <b>위·아래·왼쪽·오른쪽</b>에 바로 붙은 빈 점이 그 돌의 "<b>활로</b>"입니다. 대각선은 포함되지 않습니다.')
add(29, 'How many liberties a stone has depends on where it sits:',
    '石の呼吸点の数は、置かれた場所で変わります：',
    '돌의 활로 수는 어디에 놓였는지에 따라 달라집니다:')
add(30, 'A stone <b>in the middle</b>: <b>4 liberties</b>',
    '<b>中央</b>の石：<b>4呼吸点</b>', '<b>중앙</b>의 돌: <b>활로 4개</b>')
add(31, 'A stone <b>on the side</b>: <b>3 liberties</b>',
    '<b>辺</b>の石：<b>3呼吸点</b>', '<b>변</b>의 돌: <b>활로 3개</b>')
add(32, 'A stone <b>in the corner</b>: only <b>2 liberties</b>',
    '<b>隅</b>の石：たった<b>2呼吸点</b>', '<b>귀</b>의 돌: 단 <b>활로 2개</b>')
add(33, 'Connected stones share their liberties',
    'つながった石は呼吸点を共有します', '연결된 돌은 활로를 공유합니다')
add(34, 'Two (or more) <b>touching</b> stones of the same colour form one group, and their liberties are counted together.',
    '<b>隣接</b>した同色の石は一つの塊になり、呼吸点はまとめて数えます。',
    '<b>맞닿은</b> 같은 색 돌은 한 덩어리가 되어 활로를 합쳐서 셉니다.')
add(35, 'Two connected white stones share <b>6 liberties</b> (not 4)',
    'つながった白2子の呼吸点は<b>6つ</b>（4つではない）',
    '연결된 백 두 점의 활로는 <b>6개</b> (4개가 아닙니다)')
add(36, '<b>This is the most important idea in Go.</b> Every capture, escape and enclosure revolves around liberties. Once your child understands "liberties", they are halfway in.',
    '<b>これが囲碁で一番大切な考え方です。</b>取り、逃げ、囲い、すべて呼吸点が関わります。お子さんが「呼吸点」を理解すれば、もう半分入門したようなものです。',
    '<b>이것이 바둑에서 가장 중요한 개념입니다.</b> 따내기, 도망, 집 만들기 모두 활로와 연결됩니다. 아이가 "활로"를 이해하면 절반은 들어온 것입니다.')

# ---- 3. 吃子 ----
add(37, '<span class="num">3</span>Capturing: taking stones off the board',
    '<span class="num">3</span>石を取る：相手の石を盤から外す',
    '<span class="num">3</span>따내기: 상대 돌을 들어내기')
add(38, 'When a group\'s <b>liberties are all filled</b> (0 left), it is <b>captured</b> — removed from the board and kept as the opponent\'s prisoners.',
    '塊の<b>呼吸点がすべて埋まると</b>（0になると）、その塊は<b>取られて</b>盤から外され、相手のアゲハマになります。',
    '한 덩어리의 <b>활로가 모두 막히면</b>(0개), 그 돌은 <b>따내져</b> 판에서 들어내고 상대의 사로잡은 돌이 됩니다.')
add(39, 'White has 2 liberties left (circled)', '白は残り2呼吸点（丸印）', '백은 활로가 2개 남았습니다 (동그라미)')
add(40, 'Black fills one more — White has 1 liberty left. This is called <b>atari</b>.',
    '黒がもう一つ塞ぐと、白は残り1呼吸点。これが「<b>アタリ</b>」です。',
    '흑이 하나 더 막으면 백은 활로 1개. 이것을 <b>단수</b>라고 합니다.')
add(41, 'Black fills the last liberty — White is <b>captured</b>, leaving an empty point.',
    '黒が最後の呼吸点を塞ぐと、白は<b>取られて</b>空点が一つできます。',
    '흑이 마지막 활로를 막으면 백은 <b>따내져</b> 빈 점이 하나 생깁니다.')
add(42, 'Two iron rules', '二つの鉄則', '두 가지 철칙')
add(43, '<b>No suicide:</b> if a move leaves your own group with no liberties and captures nothing, it is illegal.',
    '<b>自殺手は禁止：</b>自分の塊の呼吸点がなくなり、相手も取れない手は打てません。',
    '<b>자충수 금지:</b> 자기 덩어리에 활로가 없어지고 상대도 못 따내는 수는 둘 수 없습니다.')
add(44, '<b>Capturing takes priority:</b> if your move captures the opponent, it is <b>not</b> suicide even if your own stone has only one liberty left.',
    '<b>取りが優先：</b>相手を取れる手なら、自分の石が残り1呼吸点でも自殺には<b>なりません</b>。',
    '<b>따내기가 우선:</b> 상대를 따낼 수 있다면 자기 돌의 활로가 1개여도 자충수가 <b>아닙니다</b>.')
add(45, '<b>Practice game:</b> on a 9×9 board let your child play Black. Place a few white stones with only one liberty and ask them to find the atari. Praise every correct answer and interest grows fast.',
    '<b>練習法：</b>9路盤でお子さんに黒を持たせ、呼吸点が1つの白石をいくつか置いて「アタリ」を探させましょう。正解するたびに褒めれば、どんどん興味が湧きます。',
    '<b>연습 놀이:</b> 9줄 판에서 아이가 흑을 잡게 하고, 활로가 1개뿐인 백돌을 몇 개 놓아 "단수"를 찾게 하세요. 맞힐 때마다 칭찬하면 흥미가 확 올라갑니다.')

# ---- 4. 连接与分断 ----
add(46, '<span class="num">4</span>Connecting and cutting',
    '<span class="num">4</span>つなぎと切り', '<span class="num">4</span>연결과 절단')
add(47, 'If two groups are cut apart they must fight alone with fewer liberties, and are easily captured. So: <b>connect what should be connected, cut what should be cut</b>.',
    '二つの塊が切り離されると、それぞれ孤立して呼吸点も減り、取られやすくなります。つまり：<b>つなぐべきはつなぎ、切るべきは切る</b>。',
    '두 덩어리가 잘리면 각자 싸워야 하고 활로도 줄어 잡히기 쉽습니다. 그래서: <b>이을 것은 잇고, 끊을 것은 끊습니다</b>.')
add(48, 'Two white groups are separated — the gap between them is a cutting point.',
    '白の二つの塊が分かれています。間が切断点です。',
    '백 두 덩어리가 떨어져 있습니다. 사이가 절단점입니다.')
add(49, 'White plays between them → <b>one group</b>, liberties counted together.',
    '白が間に打つと → <b>一つの塊</b>になり、呼吸点をまとめて数えます。',
    '백이 사이에 두면 → <b>한 덩어리</b>가 되어 활로를 합쳐 셉니다.')
add(50, 'Black takes the key point first — White is <b>cut in two</b> and both parts become weak.',
    '黒が先に要点を占めると、白は<b>上下に分断</b>され、両方とも弱くなります。',
    '흑이 먼저 요점을 차지하면 백은 <b>위아래로 절단</b>되어 둘 다 약해집니다.')
add(51, '<b>Sayings:</b> "Fights begin at the cutting points." When you see a gap in the opponent\'s shape, it is like a loose thread on clothing — one pull and it opens.',
    '<b>格言：</b>「碁は切りから生まれる」。相手の形に切れ目があれば、服のほつれ糸のようなもの。引けばほどけます。',
    '<b>격언:</b> "싸움은 끊는 곳에서 시작된다." 상대 모양에 틈이 보이면 옷의 실밥과 같아서 한 번 당기면 풀립니다.')

# ---- 5. 做眼与活棋 ----
add(52, '<span class="num">5</span>Eyes and life',
    '<span class="num">5</span>眼と生き', '<span class="num">5</span>두 눈과 삶')
add(53, 'Territory is the goal, but <b>first make sure you cannot be captured</b>. Whether a group lives is decided by whether it has <b>two real eyes</b>.',
    '地を囲むのが目的ですが、<b>まず取られないことが大事</b>。塊が生きるかどうかは<b>二つの本眼</b>があるかで決まります。',
    '집을 만드는 것이 목적이지만 <b>먼저 잡히지 않아야 합니다</b>. 덩어리가 사는지는 <b>두 개의 진짜 눈</b>이 있는지로 결정됩니다.')
add(54, 'What is an eye?', '眼とは？', '눈이란?')
add(55, 'An empty point <b>surrounded on all four sides</b> by your own stones is an "eye". The opponent cannot play inside it (that would be suicide) unless the move captures you.',
    '自分の石に<b>四方を囲まれた</b>空点が「眼」です。相手は眼の中に打てません（自殺手になるため）。ただしあなたを取れる場合は別です。',
    '자기 돌로 <b>사방이 둘러싸인</b> 빈 점이 "눈"입니다. 상대는 눈 안에 둘 수 없습니다(자충수). 단, 당신을 따낼 수 있다면 예외입니다.')
add(56, 'White has made <b>1 eye</b>. Black can tighten from outside, then fill it and capture White.',
    '白は<b>眼が1つ</b>。黒は外から締め、最後に填めて白を取れます。',
    '백은 <b>눈이 1개</b>. 흑이 바깥에서 조인 뒤 메우면 백을 잡을 수 있습니다.')
add(57, 'White has made <b>2 eyes</b>. <b>It can never be captured — this is called "alive".</b>',
    '白は<b>眼が2つ</b>。<b>もう取られることはありません。これを「生き」といいます。</b>',
    '백은 <b>눈이 2개</b>. <b>절대 잡히지 않습니다. 이것이 "사는 것"입니다.</b>')
add(58, 'Why are two eyes unkillable?', 'なぜ二つの眼なら死なない？', '두 눈이면 왜 죽지 않을까?')
add(59, 'Because the opponent <b>can only play one move at a time</b>. If they fill your left eye, you still have a liberty on the right; if they fill the right eye, the left one comes alive again. They can never block both at once.',
    '相手は<b>一度に一手しか打てない</b>からです。左の眼を埋めても右に呼吸点が残り、右を埋めても左の眼が生き返ります。同時に両方は塞げません。',
    '상대는 <b>한 번에 한 수만 둘 수 있기</b> 때문입니다. 왼쪽 눈을 메워도 오른쪽에 활로가 남고, 오른쪽을 메우면 왼쪽 눈이 다시 살아납니다. 동시에 둘 다 막을 수 없습니다.')
add(60, '<b>Note:</b> the two eyes must be <b>real eyes</b>. If an eye is false (the opponent can legally play inside it to put you in atari), it does not count.',
    '<b>注意：</b>二つの眼は<b>「本眼」</b>でなければなりません。欠け眼（相手が合法に打ち込んでアタリにできる）は数えません。',
    '<b>주의:</b> 두 눈은 반드시 <b>진짜 눈</b>이어야 합니다. 가짜 눈(상대가 합법적으로 들어와 단수할 수 있는 곳)은 인정되지 않습니다.')
add(61, '<b>For beginners, one sentence is enough:</b> "When surrounded, try to make two eyes and you are safe."',
    '<b>初級のうちは、この一言だけで十分：</b>「囲まれたら、二つの眼を作れば安全」',
    '<b>초급 단계에서는 한 마디면 충분합니다:</b> "둘러싸이면 두 눈을 만들면 안전해."')

# ---- 6. 吃子四大技巧 ----
add(62, '<span class="num">6</span>Four capturing techniques',
    '<span class="num">6</span>取りの四大テクニック', '<span class="num">6</span>따내기 네 가지 기술')
add(63, '(1) Atari', '(1) アタリ', '(1) 단수')
add(64, 'Drive an opponent group down to one liberty. This is the most basic attacking tool, and the opponent must answer it.',
    '相手の塊を呼吸点1つまで追い込みます。最も基本的な攻めで、相手は必ず応じなければなりません。',
    '상대 덩어리를 활로 1개로 몰아갑니다. 가장 기본적인 공격이며 상대는 반드시 응수해야 합니다.')
add(65, '(2) Ladder (shicho)', '(2) シチョウ', '(2) 축')
add(66, 'When an opponent group has only two liberties, keep playing atari and drive it all the way to the edge to capture it. This is the trick beginners lose the most to.',
    '相手の塊の呼吸点が2つのとき、連続でアタリを打ち、端まで追い詰めて取ります。初心者が最も損をしやすい手筋です。',
    '상대 덩어리의 활로가 2개일 때 계속 단수를 걸어 변까지 몰아 잡습니다. 초보자가 가장 많이 당하는 수법입니다.')
add(67, 'White has 1 liberty left (red circle). It can only run that way; Black keeps playing atari and White is chased to the edge and captured.',
    '白は残り1呼吸点（赤丸）。そこへ逃げるしかなく、黒がアタリを続けて端まで追い詰めて取ります。',
    '백은 활로가 1개(빨간 원). 그쪽으로 도망칠 수밖에 없고, 흑이 계속 단수를 걸어 변까지 몰아 잡습니다.')
add(68, '<b>Important:</b> before starting a ladder, read it out — if White has a friendly stone on the escape route, Black collapses. Easy to see on 9×9, but be careful on 19×19.',
    '<b>重要：</b>シチョウを始める前に必ず読み切ること。逃げ道に白の援軍があると黒が崩れます。9路盤なら見やすいですが、19路盤は注意。',
    '<b>중요:</b> 축을 걸기 전에 반드시 읽어야 합니다. 도망길에 백의 응원 돌이 있으면 흑이 무너집니다. 9줄은 보기 쉽지만 19줄은 조심하세요.')
add(69, '(3) Net (geta)', '(3) ゲタ', '(3) 씌움(네트)')
add(70, 'Instead of playing right next to the group, <b>block the escape route from outside</b>. More solid than a ladder and safe even if the opponent has support.',
    'ぴったり付かずに、外から<b>逃げ道を封じます</b>。シチョウより堅く、相手に援軍がいても安全です。',
    '바로 붙지 않고 바깥에서 <b>도망길을 막습니다</b>. 축보다 튼튼하고 상대 응원이 있어도 안전합니다.')
add(71, 'Black "surrounds" with (4,6) and (6,5) — White cannot escape. This is the net.',
    '黒が (4,6)、(6,5) と「囲う」と白は逃げられません。これがゲタです。',
    '흑이 (4,6), (6,5)로 "둘러싸면" 백은 도망칠 수 없습니다. 이것이 씌움입니다.')
add(72, '(4) Snapback', '(4) ウッテガエシ', '(4) 되치기')
add(73, 'Deliberately give the opponent a stone to take; after they capture it, you take their whole group back.',
    'わざと相手に石を取らせ、取った後に相手の塊ごと取り返します。',
    '일부러 상대에게 돌을 주고, 상대가 따낸 뒤 그 덩어리를 통째로 되따냅니다.')
add(74, 'White plays the red circle and captures two black stones — but then White has only one liberty, and Black plays (4,4) to take everything back. This is the <b>snapback</b>.',
    '白が赤丸に打てば黒2子を取れますが、取った後は呼吸点が1つ。黒が (4,4) に打てば白を丸ごと取り返します。これが<b>ウッテガエシ</b>です。',
    '백이 빨간 원에 두면 흑 2점을 따내지만, 그 뒤 백은 활로가 1개. 흑이 (4,4)에 두면 백을 통째로 되따냅니다. 이것이 <b>되치기</b>입니다.')

# ---- 7. 打劫 ----
add(75, '<span class="num">7</span>Ko', '<span class="num">7</span>コウ', '<span class="num">7</span>패')
add(76, 'Go has a special shape: <b>both sides can capture the same single stone back and forth forever</b>. This is called "ko".',
    '囲碁には特別な形があります：<b>互いに同じ一子を取り合って無限に繰り返せる</b>。これが「コウ」です。',
    '바둑에는 특별한 모양이 있습니다: <b>양쪽이 같은 한 점을 주고받으며 끝없이 되따낼 수 있는</b> 형태. 이것이 "패"입니다.')
add(77, 'Black plays (4,5) and takes White (4,4); then White can play (4,4) and take Black (4,5)… forever.',
    '黒が (4,5) に打って白 (4,4) を取り、次に白が (4,4) に打って黒 (4,5) を取る……これが無限に続きます。',
    '흑이 (4,5)에 두어 백 (4,4)를 따내고, 다시 백이 (4,4)에 두어 흑 (4,5)를 딸 수 있습니다… 끝없이.')
add(78, 'Rule: you cannot recapture immediately',
    'ルール：すぐには取り返せない', '규칙: 바로 되따낼 수 없습니다')
add(79, 'The side that was captured <b>cannot recapture at the same point immediately</b>. They must first play <b>somewhere else on the board</b>; if the opponent answers, then they may take the ko back.',
    '取られた側は<b>すぐに同じ場所で取り返せません</b>。まず盤の<b>別の場所に一手</b>打つ必要があり、相手が応じたら次に取り返せます。',
    '따낸 쪽은 <b>즉시 같은 자리에서 되따낼 수 없습니다</b>. 먼저 <b>판의 다른 곳에 한 수</b> 두어야 하고, 상대가 응수하면 그다음 되따낼 수 있습니다.')
add(80, 'So in real games a ko becomes a battle of <b>ko threats</b>: I play a threat, if you ignore it I retake the ko; if you answer, I take the ko back. Whoever has more ko threats wins the ko.',
    'ですから実戦では、コウは<b>コウ材</b>の勝負になります。私が脅しを打ち、あなたが無視すればコウを取り返す。応じれば私がまた取り返す。コウ材が多い方がコウに勝ちます。',
    '그래서 실전에서 패는 <b>팻감</b> 싸움이 됩니다. 내가 팻감을 쓰고, 상대가 무시하면 패를 되따내고, 응수하면 다시 패를 되따냅니다. 팻감이 많은 쪽이 패를 이깁니다.')
add(81, '<b>For beginners:</b> you can leave ko for later. Just remember "no immediate recapture — play elsewhere first". Our practice board blocks illegal recaptures automatically.',
    '<b>初心者の方へ：</b>コウは後回しで構いません。「すぐ取り返さず、まず別所に打つ」だけ覚えれば十分。練習盤は違反の取り返しを自動で防ぎます。',
    '<b>초보자에게:</b> 패는 나중에 배워도 됩니다. "즉시 되따내기 금지, 먼저 다른 곳에 두기"만 기억하세요. 연습판은 규칙 위반을 자동으로 막아 줍니다.')

# ---- 8. 布局 ----
add(82, '<span class="num">8</span>Opening basics: corners first',
    '<span class="num">8</span>布石の基本：まず隅から', '<span class="num">8</span>포석 기초: 먼저 귀')
add(83, 'Where should you play on an empty board? Remember this saying:',
    '空盤ではどこから打つべきか。この格言を覚えましょう：',
    '빈 판에서는 어디부터 둘까요? 이 격언을 기억하세요:')
add(84, 'Corners are gold · sides are silver · the centre is straw',
    '隅は金 · 辺は銀 · 中腹は草', '귀는 금 · 변은 은 · 중앙은 풀')
add(85, 'The <b>corner</b> is worth the most: two board edges act as free walls, so very few stones enclose the same area.',
    '<b>隅</b>が一番得：盤の辺が二本、ただの壁になります。同じ地を少ない石で囲めます。',
    '<b>귀</b>가 가장 이득: 판의 두 변이 공짜 벽이 되어 같은 집을 훨씬 적은 돌로 둘러쌀 수 있습니다.')
add(86, 'The <b>side</b> comes next: only one edge helps you.',
    '<b>辺</b>が次：味方は辺が一本だけです。',
    '<b>변</b>이 다음: 도와주는 변이 하나뿐입니다.')
add(87, 'The <b>centre</b> costs the most stones: you must surround it on all sides yourself — the least efficient.',
    '<b>中腹</b>が最も石を使います：四方すべて自分で囲まねばならず、効率が最悪です。',
    '<b>중앙</b>은 돌이 가장 많이 듭니다: 사방을 모두 스스로 둘러싸야 해서 효율이 가장 나쁩니다.')
add(88, 'Star points on a 19×19 board. In the opening, take corners first (circles), then extend along the sides.',
    '19路盤の星。序盤はまず隅（丸印）を占め、それから辺へ広がります。',
    '19줄 판의 화점. 초반에는 먼저 귀(동그라미)를 차지하고, 그다음 변으로 넓혀 갑니다.')
add(89, 'Basic opening order', '序盤の基本手順', '초반의 기본 순서')
add(90, '<b>Take an empty corner</b>: a star point or a komoku both work.',
    '<b>空き隅を占める</b>：星でも小目でも構いません。',
    '<b>빈 귀를 차지</b>: 화점이든 소목이든 좋습니다.')
add(91, '<b>Approach or enclose</b>: share the opponent\'s corner, or reinforce your own.',
    '<b>掛かり / 締まり</b>：相手の隅に割り込むか、自分の隅を固めます。',
    '<b>걸침 / 굳힘</b>: 상대 귀에 다가가거나 자기 귀를 굳힙니다.')
add(92, '<b>Extend along the side</b>: spread out and link your territory into a whole.',
    '<b>ヒラキ</b>：辺へ広げ、地を一つにつなげます。',
    '<b>벌림</b>: 변으로 넓혀 집을 하나로 잇습니다.')
add(93, 'Then the middle-game fighting begins.', 'その後、中盤の戦いに入ります。',
    '그다음 중반의 싸움이 시작됩니다.')
add(94, 'Which line should you play on?', '何線に打つ？', '몇 선에 둘까?')
add(95, 'The <b>second line</b>: too low — small territory, easily pressed down.',
    '<b>二線</b>：低すぎます。目先の小地だけ。押さえ込まれやすい。',
    '<b>둘째 선</b>: 너무 낮습니다. 눈앞의 작은 집만, 눌리기 쉽습니다.')
add(96, 'The <b>third line</b>: good for territory, commonly used.',
    '<b>三線</b>：地を守るのに良く、よく使われます。',
    '<b>셋째 선</b>: 집을 지키기 좋아 자주 씁니다.')
add(97, 'The <b>fourth line</b>: good for development, commonly used.',
    '<b>四線</b>：発展に良く、よく使われます。',
    '<b>넷째 선</b>: 발전에 좋아 자주 씁니다.')
add(98, 'The <b>fifth line and above</b>: too loose — easy to end up with nothing.',
    '<b>五線以上</b>：あまりに漠然として、空振りになりやすい。',
    '<b>다섯째 선 이상</b>: 너무 허허해져 헛돌기 쉽습니다.')
add(99, 'When starting 9×9 games, just take star points and open points near the centre — no need to overthink it.',
    '9路盤のうちは、星と中腹寄りの広い点を取れば十分。あまり悩まなくて大丈夫です。',
    '9줄을 처음 둘 때는 화점과 중앙 근처의 넓은 점을 차지하면 충분합니다. 너무 고민하지 마세요.')

# ---- 9. 终局与数子 ----
add(100, '<span class="num">9</span>Ending and counting',
    '<span class="num">9</span>終局と計算', '<span class="num">9</span>종국과 집 계산')
add(101, 'When does the game end? When no worthwhile points remain, both sides may <b>pass in succession</b> to signal the end.',
    'いつ終わるのか。もう価値のある点がなくなったら、双方が<b>連続でパス</b>して終局を知らせます。',
    '언제 끝날까요? 더 둘 만한 곳이 없으면 양쪽이 <b>연속으로 패스</b>해 종료를 알립니다.')
add(102, 'How to decide the winner', '勝敗の決め方', '승패를 가리는 법')
add(103, 'The most intuitive is <b>area scoring</b> (Chinese rules):',
    '最も分かりやすいのは<b>数子法</b>（中国ルール）です：',
    '가장 직관적인 것은 <b>집 계산법</b>(중국 룰)입니다:')
add(104, '<b>First remove the dead stones.</b> Both sides agree on which stones cannot be saved; they are removed and counted for the other side.',
    '<b>まず死に石を取ります。</b>双方が救えない石を確認し、取り除いて相手のものにします。',
    '<b>먼저 죽은 돌을 들어냅니다.</b> 양쪽이 살릴 수 없는 돌을 확인해 들어내고 상대 것으로 계산합니다.')
add(105, '<b>Count your own stones plus the empty points you surround</b> — the total is your territory.',
    '<b>自分の石と、自分が囲んだ空点を数えます</b>。合計があなたの地です。',
    '<b>자기 돌과 자기가 둘러싼 빈 점을 셉니다</b>. 합계가 당신의 집입니다.')
add(106, 'Whoever has more wins.', '多い方が勝ちです。', '많은 쪽이 이깁니다.')
add(107, '<b>White gets komi.</b> Because Black moves first and gains an advantage, White receives an extra 6.5 points at the end.',
    '<b>白にはコミがあります。</b>黒が先に打つ分有利なので、最後に白へ 6.5 目を加えます。',
    '<b>백에게는 덤이 있습니다.</b> 흑이 먼저 두어 유리하므로 마지막에 백에게 6.5집을 더합니다.')
add(108, 'Black surrounds 5 empty points in the upper left (small circles) → those 5 points count for Black; plus Black\'s own stones, that is Black\'s territory.',
    '左上で黒が5つの空点（小丸）を囲んでいます → この5目は黒のもの。黒の石と合わせて黒の地になります。',
    '왼쪽 위에서 흑이 빈 점 5개(작은 원)를 둘러쌌습니다 → 이 5집은 흑 것입니다. 흑의 돌과 합치면 흑의 집이 됩니다.')
add(109, 'The practice board has an <b>End &amp; count</b> button — one tap counts everything for you and tells you who won and by how much.<br>\n        <b>Tip:</b> clear obvious dead stones off the board first, or the count will be wrong.',
    '練習盤には「<b>終局して計算</b>」ボタンがあり、押すと自動で数えて勝敗と目数を教えてくれます。<br>\n        <b>ヒント：</b>明らかな死に石は先に取っておかないと計算を間違えます。',
    '연습판에는 <b>종국 후 계산</b> 버튼이 있어 누르면 자동으로 세어 누가 얼마나 이겼는지 알려 줍니다.<br>\n        <b>팁:</b> 명백한 죽은 돌은 먼저 들어내야 계산이 틀리지 않습니다.')

# ---- 10. 陪娃学棋 ----
add(110, '<span class="num">10</span>10 tips for teaching kids',
    '<span class="num">10</span>子どもと学ぶ10のコツ', '<span class="num">10</span>아이와 배우는 10가지 팁')
add(111, '<b>Start on 9×9.</b> 19×19 is too big for beginners — one game takes forever and children lose patience. A 9×9 game takes about ten minutes and gives quick feedback.',
    '<b>9路盤から始める。</b>19路は初心者には広すぎ、一局が長すぎて子どもは飽きます。9路なら10分ほどで終わり、結果がすぐ返ってきます。',
    '<b>9줄부터 시작하세요.</b> 19줄은 초보자에게 너무 커서 한 판이 오래 걸리고 아이는 지칩니다. 9줄은 10분 남짓이라 결과가 빨리 옵니다.')
add(112, '<b>Liberties first, capturing second.</b> Do not start with opening theory or counting. Children love capturing, so play "capture games" first.',
    '<b>まず呼吸点、次に取り。</b>いきなり布石や目数の話をしないこと。子どもは取るのが大好きなので、まず「取りゲーム」を。',
    '<b>활로 먼저, 따내기 다음.</b> 처음부터 포석이나 집 계산을 말하지 마세요. 아이는 따내기를 좋아하니 먼저 "따내기 놀이"를 하세요.')
add(113, '<b>Balance strength with handicap stones.</b> The practice board can place 2–9 handicap stones for Black. Children need to win to stay motivated. On 9×9 start with 4–5 stones.',
    '<b>置き石で実力を調整。</b>練習盤は黒に2〜9子の置き石を置けます。子どもは勝てないとやる気が出ません。9路なら4〜5子から始めましょう。',
    '<b>접바둑으로 실력을 맞추세요.</b> 연습판은 흑에게 2~9점 접바둑을 놓을 수 있습니다. 아이는 이겨야 의욕이 생깁니다. 9줄은 4~5점부터 시작하세요.')
add(114, '<b>When they lose, empathise first, then review.</b> "Losing this one stings, huh? Let me look… hey, if you had played here, could you have captured it?"',
    '<b>負けたときは、まず共感してから振り返り。</b>「負けて悔しいよね。どれどれ……あ、ここに打っていたら取れたんじゃない？」',
    '<b>졌을 때는 먼저 공감하고, 그다음 복기하세요.</b> "이번 판 져서 속상하지? 어디 보자… 여기 두었으면 따낼 수 있었겠는데?"')
add(115, '<b>Fifteen minutes a day beats three hours on the weekend.</b> Go is a feel for the board — daily contact is what improves it.',
    '<b>毎日15分の方が、週末3時間より効きます。</b>囲碁は盤の感覚。毎日触れてこそ伸びます。',
    '<b>매일 15분이 주말 3시간보다 낫습니다.</b> 바둑은 감각이라 매일 만져야 늘어납니다.')
add(116, '<b>Review only one point.</b> Do not list ten mistakes at once — pick the single most important one and explain it clearly.',
    '<b>振り返りは一点だけ。</b>一度に10個のミスを並べないこと。一番大事な一つを選んで、それだけを丁寧に。',
    '<b>복기는 한 가지만.</b> 한 번에 열 가지 실수를 나열하지 말고, 가장 중요한 하나만 골라 설명하세요.')
add(117, '<b>Ask more, assert less.</b> "How many liberties does this stone have?" works far better than "Play here."',
    '<b>問いかけを多く、断定を少なく。</b>「この石の呼吸点はいくつ？」は「ここに打って」よりずっと効果的です。',
    '<b>질문을 많이, 단정은 적게.</b> "이 돌 활로 몇 개야?"가 "여기 둬"보다 훨씬 효과적입니다.')
add(118, '<b>Let them talk.</b> After a game, ask them to explain "why did you play that move?" — putting it into words organises their thinking.',
    '<b>子どもに話させる。</b>一局終えたら「さっきの手はなぜ？」と聞いてみましょう。言葉にする過程が考えを整理します。',
    '<b>아이가 말하게 하세요.</b> 한 판이 끝나면 "아까 그 수는 왜 그렇게 뒀어?"라고 물어보세요. 말로 하는 과정이 생각을 정리합니다.')
add(119, '<b>Do not rush to correct "unorthodox" moves.</b> As long as it is legal and not suicide, let them try and fail — a few losses and they will remember.',
    '<b>「型にはまらない」手をすぐ直さない。</b>反則でも自殺手でもなければ、まず自分で試させましょう。少し損をすれば覚えます。',
    '<b>"비정석" 수를 급히 고치지 마세요.</b> 반칙이나 자충수가 아니라면 스스로 시행착오를 겪게 하세요. 몇 번 손해 보면 기억합니다.')
add(120, '<b>Learn alongside them.</b> If you are improving too, they will be more interested. Solve problems together, review together, get beaten by the computer together, then figure out how to win it back.',
    '<b>一緒に学ぶ。</b>あなたも上達すれば、子どもはもっと興味を持ちます。一緒に問題を解き、一緒に振り返り、一緒にコンピュータに負けて、どう勝ち返すか研究しましょう。',
    '<b>함께 배우세요.</b> 부모도 늘면 아이의 흥미가 커집니다. 함께 문제를 풀고, 함께 복기하고, 함께 컴퓨터에게 지고 나서 어떻게 이길지 연구하세요.')
add(121, '<b>One small exercise:</b> place 3 white stones on a 9×9 board and let your child try to capture them all. When they succeed, add one more. This beats any explanation.',
    '<b>小さな練習：</b>9路盤に白石を3つ置き、全部取れるか挑戦させましょう。できたら一つ増やす。どんな説明より効きます。',
    '<b>작은 연습:</b> 9줄 판에 백돌 3개를 놓고 아이가 모두 잡도록 해 보세요. 성공하면 하나 더 놓습니다. 어떤 설명보다 효과적입니다.')

# ---- 结尾 ----
add(122, 'That is it — go and play a game', '以上です。さあ一局打ってみましょう', '여기까지입니다. 이제 한 판 두러 가요')
add(123, 'Start with <b>9×9 · handicap 5 · Easy</b>.<br>Once they win, reduce the handicap step by step.',
    '<b>9路盤・置き石5子・初級</b>から始めましょう。<br>勝てるようになったら、少しずつ置き石を減らします。',
    '<b>9줄 · 접바둑 5점 · 초급</b>부터 시작하세요.<br>이기기 시작하면 접바둑을 조금씩 줄여 나갑니다.')
add(124, 'Open the practice board', '練習盤を開く', '연습판 열기')
