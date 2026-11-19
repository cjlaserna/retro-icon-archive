const input=document.querySelector('#collection-search');
const groups=[...document.querySelectorAll('#collection-list .directory')];
const cards=[...document.querySelectorAll('.collection')];
input.addEventListener('input',()=>{
 const q=input.value.toLowerCase().trim();let visible=0;
 for(const card of cards){const show=card.textContent.toLowerCase().includes(q);card.hidden=!show;if(show)visible++;}
 for(const group of groups){group.previousElementSibling.hidden=![...group.children].some(x=>!x.hidden);group.hidden=![...group.children].some(x=>!x.hidden);}
 document.querySelector('#collection-count').textContent=visible+' collections';
 document.querySelector('#no-results').hidden=visible!==0;
});