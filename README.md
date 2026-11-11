# SONI STORE V1.0

Мағозаи рақамии SoniOfficial — каталоги барномаҳо ва бозиҳо бо имкони дархости барномаи нав.

## Технология
- HTML, CSS, JavaScript
- Каталог аз `data/apps.json`
- GitHub Pages барои хостинг
- GitHub Releases барои файлҳои APK
- GitHub Issues барои дархостҳо ва пайгирии ҳолат

## Оғози зуд
1. Repository-и `soni-store` созед ва Public интихоб кунед.
2. Ҳамаи файлҳои ин лоиҳаро ба решаи repository бор кунед.
3. Дар GitHub ба **Settings → Pages** равед.
4. Дар **Build and deployment** манбаи **Deploy from a branch**-ро интихоб кунед.
5. Branch: `main`, Folder: `/ (root)` ва Save.
6. Пас аз нашр сайт дар `https://soniofficial.github.io/soni-store/` дастрас мешавад.

## Илова кардани барнома
Файли `data/apps.json`-ро таҳрир кунед ва объекти навро ба массиви `apps` илова намоед:

```json
{
  "id": "my-app",
  "name": "НОМИ БАРНОМА",
  "category": "Барномаҳо",
  "icon": "📱",
  "description": "Тавсифи барнома",
  "version": "1.0.0",
  "size": "25 MB",
  "developer": "SoniOfficial",
  "downloadUrl": "https://github.com/SoniOfficial/soni-store/releases/download/v1.0/my-app.apk",
  "tags": "андроид барнома"
}
```

Барои нашри APK:
1. Дар repository ба **Releases → Create a new release** равед.
2. Tag созед, масалан `v1.0`.
3. APK-ро ҳамчун asset бор кунед ва Release-ро нашр кунед.
4. Пайванди воқеии APK-ро ба `downloadUrl` дар `data/apps.json` гузоред.

## Дархостҳо
Форма корбарро ба GitHub Issues мебарад. Барои сохтани Issue корбар бояд ба GitHub ворид шуда, фиристоданро тасдиқ кунад. Барои фаъол шудани label-и `app-request`, онро як бор дар **Issues → Labels** созед. Ҳолати Issue-и public тавассути GitHub API хонда мешавад.

## Муҳим
- Ин версия serverless аст; сервери шахсӣ ё базаи хусусӣ надорад.
- Repository бояд Public бошад, то GitHub Pages ва API-и оммавӣ дуруст кор кунанд.
- Ба `downloadUrl` танҳо пайванди APK-и воқеан нашршударо гузоред.
- Пеш аз насби APK, Android метавонад иҷозати насб аз манбаи берунаро талаб кунад.
