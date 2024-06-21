import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS
from prophet import Prophet

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Define the paths for the pickle files
pickle_predictions_path = os.path.join(os.path.dirname(__file__), 'models', 'predictions.pkl')
pickle_returns_risks_path = os.path.join(os.path.dirname(__file__), 'models', 'returns_risks.pkl')
pickle_knn_model_path = os.path.join(os.path.dirname(__file__), 'models', 'knn_model.pkl')

# Initialize dictionary for storing returns risks
returns_risks = {}
knn_model = None

# Load predictions
def load_predictions():
    global returns_risks, knn_model
    try:
        with open(pickle_returns_risks_path, 'rb') as f:
            returns_risks = pickle.load(f)
        
        with open(pickle_knn_model_path, 'rb') as f:
            knn_model = pickle.load(f)

        for stock, metrics in returns_risks.items():
            print(f"Stock: {stock}, Average Return: {metrics['average_return']}, Risk: {metrics['risk']}")
    except Exception as e:
        print(f"Error loading pickle file: {e}")

@app.route('/get_top_stocks', methods=['POST'])
def get_top_stocks():
    expected_return = float(request.json.get('expected_return'))
    expected_risk = float(request.json.get('expected_risk'))

    returns_risks_df = pd.DataFrame.from_dict(returns_risks, orient='index')
    y = returns_risks_df.index.values

    input_data = np.array([[expected_return, expected_risk]])
    distances, indices = knn_model.kneighbors(input_data)

    top_stocks = y[indices.flatten()]

    top_stocks_info = []
    for stock, distance in zip(top_stocks, distances.flatten()):
        file_name = stock.split('_')[1]
        metrics = returns_risks[stock]
        top_stocks_info.append({
            'stock': file_name,
            'average_return': metrics['average_return'],
            'risk': metrics['risk'],
            'distance': distance
        })

    return jsonify(top_stocks_info)

def process_file_for_predictions(file, end_year):
    folder_path = 'data100'
    try:
        file_path = os.path.join(folder_path, file)
        data = pd.read_csv(file_path)

        data['Date'] = pd.to_datetime(data['Date'], errors='coerce')
        data = data.dropna(subset=['Date'])

        if data.empty or not all(col in data.columns for col in ['Open', 'High', 'Low', 'Volume', 'Close']):
            print(f"Skipping file {file} due to insufficient data.")
            return None

        # Get the last available price
        last_price_date = data['Date'].max()
        last_price = data.loc[data['Date'] == last_price_date, 'Close'].values[0]

        # Extract historical data by year
        historical_data_by_year = data.groupby(data['Date'].dt.year)['Close'].last().to_dict()

        # Check if the end_year is greater than the last available year
        last_year = last_price_date.year
        if end_year <= last_year:
            combined_data = historical_data_by_year
        else:
            # Prophet
            prophet_df = pd.DataFrame({'ds': data['Date'], 'y': data['Close']})
            prophet = Prophet()
            prophet.fit(prophet_df)
            future = prophet.make_future_dataframe(periods=365 * (end_year - last_year))
            forecast = prophet.predict(future)
            prophet_pred = forecast[['ds', 'yhat']]

            predictions_by_year = {}
            for year in range(last_year + 1, end_year + 1):
                year_start = pd.Timestamp(f'{year}-01-01')
                year_end = pd.Timestamp(f'{year}-12-31')
                year_data = prophet_pred[(prophet_pred['ds'] >= year_start) & (prophet_pred['ds'] <= year_end)]
                year_pred = year_data['yhat'].values
                if len(year_pred) > 0:
                    predictions_by_year[year] = year_pred[-1]  # Use the last prediction for the year

            # Combine historical and future data
            combined_data = {**historical_data_by_year, **predictions_by_year}
        
        return {
            'company': file.split('.')[0],
            'predictions': combined_data
        }
    except Exception as e:
        print(f"Error occurred while processing file {file}: {e}")
        return None

@app.route('/get_prophet_predictions', methods=['POST'])
def get_prophet_predictions():
    company_names = request.json.get('company_names', [])
    end_year = int(request.json.get('year'))

    print(f"Received request for companies: {company_names} up to year: {end_year}")

    predictions = {}
    for company in company_names:
        file = f"{company}.csv"
        result = process_file_for_predictions(file, end_year)
        if result:
            predictions[result['company']] = result['predictions']

    return jsonify(predictions)

if __name__ == '__main__':
    load_predictions()
    print("Starting Flask server...")
    app.run(debug=True, port=3000)
