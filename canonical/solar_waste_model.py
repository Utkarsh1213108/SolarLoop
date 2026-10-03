import math, json
hist = {2010:0.1,2011:0.4,2012:0.7,2013:1.0,2014:0.65,2015:0.92,2016:3.02,2017:5.53,2018:9.36,2019:6.53,
        2020:6.45,2021:5.47,2022:13.89,2023:12.79,2024:15.03,2025:23.84,2026:44.61}
def paths(name):
    add=dict(hist)
    for y in range(2027,2056):
        if name=="Base": add[y]=50 if y<=2030 else 60
        elif name=="Conservative": add[y]=30
        elif name=="High": add[y]=60 if y<=2030 else 80
    return add
def wcdf(t,a,b): return 1-math.exp(-(t/b)**a) if t>0 else 0.0
def waste(add,a=5.3759,b=30,infant=0.023,tpm=65,tpm_new=58,dcac=1.0,end=2050):
    years=list(range(2010,end+1))
    early={y:0.0 for y in years}; eol={y:0.0 for y in years}
    for y0,g in add.items():
        if y0>end: continue
        mass=g*1000*dcac*(tpm if y0<=2022 else tpm_new)
        early[y0]+=mass*infant
        rem=mass*(1-infant)
        for y in years:
            if y<=y0: continue
            age=y-y0
            eol[y]+=rem*(wcdf(age,a,b)-wcdf(age-1,a,b))
    return early,eol
def tot(early,eol): return {y:(early[y]+eol[y])/1000 for y in early}   # kt
def cumv(ann,upto): return sum(v for y,v in ann.items() if y<=upto)
SC={"Conservative·Regular":("Conservative",5.3759),"Conservative·Early":("Conservative",2.4928),
    "Base·Regular":("Base",5.3759),"Base·Early":("Base",2.4928)}
def run():
    R={}
    for k,(cap,a) in SC.items():
        e,l=waste(paths(cap),a=a)
        R[k]={"early":{y:e[y]/1000 for y in e},"eol":{y:l[y]/1000 for y in l},"ann":tot(e,l)}
    return R
if __name__=="__main__":
    R=run()
    for k,v in R.items():
        print(k,[round(v["ann"][y]) for y in (2026,2030,2035,2040,2045,2050)],
              "cum2030",round(cumv(v["ann"],2030)),"cum2040",round(cumv(v["ann"],2040)),"cum2050",round(cumv(v["ann"],2050)))
        # early share
        for y in (2026,2030,2035,2040,2045,2050):
            print("   ",y,"early share %.0f%%"%(100*v["early"][y]/v["ann"][y]))
    # crossover year where eol > early
    for k in ("Base·Regular","Base·Early"):
        v=R[k]
        cx=[y for y in range(2026,2051) if v["eol"][y]>v["early"][y]]
        print(k,"EoL overtakes early-loss in",cx[0] if cx else None)
    # tornado: Base·Regular cumulative 2040
    base=cumv(tot(*waste(paths("Base"))),2040); print("base cum2040",round(base))
    def c40(**kw):
        cap=kw.pop("cap","Base"); return cumv(tot(*waste(paths(cap),**kw)),2040)
    T={"Loss curve (Regular → Early)":(base,c40(a=2.4928)),
       "Capacity path (Conservative ↔ High)":(c40(cap="Conservative"),c40(cap="High")),
       "AC→DC basis (DC/AC 1.0 → 1.25)":(base,c40(dcac=1.25)),
       "Early/handling loss (1.0% ↔ 4.0%)":(c40(infant=0.01),c40(infant=0.04)),
       "Mass per MW, post-2022 (50 ↔ 65 t/MW)":(c40(tpm_new=50),c40(tpm_new=65)),
       "Weibull scale β (27 ↔ 33 yr)":(c40(b=33),c40(b=27))}
    for k,(lo,hi) in T.items(): print(k,round(lo),round(hi),"range",round(hi-lo))
    json.dump({"T":{k:[lo,hi] for k,(lo,hi) in T.items()},"base40":base},open("tornado.json","w"))
    # Al flow
    for k in ("Base·Regular","Base·Early","Conservative·Regular"):
        v=R[k]["ann"]
        print(k,"Al kt (10.3%*99%): 2030 %.1f 2035 %.1f 2040 %.1f"%tuple(v[y]*0.103*0.99 for y in (2030,2035,2040)))
