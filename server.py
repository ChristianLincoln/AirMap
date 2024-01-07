import database
import json
from flask import Flask, render_template, request
from logging import FileHandler, WARNING

app = Flask(__name__,
            static_url_path='',
            static_folder='',
            template_folder='')


@app.route('/')
def hello(name=None):
    return render_template("index.html", name=name)


@app.route('/find/<string:lat>,<string:lon>,<string:rad>')
def find(lat=51.488, lon=-0.154, rad=25, name=None):
    latitude = float(lat)  # Note: SQL Injection protected by cast
    longitude = float(lon)
    distance = float(rad) / 1.5
    connection = database.connect()
    result = connection.execute('''
SELECT id, name, latitude, longitude, type, code, info, SQRT(
POW(69.1 * (latitude - ?), 2) +
POW(69.1 * (? - longitude) * COS(latitude / 57.3), 2)) AS distance
FROM entities WHERE distance < ? OR type = 'danger' ORDER BY distance
''',(latitude, longitude, distance)).fetchall()
    final_result = []
    for entity in result:
        final_result.append({
            'id': entity[0],
            'name': entity[1],
            'lat': entity[2],
            'lng': entity[3],
            'type': entity[4],
            'code': entity[5],
            'info': entity[6],
            'distance': entity[7]
        })
    result = json.dumps(final_result)
    print(result)
    connection.close()
    return result

@app.route('/submit',methods=['PUT'])
def submit():
    if request.method == 'PUT':
        print("PUT received!")
        result = request.get_json()
        print(result)
        connection = database.connect()
        current = connection.cursor()
        current.execute(""
                        "REPLACE INTO entities (id,name,latitude,longitude,type,info,code) VALUES (?,?,?,?,?,?,?)"
                        "", (
                            int(result["id"]), result["name"], float(result["lat"]), float(result["lng"]),
                            result["type"], result["info"], result["code"]
                        ))
        connection.commit()
        connection.close()
        return "SUCCESS"
    else:
        return "REQUEST METHOD NOT POST",404


file_handler = FileHandler('text.txt')
file_handler.setLevel(WARNING)
