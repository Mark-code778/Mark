"""Генератор script.md и shots.json для ролика «Остров Фазанов».
Запуск: python3 videos/pheasant-island/build.py   (из map-studio/)
Один элемент SHOTS = одна строка диктора = один кадр."""
import json, math, os, re

HERE = os.path.dirname(os.path.abspath(__file__))

# ---------- реальные координаты [долгота, широта] ----------
ISL = [-1.7661, 43.3428]       # остров Фазанов (Википедия: 43°20′34″ с. ш. 1°45′58″ з. д.)
IRUN = [-1.7894, 43.3390]
HENDAYE = [-1.7744, 43.3600]
HONDARRIBIA = [-1.7930, 43.3686]
TXINGUDI = [-1.7840, 43.3640]
BIDASOA_UP = [-1.7570, 43.3330]
SS = [-1.9812, 43.3183]        # Сан-Себастьян
BAYONNE = [-1.4748, 43.4929]
SJDL = [-1.6630, 43.3881]      # Сен-Жан-де-Люз
MADRID = [-3.7038, 40.4168]
PARIS = [2.3522, 48.8566]
PAVIA = [9.1590, 45.1847]
PERPIGNAN = [2.8948, 42.6887]
LLIVIA = [1.9806, 42.4639]
PUIGCERDA = [1.9276, 42.4317]
SCHENGEN = [6.3667, 49.4692]
CONSTANCE = [9.30, 47.62]

def cam(center, span, frm=None):
    c = {"to": {"center": center, "span": span}}
    if frm:
        c["from"] = {"center": frm[0], "span": frm[1]}
    return c

def dist(a, b):
    l1, p1, l2, p2 = map(math.radians, [a[0], a[1], b[0], b[1]])
    return 6371 * 2 * math.asin(math.sqrt(math.sin((p2 - p1) / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin((l2 - l1) / 2) ** 2))

def km(a, b):
    v = round(dist(a, b))
    return f"{v:,}".replace(",", " ") + " км"

lbl = lambda text, pos, kind, t=0.6, **k: {"type": "label", "text": text, "pos": pos, "kind": kind, "t": t, **k}
mark = lambda pos, text=None, color="accent", t=0.5, **k: {"type": "marker", "pos": pos, **({"text": text} if text else {}), "color": color, "t": t, **k}
country = lambda code, color="accent", t=0.4, **k: {"type": "country", "code": code, "color": color, "t": t, **k}
BORDERS = {"type": "borders", "t": 0.2}
COAST = {"type": "coast", "t": 0.1}

# Остров как кольцо ~120 м (Landsat не различит его форму; при наличии аэрофото — заменить контуром)
ISL_RING = {"type": "ring", "pos": ISL, "km": 0.12, "color": "accent", "t": 0.3}

CH = []  # главы для upload.md: (id первого кадра, название)

# (chapter_marker | None, narration, visual, extras)
S = []
def shot(narr, visual, reveal=False, **k):
    S.append({"narration": narr, "visual": visual, "reveal": reveal, **k})

def title(kicker, text):
    CH.append((len(S), text))
    S.append({"narration": "", "visual": f"Титр: {kicker} — {text}", "kind": "title", "transition": "fade",
              "title": {"kicker": kicker, "text": text}, "duration": 2.8})

# ================= ХОЛОДНОЕ ОТКРЫТИЕ =================
CH.append((0, "Вступление"))
shot("Каждые шесть месяцев этот остров меняет страну.",
     "Глобус из космоса, камера падает к Бискайскому заливу",
     camera=cam(ISL, 1400, (([-30, 30]), 30000)),
     overlays=[{"type": "coast", "t": 3.2}],
     onScreenText={"text": "Остров, который каждые 6 месяцев меняет страну", "style": "hook", "t": 0.3}, reveal=True)
shot("Без войны. Без выстрелов. Без единого переселенца.",
     "Граница Испании и Франции прорисовывается на западе Пиренеев",
     camera=cam(ISL, 260), keep=True,
     overlays=[BORDERS, country("ESP", "red", 0.6), country("FRA", "accent", 1.0),
               lbl("Испания", [-2.6, 42.9], "country", 1.4), lbl("Франция", [-0.9, 43.75], "country", 1.8)])
shot("Первого февраля он становится испанским.",
     "Наезд к устью Бидасоа; Испания подсвечена",
     camera=cam(ISL, 40), keep=True,
     overlays=[mark(ISL, "Остров Фазанов", "accent", 0.6)],
     onScreenText={"text": "1 февраля — Испания", "style": "caption", "t": 0.6}, reveal=True)
shot("А первого августа — французским.",
     "Тот же план, подпись меняется",
     camera=cam(ISL, 30), keep=True,
     onScreenText={"text": "1 августа — Франция", "style": "caption", "t": 0.3})
shot("И так из года в год.",
     "Медленный наезд на реку",
     camera=cam(ISL, 22), keep=True)
shot("На нём никто не живёт, и туда нельзя просто приплыть.",
     "Остров крупно, кольцо вокруг него",
     camera=cam(ISL, 6), overlays=[BORDERS, ISL_RING, lbl("Испания", [-1.785, 43.330], "region", 0.8), lbl("Франция", [-1.748, 43.352], "region", 1.0)])
shot("Но именно здесь короли обменивались невестами, пленниками и целыми провинциями.",
     "Остров крупно, всплывает подпись",
     camera=cam(ISL, 4.5), keep=True,
     overlays=[lbl("1526 · 1615 · 1659 · 1660", [ISL[0], ISL[1] + 0.006], "callout", 1.2)], reveal=True)
shot("Это остров Фазанов — самое маленькое совместное владение двух государств в мире.",
     "Камера чуть отъезжает; крупная надпись",
     camera=cam(ISL, 7), keep=True,
     onScreenText={"text": "Остров Фазанов", "style": "number", "kicker": "самый маленький кондоминиум в мире", "t": 0.8})
shot("Чтобы понять, как такое возможно, нужно найти его на карте — и вернуться в 1659 год.",
     "Камера поднимается над Пиренеями",
     camera=cam([-1.2, 43.0], 600),
     overlays=[BORDERS], onScreenText={"text": "1659", "style": "number", "t": 1.0})

# ================= ГЛАВА 1 =================
title("Глава 1", "Граница, которая течёт рекой")
shot("Западный край Пиренеев. Здесь горы спускаются прямо в Бискайский залив.",
     "Общий план: Пиренеи, Бискайский залив",
     camera=cam([-1.3, 43.2], 520, ([-1.2, 43.0], 700)),
     overlays=[COAST, BORDERS, lbl("Бискайский\nзалив", [-2.6, 44.2], "water", 1.0), lbl("Пиренеи", [-0.6, 42.85], "region", 1.6)])
shot("Почти на всём протяжении граница Испании и Франции идёт по горному хребту.",
     "Граница прорисовывается по хребту на восток",
     camera=cam([0.9, 42.7], 900), overlays=[BORDERS, {"type": "line", "coords": [[-1.4, 43.1], [-0.6, 42.85], [0.7, 42.65], [1.7, 42.5], [3.15, 42.45]], "color": "accent", "t": 0.6, "d": 3}])
shot("Но у самого океана она спускается с гор и уходит в реку.",
     "Камера возвращается на запад, к устью",
     camera=cam([-1.75, 43.33], 70), overlays=[BORDERS], reveal=True)
shot("Река называется Бидасоа.",
     "Русло подписано",
     camera=cam([-1.75, 43.33], 55), keep=True,
     overlays=[lbl("Бидасоа", [-1.735, 43.305], "water", 0.4)])
shot("Последние километры она течёт между двумя городами.",
     "Средний план: устье и два берега",
     camera=cam([-1.78, 43.35], 14), overlays=[BORDERS])
shot("На левом берегу — испанский Ирун.",
     "Метка Ирун",
     camera=cam([-1.78, 43.35], 12), keep=True, overlays=[mark(IRUN, "Ирун", "red", 0.3, side="left")])
shot("На правом — французский Андай.",
     "Метка Андай",
     camera=cam([-1.78, 43.35], 11), keep=True, overlays=[mark(HENDAYE, "Андай", "accent", 0.3)])
shot("Между ними несколько мостов. Автомобильный, железнодорожный, пешеходный.",
     "Средний план устья, медленный наезд",
     camera=cam([-1.78, 43.35], 10.5), keep=True)
shot("Границу здесь пересекают каждый день — на работу, в магазин, на пляж.",
     "Тот же план",
     camera=cam([-1.78, 43.35], 10), keep=True)
shot("Паспортов давно никто не проверяет: обе страны в Шенгенской зоне.",
     "Подпись",
     camera=cam([-1.78, 43.35], 9.6), keep=True,
     onScreenText={"text": "Шенгенская зона", "style": "caption", "t": 0.5})
shot("Даже в устье, где река впадает в залив, рыбачат по общим правилам двух стран.",
     "Наезд к заливу",
     camera=cam([-1.785, 43.36], 9.2), keep=True)
shot("Чуть ниже по течению — испанская Ондаррибия и залив Чингуди.",
     "Метка Ондаррибия, подпись залива",
     camera=cam([-1.785, 43.355], 10), keep=True,
     overlays=[mark(HONDARRIBIA, "Ондаррибия", "red", 0.3, side="left"), lbl("залив\nЧингуди", TXINGUDI, "water", 0.8)])
shot("А посреди реки, между Ируном и Андаем, лежит узкий зелёный остров.",
     "Наезд на остров, кольцо",
     camera=cam(ISL, 3.5), overlays=[BORDERS, ISL_RING, mark(ISL, "Остров Фазанов", "accent", 1.2)], reveal=True)
shot("В длину — около двухсот метров. В ширину — несколько десятков.",
     "Остров крупно; линия длины",
     camera=cam(ISL, 2.6), keep=True,
     overlays=[{"type": "distance", "from": [ISL[0] - 0.0012, ISL[1] - 0.0002], "to": [ISL[0] + 0.0012, ISL[1] + 0.0002], "text": "≈200 м", "t": 0.4}])
shot("Вся его площадь — меньше гектара.",
     "Крупно; крупное число",
     camera=cam(ISL, 2.3), keep=True,
     onScreenText={"text": "< 1 га", "style": "number", "kicker": "площадь острова", "t": 0.4}, reveal=True)
shot("Деревья, трава, каменная кромка вдоль берега и один памятник в центре.",
     "Медленный наезд",
     camera=cam(ISL, 2.0), keep=True)
shot("Ни домов, ни дорог, ни моста.",
     "Тот же план",
     camera=cam(ISL, 1.8), keep=True)
shot("Если бы не история, на него никто бы и не взглянул.",
     "Тот же план",
     camera=cam(ISL, 1.75), keep=True)
shot("С берега его видно во всех деталях. Но ступить на него нельзя.",
     "Камера отъезжает на берег Ируна",
     camera=cam([-1.770, 43.341], 2.6), keep=True,
     onScreenText={"text": "Вход закрыт", "style": "caption", "t": 1.2})
shot("Остров закрыт для посетителей. Лишь изредка местные власти устраивают туда экскурсии.",
     "Тот же план",
     camera=cam([-1.770, 43.341], 2.3), keep=True)
shot("Почему же этот клочок земли не поделили пополам, как всё остальное?",
     "Остров крупно, вопрос на экране",
     camera=cam(ISL, 1.9), keep=True,
     onScreenText={"text": "Почему его не поделили?", "style": "caption", "t": 0.5})

# ================= ГЛАВА 2 =================
title("Глава 2", "Мир, подписанный посреди реки")
shot("В середине семнадцатого века Франция и Испания воевали почти четверть века.",
     "Западная Европа, обе страны подсвечены",
     camera=cam([0.5, 44.5], 2600, ([-1.5, 43.5], 1500)),
     overlays=[BORDERS, country("ESP", "red", 0.5), country("FRA", "accent", 0.8),
               lbl("Испания", [-3.6, 40.0], "country", 1.2), lbl("Франция", [2.4, 46.6], "country", 1.4)],
     onScreenText={"text": "24 года", "style": "number", "kicker": "война 1635–1659", "t": 1.0}, reveal=True)
shot("Сражались во Фландрии, в Италии, в Каталонии и здесь, на Пиренеях.",
     "Камера медленно отъезжает",
     camera=cam([1.5, 45.0], 2900), keep=True,
     overlays=[lbl("Фландрия", [3.4, 50.6], "region", 0.4), lbl("Италия", [9.5, 44.9], "region", 0.9), lbl("Каталония", [1.6, 41.8], "region", 1.4)])
shot("Война истощила обе страны.",
     "Тот же план",
     camera=cam([1.5, 45.0], 2700), keep=True)
shot("Испания одновременно воевала с восставшей Португалией.",
     "Португалия подсвечена",
     camera=cam([-3.0, 41.5], 2000), keep=True, overlays=[country("PRT", "red", 0.3), lbl("Португалия", [-8.0, 39.8], "region", 0.6)])
shot("А Франция едва пережила Фронду — долгую смуту внутри самой страны.",
     "Франция подсвечена",
     camera=cam([1.5, 45.5], 2400), keep=True,
     onScreenText={"text": "Фронда, 1648–1653", "style": "caption", "t": 0.6})
shot("Мир был нужен всем. Но никто не хотел ехать к противнику.",
     "Линия Мадрид — Париж через остров",
     camera=cam([-0.5, 44.6], 2200),
     overlays=[BORDERS, mark(MADRID, "Мадрид", "red", 0.3, side="left"), mark(PARIS, "Париж", "accent", 0.6)])
shot("Приехать на чужую землю значило признать, что первым просишь мира именно ты.",
     "Тот же план",
     camera=cam([-0.5, 44.6], 2050), keep=True)
shot("Решение нашли на границе — посреди реки.",
     "Две линии сходятся к острову: из Мадрида и из Парижа",
     camera=cam([-0.8, 44.6], 1900), keep=True,
     overlays=[{"type": "distance", "from": MADRID, "to": ISL, "text": km(MADRID, ISL), "color": "red", "t": 0.3},
               {"type": "distance", "from": PARIS, "to": ISL, "text": km(PARIS, ISL), "color": "accent", "t": 1.0}], reveal=True)
shot("Остров Фазанов считался нейтральным. Ни одна из сторон не была на нём хозяйкой.",
     "Падение к острову",
     camera=cam(ISL, 4, ([-0.8, 44.6], 1900)), overlays=[BORDERS, ISL_RING])
shot("Летом 1659 года на нём построили павильон для переговоров.",
     "Остров крупно",
     camera=cam(ISL, 2.4), keep=True,
     onScreenText={"text": "Лето 1659", "style": "caption", "t": 0.4})
shot("К нему вели два моста: один с испанского берега, другой с французского.",
     "Две линии к острову с двух берегов",
     camera=cam(ISL, 2.1), keep=True,
     overlays=[{"type": "line", "coords": [[ISL[0] - 0.004, ISL[1] - 0.003], [ISL[0] - 0.0004, ISL[1] - 0.0003]], "color": "red", "t": 0.3},
               {"type": "line", "coords": [[ISL[0] + 0.004, ISL[1] + 0.003], [ISL[0] + 0.0004, ISL[1] + 0.0003]], "color": "accent", "t": 1.0}])
shot("Говорят, граница проходила прямо через стол переговоров.",
     "Пунктир через остров",
     camera=cam(ISL, 1.9), keep=True,
     overlays=[{"type": "line", "coords": [[ISL[0] - 0.003, ISL[1] + 0.002], [ISL[0] + 0.003, ISL[1] - 0.002]], "dashed": True, "color": "white", "text": "граница", "t": 0.3}], reveal=True)
shot("Францию представлял кардинал Мазарини. Испанию — дон Луис де Аро.",
     "Плашки с именами по сторонам",
     camera=cam(ISL, 1.8), keep=True,
     overlays=[lbl("Луис де Аро", [ISL[0] - 0.0035, ISL[1] - 0.0018], "callout", 0.4), lbl("Кардинал Мазарини", [ISL[0] + 0.0035, ISL[1] + 0.0018], "callout", 1.6)])
shot("Они встречались больше двадцати раз. Каждый — на своей половине зала.",
     "Крупное число",
     camera=cam(ISL, 1.7), keep=True,
     onScreenText={"text": "20+", "style": "number", "kicker": "встреч на острове", "t": 0.6})
shot("Мазарини и де Аро обсуждали всё: границы, крепости, торговлю и будущий брак короля.",
     "Медленный наезд",
     camera=cam(ISL, 1.65), keep=True)
shot("С тех пор французы называют это место Островом Конференции.",
     "Плашка с французским названием",
     camera=cam(ISL, 1.6), keep=True,
     overlays=[lbl("Île de la Conférence", [ISL[0] + 0.0035, ISL[1] - 0.0025], "callout", 0.5)], reveal=True)
shot("Испанцы же сохранили старое имя — остров Фазанов.",
     "Тот же план",
     camera=cam(ISL, 1.55), keep=True)
shot("Седьмого ноября 1659 года был подписан Пиренейский мир.",
     "Отъезд от острова",
     camera=cam(ISL, 9), overlays=[BORDERS, ISL_RING],
     onScreenText={"text": "7 ноября 1659 — Пиренейский мир", "style": "caption", "t": 0.5}, reveal=True)
shot("Договор перекроил карту Европы.",
     "Подъём к Пиренеям",
     camera=cam([1.2, 42.9], 900, (ISL, 9)), overlays=[BORDERS])
shot("Франция получила Руссильон с Перпиньяном и часть Сердани.",
     "Восточные Пиренеи: Руссильон и Сердань подписаны",
     camera=cam([2.3, 42.6], 320), keep=True,
     overlays=[mark(PERPIGNAN, "Перпиньян", "accent", 0.3), lbl("Руссильон", [2.6, 42.5], "region", 0.8), lbl("Сердань", [1.9, 42.35], "region", 1.3)], reveal=True)
shot("На севере ей досталась ещё и провинция Артуа.",
     "Отъезд на север, Артуа",
     camera=cam([1.5, 47.0], 1600, ([2.3, 42.6], 320)), keep=True,
     overlays=[lbl("Артуа", [2.5, 50.35], "region", 0.6), mark(PARIS, "Париж", "white", 0.4)])
shot("А граница почти на всём протяжении легла по гребню Пиренеев.",
     "Отъезд, граница по хребту",
     camera=cam([0.6, 42.75], 800), keep=True,
     overlays=[{"type": "line", "coords": [[-1.4, 43.1], [-0.6, 42.85], [0.7, 42.65], [1.7, 42.5], [3.15, 42.45]], "color": "accent", "t": 0.3, "d": 3}])
shot("Она и сегодня проходит почти там же.",
     "Тот же план",
     camera=cam([0.6, 42.75], 740), keep=True)
shot("А остров, на котором всё подписали, решили сделать общим.",
     "Возврат к острову",
     camera=cam(ISL, 3, ([0.6, 42.75], 740)), overlays=[BORDERS, ISL_RING])
shot("Не испанским и не французским. Совместным — в память о мире.",
     "Остров крупно; обе подсветки",
     camera=cam(ISL, 2.4), keep=True,
     onScreenText={"text": "Совместное владение", "style": "caption", "t": 0.6})

# ================= ГЛАВА 3 =================
title("Глава 3", "Остров королевских обменов")
shot("Но мирный договор был не первым большим событием на этом месте.",
     "Остров, средний план",
     camera=cam(ISL, 8), overlays=[BORDERS, ISL_RING])
shot("В 1525 году французский король Франциск Первый попал в плен в битве при Павии.",
     "Подъём: Павия в Италии",
     camera=cam([4.0, 43.5], 1700, (ISL, 8)), overlays=[BORDERS, mark(PAVIA, "Павия", "red", 2.0)],
     onScreenText={"text": "1525", "style": "caption", "t": 0.4})
shot("Его увезли в Мадрид, где он провёл почти год.",
     "Маршрут Павия — Мадрид",
     camera=cam([2.5, 42.8], 2000), keep=True,
     overlays=[mark(MADRID, "Мадрид", "red", 0.3, side="left"),
               {"type": "line", "coords": [PAVIA, [5.4, 43.2], [2.2, 41.4], MADRID], "color": "red", "dashed": True, "t": 0.6, "d": 2.5}])
shot("Свободу ему вернули в марте 1526 года — здесь, на Бидасоа.",
     "Линия из Мадрида к острову",
     camera=cam([-2.5, 42.0], 900), keep=True,
     overlays=[{"type": "line", "coords": [MADRID, ISL], "color": "accent", "t": 0.3, "d": 2}],
     onScreenText={"text": "Март 1526", "style": "caption", "t": 0.6})
shot("Посреди реки, у этого острова, короля обменяли на двух его сыновей.",
     "Наезд на остров",
     camera=cam(ISL, 3), overlays=[BORDERS, ISL_RING], reveal=True)
shot("Обмен устроили на плоту, поставленном на якорь посреди течения.",
     "Остров крупно",
     camera=cam(ISL, 2.8), keep=True)
shot("Король шагнул на французский берег, а его сыновья — на испанский. Всё заняло несколько минут.",
     "Тот же план",
     camera=cam(ISL, 2.7), keep=True)
shot("Мальчики остались заложниками в Испании на четыре года.",
     "Крупное число",
     camera=cam(ISL, 2.6), keep=True,
     onScreenText={"text": "4 года", "style": "number", "kicker": "сыновья короля в заложниках", "t": 0.5})
shot("Через девяносто лет, в 1615 году, здесь обменивались уже невестами.",
     "Остров, медленный наезд",
     camera=cam(ISL, 2.3), keep=True,
     onScreenText={"text": "1615", "style": "caption", "t": 0.4}, reveal=True)
shot("Испанская инфанта Анна Австрийская уехала во Францию — к Людовику Тринадцатому.",
     "Стрелка с испанского берега на французский",
     camera=cam(ISL, 2.1), keep=True,
     overlays=[{"type": "line", "coords": [[ISL[0] - 0.004, ISL[1] - 0.003], [ISL[0] + 0.004, ISL[1] + 0.003]], "color": "red", "t": 0.3, "text": "Анна → Франция"}])
shot("А французская принцесса Елизавета — в Испанию, к будущему Филиппу Четвёртому.",
     "Стрелка в обратную сторону",
     camera=cam(ISL, 1.95), keep=True,
     overlays=[{"type": "line", "coords": [[ISL[0] + 0.004, ISL[1] - 0.0035], [ISL[0] - 0.004, ISL[1] + 0.0025]], "color": "accent", "t": 0.3, "text": "Елизавета → Испания"}])
shot("Две принцессы встретились посреди реки и разъехались в разные стороны.",
     "Тот же план",
     camera=cam(ISL, 1.85), keep=True)
shot("Обмен оказался судьбоносным.",
     "Тот же план",
     camera=cam(ISL, 1.8), keep=True)
shot("Через двадцать три года Анна Австрийская родила сына. Им стал Людовик Четырнадцатый.",
     "Крупная подпись",
     camera=cam(ISL, 1.75), keep=True,
     onScreenText={"text": "Мать Людовика XIV", "style": "caption", "t": 0.8}, reveal=True)
shot("А у Елизаветы в Испании родилась дочь — Мария-Терезия.",
     "Тот же план",
     camera=cam(ISL, 1.7), keep=True,
     onScreenText={"text": "Мать Марии-Терезии", "style": "caption", "t": 0.6})
shot("Запомните эти два имени. Они ещё встретятся на этом острове.",
     "Тот же план",
     camera=cam(ISL, 1.65), keep=True)
shot("Но самым пышным стал 1660 год.",
     "Отъезд от острова",
     camera=cam(ISL, 6), overlays=[BORDERS, ISL_RING],
     onScreenText={"text": "1660", "style": "number", "t": 0.4})
shot("Пиренейский мир решили скрепить свадьбой.",
     "Средний план",
     camera=cam(ISL, 5.4), keep=True)
shot("Людовик Четырнадцатый должен был жениться на испанской инфанте Марии-Терезии.",
     "Средний план, плашка",
     camera=cam(ISL, 5), keep=True,
     overlays=[lbl("Людовик XIV + Мария-Терезия", [ISL[0], ISL[1] + 0.012], "callout", 0.6)])
shot("Жених и невеста были двоюродными братом и сестрой — сразу по обеим линиям.",
     "Плашка",
     camera=cam(ISL, 4.6), keep=True,
     onScreenText={"text": "Сыновья и дочери обменянных невест", "style": "caption", "t": 0.5}, reveal=True)
shot("Сын невесты, уехавшей во Францию, женился на дочери невесты, уехавшей в Испанию.",
     "Тот же план",
     camera=cam(ISL, 4.3), keep=True)
shot("В июне 1660 года на острове встретились два короля — Людовик и Филипп Четвёртый.",
     "Остров крупно",
     camera=cam(ISL, 2.5), overlays=[BORDERS, ISL_RING],
     onScreenText={"text": "Июнь 1660 — встреча королей", "style": "caption", "t": 0.5}, reveal=True)
shot("Павильон для этой встречи украшали лучшие мастера двух дворов.",
     "Медленный наезд",
     camera=cam(ISL, 2.2), keep=True)
shot("Испанскую половину оформлял придворный художник Диего Веласкес.",
     "Плашка",
     camera=cam(ISL, 2.0), keep=True,
     overlays=[lbl("Диего Веласкес", [ISL[0] - 0.0035, ISL[1] - 0.0018], "callout", 0.4)], reveal=True)
shot("Тот самый, что за четыре года до этого написал «Менины».",
     "Тот же план",
     camera=cam(ISL, 1.95), keep=True,
     onScreenText={"text": "«Менины», 1656", "style": "caption", "t": 0.5})
shot("Вскоре после возвращения в Мадрид он заболел и в августе того же года умер.",
     "Линия к Мадриду, отъезд",
     camera=cam([-2.6, 41.9], 900, (ISL, 2.0)),
     overlays=[BORDERS, {"type": "line", "coords": [ISL, MADRID], "color": "white", "dashed": True, "t": 0.5, "d": 2.5}, mark(MADRID, "Мадрид", "red", 2.5, side="left")])
shot("Праздник на этом острове стал одной из последних его работ.",
     "Тот же план",
     camera=cam([-2.6, 41.9], 840), keep=True)
shot("А через несколько дней после встречи королей Людовик и Мария-Терезия обвенчались в соседнем Сен-Жан-де-Люзе.",
     "Берег: Сен-Жан-де-Люз, расстояние от острова",
     camera=cam([-1.715, 43.365], 22, ([-2.6, 41.9], 840)),
     overlays=[COAST, BORDERS, ISL_RING, mark(SJDL, "Сен-Жан-де-Люз", "accent", 0.5),
               {"type": "distance", "from": ISL, "to": SJDL, "text": km(ISL, SJDL).replace(" км", " км") , "t": 1.5}])

shot("У этой свадьбы оказались долгие последствия.",
     "Отъезд над Пиренеями",
     camera=cam([-2.0, 42.5], 1200, ([-1.715, 43.365], 22)), overlays=[BORDERS])
shot("Через сорок лет испанская ветвь Габсбургов прервалась.",
     "Испания подсвечена",
     camera=cam([-2.5, 41.5], 1400), keep=True, overlays=[country("ESP", "red", 0.4)],
     onScreenText={"text": "1700", "style": "caption", "t": 0.5})
shot("И трон Испании получил внук Людовика и Марии-Терезии — Филипп Анжуйский.",
     "Линия Париж — Мадрид",
     camera=cam([0.0, 44.5], 2300), keep=True,
     overlays=[mark(PARIS, "Париж", "accent", 0.3), mark(MADRID, "Мадрид", "red", 0.5, side="left"),
               {"type": "line", "coords": [PARIS, MADRID], "color": "accent", "t": 0.8, "d": 2.2}], reveal=True)
shot("Так в Испании появились Бурбоны. Нынешний король Испании — их прямой потомок.",
     "Крупная подпись",
     camera=cam([0.0, 44.5], 2150), keep=True,
     onScreenText={"text": "Бурбоны", "style": "number", "kicker": "правят Испанией до сих пор", "t": 0.6})
shot("И всё это началось с переговоров на острове длиной в двести метров.",
     "Падение к острову",
     camera=cam(ISL, 4, ([0.0, 44.5], 2150)), overlays=[BORDERS, ISL_RING])

# ================= ГЛАВА 4 =================
title("Глава 4", "Полгода здесь, полгода там")
shot("Так как же остров меняет страну?",
     "Остров, средний план",
     camera=cam(ISL, 5), overlays=[BORDERS, ISL_RING])
shot("С первого февраля по тридцать первое июля им управляет Испания.",
     "Подсветка Испании, крупная подпись",
     camera=cam(ISL, 4.4), keep=True,
     overlays=[country("ESP", "red", 0.2)],
     onScreenText={"text": "1 февраля — 31 июля", "style": "number", "kicker": "Испания", "t": 0.4}, reveal=True)
shot("С первого августа по тридцать первое января — Франция.",
     "Подсветка Франции",
     camera=cam(ISL, 4.0), overlays=[BORDERS, ISL_RING, country("FRA", "accent", 0.2)],
     onScreenText={"text": "1 августа — 31 января", "style": "number", "kicker": "Франция", "t": 0.4})
shot("Пограничных столбов при этом никто не переставляет.",
     "Медленный наезд",
     camera=cam(ISL, 3.6), overlays=[BORDERS, ISL_RING])
shot("Выходит, что дважды в год остров переходит из страны в страну, не сдвинувшись ни на метр.",
     "Тот же план",
     camera=cam(ISL, 3.4), keep=True,
     onScreenText={"text": "2 смены власти в год", "style": "caption", "t": 0.6})
shot("Порядок совместного владения подтвердил Байоннский договор 1856 года.",
     "Отъезд от острова к побережью",
     camera=cam([-1.72, 43.40], 70, (ISL, 3.6)), overlays=[COAST, BORDERS],
     onScreenText={"text": "Байоннский договор, 1856", "style": "caption", "t": 0.5}, reveal=True)
shot("В те же годы две страны участок за участком описали всю границу — от океана до Средиземного моря.",
     "Граница прорисовывается по всей длине",
     camera=cam([0.8, 42.8], 900), keep=True,
     overlays=[{"type": "line", "coords": [[-1.78, 43.36], [-1.4, 43.1], [-0.6, 42.85], [0.7, 42.65], [1.7, 42.5], [3.17, 42.43]], "color": "accent", "t": 0.4, "d": 3.5}])
shot("А за самим островом присматривают два морских офицера.",
     "Возврат к побережью Бидасоа",
     camera=cam([-1.80, 43.36], 45, ([0.8, 42.8], 900)), overlays=[COAST, BORDERS])
shot("С испанской стороны — военно-морской комендант этого участка побережья.",
     "Испанский берег",
     camera=cam([-1.80, 43.36], 40), keep=True,
     overlays=[mark(HONDARRIBIA, "Ондаррибия", "red", 0.4, side="left"), mark(SS, "Сан-Себастьян", "red", 0.8, side="left")])
shot("С французской — морской командующий в Байонне.",
     "Французский берег, Байонна",
     camera=cam([-1.62, 43.42], 55), keep=True,
     overlays=[mark(BAYONNE, "Байонна", "accent", 0.4)])
shot("На полгода каждый из них становится хозяином острова. Их в шутку называют вице-королями.",
     "Крупная подпись",
     camera=cam([-1.62, 43.42], 50), keep=True,
     onScreenText={"text": "«Вице-короли»", "style": "caption", "t": 0.8}, reveal=True)
shot("Остальные заботы делят соседние Ирун и Андай.",
     "Два города, средний план",
     camera=cam([-1.78, 43.35], 9), overlays=[BORDERS, mark(IRUN, "Ирун", "red", 0.3, side="left"), mark(HENDAYE, "Андай", "accent", 0.6), ISL_RING])
shot("Городские службы по очереди косят траву и ухаживают за деревьями.",
     "Наезд на остров",
     camera=cam(ISL, 3), keep=True)
shot("Попасть на остров обычному человеку можно лишь несколько раз в году — на редких экскурсиях.",
     "Остров крупно",
     camera=cam(ISL, 2.4), keep=True,
     onScreenText={"text": "Несколько дней в году", "style": "caption", "t": 0.6})
shot("На острове стоит памятный камень. Он напоминает о мире 1659 года.",
     "Остров крупно, метка памятника",
     camera=cam(ISL, 1.9), overlays=[BORDERS, ISL_RING, mark(ISL, "памятник Пиренейскому миру", "white", 0.5)])
shot("Получается крошечная территория без жителей, у которой два правительства.",
     "Тот же план",
     camera=cam(ISL, 1.75), keep=True,
     onScreenText={"text": "0 жителей · 2 страны", "style": "caption", "t": 0.6})
shot("И ни одно из них не может распоряжаться ею в одиночку.",
     "Тот же план",
     camera=cam(ISL, 1.65), keep=True)

# ================= ГЛАВА 5 =================
title("Глава 5", "Наследство одного договора")
shot("У острова есть противник опаснее любой армии.",
     "Остров крупно",
     camera=cam(ISL, 2.2), overlays=[BORDERS, ISL_RING])
shot("Это сама река.",
     "Подпись реки",
     camera=cam(ISL, 2.0), keep=True, overlays=[lbl("Бидасоа", [ISL[0] + 0.004, ISL[1] - 0.003], "water", 0.3)])
shot("Год за годом Бидасоа подмывает его берега, и остров постепенно уменьшается.",
     "Кольцо сжимается (второе кольцо меньше)",
     camera=cam(ISL, 1.8), keep=True,
     overlays=[{"type": "ring", "pos": ISL, "km": 0.08, "color": "red", "t": 0.8}], reveal=True)
shot("Чтобы он не исчез совсем, его края пришлось укрепить камнем.",
     "Тот же план",
     camera=cam(ISL, 1.7), keep=True)
shot("Пиренейский мир оставил на карте и другие странности.",
     "Подъём над Пиренеями, полёт на восток",
     camera=cam([1.95, 42.45], 120, (ISL, 1.7)), overlays=[BORDERS])
shot("На востоке Пиренеев Франции отошли тридцать три деревни Сердани.",
     "Сердань средним планом",
     camera=cam([1.95, 42.45], 70), keep=True,
     onScreenText={"text": "33 деревни", "style": "number", "kicker": "отошли Франции", "t": 0.5})
shot("Но городок Льивия деревней не считался. Он был городом.",
     "Метка Льивия",
     camera=cam(LLIVIA, 30), keep=True, overlays=[mark(LLIVIA, "Льивия", "red", 0.4)], reveal=True)
shot("Поэтому Льивия осталась испанской — посреди французской земли.",
     "Подсветка Испании вокруг анклава, кольцо",
     camera=cam(LLIVIA, 26), keep=True,
     overlays=[country("ESP", "red", 0.2, fill=True), country("FRA", "accent", 0.6)])
shot("Этот испанский анклав площадью около тринадцати квадратных километров существует до сих пор.",
     "Крупное число",
     camera=cam(LLIVIA, 22), keep=True,
     onScreenText={"text": "≈13 км²", "style": "number", "kicker": "испанский анклав во Франции", "t": 0.5})
shot("Сегодня там живут около полутора тысяч человек.",
     "Медленный наезд",
     camera=cam(LLIVIA, 18), keep=True)
shot("В Испанию из Льивии ведёт короткая дорога через французскую землю.",
     "Линия дороги Льивия — Пучсерда",
     camera=cam([1.955, 42.448], 14), keep=True,
     overlays=[{"type": "line", "coords": [LLIVIA, [1.962, 42.452], [1.945, 42.440], PUIGCERDA], "color": "white", "dashed": True, "t": 0.4, "text": "нейтральная дорога"}])
shot("По договору между странами французские власти не могут перекрыть её для испанцев.",
     "Тот же план",
     camera=cam([1.955, 42.448], 13), keep=True, reveal=True)
shot("Совместные владения есть и в других местах Европы.",
     "Подъём над Западной Европой",
     camera=cam([5.5, 47.5], 1500, (LLIVIA, 22)), overlays=[BORDERS])
shot("Германия и Люксембург вместе владеют пограничными реками — Мозелем, Зауэром и Уром.",
     "Мозель: Люксембург и Германия",
     camera=cam([6.35, 49.65], 160), keep=True,
     overlays=[country("LUX", "accent", 0.3), country("DEU", "red", 0.6), mark(SCHENGEN, "Шенген", "white", 1.2, side="left"), lbl("Мозель", [6.52, 49.55], "water", 1.6)])
shot("А на Боденском озере у Германии, Австрии и Швейцарии до сих пор нет согласованной границы.",
     "Боденское озеро",
     camera=cam(CONSTANCE, 110, ([6.35, 49.65], 160)),
     overlays=[BORDERS, lbl("Боденское\nозеро", [9.35, 47.60], "water", 0.6), lbl("Германия", [9.2, 47.95], "region", 1.0), lbl("Швейцария", [9.05, 47.35], "region", 1.3), lbl("Австрия", [9.85, 47.40], "region", 1.6)], reveal=True)
shot("Каждая страна понимает границу на озере по-своему — и это никому не мешает.",
     "Тот же план",
     camera=cam(CONSTANCE, 100), keep=True)
shot("Но остров Фазанов — самое маленькое совместное владение в мире.",
     "Полёт обратно к острову",
     camera=cam(ISL, 3, (CONSTANCE, 110)), overlays=[BORDERS, ISL_RING])

# ================= ФИНАЛ =================
title("Финал", "Остров, который не делят")
shot("Так почему же этот остров каждые шесть месяцев меняет страну?",
     "Остров крупно",
     camera=cam(ISL, 3.5), overlays=[BORDERS, ISL_RING])
shot("Потому что в 1659 году двум королевствам нужно было место, которое не принадлежит никому.",
     "Медленный отъезд",
     camera=cam(ISL, 5), keep=True)
shot("А после подписания мира его решили не делить.",
     "Отъезд",
     camera=cam(ISL, 8), keep=True)
shot("Здесь короли обменивали пленников и невест.",
     "Плашка с датами",
     camera=cam(ISL, 12), keep=True,
     overlays=[lbl("1526 · 1615 · 1659 · 1660", [ISL[0], ISL[1] + 0.02], "callout", 0.4)])
shot("Здесь закончилась война длиной почти в четверть века.",
     "Отъезд",
     camera=cam(ISL, 30), keep=True)
shot("Сегодня тут только деревья, трава и тихая река.",
     "Отъезд к Бискайскому заливу",
     camera=cam(ISL, 120), keep=True)
shot("Европа много раз перекраивала свои границы после 1659 года.",
     "Подъём над Европой",
     camera=cam([2.0, 46.0], 2600, (ISL, 120)), overlays=[BORDERS])
shot("Исчезали королевства, появлялись новые государства.",
     "Тот же план",
     camera=cam([2.0, 46.0], 2450), keep=True)
shot("А маленький остров на Бидасоа так и остаётся общим.",
     "Тот же план",
     camera=cam([2.0, 46.0], 2300), keep=True)
shot("Если вы смотрите это видео зимой, остров сейчас французский. Если летом — испанский.",
     "Тот же план",
     camera=cam([2.0, 46.0], 2200), keep=True, reveal=True)
shot("Пройдёт несколько месяцев, и остров снова сменит страну.",
     "Подъём в космос",
     camera=cam([-10, 38], 26000), overlays=[COAST])
shot("А на берегу этого, скорее всего, никто даже не заметит.",
     "Глобус, затемнение",
     camera=cam([-18, 34], 30000), keep=True)

# ---------- сборка ----------
WPS = 2.4  # слов в секунду (спокойный диктор)
shots, n = [], 0
for s in S:
    n += 1
    sid = f"s{n:03d}"
    words = len(s["narration"].split())
    d = {"id": sid, "narration": s["narration"], "visual": s["visual"],
         "duration": s.get("duration", round(words / WPS + 0.5, 1))}
    for k in ("kind", "camera", "overlays", "keep", "onScreenText", "transition", "title"):
        if k in s:
            d[k] = s[k]
    shots.append(d)

json.dump({"meta": {"title": "Остров, который каждые 6 месяцев меняет страну", "slug": "pheasant-island", "lang": "ru"}, "shots": shots},
          open(os.path.join(HERE, "shots.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

# script.md
lines, total_w, t = ["# Остров, который каждые 6 месяцев меняет страну", "",
                     "_Сценарий для диктора. Одна строка — один кадр. `[РАСКРЫТИЕ]` — новый поворот (не реже раза в минуту)._", ""], 0, 0.0
last_reveal, gaps = 0.0, []
for s, raw in zip(shots, S):
    if s.get("kind") == "title":
        lines += ["", f"## {s['title']['kicker']}. {s['title']['text']}", ""]
    else:
        total_w += len(s["narration"].split())
        mm = f"{int(t // 60):02d}:{int(t % 60):02d}"
        lines.append(f"- `{mm}` {s['narration']}" + ("  **[РАСКРЫТИЕ]**" if raw.get("reveal") else ""))
        if raw.get("reveal"):
            gaps.append(t - last_reveal); last_reveal = t
    t += s["duration"]
lines += ["", "---", f"Слов: **{total_w}** · расчётная длительность: **{int(t // 60)} мин {int(t % 60)} с** (при {WPS} слова/с) · кадров: **{len(shots)}**",
          f"Самый долгий промежуток между раскрытиями: **{max(gaps + [t - last_reveal]):.0f} с**", "",
          "## Источники фактов", "- Pheasant Island — Wikipedia (en/es); Treaty of the Pyrenees (1659); Treaty of Bayonne (1856)",
          "- Meeting on the Isle of Pheasants (1660); Francis I — exchange on the Bidasoa (1526); Exchange of the Princesses (1615)",
          "- Llívia — Wikipedia; Moselle/Sauer/Our condominium (Germany–Luxembourg); Lake Constance boundary", ""]
open(os.path.join(HERE, "script.md"), "w", encoding="utf-8").write("\n".join(lines))
json.dump(CH, open(os.path.join(HERE, "chapters.json"), "w"), ensure_ascii=False)
print(f"words={total_w} shots={len(shots)} est={t/60:.1f} min  max_reveal_gap={max(gaps + [t - last_reveal]):.0f}s")
