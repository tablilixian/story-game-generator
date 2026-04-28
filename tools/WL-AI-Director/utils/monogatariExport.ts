export interface MonogatariExportOptions {
  indent?: string;
  lineBreak?: string;
}

export interface VNEvent {
  scene?: string;
  narration?: string;
  character?: string;
  text?: string;
  expression?: string;
  monologue?: string;
  action?: string;
  choice?: string;
  options?: Array<{ text: string; next: string }>;
  end?: string;
}

export interface VNScript {
  label: string;
  events: VNEvent[];
}

export interface LanguageMetadata {
  name: string;
  code: string;
  icon: string;
}

export interface VisualNovelScriptData {
  characters: Record<string, { name: string; color: string }>;
  scenes: Record<string, string>;
  scripts: Record<string, VNScript>;
  languages?: LanguageMetadata[];
}

export interface GameSceneAsset {
  id: string;
  name: string;
  imageUrl: string;
}

export interface GameCharacterAsset {
  id: string;
  key: string;
  name: string;
  color: string;
  mainImageUrl?: string;
  sprites: Record<string, string>;
}

export interface GameAssets {
  scenes: Record<string, GameSceneAsset>;
  characters: Record<string, GameCharacterAsset>;
  stats: {
    totalScenes: number;
    totalCharacterSprites: number;
    totalImages: number;
  };
}

const DEMO_SCRIPT_TEMPLATE = `/* global monogatari */

// Define the messages used in the game.
monogatari.action ('message').messages ({
	
});

// Define the notifications used in the game
monogatari.action ('notification').notifications ({
	'End': {
		title: 'Things just got real!',
		body: 'You finished Monogatari 101.',
		icon: 'assets/icons/icon_192x192.png'
	}
});

// Define the Particles JS Configurations used in the game
monogatari.action ('particles').particles ({
	universe: 
	{
	  "autoPlay": true,
	  "background": {
		"color": {
		  "value": "transparent"
		},
		"image": "",
		"position": "",
		"repeat": "",
		"size": "",
		"opacity": 1
	  },
	  "backgroundMask": {
		"composite": "destination-out",
		"cover": {
		  "color": {
			"value": "#fff"
		  },
		  "opacity": 1
		},
		"enable": false
	  },
	  "clear": true,
	  "defaultThemes": {},
	  "delay": 0,
	  "fullScreen": {
		"enable": true,
		"zIndex": 0
	  },
	  "detectRetina": true,
	  "duration": 0,
	  "fpsLimit": 120,
	  "interactivity": {
		"detectsOn": "window",
		"events": {
		  "onClick": {
			"enable": true,
			"mode": "push"
		  },
		  "onDiv": {
			"selectors": [],
			"enable": false,
			"mode": [],
			"type": "circle"
		  },
		  "onHover": {
			"enable": true,
			"mode": "repulse",
			"parallax": {
			  "enable": false,
			  "force": 2,
			  "smooth": 10
			}
		  },
		  "resize": {
			"delay": 0.5,
			"enable": true
		  }
		},
		"modes": {
		  "trail": {
			"delay": 1,
			"pauseOnStop": false,
			"quantity": 1
		  },
		  "attract": {
			"distance": 200,
			"duration": 0.4,
			"easing": "ease-out-quad",
			"factor": 1,
			"maxSpeed": 50,
			"speed": 1
		  },
		  "bounce": {
			"distance": 200
		  },
		  "bubble": {
			"distance": 200,
			"duration": 0.4,
			"mix": false,
			"divs": {
			  "distance": 200,
			  "duration": 0.4,
			  "mix": false,
			  "selectors": []
			}
		  },
		  "connect": {
			"distance": 80,
			"links": {
			  "opacity": 0.5
			},
			"radius": 60
		  },
		  "grab": {
			"distance": 100,
			"links": {
			  "blink": false,
			  "consent": false,
			  "opacity": 1
			}
		  },
		  "push": {
			"default": true,
			"groups": [],
			"quantity": 4
		  },
		  "remove": {
			"quantity": 2
		  },
		  "repulse": {
			"distance": 200,
			"duration": 0.4,
			"factor": 100,
			"speed": 1,
			"maxSpeed": 50,
			"easing": "ease-out-quad",
			"divs": {
			  "distance": 200,
			  "duration": 0.4,
			  "factor": 100,
			  "speed": 1,
			  "maxSpeed": 50,
			  "easing": "ease-out-quad",
			  "selectors": []
			}
		  },
		  "slow": {
			"factor": 3,
			"radius": 200
		  },
		  "light": {
			"area": {
			  "gradient": {
				"start": {
				  "value": "#ffffff"
				},
				"stop": {
				  "value": "#000000"
				}
			  },
			  "radius": 1000
			},
			"shadow": {
			  "color": {
				"value": "#000000"
			  },
			  "length": 2000
			}
		  }
		}
	  },
	  "manualParticles": [],
	  "particles": {
		"bounce": {
		  "horizontal": {
			"value": 1
		  },
		  "vertical": {
			"value": 1
		  }
		},
		"collisions": {
		  "absorb": {
			"speed": 2
		  },
		  "bounce": {
			"horizontal": {
			  "value": 1
			},
			"vertical": {
			  "value": 1
			}
		  },
		  "enable": false,
		  "maxSpeed": 10,
		  "mode": "bounce",
		  "overlap": {
			"enable": true,
			"retries": 0
		  }
		},
		"color": {
		  "value": "#ff0000",
		  "animation": {
			"h": {
			  "count": 0,
			  "enable": true,
			  "speed": 20,
			  "decay": 0,
			  "delay": 0,
			  "sync": true,
			  "offset": 0
			},
			"s": {
			  "count": 0,
			  "enable": false,
			  "speed": 1,
			  "decay": 0,
			  "delay": 0,
			  "sync": true,
			  "offset": 0
			},
			"l": {
			  "count": 0,
			  "enable": false,
			  "speed": 1,
			  "decay": 0,
			  "delay": 0,
			  "sync": true,
			  "offset": 0
			}
		  }
		},
		"effect": {
		  "close": true,
		  "fill": true,
		  "options": {},
		  "type": []
		},
		"groups": {},
		"move": {
		  "angle": {
			"offset": 0,
			"value": 90
		  },
		  "attract": {
			"distance": 200,
			"enable": false,
			"rotate": {
			  "x": 3000,
			  "y": 3000
			}
		  },
		  "center": {
			"x": 50,
			"y": 50,
			"mode": "percent",
			"radius": 0
		  },
		  "decay": 0,
		  "distance": {},
		  "direction": "none",
		  "drift": 0,
		  "enable": true,
		  "gravity": {
			"acceleration": 9.81,
			"enable": false,
			"inverse": false,
			"maxSpeed": 50
		  },
		  "path": {
			"clamp": true,
			"delay": {
			  "value": 0
			},
			"enable": false,
			"options": {}
		  },
		  "outModes": {
			"default": "out",
			"bottom": "out",
			"left": "out",
			"right": "out",
			"top": "out"
		  },
		  "random": false,
		  "size": false,
		  "speed": 1,
		  "spin": {
			"acceleration": 0,
			"enable": false
		  },
		  "straight": false,
		  "trail": {
			"enable": false,
			"length": 10,
			"fill": {}
		  },
		  "vibrate": false,
		  "warp": false
		},
		"number": {
		  "density": {
			"enable": true,
			"width": 1920,
			"height": 1080
		  },
		  "limit": {
			"mode": "delete",
			"value": 0
		  },
		  "value": 80
		},
		"opacity": {
		  "value": 0.5,
		  "animation": {
			"count": 0,
			"enable": false,
			"speed": 2,
			"decay": 0,
			"delay": 0,
			"sync": false,
			"mode": "auto",
			"startValue": "random",
			"destroy": "none"
		  }
		},
		"reduceDuplicates": false,
		"shadow": {
		  "blur": 0,
		  "color": {
			"value": "#000"
		  },
		  "enable": false,
		  "offset": {
			"x": 0,
			"y": 0
		  }
		},
		"shape": {
		  "close": true,
		  "fill": true,
		  "options": {},
		  "type": "circle"
		},
		"size": {
		  "value": {
			"min": 1,
			"max": 3
		  },
		  "animation": {
			"count": 0,
			"enable": false,
			"speed": 5,
			"decay": 0,
			"delay": 0,
			"sync": false,
			"mode": "auto",
			"startValue": "random",
			"destroy": "none"
		  }
		},
		"stroke": {
		  "width": 0
		},
		"zIndex": {
		  "value": 0,
		  "opacityRate": 1,
		  "sizeRate": 1,
		  "velocityRate": 1
		},
		"destroy": {
		  "bounds": {},
		  "mode": "none",
		  "split": {
			"count": 1,
			"factor": {
			  "value": 3
			},
			"rate": {
			  "value": {
				"min": 4,
				"max": 9
			  }
			},
			"sizeOffset": true,
			"particles": {}
		  }
		},
		"roll": {
		  "darken": {
			"enable": false,
			"value": 0
		  },
		  "enable": false,
		  "enlighten": {
			"enable": false,
			"value": 0
		  },
		  "mode": "vertical",
		  "speed": 25
		},
		"tilt": {
		  "value": 0,
		  "animation": {
			"enable": false,
			"speed": 0,
			"decay": 0,
			"sync": false
		  },
		  "direction": "clockwise",
		  "enable": false
		},
		"twinkle": {
		  "lines": {
			"enable": false,
			"frequency": 0.05,
			"opacity": 1
		  },
		  "particles": {
			"enable": false,
			"frequency": 0.05,
			"opacity": 1
		  }
		},
		"wobble": {
		  "distance": 5,
		  "enable": false,
		  "speed": {
			"angle": 50,
			"move": 10
		  }
		},
		"life": {
		  "count": 0,
		  "delay": {
			"value": 0,
			"sync": false
		  },
		  "duration": {
			"value": 0,
			"sync": false
		  }
		},
		"rotate": {
		  "value": 0,
		  "animation": {
			"enable": false,
			"speed": 0,
			"decay": 0,
			"sync": false
		  },
		  "direction": "clockwise",
		  "path": false
		},
		"orbit": {
		  "animation": {
			"count": 0,
			"enable": false,
			"speed": 1,
			"decay": 0,
			"delay": 0,
			"sync": false
		  },
		  "enable": false,
		  "opacity": 1,
		  "rotation": {
			"value": 45
		  },
		  "width": 1
		},
		"links": {
		  "blink": false,
		  "color": {
			"value": "#ffffff"
		  },
		  "consent": false,
		  "distance": 150,
		  "enable": false,
		  "frequency": 1,
		  "opacity": 0.4,
		  "shadow": {
			"blur": 5,
			"color": {
			  "value": "#000"
			},
			"enable": false
		  },
		  "triangles": {
			"enable": false,
			"frequency": 1
		  },
		  "width": 1,
		  "warp": false
		},
		"repulse": {
		  "value": 0,
		  "enabled": false,
		  "distance": 1,
		  "duration": 1,
		  "factor": 1,
		  "speed": 1
		}
	  },
	  "pauseOnBlur": true,
	  "pauseOnOutsideViewport": true,
	  "responsive": [],
	  "smooth": false,
	  "style": {},
	  "themes": [],
	  "zLayers": 100,
	  "name": "Basic",
	  "motion": {
		"disable": false,
		"reduce": {
		  "factor": 4,
		  "value": true
		}
	  }
	}	
});

// Define the canvas objects used in the game
monogatari.action ('canvas').objects ({

});

// Credits of the people involved in the creation of this awesome game
monogatari.configuration ('credits', {
	'Artists': {
		'Backgrounds': '<a href="https://queenbeebee.carrd.co/" target="_blank">Queen BeeBee</a>',
		'Sprites': '<a href="https://queenbeebee.carrd.co/" target="_blank">Queen BeeBee</a>'
	},
	'Audio': {
		'Music': '<a href="http://ccmixter.org/files/_ghost/25389" target="_blank">_ghost</a>'
	}
});


// Define the images that will be available on your game's image gallery
monogatari.assets ('gallery', {

});

// Define the music used in the game.
monogatari.assets ('music', {

});

// Define the voice files used in the game.
monogatari.assets ('voices', {

});

// Define the sounds used in the game.
monogatari.assets ('sounds', {

});

// Define the videos used in the game.
monogatari.assets ('videos', {

});

// Define the images used in the game.
monogatari.assets ('images', {

});

// Define the backgrounds for each scene.
monogatari.assets ('scenes', {
	PLACEHOLDER_SCENES
});


// Define the Characters
monogatari.characters ({
	PLACEHOLDER_CHARACTERS
});

const { Storage } = monogatari;

PLACEHOLDER_LANGUAGES

monogatari.script ({
	PLACEHOLDER_SCRIPT
});`;

function escapeString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
}

function generateCharactersContent(characters: Record<string, { name: string; color: string }>, assets?: GameAssets): string {
  const keys = Object.keys(characters);
  if (keys.length === 0) {
    return '';
  }
  
  const assetsCharMap: Record<string, any> = {};
  if (assets?.characters) {
    Object.entries(assets.characters).forEach(([key, charAsset]) => {
      assetsCharMap[charAsset.name] = charAsset;
    });
  }
  
  return keys.map(key => {
    const char = characters[key];
    
    let spritesContent = '';
    const matchedAsset = assetsCharMap[char.name];
    
    if (matchedAsset?.sprites && Object.keys(matchedAsset.sprites).length > 0) {
      const spriteEntries = Object.entries(matchedAsset.sprites);
      spritesContent = spriteEntries.map(([spriteName, imageUrl]) => {
        return `\t\t\t'${spriteName}': '${spriteName}.png'`;
      }).join(',\n');
    }
    
    if (spritesContent) {
      return `\t'${key}': {
\t\tname: '${char.name}',
\t\tcolor: '${char.color || '#3498db'}',
\t\tdirectory: '${key}',
\t\tsprites: {
\t\t${spritesContent}
\t\t}
\t}`;
    }
    
    return `\t'${key}': {
\t\tname: '${char.name}',
\t\tcolor: '${char.color || '#3498db'}'
\t}`;
  }).join(',\n');
}

function generateScenesContent(scenes: Record<string, string>, assets?: GameAssets): string {
  const keys = Object.keys(scenes);
  if (keys.length === 0) {
    return '\tblack: \'black.png\'';
  }
  
  return keys.map((key, index) => {
    let filePath = 'scene_placeholder.png';
    
    if (assets?.scenes?.[key]?.imageUrl) {
      filePath = `${key}.png`;
    }
    
    return `\t${key}: '${filePath}'`;
  }).join(',\n');
}

function generateLanguagesContent(languages?: LanguageMetadata[]): string {
  return '';
}

function generateScriptContent(
  scripts: Record<string, VNScript>,
  sceneNameToIndex: Record<string, string>,
  characters: Record<string, { name: string; color: string }>
): string {
  const labels = Object.keys(scripts);
  if (labels.length === 0) {
    return '\t\'Start\': [\n\t\t\'show scene black\',\n\t\t\'centered 故事开始...\'\n\t]';
  }

  const registeredCharacters = new Set(Object.keys(characters));
  const scriptContent = labels.map(label => {
    const script = scripts[label];
    let lastCharacter: string | undefined;
    const events = script.events.map(event => {
      const result = convertEventToMonogatari(event, sceneNameToIndex, lastCharacter, registeredCharacters);
      if (event.character) {
        lastCharacter = event.character;
      }
      return result;
    }).join(',\n');
    return `\t'${label}': [
\t\t${events}
\t]`;
  }).join(',\n\n');

  return scriptContent;
}

function convertEventToMonogatari(
  event: VNEvent, 
  sceneNameToIndex: Record<string, string>, 
  lastCharacter: string | undefined,
  registeredCharacters: Set<string>
): string {
  if (event.scene) {
    const mappedScene = sceneNameToIndex[event.scene] || event.scene;
    return `'show scene ${mappedScene}'`;
  } else if (event.narration) {
    return `'centered ${escapeString(event.narration)}'`;
  } else if (event.character && event.text) {
    let result = '';
    const spriteName = event.expression || 'normal';
    const isRegistered = registeredCharacters.has(event.character);
    if (isRegistered && lastCharacter !== event.character) {
      result += `'show character ${event.character} ${spriteName} center with fadeIn',\n\t\t`;
    }
    result += `'${event.character} ${escapeString(event.text)}'`;
    return result;
  } else if (event.monologue) {
    return `'centered ${escapeString(event.monologue)}'`;
  } else if (event.action) {
    return `'centered ${escapeString(event.action)}'`;
  } else if (event.choice && event.options) {
    const optionsObj: Record<string, { Text: string; Do: string }> = {};
    event.options.forEach((opt, idx) => {
      const next = (opt.next || 'End').replace('jump ', '').trim() || 'Start';
      const key = `option_${idx + 1}`;
      optionsObj[key] = {
        Text: opt.text,
        Do: `jump ${next}`
      };
    });
    const optionsContent = Object.entries(optionsObj).map(([key, value]) => {
      return `\t\t\t\t'${key}': {\n\t\t\t\t\t'Text': '${escapeString(value.Text)}',\n\t\t\t\t\t'Do': '${value.Do}'\n\t\t\t\t}`;
    }).join(',\n');
    return `{'Choice': {\n\t\t\t'Text': '${escapeString(event.choice)}',\n\t\t\t${optionsContent}\n\t\t}}`;
  } else if (event.end) {
    return `'end ${escapeString(event.end)}'`;
  }
  return `'${escapeString(JSON.stringify(event))}'`;
}

export function exportToMonogatari(
  vnScript: VisualNovelScriptData,
  options: MonogatariExportOptions = {},
  assets?: GameAssets
): string {
  const sceneKeys = Object.keys(vnScript.scenes);
  const sceneNameToIndex: Record<string, string> = {};
  sceneKeys.forEach((key, index) => {
    sceneNameToIndex[vnScript.scenes[key] || key] = `scene_${index + 1}`;
  });

  const charactersContent = generateCharactersContent(vnScript.characters, assets);
  const scenesContent = generateScenesContent(vnScript.scenes, assets);
  const scriptContent = generateScriptContent(vnScript.scripts, sceneNameToIndex, vnScript.characters);
  const languagesContent = generateLanguagesContent(vnScript.languages);

  let result = DEMO_SCRIPT_TEMPLATE;
  result = result.replace('PLACEHOLDER_CHARACTERS', charactersContent || '\t// No characters defined');
  result = result.replace('PLACEHOLDER_SCENES', scenesContent);
  result = result.replace('PLACEHOLDER_LANGUAGES', languagesContent);
  result = result.replace('PLACEHOLDER_SCRIPT', scriptContent);

  return result;
}

export function downloadMonogatariScript(
  vnScript: VisualNovelScriptData,
  filename: string = 'script.js'
): void {
  const script = exportToMonogatari(vnScript);
  const blob = new Blob([script], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateProjectFiles(vnScript: VisualNovelScriptData, projectName: string = 'my-visual-novel'): {
  filename: string;
  content: string;
}[] {
  const scriptContent = exportToMonogatari(vnScript);

  return [
    {
      filename: 'index.html',
      content: generateIndexHtml(projectName)
    },
    {
      filename: 'js/script.js',
      content: scriptContent
    },
    {
      filename: 'js/data.js',
      content: generateDataJs(vnScript)
    },
    {
      filename: 'css/style.css',
      content: generateStyleCss()
    }
  ];
}

export function generateCompleteGameFiles(vnScript: VisualNovelScriptData, projectName: string = 'my-visual-novel'): {
  filename: string;
  content: string;
}[] {
  const scriptContent = exportToMonogatari(vnScript);
  const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');

  return [
    {
      filename: 'index.html',
      content: generateCompleteIndexHtml(safeName, vnScript)
    },
    {
      filename: 'js/script.js',
      content: scriptContent
    },
    {
      filename: 'js/options.js',
      content: generateOptionsJs()
    },
    {
      filename: 'js/storage.js',
      content: generateStorageJs()
    },
    {
      filename: 'css/main.css',
      content: generateMainCss()
    }
  ];
}

function generateCompleteIndexHtml(projectName: string, vnScript: VisualNovelScriptData): string {
  const charNames = Object.values(vnScript.characters).map(c => c.name).join('、') || '未知';
  const sceneNames = Object.values(vnScript.scenes).join('、') || '未知';
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName} - 视觉小说</title>
    <meta name="description" content="由 Story Game Generator 生成">
    <link rel="stylesheet" href="css/main.css">
    <script src="https://cdn.jsdelivr.net/npm/monogatari@4.0.0/dist/monogatari.js"></script>
</head>
<body>
    <div id="monogatari">
        <失能-loading-screen></失能-loading-screen>
        <失能-main-screen></失能-main-screen>
    </div>
    
    <script>
        window.__monogatari_config = {
            app: {
                name: '${projectName}',
                version: '1.0.0'
            },
            settings: {
                language: 'zh-hans',
                autoload: true,
                init: function() {
                    this.engine.on('loaded', () => {
                        console.log('游戏加载完成');
                    });
                }
            }
        };
    </script>
    <script src="js/options.js"></script>
    <script src="js/storage.js"></script>
    <script src="js/script.js"></script>
</body>
</html>`;
}

function generateOptionsJs(): string {
  return `'use strict';
/* global Monogatari */

const monogatari = Monogatari.default;

monogatari.settings({
	'Name': '视觉小说',
	'Version': '1.0.0',
	'Label': 'Start',
	'Slots': 10,
	'MultiLanguage': false,
	'LanguageSelectionScreen': false,
	'MainScreenMusic': '',
	'SaveLabel': 'Save',
	'AutoSaveLabel': 'AutoSave',
	'ShowMainScreen': true,
	'Preload': true,
	'AutoSave': 0,
	'ServiceWorkers': true,
	'AspectRatio': '16:9',
	'ForceAspectRatio': 'None',
	'TypeAnimation': true,
	'NVLTypeAnimation': true,
	'NarratorTypeAnimation': true,
	'CenteredTypeAnimation': true,
	'Orientation': 'landscape',
	'Skip': 0,
	'AssetsPath': {
		'root': 'assets',
		'characters': 'characters',
		'icons': 'icons',
		'images': 'images',
		'music': 'music',
		'scenes': 'scenes',
		'sounds': 'sounds',
		'ui': 'ui',
		'videos': 'videos',
		'voices': 'voices',
		'gallery': 'gallery'
	},
	'SplashScreenLabel': '',
	'Storage': {
		'Adapter': 'LocalStorage',
		'Store': 'GameData',
		'Endpoint': ''
	},
	'AllowRollback': true,
	'ExperimentalFeatures': false
});

monogatari.preferences({
	'Language': '简体中文',
	'Volume': {
		'Music': 1,
		'Voice': 1,
		'Sound': 1,
		'Video': 1
	},
	'Resolution': '800x600',
	'TextSpeed': 20,
	'AutoPlaySpeed': 5
});`;
}

function generateStorageJs(): string {
  return `/* global monogatari */

monogatari.storage ({
	player: {
		name: "Player"
	}
});`;
}

function generateMainCss(): string {
  return `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
  background: #000;
}

#monogatari {
  width: 100%;
  height: 100%;
}

失能-loading-screen,
失能-main-screen {
  display: none;
}

失能-loading-screen.active,
失能-main-screen.active {
  display: block;
}

/* Dark theme for Chinese */
:root {
  --color-background: #1a1a2e;
  --color-text: #eee;
  --color-primary: #4a90d9;
  --color-secondary: #d4a574;
}`;
}

function generateIndexHtml(projectName: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="css/style.css">
    <script src="https://cdn.jsdelivr.net/npm/monogatari@4.0.0/monogatari.js"></script>
</head>
<body>
    <div id="monogatari"></div>
    <script src="js/data.js"></script>
    <script src="js/script.js"></script>
</body>
</html>`;
}

function generateDataJs(vnScript: VisualNovelScriptData): string {
  return `const MonogatariConfig = {
  app: {
    name: 'Visual Novel',
    version: '1.0.0'
  },
  settings: {
    language: 'zh-CN'
  }
};`;
}

function generateStyleCss(): string {
  return `body {
  margin: 0;
  padding: 0;
  background: #000;
}

#monogatari {
  width: 100%;
  height: 100vh;
}`;
}

export function downloadProjectAsZip(
  vnScript: VisualNovelScriptData,
  projectName: string = 'my-visual-novel'
): void {
  const files = generateCompleteGameFiles(vnScript, projectName);
  
  let content = '';
  files.forEach(file => {
    content += `###FILE:${file.filename}###\n${file.content}\n###END###\n`;
  });
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateStandaloneHtml(vnScript: VisualNovelScriptData, projectName: string = 'my-visual-novel'): string {
  const scriptContent = exportToMonogatari(vnScript);
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monogatari@4.0.0/dist/monogatari.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0a0a12;
            font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif;
        }
        #monogatari {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="monogatari"></div>
    
    <script>
    const MonogatariConfig = {
        app: { name: '${projectName}', version: '1.0.0' },
        settings: { language: 'schinese' }
    };
    </script>
    <script src="https://cdn.jsdelivr.net/npm/monogatari@4.0.0/dist/monogatari.js"></script>
    <script>
    // CDN 版本是 UMD 模块，需要通过 default 获取实例
    const monogatari = Monogatari.default;
    </script>
    <script>
    ${scriptContent}
    </script>
    <script>
    // 初始化引擎
    monogatari.init('#monogatari').then(() => {
        console.log('Monogatari 引擎初始化完成');
    }).catch(err => {
        console.error('Monogatari 初始化失败:', err);
    });
    </script>
</body>
</html>`;
}

export function openGamePreview(vnScript: VisualNovelScriptData, projectName: string = 'my-visual-novel'): void {
  const html = generateStandaloneHtml(vnScript, projectName);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

export async function openGamePreviewWithLocalEngine(
  vnScript: VisualNovelScriptData, 
  projectName: string = 'my-visual-novel'
): Promise<void> {
  const MONOGATARI_BASE = '/templates/monogatari';
  
  async function fetchFile(path: string): Promise<string> {
    const response = await fetch(`${MONOGATARI_BASE}/${path}`);
    if (!response.ok) throw new Error(`Failed to fetch ${path}`);
    return response.text();
  }

  try {
    const [debugJs, monogatariJs, scriptContent] = await Promise.all([
      fetchFile('engine/debug/debug.js'),
      fetchFile('engine/core/monogatari.js'),
      Promise.resolve(exportToMonogatari(vnScript))
    ]);

    const html = generatePreviewHtmlWithLocalEngine({
      projectName,
      debugJs,
      monogatariJs,
      scriptContent
    });

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('生成预览失败:', error);
    throw error;
  }
}

interface PreviewHtmlOptions {
  projectName: string;
  debugJs: string;
  monogatariJs: string;
  scriptContent: string;
}

function generatePreviewHtmlWithLocalEngine(options: PreviewHtmlOptions): string {
  const { projectName, debugJs, monogatariJs, scriptContent } = options;
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="/templates/monogatari/engine/core/monogatari.css">
    <link rel="stylesheet" href="/templates/monogatari/style/main.css">
    <style>
        body { margin: 0; padding: 0; background: #0a0a12; }
        #monogatari { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="monogatari">
        <visual-novel>
            <loading-screen></loading-screen>
            <main-screen><main-menu></main-menu></main-screen>
            <game-screen>
                <dialog-log></dialog-log>
                <text-box></text-box>
                <quick-menu></quick-menu>
            </game-screen>
            <save-screen></save-screen>
            <load-screen></load-screen>
            <settings-screen></settings-screen>
        </visual-novel>
    </div>
    
    <script>
    const MonogatariConfig = {
        app: { name: '${projectName}', version: '1.0.0' },
        settings: { 
            language: 'schinese',
            ShowMainScreen: true,
            Label: 'Start'
        }
    };
    </script>
    
    <script>
    ${debugJs}
    </script>
    <script>
    ${monogatariJs}
    </script>
    <script>
    const monogatari = Monogatari.default;
    </script>
    <script>
    ${scriptContent}
    </script>
    <script>
    monogatari.init('#monogatari').then(() => {
        console.log('游戏预览已启动');
    }).catch(err => {
        console.error('初始化失败:', err);
    });
    </script>
</body>
</html>`;
}

const MONOGATARI_BASE = '/templates/monogatari';

async function fetchMonogatariFile(path: string): Promise<string | null> {
  try {
    const response = await fetch(`${MONOGATARI_BASE}/${path}`);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function listMonogatariFiles(basePath: string = ''): Promise<string[]> {
  const files: string[] = [];
  
  try {
    const response = await fetch(`${MONOGATARI_BASE}/?list=true&path=${basePath}`);
    if (response.ok) {
      const data = await response.json();
      return data.files || [];
    }
  } catch {}
  
  const commonFiles = [
    'index.html',
    'js/main.js',
    'js/options.js',
    'js/storage.js',
    'js/script.js',
    'style/main.css',
    'engine/core/monogatari.css',
    'engine/core/monogatari.js',
    'engine/debug/debug.js',
    'manifest.json',
    'service-worker.js',
    'favicon.ico',
    'LICENSE',
    'README.md',
  ];
  
  for (const f of commonFiles) {
    const content = await fetchMonogatariFile(f);
    if (content !== null) {
      files.push(f);
    }
  }
  
  const assetDirs = ['assets/icons', 'assets/characters', 'assets/scenes', 'assets/images', 'assets/music', 'assets/sounds', 'assets/gallery', 'assets/fonts', 'assets/videos', 'assets/voices', 'assets/ui'];
  for (const dir of assetDirs) {
    files.push(`${dir}/.gitignore`);
  }
  
  return [...new Set(files)];
}

export async function generateCompleteGameZip(
  vnScript: VisualNovelScriptData,
  projectName: string = 'my-visual-novel',
  onProgress?: (message: string, percent: number) => void
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  
  onProgress?.('正在准备游戏文件...', 5);
  
  const scriptContent = exportToMonogatari(vnScript);
  
  onProgress?.('正在获取文件列表...', 10);
  const fileList = await listMonogatariFiles();
  
  onProgress?.('正在复制引擎文件...', 20);
  
  let loadedFiles = 0;
  const totalFiles = fileList.length + 2;
  
  for (const filePath of fileList) {
    if (filePath === 'index.html') {
      let content = await fetchMonogatariFile(filePath);
      if (content) {
        content = content.replace(/<title>.*?<\/title>/, `<title>${safeName} - 视觉小说</title>`);
        zip.file(filePath, content);
      }
    } else {
      const content = await fetchMonogatariFile(filePath);
      if (content !== null) {
        zip.file(filePath, content);
      }
    }
    loadedFiles++;
    onProgress?.(`正在加载引擎文件 (${loadedFiles}/${totalFiles})...`, 20 + Math.round((loadedFiles / totalFiles) * 50));
  }
  
  onProgress?.('正在生成游戏脚本...', 75);
  zip.file('js/script.js', scriptContent);
  
  onProgress?.('正在生成游戏配置...', 80);
  zip.file('js/options.js', generateOptionsJs());
  zip.file('js/storage.js', generateStorageJs());
  
  onProgress?.('正在压缩文件...', 90);
  
  const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.('正在压缩...', 90 + Math.round(metadata.percent / 10));
  });
  
  return blob;
}

export async function downloadCompleteGame(
  vnScript: VisualNovelScriptData,
  projectName: string = 'my-visual-novel',
  onProgress?: (message: string, percent: number) => void
): Promise<void> {
  const blob = await generateCompleteGameZip(vnScript, projectName, onProgress);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function base64ToBlob(base64: string): Blob | null {
  try {
    const parts = base64.split(',');
    if (parts.length !== 2) return null;
    
    const mimeMatch = parts[0].match(/:([^;]+);/);
    if (!mimeMatch) return null;
    
    const mime = mimeMatch[1];
    const b64 = parts[1];
    
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function addAssetsToZip(zip: any, assets: GameAssets, onProgress?: (message: string, percent: number) => void): void {
  const scenesFolder = zip.folder('assets/scenes');
  const charactersFolder = zip.folder('assets/characters');
  
  let processed = 0;
  const total = assets.stats.totalImages;
  
  Object.entries(assets.scenes).forEach(([key, scene]) => {
    if (scene.imageUrl && scenesFolder) {
      const blob = base64ToBlob(scene.imageUrl);
      if (blob) {
        scenesFolder.file(`${key}.png`, blob);
      } else {
        console.warn(`Failed to convert scene image to blob: ${key}`);
      }
    }
    processed++;
    onProgress?.(`正在导出场景图片 (${processed}/${total})...`, Math.round((processed / total) * 100));
  });
  
  Object.entries(assets.characters).forEach(([key, char]) => {
    const charFolder = charactersFolder?.folder(key);
    if (!charFolder) {
      console.warn(`Failed to create character folder: ${key}`);
      return;
    }
    
    Object.entries(char.sprites).forEach(([spriteName, imageUrl]) => {
      if (imageUrl) {
        const blob = base64ToBlob(imageUrl);
        if (blob) {
          charFolder.file(`${spriteName}.png`, blob);
        } else {
          console.warn(`Failed to convert character sprite to blob: ${key}/${spriteName}`);
        }
      }
      processed++;
      onProgress?.(`正在导出角色图片 (${processed}/${total})...`, Math.round((processed / total) * 100));
    });
  });
}

export async function generateCompleteGameZipWithAssets(
  vnScript: VisualNovelScriptData,
  assets: GameAssets,
  projectName: string = 'my-visual-novel',
  onProgress?: (message: string, percent: number) => void
): Promise<Blob> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const safeName = projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
  
  onProgress?.('正在准备游戏文件...', 2);
  
  const scriptContent = exportToMonogatari(vnScript, {}, assets);
  
  onProgress?.('正在获取文件列表...', 5);
  const fileList = await listMonogatariFiles();
  
  onProgress?.('正在复制引擎文件...', 10);
  
  let loadedFiles = 0;
  const totalFiles = fileList.length + 2;
  
  for (const filePath of fileList) {
    if (filePath === 'index.html') {
      let content = await fetchMonogatariFile(filePath);
      if (content) {
        content = content.replace(/<title>.*?<\/title>/, `<title>${safeName} - 视觉小说</title>`);
        zip.file(filePath, content);
      }
    } else {
      const content = await fetchMonogatariFile(filePath);
      if (content !== null) {
        zip.file(filePath, content);
      }
    }
    loadedFiles++;
    onProgress?.(`正在加载引擎文件 (${loadedFiles}/${totalFiles})...`, 10 + Math.round((loadedFiles / totalFiles) * 40));
  }
  
  onProgress?.('正在生成游戏脚本...', 55);
  zip.file('js/script.js', scriptContent);
  
  onProgress?.('正在生成游戏配置...', 60);
  zip.file('js/options.js', generateOptionsJs());
  zip.file('js/storage.js', generateStorageJs());
  
  if (assets && assets.stats.totalImages > 0) {
    onProgress?.('正在导出资源图片...', 65);
    addAssetsToZip(zip, assets, onProgress);
  }
  
  onProgress?.('正在压缩文件...', 95);
  
  const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    onProgress?.('正在压缩...', 95 + Math.round(metadata.percent / 20));
  });
  
  return blob;
}

export async function downloadCompleteGameWithAssets(
  vnScript: VisualNovelScriptData,
  assets: GameAssets,
  projectName: string = 'my-visual-novel',
  onProgress?: (message: string, percent: number) => void
): Promise<void> {
  const blob = await generateCompleteGameZipWithAssets(vnScript, assets, projectName, onProgress);
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportGameToLocal(
  vnScript: VisualNovelScriptData,
  projectName: string = 'my-visual-novel',
  onProgress?: (message: string, percent: number) => void
): Promise<{ success: boolean; path?: string; error?: string }> {
  if (!('showSaveFilePicker' in window)) {
    return { success: false, error: '当前浏览器不支持文件保存功能，请使用 Chrome/Edge 浏览器' };
  }

  try {
    const blob = await generateCompleteGameZip(vnScript, projectName, onProgress);
    
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `${projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.zip`,
      types: [{
        description: 'ZIP 压缩文件',
        accept: { 'application/zip': ['.zip'] }
      }]
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    return { success: true, path: fileHandle.name };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: '用户取消了保存' };
    }
    return { success: false, error: error.message };
  }
}

export async function exportGameWithAssetsToLocal(
  vnScript: VisualNovelScriptData,
  assets: GameAssets,
  projectName: string = 'my-visual-novel',
  onProgress?: (message: string, percent: number) => void
): Promise<{ success: boolean; path?: string; error?: string }> {
  if (!('showSaveFilePicker' in window)) {
    return { success: false, error: '当前浏览器不支持文件保存功能，请使用 Chrome/Edge 浏览器' };
  }

  try {
    const blob = await generateCompleteGameZipWithAssets(vnScript, assets, projectName, onProgress);
    
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: `${projectName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.zip`,
      types: [{
        description: 'ZIP 压缩文件',
        accept: { 'application/zip': ['.zip'] }
      }]
    });
    
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    
    return { success: true, path: fileHandle.name };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: '用户取消了保存' };
    }
    return { success: false, error: error.message };
  }
}
