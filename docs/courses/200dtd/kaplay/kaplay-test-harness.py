# Kaplay course test harness. Needs: pip install playwright; playwright install chromium
# Layout: KT_ROOT (default: this folder) must contain a clone of waimea-dt/kaplay-starter in ./starter
# Usage:  python t.py game path/to/_assets/game.js        (copy as main.js into starter, playthrough steps are in the script you adapt)
#         python t.py lessons "path/to/week5-lesson[1-4].md"   (runs every web-playground JS block, reports page errors)
import re,sys,asyncio,glob,os,shutil,http.server,threading,socketserver
from playwright.async_api import async_playwright
ROOT=os.environ.get("KT_ROOT", os.path.dirname(os.path.abspath(__file__)))
def serve(port):
    import functools
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    socketserver.TCPServer.allow_reuse_address=True
    srv=socketserver.TCPServer(("",port),functools.partial(Q,directory=f"{ROOT}/site")); threading.Thread(target=srv.serve_forever,daemon=True).start(); return srv
def site(js):
    if os.path.exists(f"{ROOT}/site"): shutil.rmtree(f"{ROOT}/site")
    shutil.copytree(f"{ROOT}/starter",f"{ROOT}/site")
    open(f"{ROOT}/site/main.js","w").write(js)
async def wg(page,s):
    t0=await page.evaluate("time()"); await page.wait_for_function(f"time() >= {t0+s}",timeout=30000,polling=50)
async def run(p,js,steps=None):
    site(js)
    b=await p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    page=await b.new_page(viewport={"width":900,"height":700}); errs=[]
    page.on("pageerror",lambda e:errs.append(str(e)[:150]))
    page.on("console",lambda m:errs.append(m.text[:150]) if m.type=="error" else None)
    await page.goto("http://localhost:8793/index.html")
    try: await wg(page,0.5)
    except Exception as e: errs.append("no-kaplay-clock")
    r=None
    if steps and not errs: r=await steps(page)
    await b.close(); return errs,r
async def clickobj(page,sel,idx=0):
    xy=await page.evaluate(f"""(()=>{{const o=get('{sel}',{{recursive:true}})[{idx}];const c=document.querySelector('canvas').getBoundingClientRect();const p=toScreen? toScreen(o.pos):o.pos;return [c.left+o.pos.x*c.width/width(),c.top+o.pos.y*c.height/height()]}})()""")
    await page.mouse.click(*xy); await wg(page,0.35)
async def door(page,dest):
    i=await page.evaluate(f"get('door',{{recursive:true}}).findIndex(d=>d.destination==='{dest}')")
    assert i>=0,("no door",dest); await clickobj(page,"door",i)
async def txt(page): return await page.evaluate("get('text',{recursive:true}).map(t=>t.text).join('|')")
async def game(page):
    out=[]
    def ok(c,m): out.append(("PASS" if c else "FAIL")+" "+m)
    await door(page,"kitchen"); t=await txt(page); ok("The Kitchen" in t and "HP: 3" in t,"kitchen HUD HP 3")
    await clickobj(page,"heart"); hp=await page.evaluate("hp"); t=await txt(page)
    ok(hp==4 and "HP: 4" in t,f"heart: HUD updates in-room without redraw ({hp})")
    await wg(page,2.7); ok("Yum" not in await txt(page),"message fades via lifespan")
    await door(page,"hall"); await door(page,"kitchen"); ok(await page.evaluate("get('heart',{recursive:true}).length")==0,"heart not back")
    await door(page,"hall")
    await door(page,"attic"); t=await txt(page); ok("locked" in t and "The Hall" in t,"locked door message, stay in hall")
    await door(page,"cellar"); t=await txt(page); ok("HP: 3" in t and "bites" in t,"cellar bite, HUD shows 3 straight away")
    await clickobj(page,"key"); t=await txt(page); ok("key" in t.split("Inventory:")[1] and "found a key" in t,"key in inventory HUD in-room")
    await door(page,"hall"); await door(page,"cellar"); ok(await page.evaluate("get('key',{recursive:true}).length")==0,"key not back")
    await door(page,"hall"); await door(page,"attic"); ok("win" in await txt(page),"attic wins with key")
    await page.keyboard.press("Space"); await wg(page,0.4); t=await txt(page); ok("The Hall" in t and "HP: 3" in t and not (await page.evaluate("inventory.length")),"reset after win")
    for i in range(3):
        await door(page,"cellar"); 
        if i<2: await door(page,"hall")
    ok("Game Over" in await txt(page),"game over at hp 0")
    await page.keyboard.press("Space"); await wg(page,0.4); ok("The Hall" in await txt(page),"restart after game over")
    return out
async def main():
    srv=None
    async with async_playwright() as p:
        mode=sys.argv[1]
        if mode=="game":
            site(open(sys.argv[2]).read()); srv=serve(8793)
            errs,r=await run(p,open(sys.argv[2]).read(),game); print("errors:",errs); print("\n".join(r or []))
        else:
            site(""); srv=serve(8793)
            for f in sorted(glob.glob(sys.argv[2])):
                md=open(f,newline="").read().replace("\r\n","\n")
                base=re.search(r"<web-playground hidden>.*?```js id=kaplay\n(.*?)```",md,re.S); base=base.group(1) if base else ""
                n=0;bad=0
                for m in re.finditer(r"<web-playground(?! hidden)[^>]*>(.*?)</web-playground>",md,re.S):
                    j=re.search(r"```js[^\n]*\n(.*?)```",m.group(1),re.S)
                    if not j: continue
                    n+=1; code=(base+"\n"+j.group(1)) if "kaplay({" not in j.group(1) or base else j.group(1)
                    errs,_=await run(p,code)
                    if errs: bad+=1; print(f"  {os.path.basename(f)} block {n}: {errs[:2]}")
                print(f"{os.path.basename(f)}: {n} blocks, {bad} with errors")
asyncio.run(main())
