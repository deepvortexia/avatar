"use client";
import React,{useState,useEffect,useRef,Suspense,useCallback}from'react';
import{useSearchParams}from'next/navigation';
import EcosystemCards from'../components/EcosystemCards';
import Header from'../components/Header';
import ImageDisplay from'../components/ImageDisplay';
import{Notification}from'../components/Notification';
import{useAuth}from'@/context/AuthContext';
import{createClient}from'@/lib/supabase/client';

const STYLES=[
  {label:'Cartoon Pixar',value:'Cartoon Pixar',emoji:'🎠'},
  {label:'Cyberpunk',value:'Cyberpunk',emoji:'🤖'},
  {label:'Dark Fantasy',value:'Dark Fantasy',emoji:'🧙'},
  {label:'Anime',value:'Anime',emoji:'⛩️'},
  {label:'Cosmic God',value:'Cosmic God',emoji:'🌌'},
  {label:'Renaissance',value:'Renaissance',emoji:'🖼️'},
];

function HomeContent(){
  const{refreshProfile}=useAuth();
  const supabase=createClient();
  const searchParams=useSearchParams();
  const fileInputRef=useRef<HTMLInputElement>(null);
  const[selectedStyle,setSelectedStyle]=useState(STYLES[0].value);
  const[userPrompt,setUserPrompt]=useState('');
  const[imagePreview,setImagePreview]=useState<string|null>(null);
  const[imageBase64,setImageBase64]=useState<string|null>(null);
  const[imageMime,setImageMime]=useState<string>('image/jpeg');
  const[isGenerating,setIsGenerating]=useState(false);
  const[imageUrl,setImageUrl]=useState<string|null>(null);
  const[error,setError]=useState<string|null>(null);
  const[toast,setToast]=useState<{title:string;message:string;type:'success'|'error'|'warning'}|null>(null);
  const[buyPack,setBuyPack]=useState<string|null>(null);
  const[isDragging,setIsDragging]=useState(false);
  const[loadingStage,setLoadingStage]=useState<0|1|2|3>(0);
  const[loadingProgress,setLoadingProgress]=useState(0);
  const[elapsedSeconds,setElapsedSeconds]=useState(0);
  const progressIntervalRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const elapsedIntervalRef=useRef<ReturnType<typeof setInterval>|null>(null);

  const refreshWithRetry=useCallback(async()=>{
    await refreshProfile();
    setTimeout(async()=>{await refreshProfile();},2000);
    setTimeout(async()=>{await refreshProfile();},5000);
  },[refreshProfile]);

  useEffect(()=>{
    if(!searchParams)return;
    const success=searchParams.get('success');
    const buy=searchParams.get('buy');
    if(success==='true'){refreshWithRetry();window.history.replaceState({},'','/');}
    if(buy){
      const v=['Starter','Basic','Popular','Pro','Ultimate'];
      if(v.includes(buy)){setBuyPack(buy);window.history.replaceState({},'','/');}
    }
  },[searchParams,refreshWithRetry]);

  const processFile=(file:File)=>{
    if(!file.type.startsWith('image/')){
      setToast({title:'Invalid File',message:'Please upload a JPG, PNG, or WEBP image.',type:'error'});return;
    }
    if(file.size>10*1024*1024){
      setToast({title:'File Too Large',message:'Image must be under 10MB.',type:'error'});return;
    }
    setImageMime('image/jpeg');
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext('2d')!.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(',')[1]);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleFileChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(file)processFile(file);
  };
  const handleDrop=(e:React.DragEvent)=>{
    e.preventDefault();setIsDragging(false);
    const file=e.dataTransfer.files?.[0];if(file)processFile(file);
  };

  const handleGenerate=async()=>{
    if(!imageBase64){setToast({title:'No Photo',message:'Please upload a photo first.',type:'warning'});return;}

    const clearIntervals=()=>{
      if(progressIntervalRef.current){clearInterval(progressIntervalRef.current);progressIntervalRef.current=null;}
      if(elapsedIntervalRef.current){clearInterval(elapsedIntervalRef.current);elapsedIntervalRef.current=null;}
    };

    setIsGenerating(true);setError(null);setToast(null);setImageUrl(null);
    setLoadingStage(1);setLoadingProgress(0);setElapsedSeconds(0);
    elapsedIntervalRef.current=setInterval(()=>setElapsedSeconds(s=>s+1),1000);

    try{
      // Stage 1: Preparing image (0 → 10%)
      setLoadingProgress(5);
      const{data:{session:s}}=await supabase.auth.getSession();
      if(!s?.access_token){clearIntervals();setError('Please sign in.');setIsGenerating(false);setLoadingStage(0);setLoadingProgress(0);return;}
      setLoadingProgress(10);

      // Stage 2: AI generating avatar (10 → 85%, asymptotic drift)
      setLoadingStage(2);
      progressIntervalRef.current=setInterval(()=>{
        setLoadingProgress(prev=>{const gap=85-prev;return gap<0.05?prev:prev+gap*0.003;});
      },100);

      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),90000);
      let res:Response;
      try{
        res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+s.access_token},body:JSON.stringify({imageBase64,mimeType:imageMime,style:selectedStyle,prompt:userPrompt}),signal:controller.signal});
      }catch(fetchErr:any){
        clearTimeout(timeout);clearIntervals();
        if(fetchErr.name==='AbortError'){setToast({title:'Request Timed Out',message:'The generation took too long. Please try again. No credits were deducted.',type:'warning'});}
        else{setToast({title:'Network Error',message:'Could not connect to the server. Please check your connection.',type:'error'});}
        return;
      }
      clearTimeout(timeout);
      if(progressIntervalRef.current){clearInterval(progressIntervalRef.current);progressIntervalRef.current=null;}

      if(!res.ok){
        clearIntervals();
        const data=await res.json().catch(()=>({}));
        switch(res.status){
          case 401:setToast({title:'Session Expired',message:'Please refresh and sign in again.',type:'error'});break;
          case 402:setToast({title:'Insufficient Credits',message:"You don't have enough credits. Purchase more to continue.",type:'warning'});setBuyPack('Starter');break;
          case 429:setToast({title:'Too Many Requests',message:'Please wait a moment before trying again.',type:'warning'});break;
          default:setToast({title:'Generation Failed',message:(data.error||'An unexpected error occurred')+'. No credits were deducted.',type:'error'});break;
        }
        return;
      }

      // Stage 3: Finalizing (85 → 100%)
      setLoadingStage(3);setLoadingProgress(85);
      await new Promise<void>(resolve=>{
        let p=85;
        const finalize=setInterval(()=>{p+=3;setLoadingProgress(Math.min(p,100));if(p>=100){clearInterval(finalize);resolve();}},40);
      });

      const data=await res.json();
      setImageUrl(data.imageUrl);
      await refreshProfile();
      if(window.parent!==window){window.parent.postMessage({type:'deepvortex-credits-updated'},'https://deepvortexai.com');}
    }catch(err:unknown){
      setToast({title:'Generation Failed',message:(err instanceof Error?err.message:'An unexpected error occurred')+'. No credits were deducted.',type:'error'});
    }finally{clearIntervals();setIsGenerating(false);setLoadingStage(0);setLoadingProgress(0);}
  };

  const uploadZoneBorder=isDragging?'#FFD700':imagePreview?'rgba(212,175,55,0.6)':'rgba(212,175,55,0.3)';

  return(
    <div className="min-h-screen bg-black text-white font-sans pb-10">
      <Header buyPack={buyPack} onBuyPackHandled={()=>setBuyPack(null)}/>
      <div className="particles">
        {[10,20,30,40,50,60,70,80,90].map((left,i)=>(
          <div key={i} className="particle" style={{left:`${left}%`,animationDelay:`${i*0.5}s`}}/>
        ))}
      </div>
      <main className="max-w-[1200px] mx-auto px-3 sm:px-5 flex flex-col gap-6 sm:gap-10">
        <div className="flex flex-col gap-4 w-full max-w-[720px] mx-auto mt-4 sm:mt-6">

          {/* Upload Zone */}
          <div
            onDragOver={(e)=>{e.preventDefault();setIsDragging(true);}}
            onDragLeave={()=>setIsDragging(false)}
            onDrop={handleDrop}
            onClick={()=>fileInputRef.current?.click()}
            style={{
              border:`2px dashed ${uploadZoneBorder}`,
              borderRadius:'16px',
              padding:imagePreview?'0':'2.5rem 1rem',
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              cursor:'pointer',
              background:isDragging?'rgba(212,175,55,0.05)':'rgba(26,26,26,0.6)',
              transition:'all 0.2s ease',
              minHeight:imagePreview?'auto':'180px',
              overflow:'hidden',position:'relative',
            }}
          >
            {imagePreview?(
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Uploaded photo" style={{width:'100%',maxHeight:'320px',objectFit:'cover',borderRadius:'14px',display:'block'}}/>
                <div style={{position:'absolute',bottom:'10px',right:'10px',background:'rgba(0,0,0,0.7)',border:'1px solid rgba(212,175,55,0.5)',borderRadius:'8px',padding:'4px 10px',color:'#D4AF37',fontSize:'0.75rem',fontWeight:600}}>
                  📷 Change photo
                </div>
              </>
            ):(
              <>
                <div style={{fontSize:'2.5rem',marginBottom:'0.75rem'}}>📸</div>
                <p style={{color:'#D4AF37',fontWeight:700,fontSize:'1rem',margin:0}}>Upload your photo</p>
                <p style={{color:'rgba(255,255,255,0.5)',fontSize:'0.8rem',marginTop:'0.3rem'}}>JPG, PNG, WEBP · max 10MB · drag &amp; drop or click</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{display:'none'}}/>
          </div>

          {/* Style Selector */}
          <div>
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'0.85rem',fontWeight:600,marginBottom:'0.6rem',letterSpacing:'0.5px'}}>Choose a style</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
              {STYLES.map((s)=>(
                <button key={s.value} onClick={()=>setSelectedStyle(s.value)} style={{
                  padding:'0.6rem 0.5rem',borderRadius:'10px',
                  border:`2px solid ${selectedStyle===s.value?'#FFD700':'rgba(212,175,55,0.2)'}`,
                  background:selectedStyle===s.value?'rgba(212,175,55,0.12)':'rgba(26,26,26,0.6)',
                  color:selectedStyle===s.value?'#FFD700':'rgba(255,255,255,0.7)',
                  fontWeight:700,fontSize:'0.8rem',cursor:'pointer',transition:'all 0.2s ease',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',fontFamily:'inherit',
                }}>
                  <span style={{fontSize:'1.4rem'}}>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Prompt */}
          <div>
            <label style={{color:'rgba(255,255,255,0.7)',fontSize:'0.85rem',fontWeight:600,letterSpacing:'0.5px',display:'block',marginBottom:'0.5rem'}}>
              Extra details <span style={{color:'rgba(255,255,255,0.35)',fontWeight:400}}>(optional)</span>
            </label>
            <textarea value={userPrompt} onChange={(e)=>setUserPrompt(e.target.value)}
              placeholder="e.g. glowing eyes, dramatic lighting, golden armor..."
              maxLength={300} rows={2}
              style={{width:'100%',padding:'0.75rem 1rem',background:'rgba(26,26,26,0.8)',border:'1px solid rgba(212,175,55,0.25)',borderRadius:'10px',color:'#fff',fontSize:'0.9rem',fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box'}}
            />
          </div>

          {/* Generate Button */}
          <button onClick={handleGenerate} disabled={isGenerating||!imageBase64} style={{
            width:'100%',padding:'1rem',borderRadius:'12px',border:'none',
            background:isGenerating||!imageBase64?'rgba(212,175,55,0.2)':'linear-gradient(135deg,#E8C87C 0%,#D4AF37 50%,#B8960C 100%)',
            color:isGenerating||!imageBase64?'rgba(255,255,255,0.4)':'#0a0a0a',
            fontWeight:800,fontSize:'1rem',fontFamily:"'Orbitron',sans-serif",letterSpacing:'1px',
            cursor:isGenerating||!imageBase64?'not-allowed':'pointer',transition:'all 0.2s ease',
            boxShadow:isGenerating||!imageBase64?'none':'0 4px 20px rgba(212,175,55,0.4)',
          }}>
            {isGenerating?'⚡ Generating Avatar...':'✨ Generate Avatar'}
          </button>
        </div>

        {isGenerating&&(
          <div style={{marginTop:'1.5rem',padding:'1.25rem',background:'rgba(26,26,26,0.8)',borderRadius:'14px',border:'1px solid rgba(212,175,55,0.2)'}}>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1rem'}}>
              {([{stage:1,label:'Preparing image...'},{stage:2,label:'AI is generating your avatar...'},{stage:3,label:'Finalizing...'}] as const).map(({stage,label})=>(
                <div key={stage} style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>
                  <div style={{width:'10px',height:'10px',borderRadius:'50%',flexShrink:0,background:loadingStage>stage?'#D4AF37':loadingStage===stage?'#FFD700':'rgba(255,255,255,0.15)',boxShadow:loadingStage===stage?'0 0 8px rgba(255,215,0,0.8)':'none',transition:'all 0.3s ease'}}/>
                  <span style={{fontSize:'0.85rem',color:loadingStage>stage?'#D4AF37':loadingStage===stage?'#fff':'rgba(255,255,255,0.3)',fontWeight:loadingStage===stage?600:400,transition:'all 0.3s ease'}}>{label}</span>
                </div>
              ))}
            </div>
            <div style={{position:'relative',height:'6px',background:'rgba(255,255,255,0.08)',borderRadius:'3px',marginBottom:'0.6rem',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'3px',background:'linear-gradient(90deg,#B8960C,#D4AF37,#E8C87C)',width:`${loadingProgress}%`,transition:'width 0.2s ease',boxShadow:'0 0 8px rgba(212,175,55,0.5)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{color:'#D4AF37',fontSize:'0.85rem',fontWeight:700}}>{Math.round(loadingProgress)}%</span>
              <span style={{color:'rgba(255,255,255,0.35)',fontSize:'0.8rem'}}>{elapsedSeconds}s...</span>
            </div>
          </div>
        )}

        <ImageDisplay imageUrl={imageUrl} isLoading={isGenerating} error={error} prompt={selectedStyle+' avatar'} onRegenerate={handleGenerate}/>
        <EcosystemCards/>
      </main>

      <footer className="text-center py-14 mt-8 border-t border-[rgba(212,175,55,0.2)]">
        <a href="https://deepvortexai.com" className="block text-gray-400 hover:text-[#D4AF37] no-underline text-lg mb-6 transition-colors">Deep Vortex AI - Building the complete AI creative ecosystem</a>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <a href="https://www.tiktok.com/@deepvortexai" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#D4AF37] no-underline text-base hover:opacity-75 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/></svg>
            TikTok
          </a>
          <a href="https://x.com/deepvortexart" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#D4AF37] no-underline text-base hover:opacity-75 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            X
          </a>
          <a href="mailto:admin@deepvortexai.xyz" className="inline-block px-6 py-2.5 border border-[rgba(212,175,55,0.6)] rounded-lg bg-transparent text-[#D4AF37] no-underline text-base hover:bg-[rgba(212,175,55,0.1)] hover:border-[#D4AF37] transition-all">Contact Us</a>
        </div>
      </footer>
      <Notification show={!!toast} onClose={()=>setToast(null)} title={toast?.title} message={toast?.message} type={toast?.type}/>
      <a href="https://deepvortexai.com/game" target="_blank" rel="noopener noreferrer" className="play-earn-fab">⚡ Play &amp; Earn</a>
    </div>
  );
}

export default function Home(){
  return(
    <Suspense fallback={<div className="min-h-screen bg-black"/>}>
      <HomeContent/>
    </Suspense>
  );
}
