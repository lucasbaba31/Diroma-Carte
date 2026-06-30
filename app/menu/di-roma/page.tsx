import { prisma } from "@/lib/prisma";
import { ALLERGEN_LABELS } from "@/lib/utils";
import { PrintButton } from "./print-button";
import { QRCodeBlock } from "./qr-code";

const GALERIE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001") + "/menu/di-roma/galerie";

// ─── Types ───────────────────────────────────────────────────────────────────
type Dish = {
  id: string; name: string; description: string | null;
  price: number | { toString(): string }; badge: string | null;
  allergens: string; available: boolean; order: number;
};
type Cat = { id: string; name: string; order: number; dishes: Dish[] };

// ─── Helpers ─────────────────────────────────────────────────────────────────
const EUR   = (p: Dish["price"]) => new Intl.NumberFormat("fr-FR", { style:"currency", currency:"EUR" }).format(Number(p));
const tags  = (raw: string) => { try { return JSON.parse(raw) as string[]; } catch { return []; } };
const avail = (d: Dish[]) => d.filter(x => x.available).sort((a,b) => a.order - b.order);

// ─── Palette ─────────────────────────────────────────────────────────────────
const Sc = "#b83218";   // terracotta script headings
const Dk = "#1e1e1e";   // dark text
const Gr = "#7a6f68";   // gray descriptions
const Bg = "#faf5ee";   // warm cream
const Rd = "#c8442a";   // red accent

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  .pw  { background:#2a2420; padding:40px 0; display:flex; flex-direction:column; align-items:center; gap:28px; }
  .a4  { width:794px; min-height:1123px; background:${Bg}; position:relative; box-sizing:border-box; font-family:var(--font-cormorant); box-shadow:0 6px 32px rgba(0,0,0,.4); }
  @media print {
    .pw { background:transparent !important; padding:0 !important; gap:0 !important; }
    .a4 { box-shadow:none !important; page-break-after:always; break-after:page; width:210mm; min-height:297mm; }
    .no-print { display:none !important; }
  }
`;

// ─── Thin rule ────────────────────────────────────────────────────────────────
const Rule = ({ mt=10, mb=10, op=0.2 }: {mt?:number;mb?:number;op?:number}) => (
  <div style={{height:1,background:Rd,marginTop:mt,marginBottom:mb,opacity:op}}/>
);

// ─── Fait Maison badge ────────────────────────────────────────────────────────
const FaitMaison = () => (
  <div style={{position:"absolute",top:26,right:30,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
    <div style={{position:"relative",width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {/* Cercle décoratif */}
      <svg width="48" height="48" viewBox="0 0 48 48" style={{position:"absolute",inset:0}}>
        <circle cx="24" cy="24" r="22" fill="none" stroke={Rd} strokeWidth="0.7" opacity=".35"/>
        <circle cx="24" cy="24" r="18" fill="none" stroke={Rd} strokeWidth="0.4" opacity=".2"/>
      </svg>
      {/* Toque de chef */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke={Rd} strokeWidth="1.1">
        <path d="M9 18 L9 22 Q9 23 10 23 L18 23 Q19 23 19 22 L19 18"/>
        <path d="M9 19 L19 19"/>
        <path d="M9 21 L19 21"/>
        <path d="M11 18 C11 14 7 14 7 11 C7 8 9.5 6.5 12 7 C12.5 5.5 13.2 5 14 5 C14.8 5 15.5 5.5 16 7 C18.5 6.5 21 8 21 11 C21 14 17 14 17 18"/>
      </svg>
    </div>
    <p style={{fontFamily:"var(--font-cormorant)",fontSize:7.5,letterSpacing:"0.18em",textTransform:"uppercase",color:Rd,margin:0,lineHeight:1,opacity:.75}}>
      Fait Maison
    </p>
  </div>
);

// ─── Titre de section script ──────────────────────────────────────────────────
const ScriptTitle = ({ text, sub, mb=20, mt=0 }: {text:string;sub?:string;mb?:number;mt?:number}) => (
  <div style={{marginTop:mt,marginBottom:mb}}>
    <h2 style={{fontFamily:"var(--font-dancing)",fontSize:54,fontWeight:600,color:Sc,margin:0,lineHeight:1.05,letterSpacing:"-0.01em"}}>
      {text}
    </h2>
    {sub && (
      <p style={{fontFamily:"var(--font-cormorant)",fontSize:12.5,fontStyle:"italic",color:Gr,margin:"3px 0 0",letterSpacing:"0.02em"}}>{sub}</p>
    )}
    <Rule mt={8} mb={0} op={0.15}/>
  </div>
);

// ─── Sous-titre de colonne ────────────────────────────────────────────────────
const ColTitle = ({ text, sub }: {text:string;sub?:string}) => (
  <div style={{marginBottom:14}}>
    <h3 style={{fontFamily:"var(--font-dancing)",fontSize:36,fontWeight:600,color:Sc,margin:0,lineHeight:1.1}}>
      {text}
    </h3>
    {sub && <p style={{fontFamily:"var(--font-cormorant)",fontSize:11.5,fontStyle:"italic",color:Gr,margin:"2px 0 0"}}>{sub}</p>}
    <Rule mt={6} mb={0} op={0.15}/>
  </div>
);

// ─── Sous-section label ───────────────────────────────────────────────────────
const SubLabel = ({ text }: {text:string}) => (
  <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:Rd,margin:"16px 0 8px",opacity:.8}}>{text}</p>
);

// ─── Ligne de plat ────────────────────────────────────────────────────────────
const DR = ({ dish, compact=false }: {dish:Dish;compact?:boolean}) => {
  const al = tags(dish.allergens);
  const nf = compact ? 15.5 : 17;
  const df = compact ? 12 : 13;
  return (
    <div style={{marginBottom: compact ? 10 : 14}}>
      <div style={{display:"flex",alignItems:"baseline",gap:4}}>
        <span style={{fontFamily:"var(--font-playfair)",fontSize:nf,fontWeight:400,color:Dk,flexShrink:0,maxWidth:"65%",letterSpacing:"-0.01em"}}>{dish.name}</span>
        {dish.badge && (
          <span style={{fontSize:8,fontFamily:"var(--font-cormorant)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:Rd,border:`0.8px solid ${Rd}`,borderRadius:2,padding:"1px 5px",flexShrink:0,alignSelf:"center",opacity:.85}}>{dish.badge}</span>
        )}
        <span style={{flex:1,borderBottom:`1px dotted ${Rd}`,marginBottom:2,opacity:.2,minWidth:8}}/>
        <span style={{fontFamily:"var(--font-playfair)",fontSize:nf,fontWeight:400,color:Dk,flexShrink:0,whiteSpace:"nowrap"}}>{EUR(dish.price)}</span>
      </div>
      {dish.description && (
        <p style={{fontFamily:"var(--font-cormorant)",fontSize:df,fontStyle:"italic",color:Gr,margin:"2px 0 0",lineHeight:1.35}}>{dish.description}</p>
      )}
      {al.length > 0 && (
        <p style={{fontFamily:"var(--font-cormorant)",fontSize:10,color:"#b0a8a4",margin:"1px 0 0"}}>ⓘ {al.map(t => ALLERGEN_LABELS[t]??t).join(", ")}</p>
      )}
    </div>
  );
};

// ─── Ligne pizza (sans prix) ──────────────────────────────────────────────────
const PR = ({ dish }: {dish:Dish}) => (
  <div style={{marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:5}}>
      <span style={{fontFamily:"var(--font-playfair)",fontSize:15,fontWeight:400,color:Dk}}>{dish.name}</span>
      {dish.badge && (
        <span style={{fontSize:8,fontFamily:"var(--font-cormorant)",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:Rd,border:`0.8px solid ${Rd}`,borderRadius:2,padding:"1px 5px",opacity:.85}}>{dish.badge}</span>
      )}
    </div>
    {dish.description && (
      <p style={{fontFamily:"var(--font-cormorant)",fontSize:12,fontStyle:"italic",color:Gr,margin:"1px 0 0",lineHeight:1.3}}>{dish.description}</p>
    )}
  </div>
);

// ─── Note bas de page ─────────────────────────────────────────────────────────
const Note = ({ text }: {text:string}) => (
  <p style={{fontFamily:"var(--font-cormorant)",fontSize:12.5,fontStyle:"italic",color:Gr,textAlign:"center",marginTop:18,letterSpacing:"0.02em"}}>— {text} —</p>
);

// ─── Séparateur colonne vertical ─────────────────────────────────────────────
const VCol = () => (
  <div style={{background:Rd,width:1,opacity:.15,margin:"0 4px"}}/>
);

// ─── Footer page (async pour le QR) ──────────────────────────────────────────
async function Footer({ section }: {section:string}) {
  return (
    <div style={{position:"absolute",bottom:18,left:40,right:40,borderTop:`0.5px solid ${Rd}`,paddingTop:8,display:"flex",justifyContent:"space-between",alignItems:"flex-end",opacity:.7}}>
      <div>
        <span style={{fontFamily:"var(--font-cormorant)",fontSize:10,color:Gr,fontStyle:"italic",display:"block"}}>Di Roma à Aucamville</span>
        <span style={{fontFamily:"var(--font-cormorant)",fontSize:10,color:Gr,letterSpacing:"0.1em",textTransform:"uppercase"}}>{section}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <p style={{fontFamily:"var(--font-cormorant)",fontSize:8,color:Gr,margin:0,textAlign:"right",lineHeight:1.3,letterSpacing:"0.05em"}}>
          Voir les<br/>photos
        </p>
        <QRCodeBlock url={GALERIE_URL} size={44}/>
      </div>
    </div>
  );
}

// ─── Page A4 wrapper ──────────────────────────────────────────────────────────
const A4 = ({ children, pad=44 }: {children:React.ReactNode;pad?:number}) => (
  <div className="a4" style={{padding:pad}}>
    {children}
  </div>
);

// ════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════
export default async function DiRomaPage() {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: "di-roma" },
    include: { categories: { orderBy:{order:"asc"}, include:{ dishes:{ orderBy:{order:"asc"} } } } },
  });
  if (!restaurant) return <div style={{padding:40,fontFamily:"sans-serif"}}>Restaurant introuvable — lancez npm run db:seed-di-roma</div>;

  const cats = restaurant.categories as Cat[];
  const get  = (id: string) => cats.find(c => c.id === id);

  const aperoL = cats.filter(c => ["dr-cat-1","dr-cat-2","dr-cat-3","dr-cat-4","dr-cat-5"].includes(c.id));
  const aperoR = cats.filter(c => ["dr-cat-6","dr-cat-7","dr-cat-8","dr-cat-9","dr-cat-10"].includes(c.id));

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}}/>
      <div className="pw">

        {/* ══════════════════════════════════════════
            PAGE 1 — COUVERTURE
        ══════════════════════════════════════════ */}
        <A4 pad={0}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",minHeight:1123,padding:"52px 80px 40px",textAlign:"center",position:"relative"}}>

            {/* En-tête restaurant */}
            <div style={{marginBottom:36}}>
              <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,letterSpacing:"0.45em",textTransform:"uppercase",color:Gr,margin:"0 0 6px",opacity:.7}}>Restaurant</p>
              <h1 style={{fontFamily:"var(--font-dancing)",fontSize:82,fontWeight:700,color:Sc,margin:0,lineHeight:1,letterSpacing:"-0.01em"}}>
                Di Roma
              </h1>
              <p style={{fontFamily:"var(--font-cormorant)",fontSize:16,fontStyle:"italic",color:Gr,margin:"4px 0 0",letterSpacing:"0.08em"}}>
                à Aucamville
              </p>
              <div style={{width:48,height:1,background:Rd,opacity:.25,margin:"16px auto 0"}}/>
              <p style={{fontFamily:"var(--font-cormorant)",fontSize:13,fontStyle:"italic",color:Gr,margin:"10px 0 0",opacity:.75}}>
                Cuisine italienne &amp; spécialités au feu de bois
              </p>
            </div>

            {/* Séparateur flamme */}
            <svg width="22" height="28" viewBox="0 0 40 52" fill="none" style={{marginBottom:32,opacity:.6}}>
              <path d="M20 4 C12 12 6 20 8 30 C10 38 16 44 20 48 C24 44 30 38 32 30 C34 20 28 12 20 4Z" fill={Rd} opacity=".15" stroke={Rd} strokeWidth="1"/>
              <path d="M20 18 C16 24 15 30 17 35 C18.5 39 20 42 20 42 C20 42 21.5 39 23 35 C25 30 24 24 20 18Z" fill={Rd} opacity=".5"/>
              <path d="M20 28 C18.5 32 18.5 36 20 39 C21.5 36 21.5 32 20 28Z" fill={Rd}/>
            </svg>

            {/* Sections en grand */}
            {[
              ["Apéritifs", "& Antipasti"],
              ["Salades", "& Carpaccios"],
              ["Viandes", ""],
              ["Poissons, Pâtes", "& Risottos"],
              ["Pizzas", "au feu de bois"],
              ["Desserts", "& Cafés"],
            ].map(([main, sub], i) => (
              <div key={i} style={{width:"100%"}}>
                <div style={{padding:"10px 0"}}>
                  <p style={{fontFamily:"var(--font-dancing)",fontSize:44,fontWeight:600,color:Sc,margin:0,lineHeight:1.05}}>{main}</p>
                  {sub && <p style={{fontFamily:"var(--font-cormorant)",fontSize:13,fontStyle:"italic",color:Gr,margin:"1px 0 0",opacity:.8}}>{sub}</p>}
                </div>
                {i < 5 && (
                  /* Séparateur stylisé */
                  <div style={{display:"flex",alignItems:"center",gap:0,padding:"0 60px",margin:"2px 0"}}>
                    <div style={{flex:1,height:1,background:`linear-gradient(to right, transparent, ${Rd})`,opacity:.2}}/>
                    <svg width="32" height="14" viewBox="0 0 40 14" fill="none" style={{flexShrink:0}}>
                      <line x1="0" y1="7" x2="14" y2="7" stroke={Rd} strokeWidth="0.8" opacity=".3"/>
                      <path d="M20 2 L24 7 L20 12 L16 7 Z" fill={Rd} opacity=".45"/>
                      <line x1="26" y1="7" x2="40" y2="7" stroke={Rd} strokeWidth="0.8" opacity=".3"/>
                    </svg>
                    <div style={{flex:1,height:1,background:`linear-gradient(to left, transparent, ${Rd})`,opacity:.2}}/>
                  </div>
                )}
              </div>
            ))}

            {/* QR + Pied de couverture */}
            <div style={{marginTop:"auto",paddingTop:24,width:"100%",borderTop:`0.5px solid ${Rd}`,opacity:.55,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,color:Gr,margin:0,fontStyle:"italic"}}>
                Di Roma à Aucamville &nbsp;·&nbsp; Cuisine italienne au feu de bois
              </p>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                <div style={{textAlign:"right"}}>
                  <p style={{fontFamily:"var(--font-cormorant)",fontSize:9,color:Gr,margin:0,letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1.4}}>Photos</p>
                  <p style={{fontFamily:"var(--font-cormorant)",fontSize:9,color:Gr,margin:0,letterSpacing:"0.08em",textTransform:"uppercase",lineHeight:1.4}}>des plats</p>
                </div>
                <QRCodeBlock url={GALERIE_URL} size={56}/>
              </div>
            </div>
          </div>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 2 — APÉRITIFS & ANTIPASTI
        ══════════════════════════════════════════ */}
        <A4>
          <FaitMaison/>
          <ScriptTitle text="Apéritifs &amp; Antipasti" mt={4}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 24px"}}>
            <div>
              {aperoL.map(c => {
                const d = avail(c.dishes); if (!d.length) return null;
                return (
                  <div key={c.id} style={{marginBottom:16}}>
                    <ColTitle text={c.name}/>
                    {d.map(dish => <DR key={dish.id} dish={dish} compact/>)}
                  </div>
                );
              })}
            </div>
            <VCol/>
            <div>
              {aperoR.map(c => {
                const d = avail(c.dishes); if (!d.length) return null;
                return (
                  <div key={c.id} style={{marginBottom:16}}>
                    <ColTitle text={c.name}/>
                    {d.map(dish => <DR key={dish.id} dish={dish} compact/>)}
                  </div>
                );
              })}
            </div>
          </div>
          <Footer section="I — Apéritifs & Antipasti"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 3 — FRAÎCHEUR ET LÉGÈRETÉ
        ══════════════════════════════════════════ */}
        <A4>
          <FaitMaison/>
          <ScriptTitle text="Fraîcheur &amp; légèreté" mt={4}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px"}}>
            <div>
              {get("dr-cat-11") && (
                <>
                  <ColTitle text="Salades"/>
                  {avail(get("dr-cat-11")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
            <VCol/>
            <div>
              {get("dr-cat-16") && (
                <>
                  <ColTitle text="Carpaccio" sub="Garniture au choix : salade ou frites"/>
                  {avail(get("dr-cat-16")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
          </div>
          <Footer section="II — Salades & Carpaccios"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 4 — LES VIANDES
        ══════════════════════════════════════════ */}
        <A4>
          <FaitMaison/>
          <ScriptTitle text="Les viandes" sub="Nos pièces de caractère" mt={4}/>
          <div style={{maxWidth:640,margin:"0 auto"}}>
            {get("dr-cat-17") && avail(get("dr-cat-17")!.dishes).length > 0 && (
              <>
                <SubLabel text="Bœuf"/>
                {avail(get("dr-cat-17")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
            {get("dr-cat-18") && avail(get("dr-cat-18")!.dishes).length > 0 && (
              <>
                <Rule mt={20} mb={4} op={0.15}/>
                {avail(get("dr-cat-18")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
            {get("dr-cat-19") && avail(get("dr-cat-19")!.dishes).length > 0 && (
              <>
                <SubLabel text="Burgers de collection"/>
                {avail(get("dr-cat-19")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
            {get("dr-cat-20") && avail(get("dr-cat-20")!.dishes).length > 0 && (
              <>
                <SubLabel text="Veau et canard"/>
                {avail(get("dr-cat-20")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
          </div>
          <Footer section="III — Viandes"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 5 — L'ÂME DE L'ITALIE
        ══════════════════════════════════════════ */}
        <A4>
          <FaitMaison/>
          <ScriptTitle text="L'âme de l'Italie" mt={4}/>

          {get("dr-cat-13") && avail(get("dr-cat-13")!.dishes).length > 0 && (
            <div style={{maxWidth:640,margin:"0 auto 20px"}}>
              <SubLabel text="La mer"/>
              {avail(get("dr-cat-13")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
            </div>
          )}

          <Rule mt={4} mb={16} op={0.15}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px"}}>
            <div>
              {get("dr-cat-25") && (
                <>
                  <ColTitle text="Les pâtes" sub="Choisissez pâtes et sauce, on s'occupe du reste."/>
                  <div style={{marginBottom:12}}>
                    <p style={{fontFamily:"var(--font-cormorant)",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:Rd,margin:"0 0 4px",opacity:.75}}>Pâtes disponibles</p>
                    {["Tagliatelles","Spaghettis","Decatoni"].map(p => (
                      <p key={p} style={{fontFamily:"var(--font-cormorant)",fontSize:12.5,fontStyle:"italic",color:Gr,margin:"2px 0",lineHeight:1.3}}>· {p}</p>
                    ))}
                  </div>
                  {avail(get("dr-cat-25")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
            <VCol/>
            <div>
              {get("dr-cat-26") && (
                <>
                  <ColTitle text="Les risottos"/>
                  {avail(get("dr-cat-26")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
          </div>
          <Note text="Demandez la suggestion du moment"/>
          <Footer section="IV — Poissons, Pâtes & Risottos"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 6 — LES PIZZAS
        ══════════════════════════════════════════ */}
        <A4>
          <FaitMaison/>
          <ScriptTitle text="Les pizzas" sub="32 cm · Au four à bois" mt={4}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px"}}>
            <div>
              {get("dr-cat-14") && (
                <>
                  <ColTitle text="Base tomate"/>
                  {avail(get("dr-cat-14")!.dishes).map(d => <PR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
            <VCol/>
            <div>
              {get("dr-cat-27") && (
                <>
                  <ColTitle text="Base crème fraîche"/>
                  {avail(get("dr-cat-27")!.dishes).map(d => <PR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
          </div>
          <Note text="Pizza en suggestion sur ardoise, pensez à demander"/>
          <Footer section="V — Pizzas"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 7 — DESSERTS & CAFÉTÉRIA
        ══════════════════════════════════════════ */}
        {get("dr-cat-15") && avail(get("dr-cat-15")!.dishes).length > 0 && (
          <A4>
            <FaitMaison/>
            <ScriptTitle text="Desserts &amp; Cafés" mt={4}/>
            <div style={{maxWidth:620,margin:"0 auto"}}>
              {avail(get("dr-cat-15")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
            </div>
            <Footer section="VI — Desserts & Cafés"/>
          </A4>
        )}

        <PrintButton/>

      </div>
    </>
  );
}
