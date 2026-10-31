export type Item = { name: string; value: number; icon: string; rarity: string; weight: number };
export type Case = { id: string; name: string; price: number; icon: string; accent: string; description: string; items: Item[] };
export const cases: Case[] = [
 {id:"first-blood",name:"FIRST BLOOD",price:75,icon:"📦",accent:"#7354c9",description:"Первый шаг к большой коллекции",items:[
  {name:"Glock-18 | Candy Apple",value:35,icon:"🔫",rarity:"Обычный",weight:42},
  {name:"UMP-45 | Exposure",value:55,icon:"🔫",rarity:"Необычный",weight:28},
  {name:"AWP | Atheris",value:140,icon:"🎯",rarity:"Редкий",weight:17},
  {name:"AK-47 | Slate",value:260,icon:"🔫",rarity:"Эпический",weight:10},
  {name:"★ Butterfly Knife | Doppler",value:1100,icon:"🔪",rarity:"Легендарный",weight:3}]},
 {id:"neon-dream",name:"NEON DREAM",price:150,icon:"🟪",accent:"#a13dbb",description:"Неоновые цвета и яркие дропы",items:[
  {name:"MP9 | Starlight Protector",value:65,icon:"🔫",rarity:"Обычный",weight:42},
  {name:"M4A1-S | Decimator",value:180,icon:"🔫",rarity:"Необычный",weight:28},
  {name:"USP-S | Neo-Noir",value:290,icon:"🔫",rarity:"Редкий",weight:17},
  {name:"AWP | Neo-Noir",value:520,icon:"🎯",rarity:"Эпический",weight:10},
  {name:"★ Specialist Gloves | Fade",value:1600,icon:"🧤",rarity:"Легендарный",weight:3}]},
 {id:"cyber-hunt",name:"CYBER HUNT",price:300,icon:"🧊",accent:"#287caa",description:"Охота за редкими предметами",items:[
  {name:"FAMAS | ZX Spectron",value:110,icon:"🔫",rarity:"Обычный",weight:42},
  {name:"Desert Eagle | Trigger Discipline",value:240,icon:"🔫",rarity:"Необычный",weight:28},
  {name:"M4A4 | Cyber Security",value:480,icon:"🔫",rarity:"Редкий",weight:17},
  {name:"AK-47 | Neon Rider",value:850,icon:"🔫",rarity:"Эпический",weight:10},
  {name:"★ Bayonet | Marble Fade",value:2400,icon:"🔪",rarity:"Легендарный",weight:3}]},
 {id:"purple-haze",name:"PURPLE HAZE",price:500,icon:"💜",accent:"#7434bb",description:"Фиолетовая серия для смелых",items:[
  {name:"Five-SeveN | Violent Daimyo",value:180,icon:"🔫",rarity:"Обычный",weight:42},
  {name:"P250 | See Ya Later",value:350,icon:"🔫",rarity:"Необычный",weight:28},
  {name:"M4A4 | Hyper Beast",value:760,icon:"🔫",rarity:"Редкий",weight:17},
  {name:"AWP | Asiimov",value:1250,icon:"🎯",rarity:"Эпический",weight:10},
  {name:"★ Karambit | Gamma Doppler",value:3500,icon:"🔪",rarity:"Легендарный",weight:3}]},
 {id:"gold-rush",name:"GOLD RUSH",price:750,icon:"👑",accent:"#9b762d",description:"Золотая охота за топовыми дропами",items:[
  {name:"MAC-10 | Gold Brick",value:280,icon:"🔫",rarity:"Обычный",weight:42},
  {name:"AK-47 | The Empress",value:650,icon:"🔫",rarity:"Необычный",weight:28},
  {name:"M4A4 | The Emperor",value:1150,icon:"🔫",rarity:"Редкий",weight:17},
  {name:"AWP | Dragon Lore",value:5000,icon:"🎯",rarity:"Эпический",weight:10},
  {name:"★ Driver Gloves | King Snake",value:6200,icon:"🧤",rarity:"Легендарный",weight:3}]},
 {id:"restart",name:"RESTART",price:1000,icon:"⚡",accent:"#9c3f88",description:"Главный кейс проекта",items:[
  {name:"USP-S | Cortex",value:400,icon:"🔫",rarity:"Обычный",weight:42},
  {name:"AK-47 | Bloodsport",value:900,icon:"🔫",rarity:"Необычный",weight:28},
  {name:"AWP | Fade",value:1800,icon:"🎯",rarity:"Редкий",weight:17},
  {name:"★ Karambit | Doppler",value:5200,icon:"🔪",rarity:"Эпический",weight:10},
  {name:"★ Sport Gloves | Vice",value:9000,icon:"🧤",rarity:"Легендарный",weight:3}]}
];
