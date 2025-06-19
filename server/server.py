from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

OPENWEATHERMAP_API_KEY = os.environ.get('OPENWEATHERMAP_API_KEY', 'your_real_api_key_here')

@app.route('/api/weather')
def weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    if not lat or not lon:
        return jsonify({'error': 'Missing lat or lon'}), 400

    url = f'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHERMAP_API_KEY}&units=metric'
    try:
        resp = requests.get(url)
        return jsonify(resp.json())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 