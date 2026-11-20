# Готовые ролики

## Что если ты станешь невидимым на 30 дней
1080p, 16:9, 17:11. Разбит на две части, потому что GitHub не принимает файлы больше 100 МБ.

- [Часть 1 (0:00–8:33)](chto-esli-nevidimyj-30-dnej-chast-1.mp4)
- [Часть 2 (8:33–17:11)](chto-esli-nevidimyj-30-dnej-chast-2.mp4)

Склеить в один файл: `ffmpeg -f concat -safe 0 -i <(printf "file '%s'\n" $PWD/chto-esli-nevidimyj-30-dnej-chast-*.mp4) -c copy video.mp4`
