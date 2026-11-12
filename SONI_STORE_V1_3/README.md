# SONI STORE V1.3

Мағозаи вебии барномаҳо бо HTML, CSS ва JavaScript — барои GitHub Pages.

## Имкониятҳо
- Каталог, ҷустуҷӯ, категорияҳо ва ҷобаҷогузорӣ
- Дӯстдоштаҳо
- Саҳифаи муфассали барнома
- Рейтинг ва шарҳҳо (дар localStorage-и браузер)
- Admin Panel: илова, таҳрир ва нест кардани барномаҳо
- Import / Export каталоги `apps.json`
- Дархости барнома тавассути GitHub Issues
- Дизайни responsive барои телефон ва компютер

## Оғози кор
1. Ҳамаи файлҳоро ба repository-и `SoniOfficial/soni-store` гузоред.
2. Дар GitHub ба **Settings → Pages** гузаред.
3. Source-ро ба **Deploy from a branch**, branch-и `main` ва folder-и `/ (root)` монед.
4. Сайт: https://soniofficial.github.io/soni-store/

## Илова кардани APK
1. Дар GitHub repository ба **Releases → Create a new release** равед.
2. APK-ро ҳамчун asset бор кунед.
3. Download URL-и файли APK-ро нусха гиред.
4. Дар Admin Panel барномаро илова/таҳрир кунед ва URL-ро гузоред.
5. **Export JSON**-ро пахш кунед.
6. Файли зеркашишудаи `apps.json`-ро дар repository бо `data/apps.json` иваз кунед.
7. Commit ва push кунед.

## Admin Panel — маҳдудияти амниятӣ
Панели Admin дар ин версия панели браузерӣ аст, на панели серверӣ. Он тағйиротро дар `localStorage`-и браузери шумо нигоҳ медорад. Барои он ки тағйирот ба ҳамаи меҳмонон намоён шавад, каталоги JSON-ро Export карда, ба `data/apps.json` дар GitHub гузоред ва commit/push кунед.

**GitHub token ё пароли махфиро ба JavaScript-и сайт нагузоред.** Барои навсозии мустақим аз дохили сайт backend-и амн ё GitHub App/OAuth бо сервер лозим аст.

## Рейтинг ва шарҳҳо
Дар V1.3 рейтинг ва шарҳҳо дар браузери ҳамон меҳмон нигоҳ дошта мешаванд. Барои шарҳҳои умумӣ, ки ҳамаи меҳмонон мебинанд, backend ё хидмати махсус лозим аст.

## Формати apps.json
Ҳар объект бояд ҳадди ақал `id`, `name`, `category` ва `description` дошта бошад. Майдонҳои `downloadUrl`, `icon` ва `website` бояд URL-и пурраи `https://` бошанд ё холӣ монанд.
