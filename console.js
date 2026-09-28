import * as THREE from './vendor/three.module.js';

// Separate lid and base groups keep both the hinge motion and the controls physical.
export function createConsole(stage,screenCanvas,hits){
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2.5));renderer.setClearColor(0,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 stage.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,100);
 const unit=new THREE.Group();scene.add(unit);
 const lid=new THREE.Group(),base=new THREE.Group();unit.add(lid,base);
 base.rotation.x=-1.18;base.position.set(0,-Math.cos(1.18)*2.68,Math.sin(1.18)*2.68);
 const env=document.createElement('canvas');env.width=1024;env.height=512;
 const ec=env.getContext('2d');ec.fillStyle='#5a5c63';ec.fillRect(0,0,1024,512);
 const eg=ec.createLinearGradient(0,0,0,512);eg.addColorStop(0,'#e0e1e5');eg.addColorStop(.5,'#656772');eg.addColorStop(1,'#161821');ec.fillStyle=eg;ec.fillRect(0,0,1024,512);
 ec.fillStyle='#ffffff';ec.fillRect(70,90,200,180);ec.fillRect(690,30,100,330);ec.fillStyle='#bdc5d3';ec.fillRect(410,150,140,140);
 const et=new THREE.CanvasTexture(env);et.mapping=THREE.EquirectangularReflectionMapping;et.colorSpace=THREE.SRGBColorSpace;
 const pmrem=new THREE.PMREMGenerator(renderer);scene.environment=pmrem.fromEquirectangular(et).texture;et.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xf1f3ff,0x373843,1.3));
 for(const [color,power,pos] of [[0xfffaf2,2.4,[-5,8,10]],[0xcbd7ff,1.3,[6,3,3]],[0xffffff,3,[0,7,-5]]]){const light=new THREE.DirectionalLight(color,power);light.position.set(...pos);scene.add(light)}
 const silver=new THREE.MeshPhysicalMaterial({color:0x92979e,metalness:.67,roughness:.36,clearcoat:.22});
 const edge=new THREE.MeshStandardMaterial({color:0x82868b,metalness:.65,roughness:.4});
 const black=new THREE.MeshStandardMaterial({color:0x11161a,roughness:.38,metalness:.12});
 const rubber=new THREE.MeshStandardMaterial({color:0x888d88,roughness:.85});
 const control=new THREE.MeshPhysicalMaterial({color:0x979d98,roughness:.46,metalness:.16,clearcoat:.1});
 const cavity=new THREE.MeshStandardMaterial({color:0x3c4243,roughness:.8});
 function rounded(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s}
 function extrude(parent,s,d,b,mat,x,y,z){const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:b,bevelThickness:b,bevelSegments:5,curveSegments:32});g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);parent.add(m);return m}
 function plate(parent,w,h,r,d,b,mat,x,y,z){return extrude(parent,rounded(w,h,r),d,b,mat,x,y,z)}
 function disc(parent,r,d,mat,x,y,z,action){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d,64),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);parent.add(m);if(action){m.userData.action=action;hits.push(m)}return m}
 function label(parent,value,w,h,x,y,z,color='#6f7474',size=70){const c=document.createElement('canvas');c.width=1024;c.height=128;const t=c.getContext('2d');t.fillStyle=color;t.textAlign='center';t.textBaseline='middle';t.font=`bold ${size}px Arial`;t.fillText(value,512,64);const tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));m.position.set(x,y,z);parent.add(m)}
 // Thin rectangular silver display housing with a dark inset and five rubber stops.
 plate(lid,6.25,5.8,.31,.18,.08,edge,0,3,-.21);
 plate(lid,6.29,5.8,.31,.10,.07,silver,0,3,-.01);
 plate(lid,5.65,4.65,.14,.026,.025,black,0,2.94,.13);
 plate(lid,5.28,3.55,.07,.008,.025,cavity,0,3.22,.164);
 const texture=new THREE.CanvasTexture(screenCanvas);texture.colorSpace=THREE.SRGBColorSpace;
 texture.anisotropy=renderer.capabilities.getMaxAnisotropy();texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(5.25,3.5),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));screen.position.set(0,3.22,.208);screen.userData.action='screen';lid.add(screen);hits.push(screen);
 label(lid,'GAME BOY ADVANCE SP',4.9,.24,0,.98,.19,'#9b9e9f',78);
 for(const [x,y,r] of [[-2.72,5.45,.19],[2.72,5.45,.19],[0,5.48,.16],[-2.73,.48,.17],[2.73,.48,.17]]){disc(lid,r+.025,.023,edge,x,y,.12);disc(lid,r,.037,rubber,x,y,.146)}
 // The thicker bottom case, mid-shell seam and recessed cartridge opening.
 plate(base,6.32,5.4,.36,.35,.13,edge,0,0,-.38);
 plate(base,6.36,5.4,.36,.025,.08,cavity,0,0,-.06);
 plate(base,6.38,5.4,.36,.09,.09,silver,0,0,.02);
 const slot=new THREE.Mesh(new THREE.BoxGeometry(4.35,.12,.3),black);slot.position.set(0,-2.79,-.24);base.add(slot);
 const cartridge=new THREE.Mesh(new THREE.BoxGeometry(3.9,.125,.13),cavity);cartridge.position.set(0,-2.8,-.18);base.add(cartridge);
 // Three hinge barrels share the same physical axis.
 for(const [x,len] of [[-2.05,1.8],[0,2.2],[2.05,1.8]]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,len,64),silver);h.rotation.z=Math.PI/2;h.position.set(x,0,.015);unit.add(h)}
 for(const x of [-3.02,3.02]){const h=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.028,64),rubber);h.rotation.z=Math.PI/2;h.position.set(x,0,.015);unit.add(h)}
 disc(base,.94,.025,edge,-1.82,.6,.215);disc(base,.88,.025,silver,-1.82,.6,.235);
 const cross=new THREE.Shape();[[-.23,.7],[.23,.7],[.23,.23],[.7,.23],[.7,-.23],[.23,-.23],[.23,-.7],[-.23,-.7],[-.23,-.23],[-.7,-.23],[-.7,.23],[-.23,.23]].forEach(([x,y],i)=>i?cross.lineTo(x,y):cross.moveTo(x,y));cross.closePath();
 extrude(base,cross,.12,.045,control,-1.82,.6,.245);
 for(const [x,y,a] of [[-1.82,1.09,'up'],[-1.82,.11,'down'],[-2.31,.6,'left'],[-1.33,.6,'right']]){const hit=new THREE.Mesh(new THREE.PlaneGeometry(.49,.49),new THREE.MeshBasicMaterial({visible:false}));hit.position.set(x,y,.43);hit.userData.action=a;base.add(hit);hits.push(hit)}
 const ab=plate(base,1.95,.94,.46,.015,.075,edge,1.76,.91,.15);ab.rotation.z=.51;
 for(const [x,y,a] of [[2.2,1.17,'a'],[1.32,.67,'b']]){disc(base,.35,.045,cavity,x,y,.225);disc(base,.31,.12,control,x,y,.29,a);label(base,a.toUpperCase(),.3,.19,x,y,.356,'#666c68',74)}
 disc(base,.20,.035,edge,0,1.89,.22);disc(base,.145,.05,control,0,1.89,.255);label(base,'☀',.17,.14,0,1.89,.29,'#535854',60);
 for(let row=0;row<4;row++)for(let col=0;col<5;col++){if((row===0||row===3)&&(col===0||col===4))continue;disc(base,.037,.015,black,(col-2)*.255,-.51-row*.255,.225)}
 for(const [x,a] of [[-.62,'select'],[.62,'start']]){disc(base,.29,.025,edge,x,-1.92,.24);disc(base,.22,.07,control,x,-1.92,.30,a);label(base,a.toUpperCase(),.7,.14,x,-1.51,.23,'#777c80',55)}
 const led=new THREE.Mesh(new THREE.BoxGeometry(.09,.3,.04),new THREE.MeshBasicMaterial({color:0x99ff80}));led.position.set(3.23,1.65,-.03);base.add(led);
 for(const x of [-2.4,2.4])plate(base,1,.22,.07,.13,.035,control,x,2.68,-.1);
 const sh=document.createElement('canvas');sh.width=sh.height=256;const sc=sh.getContext('2d'),sg=sc.createRadialGradient(128,128,0,128,128,125);sg.addColorStop(0,'#000000a0');sg.addColorStop(1,'#00000000');sc.fillStyle=sg;sc.fillRect(0,0,256,256);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(10,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sh),transparent:true,depthWrite:false}));shadow.position.set(0,-4,-1);scene.add(shadow);
 const resize=()=>{renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(stage);resize();
 return {renderer,scene,camera,unit,screen,texture,lid,shadow};
}
