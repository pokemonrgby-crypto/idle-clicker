let box;
export function notify(text, duration=2000){
  if(!box){
    box = document.createElement('div');
    Object.assign(box.style, {
      position:'fixed',
      bottom:'20px',
      left:'50%',
      transform:'translateX(-50%)',
      display:'grid',
      gap:'8px',
      zIndex:'1000',
      pointerEvents:'none'
    });
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.textContent = text;
  Object.assign(el.style, {
    background:'var(--panel)',
    border:'1px solid var(--line)',
    color:'var(--txt)',
    borderRadius:'8px',
    padding:'8px 12px',
    fontWeight:'600',
    boxShadow:'0 2px 6px rgba(0,0,0,.4)',
    opacity:'1',
    transition:'opacity .5s'
  });
  box.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; }, duration);
  setTimeout(()=>{ el.remove(); }, duration+500);
}
