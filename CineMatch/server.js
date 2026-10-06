const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const TMDB = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

const genreIds = {
  action:28, adventure:12, comedy:35, drama:18, horror:27,
  scifi:878, fantasy:14, animation:16
};

function profile(a){
  const names={light:"leve e divertido",intense:"intenso e emocionante",dark:"sombrio",epic:"épico e imaginativo",
    fast:"ritmo rápido",balanced:"ritmo equilibrado",slow:"ritmo mais contemplativo",any:"qualquer ritmo",
    recent:"filmes recentes","2000s":"anos 2000–2010","90s":"anos 90",popular:"grandes sucessos",
    critic:"filmes premiados pela crítica",indie:"descobertas independentes",mix:"uma mistura de estilos"};
  const tags=[...(a.genres||[]).map(x=>x),names[a.mood],names[a.pace],names[a.era],names[a.rating]].filter(Boolean);
  let name="Perfil cinéfilo";
  if((a.genres||[]).includes("action")||a.mood==="intense") name="Explorador de adrenalina";
  else if((a.genres||[]).includes("horror")||a.mood==="dark") name="Caçador de suspense";
  else if((a.genres||[]).includes("fantasy")||a.mood==="epic") name="Viajante de mundos";
  else if((a.genres||[]).includes("comedy")||a.mood==="light") name="Cinéfilo de boas histórias";
  return {name,text:`Seu perfil prioriza ${tags.slice(0,4).join(", ")}. As recomendações são ranqueadas pelo conjunto dessas preferências.`,tags};
}

function score(m,a){
  const selected=a.genres||[];
  let s=45;
  for(const g of selected){
    if(g==="action"&&m.genre_ids.includes(28))s+=13;
    if(g==="adventure"&&m.genre_ids.includes(12))s+=11;
    if(g==="comedy"&&m.genre_ids.includes(35))s+=13;
    if(g==="drama"&&m.genre_ids.includes(18))s+=11;
    if(g==="horror"&&m.genre_ids.includes(27))s+=13;
    if(g==="scifi"&&m.genre_ids.includes(878))s+=13;
    if(g==="fantasy"&&m.genre_ids.includes(14))s+=13;
    if(g==="animation"&&m.genre_ids.includes(16))s+=11;
  }
  if(a.mood==="dark"&&m.genre_ids.includes(27))s+=10;
  if(a.mood==="light"&&m.genre_ids.includes(35))s+=9;
  if(a.mood==="epic"&&(m.genre_ids.includes(14)||m.genre_ids.includes(12)))s+=9;
  if(a.mood==="intense"&&(m.genre_ids.includes(28)||m.genre_ids.includes(53)))s+=8;
  if(a.rating==="popular")s+=Math.min(10,m.popularity/25);
  if(a.rating==="critic")s+=Math.min(10,m.vote_average);
  if(a.rating==="indie")s+=m.popularity<30?8:0;
  if(a.era==="recent" && (m.release_date||"").startsWith("2025"))s+=8;
  if(a.era==="2000s"){const y=+(m.release_date||"0").slice(0,4);if(y>=2000&&y<=2010)s+=8}
  if(a.era==="90s"){const y=+(m.release_date||"0").slice(0,4);if(y>=1990&&y<=1999)s+=8}
  return Math.max(1,Math.min(99,Math.round(s)));
}

app.post("/api/recommendations",async(req,res)=>{
  try{
    if(!process.env.TMDB_TOKEN) return res.status(500).send("TMDB_TOKEN ausente.");
    const a=req.body;
    const wanted=(a.genres||[]).map(x=>genreIds[x]).filter(Boolean);
    const params=new URLSearchParams({language:"pt-BR",sort_by:"popularity.desc",include_adult:"false",page:"1"});
    if(wanted.length) params.set("with_genres",wanted.join("|"));
    if(a.era==="recent"){params.set("primary_release_date.gte","2024-01-01");}
    const response=await fetch(`${TMDB}/discover/movie?${params}`,{headers:{Authorization:`Bearer ${process.env.TMDB_TOKEN}`}});
    if(!response.ok) throw new Error("TMDB respondeu com erro.");
    const data=await response.json();
    const movies=(data.results||[]).map(m=>({
      title:m.title,year:(m.release_date||"").slice(0,4),
      poster:m.poster_path?IMG+m.poster_path:null,
      genre_ids:m.genre_ids||[],popularity:m.popularity||0,vote_average:m.vote_average||0
    })).map(m=>({...m,match:score(m,a)})).sort((x,y)=>y.match-x.match).slice(0,12);
    res.json({profile:profile(a),movies});
  }catch(e){res.status(500).send(e.message)}
});

app.listen(process.env.PORT||3000,()=>console.log("CineMatch em http://localhost:3000"));