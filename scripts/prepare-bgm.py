"""Prepare user-supplied tracks; originals are never modified.
Requires numpy and imageio-ffmpeg (also discovered in .audio-tools).
Usage: python scripts/prepare-bgm.py <source-directory>
"""
import json
import re
import subprocess
import sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.audio-tools'))
import imageio_ffmpeg
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SOURCES = {
    'greece': 'Kallipolian Dance - Farya Faraji & World Musicians, SEIKILO Ancient World Music (그리스).mp3',
    'korea': 'Once upon a time - eldlofi (조선).mp3',
    'egypt': 'The Legend of Narmer - WombatNoisesAudio (이집트).mp3',
    'qing': 'Cup of Solid Gold (청나라).mp3',
    'aztec': 'Jimena Contreras - Aztec Empire (아즈텍).mp3',
    'rome': 'National Anthem of the Roman Empire - S.P.Q.R. (로마)',
}
RATE = 44100
def run(args):
    return subprocess.run([FFMPEG, '-hide_banner', '-nostdin', *args], capture_output=True, check=True)
def measurement(log):
    return json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', log)[-1])
def main():
    source = Path(sys.argv[1])
    temp = ROOT / 'tmp/audio'
    temp.mkdir(parents=True, exist_ok=True)
    report = {}
    for civ, name in SOURCES.items():
        raw = run(['-i', str(source/name), '-vn', '-ar', str(RATE), '-ac', '2', '-f', 'f32le', 'pipe:1']).stdout
        x = np.frombuffer(raw, dtype='<f4').reshape(-1, 2)
        original_seconds = len(x)/RATE
        block = RATE//20
        levels = np.sqrt(np.mean(x[:len(x)//block*block].reshape(-1, block, 2)**2, axis=(1,2)))
        audible = np.flatnonzero(levels > 10**(-48/20))
        if not len(audible):
            raise ValueError(f'Silent source: {name}')
        start = max(0, int(audible[0])*block-block)
        end = min(len(x), (int(audible[-1])+2)*block)
        x = x[start:end]
        overlap = min(6*RATE, len(x)//8)
        phase = np.linspace(0, np.pi/2, overlap, endpoint=True)[:,None]
        seam = x[-overlap:] * np.cos(phase) + x[:overlap] * np.sin(phase)
        # Rotate the cycle: tail/head crossfade ends exactly where the next cycle starts.
        loop = np.concatenate([x[overlap:-overlap], seam]).astype('<f4')
        pcm = temp / f'{civ}.f32'
        loop.tofile(pcm)
        input_args = ['-f','f32le','-ar',str(RATE),'-ac','2','-i',str(pcm)]
        target = 'loudnorm=I=-18:TP=-1.5:LRA=11'
        measured = measurement(run([*input_args,'-af',target+':print_format=json','-f','null','-']).stderr.decode())
        second = target + ''.join(f':{key}={measured[value]}' for key,value in {
            'measured_I':'input_i','measured_TP':'input_tp','measured_LRA':'input_lra',
            'measured_thresh':'input_thresh','offset':'target_offset'}.items()) + ':linear=true'
        output = ROOT / f'public/media/{civ}/bgm-loop-v1.mp3'
        run(['-y',*input_args,'-af',second,'-ar',str(RATE),'-c:a','libmp3lame','-b:a','160k','-map_metadata','-1',str(output)])
        verified = measurement(run(['-i',str(output),'-af',target+':print_format=json','-f','null','-']).stderr.decode())
        report[civ] = {'source':name,'original_seconds':round(original_seconds,3),'trim_start_seconds':round(start/RATE,3),
            'trim_end_seconds':round(original_seconds-end/RATE,3),'loop_seconds':round(len(loop)/RATE,3),
            'crossfade_seconds':overlap/RATE,'integrated_lufs':float(verified['input_i']),
            'true_peak_dbtp':float(verified['input_tp']),'bytes':output.stat().st_size}
        print(civ, json.dumps(report[civ],ensure_ascii=False), flush=True)
    (ROOT/'public/media/audio-processing.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if __name__ == '__main__':
    main()
