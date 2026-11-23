# Готовые ролики

## Что если ты станешь невидимым на 30 дней
1080p, 16:9, 17:11. Разбит на две части, потому что GitHub не принимает файлы больше 100 МБ.

- [Часть 1 (0:00–8:33)](chto-esli-nevidimyj-30-dnej-chast-1.mp4)
- [Часть 2 (8:33–17:11)](chto-esli-nevidimyj-30-dnej-chast-2.mp4)

Склеить в один файл: `ffmpeg -f concat -safe 0 -i <(printf "file '%s'\n" $PWD/chto-esli-nevidimyj-30-dnej-chast-*.mp4) -c copy video.mp4`

## Что если отмотать 10 секунд
1080p, 16:9, 21:30. Три части (GitHub не принимает файлы больше 100 МБ).

- [Часть 1 (0:00–7:11)](chto-esli-otmotat-10-sekund-chast-1.mp4)
- [Часть 2 (7:11–14:21)](chto-esli-otmotat-10-sekund-chast-2.mp4)
- [Часть 3 (14:21–21:30)](chto-esli-otmotat-10-sekund-chast-3.mp4)
