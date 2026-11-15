
import argparse, json, joblib, numpy as np, pandas as pd
from train_unified_model import url_live_features, build_text_features, pad_dense

def predict_url(url,b):
    x=url_live_features(url,b["url_columns"])
    X=np.hstack([pad_dense(x,b["width"]),np.zeros((1,b["width"]*2)),[[1,0,0]]])
    return X

def predict_text(text,b):
    x,_=build_text_features([text],b["text_vectorizer"],fit=False)
    X=np.hstack([np.zeros((1,b["width"])),pad_dense(x.toarray(),b["width"]),np.zeros((1,b["width"])),[[0,1,0]]])
    return X

def predict_apk_features(csv_file,b):
    d=pd.read_csv(csv_file)
    x=d[b["apk_columns"]].apply(pd.to_numeric,errors="coerce").fillna(0).to_numpy()
    X=np.hstack([np.zeros((len(x),b["width"]*2)),pad_dense(x,b["width"]),np.tile([0,0,1],(len(x),1))])
    return X

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--model",default="unified_threat_model.joblib")
    ap.add_argument("--type",choices=["url","text","apk"],required=True)
    ap.add_argument("--input",required=True)
    args=ap.parse_args()
    b=joblib.load(args.model)
    if args.type=="url": X=predict_url(args.input,b)
    elif args.type=="text": X=predict_text(args.input,b)
    else: X=predict_apk_features(args.input,b)
    p=b["model"].predict_proba(X)[0,1]
    print(json.dumps({"prediction":"MALICIOUS" if p>=0.5 else "BENIGN","risk_score":round(float(p)*100,2)}))
