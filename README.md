# TikTok Videomaker — як запустити

## Що встановити (один раз)
1. **Node.js 22+** і **FFmpeg** (щоб працювали `node -v` і `ffmpeg -version`).
2. **Claude Code**.
3. Плагін **HyperFrames**, у терміналі:
   ```
   claude plugin marketplace add heygen-com/hyperframes
   claude plugin install hyperframes@hyperframes
   ```
   (або всередині Claude Code: `/plugin marketplace add heygen-com/hyperframes`, потім `/plugin install hyperframes@hyperframes`).

## Налаштування (один раз)
1. Розпакуй архів, відкрий папку в терміналі.
2. Скопіюй `.env.example` → `.env` і впиши `ELEVENLABS_API_KEY=...` (ElevenLabs → профіль → API Keys).
3. У `config.json` → `tts.voices` впиши `voice_id` голосу для кожної мови (ElevenLabs → Voices → голос → «Copy voice ID»).
4. За бажанням: поклади `assets/music.mp3` (луп на 10–30 с) — музика буде в усіх відео. Немає файлу — немає музики.
5. Запусти `claude` у папці, переключи `/model opus`, встав вміст `BOOTSTRAP_PROMPT.md`. Він створить шаблон, компоненти й покаже тестовий ролик на 15 с — затвердь стиль.

## Щоденна робота
| Що робиш | Команда |
| --- | --- |
| Отримати 10 тем | `/topics` |
| Обрати тему (+ мови) | відповісти `3` або `3 uk ru` → бриф запускається сам |
| Зробити відео | `/produce <slug>` → в кінці подивитись прев'ю і натиснути Approve |
| Додати мову до готового відео | `/brief <slug> uk`, потім `/produce <slug> uk` |
| Перенести покращення компонентів у шаблон | `/promote <slug>` |

Готові файли: `videos/<slug>/out/` — `<slug>.<мова>.mp4`, `cover.<мова>.png`, `post.<мова>.txt`.

## Без API
Поклади свою озвучку як `videos/<slug>/audio/voice.<мова>.mp3` перед `/produce` — таймінги візьмуться з пауз.

## Безкоштовний тариф ElevenLabs
10 000 символів/міс (~5 мовних версій відео). Лише для тестів: комерційне використання на Free заборонене — для монетизації потрібен хоча б Starter.
