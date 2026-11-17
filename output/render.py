"""Motion-graphics renderer: 1920x1080 @ 60fps, synced to voiceover word timings.
Usage: python3 render.py START_FRAME END_FRAME OUT.mp4   (or: python3 render.py still T out.png)
"""
import sys, math, random, subprocess, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops, ImageEnhance

W, H, FPS = 1920, 1080, 60
DUR = 30.0
D = '/tmp/claude-0/-home-user-Mark/91431032-9b0d-52f7-aeb3-bc0cbb0784a2/scratchpad/'
IMG = D + 'img/'

RED = (232, 30, 48); RED2 = (255, 70, 80); BLACK = (12, 10, 16)
GREEN = (126, 255, 92); PURPLE = (150, 70, 255); VIOLET = (60, 18, 110)
WHITE = (255, 255, 255); CYAN = (110, 230, 255); PINK = (255, 120, 200)

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, t0, d): return clamp((t - t0) / d)
def eout(x): return 1 - (1 - x) ** 3
def eout5(x): return 1 - (1 - x) ** 5
def ein(x): return x ** 3
def einout(x): return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def eback(x, s=1.7):
    x -= 1; return x * x * ((s + 1) * x + s) + 1
def lerp(a, b, p): return a + (b - a) * p
def window(t, t0, t1, fin=.35, fout=.35):
    """0..1 fade-in at t0, fade-out ending at t1"""
    return clamp(min((t - t0) / fin, (t1 - t) / fout))

# ---------------------------------------------------------------- fonts / text
F_HEAD = D + 'fonts/Unbounded-ExtraBold.ttf'
F_BOLD = D + 'fonts/Montserrat-ExtraBold.ttf'
F_SEMI = D + 'fonts/Montserrat-SemiBold.ttf'

@functools.lru_cache(None)
def font(path, size): return ImageFont.truetype(path, size)

@functools.lru_cache(None)
def text_img(s, path, size, color=WHITE, tracking=0, glow=0, glowcol=None):
    f = font(path, size)
    widths = [f.getlength(c) + tracking for c in s]
    tw = int(sum(widths) - tracking) + 4
    asc, desc = f.getmetrics()
    pad = glow * 3
    im = Image.new('RGBA', (tw + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x = pad
    for c, w in zip(s, widths):
        d.text((x, pad), c, font=f, fill=color + (255,))
        x += w
    if glow:
        a = im.getchannel('A').filter(ImageFilter.GaussianBlur(glow))
        g = Image.new('RGBA', im.size, (glowcol or color) + (0,)); g.putalpha(a.point(lambda v: min(255, v * 2)))
        g.alpha_composite(im); im = g
    return im

def mul_alpha(im, a):
    if a >= 0.999: return im
    im = im.copy(); im.putalpha(im.getchannel('A').point(lambda v: int(v * a)))
    return im

def paste(cv, im, x, y, alpha=1.0, anchor='lt'):
    """alpha-composite im on canvas at x,y (anchor lt / c / lc / rc / cb), with clipping"""
    if alpha <= 0.003 or im is None: return
    w, h = im.size
    if anchor == 'c': x, y = x - w / 2, y - h / 2
    elif anchor == 'lc': y = y - h / 2
    elif anchor == 'rc': x, y = x - w, y - h / 2
    elif anchor == 'cb': x, y = x - w / 2, y - h
    elif anchor == 'ct': x = x - w / 2
    elif anchor == 'rt': x = x - w
    x, y = int(round(x)), int(round(y))
    sx0, sy0 = max(0, -x), max(0, -y)
    sx1, sy1 = min(w, W - x), min(h, H - y)
    if sx1 <= sx0 or sy1 <= sy0: return
    part = im.crop((sx0, sy0, sx1, sy1)) if (sx0, sy0, sx1, sy1) != (0, 0, w, h) else im
    cv.alpha_composite(mul_alpha(part, alpha), (x + sx0, y + sy0))

def reveal_text(cv, im, x, y, p, alpha=1.0, anchor='lt', direction='up'):
    """mask-reveal: text slides up from beneath an invisible baseline"""
    if p <= 0: return
    w, h = im.size
    box = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    q = eout5(p)
    if direction == 'up': box.paste(im, (0, int((1 - q) * h * 1.05)))
    else: box.paste(im, (int(-(1 - q) * w), 0))
    paste(cv, box, x, y, alpha, anchor)

def scaled(im, s):
    if abs(s - 1) < 0.002: return im
    return im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.BILINEAR)

def pill(text, path, size, bg, fg=WHITE, padx=26, pady=12, tracking=2):
    t = text_img(text, path, size, fg, tracking)
    f = font(path, size); asc, _ = f.getmetrics()
    bb = t.getbbox()
    th = bb[3] - bb[1]
    im = Image.new('RGBA', (t.width + padx * 2, th + pady * 2), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=im.height // 2, fill=bg + (255,))
    im.alpha_composite(t, (padx, pady - bb[1]))
    return im
pill = functools.lru_cache(None)(pill)

# ---------------------------------------------------------------- sprites
@functools.lru_cache(None)
def soft_dot(r, color, hard=0.35):
    s = r * 2 + 2
    yy, xx = np.mgrid[0:s, 0:s] - (s - 1) / 2
    d = np.sqrt(xx ** 2 + yy ** 2) / r
    a = np.clip((1 - d) / (1 - hard), 0, 1) ** 1.6
    arr = np.zeros((s, s, 4), np.uint8); arr[..., :3] = color; arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')

@functools.lru_cache(None)
def radial(rw, rh, color, a0=1.0):
    yy, xx = np.mgrid[0:rh * 2, 0:rw * 2]
    d = np.sqrt(((xx - rw) / rw) ** 2 + ((yy - rh) / rh) ** 2)
    a = np.clip(1 - d, 0, 1) ** 2 * a0
    arr = np.zeros((rh * 2, rw * 2, 4), np.uint8); arr[..., :3] = color; arr[..., 3] = (a * 255).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')

def grad_bg(c1, c2, angle_vertical=True):
    t = np.linspace(0, 1, H)[:, None] if angle_vertical else np.linspace(0, 1, W)[None, :]
    arr = np.zeros((H, W, 4), np.uint8)
    for i in range(3): arr[..., i] = (c1[i] + (c2[i] - c1[i]) * t).astype(np.uint8)
    arr[..., 3] = 255
    return Image.fromarray(arr, 'RGBA')

def vignette():
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / (W * .62)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2)
    a = np.clip(d - .55, 0, 1) ** 1.4 * 330
    arr = np.zeros((H, W, 4), np.uint8); arr[..., 3] = np.clip(a, 0, 210).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')

def load_char(name, height, glowcol=None, glowr=22):
    im = Image.open(IMG + name).convert('RGBA')
    im = im.crop(im.getchannel('A').getbbox())
    s = height / im.height
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    glow = None
    if glowcol:
        pad = glowr * 3
        g = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), glowcol + (0,))
        a = Image.new('L', g.size, 0); a.paste(im.getchannel('A'), (pad, pad))
        a = a.filter(ImageFilter.GaussianBlur(glowr)).point(lambda v: min(255, int(v * 1.6)))
        g.putalpha(a); glow = (g, pad)
    return im, glow

def draw_char(cv, ch, cx, by, s=1.0, alpha=1.0, glow_a=1.0):
    """place character by bottom-center (cx, by)"""
    im, glow = ch
    if glow and glow_a > 0:
        g, pad = glow
        gs = scaled(g, s)
        paste(cv, gs, cx, by + pad * s, alpha * glow_a, 'cb')
    paste(cv, scaled(im, s), cx, by, alpha, 'cb')

# ---------------------------------------------------------------- assets
print('loading assets', file=sys.stderr)
paris = Image.open(IMG + 'Miraculous_Season_6_Night_Poster_Paris_Background.jpg').convert('RGB')
paris = paris.resize((2240, 1260), Image.LANCZOS)
paris_dark = ImageEnhance.Brightness(paris).enhance(.55)
paris_blur = ImageEnhance.Brightness(paris.filter(ImageFilter.GaussianBlur(14))).enhance(.35)

C = {
    'monarch': load_char('Monarch_render.png', 900, PURPLE, 26),
    'chry': load_char('Chrysalis_Illusion_Form_Render.png', 1000, PURPLE, 30),
    'chry_true': load_char('Chrysalis_True_Form_Render.png', 980, (190, 120, 255), 34),
    'lb_jump': load_char('Ladybug_Season_6_Render_3.png', 700, RED2, 24),
    'lb2': load_char('S6_Ladybug_render_2.png', 900, RED2, 22),
    'lb4': load_char('S6_Ladybug_render_4.png', 560, RED2, 18),
    'cn_jump': load_char('Cat_Noir_Season_6_Render_2.png', 640, GREEN, 22),
    'cn2': load_char('S6_Cat_Noir_render_2.png', 900, GREEN, 22),
    'cn3': load_char('S6_Cat_Noir_render_3.png', 560, GREEN, 18),
    'bunny': load_char('Bunnyx_S6_Render.png', 330, CYAN, 18),
    'mari': load_char('Marinette_Season_6_Render_2.png', 560, PINK, 18),
}
adrien_s7 = Image.open(IMG + 'Adrien_Agreste_S7_Square.png').convert('RGBA').resize((330, 330), Image.LANCZOS)

VIG = vignette()
BG_PURPLE = grad_bg((34, 8, 62), (8, 4, 20))
BG_RED = grad_bg((214, 24, 40), (120, 6, 22))
BG_NAVY = grad_bg((14, 16, 38), (4, 4, 12))
BG_GREEN_PANEL = grad_bg((18, 24, 18), (4, 8, 6))

# ladybug-spot pattern (original abstract motif)
def spots_layer():
    im = Image.new('RGBA', (W + 400, H + 400), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    rnd = random.Random(7)
    for gy in range(0, H + 400, 180):
        for gx in range(0, W + 400, 210):
            r = rnd.randint(18, 46)
            x = gx + (105 if (gy // 180) % 2 else 0) + rnd.randint(-20, 20); y = gy + rnd.randint(-20, 20)
            d.ellipse((x - r, y - r, x + r, y + r), fill=(20, 4, 10, 70))
    return im
SPOTS = spots_layer()

# particles
def particles(cv, t, seed, n, color, area=(0, 0, W, H), speed=40, rmin=2, rmax=7, alpha=1.0, rise=True):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = area
    for i in range(n):
        px = rnd.uniform(x0, x1); py = rnd.uniform(y0, y1); sp = rnd.uniform(.4, 1.3) * speed
        r = rnd.randint(rmin, rmax); ph = rnd.uniform(0, 6.28); tw = rnd.uniform(1.5, 4)
        y = py - t * sp if rise else py
        h = y1 - y0
        y = y0 + (y - y0) % h
        x = px + math.sin(t * .8 + ph) * 26
        a = alpha * (.45 + .55 * (0.5 + 0.5 * math.sin(t * tw + ph)))
        paste(cv, soft_dot(r, color), x, y, a, 'c')

# ---------------------------------------------------------------- scenes
def kenburns(src, t, t0, t1, z0, z1, ox=0, oy=0):
    p = einout(prog(t, t0, t1 - t0))
    z = lerp(z0, z1, p)
    cw, ch = W / z * (src.width / 2240) * (2240 / W) / (2240 / W), H / z
    cw = src.width / z; ch = src.height / z
    cx = src.width / 2 + ox * p; cy = src.height / 2 + oy * p
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return src.resize((W, H), Image.BILINEAR, box=box).convert('RGBA')

def heart_poly(cx, cy, s, n=80):
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        x = 16 * math.sin(a) ** 3
        y = 13 * math.cos(a) - 5 * math.cos(2 * a) - 2 * math.cos(3 * a) - math.cos(4 * a)
        pts.append((cx + x * s, cy - y * s))
    return pts

def sceneA(t):  # 0 – 5.0  Season 6: new era after Monarch's defeat
    cv = kenburns(paris_dark, t, 0, 5.2, 1.0, 1.12, 60, -30)
    paste(cv, radial(700, 520, VIOLET, .8), -200, 300)
    particles(cv, t, 1, 40, (255, 210, 250), speed=30, rmin=1, rmax=4, alpha=.6)
    # left gradient for legibility
    paste(cv, LEFTSHADE, 0, 0, .9)
    # СЕЗОН + 6
    p = prog(t, .15, .7)
    reveal_text(cv, text_img('СЕЗОН', F_BOLD, 64, WHITE, 14), 150, 230, p)
    p6 = prog(t, .3, .9)
    if p6 > 0:
        six = text_img('6', F_HEAD, 400, RED2, 0, 18, RED)
        s = lerp(1.6, 1.0, eout5(p6)); paste(cv, scaled(six, s), 260, 520, clamp(p6 * 2.5), 'c')
    # Новая эпоха
    reveal_text(cv, text_img('ПАРИЖ', F_SEMI, 46, (255, 200, 210), 10), 470, 330, prog(t, 1.15, .6))
    reveal_text(cv, text_img('НОВАЯ', F_HEAD, 104, WHITE), 465, 395, prog(t, 2.35, .6))
    reveal_text(cv, text_img('ЭПОХА', F_HEAD, 104, WHITE), 465, 520, prog(t, 2.75, .6))
    # line
    pl = eout(prog(t, 2.4, .9))
    if pl > 0: ImageDraw.Draw(cv).rectangle((470, 668, 470 + int(560 * pl), 676), fill=RED2 + (255,))
    # Monarch appears then dissolves
    pm = prog(t, 3.15, .6)
    if pm > 0:
        diss = eout(prog(t, 4.3, .55))
        x = lerp(1950, 1500, eout5(pm)); y = 1060 - diss * 40
        ch = C['monarch']
        draw_char(cv, ch, x, y, 1.0, 1 - diss, .8)
        if diss > 0:
            particles(cv, t - 4.3, 33, 70, (200, 150, 255), area=(1300, 150 - 300 * diss, 1700, 1050 - 300 * diss), speed=220, rmin=2, rmax=9, alpha=diss * (1 - diss) * 3)
        # label + strike
        pl2 = prog(t, 3.6, .5)
        lab = text_img('МОНАРХ', F_HEAD, 64, WHITE)
        reveal_text(cv, lab, 1500, 110, pl2, 1.0, 'ct')
        ps = eout(prog(t, 4.2, .35))
        if ps > 0:
            dr = ImageDraw.Draw(cv); x0 = 1500 - lab.width / 2 - 10
            dr.rectangle((x0, 152, x0 + (lab.width + 20) * ps, 164), fill=RED2 + (255,))
            reveal_text(cv, pill('ПОВЕРЖЕН', F_BOLD, 30, RED), 1500, 215, prog(t, 4.25, .4), 1, 'ct')
    return cv

def sceneB(t):  # 5.0 – 11.6  Chrysalis
    cv = BG_PURPLE.copy()
    tt = t - 4.8
    paste(cv, radial(900, 700, (120, 40, 220), .55 + .1 * math.sin(t * 2)), 1300 - 900, 520 - 700)
    # rotating rings (original motif)
    ring = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(ring)
    for k, (r, w_, a) in enumerate([(380, 3, 90), (470, 2, 60), (560, 6, 30)]):
        ang = t * (20 + k * 12) * (1 if k % 2 else -1)
        dr.arc((1350 - r, 540 - r, 1350 + r, 540 + r), ang, ang + 250, fill=(190, 140, 255, a), width=w_)
    cv.alpha_composite(ring)
    particles(cv, t, 5, 60, (190, 130, 255), speed=60, rmin=2, rmax=8, alpha=.7)
    # true form ghost (from 10.4)
    pg = prog(t, 10.3, .8)
    if pg > 0:
        draw_char(cv, C['chry_true'], lerp(1750, 1650, eout(pg)), 1075, 1.0, .55 * eout(pg), 1.2)
    # Chrysalis slides in
    pc = prog(t, 5.6, .9)
    fl = math.sin(t * 1.6) * 8
    draw_char(cv, C['chry'], lerp(2300, 1300, eout5(pc)), 1080 + fl * .3, 1.0, clamp(pc * 3), .9 + .3 * math.sin(t * 3))
    paste(cv, LEFTSHADE, 0, 0, .7)
    # texts
    reveal_text(cv, pill('НОВАЯ ОПАСНАЯ ПРОТИВНИЦА', F_BOLD, 28, (120, 40, 220)), 150, 270, prog(t, 5.9, .5))
    ph = prog(t, 7.55, .5)
    if ph > 0:
        title = text_img('ХРИЗАЛИС', F_HEAD, 130, WHITE, 0, 14, PURPLE)
        gl = 1 - prog(t, 7.55, .45)
        if gl > 0.02:  # chromatic glitch on entry
            off = int(26 * gl * (1 if int(t * 60) % 2 else -1))
            r = text_img('ХРИЗАЛИС', F_HEAD, 130, (255, 40, 120))
            b = text_img('ХРИЗАЛИС', F_HEAD, 130, (40, 200, 255))
            paste(cv, r, 140 + off, 330, .7 * gl); paste(cv, b, 140 - off, 336, .7 * gl)
        reveal_text(cv, title, 140 - 42, 330 - 42, ph)
    reveal_text(cv, text_img('ЛИЛА РОССИ', F_SEMI, 46, (215, 190, 255), 8), 150, 505, prog(t, 8.1, .5))
    pb = eout(prog(t, 8.2, .6))
    if pb > 0: ImageDraw.Draw(cv).rectangle((150, 580, 150 + int(120 * pb), 586), fill=(190, 130, 255, 255))
    reveal_text(cv, text_img('ОБЛАДАТЕЛЬНИЦА', F_BOLD, 52, WHITE, 3), 150, 630, prog(t, 9.4, .5))
    reveal_text(cv, text_img('ТАЛИСМАНА БАБОЧКИ', F_BOLD, 52, (200, 150, 255), 3), 150, 700, prog(t, 10.35, .5))
    return cv

def sceneC(t):  # 11.6 – 19.5  Season 7: Marinette leads the team, relationship with Adrien
    cv = BG_RED.copy()
    paste(cv, SPOTS, -200 + (t * 30) % 210, -200 + (t * 18) % 180, 1)
    paste(cv, radial(800, 600, (255, 120, 120), .35), 600 - 800, 500 - 600)
    particles(cv, t, 9, 30, (255, 220, 220), speed=40, rmin=2, rmax=5, alpha=.5)
    # big СЕЗОН 7 intro, then shrinks to corner
    p7 = prog(t, 11.7, .6); pm = einout(prog(t, 12.55, .6))
    if p7 > 0:
        big = text_img('СЕЗОН 7', F_HEAD, 190, WHITE, 0, 16, (255, 60, 70))
        s = lerp(lerp(1.4, 1.0, eout5(p7)), .26, pm)
        x = lerp(W / 2, 175, pm); y = lerp(H / 2, 92, pm)
        paste(cv, scaled(big, s), x, y, clamp(p7 * 3), 'c')
    # split panel for Cat Noir (from 15.9)
    sp = eout5(prog(t, 15.85, .7))
    if sp > 0:
        panel = Image.new('L', (W, H), 0)
        x = lerp(W + 300, 1060, sp)
        ImageDraw.Draw(panel).polygon([(x + 220, 0), (W, 0), (W, H), (x - 80, H)], fill=255)
        g = BG_GREEN_PANEL.copy(); g.putalpha(panel)
        cv.alpha_composite(g)
        ImageDraw.Draw(cv).line([(x + 220, 0), (x - 80, H)], fill=GREEN + (255,), width=6)
        paste(cv, radial(500, 500, (40, 120, 30), .5), x + 300 - 500, 520 - 500)
        draw_char(cv, C['cn_jump'], lerp(2300, 1480, sp), 745 + math.sin(t * 1.7) * 10, .92, 1, 1)
    # Ladybug
    pl = prog(t, 12.75, .8)
    if pl > 0:
        lx = lerp(-500, 820, eout5(pl)) - 330 * sp
        draw_char(cv, C['lb_jump'], lx, 930 + math.sin(t * 1.9) * 12, 1.0, clamp(pl * 3), 1)
    # Marinette lower third
    ax = 120
    reveal_text(cv, text_img('МАРИНЕТТ', F_HEAD, 84, WHITE), ax, 760, prog(t, 12.85, .5))
    reveal_text(cv, pill('ЛЕДИ БАГ', F_BOLD, 30, BLACK, RED2), ax, 870, prog(t, 13.2, .45))
    reveal_text(cv, text_img('лидер команды супергероев', F_SEMI, 36, (255, 225, 225)), ax, 935, prog(t, 13.95, .5), 1, 'lt', 'right')
    # Adrien lower third + S7 portrait
    if sp > 0:
        bx = 1820
        reveal_text(cv, text_img('АДРИАН', F_HEAD, 84, WHITE), bx, 760, prog(t, 16.8, .5), 1, 'rt')
        reveal_text(cv, pill('СУПЕР-КОТ', F_BOLD, 30, BLACK, GREEN), bx, 870, prog(t, 17.1, .45), 1, 'rt')
        pa = prog(t, 16.9, .6)
        if pa > 0:
            mask = Image.new('L', adrien_s7.size, 0); ImageDraw.Draw(mask).ellipse((0, 0, 329, 329), fill=255)
            a = adrien_s7.copy(); a.putalpha(mask)
            s = lerp(.3, .62, eback(pa))
            ring = soft_dot(116, GREEN, .82)
            paste(cv, scaled(ring, s / .62 * .8), 1760, 200, clamp(pa * 3), 'c')
            paste(cv, scaled(a, s * .8), 1760, 200, clamp(pa * 3), 'c')
            reveal_text(cv, pill('НОВЫЙ ОБРАЗ · S7', F_BOLD, 20, GREEN, BLACK, 16, 8), 1760, 305, prog(t, 17.2, .4), 1, 'ct')
    # heart + new trials
    phh = prog(t, 17.3, .6)
    if phh > 0:
        hx, hy = 1040, 430
        s = lerp(0, 6.5, eback(phh)) * (1 + .05 * math.sin(t * 9))
        lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
        d.polygon(heart_poly(hx, hy, s), fill=(255, 255, 255, 235))
        # crack (trials)
        pc = eout(prog(t, 18.5, .35))
        if pc > 0:
            pts = [(hx - 8, hy - 9 * s), (hx + 14, hy - 5 * s), (hx - 12, hy - 1 * s), (hx + 10, hy + 3 * s), (hx - 4, hy + 7 * s)]
            n = max(2, int(len(pts) * pc + .999))
            d.line(pts[:n], fill=RED + (255,), width=10, joint='curve')
        cv.alpha_composite(lay)
        reveal_text(cv, pill('НОВЫЕ ИСПЫТАНИЯ', F_HEAD, 34, WHITE, (200, 10, 30), 30, 16), 1040, 565, prog(t, 18.1, .45), 1, 'ct')
    return cv

def sceneD(t):  # 19.5 – 24.8  new villains, secrets, protect Paris
    cv = BG_NAVY.copy()
    # moving perspective grid
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(-12, 13):
        d.line([(W / 2 + i * 60, 560), (W / 2 + i * 420, H)], fill=(80, 90, 160, 70), width=2)
    for k in range(10):
        z = ((k + t * 1.2) % 10) / 10
        y = 560 + (H - 560) * z ** 2
        d.line([(0, y), (W, y)], fill=(80, 90, 160, int(90 * z)), width=2)
    cv.alpha_composite(lay)
    particles(cv, t, 11, 40, (160, 180, 255), speed=30, rmin=1, rmax=4, alpha=.6)
    reveal_text(cv, text_img('ГЕРОЯМ ПРЕДСТОИТ', F_BOLD, 40, (180, 190, 255), 12), W / 2, 70, prog(t, 19.75, .5), 1, 'ct')
    # three hero cards
    cards = [(RED, C['lb4'], 'ЛЕДИ БАГ', 19.8), (GREEN, C['cn3'], 'СУПЕР-КОТ', 20.0), (CYAN, C['bunny'], 'КРОЛИКС', 20.2)]
    dim = 1 - .45 * prog(t, 21.3, .3)
    for i, (col, ch, name, t0) in enumerate(cards):
        p = prog(t, t0, .7)
        if p <= 0: continue
        cx = 520 + i * 440; cy = lerp(1300, 590, eout5(p)) + math.sin(t * 1.5 + i) * 6
        cw, chh = 380, 640
        card = Image.new('RGBA', (cw, chh), (0, 0, 0, 0)); cd = ImageDraw.Draw(card)
        cd.rounded_rectangle((0, 0, cw - 1, chh - 1), 34, fill=(22, 24, 48, 235), outline=col + (255,), width=4)
        g = radial(260, 300, col, .45); card.alpha_composite(g.crop((70, 0, 70 + cw, chh)), (0, 40))
        mask = Image.new('L', (cw, chh), 0); ImageDraw.Draw(mask).rounded_rectangle((4, 4, cw - 5, chh - 5), 30, fill=255)
        inner = Image.new('RGBA', (cw, chh), (0, 0, 0, 0))
        im = ch[0]
        if im.width > cw: im = scaled(im, cw / im.width * 1.05)
        inner.alpha_composite(im, (int((cw - im.width) / 2), max(0, chh - 80 - im.height)))
        inner.putalpha(ImageChops.multiply(inner.getchannel('A'), mask))
        card.alpha_composite(inner)
        nt = text_img(name, F_BOLD, 34, WHITE, 4); card.alpha_composite(nt, (int((cw - nt.width) / 2), chh - 70))
        card = scaled(card, .98 + .02 * math.sin(t * 2 + i))
        if dim < 1: card = ImageEnhance.Brightness(card).enhance(dim)
        paste(cv, card, cx, cy, clamp(p * 3), 'c')
    # keyword slams
    words = [('НОВЫЕ ЗЛОДЕИ', PURPLE, 21.3, 22.55), ('ТАЙНЫ', (40, 200, 230), 22.6, 23.62), ('ЗАЩИТИТЬ ПАРИЖ', RED, 23.65, 25.2)]
    for wtxt, col, t0, t1 in words:
        if t0 <= t < t1:
            p = prog(t, t0, .35); q = prog(t, t1 - .15, .15)
            bh = 210
            band = Image.new('RGBA', (W + 400, bh), col + (235,))
            ang = -4
            bx = lerp(-W - 400, -200, eout5(p)) + lerp(0, W + 400, ein(q))
            b = band.rotate(ang, expand=True, resample=Image.BILINEAR)
            paste(cv, b, bx, H / 2 - b.height / 2 + 40, 1)
            tx = text_img(wtxt, F_HEAD, 120, WHITE)
            tx = tx.rotate(ang, expand=True, resample=Image.BILINEAR)
            s = lerp(1.25, 1.0, eout5(p)) + .03 * (t - t0)
            paste(cv, scaled(tx, s), W / 2 + lerp(0, W, ein(q)), H / 2 + 40, clamp(p * 4), 'c')
            if wtxt == 'НОВЫЕ ЗЛОДЕИ':
                draw_char(cv, C['chry_true'], 1700, 1180, .75, .5 * clamp(p * 2) * (1 - q), 1)
    return cv

def sceneE(t):  # 24.8 – 30  can they handle it? + end card
    cv = kenburns(paris_blur, t, 24.7, 30, 1.15, 1.0)
    paste(cv, radial(700, 700, (255, 40, 60), .5), 300 - 700, 600 - 700)
    paste(cv, radial(700, 700, (60, 255, 80), .35), 1620 - 700, 600 - 700)
    particles(cv, t, 21, 50, (255, 240, 200), speed=35, rmin=1, rmax=5, alpha=.7)
    out = einout(prog(t, 27.75, .7))
    pl = prog(t, 24.85, .8); pr = prog(t, 25.0, .8)
    draw_char(cv, C['lb2'], lerp(-400, 330, eout5(pl)) - out * 520, 1110 + math.sin(t * 1.6) * 8, .86, 1, 1)
    draw_char(cv, C['cn2'], lerp(W + 400, 1590, eout5(pr)) + out * 520, 1110 + math.sin(t * 1.6 + 1) * 8, .86, 1, 1)
    a = 1 - prog(t, 27.6, .35)
    if a > 0:
        reveal_text(cv, text_img('СМОГУТ ЛИ ОНИ', F_BOLD, 64, WHITE, 10), W / 2, 330, prog(t, 25.1, .5), a, 'ct')
        pq = prog(t, 25.7, .5)
        if pq > 0:
            sp = text_img('СПРАВИТЬСЯ', F_HEAD, 120, WHITE, 0, 16, (255, 60, 80))
            paste(cv, scaled(sp, lerp(1.3, 1, eout5(pq))), W / 2 - 40, 520, a * clamp(pq * 3), 'c')
            qm = text_img('?', F_HEAD, 220, RED2, 0, 18, RED)
            ang = math.sin(t * 4) * 8 * (1 - eout(prog(t, 26.4, 1.2)))
            paste(cv, scaled(qm.rotate(ang, expand=True, resample=Image.BILINEAR), lerp(0, 1, eback(prog(t, 27.0, .45)))), W / 2 + sp.width / 2 + 10, 510, a, 'c')
    # end card
    pe = prog(t, 27.9, .6)
    if pe > 0:
        ov = Image.new('RGBA', (W, H), (8, 6, 14, int(170 * eout(pe)))); cv.alpha_composite(ov)
        # spot motif ring
        ring = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ring)
        R = lerp(80, 300, eout5(pe))
        for k in range(7):
            ang = k / 7 * 2 * math.pi + t * .6
            x = W / 2 + math.cos(ang) * R * 1.9; y = 470 + math.sin(ang) * R * .55
            r = 14 + 6 * (k % 3)
            d.ellipse((x - r, y - r, x + r, y + r), fill=(RED2 if k % 2 else GREEN) + (int(220 * eout(pe)),))
        cv.alpha_composite(ring)
        title = text_img('MIRACULOUS', F_HEAD, 140, WHITE, 6, 18, RED)
        paste(cv, scaled(title, lerp(1.25, 1.0, eout5(pe))), W / 2, 470, clamp(pe * 2.5), 'c')
        reveal_text(cv, text_img('ЛЕДИ БАГ И СУПЕР-КОТ', F_BOLD, 46, (255, 220, 225), 10), W / 2, 590, prog(t, 28.2, .5), 1, 'ct')
        reveal_text(cv, pill('СЕЗОНЫ 6 – 7', F_BOLD, 30, RED), W / 2, 680, prog(t, 28.45, .45), 1, 'ct')
    return cv

LEFTSHADE = None
def _leftshade():
    x = np.linspace(0, 1, W)[None, :]
    a = np.clip(1 - x * 1.6, 0, 1) ** 1.3 * 200
    arr = np.zeros((H, W, 4), np.uint8); arr[..., 3] = np.repeat(a, H, 0).astype(np.uint8)
    return Image.fromarray(arr, 'RGBA')
LEFTSHADE = _leftshade()

# ---------------------------------------------------------------- transitions
TRANS = [(4.9, PURPLE, BLACK), (11.6, RED2, BLACK), (19.55, (40, 50, 120), GREEN), (24.8, RED, (255, 255, 255))]
def transition(cv, t):
    for tc, c1, c2 in TRANS:
        d = .62
        if tc - d / 2 <= t <= tc + d / 2:
            p = einout((t - (tc - d / 2)) / d)
            lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(lay)
            sk = 360
            x = lerp(-2700, W + 400, p)
            dr.polygon([(x + sk, 0), (x + 2400 + sk, 0), (x + 2400, H), (x, H)], fill=c1 + (255,))
            x2 = x + 2400 - 30
            dr.polygon([(x2 + sk, 0), (x2 + 90 + sk, 0), (x2 + 90, H), (x2, H)], fill=c2 + (255,))
            x3 = x - 120
            dr.polygon([(x3 + sk, 0), (x3 + 70 + sk, 0), (x3 + 70, H), (x3, H)], fill=c2 + (255,))
            cv.alpha_composite(lay)

def frame(t):
    if t < 4.9: cv = sceneA(t)
    elif t < 11.6: cv = sceneB(t)
    elif t < 19.55: cv = sceneC(t)
    elif t < 24.8: cv = sceneD(t)
    else: cv = sceneE(t)
    cv.alpha_composite(VIG)
    # subtle top badge + progress line
    if t < 27.8:
        paste(cv, text_img('MIRACULOUS  ·  ГЛАВНЫЕ ГЕРОИ', F_BOLD, 20, (255, 255, 255), 5), W - 60, 50, .55 * clamp(t / .6) * clamp((27.8 - t) / .4), 'rt')
    ImageDraw.Draw(cv).rectangle((0, H - 6, int(W * t / DUR), H), fill=RED2 + (255,))
    transition(cv, t)
    # fade in / out
    fa = min(clamp(t / .35), clamp((DUR - t) / .5))
    if fa < 1:
        cv = Image.blend(Image.new('RGBA', (W, H), (0, 0, 0, 255)), cv, fa)
    return cv.convert('RGB')

if __name__ == '__main__':
    if sys.argv[1] == 'still':
        frame(float(sys.argv[2])).save(sys.argv[3]); sys.exit()
    f0, f1, out = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(FPS), out], stdin=subprocess.PIPE)
    for f in range(f0, f1):
        ff.stdin.write(frame(f / FPS).tobytes())
        if f % 120 == 0: print(out, f, file=sys.stderr)
    ff.stdin.close(); ff.wait()
