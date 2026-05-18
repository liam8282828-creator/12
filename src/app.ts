import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

app.use(pinoHttp({ logger, serializers: { req: (r) => ({ id: r.id, method: r.method, url: r.url?.split("?")[0] }), res: (r) => ({ statusCode: r.statusCode }) } }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

/* ─── Dashboard HTML ──────────────────────────────────────────────────────── */
const HTML = `<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOVA API</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#07071a;--side:#0d0d28;--card:#12122c;--border:#1c1c44;--green:#00e676;--purple:#7c3aed;--text:#e2e8f0;--muted:#64748b;--danger:#ef4444;--warn:#f59e0b;--r:10px}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
/* LOGIN */
#login{display:flex;align-items:center;justify-content:center;min-height:100vh;background:radial-gradient(ellipse at 50% 40%,#12122c 0%,#07071a 70%)}
.lcard{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:44px 38px;width:360px;text-align:center}
.lcard h1{font-size:2rem;font-weight:800;background:linear-gradient(135deg,var(--green),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.lcard p{color:var(--muted);font-size:.88rem;margin-bottom:28px}
.lcard input{width:100%;padding:11px 14px;background:#0d0d28;border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.95rem;margin-bottom:10px;outline:none;transition:border .2s}
.lcard input:focus{border-color:var(--purple)}
.lcard button{width:100%;padding:12px;background:linear-gradient(135deg,var(--purple),#4f1de0);border:none;border-radius:8px;color:#fff;font-size:.95rem;font-weight:700;cursor:pointer}
.lcard button:hover{opacity:.88}
.lerr{color:var(--danger);font-size:.82rem;margin-top:8px;display:none}
/* APP */
#app{display:none;min-height:100vh}
aside{position:fixed;top:0;left:0;bottom:0;width:220px;background:var(--side);border-right:1px solid var(--border);padding:20px 0;z-index:10;overflow-y:auto}
.logo{padding:0 18px 24px;font-size:1.35rem;font-weight:800;background:linear-gradient(135deg,var(--green),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.ni{display:flex;align-items:center;gap:10px;padding:10px 18px;cursor:pointer;color:var(--muted);font-size:.87rem;font-weight:500;border-left:3px solid transparent;transition:all .15s}
.ni:hover{color:var(--text);background:rgba(124,58,237,.08)}
.ni.on{color:var(--text);background:rgba(124,58,237,.14);border-left-color:var(--purple)}
.ni .ic{width:20px;text-align:center}
.sep{margin:10px 18px;border-top:1px solid var(--border)}
.ws-dot{display:block;margin:0 auto;text-align:center;font-size:.7rem;color:var(--muted);position:absolute;bottom:12px;left:0;right:0}
main{margin-left:220px;padding:26px}
/* SECTIONS */
section{display:none}.on2{display:block}
.ptitle{font-size:1.5rem;font-weight:700;margin-bottom:4px}
.psub{color:var(--muted);font-size:.87rem;margin-bottom:24px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:900px){.g4,.g3{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:18px}
.ct{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:8px}
.cv{font-size:1.9rem;font-weight:800}
.cs{font-size:.78rem;color:var(--muted);margin-top:4px}
.badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:.75rem;font-weight:700}
.bg{background:rgba(0,230,118,.1);color:var(--green)}
.br{background:rgba(239,68,68,.1);color:var(--danger)}
.by{background:rgba(245,158,11,.1);color:var(--warn)}
.bp{background:rgba(124,58,237,.15);color:#a78bfa}
.dot{width:7px;height:7px;border-radius:50%;display:inline-block}
.dg{background:var(--green);box-shadow:0 0 5px var(--green)}
.dr{background:var(--danger)}
.dy{background:var(--warn)}
/* BTNS */
.btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:7px;font-size:.85rem;font-weight:600;cursor:pointer;border:none;transition:opacity .15s}
.btn:hover{opacity:.82}
.btn-p{background:linear-gradient(135deg,var(--purple),#4f1de0);color:#fff}
.btn-g{background:rgba(0,230,118,.12);color:var(--green);border:1px solid rgba(0,230,118,.25)}
.btn-d{background:rgba(239,68,68,.1);color:var(--danger);border:1px solid rgba(239,68,68,.25)}
.btn-o{background:rgba(255,255,255,.05);color:var(--text);border:1px solid var(--border)}
/* FORM */
.label{font-size:.78rem;color:var(--muted);font-weight:600;margin-bottom:5px;display:block}
.inp{width:100%;padding:9px 13px;background:#0d0d28;border:1px solid var(--border);border-radius:7px;color:var(--text);font-size:.88rem;outline:none;transition:border .2s}
.inp:focus{border-color:var(--purple)}
select.inp{cursor:pointer}
.fr{margin-bottom:12px}
/* TABLE */
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:9px 13px;font-size:.72rem;color:var(--muted);font-weight:700;text-transform:uppercase;border-bottom:1px solid var(--border)}
td{padding:11px 13px;border-bottom:1px solid rgba(28,28,68,.5);font-size:.86rem;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(124,58,237,.04)}
/* TOGGLE */
.tgl{position:relative;display:inline-block;width:42px;height:23px}
.tgl input{opacity:0;width:0;height:0}
.sl{position:absolute;cursor:pointer;inset:0;background:#1c1c44;border-radius:23px;transition:.25s}
.sl:before{content:"";position:absolute;height:17px;width:17px;left:3px;bottom:3px;background:#64748b;border-radius:50%;transition:.25s}
input:checked+.sl{background:rgba(0,230,118,.2)}
input:checked+.sl:before{transform:translateX(19px);background:var(--green)}
/* QR */
.qr-wrap{background:#fff;border-radius:10px;padding:14px;display:inline-flex}
.qr-wrap img{width:200px;height:200px;object-fit:contain}
.qr-ph{width:200px;height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;gap:6px;font-size:.82rem;text-align:center}
/* KEY BOX */
.kbox{display:flex;align-items:center;gap:8px;background:#0d0d28;border:1px solid var(--border);border-radius:7px;padding:9px 13px;font-family:monospace;font-size:.8rem;color:var(--green);word-break:break-all}
.kbox button{flex-shrink:0;background:none;border:none;cursor:pointer;color:var(--muted);font-size:.95rem}
.kbox button:hover{color:var(--text)}
/* ALERT */
.alert{padding:11px 15px;border-radius:8px;font-size:.85rem;margin-bottom:14px}
.alert-g{background:rgba(0,230,118,.07);border:1px solid rgba(0,230,118,.2);color:var(--green)}
.alert-y{background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);color:var(--warn)}
.alert-r{background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:var(--danger)}
/* STAT ROW */
.sr{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid rgba(28,28,68,.5)}
.sr:last-child{border-bottom:none}
.sl2{color:var(--muted);font-size:.83rem}
.sv{font-size:.85rem;font-weight:600}
/* MUSIC */
.mres{display:flex;gap:11px;padding:11px;background:#0d0d28;border:1px solid var(--border);border-radius:8px;margin-bottom:8px;align-items:center}
.mres img{width:52px;height:52px;border-radius:6px;object-fit:cover;flex-shrink:0}
.mres .mi{flex:1;min-width:0}
.mres .mt{font-size:.86rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mres .mm{font-size:.76rem;color:var(--muted);margin-top:2px}
.mres a{padding:5px 11px;background:rgba(0,230,118,.1);color:var(--green);border-radius:6px;text-decoration:none;font-size:.78rem;font-weight:700;flex-shrink:0}
/* TOAST */
#toast{position:fixed;bottom:20px;right:20px;background:#1c1c44;border:1px solid var(--border);border-radius:9px;padding:11px 18px;font-size:.86rem;z-index:999;transform:translateY(70px);opacity:0;transition:all .25s;pointer-events:none;max-width:300px}
#toast.show{transform:translateY(0);opacity:1}
/* BOT STATUS CARD */
.bot-card{background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(0,230,118,.08));border:1px solid rgba(124,58,237,.3);border-radius:var(--r);padding:20px}
</style>
</head><body>

<!-- LOGIN -->
<div id="login">
  <div class="lcard">
    <h1>⚡ NOVA API</h1>
    <p>Panel de control — ingresa tu API Key</p>
    <input type="password" id="pw" placeholder="Escribe tu API_KEY aquí" onkeydown="if(event.key==='Enter')doLogin()">
    <button onclick="doLogin()">Entrar al panel</button>
    <p class="lerr" id="lerr">❌ API Key incorrecta. Revisa tu .env → API_KEY</p>
  </div>
</div>

<!-- APP -->
<div id="app">
  <aside>
    <div class="logo">⚡ NOVA API</div>
    <div class="ni on" onclick="go('dash',this)"><span class="ic">🏠</span> Dashboard</div>
    <div class="ni" onclick="go('bot',this)"><span class="ic">🤖</span> Conectar Bot</div>
    <div class="ni" onclick="go('wa',this)"><span class="ic">📱</span> WhatsApp</div>
    <div class="ni" onclick="go('cmds',this)"><span class="ic">⚡</span> Comandos</div>
    <div class="sep"></div>
    <div class="ni" onclick="go('music',this)"><span class="ic">🎵</span> Música</div>
    <div class="ni" onclick="go('ia',this)"><span class="ic">🧠</span> IA / Webhooks</div>
    <div class="sep"></div>
    <div class="ni" onclick="go('keys',this)"><span class="ic">🔑</span> API Keys</div>
    <span class="ws-dot" id="wsdot">⚫ Conectando...</span>
  </aside>

  <main>

    <!-- DASHBOARD -->
    <section id="tab-dash" class="on2">
      <div class="ptitle">Dashboard</div>
      <div class="psub">Estado en tiempo real de NOVA API</div>
      <div class="g4" style="margin-bottom:18px">
        <div class="card"><div class="ct">Uptime</div><div class="cv" id="d-up">—</div><div class="cs">segundos corriendo</div></div>
        <div class="card"><div class="ct">WhatsApp</div><div style="margin-top:6px" id="d-wa"><span class="badge by"><span class="dot dy"></span> Cargando...</span></div><div class="cs" id="d-ph" style="margin-top:6px"></div></div>
        <div class="card"><div class="ct">Bot</div><div style="margin-top:6px" id="d-bot-badge"><span class="badge br"><span class="dot dr"></span> Sin bot</span></div><div class="cs" id="d-bot-n" style="margin-top:5px"></div></div>
        <div class="card"><div class="ct">Comandos activos</div><div class="cv" id="d-cen">0</div><div class="cs" id="d-ctot"></div></div>
      </div>
      <div class="g2">
        <div class="card">
          <div class="ct" style="margin-bottom:14px">Sistema</div>
          <div class="sr"><span class="sl2">Versión</span><span class="sv">2.0.0</span></div>
          <div class="sr"><span class="sl2">WebSocket clients</span><span class="sv" id="d-wsc">0</span></div>
          <div class="sr"><span class="sl2">Prefijo del bot</span><span class="sv" id="d-pfx">—</span></div>
          <div class="sr"><span class="sl2">Owner</span><span class="sv" id="d-own">—</span></div>
          <div class="sr"><span class="sl2">NODE_ENV</span><span class="sv" id="d-env">—</span></div>
        </div>
        <div class="card">
          <div class="ct" style="margin-bottom:14px">Actividad reciente</div>
          <div id="d-act" style="color:var(--muted);font-size:.83rem">Esperando eventos WebSocket...</div>
        </div>
      </div>
    </section>

    <!-- CONECTAR BOT -->
    <section id="tab-bot">
      <div class="ptitle">Conectar Bot</div>
      <div class="psub">Registra tu bot externo en NOVA API usando una key generada</div>

      <!-- Bot conectado -->
      <div id="bot-connected" style="display:none;margin-bottom:18px">
        <div class="bot-card">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
            <div>
              <div style="font-size:1.1rem;font-weight:700;margin-bottom:4px">🤖 <span id="bc-name"></span></div>
              <div style="color:var(--muted);font-size:.84rem">v<span id="bc-ver"></span> &nbsp;·&nbsp; Prefijo: <code style="color:#a78bfa" id="bc-pfx"></code> &nbsp;·&nbsp; <span id="bc-cmds"></span> comandos</div>
              <div style="color:var(--muted);font-size:.8rem;margin-top:4px">🔗 <span id="bc-url"></span></div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="badge bg" id="bc-status"><span class="dot dg"></span> Online</span>
              <button class="btn btn-d" onclick="disconnectBot()">⏏ Desconectar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Formulario conexión -->
      <div id="bot-form" class="g2">
        <div class="card">
          <div class="ct" style="margin-bottom:16px">🔌 Conectar nuevo bot</div>

          <div class="fr">
            <label class="label">URL pública de tu bot</label>
            <input class="inp" id="bot-url" placeholder="https://mi-bot.onrender.com">
            <div style="font-size:.76rem;color:var(--muted);margin-top:4px">La URL donde corre tu bot (sin / al final)</div>
          </div>

          <div class="fr">
            <label class="label">Key del bot (generada en API Keys)</label>
            <select class="inp" id="bot-key-sel">
              <option value="">— Selecciona una key —</option>
            </select>
            <div style="font-size:.76rem;color:var(--muted);margin-top:4px">Si no tienes una, ve a la sección API Keys y genera una</div>
          </div>

          <div id="bot-err" class="alert alert-r" style="display:none"></div>

          <button class="btn btn-p" onclick="connectBot()">🔌 Conectar bot</button>
          &nbsp;
          <button class="btn btn-o" onclick="go('keys',null)">🔑 Ir a API Keys</button>
        </div>

        <div class="card">
          <div class="ct" style="margin-bottom:14px">📋 Qué necesita tu bot</div>
          <p style="color:var(--muted);font-size:.83rem;margin-bottom:12px">Tu bot debe exponer estos 2 endpoints:</p>

          <div style="margin-bottom:12px">
            <div style="font-size:.8rem;color:#a78bfa;font-weight:700;margin-bottom:5px">GET /info</div>
            <div class="kbox" style="flex-direction:column;align-items:flex-start;font-size:.76rem;color:var(--text)">
              <span>{</span>
              <span>&nbsp;&nbsp;"name": "Mi Bot",</span>
              <span>&nbsp;&nbsp;"version": "1.0.0",</span>
              <span>&nbsp;&nbsp;"prefix": ".",</span>
              <span>&nbsp;&nbsp;"commands": [{"name":"play","description":"Música"}]</span>
              <span>}</span>
            </div>
          </div>

          <div>
            <div style="font-size:.8rem;color:#a78bfa;font-weight:700;margin-bottom:5px">POST /message</div>
            <div class="kbox" style="flex-direction:column;align-items:flex-start;font-size:.76rem;color:var(--text)">
              <span>{ "message": {</span>
              <span>&nbsp;&nbsp;"from": "521234@s.whatsapp.net",</span>
              <span>&nbsp;&nbsp;"text": ".play Despacito",</span>
              <span>&nbsp;&nbsp;"timestamp": 1234567890</span>
              <span>} }</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHATSAPP -->
    <section id="tab-wa">
      <div class="ptitle">WhatsApp</div>
      <div class="psub">Escanea el QR o conecta con código de teléfono</div>
      <div class="g2">
        <div class="card">
          <div class="ct" style="margin-bottom:14px">Código QR</div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
            <div class="qr-wrap">
              <div class="qr-ph" id="qr-ph">⏳<br>Iniciando...<br><small>Unos segundos</small></div>
              <img id="qr-img" src="" style="display:none;width:200px;height:200px">
            </div>
            <div id="wa-badge" class="badge by"><span class="dot dy"></span> Conectando...</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-p" onclick="loadQR()">🔄 Actualizar QR</button>
              <button class="btn btn-d" onclick="restartWA()">♻️ Reiniciar sesión</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="ct" style="margin-bottom:14px">Conectar con número</div>
          <p style="color:var(--muted);font-size:.83rem;margin-bottom:14px">Alternativa al QR: recibes un código de 8 dígitos en WhatsApp.</p>
          <div class="fr"><label class="label">Tu número (con código de país, sin +)</label><input class="inp" id="pp" placeholder="15165408138"></div>
          <button class="btn btn-p" onclick="doPair()">📲 Solicitar código</button>
          <div id="pair-ok" style="margin-top:14px;display:none">
            <div class="alert alert-g">Código: <strong id="pair-code" style="font-size:1.3rem;letter-spacing:3px"></strong><br><small>Escríbelo en WhatsApp → Dispositivos vinculados</small></div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMANDOS -->
    <section id="tab-cmds">
      <div class="ptitle">Comandos</div>
      <div class="psub">Activa o desactiva los comandos de tu bot</div>
      <div id="no-bot" class="alert alert-y">⚠️ No hay bot conectado. Ve a <strong>Conectar Bot</strong> primero.</div>
      <div id="cmds-area" style="display:none">
        <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap">
          <input class="inp" id="csearch" placeholder="🔍 Buscar comando..." oninput="filterCmds()" style="flex:1;min-width:180px">
          <button class="btn btn-g" onclick="setAll(true)">✅ Activar todos</button>
          <button class="btn btn-d" onclick="setAll(false)">🚫 Desactivar todos</button>
        </div>
        <div class="card" style="padding:0;overflow:hidden">
          <table><thead><tr><th>Comando</th><th>Descripción</th><th>Uso</th><th style="text-align:center">Estado</th></tr></thead>
          <tbody id="cmd-tb"></tbody></table>
        </div>
      </div>
    </section>

    <!-- MÚSICA -->
    <section id="tab-music">
      <div class="ptitle">Música</div>
      <div class="psub">Busca canciones en YouTube para probar la integración</div>
      <div class="g2">
        <div class="card">
          <div class="ct" style="margin-bottom:14px">Buscador de prueba</div>
          <div class="fr">
            <label class="label">Canción o artista</label>
            <div style="display:flex;gap:8px">
              <input class="inp" id="mq" placeholder="Bad Bunny Tití" onkeydown="if(event.key==='Enter')doMusicSearch()">
              <button class="btn btn-p" onclick="doMusicSearch()">🔍</button>
            </div>
          </div>
          <div id="mres"></div>
        </div>
        <div class="card">
          <div class="ct" style="margin-bottom:12px">Cómo lo usa tu bot</div>
          <p style="color:var(--muted);font-size:.82rem;margin-bottom:12px">Cuando el usuario mande <code style="color:#a78bfa">.play canción</code>, tu bot llama:</p>
          <div class="kbox" style="flex-direction:column;align-items:flex-start;font-size:.77rem;color:var(--text);margin-bottom:10px">
            <span style="color:var(--muted)">POST /api/music/search</span>
            <span>x-api-key: TU_API_KEY</span>
            <span>{ "query": "nombre canción", "limit": 1 }</span>
          </div>
          <p style="color:var(--muted);font-size:.8rem">Responde con URL de YouTube, título, duración y miniatura. Tu bot toma ese URL y envía el audio.</p>
        </div>
      </div>
    </section>

    <!-- IA -->
    <section id="tab-ia">
      <div class="ptitle">IA / Webhooks</div>
      <div class="psub">Integración en tiempo real con WebSocket</div>
      <div class="g2">
        <div class="card">
          <div class="ct" style="margin-bottom:12px">WebSocket en tiempo real</div>
          <p style="color:var(--muted);font-size:.83rem;margin-bottom:10px">Conéctate a este endpoint desde tu bot para recibir eventos en tiempo real:</p>
          <div class="kbox" id="ws-url-box">cargando...</div>
          <p style="color:var(--muted);font-size:.8rem;margin-top:12px">Eventos disponibles: <code style="color:#a78bfa">qr</code>, <code style="color:#a78bfa">connection</code>, <code style="color:#a78bfa">message</code>, <code style="color:#a78bfa">bot_registered</code>, <code style="color:#a78bfa">bot_offline</code></p>
        </div>
        <div class="card">
          <div class="ct" style="margin-bottom:12px">IA — Próximamente</div>
          <p style="color:var(--muted);font-size:.83rem;margin-bottom:12px">El endpoint de IA estará disponible en la próxima versión:</p>
          <div class="kbox" style="flex-direction:column;align-items:flex-start;font-size:.77rem;color:var(--text)">
            <span style="color:var(--muted)">POST /api/ai/chat</span>
            <span>{ "message": "Hola", "context": [] }</span>
          </div>
          <div class="alert alert-y" style="margin-top:12px;font-size:.8rem">🚧 Por ahora configura la IA directamente en tu bot</div>
        </div>
      </div>
    </section>

    <!-- API KEYS -->
    <section id="tab-keys">
      <div class="ptitle">API Keys</div>
      <div class="psub">Genera claves para que tu bot se conecte a NOVA API</div>
      <div class="g2" style="margin-bottom:18px">
        <div class="card">
          <div class="ct" style="margin-bottom:14px">Generar nueva key</div>
          <div class="fr"><label class="label">Nombre del bot (etiqueta)</label><input class="inp" id="klabel" placeholder="Mi Bot Principal"></div>
          <button class="btn btn-p" onclick="genKey()">✨ Generar Key</button>
          <div id="new-key" style="margin-top:14px;display:none">
            <p style="font-size:.78rem;color:var(--warn);margin-bottom:7px">⚠️ Copia esta key ahora — no se mostrará después</p>
            <div class="kbox"><span id="new-key-val" style="flex:1"></span><button onclick="cpKey()" title="Copiar">📋</button></div>
          </div>
        </div>
        <div class="card">
          <div class="ct" style="margin-bottom:12px">Cómo usar en tu bot</div>
          <div class="sr"><span class="sl2">URL de la API</span><span class="sv" id="api-url" style="font-size:.78rem;word-break:break-all"></span></div>
          <div class="sr"><span class="sl2">Header requerido</span><span class="sv" style="font-size:.78rem">x-api-key: TU_API_KEY</span></div>
          <div class="sr"><span class="sl2">Endpoint registro</span><span class="sv" style="font-size:.78rem">POST /api/register-bot</span></div>
          <div style="margin-top:12px;color:var(--muted);font-size:.8rem">La key generada va en el <strong>body</strong> de /api/register-bot, NO en el header. El header siempre usa tu <code style="color:#a78bfa">API_KEY</code> del .env</div>
        </div>
      </div>
      <div class="card" style="padding:0;overflow:hidden">
        <table><thead><tr><th>Etiqueta</th><th>Key (primeros 20 chars)</th><th>Bot conectado</th><th>Creada</th><th>Estado</th><th style="text-align:right">Acción</th></tr></thead>
        <tbody id="keys-tb"></tbody></table>
      </div>
    </section>

  </main>
</div>
<div id="toast"></div>

<script>
let AK = '';
let allCmds = [];
let acts = [];

/* ── AUTH ── */
function doLogin() {
  const pw = document.getElementById('pw').value.trim();
  if (!pw) return;
  fetch('/api/status', { headers: { 'x-api-key': pw } })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(d => {
      if (!d.success) throw new Error();
      AK = pw;
      document.getElementById('login').style.display = 'none';
      document.getElementById('app').style.display = 'block';
      boot(d);
    })
    .catch(() => { document.getElementById('lerr').style.display = 'block'; });
}

/* ── API ── */
function api(path, opts = {}) {
  return fetch('/api' + path, {
    ...opts,
    headers: { 'x-api-key': AK, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  }).then(r => r.json()).catch(e => ({ success: false, error: e.message }));
}

/* ── NAVIGATION ── */
function go(id, el) {
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
  document.querySelectorAll('section').forEach(s => s.classList.remove('on2'));
  if (el) el.classList.add('on');
  else {
    // find nav item by id
    document.querySelectorAll('.ni').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'"+id+"'")) n.classList.add('on');
    });
  }
  document.getElementById('tab-' + id).classList.add('on2');
  if (id === 'wa') loadQR();
  if (id === 'cmds') loadCmds();
  if (id === 'keys') loadKeys();
  if (id === 'bot') { loadKeys(); loadBotStatus(); }
}

/* ── TOAST ── */
function toast(msg, bad = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderColor = bad ? 'var(--danger)' : 'var(--green)';
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ── BOOT ── */
function boot(status) {
  applyStatus(status);
  loadQR();
  loadCmds();
  loadKeys();
  loadBotStatus();
  connectWS();
  document.getElementById('ws-url-box').textContent = wsUrl();
  document.getElementById('api-url').textContent = location.origin;
  setInterval(() => api('/status').then(d => { if (d.success) applyStatus(d); }), 8000);
  setInterval(loadQR, 20000);
  setInterval(loadBotStatus, 15000);
}

/* ── STATUS ── */
function applyStatus(d) {
  document.getElementById('d-up').textContent = d.uptime + 's';
  document.getElementById('d-wsc').textContent = d.wsClients ?? 0;
  document.getElementById('d-own').textContent = d.owner || '—';
  document.getElementById('d-env').textContent = d.nodeEnv || '—';
  const wa = d.whatsapp;
  if (wa) {
    const cls = wa.status === 'connected' ? 'bg' : wa.status === 'connecting' ? 'by' : 'br';
    const dot = wa.status === 'connected' ? 'dg' : wa.status === 'connecting' ? 'dy' : 'dr';
    const lbl = wa.status === 'connected' ? 'Conectado' : wa.status === 'connecting' ? 'Conectando...' : 'Desconectado';
    document.getElementById('d-wa').innerHTML = \`<span class="badge \${cls}"><span class="dot \${dot}"></span> \${lbl}</span>\`;
    document.getElementById('d-ph').textContent = wa.phone ? '📱 ' + wa.phone : '';
    const wab = document.getElementById('wa-badge');
    if (wab) { wab.className = 'badge ' + cls; wab.innerHTML = \`<span class="dot \${dot}"></span> \${lbl}\`; }
  }
}

/* ── QR ── */
function loadQR() {
  api('/qr').then(d => {
    const img = document.getElementById('qr-img');
    const ph = document.getElementById('qr-ph');
    if (d.qrImage) {
      img.src = d.qrImage; img.style.display = 'block'; ph.style.display = 'none';
    } else if (d.status === 'connected') {
      img.style.display = 'none'; ph.style.display = 'flex'; ph.innerHTML = '✅<br>WhatsApp conectado';
    } else {
      img.style.display = 'none'; ph.style.display = 'flex';
      ph.innerHTML = '⏳<br>Esperando QR...<br><small>El servidor de WhatsApp está iniciando</small>';
    }
  });
}

function restartWA() {
  if (!confirm('¿Reiniciar WhatsApp? Tendrás que escanear el QR de nuevo.')) return;
  api('/restart', { method: 'POST', body: {} }).then(() => { toast('Reiniciando...'); setTimeout(loadQR, 3000); });
}

function doPair() {
  const ph = document.getElementById('pp').value.trim();
  if (!ph) { toast('Ingresa tu número', true); return; }
  api('/pair', { method: 'POST', body: { phone: ph } }).then(d => {
    if (d.success) { document.getElementById('pair-code').textContent = d.code; document.getElementById('pair-ok').style.display = 'block'; }
    else toast(d.error || 'Error al solicitar código', true);
  });
}

/* ── BOT CONNECTION ── */
function loadBotStatus() {
  api('/bot-status').then(d => {
    if (d.registered) {
      document.getElementById('bot-connected').style.display = 'block';
      document.getElementById('bot-form').style.display = 'none';
      document.getElementById('bc-name').textContent = d.name || 'Bot';
      document.getElementById('bc-ver').textContent = d.version || '?';
      document.getElementById('bc-pfx').textContent = d.prefix || '.';
      document.getElementById('bc-cmds').textContent = d.commandCount || 0;
      document.getElementById('bc-url').textContent = d.url || '';
      const st = document.getElementById('bc-status');
      st.className = 'badge ' + (d.online ? 'bg' : 'br');
      st.innerHTML = d.online ? '<span class="dot dg"></span> Online' : '<span class="dot dr"></span> Offline';
      // update dashboard
      document.getElementById('d-bot-badge').innerHTML = \`<span class="badge bg"><span class="dot dg"></span> \${d.name}</span>\`;
      document.getElementById('d-bot-n').textContent = d.commandCount + ' comandos';
      document.getElementById('d-pfx').textContent = d.prefix || '—';
      document.getElementById('d-cen').textContent = allCmds.filter(c => c.enabled).length;
      document.getElementById('d-ctot').textContent = 'de ' + (d.commandCount || 0) + ' totales';
    } else {
      document.getElementById('bot-connected').style.display = 'none';
      document.getElementById('bot-form').style.display = 'grid';
      document.getElementById('d-bot-badge').innerHTML = '<span class="badge br"><span class="dot dr"></span> Sin bot</span>';
      document.getElementById('d-bot-n').textContent = '';
    }
  });
}

function connectBot() {
  const url = document.getElementById('bot-url').value.trim();
  const key = document.getElementById('bot-key-sel').value;
  const errEl = document.getElementById('bot-err');
  errEl.style.display = 'none';
  if (!url) { errEl.textContent = '❌ Debes ingresar la URL del bot'; errEl.style.display = 'block'; return; }
  if (!key) { errEl.textContent = '❌ Selecciona una key de la lista (o genera una en API Keys)'; errEl.style.display = 'block'; return; }
  if (!url.startsWith('http')) { errEl.textContent = '❌ La URL debe empezar con http:// o https://'; errEl.style.display = 'block'; return; }

  const btn = event.currentTarget;
  btn.textContent = '⏳ Conectando...';
  btn.disabled = true;

  api('/register-bot', { method: 'POST', body: { url, key } })
    .then(d => {
      btn.textContent = '🔌 Conectar bot';
      btn.disabled = false;
      if (d.success) {
        toast('✅ Bot conectado: ' + d.bot.name);
        loadBotStatus();
        loadCmds();
      } else {
        errEl.textContent = '❌ ' + (d.error || 'Error al conectar');
        errEl.style.display = 'block';
      }
    })
    .catch(() => {
      btn.textContent = '🔌 Conectar bot';
      btn.disabled = false;
      errEl.textContent = '❌ Error de red';
      errEl.style.display = 'block';
    });
}

function disconnectBot() {
  if (!confirm('¿Desconectar el bot?')) return;
  api('/register-bot', { method: 'DELETE' }).then(d => {
    if (d.success) { toast('Bot desconectado'); loadBotStatus(); loadCmds(); }
    else toast(d.error || 'Error', true);
  });
}

/* ── COMMANDS ── */
function loadCmds() {
  api('/commands').then(d => {
    allCmds = d.commands || [];
    if (!allCmds.length) {
      document.getElementById('no-bot').style.display = 'block';
      document.getElementById('cmds-area').style.display = 'none';
    } else {
      document.getElementById('no-bot').style.display = 'none';
      document.getElementById('cmds-area').style.display = 'block';
      renderCmds(allCmds);
      document.getElementById('d-cen').textContent = allCmds.filter(c => c.enabled).length;
    }
  });
}

function renderCmds(cmds) {
  document.getElementById('cmd-tb').innerHTML = cmds.map(c => \`<tr>
    <td><strong>\${c.name}</strong>\${c.aliases?.length ? '<br><span style="color:var(--muted);font-size:.72rem">'+c.aliases.join(', ')+'</span>' : ''}</td>
    <td style="color:var(--muted)">\${c.description || '—'}</td>
    <td style="font-family:monospace;font-size:.78rem;color:#a78bfa">\${c.usage || ''}</td>
    <td style="text-align:center"><label class="tgl"><input type="checkbox" \${c.enabled ? 'checked' : ''} onchange="toggleCmd('\${c.name}',this.checked)"><span class="sl"></span></label></td>
  </tr>\`).join('');
}

function filterCmds() {
  const q = document.getElementById('csearch').value.toLowerCase();
  renderCmds(allCmds.filter(c => c.name.includes(q) || (c.description || '').toLowerCase().includes(q)));
}

function toggleCmd(name, en) {
  api('/commands/' + name, { method: 'PATCH', body: { enabled: en } }).then(d => {
    if (d.success) {
      const c = allCmds.find(x => x.name === name);
      if (c) c.enabled = en;
      toast(en ? '✅ ' + name + ' activado' : '🚫 ' + name + ' desactivado');
      document.getElementById('d-cen').textContent = allCmds.filter(x => x.enabled).length;
    }
  });
}

function setAll(en) {
  Promise.all(allCmds.map(c => api('/commands/' + c.name, { method: 'PATCH', body: { enabled: en } }))).then(() => {
    allCmds.forEach(c => c.enabled = en);
    renderCmds(allCmds);
    document.getElementById('d-cen').textContent = en ? allCmds.length : 0;
    toast(en ? '✅ Todos activados' : '🚫 Todos desactivados');
  });
}

/* ── MUSIC ── */
function doMusicSearch() {
  const q = document.getElementById('mq').value.trim();
  if (!q) return;
  const el = document.getElementById('mres');
  el.innerHTML = '<div style="color:var(--muted);font-size:.84rem;padding:8px 0">🔍 Buscando en YouTube...</div>';
  api('/music/search', { method: 'POST', body: { query: q, limit: 5 } }).then(d => {
    if (!d.success) { el.innerHTML = '<div style="color:var(--danger)">' + (d.error || 'Error') + '</div>'; return; }
    el.innerHTML = d.results.map(r => \`<div class="mres">
      <img src="\${r.thumbnail}" onerror="this.style.display='none'">
      <div class="mi"><div class="mt">\${r.title}</div><div class="mm">⏱ \${r.duration} · \${r.author}</div></div>
      <a href="\${r.url}" target="_blank">▶ Ver</a>
    </div>\`).join('') || '<div style="color:var(--muted)">Sin resultados</div>';
  }).catch(() => { el.innerHTML = '<div style="color:var(--danger)">Error de red</div>'; });
}

/* ── API KEYS ── */
function loadKeys() {
  api('/keys').then(d => {
    const keys = d.keys || [];
    // Populate bot key selector
    const sel = document.getElementById('bot-key-sel');
    const prev = sel.value;
    sel.innerHTML = '<option value="">— Selecciona una key —</option>' +
      keys.filter(k => k.active).map(k => \`<option value="\${k.key}">\${k.label} — \${k.key.substring(0, 20)}...</option>\`).join('');
    if (prev) sel.value = prev;

    // Keys table
    const tb = document.getElementById('keys-tb');
    if (!keys.length) { tb.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:20px">No hay keys generadas. Crea una arriba.</td></tr>'; return; }
    tb.innerHTML = keys.map(k => \`<tr>
      <td><strong>\${k.label}</strong></td>
      <td style="font-family:monospace;font-size:.78rem;color:var(--green)">\${k.key.substring(0, 24)}...</td>
      <td style="color:var(--muted);font-size:.82rem">\${k.botName ? '🤖 '+k.botName : '—'}</td>
      <td style="color:var(--muted);font-size:.8rem">\${new Date(k.createdAt).toLocaleDateString()}</td>
      <td><span class="badge \${k.active ? 'bg' : 'br'}">\${k.active ? 'Activa' : 'Revocada'}</span></td>
      <td style="text-align:right">\${k.active ? '<button class="btn btn-d" style="padding:5px 10px;font-size:.78rem" onclick="revokeKey(\''+k.id+'\')">Revocar</button>' : ''}</td>
    </tr>\`).join('');
    document.getElementById('api-url').textContent = location.origin;
  });
}

function genKey() {
  const label = document.getElementById('klabel').value.trim() || 'Mi Bot';
  api('/keys/generate', { method: 'POST', body: { label } }).then(d => {
    if (d.success) {
      document.getElementById('new-key-val').textContent = d.key.key;
      document.getElementById('new-key').style.display = 'block';
      loadKeys();
      toast('✨ Key generada — cópiala ahora');
    } else toast(d.error || 'Error', true);
  });
}

function cpKey() {
  navigator.clipboard.writeText(document.getElementById('new-key-val').textContent).then(() => toast('📋 Copiado'));
}

function revokeKey(id) {
  if (!confirm('¿Revocar esta key? El bot perderá acceso.')) return;
  api('/keys/' + id, { method: 'DELETE' }).then(d => {
    if (d.success) { toast('Key revocada'); loadKeys(); }
    else toast(d.error || 'Error', true);
  });
}

/* ── WEBSOCKET ── */
function wsUrl() {
  return (location.protocol === 'https:' ? 'wss' : 'ws') + '://' + location.host + '/ws';
}

function connectWS() {
  const ws = new WebSocket(wsUrl());
  ws.onopen = () => { document.getElementById('wsdot').textContent = '🟢 WebSocket activo'; };
  ws.onclose = () => { document.getElementById('wsdot').textContent = '🔴 WS desconectado'; setTimeout(connectWS, 5000); };
  ws.onmessage = e => {
    try {
      const d = JSON.parse(e.data);
      pushAct(d);
      if (d.type === 'qr') loadQR();
      if (d.type === 'connection') api('/status').then(s => { if (s.success) applyStatus(s); });
      if (d.type === 'bot_registered') { loadBotStatus(); loadCmds(); loadKeys(); toast('🤖 Bot conectado: ' + (d.bot?.name || '')); }
      if (d.type === 'bot_unregistered') { loadBotStatus(); loadCmds(); }
      if (d.type === 'bot_offline') toast('⚠️ Bot desconectado', true);
      if (d.type === 'bot_online') toast('🤖 Bot volvió online');
    } catch {}
  };
}

function pushAct(d) {
  const icons = { qr: '📱', connection: '🔗', message: '💬', bot_registered: '🤖', bot_unregistered: '⚠️', bot_offline: '❌', bot_online: '✅', error: '🔥' };
  acts.unshift({ icon: icons[d.type] || '•', type: d.type, extra: d.phone || d.status || d.name || '', time: new Date().toLocaleTimeString() });
  if (acts.length > 10) acts.pop();
  const el = document.getElementById('d-act');
  el.innerHTML = acts.map(a => \`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(28,28,68,.4);font-size:.81rem">
    <span>\${a.icon}</span><span>\${a.type}</span><span style="color:var(--muted)">\${a.extra}</span><span style="color:var(--muted);margin-left:auto;font-size:.75rem">\${a.time}</span>
  </div>\`).join('') || 'Sin actividad';
}

document.getElementById('pw').focus();
</script>
</body></html>`;

app.get("/", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(HTML);
});

export default app;
