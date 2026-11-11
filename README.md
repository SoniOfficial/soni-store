# SONI STORE V1.1

Мағозаи вебии барномаҳои SONI. Барои GitHub Pages сохта шудааст; сервери алоҳида талаб намекунад.

## Имкониятҳо
- Каталог, категорияҳо ва ҷустуҷӯ
- Муфассалоти ҳар барнома
- Дӯстдоштаҳо (дар браузер бо localStorage нигоҳ дошта мешаванд)
- Галереяи скриншотҳо тавассути `screenshots` дар `data/apps.json`
- Пайванди зеркашии APK
- Дархости барномаи нав тавассути GitHub Issues
- Дизайни мутобиқ ба телефон ва компютер

## Иҷрои маҳаллӣ
Файлро мустақиман бо браузер кушодан мумкин аст, аммо барои `fetch()` беҳтар аст сервери оддӣ истифода шавад:
```bash
python -m http.server 8000
```
Баъд `http://localhost:8000`-ро кушоед.

## Илова кардани APK
1. Дар GitHub repository ба **Releases** гузаред.
2. Release-и нав созед ва APK-ро upload кунед.
3. Download URL-и APK-ро нусха кунед.
4. Дар `data/apps.json`, майдони `downloadUrl`-и барномаи дахлдорро бо URL иваз кунед.
5. Тағйиротро commit ва push кунед.

## Илова кардани скриншот
Суратҳоро дар папкаи `assets/` ҷойгир кунед. Дар объекти барнома:
```json
"screenshots": ["assets/screenshot-1.png", "assets/screenshot-2.png"]
```

## GitHub Pages
Дар repository: **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
Пас аз нашр суроғаи саҳифа чунин мешавад:
`https://soniofficial.github.io/soni-store/`

## Дархости барнома
Тугмаи дархост GitHub Issues-ро мекушояд. Барои фиристодани Issue корбар бояд ба GitHub ворид шуда, дархостро тасдиқ кунад.

© SoniOfficial
