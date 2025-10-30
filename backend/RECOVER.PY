import sqlite3, os

SRC = "sooqly.db"
DST = "sooqly_fixed.db"
DUMP = "dump.sql"

# 1) dump (read-only)
con = sqlite3.connect(f'file:{SRC}?mode=ro', uri=True)
with open(DUMP, "w", encoding="utf-8") as f:
    for line in con.iterdump():
        f.write(line + "\n")
con.close()

# 2) create new db from dump
if os.path.exists(DST):
    os.remove(DST)
con2 = sqlite3.connect(DST)
with open(DUMP, "r", encoding="utf-8") as f:
    con2.executescript(f.read())
con2.close()

print("Recovered to", DST)
