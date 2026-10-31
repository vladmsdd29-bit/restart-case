"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cases, type Case } from "../src/data";

type User={nickname:string;balance:number;opened:number};
type Drop={id:number;name:string;icon:string;value:number;rarity:string;createdAt:string};
type History={id:number;caseName:string;itemName:string;itemValue:number;createdAt:string};
const rarityClass=(r:string)=>r.toLowerCase().replace("ё","е");
function WeaponArt({name,rarity,large=false,imageUrl}:{name:string;rarity:string;large?:boolean;imageUrl?:string}){
 const palette:Record<string,[string,string]>={"Обычный":["#7b879b","#354052"],"Необычный":["#4bb9c9","#164e68"],"Редкий":["#a879f5","#4b2c86"],"Эпический":["#ed75bd","#74265f"],"Легендарный":["#f5c66b","#8a4b27"]};
 const [a,b]=palette[rarity]||palette["Обычный"];
 const [imageFailed,setImageFailed]=useState(false);
 useEffect(()=>{setImageFailed(false);},[imageUrl]);
 return <div className={`weaponArt ${large?"weaponLarge":""}`} style={{"--weapon-a":a,"--weapon-b":b} as CSSProperties} aria-label={name}>
  {imageUrl && !imageFailed ? <img className="realWeaponImage" src={imageUrl} alt={name} loading="lazy" referrerPolicy="no-referrer" onError={()=>setImageFailed(true)}/> : <><div className="weaponGlow"/><svg viewBox="0 0 300 120" role="img" aria-hidden="true">
   <defs><linearGradient id={`metal-${rarity.replace(/[^a-zа-я]/gi,"")}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor={a}/><stop offset=".5" stopColor="#e9eaf6"/><stop offset="1" stopColor={b}/></linearGradient></defs>
   <g transform="translate(10 10) rotate(-8 140 50)" stroke="#111522" strokeWidth="3" strokeLinejoin="round">
    <path d="M28 48 L65 42 L85 30 L191 34 L216 42 L268 44 L273 53 L211 57 L193 66 L91 65 L75 58 L39 62 Z" fill={`url(#metal-${rarity.replace(/[^a-zа-я]/gi,"")})`}/>
    <path d="M95 62 L119 63 L112 93 L88 91 Z" fill={b}/><path d="M132 63 L157 64 L164 87 L143 88 Z" fill="#252a3a"/><path d="M192 36 L218 40 L219 52 L193 53 Z" fill={b}/>
    <path d="M25 49 L8 47 L8 55 L28 58 Z" fill="#b9c3d7"/><path d="M216 44 L287 45 L290 50 L218 53 Z" fill="#aeb8ce"/><path d="M68 43 L77 26 L91 27 L87 44 Z" fill={b}/>
    <path d="M148 36 L177 38 L170 46 L143 45 Z" fill="#ffffff" opacity=".55"/><path d="M45 52 L68 49" stroke="#fff" opacity=".55"/>
   </g>
  </svg>
  <span className="weaponLabel">{name.split("|")[0].trim()}</span></>}
 </div>
}
function rarityColor(r:string){return r==="Легендарный"?"gold":r==="Эпический"?"pink":r==="Редкий"?"purple":r==="Необычный"?"blue":"gray"}
export default function Home(){
 const [user,setUser]=useState<User>({nickname:"GUEST",balance:1000,opened:0});
 const [inventory,setInventory]=useState<Drop[]>([]);const [history,setHistory]=useState<History[]>([]);const [skinImages,setSkinImages]=useState<Record<string,string>>({});
 const [filter,setFilter]=useState("all");const [selected,setSelected]=useState<Case|null>(null);const [catalogCount,setCatalogCount]=useState(0);const [catalogLoading,setCatalogLoading]=useState(true);
 const [busy,setBusy]=useState(false);const [result,setResult]=useState<Drop|null>(null);const [rolling,setRolling]=useState(false);
 const [rouletteItems,setRouletteItems]=useState<{name:string;rarity:string;icon:string;value:number}[]>([]);
 const reelWindowRef=useRef<HTMLDivElement|null>(null);
 const reelTrackRef=useRef<HTMLDivElement|null>(null);
 const [reelTransform,setReelTransform]=useState("translateX(0px)");
 useEffect(()=>{if(!rolling)return;const frame=requestAnimationFrame(()=>{const viewport=reelWindowRef.current;const track=reelTrackRef.current;const target=track?.children[30] as HTMLElement|undefined;if(viewport&&target){const center=target.offsetLeft+target.offsetWidth/2;setReelTransform(`translateX(${viewport.clientWidth/2-center}px)`);}});return()=>cancelAnimationFrame(frame);},[rolling,rouletteItems]);
 const [error,setError]=useState("");const [notice,setNotice]=useState("");const [selling,setSelling]=useState<number|null>(null);
 const fmt=(n:number)=>n.toLocaleString("ru-RU");
 async function refresh(){const r=await fetch("/api/state");const d=await r.json();setUser(d.user);setInventory(d.inventory);setHistory(d.history);}
 useEffect(()=>{refresh().catch(()=>setError("Не удалось загрузить данные"));fetch("/api/skins").then(r=>r.json()).then(d=>{setSkinImages(d.images||{});setCatalogCount(d.count||0);}).catch(()=>{}).finally(()=>setCatalogLoading(false));},[]);
 async function topup(){const r=await fetch("/api/balance",{method:"POST"});const d=await r.json();setUser(d.user);setNotice("+500 виртуальных монет добавлено");}
 async function sell(item:Drop){if(selling!==null)return;setSelling(item.id);setError("");try{const r=await fetch("/api/sell",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id})});const d=await r.json();if(!r.ok)throw new Error(d.error);setUser(d.user);setInventory(d.inventory);setNotice(`${item.name} продан за ${fmt(item.value)} монет`);}catch(e){setError(e instanceof Error?e.message:"Не удалось продать предмет");}finally{setSelling(null);}}
 async function openCase(){if(!selected||busy)return;setBusy(true);setError("");setNotice("");setResult(null);setRolling(false);
  const pool=selected.items;const strip=Array.from({length:37},(_,i)=>{const x=pool[Math.floor(Math.random()*pool.length)];return {...x};});setRouletteItems(strip);
  try{const r=await fetch("/api/open",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({caseId:selected.id})});const d=await r.json();if(!r.ok)throw new Error(d.error);const win={...d.item};setRouletteItems(old=>old.map((x,i)=>i===30?win:x));setRolling(true);await new Promise(resolve=>setTimeout(resolve,4300));setResult(win);setUser(d.user);await refresh();}
  catch(e){setError(e instanceof Error?e.message:"Не удалось открыть кейс");setRolling(false);}
  finally{setBusy(false);setRolling(false);}
 }
  const [upgradeSource, setUpgradeSource] =
    useState<number | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  const upgradeCatalog = Array.from(
    new Map(
      cases.flatMap(c => c.items).map(i => [i.name, i])
    ).values()
  ).sort((a, b) => a.value - b.value);

  const sourceItem = inventory.find(
    i => i.id === upgradeSource
  );

  const targetItem = upgradeCatalog.find(
    i => i.name === upgradeTarget
  );

  const upgradeChance =
    sourceItem &&
    targetItem &&
    targetItem.value > sourceItem.value
      ? Math.min(
          90,
          Math.round(
            sourceItem.value / targetItem.value * 9000
          ) / 100
        )
      : 0;

  async function performUpgrade() {
    if (!sourceItem || !targetItem || !upgradeChance || upgrading)
      return;

    setUpgrading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sourceId: sourceItem.id,
          targetName: targetItem.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setUser(data.user);
      setInventory(data.inventory);
      setHistory(data.history);

      setNotice(
        data.success
          ? `Апгрейд успешен! Получен ${targetItem.name}`
          : `Апгрейд не удался. ${sourceItem.name} потерян.`
      );

      setUpgradeSource(null);
      setUpgradeTarget("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Ошибка апгрейда"
      );
    } finally {
      setUpgrading(false);
    }
  }

 const visible=cases.filter(c=>filter==="all"||(filter==="budget"?c.price<=300:c.price>300));
 const reelStyle={transform:reelTransform};
 return <div className="layout"><aside className="sidebar"><div className="brand">RESTART <i>CASE</i></div><div className="demo">LOCAL DEMO · VIRTUAL COINS</div><div className="navlabel">МЕНЮ</div><a className="nav active" href="#home">⌂ <span>Главная</span></a><a className="nav" href="#cases">▦ <span>Кейсы</span></a><a className="nav" href="#inventory">▣ <span>Инвентарь</span></a><a className="nav" href="#history">◷ <span>История</span></a><div className="side-note"><b>Локальный режим</b>Баланс и предметы сохраняются на этом компьютере. Только виртуальные монеты.</div></aside>
 <main><header className="top"><div className="toplinks"><a href="#cases">Кейсы</a><a href="#inventory">Инвентарь</a><a href="#history">История</a></div><div className="topright"><div className="balance">◆ {fmt(user.balance)}</div><button className="btn" onClick={topup}>+500 монет</button></div></header>
 <div className="content" id="home"><section className="hero"><div className="eyebrow">CS2 CASE OPENING EXPERIENCE</div><h1>ОТКРОЙ СВОЙ<br/><span>СЛЕДУЮЩИЙ ДРОП.</span></h1><p>Выбирай кейс, запускай рулетку и собирай свою коллекцию в RESTART CASE.</p><a className="btn heroBtn" href="#cases">Выбрать кейс ↗</a><div className="heroShowcase"><div className="heroShowcaseGlow"/><div className="heroWeapon heroWeaponBack"><WeaponArt name="AWP | Atheris" rarity="Редкий" imageUrl={skinImages["AWP | Atheris"]}/></div><div className="heroWeapon heroWeaponMain"><WeaponArt name="AK-47 | Slate" rarity="Эпический" imageUrl={skinImages["AK-47 | Slate"]}/></div><div className="heroWeapon heroWeaponFront"><WeaponArt name="★ Butterfly Knife | Doppler" rarity="Легендарный" imageUrl={skinImages["★ Butterfly Knife | Doppler"]}/></div><div className="heroTag">CS2 SKIN COLLECTION</div></div></section>
 <div className="stats"><div className="stat"><small>ВИРТУАЛЬНЫЙ БАЛАНС</small><b>◆ {fmt(user.balance)}</b></div><div className="stat"><small>ОТКРЫТО КЕЙСОВ</small><b>{user.opened}</b></div><div className="stat"><small>ПРЕДМЕТОВ В ИНВЕНТАРЕ</small><b>{inventory.length}</b></div></div>
 {notice&&<div className="notice">✓ {notice}<button onClick={()=>setNotice("")}>×</button></div>}
 <section id="cases"><div className="sectionHead"><div><h2>Выбери свой кейс</h2><p>Шансы выпадения показаны внутри каждого кейса</p></div><span className="pill">6 КЕЙСОВ</span></div><div className="catalogStatus"><span className={catalogCount?"statusDot online":"statusDot"}/>{catalogLoading?"Загружаем каталог изображений…":catalogCount?`Каталог CS2 подключён · ${catalogCount} изображений`:"Каталог изображений временно недоступен · включены резервные иллюстрации"}</div><div className="filters"><button className={filter==="all"?"chosen":""} onClick={()=>setFilter("all")}>Все кейсы</button><button className={filter==="budget"?"chosen":""} onClick={()=>setFilter("budget")}>До 300</button><button className={filter==="premium"?"chosen":""} onClick={()=>setFilter("premium")}>Премиум</button></div><div className="cases">{visible.map(c=><article className="case" key={c.id} onClick={()=>{setSelected(c);setResult(null);setError("");}}><div className={`caseArt rarityFrame ${rarityColor(c.items[2].rarity)}`} style={{"--accent":c.accent} as CSSProperties}><div className="caseArtGlow"/><WeaponArt name={c.items[2].name} rarity={c.items[2].rarity} imageUrl={skinImages[c.items[2].name]}/><div className="caseSpark">✦</div><span className={`caseRarity ${rarityColor(c.items[2].rarity)}`}>{c.items[2].rarity}</span></div><h3>{c.name}</h3><p>{c.description}</p><div className="caseFoot"><b>◆ {fmt(c.price)}</b><button className="btn">Открыть ↗</button></div></article>)}</div></section>
 
<section className="panel upgradePanel" id="upgrade">
  <div className="sectionHead">
    <div>
      <h2>⚡ Апгрейд скинов</h2>
      <p>
        Выбери свой предмет и попробуй получить более дорогой!
      </p>
    </div>
  </div>

  <div className="upgradeGrid">
    <div className="upgradeBox">
      <h3>1. Твой предмет</h3>
      <select
        value={upgradeSource ?? ""}
        onChange={e => {
          setUpgradeSource(
            e.target.value ? Number(e.target.value) : null
          );
          setUpgradeTarget("");
        }}
        disabled={upgrading}
      >
        <option value="">Выбери предмет</option>
        {inventory.map(i => (
          <option key={i.id} value={i.id}>
            {i.name} — {i.value} монет
          </option>
        ))}
      </select>
      {sourceItem && (
        <WeaponArt
          name={sourceItem.name}
          rarity={sourceItem.rarity}
          imageUrl={skinImages[sourceItem.name]}
        />
      )}
    </div>

    <div className="upgradeChance">
      <span>ШАНС УСПЕХА</span>
      <strong>{upgradeChance.toFixed(2)}%</strong>
      <div className="upgradeBar">
        <div style={{ width: `${upgradeChance}%` }} />
      </div>
    </div>

    <div className="upgradeBox">
      <h3>2. Желаемый скин</h3>
      <select
        value={upgradeTarget}
        onChange={e => setUpgradeTarget(e.target.value)}
        disabled={!sourceItem || upgrading}
      >
        <option value="">Выбери скин</option>
        {upgradeCatalog
          .filter(i => sourceItem && i.value > sourceItem.value)
          .map(i => (
            <option key={i.name} value={i.name}>
              {i.name} — {i.value} монет
            </option>
          ))}
      </select>
      {targetItem && (
        <WeaponArt
          name={targetItem.name}
          rarity={targetItem.rarity}
          imageUrl={skinImages[targetItem.name]}
        />
      )}
    </div>
  </div>

  <div className="upgradeActions">
    <button
      className="btn"
      disabled={!upgradeChance || upgrading}
      onClick={performUpgrade}
    >
      {upgrading ? "Апгрейд выполняется..." : "⚡ АПГРЕЙД"}
    </button>
    <p>
      При неудаче исходный предмет исчезает.
      Все предметы и монеты виртуальные.
    </p>
  </div>
</section>
<section className="panel" id="inventory"><div className="sectionHead"><div><h2>Мой инвентарь</h2><p>Продавай предметы и возвращай виртуальные монеты</p></div><span className="pill">{inventory.length} ПРЕДМЕТОВ</span></div><div className="items">{inventory.length?inventory.map(x=><div className={`item rarityItem ${rarityColor(x.rarity)}`} key={x.id}><WeaponArt name={x.name} rarity={x.rarity} imageUrl={skinImages[x.name]}/><b>{x.name}</b><small className={`rarityText ${rarityColor(x.rarity)}`}>{x.rarity} · ◆ {fmt(x.value)}</small><button className="sellBtn" disabled={selling===x.id} onClick={()=>sell(x)}>{selling===x.id?"Продаём…":`Продать · ${fmt(x.value)} ◆`}</button></div>):<div className="empty">Пока пусто. Открой первый кейс!</div>}</div></section>
 <section className="panel" id="history"><div className="sectionHead"><div><h2>История открытий</h2><p>Последние 20 операций</p></div></div>{history.length?<div className="history">{history.map(h=><div className="historyRow" key={h.id}><span>◈</span><div><b>{h.itemName}</b><small>{h.caseName} · {h.createdAt}</small></div><strong>◆ {fmt(h.itemValue)}</strong></div>)}</div>:<div className="empty">История появится после первого открытия.</div>}</section>
 <footer><b>RESTART CASE</b><span>Локальный CS2 case-opening demo · Только виртуальные монеты</span><span>Не связан с Valve или Steam. Реальные платежи и торговля отключены.</span></footer></div></main>
 {selected&&<div className="overlay" onMouseDown={e=>{if(e.target===e.currentTarget&&!busy)setSelected(null)}}><div className="modal"><div className="modalTop"><div><div className="eyebrow">RESTART CASE · DROP SYSTEM</div><h2>{selected.name}</h2></div><button className="close" onClick={()=>!busy&&setSelected(null)}>✕</button></div>
 <div className={`roulette ${rolling?"isRolling":""} ${result?"hasResult":""}`}><div className="pointer"/><div className="reelWindow" ref={reelWindowRef}><div className="reelTrack" ref={reelTrackRef} style={reelStyle}>{rouletteItems.map((x,i)=><div className={`reelTile ${rarityColor(x.rarity)} ${i===30&&rolling?"targetTile":""}`} key={i}><WeaponArt name={x.name} rarity={x.rarity} imageUrl={skinImages[x.name]}/><b>{x.name}</b></div>)}</div></div>{!rouletteItems.length&&!result&&<div className="rouletteIdle">{selected.icon}</div>}{result&&<div className="win"><span className="winLabel">ВАШ ДРОП</span><WeaponArt name={result.name} rarity={result.rarity} large imageUrl={skinImages[result.name]}/><b>{result.name}</b><small className={`rarityText ${rarityColor(result.rarity)}`}>{result.rarity} · ◆ {fmt(result.value)}</small></div>}</div>
 {error&&<div className="error">{error}</div>}<div className="odds"><b>Шансы выпадения</b>{selected.items.map(x=><div key={x.name}><span>{x.name}</span><span>{x.weight}%</span></div>)}</div><div className="modalActions"><button className="btn" disabled={busy} onClick={openCase}>{busy?"Рулетка крутится…":`Открыть за ◆ ${fmt(selected.price)}`}</button><button className="secondary" disabled={busy} onClick={()=>setSelected(null)}>Закрыть</button></div><p className="modalHint">Только виртуальные монеты. Изображения скинов загружаются из публичного каталога CS2; при отсутствии соединения используются резервные иллюстрации.</p></div></div>}
 </div>
}
