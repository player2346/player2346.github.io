class LocalSearch{constructor({path:e="",unescape:t=!1,top_n_per_article:n=1}){this.path=e,this.unescape=t,this.top_n_per_article=n,this.isfetched=!1,this.datas=null}getIndexByWord(e,r,i=!1){const a=[],o=new Set;return i||(r=r.toLowerCase()),e.forEach(t=>{this.unescape&&((e=document.createElement("div")).innerText=t,t=e.innerHTML);var e,n=t.length;if(0!==n){let e=0;var s;for(i||(t=t.toLowerCase());-1<(s=r.indexOf(t,e));)a.push({position:s,word:t}),o.add(t),e=s+n}}),a.sort((e,t)=>e.position!==t.position?e.position-t.position:t.word.length-e.word.length),[a,o]}mergeIntoSlice(e,t,n){var s;let{position:r,word:i}=n[0];for(var a=[],o=new Set;r+i.length<=t&&0!==n.length;){o.add(i),a.push({position:r,length:i.length});var l=r+i.length;for(n.shift();0!==n.length&&(s=n[0],r=s.position,i=s.word,l>r);)n.shift()}return{hits:a,start:e,end:t,count:o.size}}highlightKeyword(e,t){let n="",s=t.start;for(var{position:r,length:i}of t.hits)n+=e.substring(s,r),s=r+i,n+=`<mark class="search-keyword">${e.substr(r,i)}</mark>`;return n+=e.substring(s,t.end)}getResultItems(u){const g=[];return this.datas.forEach(({title:n,content:s,url:r})=>{var[i,a]=this.getIndexByWord(u,n),[o,l]=this.getIndexByWord(u,s),a=new Set([...a,...l]).size,l=i.length+o.length;if(0!==l){var h=[];0!==i.length&&h.push(this.mergeIntoSlice(0,n.length,i));let e=[];for(;0!==o.length;){var c=o[0]["position"],d=Math.max(0,c-20),c=Math.min(s.length,c+100);e.push(this.mergeIntoSlice(d,c,o))}e.sort((e,t)=>e.count!==t.count?t.count-e.count:e.hits.length!==t.hits.length?t.hits.length-e.hits.length:e.start-t.start);i=parseInt(this.top_n_per_article,10);0<=i&&(e=e.slice(0,i));let t="";(r=new URL(r,location.origin)).searchParams.append("highlight",u.join(" ")),t+=0!==h.length?`<div class="local-search-hit-item"><a href="${r.href}"><span class="search-result-title">${this.highlightKeyword(n,h[0])}</span>`:`<div class="local-search-hit-item"><a href="${r.href}"><span class="search-result-title">${n}</span>`,e.forEach(e=>{t+=`<p class="search-result">${this.highlightKeyword(s,e)}...</p></a>`}),t+="</div>",g.push({item:t,id:g.length,hitCount:l,includedCount:a})}}),g}fetchData(){const t=!this.path.endsWith("json");fetch(this.path).then(e=>e.text()).then(e=>{this.isfetched=!0,this.datas=t?[...(new DOMParser).parseFromString(e,"text/xml").querySelectorAll("entry")].map(e=>({title:e.querySelector("title").textContent,content:e.querySelector("content").textContent,url:e.querySelector("url").textContent})):JSON.parse(e),this.datas=this.datas.filter(e=>e.title).map(e=>(e.title=e.title.trim(),e.content=e.content?e.content.trim().replace(/<[^>]+>/g,""):"",e.url=decodeURIComponent(e.url).replace(/\/{2,}/g,"/"),e)),window.dispatchEvent(new Event("search:loaded"))})}highlightText(t,e,n){var s=t.nodeValue;let r=e.start;var i,a,o=[];for({position:i,length:a}of e.hits){var l=document.createTextNode(s.substring(r,i)),h=(r=i+a,document.createElement("mark"));h.className=n,h.appendChild(document.createTextNode(s.substr(i,a))),o.push(l,h)}t.nodeValue=s.substring(r,e.end),o.forEach(e=>{t.parentNode.insertBefore(e,t)})}highlightSearchWords(e){var t=new URL(location.href).searchParams.get("highlight");const n=t?t.split(" "):[];if(n.length&&e){for(var s=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,null),r=[];s.nextNode();)s.currentNode.parentNode.matches("button, select, textarea, .mermaid")||r.push(s.currentNode);r.forEach(e=>{var[t]=this.getIndexByWord(n,e.nodeValue);t.length&&(t=this.mergeIntoSlice(0,e.nodeValue.length,t),this.highlightText(e,t,"search-keyword"))})}}}window.addEventListener("load",()=>{const{path:e,top_n_per_article:t,unescape:n,languages:r}=GLOBAL_CONFIG.localSearch,i=new LocalSearch({path:e,top_n_per_article:t,unescape:n}),a=document.querySelector("#local-search-input input"),o=document.getElementById("local-search-stats-wrap"),l=document.getElementById("loading-status"),s=()=>{if(i.isfetched){var t=a.value.trim().toLowerCase(),n=(""!==t&&(l.innerHTML='<i class="fas fa-spinner fa-pulse"></i>'),t.split(/[-\s]+/)),s=document.getElementById("local-search-results");let e=[];0<t.length&&(e=i.getResultItems(n)),1===n.length&&""===n[0]?(s.classList.add("no-result"),s.textContent=""):0===e.length?(s.textContent="",o.innerHTML=`<div class="search-result-stats">${r.hits_empty.replace(/\$\{query}/,t)}</div>`):(e.sort((e,t)=>e.includedCount!==t.includedCount?t.includedCount-e.includedCount:e.hitCount!==t.hitCount?t.hitCount-e.hitCount:t.id-e.id),n=r.hits_stats.replace(/\$\{hits}/,e.length),s.classList.remove("no-result"),s.innerHTML=`<div class="search-result-list">${e.map(e=>e.item).join("")}</div>`,o.innerHTML=`<hr><div class="search-result-stats">${n}</div>`,window.pjax&&window.pjax.refresh(s)),l.innerHTML=""}};let h=!1;const c=document.getElementById("search-mask"),d=document.querySelector("#local-search .search-dialog"),u=()=>{window.innerWidth<768&&d.style.setProperty("--search-height",window.innerHeight+"px")},g=()=>{var e=document.body.style;e.width="100%",e.overflow="hidden",btf.animateIn(c,"to_show 0.5s"),btf.animateIn(d,"titleScale 0.5s"),setTimeout(()=>{a.focus()},300),h||(i.isfetched||i.fetchData(),a.addEventListener("input",s),h=!0),document.addEventListener("keydown",function e(t){"Escape"===t.code&&(p(),document.removeEventListener("keydown",e))}),u(),window.addEventListener("resize",u)},p=()=>{var e=document.body.style;e.width="",e.overflow="",btf.animateOut(d,"search_close .5s"),btf.animateOut(c,"to_hide 0.5s"),window.removeEventListener("resize",u)},m=()=>{document.querySelector("#search-button > .search").addEventListener("click",g)};window.addEventListener("search:loaded",()=>{var e=document.getElementById("loading-database");e.nextElementSibling.style.display="block",e.remove()}),m(),document.querySelector("#local-search .search-close-button").addEventListener("click",p),c.addEventListener("click",p),GLOBAL_CONFIG.localSearch.preload&&i.fetchData(),i.highlightSearchWords(document.getElementById("article-container")),window.addEventListener("pjax:complete",()=>{btf.isHidden(c)||p(),i.highlightSearchWords(document.getElementById("article-container")),m()})});