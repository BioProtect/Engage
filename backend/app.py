from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
import psycopg2
import psycopg2.extras
from psycopg2.errors import UniqueViolation
from psycopg2 import sql
import random
import json
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


CORS(app)

bcrypt = Bcrypt(app)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

DB_CONFIG = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "options": os.getenv("DB_OPTIONS", "")
}

try:
    conn = psycopg2.connect(**DB_CONFIG)
    print("Connected to the PostgreSQL server successfully!")
except Exception as e:
    print(f"Error connecting to DB: {e}")

@app.route('/')
def home():
    return "Hello, Flask!"

# -------------------- Login/Signup --------------------

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO users (username, password) VALUES (%s, %s)",
                (username, hashed_pw)
            )
            conn.commit()
        return jsonify({"msg": "Signup successful"}), 201
    except UniqueViolation:
        conn.rollback()
        return jsonify({"msg": "Username already exists"}), 409
    except Exception as e:
        conn.rollback()
        print(f"Signup error: {e}")
        return jsonify({"msg": "Sign up failed", "error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
    except Exception as e:
        return jsonify({"msg": "Database error", "error": str(e)}), 500

    if not user:
        return jsonify({"msg": "Username or password incorrect"}), 401

    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({"msg": "Username or password incorrect"}), 401

    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token), 200

# -------------------- Get/Create/Delete Items --------------------

@app.route('/get_drawing_items', methods=['GET'])
def get_drawing_items():
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            cur.execute("SELECT id, name, description, color, type FROM drawingitems;")
            rows = cur.fetchall()
            features = [dict(row) for row in rows if row['type'] == 'Features']
            activities = [dict(row) for row in rows if row['type'] == 'Activities']
            return jsonify({
                "Features": features,
                "Activities": activities
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_unique_color(cur):
    for _ in range(10):
        color = "#{:06x}".format(random.randint(0, 0xFFFFFF))
        cur.execute("SELECT 1 FROM drawingitems WHERE color = %s", (color,))
        if cur.fetchone() is None:
            return color
    raise Exception("Could not generate unique color")

@app.route('/save_drawing_item', methods=['POST'])
def save_drawing_item():
    data = request.json
    name = data.get('name')
    description = data.get('description', '')
    type_ = data.get('type')

    if not name or not type_:
        return jsonify({"error": "Missing required fields 'name' or 'type'"}), 400

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT 1 FROM drawingitems WHERE name = %s", (name,))
            if cur.fetchone() is not None:
                return jsonify({"error": "Name already exists"}), 409

            color = generate_unique_color(cur)

            cur.execute("""
                INSERT INTO drawingitems (name, description, color, type)
                VALUES (%s, %s, %s, %s)
                RETURNING id, name, description, color, type
            """, (name, description, color, type_))

            inserted = cur.fetchone()
            conn.commit()

        return jsonify({
            "message": "Feature saved successfully",
            "feature": {
                "id": inserted[0],
                "name": inserted[1],
                "description": inserted[2],
                "color": inserted[3],
                "type": inserted[4],
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/delete_drawing_item/<int:item_id>', methods=['DELETE'])
def delete_drawing_item(item_id):
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM drawingitems WHERE id = %s RETURNING id;", (item_id,))
            deleted = cur.fetchone()
            if deleted is None:
                return jsonify({"error": "Item not found"}), 404

            conn.commit()
        return jsonify({"message": f"Item with id {deleted[0]} deleted successfully"}), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500

# -------------------- Save Polygon --------------------

@app.route('/save_polygon', methods=['POST'])
def save_polygon():

    data = request.json

    user = data.get('user')
    usergroup = data.get('userGroup')
    name = data.get('name')
    description = data.get('description', '')
    density = data.get('density', 1)
    geometry = data.get('geometry')
    euniscombd = None
    msfd_bbht = None
    unique_eun = None

    if not all([name, geometry]):
        return jsonify({"error": "Missing required fields"}), 400

    geometry_json = json.dumps(geometry)

    feature_class_name = "f_" + uuid.uuid4().hex[:30]
    tileset_id = f"bioprotect.{feature_class_name}"

    try:
        with conn:
            with conn.cursor() as cur:
                # Create the table with the polygon - this is the feature table f_randomstring
                create_sql = sql.SQL("""
                    CREATE TABLE bioprotect.{table} AS
                    SELECT
                        %s::text AS euniscombd,
                        %s::text AS msfd_bbht,
                        %s::text AS unique_eun,
                        %s::decimal AS density,
                        ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326) AS geometry
                """).format(table=sql.Identifier(feature_class_name))

                cur.execute(create_sql, (
                    euniscombd,
                    msfd_bbht,
                    unique_eun,
                    density,
                    geometry_json
                ))

                # Add spatial index and primary key - legacy issue with previous database
                index_name = f"idx_{uuid.uuid4().hex}"
                cur.execute(
                    sql.SQL(
                        "CREATE INDEX {} ON bioprotect.{} USING GIST (geometry);")
                    .format(sql.Identifier(index_name), sql.Identifier(feature_class_name))
                )

                cur.execute(
                    sql.SQL(
                        "ALTER TABLE bioprotect.{} DROP COLUMN IF EXISTS id, DROP COLUMN IF EXISTS ogc_fid;")
                    .format(sql.Identifier(feature_class_name))
                )

                cur.execute(
                    sql.SQL(
                        "ALTER TABLE bioprotect.{} ADD COLUMN id SERIAL PRIMARY KEY;")
                    .format(sql.Identifier(feature_class_name))
                )

                # Calculate area and extent directly from GeoJSON
                cur.execute("""
                    SELECT 
                        ST_Area(ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326), 3410)) AS _area,
                        box2d(ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326)) AS extent
                """, (geometry_json, geometry_json))
                area, extent = cur.fetchone()

                # Insert into metadata table. This table tracks all the features in the database.
                cur.execute("""
                    INSERT INTO bioprotect.metadata_interest_features (
                        feature_class_name, name, description, creation_date, _area, tilesetid, extent, source, created_by
                    )
                    VALUES (%s, %s, %s, now(), %s, %s, %s, %s, %s)
                    RETURNING unique_id;
                """, (feature_class_name, name, description, area, tileset_id, extent, usergroup, user))

        return jsonify({"message": "Feature saved successfully"}), 200

    except Exception as e:
        print(f"Error saving polygon: {e}")
        conn.rollback()
        return jsonify({"error": str(e)}), 500



# -------------------- MAIN --------------------

if __name__ == '__main__':
    app.run(debug=True, port=5001)
