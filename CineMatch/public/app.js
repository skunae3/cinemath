const questions = [
  {id:"genres", title:"Que tipos de filme mais combinam com você?", multi:true,
   options:[
    ["Ação","action"],["Aventura","adventure"],["Comédia","comedy"],["Drama","drama"],
    ["Terror","horror"],["Ficção científica","scifi"],["Fantasia","fantasy"],["Animação","animation"]
   ]},
  {id:"mood", title:"Quando você escolhe um filme, qual clima prefere?", options:[
    ["Leve e divertido","light"],["Intenso e emocionante","intense"],["Sombrio e assustador","dark"],["Épico e imaginativo","epic"]
   ]},
  {id:"pace", title:"Qual ritmo você prefere?", options:[
    ["Rápido, com muita ação","fast"],["Equilibrado","balanced"],["Lento, com foco na história","slow"],["Não importa","any"]
   ]},
  {id:"era", title:"Qual período costuma te interessar mais?", options:[
    ["Filmes recentes","recent"],["Anos 2000–2010","2000s"],["Anos 90","90s"],["Qualquer época","any"]
   ]},
  {id:"rating", title:"Você prefere filmes mais populares ou mais diferentes?", options:[
    ["Grandes sucessos","popular"],["Filmes premiados pela crítica","critic"],["Indies / descobertas","indie"],["Um pouco de cada","mix"]
   ]}
];

let step=0, answers={genres:[]};
const qEl=document.getElementById("question"), next=document.getElementById("next");
function render(){
  const q=questions[step];
  document.getElementById("qcount").textContent=`Pergunta ${step+1} de ${questions.length}`;
  document.getElementById("qstep").textContent=`${Math.round(step/questions.length*100)}%`;
  document.getElementById("bar").style.width=`${((step+1)/questions.length)*100}%`;
  qEl.innerHTML=`<div class="question"><h2>${q.title}</h2><div class="options">${q.options.map(([label,value])=>{
    const selected=q.multi?(answers[q.id]||[]).includes(value):answers[q.id]===value;
    return `<button class="option ${selected?"selected":""}" data-v="${value}">${label}</button>`;
  }).join("")}</div></div>`;
  document.querySelectorAll(".option").forEach(b=>b.onclick=()=>select(q,b.dataset.v));
  next.disabled=q.multi ? !(answers[q.id]||[]).length : !answers[q.id];
  next.textContent=step===questions.length-1?"Criar meu perfil":"Continuar";
}
function select(q,v){
  if(q.multi){
    const a=answers[q.id]||[];
    answers[q.id]=a.includes(v)?a.filter(x=>x!==v):[...a,v];
  }else answers[q.id]=v;
  render();
}
next.onclick=()=>{if(step<questions.length-1){step++;render()}else start()};
document.getElementById("again").onclick=()=>{step=0;answers={genres:[]};document.getElementById("results").classList.add("hidden");document.getElementById("quiz").classList.remove("hidden");render()};

function start(){
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("loading").classList.remove("hidden");
  fetchRecommendations();
}

function slugify(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function metacriticUrl(title){return `https://www.metacritic.com/movie/${slugify(title)}/`}

async function fetchRecommendations(){
  const err=document.getElementById("error");err.classList.add("hidden");
  try{
    // O backend usa TMDB para descobrir filmes atuais sem banco local.
    // Configure TMDB_TOKEN no .env. Depois, cada recomendação abre no Metacritic.
    const r=await fetch("/api/recommendations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(answers)});
    if(!r.ok) throw new Error(await r.text());
    const data=await r.json();
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("results").classList.remove("hidden");
    document.getElementById("profileName").textContent=data.profile.name;
    document.getElementById("profileText").textContent=data.profile.text;
    document.getElementById("chips").innerHTML=data.profile.tags.map(x=>`<span class="chip">${x}</span>`).join("");
    document.getElementById("source").textContent=`${data.movies.length} resultados • catálogo externo`;
    document.getElementById("movies").innerHTML=data.movies.map(m=>`
      <a class="movie" href="${metacriticUrl(m.title)}" target="_blank" rel="noopener">
        <img class="poster" src="${m.poster||""}" alt="${m.title}" loading="lazy">
        <div class="movie-body"><h3>${m.title}</h3><div class="score"><span>${m.year||""}</span><b>${m.match}% match</b></div></div>
      </a>`).join("");
  }catch(e){
    document.getElementById("loading").classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");
    err.classList.remove("hidden");
    err.textContent="Não foi possível consultar o catálogo. Confira a configuração do TMDB_TOKEN no arquivo .env.";
  }
}
render();