# -*- coding: utf-8 -*-
"""比对本地源码目录与 GitHub 生产分支的差异（只读，不提交）。

输出：_delta.json —— 新增 / 修改 / 删除 三份清单，供提交脚本使用。
"""
import os, json, hashlib, base64, subprocess, urllib.request, urllib.error, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = "1114794665-gif/-"
BRANCH = "deploy/cloudflare-free"

# 与 .gitignore 一致；另外备份目录、临时产物不进仓库
IGNORE_DIRS = {"node_modules", "cloudflare-dist", ".wrangler", ".secrets", ".git",
               "private-data", "_tmp", "__pycache__", "_shots"}
IGNORE_PREFIX = ("_backup-",)
IGNORE_FILE_SUFFIX = (".log", ".zip", ".tar.gz")
IGNORE_FILES = {".dev.vars"}


def ignored(rel):
    parts = rel.replace("\\", "/").split("/")
    for p in parts[:-1]:
        if p in IGNORE_DIRS or p.startswith(IGNORE_PREFIX):
            return True
    name = parts[-1]
    if name in IGNORE_FILES:
        return True
    if name.startswith("_backup-"):
        return True
    if any(name.endswith(s) for s in IGNORE_FILE_SUFFIX):
        return True
    if name.startswith(".env"):
        return True
    return False


def blob_sha(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()


out = subprocess.run(["git", "credential", "fill"], input="protocol=https\nhost=github.com\n\n",
                     capture_output=True, text=True).stdout
TOKEN = dict(l.split("=", 1) for l in out.strip().splitlines() if "=" in l)["password"]
OP = urllib.request.build_opener(urllib.request.ProxyHandler({}))
BASE = "https://api.github.com/repos/" + REPO


def api(p, method="GET", payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(BASE + p, data=data, method=method,
        headers={"Authorization": "Bearer " + TOKEN, "User-Agent": "boom-a6-delta",
                 "Accept": "application/vnd.github+json", "Content-Type": "application/json"})
    try:
        with OP.open(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError("HTTP %s %s %s -> %s" % (e.code, method, p, e.read().decode("utf-8", "replace")[:300])) from None


head = api("/git/ref/heads/" + urllib.parse.quote(BRANCH, safe=""))
head_sha = head["object"]["sha"]
tree_sha = api("/git/commits/" + head_sha)["tree"]["sha"]
tree = api("/git/trees/" + tree_sha + "?recursive=1")
remote = {n["path"]: n["sha"] for n in tree["tree"] if n["type"] == "blob"}
print("远端 HEAD %s，文件 %d 个" % (head_sha[:8], len(remote)))

added, modified, same = [], [], 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith("_backup-")]
    for fn in filenames:
        full = os.path.join(dirpath, fn)
        rel = os.path.relpath(full, ROOT).replace("\\", "/")
        if ignored(rel):
            continue
        raw = open(full, "rb").read()
        h = blob_sha(raw)
        if rel in remote:
            if remote[rel] == h:
                same += 1
            else:
                modified.append(rel)
        else:
            added.append(rel)

local_set = set(added) | set(modified) | set()
# 远端有、本地没有（含被忽略目录除外）→ 删除
local_all = set()
for dirpath, dirnames, filenames in os.walk(ROOT):
    dirnames[:] = [d for d in dirnames if d not in IGNORE_DIRS and not d.startswith("_backup-")]
    for fn in filenames:
        rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace("\\", "/")
        if not ignored(rel):
            local_all.add(rel)
deleted = sorted(p for p in remote if p not in local_all)

res = {"head": head_sha, "tree": tree_sha, "added": sorted(added),
       "modified": sorted(modified), "deleted": deleted, "same": same}
json.dump(res, open(os.path.join(ROOT, "_delta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("新增 %d / 修改 %d / 删除 %d / 一致 %d" % (len(added), len(modified), len(deleted), same))
print("清单已写入 _delta.json")
