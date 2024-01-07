import csv
import sqlite3
import math

def connect():
    return_connection = sqlite3.connect("entities.db")
    return_connection.create_function('sqrt', 1, math.sqrt)
    return_connection.create_function('pow', 2, math.pow)
    return_connection.create_function('cos', 1, math.cos)
    return return_connection


connection = connect()

with open('schema.sql') as f:
    connection.executescript(f.read())

current = connection.cursor()

with open('ourairports/airports.csv', "r", encoding="utf8") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',', )
    line_count = 0
    rows = []
    for row in csv_reader:
        rows.append(row)

    indices = rows[0]
    ref = {}
    for index, item in enumerate(indices):
        ref[item] = index

    print(*indices)
    for row in rows[1:]:
        if line_count % 1000 == 0:
            print(line_count)

        line_count += 1
        # print(*[row[ref["id"]], row[ref["name"]], row[ref["latitude_deg"]], row[ref["longitude_deg"]], row[ref["type"]]])
        current.execute(""
                        "INSERT INTO entities (id,name,latitude,longitude,type,code,info) VALUES (?,?,?,?,?,?,?)"
                        "", (
                            row[ref["id"]], row[ref["name"]], row[ref["latitude_deg"]], row[ref["longitude_deg"]],
                            row[ref["type"]], row[ref["gps_code"]], row[ref["wikipedia_link"]]
                        ))

    print(f'Processed {line_count} lines.')

connection.commit()
connection.close()
