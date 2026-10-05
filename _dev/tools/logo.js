/* three logo concepts; drawLogo(c,S,variant,pad) */
function star8(c,cx,cy,r,k){c.beginPath();for(var i=0;i<16;i++){var a=Math.PI/8*i-Math.PI/2,q=i%2?r*(k||0.74):r;c.lineTo(cx+q*Math.cos(a),cy+q*Math.sin(a))}c.closePath()}
function rub(c,cx,cy,r){/* Rub el Hizb: two overlapping squares */c.beginPath();for(var t=0;t<2;t++){var o=t*Math.PI/4;for(var i=0;i<4;i++){var a=o+Math.PI/2*i;var x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}}
function saduStrip(c,x,y,w,h,col,bg){c.fillStyle=bg;c.fillRect(x,y,w,h);c.fillStyle=col;var s=h;for(var i=x;i<x+w;i+=s){c.beginPath();c.moveTo(i,y+h);c.lineTo(i+s/2,y);c.lineTo(i+s,y+h);c.closePath();c.fill()}}
function drawLogo(c,S,v,pad){
 var r=S*(0.5-pad),cx=S/2,cy=S/2;
 if(v==='A'){/* gold Rub el Hizb on madder, word شذرات */
  var g=c.createRadialGradient(cx,cy*0.8,S*0.05,cx,cy,S*0.75);g.addColorStop(0,'#b23a26');g.addColorStop(1,'#6e1b12');c.fillStyle=g;c.fillRect(0,0,S,S);
  c.strokeStyle='#e8c67a';c.lineWidth=S*0.022;rub(c,cx,cy,r*0.95);c.stroke();c.lineWidth=S*0.008;rub(c,cx,cy,r*0.82);c.stroke();
  c.fillStyle='rgba(232,198,122,.16)';rub(c,cx,cy,r*0.82);c.fill();
  c.fillStyle='#fbf3e3';var fs=r*0.62;c.textAlign='center';c.textBaseline='middle';c.direction='rtl';do{c.font='700 '+Math.round(fs)+'px "Aref Ruqaa"';fs-=2}while(c.measureText('شذرات').width>r*1.02);c.fillText('شذرات',cx,cy+r*0.04);
 }
 if(v==='B'){/* reed pen with a star of ink on deep indigo */
  c.fillStyle='#1d1f3d';c.fillRect(0,0,S,S);
  c.save();c.translate(cx+r*0.1,cy-r*0.1);c.rotate(Math.PI*0.75);
  var L=r*1.35,w=r*0.2;c.fillStyle='#e8c67a';c.beginPath();c.moveTo(-L*0.55,-w/2);c.lineTo(L*0.25,-w/2);c.lineTo(L*0.5,0);c.lineTo(L*0.25,w/2);c.lineTo(-L*0.55,w/2);c.closePath();c.fill();
  c.fillStyle='#b88a2e';c.fillRect(-L*0.55,-w/2,L*0.12,w);c.strokeStyle='#1d1f3d';c.lineWidth=S*0.006;c.beginPath();c.moveTo(L*0.3,0);c.lineTo(L*0.5,0);c.stroke();c.restore();
  var tx=cx+r*0.1-Math.SQRT1_2*r*0.675,ty=cy-r*0.1+Math.SQRT1_2*r*0.675;
  c.fillStyle='#e8c67a';star8(c,cx-r*0.42,cy-r*0.5,r*0.2);c.fill();
  c.fillStyle='#fbf3e3';[[0.65,-0.7,0.05],[-0.75,-0.05,0.04],[0.7,0.15,0.03]].forEach(function(d){c.beginPath();c.arc(cx+d[0]*r,cy+d[1]*r,d[2]*r,0,7);c.fill()});
  c.strokeStyle='#e8c67a';c.lineWidth=S*0.012;c.beginPath();c.moveTo(tx,ty);c.bezierCurveTo(tx+r*0.25,ty+r*0.2,tx+r*0.6,ty+r*0.05,tx+r*1.05,ty+r*0.18);c.stroke();
 }
 if(v==='C'){/* madder arch with gold ح and a Sadu base */
  c.fillStyle='#f4ead6';c.fillRect(0,0,S,S);
  var x0=cx-r*0.72,x1=cx+r*0.72,top=cy-r*0.95,spring=cy-r*0.25,bot=cy+r*0.62;
  c.fillStyle='#9b2c1f';c.beginPath();c.moveTo(x0,bot);c.lineTo(x0,spring);c.bezierCurveTo(x0,spring-(spring-top)*0.55,cx-r*0.18,top+(spring-top)*0.2,cx,top);c.bezierCurveTo(cx+r*0.18,top+(spring-top)*0.2,x1,spring-(spring-top)*0.55,x1,spring);c.lineTo(x1,bot);c.closePath();c.fill();
  c.fillStyle='#e8c67a';c.font='700 '+Math.round(r*0.85)+'px "Aref Ruqaa"';c.textAlign='center';c.textBaseline='middle';c.fillText('ح',cx,cy-r*0.08);
  star8(c,cx,top+r*0.25,r*0.08);c.fill();
  saduStrip(c,cx-r*0.95,bot+r*0.06,r*1.9,r*0.16,'#9b2c1f','#1c1a22');
 }
}
/* quote-mark + ش concepts */
function qdrop(c,x,y,s,flip,col){/* one curly quotation drop: round head with a tapering tail */c.save();c.translate(x,y);if(flip)c.rotate(Math.PI);c.fillStyle=col;c.beginPath();c.arc(0,0,s,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(-s*0.98,s*0.1);c.bezierCurveTo(-s*1.05,s*1.4,-s*0.2,s*2.3,s*0.95,s*2.55);c.bezierCurveTo(s*0.2,s*1.9,s*0.1,s*1.2,s*0.6,s*0.8);c.closePath();c.fill();c.restore()}
function sheen(c,cx,cy,size,col,font){c.fillStyle=col;c.font='700 '+Math.round(size)+'px "'+(font||'Aref Ruqaa')+'"';c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('ش',cx,cy)}
function drawLogo2(c,S,v,pad){
 var r=S*(0.5-pad),cx=S/2,cy=S/2;
 if(v==='D'){/* «ش» */
  var g=c.createRadialGradient(cx,cy*0.8,S*0.05,cx,cy,S*0.75);g.addColorStop(0,'#b23a26');g.addColorStop(1,'#6e1b12');c.fillStyle=g;c.fillRect(0,0,S,S);
  c.fillStyle='#e8c67a';c.font='700 '+Math.round(r*1.15)+'px "Amiri"';c.textAlign='center';c.textBaseline='middle';c.fillText('«',cx-r*0.66,cy+r*0.02);c.fillText('»',cx+r*0.66,cy+r*0.02);
  sheen(c,cx,cy+r*0.02,r*1.25,'#fbf3e3');
 }
 if(v==='E'){/* ش between two big gold curly quotes */
  c.fillStyle='#1d1f3d';c.fillRect(0,0,S,S);
  var q=r*0.17;qdrop(c,cx+r*0.62,cy-r*0.62,q,true,'#e8c67a');qdrop(c,cx+r*0.25,cy-r*0.62,q,true,'#e8c67a');
  qdrop(c,cx-r*0.62,cy+r*0.62,q,false,'#e8c67a');qdrop(c,cx-r*0.25,cy+r*0.62,q,false,'#e8c67a');
  sheen(c,cx,cy+r*0.05,r*1.2,'#fbf3e3');
 }
 if(v==='F'||v==='G'){/* ش whose three dots are quotation drops */
  var dark=v==='G';
  if(dark){var g2=c.createRadialGradient(cx,cy*0.8,S*0.05,cx,cy,S*0.75);g2.addColorStop(0,'#b23a26');g2.addColorStop(1,'#6e1b12');c.fillStyle=g2}else c.fillStyle='#f4ead6';
  c.fillRect(0,0,S,S);
  c.fillStyle=dark?'#fbf3e3':'#9b2c1f';c.font='700 '+Math.round(r*1.55)+'px "Aref Ruqaa"';c.textAlign='center';c.textBaseline='middle';c.fillText('س',cx,cy+r*0.22);
  var q2=r*0.135,dc=dark?'#e8c67a':'#c08a2a';qdrop(c,cx-r*0.2,cy-r*0.4,q2,false,dc);qdrop(c,cx+r*0.2,cy-r*0.4,q2,false,dc);qdrop(c,cx,cy-r*0.8,q2,false,dc);
 }
}

/* seal: ش (its three dots as quote drops) inside an eight-pointed star (two squares). transparent=true leaves the corners clear for in-page use */
function sealSq(c,cx,cy,r){c.beginPath();for(var t=0;t<2;t++){var o=t*Math.PI/4;for(var i=0;i<4;i++){var a=o+Math.PI/2*i,x=cx+r*Math.cos(a),y=cy+r*Math.sin(a);i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}}
function drawSeal(c,cx,cy,r,shadow){
 c.save();if(shadow){c.shadowColor='rgba(80,30,20,.25)';c.shadowBlur=r*0.12}c.fillStyle='#9b2c1f';sealSq(c,cx,cy,r);c.fill();c.restore();
 c.strokeStyle='#e8c67a';c.lineWidth=Math.max(1,r*0.035);sealSq(c,cx,cy,r*0.9);c.stroke();c.lineWidth=Math.max(1,r*0.012);sealSq(c,cx,cy,r*0.8);c.stroke();
 var R=r*0.62;c.fillStyle='#fbf3e3';c.font='700 '+Math.round(R*1.5)+'px "Aref Ruqaa"';c.textAlign='center';c.textBaseline='middle';c.direction='rtl';c.fillText('س',cx,cy+R*0.2);
 var q=R*0.13;qdrop(c,cx-R*0.2,cy-R*0.4,q,false,'#e8c67a');qdrop(c,cx+R*0.2,cy-R*0.4,q,false,'#e8c67a');qdrop(c,cx,cy-R*0.78,q,false,'#e8c67a')
}
function drawLogoSeal(c,S,pad,bg){if(bg){c.fillStyle=bg;c.fillRect(0,0,S,S)}drawSeal(c,S/2,S/2,S*(0.5-pad),!bg)}
