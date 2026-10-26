from pathlib import Path
from html import escape
import math

OUT = Path(__file__).resolve().parents[1] / 'public'

def path(points):
    return ' '.join(('M' if i == 0 else 'L') + f'{x:.1f},{y:.1f}' for i, (x, y) in enumerate(points))

def plot(x, y, w, h, traces, labels):
    s = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="#0b2534" stroke="#315566"/>']
    for j in range(1, 5):
        yy = y + 30 + j * (h - 55) / 5
        s.append(f'<path d="M{x+22},{yy:.1f}H{x+w-22}" stroke="#35566a" opacity=".48" stroke-dasharray="4 7"/>')
    start = x + 28
    span = w - 56
    for k, (color, fn) in enumerate(traces):
        pts = [(start + span*i/79, y + 35 + (h-77)*fn(i/79)) for i in range(80)]
        s.append(f'<path d="{path(pts)}" fill="none" stroke="{color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>')
    s.append(f'<text x="{x+26}" y="{y+h-14}" class="axis">02:18</text><text x="{x+w/2}" y="{y+h-14}" text-anchor="middle" class="axis">02:22</text><text x="{x+w-26}" y="{y+h-14}" text-anchor="end" class="axis">02:26</text>')
    return ''.join(s)

def text(x, y, value, cls='body', extra=''):
    return f'<text x="{x}" y="{y}" class="{cls}" {extra}>{escape(value)}</text>'

def traces(kind):
    if kind == 'phase':
        return [('#48dce1', lambda t: .67 if t < .62 else .67-.51*min(1,(t-.62)/.27)+.035*math.sin(t*63)),
                ('#f0b45c', lambda t: .42 if t < .62 else .42-.26*min(1,(t-.62)/.29)+.025*math.sin(t*57)),
                ('#7a91ff', lambda t: .83 if t < .62 else .83-.62*min(1,(t-.62)/.3)+.045*math.sin(t*47))]
    if kind == 'environment':
        return [('#f0b45c', lambda t: .56 if t < .62 else .54+.035*math.sin(t*105)),
                ('#70cba4', lambda t: .76 if t < .62 else .69-.18*(t-.62)+.03*math.sin(t*72)),
                ('#7a91ff', lambda t: .88 if t < .62 else .86-.44*min(1,(t-.62)/.36)+.04*math.sin(t*46))]
    return [('#48dce1', lambda t: .83 if t < .65 else .83-.60*min(1,(t-.65)/.27)),
            ('#f0b45c', lambda t: .67 if t < .65 else .67-.43*min(1,(t-.65)/.27)+.02*math.sin(t*36))]

def svg(mobile=False):
    W,H = (720,1110) if mobile else (1600,830)
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">Timing drift simulation overview</title><desc id="desc">Illustrative reconstruction of the public EPICS timing simulation showing beam status, phase correction, environmental factors, and PID behavior.</desc>',
         '<style>.head{font:700 34px Arial,sans-serif;fill:#eaf6fa}.label{font:700 18px Arial,sans-serif;fill:#e9f4f7}.body{font:18px Arial,sans-serif;fill:#b6cdd6}.micro{font:700 13px Arial,sans-serif;fill:#77e2e5;letter-spacing:2px}.axis{font:13px Arial,sans-serif;fill:#7894a1}.value{font:700 27px Arial,sans-serif;fill:#f1f9fb}</style>',
         f'<rect width="{W}" height="{H}" fill="#061924"/>',
         '<path d="M0 5H1600" stroke="#39e0db" stroke-width="10"/>',
         text(42,58,'TIMING DRIFT SIMULATION','head'), text(42,89,'EPICS · PHOEBUS · ADAPTIVE PID','micro'),
         text(W-42,57,'ILLUSTRATIVE VIEW','micro','text-anchor="end"')]
    if mobile:
        s += ['<rect x="32" y="118" width="656" height="110" rx="13" fill="#103544" stroke="#356173"/>',
              text(55,151,'BEAM STATUS','micro'),text(55,194,'Dumped','value'),text(420,151,'PHASE ERROR','micro'),text(420,194,'0.09 %','value'),
              text(36,280,'01  PHASE CORRECTION','label'),plot(30,298,660,182,traces('phase'),''),
              text(36,537,'02  ENVIRONMENTAL FACTORS','label'),plot(30,556,660,182,traces('environment'),''),
              text(36,793,'03  PID CORRECTION','label'),plot(30,812,660,182,traces('pid'),''),
              text(36,1044,'MODELED SIGNALS · RELATIVE TIME','micro'),text(36,1073,'Reconstruction of the public simulation interface','body')]
    else:
        s += ['<rect x="38" y="120" width="330" height="640" rx="13" fill="#0b2b39" stroke="#315566"/>',
              text(65,161,'SIMULATION STATUS','micro'), text(65,218,'Beam dumped','value'),
              '<rect x="65" y="241" width="274" height="7" rx="3" fill="#f17a68"/>',
              text(65,303,'PHASE ERROR','micro'),text(65,348,'0.09 %','value'),
              text(65,414,'LASER / PLL','micro'),text(65,451,'Output  0.04 V','body'),text(65,484,'Piezo  −56.20 V','body'),
              text(65,557,'ENVIRONMENT','micro'),text(65,594,'Lab  23.49 °C','body'),text(65,627,'Fiber  23.02 °C','body'),
              text(65,713,'IOC RUNNING','micro'),
              text(411,151,'01  PHASE CORRECTION','label'),plot(402,169,1160,167,traces('phase'),''),
              text(411,382,'02  ENVIRONMENTAL FACTORS','label'),plot(402,400,1160,167,traces('environment'),''),
              text(411,613,'03  PID CORRECTION','label'),plot(402,631,1160,167,traces('pid'),''),
              text(41,806,'RECONSTRUCTION OF PUBLIC SIMULATION · ILLUSTRATIVE TRACES','micro')]
    s.append('</svg>')
    return ''.join(s)

(OUT/'timing-simulation-overview.svg').write_text(svg())
(OUT/'timing-simulation-mobile.svg').write_text(svg(True))
