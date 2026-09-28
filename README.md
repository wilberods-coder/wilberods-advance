# wilberods — ADVANCE

Интерактивное портфолио с 3D-консолью Game Boy Advance SP и игрой Neon Arena.

Сайт: https://wilberods-coder.github.io/wilberods-advance/

## Локальный запуск

```sh
python3 -m http.server 8000
```

Откройте http://localhost:8000. Сборка и установка зависимостей не требуются.

## Публикация

GitHub Pages публикует корень ветки `main`. Изменения в этой ветке автоматически обновляют сайт.

## Управление

- Пробел или Enter — открыть портфолио.
- Стрелки и Enter — выбрать пункт меню.
- WASD / стрелки — движение в игре, пробел — огонь.
- P — пауза, Escape — вернуться в меню.
- На телефоне доступны экранные кнопки.

## Зависимости

Three.js r170 включён локально в `vendor/three.module.js`. Лицензия: `vendor/THREE-LICENSE.txt`.
Шрифт Manrope загружается из Google Fonts; при недоступности используется системный шрифт.
