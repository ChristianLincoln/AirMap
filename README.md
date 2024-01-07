This project works as a website for the client with a map interacting with a database as the server.

This project relies on:
- SQLite and Flask for Python, it also relies on Leaflet for JavaScript.
- Street Maps, Open Street Maps and Open Weather Maps tiles for map rendering.
- ourairports.com as a reference and to it's airports.csv files to initialise the database.

Run using python flask in this directory with: flask --app server.py run --debug

Connecting to the server like so: https://127.0.0.1:5000/ will index the only page on the site and render the map.

If I had more time to work on this, I would love to improve how the UI scales, organise my project and programs a lot more, polish code, improve validation and security and enable greater control over entities' properties with a live connection to the database and custom fields in records.
I would also potentially add a chat system.
