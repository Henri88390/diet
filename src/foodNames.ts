// Display-only translations. Planner logic keeps matching on the English names.
export type FoodLanguage = "fr" | "de" | "es" | "ru" | "pl";
const order: FoodLanguage[] = ["fr", "de", "es", "ru", "pl"];

// English -> [fr, de, es, ru, pl]
const foods: Record<string, [string, string, string, string, string]> = {
  "Bean & tomato toast": ["Tartine haricots-tomates", "Bohnen-Tomaten-Toast", "Tostada de alubias y tomate", "\u0422\u043e\u0441\u0442 \u0441 \u0444\u0430\u0441\u043e\u043b\u044c\u044e \u0438 \u043f\u043e\u043c\u0438\u0434\u043e\u0440\u0430\u043c\u0438", "Tost z fasola i pomidorami"],
  "Cottage cheese oats": ["Avoine au fromage blanc", "Huettenkaese mit Haferflocken", "Avena con requeson", "\u041e\u0432\u0441\u044f\u043d\u043a\u0430 \u0441 \u0442\u0432\u043e\u0440\u043e\u0433\u043e\u043c", "Platki s tvorogom"],
  "Potato & egg skillet": ["Poelee pommes de terre et oeufs", "Kartoffel-Ei-Pfanne", "Salteado de patata y huevo", "\u041a\u0430\u0440\u0442\u043e\u0444\u0435\u043b\u044c \u0441 \u044f\u0439\u0446\u043e\u043c \u043d\u0430 \u0441\u043a\u043e\u0432\u043e\u0440\u043e\u0434\u0435", "Ziemniaki z jajkiem"],
  "Apple yogurt oats": ["Avoine pomme-yaourt", "Apfel-Joghurt-Haferflocken", "Avena con manzana y yogur", "\u041e\u0432\u0441\u044f\u043d\u043a\u0430 \u0441 \u044f\u0431\u043b\u043e\u043a\u043e\u043c \u0438 \u0439\u043e\u0433\u0443\u0440\u0442\u043e\u043c", "Platki z jablkiem i jogurtem"],
  "Hummus tomato toast": ["Tartine houmous-tomates", "Hummus-Tomaten-Toast", "Tostada de hummus y tomate", "\u0422\u043e\u0441\u0442 \u0441 \u0445\u0443\u043c\u0443\u0441\u043e\u043c \u0438 \u043f\u043e\u043c\u0438\u0434\u043e\u0440\u0430\u043c\u0438", "Tost z hummusem i pomidorami"],
  "Lentil rice bowl": ["Bol riz-lentilles", "Linsen-Reis-Bowl", "Bol de arroz y lentejas", "\u0411\u043e\u0443\u043b \u0441 \u0440\u0438\u0441\u043e\u043c \u0438 \u0447\u0435\u0447\u0435\u0432\u0438\u0446\u0435\u0439", "Miska z ryzem i soczewica"],
  "Tuna & bean salad": ["Salade thon-haricots", "Thunfisch-Bohnen-Salat", "Ensalada de atun y alubias", "\u0421\u0430\u043b\u0430\u0442 \u0441 \u0442\u0443\u043d\u0446\u043e\u043c \u0438 \u0444\u0430\u0441\u043e\u043b\u044c\u044e", "Salatka z tunczykiem i fasola"],
  "Chickpea potato bowl": ["Bol pois chiches-pommes de terre", "Kichererbsen-Kartoffel-Bowl", "Bol de garbanzos y patata", "\u0411\u043e\u0443\u043b \u0441 \u043d\u0443\u0442\u043e\u043c \u0438 \u043a\u0430\u0440\u0442\u043e\u0444\u0435\u043b\u0435\u043c", "Miska z ciecierzyca i ziemniakami"],
  "Tomato lentil pasta": ["Pates tomate-lentilles", "Tomaten-Linsen-Pasta", "Pasta con tomate y lentejas", "\u041f\u0430\u0441\u0442\u0430 \u0441 \u0442\u043e\u043c\u0430\u0442\u0430\u043c\u0438 \u0438 \u0447\u0435\u0447\u0435\u0432\u0438\u0446\u0435\u0439", "Makaron z pomidorami i soczewica"],
  "Chickpea tomato pasta": ["Pates pois chiches-tomates", "Kichererbsen-Tomaten-Pasta", "Pasta con garbanzos y tomate", "\u041f\u0430\u0441\u0442\u0430 \u0441 \u043d\u0443\u0442\u043e\u043c \u0438 \u0442\u043e\u043c\u0430\u0442\u0430\u043c\u0438", "Makaron z ciecierzyca i pomidorami"],
  "Chicken vegetable rice": ["Riz poulet-legumes", "Haehnchen-Gemuese-Reis", "Arroz con pollo y verduras", "\u0420\u0438\u0441 \u0441 \u043a\u0443\u0440\u0438\u0446\u0435\u0439 \u0438 \u043e\u0432\u043e\u0449\u0430\u043c\u0438", "Ryz z kurczakiem i warzywami"],
  "Bean & potato stew": ["Ragout haricots-pommes de terre", "Bohnen-Kartoffel-Eintopf", "Guiso de alubias y patata", "\u0422\u0443\u0448\u0451\u043d\u0430\u044f \u0444\u0430\u0441\u043e\u043b\u044c \u0441 \u043a\u0430\u0440\u0442\u043e\u0444\u0435\u043b\u0435\u043c", "Gulasz z fasoli i ziemniakow"],
  "Sardine tomato rice": ["Riz sardines-tomates", "Sardinen-Tomaten-Reis", "Arroz con sardinas y tomate", "\u0420\u0438\u0441 \u0441 \u0441\u0430\u0440\u0434\u0438\u043d\u0430\u043c\u0438 \u0438 \u0442\u043e\u043c\u0430\u0442\u0430\u043c\u0438", "Ryz z sardynkami i pomidorami"],
  "Lentil sweet potato tray": ["Plat lentilles-patate douce", "Linsen-Suesskartoffel-Blechgericht", "Bandeja de lentejas y boniato", "\u0427\u0435\u0447\u0435\u0432\u0438\u0446\u0430 \u0441 \u0431\u0430\u0442\u0430\u0442\u043e\u043c \u0432 \u0434\u0443\u0445\u043e\u0432\u043a\u0435", "Soczewica z batatem"],
  "Adjusted meal": ["Repas adapté", "Angepasste Mahlzeit", "Comida adaptada", "Скорректированное блюдо", "Dostosowany posiłek"],
  "Rice": ["Riz", "Reis", "Arroz", "Рис", "Ryż"],
  "Beef": ["Bœuf", "Rindfleisch", "Ternera", "Говядина", "Wołowina"],
  "Banana & oat snack": ["Collation banane-avoine", "Bananen-Hafer-Snack", "Tentempié de plátano y avena", "Перекус из банана и овсянки", "Przekąska bananowo-owsiana"],
  "Bean": ["Haricots", "Bohnen", "Alubias", "Фасоль", "Fasola"],
  "Canned sardines, drained": ["Sardines en conserve, égouttées", "Sardinen aus der Dose, abgetropft", "Sardinas en conserva, escurridas", "Консервированные сардины, без жидкости", "Sardynki z puszki, odsączone"],
  "Canned tuna, drained": ["Thon en conserve, égoutté", "Thunfisch aus der Dose, abgetropft", "Atún en conserva, escurrido", "Консервированный тунец, без жидкости", "Tuńczyk z puszki, odsączony"],
  "Spinach": ["Épinards", "Spinat", "Espinacas", "Шпинат", "Szpinak"],
  "Yogurt": ["Yaourt", "Joghurt", "Yogur", "Йогурт", "Jogurt"],
  "Beans": ["Haricots", "Bohnen", "Alubias", "Фасоль", "Fasola"],
  "Bean & lettuce wrap": ["Wrap haricots et laitue", "Wrap mit Bohnen und Salat", "Wrap de alubias y lechuga", "Ролл с фасолью и салатом", "Wrap z fasolą i sałatą"],
  "Bean wrap": ["Wrap aux haricots", "Bohnen-Wrap", "Wrap de alubias", "Ролл с фасолью", "Wrap z fasolą"],
  "Canned beans": ["Haricots en conserve", "Bohnen aus der Dose", "Alubias en conserva", "Консервированная фасоль", "Fasola z puszki"],
  "Chicken": ["Poulet", "Hähnchen", "Pollo", "Курица", "Kurczak"],
  "Cinnamon porridge": ["Flocons d'avoine à la cannelle", "Zimt-Porridge", "Gachas de canela", "Овсянка с корицей", "Owsianka cynamonowa"],
  "Frozen vegetables": ["Légumes surgelés", "Tiefkühlgemüse", "Verduras congeladas", "Замороженные овощи", "Mrożone warzywa"],
  "Greens": ["Légumes verts", "Grünzeug", "Verduras de hoja", "Зелень", "Zielenina"],
  "Hummus toast snack": ["Collation toast au houmous", "Hummus-Toast-Snack", "Tentempié de tostada con hummus", "Перекус: тост с хумусом", "Przekąska: tost z hummusem"],
  "Lemon": ["Citron", "Zitrone", "Limón", "Лимон", "Cytryna"],
  "Lentils": ["Lentilles", "Linsen", "Lentejas", "Чечевица", "Soczewica"],
  "Mixed vegetables": ["Légumes mélangés", "Mischgemüse", "Verduras mixtas", "Овощная смесь", "Mieszanka warzyw"],
  "Oat": ["Avoine", "Hafer", "Avena", "Овёс", "Owies"],
  "Oat & banana bowl": ["Bol avoine-banane", "Hafer-Bananen-Bowl", "Bol de avena y plátano", "Боул из овсянки и банана", "Miska owsiano-bananowa"],
  "Oat bowl": ["Bol d'avoine", "Haferschale", "Bol de avena", "Овсяный боул", "Miska owsiana"],
  "Oat pancakes": ["Pancakes à l'avoine", "Haferpfannkuchen", "Tortitas de avena", "Овсяные панкейки", "Naleśniki owsiane"],
  "Oats": ["Flocons d'avoine", "Haferflocken", "Copos de avena", "Овсяные хлопья", "Płatki owsiane"],
  "Oats bowl": ["Bol de flocons d'avoine", "Haferflocken-Bowl", "Bol de copos de avena", "Боул из овсяных хлопьев", "Miska płatków owsianych"],
  "Olive oil dressing": ["Vinaigrette à l'huile d'olive", "Olivenöl-Dressing", "Aliño de aceite de oliva", "Заправка с оливковым маслом", "Dressing z oliwy"],
  "Overnight oats": ["Overnight oats", "Overnight Oats", "Avena de la noche", "Овсянка на ночь", "Owsianka na noc"],
  "Plain rolled oats": ["Flocons d'avoine nature", "Haferflocken natur", "Copos de avena naturales", "Овсяные хлопья без добавок", "Naturalne płatki owsiane"],
  "Sardines": ["Sardines", "Sardinen", "Sardinas", "Сардины", "Sardynki"],
  "Toast": ["Toast", "Toast", "Tostada", "Тост", "Tost"],
  "Tuna": ["Thon", "Thunfisch", "Atún", "Тунец", "Tuńczyk"],
  "Yogurt & oats": ["Yaourt et flocons d'avoine", "Joghurt und Haferflocken", "Yogur y avena", "Йогурт и овсянка", "Jogurt i płatki owsiane"],
  "Apple": ["Pomme", "Apfel", "Manzana", "Яблоко", "Jabłko"],
  "Apple cinnamon porridge": ["Flocons d'avoine pomme-cannelle", "Apfel-Zimt-Porridge", "Gachas de manzana y canela", "Овсянка с яблоком и корицей", "Owsianka jabłkowo-cynamonowa"],
  "Baby spinach": ["Jeunes pousses d'épinards", "Babyspinat", "Espinacas baby", "Молодой шпинат", "Młody szpinak"],
  "Baking powder": ["Levure chimique", "Backpulver", "Levadura en polvo", "Разрыхлитель", "Proszek do pieczenia"],
  "Banana": ["Banane", "Banane", "Plátano", "Банан", "Banan"],
  "Banana oat pancakes": ["Pancakes banane-avoine", "Bananen-Hafer-Pfannkuchen", "Tortitas de plátano y avena", "Овсяные панкейки с бананом", "Naleśniki owsiano-bananowe"],
  "Basmati rice": ["Riz basmati", "Basmatireis", "Arroz basmati", "Рис басмати", "Ryż basmati"],
  "Basmati rice, dry": ["Riz basmati, sec", "Basmatireis, trocken", "Arroz basmati, seco", "Рис басмати, сухой", "Ryż basmati, suchy"],
  "Bean & vegetable basmati rice stir-fry": ["Wok de riz basmati aux haricots et légumes", "Basmatireis-Pfanne mit Bohnen und Gemüse", "Salteado de arroz basmati con alubias y verduras", "Рис басмати с фасолью и овощами", "Ryż basmati z fasolą i warzywami"],
  "Beef mince": ["Bœuf haché", "Rinderhackfleisch", "Carne picada de ternera", "Говяжий фарш", "Mielona wołowina"],
  "Berry overnight oats": ["Overnight oats aux fruits rouges", "Overnight Oats mit Beeren", "Avena de la noche con frutos rojos", "Овсянка на ночь с ягодами", "Owsianka na noc z jagodami"],
  "Berry yogurt oats": ["Flocons d'avoine, yaourt et fruits rouges", "Haferflocken mit Joghurt und Beeren", "Avena con yogur y frutos rojos", "Овсянка с йогуртом и ягодами", "Płatki owsiane z jogurtem i jagodami"],
  "Black beans": ["Haricots noirs", "Schwarze Bohnen", "Alubias negras", "Чёрная фасоль", "Czarna fasola"],
  "Black beans, drained": ["Haricots noirs, égouttés", "Schwarze Bohnen, abgetropft", "Alubias negras, escurridas", "Чёрная фасоль, без жидкости", "Czarna fasola, odsączona"],
  "Bread": ["Pain", "Brot", "Pan", "Хлеб", "Chleb"],
  "Bread + jam": ["Pain + confiture", "Brot + Marmelade", "Pan + mermelada", "Хлеб + джем", "Chleb + dżem"],
  "Bread roll": ["Petit pain", "Brötchen", "Panecillo", "Булочка", "Bułka"],
  "Bread with jam": ["Pain à la confiture", "Brot mit Marmelade", "Pan con mermelada", "Хлеб с джемом", "Chleb z dżemem"],
  "Canned sardines": ["Sardines en conserve", "Sardinen aus der Dose", "Sardinas en conserva", "Консервированные сардины", "Sardynki z puszki"],
  "Canned tuna": ["Thon en conserve", "Thunfisch aus der Dose", "Atún en conserva", "Консервированный тунец", "Tuńczyk z puszki"],
  "Carrot": ["Carotte", "Karotte", "Zanahoria", "Морковь", "Marchewka"],
  "Carrot & lentil soup": ["Soupe carottes-lentilles", "Karotten-Linsen-Suppe", "Sopa de zanahoria y lentejas", "Суп из моркови и чечевицы", "Zupa marchewkowo-soczewicowa"],
  "Carrots": ["Carottes", "Karotten", "Zanahorias", "Морковь", "Marchewki"],
  "Cheddar": ["Cheddar", "Cheddar", "Cheddar", "Чеддер", "Cheddar"],
  "Cherry tomatoes": ["Tomates cerises", "Kirschtomaten", "Tomates cherry", "Помидоры черри", "Pomidorki koktajlowe"],
  "Chia seeds": ["Graines de chia", "Chiasamen", "Semillas de chía", "Семена чиа", "Nasiona chia"],
  "Chicken & sweet potato tray": ["Poulet et patate douce au four", "Hähnchen mit Süßkartoffeln vom Blech", "Pollo y boniato al horno", "Курица с бататом на противне", "Kurczak z batatami z blachy"],
  "Chicken breast": ["Blanc de poulet", "Hähnchenbrust", "Pechuga de pollo", "Куриная грудка", "Pierś z kurczaka"],
  "Chicken thigh": ["Cuisse de poulet", "Hähnchenschenkel", "Muslo de pollo", "Куриное бедро", "Udko z kurczaka"],
  "Chicken wrap": ["Wrap au poulet", "Hähnchen-Wrap", "Wrap de pollo", "Ролл с курицей", "Wrap z kurczakiem"],
  "Chickpea crunch bowl": ["Bowl croustillant aux pois chiches", "Knuspriger Kichererbsen-Bowl", "Bowl crujiente de garbanzos", "Боул с хрустящим нутом", "Miska z chrupiącą ciecierzycą"],
  "Chickpeas": ["Pois chiches", "Kichererbsen", "Garbanzos", "Нут", "Ciecierzyca"],
  "Chickpeas, drained": ["Pois chiches, égouttés", "Kichererbsen, abgetropft", "Garbanzos, escurridos", "Нут, без жидкости", "Ciecierzyca, odsączona"],
  "Chives": ["Ciboulette", "Schnittlauch", "Cebollino", "Зелёный лук", "Szczypiorek"],
  "Chopped tomatoes": ["Tomates concassées", "Gehackte Tomaten", "Tomate troceado", "Рубленые томаты", "Pomidory krojone"],
  "Cooked chicken": ["Poulet cuit", "Gekochtes Hähnchen", "Pollo cocinado", "Варёная курица", "Gotowany kurczak"],
  "Cottage cheese": ["Fromage blanc en grains", "Hüttenkäse", "Requesón", "Зернёный творог", "Twaróg ziarnisty"],
  "Cucumber": ["Concombre", "Gurke", "Pepino", "Огурец", "Ogórek"],
  "Custom typical breakfast": ["Petit-déjeuner habituel personnalisé", "Eigenes typisches Frühstück", "Desayuno habitual personalizado", "Мой привычный завтрак", "Własne typowe śniadanie"],
  "Dried herbs": ["Herbes séchées", "Getrocknete Kräuter", "Hierbas secas", "Сушёные травы", "Suszone zioła"],
  "Easy veggie basmati rice": ["Riz basmati facile aux légumes", "Einfacher Basmatireis mit Gemüse", "Arroz basmati fácil con verduras", "Простой рис басмати с овощами", "Łatwy ryż basmati z warzywami"],
  "Egg": ["Œuf", "Ei", "Huevo", "Яйцо", "Jajko"],
  "Egg & potato salad": ["Salade d'œufs et pommes de terre", "Ei-Kartoffel-Salat", "Ensalada de huevo y patata", "Салат из яиц и картофеля", "Sałatka jajeczno-ziemniaczana"],
  "Egg & spinach toast": ["Toast œuf-épinards", "Toast mit Ei und Spinat", "Tostada de huevo y espinacas", "Тост с яйцом и шпинатом", "Tost z jajkiem i szpinakiem"],
  "Eggs": ["Œufs", "Eier", "Huevos", "Яйца", "Jajka"],
  "Eggs + toast": ["Œufs + toast", "Eier + Toast", "Huevos + tostada", "Яйца + тост", "Jajka + tosty"],
  "Eggs on toast": ["Œufs sur toast", "Eier auf Toast", "Huevos sobre tostada", "Яйца на тосте", "Jajka na tostach"],
  "Frozen berries": ["Fruits rouges surgelés", "Tiefgekühlte Beeren", "Frutos rojos congelados", "Замороженные ягоды", "Mrożone owoce jagodowe"],
  "Frozen minced beef": ["Bœuf haché surgelé", "Tiefgekühltes Rinderhack", "Carne picada de ternera congelada", "Замороженный говяжий фарш", "Mrożona mielona wołowina"],
  "Frozen mixed vegetables": ["Mélange de légumes surgelés", "Tiefgekühltes Mischgemüse", "Verduras mixtas congeladas", "Замороженная овощная смесь", "Mrożona mieszanka warzyw"],
  "Garlic": ["Ail", "Knoblauch", "Ajo", "Чеснок", "Czosnek"],
  "Green beans": ["Haricots verts", "Grüne Bohnen", "Judías verdes", "Стручковая фасоль", "Fasolka szparagowa"],
  "Ground cinnamon": ["Cannelle moulue", "Gemahlener Zimt", "Canela molida", "Молотая корица", "Cynamon mielony"],
  "Honey": ["Miel", "Honig", "Miel", "Мёд", "Miód"],
  "Hummus": ["Houmous", "Hummus", "Hummus", "Хумус", "Hummus"],
  "Jam": ["Confiture", "Marmelade", "Mermelada", "Джем", "Dżem"],
  "Leafy greens": ["Légumes verts à feuilles", "Blattgemüse", "Verduras de hoja verde", "Листовая зелень", "Warzywa liściaste"],
  "Lemon juice": ["Jus de citron", "Zitronensaft", "Zumo de limón", "Лимонный сок", "Sok z cytryny"],
  "Lemony chicken & greens": ["Poulet citronné aux légumes verts", "Zitronenhähnchen mit Grünzeug", "Pollo al limón con verduras", "Лимонная курица с зеленью", "Cytrynowy kurczak z zielenią"],
  "Lentil tomato soup": ["Soupe de lentilles à la tomate", "Linsen-Tomaten-Suppe", "Sopa de lentejas y tomate", "Томатный суп с чечевицей", "Zupa pomidorowa z soczewicą"],
  "Lentils (dry)": ["Lentilles (sèches)", "Linsen (trocken)", "Lentejas (secas)", "Чечевица (сухая)", "Soczewica (sucha)"],
  "Lentils, dry": ["Lentilles, sèches", "Linsen, trocken", "Lentejas, secas", "Чечевица, сухая", "Soczewica, sucha"],
  "Lettuce": ["Laitue", "Salat", "Lechuga", "Салат-латук", "Sałata"],
  "Loaded baked potato": ["Pomme de terre au four garnie", "Gefüllte Ofenkartoffel", "Patata asada rellena", "Запечённый картофель с начинкой", "Faszerowany pieczony ziemniak"],
  "Milk": ["Lait", "Milch", "Leche", "Молоко", "Mleko"],
  "Mustard": ["Moutarde", "Senf", "Mostaza", "Горчица", "Musztarda"],
  "Oatmeal + milk": ["Flocons d'avoine + lait", "Haferbrei + Milch", "Avena + leche", "Овсянка + молоко", "Owsianka + mleko"],
  "Oatmeal with milk": ["Flocons d'avoine au lait", "Haferbrei mit Milch", "Avena con leche", "Овсянка на молоке", "Owsianka na mleku"],
  "Olive oil": ["Huile d'olive", "Olivenöl", "Aceite de oliva", "Оливковое масло", "Oliwa z oliwek"],
  "One-pan tomato chicken": ["Poulet à la tomate en poêle", "Tomatenhähnchen aus einer Pfanne", "Pollo con tomate en una sartén", "Курица с томатами на одной сковороде", "Kurczak w pomidorach z jednej patelni"],
  "Onion": ["Oignon", "Zwiebel", "Cebolla", "Лук", "Cebula"],
  "Parmesan": ["Parmesan", "Parmesan", "Parmesano", "Пармезан", "Parmezan"],
  "Pasta": ["Pâtes", "Nudeln", "Pasta", "Паста", "Makaron"],
  "Pasta, dry": ["Pâtes, sèches", "Nudeln, trocken", "Pasta, seca", "Паста, сухая", "Makaron, suchy"],
  "Plain yogurt": ["Yaourt nature", "Naturjoghurt", "Yogur natural", "Натуральный йогурт", "Jogurt naturalny"],
  "Pork mince": ["Porc haché", "Schweinehack", "Carne picada de cerdo", "Свиной фарш", "Mielona wieprzowina"],
  "Potato": ["Pomme de terre", "Kartoffel", "Patata", "Картофель", "Ziemniak"],
  "Potatoes": ["Pommes de terre", "Kartoffeln", "Patatas", "Картофель", "Ziemniaki"],
  "Red beans": ["Haricots rouges", "Rote Bohnen", "Alubias rojas", "Красная фасоль", "Czerwona fasola"],
  "Red beans, drained": ["Haricots rouges, égouttés", "Rote Bohnen, abgetropft", "Alubias rojas, escurridas", "Красная фасоль, без жидкости", "Czerwona fasola, odsączona"],
  "Roasted veg & hummus bowl": ["Bowl de légumes rôtis et houmous", "Bowl mit Ofengemüse und Hummus", "Bowl de verduras asadas y hummus", "Боул с запечёнными овощами и хумусом", "Miska z pieczonymi warzywami i hummusem"],
  "Rolled oats": ["Flocons d'avoine", "Haferflocken", "Copos de avena", "Овсяные хлопья", "Płatki owsiane"],
  "Salsa": ["Salsa", "Salsa", "Salsa", "Сальса", "Salsa"],
  "Savory breakfast burrito": ["Burrito salé du petit-déjeuner", "Herzhafter Frühstücks-Burrito", "Burrito salado de desayuno", "Солёный завтрак-буррито", "Wytrawne burrito śniadaniowe"],
  "Sesame oil": ["Huile de sésame", "Sesamöl", "Aceite de sésamo", "Кунжутное масло", "Olej sezamowy"],
  "Skyr": ["Skyr", "Skyr", "Skyr", "Скир", "Skyr"],
  "Soy sauce": ["Sauce soja", "Sojasauce", "Salsa de soja", "Соевый соус", "Sos sojowy"],
  "Spinach and leafy greens": ["Épinards et légumes verts", "Spinat und Blattgemüse", "Espinacas y verduras de hoja", "Шпинат и листовая зелень", "Szpinak i warzywa liściaste"],
  "Sweet potato": ["Patate douce", "Süßkartoffel", "Boniato", "Батат", "Batat"],
  "Sweetcorn": ["Maïs doux", "Zuckermais", "Maíz dulce", "Сладкая кукуруза", "Kukurydza"],
  "Tomato": ["Tomate", "Tomate", "Tomate", "Помидор", "Pomidor"],
  "Tomato & spinach pasta": ["Pâtes tomate-épinards", "Pasta mit Tomaten und Spinat", "Pasta con tomate y espinacas", "Паста с томатами и шпинатом", "Makaron z pomidorami i szpinakiem"],
  "Tomato & white bean toast": ["Toast tomate et haricots blancs", "Toast mit Tomaten und weißen Bohnen", "Tostada de tomate y alubias blancas", "Тост с томатами и белой фасолью", "Tost z pomidorami i białą fasolą"],
  "Tomatoes": ["Tomates", "Tomaten", "Tomates", "Помидоры", "Pomidory"],
  "Vegetable oil": ["Huile végétale", "Pflanzenöl", "Aceite vegetal", "Растительное масло", "Olej roślinny"],
  "Vegetable stock": ["Bouillon de légumes", "Gemüsebrühe", "Caldo de verduras", "Овощной бульон", "Bulion warzywny"],
  "Water": ["Eau", "Wasser", "Agua", "Вода", "Woda"],
  "White beans": ["Haricots blancs", "Weiße Bohnen", "Alubias blancas", "Белая фасоль", "Biała fasola"],
  "White beans, drained": ["Haricots blancs, égouttés", "Weiße Bohnen, abgetropft", "Alubias blancas, escurridas", "Белая фасоль, без жидкости", "Biała fasola, odsączona"],
  "Wrap": ["Wrap", "Wrap", "Wrap", "Лепёшка тортилья", "Tortilla wrap"],
  "Yogurt & banana bowl": ["Bol de yaourt et banane", "Joghurt-Bananen-Bowl", "Bol de yogur y plátano", "Боул с йогуртом и бананом", "Miska z jogurtem i bananem"],
  "Yogurt, fruit & oats": ["Yaourt, fruits et flocons d'avoine", "Joghurt, Obst und Haferflocken", "Yogur, fruta y avena", "Йогурт, фрукты и овсянка", "Jogurt, owoce i płatki owsiane"],
  "Yogurt, fruit + oats": ["Yaourt, fruits + flocons d'avoine", "Joghurt, Obst + Haferflocken", "Yogur, fruta + avena", "Йогурт, фрукты + овсянка", "Jogurt, owoce + płatki owsiane"],
  "Orange": ["Orange", "Orange", "Naranja", "Апельсин", "Pomarańcza"],
  "Pear": ["Poire", "Birne", "Pera", "Груша", "Gruszka"],
  "Raisins": ["Raisins secs", "Rosinen", "Pasas", "Изюм", "Rodzynki"],
  "Bell pepper": ["Poivron", "Paprika", "Pimiento", "Болгарский перец", "Papryka"],
  "Broccoli": ["Brocoli", "Brokkoli", "Brócoli", "Брокколи", "Brokuły"],
  "Cabbage": ["Chou", "Kohl", "Repollo", "Капуста", "Kapusta"],
  "Frozen peas": ["Petits pois surgelés", "Tiefgekühlte Erbsen", "Guisantes congelados", "Замороженный горошек", "Mrożony groszek"],
  "Mushrooms": ["Champignons", "Champignons", "Champiñones", "Шампиньоны", "Pieczarki"],
  "Zucchini": ["Courgette", "Zucchini", "Calabacín", "Кабачок", "Cukinia"],
  "Frozen white fish": ["Poisson blanc surgelé", "Tiefgekühlter Weißfisch", "Pescado blanco congelado", "Замороженная белая рыба", "Mrożona biała ryba"],
  "Tofu": ["Tofu", "Tofu", "Tofu", "Тофу", "Tofu"],
  "Mozzarella": ["Mozzarella", "Mozzarella", "Mozzarella", "Моцарелла", "Mozzarella"],
  "Butter": ["Beurre", "Butter", "Mantequilla", "Сливочное масло", "Masło"],
  "Brown rice": ["Riz complet", "Naturreis", "Arroz integral", "Бурый рис", "Ryż brązowy"],
  "Brown rice, dry": ["Riz complet, sec", "Naturreis, trocken", "Arroz integral, seco", "Бурый рис, сухой", "Ryż brązowy, suchy"],
  "Couscous": ["Semoule de couscous", "Couscous", "Cuscús", "Кускус", "Kuskus"],
  "Couscous, dry": ["Semoule de couscous, sèche", "Couscous, trocken", "Cuscús, seco", "Кускус, сухой", "Kuskus, suchy"],
  "Sunflower oil": ["Huile de tournesol", "Sonnenblumenöl", "Aceite de girasol", "Подсолнечное масло", "Olej słonecznikowy"],
  "Rapeseed (canola) oil": ["Huile de colza", "Rapsöl", "Aceite de colza", "Рапсовое масло", "Olej rzepakowy"],
  "Rapeseed oil": ["Huile de colza", "Rapsöl", "Aceite de colza", "Рапсовое масло", "Olej rzepakowy"],
  "Peanut oil": ["Huile d'arachide", "Erdnussöl", "Aceite de cacahuete", "Арахисовое масло", "Olej arachidowy"],
  "Coconut oil": ["Huile de coco", "Kokosöl", "Aceite de coco", "Кокосовое масло", "Olej kokosowy"],
  "Vinegar": ["Vinaigre", "Essig", "Vinagre", "Уксус", "Ocet"],
  "Salt": ["Sel", "Salz", "Sal", "Соль", "Sól"],
  "Black pepper": ["Poivre noir", "Schwarzer Pfeffer", "Pimienta negra", "Чёрный перец", "Czarny pieprz"],
  "Ground paprika": ["Paprika en poudre", "Paprikapulver", "Pimentón molido", "Молотая паприка", "Papryka mielona"],
  "Curry powder": ["Curry en poudre", "Currypulver", "Curry en polvo", "Порошок карри", "Curry w proszku"],
  "Flour": ["Farine", "Mehl", "Harina", "Мука", "Mąka"],
  "Sugar": ["Sucre", "Zucker", "Azúcar", "Сахар", "Cukier"],
  "Peanut butter": ["Beurre de cacahuète", "Erdnussbutter", "Crema de cacahuete", "Арахисовая паста", "Masło orzechowe"],
  "Sunflower seeds": ["Graines de tournesol", "Sonnenblumenkerne", "Pipas de girasol", "Семечки подсолнечника", "Pestki słonecznika"],
  "Peanuts": ["Cacahuètes", "Erdnüsse", "Cacahuetes", "Арахис", "Orzeszki ziemne"]
};

const units: Record<string, [string, string, string, string, string]> = {
  clove: ["gousse", "Zehe", "diente", "зубчик", "ząbek"],
  large: ["gros", "groß", "grande", "крупный", "duży"],
  medium: ["moyen", "mittel", "mediano", "средний", "średni"],
  roll: ["petit pain", "Brötchen", "panecillo", "булочка", "bułka"],
  slice: ["tranche", "Scheibe", "rebanada", "ломтик", "kromka"],
  slices: ["tranches", "Scheiben", "rebanadas", "ломтика", "kromki"],
  tbsp: ["c. à soupe", "EL", "cda.", "ст. л.", "łyżka"],
  tsp: ["c. à café", "TL", "cdta.", "ч. л.", "łyżeczka"],
  L: ["L", "L", "L", "л", "l"],
  kg: ["kg", "kg", "kg", "кг", "kg"],
  g: ["g", "g", "g", "г", "g"],
  ml: ["ml", "ml", "ml", "мл", "ml"]
};

function lookup(table: Record<string, string[]>, key: string, language: string): string | undefined {
  const index = order.indexOf(language as FoodLanguage);
  if (index < 0) return undefined;
  return table[key]?.[index];
}

const lowerIndex: Record<string, string> = {};
for (const key of Object.keys(foods)) lowerIndex[key.toLowerCase()] = key;

function findFood(name: string, language: string): string | undefined {
  const exact = lookup(foods, name, language);
  if (exact) return exact;
  const key = lowerIndex[name.toLowerCase()];
  if (!key) return undefined;
  const value = lookup(foods, key, language);
  if (!value) return undefined;
  const startsLower = name[0] === name[0].toLowerCase();
  return startsLower && language !== "de" ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

export function translateFood(name: string, language: string): string {
  return findFood(name, language) ?? name;
}

const typeWords: Record<string, string[]> = {
  breakfast: ["Petit-déjeuner", "Frühstück", "Desayuno", "Завтрак", "Śniadanie"],
  lunch: ["Déjeuner", "Mittagessen", "Almuerzo", "Обед", "Obiad"],
  dinner: ["Dîner", "Abendessen", "Cena", "Ужин", "Kolacja"],
  snack: ["Collation", "Snack", "Tentempié", "Перекус", "Przekąska"]
};
const cheapWords = ["économique", "günstig", "económico", "бюджетный", "budżetowy"];
const mealWords = ["Repas", "Mahlzeit", "Comida", "Блюдо", "Posiłek"];
const withWords = ["avec", "mit", "con", "с", "z"];
const berryWords = ["aux fruits rouges", "mit Beeren", "con frutos rojos", "с ягодами", "z jagodami"];
const yogurtWords = ["Yaourt avec", "Joghurt mit", "Yogur con", "Йогурт с", "Jogurt z"];
const dishWords = ["Plat", "Gericht", "Plato", "Блюдо", "Danie"];
const bowlWords = ["Bol", "Bowl", "Bowl", "Боул", "Miska"];

// Translates generated meal titles by pattern, falling back to the English text.
export function translateTitle(title: string, language: string): string {
  const index = order.indexOf(language as FoodLanguage);
  if (index < 0) return title;
  const direct = findFood(title, language);
  if (direct) return direct;
  const tr = (value: string) => translateTitle(value, language);
  let m = title.match(/^(.+) meal$/);
  if (m) return `${mealWords[index]}: ${m[1].split(" & ").map(tr).join(" & ")}`;
  m = title.match(/^Lower-cost (\w+) with (.+)$/i);
  if (m && typeWords[m[1].toLowerCase()]) {
    return `${typeWords[m[1].toLowerCase()][index]} ${cheapWords[index]} ${withWords[index]} ${tr(m[2])}`;
  }
  m = title.match(/^Berry-topped (.+)$/i);
  if (m) return `${tr(m[1])} ${berryWords[index]}`;
  m = title.match(/^Yogurt with (.+)$/i);
  if (m) return `${yogurtWords[index]} ${tr(m[1])}`;
  m = title.match(/^(.+?),? tomato & spinach pasta$/i);
  if (m) return `${translateFood("Tomato & spinach pasta", language)} (${tr(m[1])})`;
  m = title.match(/^(.+?) & (.+) bowl$/);
  if (m && findFood(m[1], language) && findFood(m[2], language)) {
    return `${bowlWords[index]}: ${tr(m[1])} & ${tr(m[2])}`;
  }
  m = title.match(/^(.+) (?:& (?:vegetable rice|tomato soup|sweet potato tray|potato bowl|vegetable stir-fry)|(?:& )?greens)$/i);
  if (m) return `${dishWords[index]}: ${tr(m[1].replace(/^Lemony /i, ""))}`;
  m = title.match(/^(?:Lemony|One-pan tomato) (.+?)(?: & greens)?$/i);
  if (m) return `${dishWords[index]}: ${tr(m[1])}`;
  m = title.match(/^(.+) & (.+)$/);
  if (m) return `${tr(m[1])} & ${tr(m[2])}`;
  m = title.match(/^(.+?) (bowl|wrap|soup|pasta|rice|toast)$/i);
  if (m && findFood(m[1], language)) return `${dishWords[index]}: ${tr(m[1])}`;
  m = title.match(/^(\S+(?: mince)?) (.+)$/);
  if (m && findFood(m[1], language) && findFood(m[2], language)) return `${tr(m[2])} (${tr(m[1])})`;
  return title;
}

export function translateUnit(unit: string, language: string): string {
  return lookup(units, unit, language) ?? unit;
}

// Translates "A · B · C" style descriptions piece by piece.
export function translateDescriptionPart(part: string, language: string): string {
  return translateFood(part.trim(), language);
}

export function hasFoodTranslation(name: string): boolean {
  return name.toLowerCase() in lowerIndex;
}
