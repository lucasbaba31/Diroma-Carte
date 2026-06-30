import { prisma } from "@/lib/prisma";
import { ALLERGEN_LABELS } from "@/lib/utils";
import { PrintButton } from "../print-button";
import { QRCodeBlock } from "../qr-code";

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
const Bg  = "#6e1414";   // bordeaux profond
const Cr  = "#e8d5a3";   // crème or
const CrL = "rgba(232,213,163,.55)"; // crème pâle
const CrD = "rgba(232,213,163,.25)"; // crème très pâle

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; }
  .pw  { background:#2a1010; padding:40px 0; display:flex; flex-direction:column; align-items:center; gap:24px; }
  .a4  { width:794px; min-height:1123px; background:${Bg}; position:relative; font-family:var(--font-cormorant); }
  @media print {
    .pw { background:transparent !important; padding:0 !important; gap:0 !important; }
    .a4 { page-break-after:always; break-after:page; width:210mm; min-height:297mm; }
    .no-print { display:none !important; }
  }
`;

// ─── Pill section label ───────────────────────────────────────────────────────
const Pill = ({ text }: {text:string}) => (
  <div style={{display:"flex",justifyContent:"center",margin:"0 0 20px"}}>
    <div style={{
      border:`1px solid ${Cr}`,
      borderRadius:999,
      padding:"5px 28px",
      display:"inline-block",
    }}>
      <span style={{
        fontFamily:"var(--font-playfair)",
        fontSize:10,
        letterSpacing:"0.25em",
        textTransform:"uppercase",
        color:Cr,
      }}>
        {text}
      </span>
    </div>
  </div>
);

// ─── Ligne de plat ────────────────────────────────────────────────────────────
const DR = ({ dish, compact=false }: {dish:Dish;compact?:boolean}) => {
  const al = tags(dish.allergens);
  return (
    <div style={{marginBottom: compact ? 10 : 14}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
          <span style={{
            fontFamily:"var(--font-playfair)",
            fontSize: compact ? 11.5 : 13,
            fontWeight:400,
            letterSpacing:"0.12em",
            textTransform:"uppercase",
            color:Cr,
            flexShrink:0,
          }}>
            {dish.name}
          </span>
          {dish.badge && (
            <span style={{
              fontSize:7.5,
              fontFamily:"var(--font-cormorant)",
              fontWeight:700,
              letterSpacing:"0.12em",
              textTransform:"uppercase",
              color:Bg,
              background:Cr,
              borderRadius:3,
              padding:"1px 5px",
              flexShrink:0,
              opacity:.85,
            }}>
              {dish.badge}
            </span>
          )}
        </div>
        <span style={{
          fontFamily:"var(--font-playfair)",
          fontSize: compact ? 11.5 : 13,
          fontWeight:400,
          color:Cr,
          flexShrink:0,
          whiteSpace:"nowrap",
        }}>
          {EUR(dish.price)}
        </span>
      </div>
      {dish.description && (
        <p style={{
          fontFamily:"var(--font-cormorant)",
          fontSize: compact ? 11 : 12,
          fontStyle:"italic",
          color:CrL,
          margin:"2px 0 0",
          lineHeight:1.35,
        }}>
          {dish.description}
        </p>
      )}
      {al.length > 0 && (
        <p style={{fontFamily:"var(--font-cormorant)",fontSize:9.5,color:CrD,margin:"1px 0 0"}}>
          ⓘ {al.map(t => ALLERGEN_LABELS[t]??t).join(", ")}
        </p>
      )}
    </div>
  );
};

// ─── Ligne pizza (sans prix) ──────────────────────────────────────────────────
const PR = ({ dish }: {dish:Dish}) => (
  <div style={{marginBottom:10}}>
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontFamily:"var(--font-playfair)",fontSize:12,fontWeight:400,letterSpacing:"0.12em",textTransform:"uppercase",color:Cr}}>
        {dish.name}
      </span>
      {dish.badge && (
        <span style={{fontSize:7.5,fontFamily:"var(--font-cormorant)",fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:Bg,background:Cr,borderRadius:3,padding:"1px 5px",opacity:.85}}>
          {dish.badge}
        </span>
      )}
    </div>
    {dish.description && (
      <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,fontStyle:"italic",color:CrL,margin:"1px 0 0",lineHeight:1.3}}>
        {dish.description}
      </p>
    )}
  </div>
);

// ─── Thin rule ────────────────────────────────────────────────────────────────
const Rule = ({ op=0.15 }: {op?:number}) => (
  <div style={{height:"0.5px",background:Cr,opacity:op,margin:"14px 0"}}/>
);

// ─── Séparateur colonne ───────────────────────────────────────────────────────
const VCol = () => (
  <div style={{background:Cr,width:"0.5px",opacity:.15,flexShrink:0}}/>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
async function Footer({ section }: {section:string}) {
  return (
    <div style={{
      position:"absolute",bottom:18,left:44,right:44,
      borderTop:`0.5px solid rgba(232,213,163,.2)`,
      paddingTop:8,
      display:"flex",justifyContent:"space-between",alignItems:"flex-end",
    }}>
      <p style={{fontFamily:"var(--font-cormorant)",fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:CrD,margin:0}}>
        Di Roma · Aucamville
      </p>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <p style={{fontFamily:"var(--font-cormorant)",fontSize:8,color:CrD,margin:0,textAlign:"right",lineHeight:1.3,letterSpacing:"0.05em"}}>
          Voir les<br/>photos
        </p>
        <div style={{opacity:.6}}>
          <QRCodeBlock url={GALERIE_URL} size={40}/>
        </div>
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
export default async function DiRomaRougePage() {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: "di-roma" },
    include: { categories: { orderBy:{order:"asc"}, include:{ dishes:{ orderBy:{order:"asc"} } } } },
  });
  if (!restaurant) return <div>Restaurant introuvable</div>;

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
          <div style={{
            display:"flex",flexDirection:"column",
            minHeight:1123,padding:"72px 64px 48px",
            position:"relative",
          }}>

            {/* Nom restaurant */}
            <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"flex-start"}}>
              <h1 style={{
                fontFamily:"var(--font-cormorant)",
                fontSize:100,
                fontWeight:300,
                color:Cr,
                margin:0,
                lineHeight:.9,
                letterSpacing:"-0.02em",
              }}>
                Di Roma
              </h1>
              <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
                <span style={{fontFamily:"var(--font-cormorant)",fontSize:12,letterSpacing:"0.3em",textTransform:"uppercase",color:CrL}}>Estd</span>
                <span style={{fontFamily:"var(--font-dancing)",fontSize:28,color:CrL,lineHeight:1}}>Aucamville</span>
                <span style={{fontFamily:"var(--font-cormorant)",fontSize:12,letterSpacing:"0.3em",textTransform:"uppercase",color:CrL}}>2024</span>
              </div>

              <div style={{width:48,height:"0.5px",background:Cr,opacity:.3,margin:"28px 0"}}/>

              {/* Sections liste */}
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {[
                  "Apéritifs & Antipasti",
                  "Salades & Carpaccios",
                  "Viandes",
                  "Poissons · Pâtes · Risottos",
                  "Pizzas au feu de bois",
                  "Desserts & Cafés",
                ].map((s, i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontFamily:"var(--font-cormorant)",fontSize:10,color:CrD,width:16,textAlign:"right",flexShrink:0}}>
                      {["I","II","III","IV","V","VI"][i]}
                    </span>
                    <span style={{fontFamily:"var(--font-playfair)",fontSize:13,fontWeight:400,letterSpacing:"0.08em",textTransform:"uppercase",color:CrL}}>
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tagline + QR */}
            <div style={{
              borderTop:`0.5px solid rgba(232,213,163,.2)`,
              paddingTop:20,
              display:"flex",
              justifyContent:"space-between",
              alignItems:"flex-end",
            }}>
              <div>
                <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,fontStyle:"italic",letterSpacing:"0.08em",color:CrL,margin:"0 0 4px"}}>
                  Cuisine italienne &amp; spécialités au feu de bois
                </p>
                <p style={{fontFamily:"var(--font-playfair)",fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:CrD,margin:0}}>
                  Earthy · Authentic · Italian
                </p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,opacity:.65}}>
                <p style={{fontFamily:"var(--font-cormorant)",fontSize:8,color:CrD,margin:0,textAlign:"right",letterSpacing:"0.08em",lineHeight:1.4}}>
                  Photos<br/>des plats
                </p>
                <QRCodeBlock url={GALERIE_URL} size={52}/>
              </div>
            </div>
          </div>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 2 — APÉRITIFS & ANTIPASTI
        ══════════════════════════════════════════ */}
        <A4>
          <Pill text="Apéritifs & Antipasti"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px"}}>
            <div>
              {aperoL.map(c => {
                const d = avail(c.dishes); if (!d.length) return null;
                return (
                  <div key={c.id} style={{marginBottom:18}}>
                    <Pill text={c.name}/>
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
                  <div key={c.id} style={{marginBottom:18}}>
                    <Pill text={c.name}/>
                    {d.map(dish => <DR key={dish.id} dish={dish} compact/>)}
                  </div>
                );
              })}
            </div>
          </div>
          <Footer section="I — Apéritifs & Antipasti"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 3 — SALADES & CARPACCIOS
        ══════════════════════════════════════════ */}
        <A4>
          <Pill text="Fraîcheur & Légèreté"/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px"}}>
            <div>
              {get("dr-cat-11") && (
                <>
                  <Pill text="Salades"/>
                  {avail(get("dr-cat-11")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
            <VCol/>
            <div>
              {get("dr-cat-16") && (
                <>
                  <Pill text="Carpaccio"/>
                  <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,fontStyle:"italic",color:CrL,textAlign:"center",marginBottom:12,marginTop:-8}}>
                    Garniture au choix : salade ou frites
                  </p>
                  {avail(get("dr-cat-16")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
          </div>
          <Footer section="II — Salades & Carpaccios"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 4 — VIANDES
        ══════════════════════════════════════════ */}
        <A4>
          <Pill text="Les Viandes"/>
          <p style={{fontFamily:"var(--font-cormorant)",fontSize:12,fontStyle:"italic",color:CrL,textAlign:"center",margin:"-12px 0 24px",letterSpacing:"0.04em"}}>
            Nos pièces de caractère
          </p>
          <div style={{maxWidth:620,margin:"0 auto"}}>
            {get("dr-cat-17") && avail(get("dr-cat-17")!.dishes).length > 0 && (
              <>
                <Pill text="Bœuf"/>
                {avail(get("dr-cat-17")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
            {get("dr-cat-18") && avail(get("dr-cat-18")!.dishes).length > 0 && (
              <>
                <Rule op={0.12}/>
                {avail(get("dr-cat-18")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
            {get("dr-cat-19") && avail(get("dr-cat-19")!.dishes).length > 0 && (
              <>
                <Pill text="Burgers de Collection"/>
                {avail(get("dr-cat-19")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
              </>
            )}
            {get("dr-cat-20") && avail(get("dr-cat-20")!.dishes).length > 0 && (
              <>
                <Pill text="Veau & Canard"/>
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
          <Pill text="L'Âme de l'Italie"/>

          {get("dr-cat-13") && avail(get("dr-cat-13")!.dishes).length > 0 && (
            <div style={{maxWidth:620,margin:"0 auto 20px"}}>
              <Pill text="La Mer"/>
              {avail(get("dr-cat-13")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
            </div>
          )}

          <Rule op={0.12}/>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px",marginTop:16}}>
            <div>
              {get("dr-cat-25") && (
                <>
                  <Pill text="Les Pâtes"/>
                  <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,fontStyle:"italic",color:CrL,textAlign:"center",marginBottom:10,marginTop:-12}}>
                    Choisissez pâtes et sauce
                  </p>
                  <div style={{marginBottom:12}}>
                    <p style={{fontFamily:"var(--font-cormorant)",fontSize:9.5,letterSpacing:"0.2em",textTransform:"uppercase",color:CrD,margin:"0 0 5px",textAlign:"center"}}>
                      Pâtes disponibles
                    </p>
                    {["Tagliatelles","Spaghettis","Decatoni"].map(p => (
                      <p key={p} style={{fontFamily:"var(--font-cormorant)",fontSize:12,fontStyle:"italic",color:CrL,margin:"2px 0",lineHeight:1.3,textAlign:"center"}}>· {p}</p>
                    ))}
                    <div style={{height:"0.5px",background:Cr,opacity:.1,margin:"8px 0"}}/>
                  </div>
                  {avail(get("dr-cat-25")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
            <VCol/>
            <div>
              {get("dr-cat-26") && (
                <>
                  <Pill text="Les Risottos"/>
                  {avail(get("dr-cat-26")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
          </div>

          <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,fontStyle:"italic",color:CrD,textAlign:"center",marginTop:16}}>
            — Demandez la suggestion du moment —
          </p>
          <Footer section="IV — Poissons, Pâtes & Risottos"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 6 — PIZZAS
        ══════════════════════════════════════════ */}
        <A4>
          <Pill text="Les Pizzas — 32 cm"/>
          <p style={{fontFamily:"var(--font-cormorant)",fontSize:12,fontStyle:"italic",color:CrL,textAlign:"center",margin:"-12px 0 24px"}}>
            Au four à bois
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1px 1fr",gap:"0 28px"}}>
            <div>
              {get("dr-cat-14") && (
                <>
                  <Pill text="Base Tomate"/>
                  {avail(get("dr-cat-14")!.dishes).map(d => <PR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
            <VCol/>
            <div>
              {get("dr-cat-27") && (
                <>
                  <Pill text="Base Crème Fraîche"/>
                  {avail(get("dr-cat-27")!.dishes).map(d => <PR key={d.id} dish={d}/>)}
                </>
              )}
            </div>
          </div>
          <p style={{fontFamily:"var(--font-cormorant)",fontSize:11,fontStyle:"italic",color:CrD,textAlign:"center",marginTop:16}}>
            — Pizza en suggestion sur ardoise, pensez à demander —
          </p>
          <Footer section="V — Pizzas"/>
        </A4>

        {/* ══════════════════════════════════════════
            PAGE 7 — DESSERTS & CAFÉS
        ══════════════════════════════════════════ */}
        {get("dr-cat-15") && avail(get("dr-cat-15")!.dishes).length > 0 && (
          <A4>
            <Pill text="Desserts & Cafés"/>
            <div style={{maxWidth:580,margin:"0 auto"}}>
              {avail(get("dr-cat-15")!.dishes).map(d => <DR key={d.id} dish={d}/>)}
            </div>

            {/* Tagline couverture */}
            <div style={{
              position:"absolute",bottom:24,left:0,right:0,
              textAlign:"center",
            }}>
              <p style={{fontFamily:"var(--font-playfair)",fontSize:9,letterSpacing:"0.35em",textTransform:"uppercase",color:CrD,margin:0}}>
                Earthy · Elegant · Exceptionally You.
              </p>
            </div>
          </A4>
        )}

        <PrintButton/>

      </div>
    </>
  );
}
