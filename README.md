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
| Зробити відео одною командою | `/generate` (зупиняється лише на гейтах, які не відкриті в `config.json`) |
| Те саме без жодних питань | `/generate --unattended` (усі гейти схвалення відкриті лише для цього запуску) |
| Продовжити перерване відео (ліміт, збій, зупинка) | `/generate --resume` або `/generate --resume <slug>` (без slug — останнє незавершене) |
| Отримати 10 тем з оцінками (1–5: hook, visual, depth, facts, variety) | `/topics` |
| Автоматично взяти тему з найвищим балом і зробити бриф | `/topics-auto` |
| Обрати тему (+ мови) | відповісти `3` або `3 uk ru` → бриф запускається сам |
| Зробити відео | `/produce <slug>` → в кінці подивитись прев'ю і натиснути Approve |
| Додати мову до готового відео | `/brief <slug> uk`, потім `/produce <slug> uk` |
| Перенести покращення компонентів у шаблон | `/promote <slug>` |

Готові файли: `videos/<slug>/out/` — `<slug>.<мова>.mp4`, `cover.<мова>.png`, `upload.<мова>.json` (все для публікації в TikTok); текст допису, хештеги й закріплений коментар — у `videos/<slug>/MARKETING.md`. Автоматична публікація вимкнена (`publish: "off"`): завантажуєш відео вручну.

## Гейти й прапорці (`config.json → pipeline`)
| Прапорець | За замовчуванням | Що робить |
| --- | --- | --- |
| `defaultLanguages` | `["en"]` | мови для `/generate` і `/topics-auto` |
| `autoSelectTopic` | `false` | `true` — бере тему з найвищим балом без питань |
| `autoStartProduction` | `false` | `true` — після брифу одразу йде в продакшн |
| `autoApprovePlan` | `false` | `true` — іде далі після `PLAN.md` без схвалення |
| `maxReviewLoops` | `2` | скільки раундів рев'ю можуть запускати виправлення; рев'юер працює щонайменше раз |
| `autoApprovePreview` | `false` | `true` — фінальний рендер без твого прев'ю, **лише** якщо останнє рев'ю = PASS |
| `autoPrepareUpload` | `false` | `true` — після фінального рендеру готує `upload.<мова>.json` без питань |
| `asyncMarketing` | `true` | маркетинг-агент стартує у фоні одразу після брифу |
| `autoPromoteKit` | `false` | `true` — сам переносить покращення компонентів у шаблон |
| `publish` | `"off"` | поки лише `off` (потім: draft / private / public) |

`false` = питає тебе (Approve / Request changes). `--unattended` відкриває лише гейти схвалення і не змінює `config.json`; `publish` та `autoPromoteKit` він не чіпає. Якщо останнє рев'ю = FAIL після `maxReviewLoops`, нічого цього не обходить: відео отримує статус `needs-owner`, причина — у `videos/<slug>/PENDING.md`; далі `/generate --resume`.

Налаштування допису TikTok (приватність, дует, stitch, коментарі, AI-мітка) — `config.json → marketing`.

## Логи
- `videos/<slug>/logs/pipeline.log` — детальна історія одного відео (кроки, рішення на гейтах, символи TTS, вердикти рев'ю, помилки, шляхи результатів).
- `logs/runs.log` у корені — короткий журнал запусків команд (`/generate`, `/produce`, `/brief`, `/topics`, `/topics-auto`, `/promote`): slug, прапорці, фінальний статус, тривалість.
- Формат рядка: `час | slug | крок | результат | деталі`. Обидва файли в `.gitignore`.

## Без API
Поклади свою озвучку як `videos/<slug>/audio/voice.<мова>.mp3` перед `/produce` — таймінги візьмуться з пауз.

## Безкоштовний тариф ElevenLabs
10 000 символів/міс (~5 мовних версій відео). Лише для тестів: комерційне використання на Free заборонене — для монетизації потрібен хоча б Starter.
