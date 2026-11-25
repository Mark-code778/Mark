import fs from 'node:fs';
import {Config} from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// Cloud container: use the preinstalled Chromium. Elsewhere Remotion downloads its own.
const chrome = '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
if (fs.existsSync(chrome)) Config.setBrowserExecutable(chrome);
