#!/usr/bin/env python
"""Build the Green Ergonomic Lab publication data.

Sources, in order: OpenAlex, Semantic Scholar and Crossref (abstract gaps),
then the YZU faculty page (to catch missing papers).
Run: python build_publications.py
Outputs: data/publications.json, data/abstracts.txt, data/categories.json
"""
import html
import json
import re
import sys
import time
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import requests

ROOT = Path(__file__).parent
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)

import os
UA = "GreenErgonomicLabSite/1.0 (academic publication list builder; Yuan Ze University)"
API_KEY = os.environ.get("OPENALEX_API_KEY", "")  # optional free key
HEADERS = {"User-Agent": UA}
DELAY = 0.4
FACULTY_URL = "https://www.iem.yzu.edu.tw/english/faculty_info.aspx?id=yogi"
AUTHOR_NAME = "Yogi Tri Prasetyo"

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def get(url, params=None, retries=3):
    for i in range(retries):
        try:
            r = requests.get(url, params=params, headers=HEADERS, timeout=40)
            if r.status_code == 429:
                time.sleep(3 * (i + 1))
                continue
            time.sleep(DELAY)
            return r
        except requests.RequestException:
            time.sleep(2)
    return None


def norm_title(t):
    t = unicodedata.normalize("NFKD", t or "").lower()
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"[^a-z0-9 ]+", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def norm_doi(d):
    if not d:
        return ""
    return re.sub(r"^https?://(dx\.)?doi\.org/", "", d.strip().lower())


def rebuild_abstract(inv):
    if not inv:
        return ""
    pos = {}
    for word, idxs in inv.items():
        for i in idxs:
            pos[i] = word
    return " ".join(pos[i] for i in sorted(pos))


def clean_text(t):
    t = re.sub(r"<[^>]+>", " ", t or "")
    t = html.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------- OpenAlex
def find_author_ids():
    r = get("https://api.openalex.org/authors",
            {"search": AUTHOR_NAME, "per-page": 25, **({"api_key": API_KEY} if API_KEY else {})})
    ids = []
    if r is None or r.status_code != 200:
        return ids
    for a in r.json().get("results", []):
        name = a.get("display_name", "").lower()
        insts = [i.get("display_name", "") for i in (a.get("last_known_institutions") or [])]
        if "yuan ze" in " ".join(insts).lower() and "prasetyo" in name and "yogi" in name \
                or (a.get("display_name") == "Y. T. Prasetyo" and any("Yuan Ze" in i for i in insts)):
            ids.append(a["id"].rsplit("/", 1)[-1])
    return ids


def fetch_openalex(author_ids):
    works, page = [], 1
    filt = "author.id:" + "|".join(author_ids)
    while True:
        params = {"filter": filt, "per-page": 100, "page": page}
        if API_KEY:
            params["api_key"] = API_KEY
        r = get("https://api.openalex.org/works", params)
        if r is None or r.status_code != 200:
            sys.exit(f"OpenAlex request failed ({getattr(r, 'status_code', None)}). "
                     "Stop instead of writing partial data. Retry later or set OPENALEX_API_KEY.")
        j = r.json()
        works += j["results"]
        if len(works) >= j["meta"]["count"] or not j["results"]:
            break
        page += 1
    return works


def from_openalex(w):
    loc = w.get("primary_location") or {}
    src = loc.get("source") or {}
    doi = norm_doi(w.get("doi"))
    authors = [a["author"]["display_name"] for a in w.get("authorships", [])]
    kws = [k.get("display_name") for k in (w.get("keywords") or [])][:8]
    return {
        "id": w["id"].rsplit("/", 1)[-1],
        "title": clean_text(w.get("title") or w.get("display_name")),
        "authors": authors,
        "year": w.get("publication_year"),
        "venue": src.get("display_name") or "",
        "doi": doi,
        "url": ("https://doi.org/" + doi) if doi else (loc.get("landing_page_url") or ""),
        "abstract": rebuild_abstract(w.get("abstract_inverted_index")),
        "keywords": kws,
        "type": w.get("type"),
        "source": "openalex",
    }


# -------------------------------------------------- abstract gap filling
def fill_semantic_scholar(pubs):
    todo = [p for p in pubs if not p["abstract"] and p["doi"]]
    for i in range(0, len(todo), 100):
        chunk = todo[i:i + 100]
        r = None
        for attempt in range(4):
            try:
                r = requests.post(
                    "https://api.semanticscholar.org/graph/v1/paper/batch",
                    params={"fields": "abstract"},
                    json={"ids": ["DOI:" + p["doi"] for p in chunk]},
                    headers=HEADERS, timeout=40)
            except requests.RequestException:
                r = None
                break
            if r.status_code != 429:
                break
            time.sleep(10 * (attempt + 1))
        if r is None:
            continue
        time.sleep(1.5)
        if r.status_code != 200:
            print("Semantic Scholar batch status", r.status_code)
            continue
        for p, res in zip(chunk, r.json()):
            if res and res.get("abstract"):
                p["abstract"] = clean_text(res["abstract"])
                p["abstract_source"] = "semanticscholar"


def s2_get(url, params):
    for attempt in range(4):
        r = get(url, params)
        if r is None:
            return None
        if r.status_code == 429:
            time.sleep(8 * (attempt + 1))
            continue
        return r
    return None


def fill_semantic_scholar_single(pubs):
    """Slower per-paper fallback: by DOI, then by exact normalized title."""
    for p in pubs:
        if p["abstract"]:
            continue
        r = None
        if p["doi"]:
            r = s2_get("https://api.semanticscholar.org/graph/v1/paper/DOI:" + p["doi"],
                       {"fields": "abstract"})
        if r is not None and r.status_code == 200 and r.json().get("abstract"):
            p["abstract"] = clean_text(r.json()["abstract"])
            p["abstract_source"] = "semanticscholar"
            continue
        r = s2_get("https://api.semanticscholar.org/graph/v1/paper/search",
                   {"query": p["title"][:200], "fields": "title,abstract", "limit": 3})
        if r is not None and r.status_code == 200:
            for c in r.json().get("data", []):
                if norm_title(c.get("title")) == norm_title(p["title"]) and c.get("abstract"):
                    p["abstract"] = clean_text(c["abstract"])
                    p["abstract_source"] = "semanticscholar-title"
                    break
        time.sleep(1)


def fill_crossref(pubs):
    for p in pubs:
        if p["abstract"] or not p["doi"]:
            continue
        r = get(f"https://api.crossref.org/works/{p['doi']}", None)
        if r is not None and r.status_code == 200:
            ab = r.json().get("message", {}).get("abstract")
            if ab:
                p["abstract"] = clean_text(ab)
                p["abstract_source"] = "crossref"


# --------------------------------------------------- faculty page list
def faculty_entries():
    """Return {'journal': [...], 'conference': [...]} of raw citation strings."""
    r = get(FACULTY_URL)
    out = {"journal": [], "conference": []}
    if r is None or r.status_code != 200:
        print("Faculty page not reachable")
        return out
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", r.text, flags=re.S)
    t = re.sub(r"<(br|/p|/li|/div|/tr)[^>]*>", "\n", t)
    t = html.unescape(re.sub(r"<[^>]+>", "", t)).replace("\xa0", " ")
    section = None
    for l in (x.strip() for x in t.splitlines()):
        if l.startswith("Journal Papers"):
            section, l = "journal", l[len("Journal Papers"):].strip()
        elif l.startswith("Conference Papers"):
            section, l = "conference", l[len("Conference Papers"):].strip()
        elif l.startswith("Rewards") or l.startswith("Awards"):
            section = None
        if section:
            m = re.match(r"^\d+\.\s*(.+)$", l)
            if m and len(m.group(1)) > 30:
                out[section].append(m.group(1).strip())
    return out


def parse_faculty_entry(e):
    """Best-effort (title, authors, year, venue) from a faculty-page citation."""
    year = None
    ys = re.findall(r"(?<!\d)(20[0-2]\d|19\d\d)(?!\d)", e)
    if ys:
        year = int(ys[-1])
    m = re.search(r"[“\"](.+?)[,.]?[”\"]", e)
    if m:
        title = m.group(1).strip(" ,.")
        authors = [a.strip(" *") for a in re.split(r",\s*(?:and\s+)?|\s+and\s+", e[:m.start()]) if a.strip(" *")]
        venue = e[m.end():].lstrip(", ").split(", vol")[0].split(", pp")[0].strip(" ,.")
    else:
        parts = e.split(";")
        last = parts[-1]
        bits = last.split(", ")
        authors = [x.strip() for x in parts[:-1]] + [bits[0].strip()]
        title = bits[1].strip() if len(bits) > 1 else last
        venue = bits[2].strip() if len(bits) > 2 else ""
    return title, authors, year, venue


def match_faculty(entries, pubs):
    """Return (unmatched entries, set of pub indexes confirmed on the faculty page)."""
    keys = [norm_title(p["title"]) for p in pubs]
    unmatched, confirmed = [], set()
    for e in entries:
        ne = norm_title(e)
        hit = [i for i, k in enumerate(keys) if k and k in ne]
        if hit:
            confirmed.update(hit)
        else:
            unmatched.append(e)
    return unmatched, confirmed


# ------------------------------------------------ cleaning and merging
INDO_WORDS = {"dan", "yang", "untuk", "terhadap", "pada", "dengan", "analisis", "perencanaan", "kajian",
              "sistem", "berbasis", "kontribusi", "pemberdayaan", "metode", "gerakan", "desa", "dalam",
              "kecepatan", "ketepatan", "otot", "kekuatan", "jaringan", "layanan", "studi", "kasus"}
OFFTOPIC_TERMS = ["law", "legal", "islamic", "judge", "lawsuit", "tort", "wedding", "customary", "jurisprudence",
                  "supremacy", "vision transformers", "physical education", "olahraga", "seismic performance", "concrete structures",
                  "community service", "pengabdian", "pemberdayaan", "hip joint", "finite element"]


def is_indonesian_title(title):
    words = set(norm_title(title).split())
    return len(words & INDO_WORDS) >= 2


def exclusion_reason(p, core_coauthors, on_faculty):
    if p["title"].strip().lower().startswith("retracted"):
        return "retracted paper"
    if on_faculty:
        return None
    text = norm_title(p["title"] + " " + p["venue"])
    if (p["year"] or 9999) < 2013:
        return "published before 2013 (before Dr. Yogi's B.Eng. completion), likely a different author"
    if is_indonesian_title(p["title"]):
        return "Indonesian-language title with no link to the lab's topics, likely a different author with a similar name"
    for term in OFFTOPIC_TERMS:
        if re.search(r"\b" + re.escape(term) + r"\b", text):
            return f"off-topic for the lab (matched '{term}'), likely a different author with a similar name"
    if p["type"] == "dataset" or "figshare" in p["venue"].lower() or "zenodo" in p["venue"].lower():
        return "dataset record, not a paper"
    others = [a for a in p["authors"] if "prasetyo" not in a.lower()]
    yogi_first = bool(p["authors"]) and "prasetyo" in p["authors"][0].lower()
    if not yogi_first and not (core_coauthors & set(p["authors"])) and len(others) >= 2:
        return "no co-author overlap with the lab network and not on the faculty page"
    return None


def title_ratio(a, b):
    import difflib
    return difflib.SequenceMatcher(None, a, b).ratio()


def is_preprint(p):
    v = (p["venue"] or "").lower()
    return any(x in v for x in ("ssrn", "arxiv", "research square", "preprint", "figshare", "zenodo"))


def merge_duplicates(pubs):
    """Merge versions of the same paper by DOI, normalized title, or near-identical title (+-1 year)."""
    merged = []
    by_doi, by_title = {}, {}
    n_merged = 0
    for p in pubs:
        nt = norm_title(p["title"])
        target = by_doi.get(p["doi"]) if p["doi"] else None
        target = target or by_title.get(nt)
        if target is None:
            for q in merged:
                if abs((q["year"] or 0) - (p["year"] or 0)) <= 1 and \
                        title_ratio(norm_title(q["title"]), nt) >= 0.93:
                    target = q
                    break
        if target is None:
            merged.append(p)
            if p["doi"]:
                by_doi[p["doi"]] = p
            by_title[nt] = p
            continue
        n_merged += 1
        keep, drop = (p, target) if (is_preprint(target) and not is_preprint(p)) else (target, p)
        if keep is p:
            merged[merged.index(target)] = p
        if not keep["abstract"] and drop["abstract"]:
            keep["abstract"] = drop["abstract"]
        if not keep["doi"] and drop["doi"]:
            keep["doi"], keep["url"] = drop["doi"], drop["url"]
        keep.setdefault("merged_from", []).append(drop["id"])
        if keep["doi"]:
            by_doi[keep["doi"]] = keep
        by_title[nt] = keep
        by_title[norm_title(drop["title"])] = keep
    return merged, n_merged


# ------------------------------------------------------------ taxonomy
TAXONOMY = {
    "Eye tracking and cognition": ["eye tracking", "eye-tracking", "eye movement", "fixation", "gaze",
        "cognitive load", "mental workload", "eeg", "electroencephalograph", "pupil", "attention", "neuro"],
    "Driving and transport safety": ["driving", "driver", "traffic", "pedestrian", "road", "vehicle",
        "transport", "motorcycle", "autonomous vehicle", "crash", "helmet", "airline", "aviation", "railway"],
    "Disaster risk and preparedness": ["disaster", "typhoon", "earthquake", "tsunami", "flood", "volcano",
        "evacuation", "preparedness", "hazard", "resilience", "covid", "pandemic", "vaccin", "mask"],
    "Consumer behavior and technology adoption": ["consumer", "purchase intention", "technology acceptance",
        "tam", "utaut", "theory of planned behavior", "structural equation", "adoption", "intention to use",
        "customer", "satisfaction", "loyalty", "revisit", "willingness", "e-commerce", "mobile app",
        "behavioral intention", "behavioural intention", "pls-sem", "online shopping", "food delivery"],
    "Kansei and product design": ["kansei", "product design", "conjoint", "preference analysis", "user experience",
        "aesthetic", "emotional design", "affective", "camouflage", "color similarity", "color design", "colour"],
    "Macroergonomics and job design": ["macroergonomic", "job design", "workplace", "work system", "employee",
        "organizational", "organisational", "job satisfaction", "work engagement", "burnout", "telework"],
    "Sustainability and green ergonomics": ["sustainab", "green", "circular economy", "carbon", "renewable",
        "environmental", "eco-friendly", "recycl", "pro-environmental", "electric vehicle", "energy"],
    "Applied machine learning and deep learning": ["machine learning", "deep learning", "neural network",
        "convolutional", "random forest", "xgboost", "classification", "prediction model", "k-means",
        "clustering", "artificial intelligence", "yolo", "lstm", "transformer"],
    "MCDM and decision analysis": ["dematel", "analytic network", "anp", "vikor", "ahp", "topsis",
        "multi-criteria", "multicriteria", "mcdm", "decision-making", "fuzzy"],
    "Virtual and augmented reality": ["virtual reality", "augmented reality", "metaverse", "head-mounted",
        "mixed reality", " vr ", " ar "],
    "Quality and operations management": ["alarm prioritization", "quality assessment", "six sigma", "dmaic", "fmea", "failure mode", "reliability",
        "scheduling", "inventory", "material requirements", "oee", "equipment effectiveness", "lean",
        "procurement", "supply chain", "logistics", "quality improvement", "maintenance", "non-conformance"],
    "Portfolio and financial analytics": ["portfolio", "mean-variance", "safety-first", "stock", "etf",
        "cryptocurrency", "nft", "return and volatility"],
    "Occupational safety and ergonomics": ["occupational", "musculoskeletal", "ergonomic", "posture", "rula",
        "reba", "exoskeleton", "manual material handling", "injury", "accident", "safety behavior",
        "safety behaviour", "wearable", "fatigue", "lifting", "grip strength", "dexterity", "anthropometr",
        "safety symbol", "aim lab", "shooting accuracy"],
    "Innovation, business and education technology": ["innovation", "entrepreneurship", "business model",
        "m-business", "marketing", "internet of things", "iot", "teaching tool", "learning experience", "startup"],
}
# priority order breaks ties
ORDER = list(TAXONOMY)

SUBTAXONOMY = {
    "Eye tracking and cognition": {"Eye tracking": ["eye track", "eye-track", "gaze", "fixation", "pupil"],
                                    "EEG and neuroscience": ["eeg", "electroencephal", "neuro", "brain"],
                                    "Cognitive workload": ["cognitive", "workload", "attention"]},
    "Driving and transport safety": {"Driver behavior": ["driver", "driving"],
                                      "Pedestrians and roads": ["pedestrian", "road", "traffic", "crash"],
                                      "Public transport and aviation": ["transport", "airline", "aviation", "railway", "bus"]},
    "Disaster risk and preparedness": {"Natural hazards": ["typhoon", "earthquake", "tsunami", "flood", "volcano", "hazard"],
                                        "Preparedness and evacuation": ["preparedness", "evacuation", "resilience"],
                                        "Pandemic response": ["covid", "pandemic", "vaccin", "mask"]},
    "Consumer behavior and technology adoption": {"Technology acceptance (TAM, UTAUT)": ["technology acceptance", "tam", "utaut", "adoption", "intention to use"],
                                                   "Planned behavior and intention": ["planned behavior", "planned behaviour", "intention", "willingness"],
                                                   "Customer experience and loyalty": ["customer", "satisfaction", "loyalty", "revisit", "purchase"]},
    "Kansei and product design": {"Color and camouflage design": ["camouflage", "color", "colour"], "Kansei engineering": ["kansei"], "Conjoint and preference": ["conjoint", "preference"]},
    "Macroergonomics and job design": {"Job design and work systems": ["job", "work system", "workplace"],
                                        "Employee well-being": ["employee", "burnout", "engagement", "satisfaction"]},
    "Sustainability and green ergonomics": {"Green and circular practices": ["green", "circular", "recycl", "eco"],
                                             "Energy and environment": ["energy", "carbon", "renewable", "environmental"]},
    "Applied machine learning and deep learning": {"Deep learning": ["deep learning", "neural", "convolutional", "lstm", "yolo"],
                                                    "Classical ML and clustering": ["random forest", "xgboost", "k-means", "clustering", "classification"]},
    "MCDM and decision analysis": {"DEMATEL, ANP and VIKOR": ["dematel", "anp", "analytic network", "vikor"],
                                    "Other decision methods": ["ahp", "topsis", "fuzzy", "multi-criteria", "decision"]},
    "Innovation, business and education technology": {"Innovation and business models": ["innovation", "entrepreneurship", "business model", "m-business", "startup"],
                                                       "IoT, marketing and learning": ["internet of things", "iot", "marketing", "teaching tool", "learning"]},
    "Quality and operations management": {"Six Sigma and FMEA": ["six sigma", "dmaic", "fmea", "failure mode", "quality"],
                                           "Scheduling and inventory": ["scheduling", "inventory", "material", "procurement", "logistics", "supply chain"],
                                           "Reliability and maintenance": ["reliability", "maintenance", "oee", "equipment"]},
    "Portfolio and financial analytics": {"Portfolio selection": ["portfolio", "mean-variance", "safety-first"],
                                           "Markets and assets": ["stock", "etf", "cryptocurrency", "nft"]},
    "Virtual and augmented reality": {"Virtual reality": ["virtual reality", " vr "], "Augmented and mixed reality": ["augmented", "mixed reality", " ar "]},
    "Occupational safety and ergonomics": {"Musculoskeletal and posture": ["musculoskeletal", "posture", "rula", "reba", "lifting"],
                                            "Exoskeletons and wearables": ["exoskeleton", "wearable"],
                                            "Accident analysis": ["accident", "injury", "safety"]},
}


def text_of(p):
    return " " + norm_title(p["title"] + " " + p["abstract"] + " " + " ".join(p["keywords"])) + " "


def score(text, kws):
    s = 0
    for k in kws:
        k2 = norm_title(k)
        if not k2:
            continue
        if (" " + k2 + " ") in text if len(k2) <= 3 else (k2 in text):
            s += 1
    return s


def categorize(pubs):
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import KMeans

    leftovers = []
    for p in pubs:
        t = text_of(p)
        # title hits weigh double
        tt = " " + norm_title(p["title"]) + " "
        scores = {c: score(t, kw) + score(tt, kw) for c, kw in TAXONOMY.items()}
        best = max(ORDER, key=lambda c: (scores[c], -ORDER.index(c)))
        if scores[best] == 0:
            leftovers.append(p)
            p["category"] = None
        else:
            p["category"] = best
            p["category_method"] = "keywords"

    # TF-IDF for leftovers: assign to nearest category centroid built from keyword-assigned papers
    labelled = [p for p in pubs if p["category"]]
    if leftovers and len(labelled) >= 5:
        docs = [p["title"] + " " + p["abstract"] for p in labelled + leftovers]
        vec = TfidfVectorizer(stop_words="english", max_features=4000, ngram_range=(1, 2), min_df=1)
        X = vec.fit_transform(docs)
        import numpy as np
        Xl, Xo = X[:len(labelled)], X[len(labelled):]
        cats = sorted({p["category"] for p in labelled})
        cents = []
        for c in cats:
            idx = [i for i, p in enumerate(labelled) if p["category"] == c]
            cents.append(np.asarray(Xl[idx].mean(axis=0)).ravel())
        cents = np.vstack(cents)
        sims = Xo @ cents.T
        sims = np.asarray(sims)
        for p, row in zip(leftovers, sims):
            if row.max() > 0:
                p["category"] = cats[int(row.argmax())]
                p["category_method"] = "tfidf"
    for p in pubs:
        if not p["category"]:
            p["category"] = "Other topics"
            p["category_method"] = "unassigned"

    # subcategories
    for p in pubs:
        t = text_of(p)
        subs = SUBTAXONOMY.get(p["category"], {})
        best, bs = None, 0
        for name, kw in subs.items():
            s = score(t, kw)
            if s > bs:
                best, bs = name, s
        p["subcategory"] = best or "General"


def main():
    print("1. OpenAlex")
    ids = find_author_ids()
    print("   author ids:", ids)
    if not ids:
        sys.exit("No OpenAlex author matched with Yuan Ze University affiliation. Stop.")
    raw = fetch_openalex(ids)
    print("   works fetched:", len(raw))

    pubs = []
    for w in raw:
        p = from_openalex(w)
        if p["title"] and p["type"] not in ("paratext", "erratum", "retraction"):
            pubs.append(p)
    pubs, n_merged = merge_duplicates(pubs)
    print(f"   after merging duplicate versions: {len(pubs)} ({n_merged} merged)")

    print("2. Abstract gaps (Semantic Scholar, Crossref)")
    cache_file = DATA / "abstract_cache.json"
    cache = json.loads(cache_file.read_text(encoding="utf-8")) if cache_file.exists() else {}
    for p in pubs:
        c = cache.get(norm_title(p["title"]))
        if not p["abstract"] and c:
            p["abstract"], p["abstract_source"] = c["abstract"], c["source"]
    fill_semantic_scholar(pubs)
    fill_semantic_scholar_single(pubs)
    fill_crossref(pubs)
    for p in pubs:
        p["abstract_source"] = p.get("abstract_source") or ("openalex" if p["abstract"] else "none")
        if p["abstract"]:
            cache[norm_title(p["title"])] = {"abstract": p["abstract"], "source": p["abstract_source"]}
    cache_file.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")

    print("3. Faculty page cross-check and cleaning")
    fac = faculty_entries()
    all_entries = fac["journal"] + fac["conference"]
    unmatched, confirmed = match_faculty(all_entries, pubs)

    counts = Counter(a for p in pubs for a in set(p["authors"]) if "prasetyo" not in a.lower())
    core = {a for a, n in counts.items() if n >= 4}
    kept, excluded = [], []
    for i, p in enumerate(pubs):
        reason = exclusion_reason(p, core, i in confirmed)
        if reason:
            excluded.append({"id": p["id"], "title": p["title"], "year": p["year"], "venue": p["venue"],
                             "doi": p["doi"], "authors": p["authors"], "reason": reason})
        else:
            kept.append(p)
            p["on_faculty_page"] = i in confirmed
    pubs = kept
    (DATA / "excluded.json").write_text(json.dumps(excluded, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"   excluded {len(excluded)} papers (see data/excluded.json)")

    added = []
    for n, e in enumerate(unmatched, 1):
        title, authors, year, venue = parse_faculty_entry(e)
        nt = norm_title(title)
        if len(nt) < 15 or any(title_ratio(nt, norm_title(p["title"])) >= 0.9 for p in pubs):
            continue
        if any(title_ratio(nt, norm_title(x["title"])) >= 0.9 for x in excluded):
            continue
        if any(title_ratio(nt, norm_title(x["title"])) >= 0.9 for x in added):
            continue
        added.append({"id": f"F{n:03d}", "title": title, "authors": authors, "year": year, "venue": venue,
                      "doi": "", "url": "", "abstract": "", "keywords": [], "type": "faculty",
                      "source": "faculty page", "abstract_source": "none"})
    pubs += added
    print(f"   faculty-page items added as title-only entries: {len(added)}")
    for a_ in added:
        print("     +", a_["year"], a_["title"][:100])
    nj, nc = len(fac["journal"]), len(fac["conference"])
    print(f"   faculty page lists {nj} journal + {nc} conference = {nj + nc} papers")
    n_on = sum(1 for p in pubs if p.get("on_faculty_page"))
    recent = sum(1 for p in pubs if not p.get("on_faculty_page") and p["source"] == "openalex" and (p["year"] or 0) >= 2024)
    print(f"   of the final list, {n_on} are confirmed on the faculty page; "
          f"{len(pubs) - n_on - len(added)} OpenAlex papers are not on it ({recent} of them from 2024 or later)")
    print(f"   final list: {len(pubs)} papers; difference vs faculty page: {len(pubs) - (nj + nc):+d}")

    print("4. Categorizing")
    categorize(pubs)

    pubs.sort(key=lambda p: (-(p["year"] or 0), p["title"]))
    for i, p in enumerate(pubs, 1):
        p["pid"] = f"P{i:03d}"

    public = [{k: p[k] for k in ("pid", "title", "authors", "year", "venue", "doi", "url",
                                  "category", "subcategory", "keywords", "source", "abstract_source")} for p in pubs]
    for pub in public:
        pub["id"] = pub.pop("pid")
    (DATA / "publications.json").write_text(json.dumps(public, ensure_ascii=False, indent=1), encoding="utf-8")

    blocks = []
    for p in pubs:
        blocks.append(f"ID: {p['pid']}\nTitle: {p['title']}\nYear: {p['year']}\n"
                      f"Abstract: {p['abstract'] or '(no abstract found)'}\n")
    (DATA / "abstracts.txt").write_text("\n---\n\n".join(blocks), encoding="utf-8")

    tree = defaultdict(lambda: defaultdict(list))
    for p in pubs:
        tree[p["category"]][p["subcategory"]].append(p["pid"])
    branches = []
    for c in sorted(tree, key=lambda c: -sum(len(v) for v in tree[c].values())):
        subs = [{"name": s, "count": len(ids_), "papers": ids_}
                for s, ids_ in sorted(tree[c].items(), key=lambda kv: -len(kv[1]))]
        branches.append({"name": c, "count": sum(s["count"] for s in subs), "children": subs})
    cats = {"root": "Green Ergonomic Lab", "total": len(pubs), "branches": branches}
    (DATA / "categories.json").write_text(json.dumps(cats, ensure_ascii=False, indent=1), encoding="utf-8")

    print("\nSummary: papers per category")
    for b in branches:
        print(f"  {b['count']:4d}  {b['name']}")
    m = Counter(p["category_method"] for p in pubs)
    print("  assignment methods:", dict(m))
    yrs = [p["year"] for p in pubs if p["year"]]
    if yrs:
        print(f"  years: {min(yrs)} to {max(yrs)}")

    noabs = [p for p in pubs if not p["abstract"]]
    print(f"\nPapers without abstract ({len(noabs)}):")
    for p in noabs:
        print(f"  {p['pid']} ({p['year']}) {p['title'][:100]}")


if __name__ == "__main__":
    main()
