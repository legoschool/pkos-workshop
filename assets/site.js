const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ids=$$('.lesson').map(x=>x.id),KEY='pkos-workshop-v1';let data={checks:{},notes:{}};let all=false;
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&saved.checks&&saved.notes)data=saved}catch(e){}
function notify(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.hidden=true,2200)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){notify('이 브라우저에서는 저장되지 않습니다. 「학습 기록 내보내기」로 받아 두세요.')}}
function progress(){const n=ids.filter(id=>data.checks[id]).length;$('#progresslabel').textContent=`완료 ${n} / ${ids.length}`;$('#progressbar').style.width=`${n/ids.length*100}%`;$$('[data-chapter]').forEach(a=>a.classList.toggle('done',!!data.checks[a.dataset.chapter]))}
const names={home:'학습 지도',start:'준비',qr:'가져가기 · QR',review:'진행 · 점검'};
function route(){let id=decodeURIComponent(location.hash.slice(1))||'home';const el=document.getElementById(id);
 if(!el||!el.classList.contains('view')){const inner=el&&el.closest('.view');id=inner?inner.id:'home';}
 $$('.view').forEach(x=>x.hidden=!all&&x.id!==id);
 $$('[data-chapter]').forEach(a=>{const on=a.dataset.chapter===id;a.classList.toggle('active',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
 $('#crumb').textContent=all?'전체 자료':names[id]||document.querySelector('#'+id+' h2').textContent;
 document.body.classList.toggle('allview',all);$('#all').textContent=all?'한 장씩 보기':'전체 보기';
 const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(target&&!target.classList.contains('view'))setTimeout(()=>target.scrollIntoView(),0);}
window.addEventListener('hashchange',()=>{all=false;route();const t=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(t&&!t.classList.contains('view'))return;if(innerWidth<701&&location.hash&&location.hash!=='#home')$('main').scrollIntoView();else window.scrollTo(0,0)});
$('#all').onclick=()=>{all=!all;route()};
function eager(){$$('img').forEach(i=>i.loading='eager');return Promise.all($$('img').map(i=>i.decode().catch(()=>{})))}
$('#print').onclick=()=>{all=true;route();eager().then(()=>window.print())};
$$('[data-printqr]').forEach(b=>b.onclick=()=>{document.body.classList.add('printqr');eager().then(()=>{window.print();setTimeout(()=>document.body.classList.remove('printqr'),500)})});
$$('[data-check]').forEach(el=>{el.checked=!!data.checks[el.dataset.check];el.onchange=()=>{data.checks[el.dataset.check]=el.checked;save();progress()}});
$$('[data-note]').forEach(el=>{el.value=data.notes[el.dataset.note]||'';el.oninput=()=>{data.notes[el.dataset.note]=el.value;save()}});
$('#search').oninput=()=>{const q=$('#search').value.trim().toLowerCase();let n=0;
 $$('.nav a[data-chapter]').forEach(a=>{const sec=document.getElementById(a.dataset.chapter);a.hidden=!!q&&!(sec.textContent+a.textContent).toLowerCase().includes(q);if(!a.hidden)n++});
 $$('.nav .group').forEach(g=>{let x=g.nextElementSibling,any=false;while(x&&!x.classList.contains('group')){if(!x.hidden)any=true;x=x.nextElementSibling}g.hidden=!any});
 $('#noresults').hidden=n>0};
$$('.copy').forEach(btn=>btn.onclick=async()=>{const code=btn.closest('.codebox').querySelector('code'),text=code.textContent;
 try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();const ok=document.execCommand('copy');ta.remove();if(!ok)throw Error('copy')}notify('복사했습니다. 붙여 넣기 전에 내용을 한 번 확인하세요.')}
 catch(e){const r=document.createRange();r.selectNodeContents(code);const s=getSelection();s.removeAllRanges();s.addRange(r);notify('내용을 선택해 두었습니다. Ctrl+C로 복사하세요.')}});
$$('.photobutton').forEach(btn=>btn.onclick=()=>{const im=btn.querySelector('img');$('#largeimage').src=im.src;$('#largeimage').alt=im.alt;$('#phototitle').textContent='사진 '+im.dataset.number+' · '+im.alt;$('#photocaption').textContent=btn.parentElement.querySelector('figcaption').textContent.replace(/^사진 \S+\s*/,'');$('#lightbox').showModal()});
$('#closephoto').onclick=()=>$('#lightbox').close();$('#lightbox').onclick=e=>{if(e.target===$('#lightbox'))$('#lightbox').close()};
$$('.oschoices').forEach(group=>{const btns=[...group.querySelectorAll('[data-os]')];btns.forEach(btn=>btn.onclick=()=>{const c=btn.dataset.os;btns.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
 group.parentElement.querySelectorAll('[data-os-panel]').forEach(p=>p.hidden=p.dataset.osPanel!==c)})});
$('#export').onclick=()=>{let t='PKOS 도구 모음 · 내 학습 기록\n\n';ids.forEach((id,i)=>{t+=`${i+1}. ${document.querySelector('#'+id+' h2').textContent}\n완료: ${data.checks[id]?'확인':'미확인'}\n메모: ${data.notes[id]||''}\n\n`});
 const u=URL.createObjectURL(new Blob(['﻿'+t],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='PKOS_학습기록.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
progress();route();
